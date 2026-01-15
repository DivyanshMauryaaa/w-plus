import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Simple token estimator (roughly 4 characters per token)
function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
}

// Calculate total tokens from previous chats
function calculateTotalTokens(previousChats: Array<{ role: string; content: string }>): number {
    return previousChats.reduce((total, chat) => {
        return total + estimateTokens(chat.content)
    }, 0)
}

// Summarize conversation history
async function summarizeConversation(
    previousChats: Array<{ role: string; content: string }>,
    model: any
): Promise<string> {
    const conversationText = previousChats
        .map(chat => `${chat.role}: ${chat.content}`)
        .join('\n\n')

    const summaryPrompt = `Provide a concise summary of this conversation, capturing key points and context:\n\n${conversationText}`

    const result = await model.generateContent(summaryPrompt)
    const response = await result.response
    return response.text()
}

// Parse operation trigger from AI response
function parseOperationTrigger(text: string): { triggered: boolean; operationPrompt: string | null; messageBeforeTrigger: string } {
    console.log('🔍 Checking for operation trigger in response')

    // Match <doOperation prompt="..."> or <doOperation prompt='...'>
    const triggerRegex = /<doOperation\s+prompt=["']([^"']+)["']\s*>/i
    const match = text.match(triggerRegex)

    if (match) {
        const operationPrompt = match[1]
        const messageBeforeTrigger = text.substring(0, match.index).trim()

        console.log('✅ Operation trigger detected!')
        console.log('   Prompt:', operationPrompt)
        console.log('   Message before:', messageBeforeTrigger.substring(0, 100))

        return {
            triggered: true,
            operationPrompt,
            messageBeforeTrigger
        }
    }

    console.log('⚠️ No operation trigger found')
    return {
        triggered: false,
        operationPrompt: null,
        messageBeforeTrigger: text
    }
}

// Extract todo list from AI response if present
function extractTodoList(text: string): { todoList: any[] | null; cleanedText: string } {
    console.log('🔍 Extracting todo list from response:', text.substring(0, 300))

    // Try multiple patterns to find JSON todo list
    const patterns = [
        /```json\s*(\[\s*\{[\s\S]*?\}\s*\])\s*```/,  // Standard json code block
        /```\s*(\[\s*\{[\s\S]*?\}\s*\])\s*```/,       // Code block without json tag
        /(\[\s*\{\s*\"id\"\s*:[\s\S]*?\}\s*\])/,        // Raw JSON array
    ]

    for (const todoRegex of patterns) {
        const match = text.match(todoRegex)

        if (match) {
            try {
                const todoList = JSON.parse(match[1])
                console.log('✅ Successfully parsed todo list:', todoList)

                // Validate it's an array of todo items
                if (Array.isArray(todoList) && todoList.length > 0 && todoList[0].id && todoList[0].text) {
                    // Remove the JSON block from the text
                    const cleanedText = text.replace(match[0], '').trim()
                    return { todoList, cleanedText }
                }
            } catch (e) {
                console.error('❌ Failed to parse todo list JSON:', e)
            }
        }
    }

    console.log('⚠️ No todo list found in response')
    return { todoList: null, cleanedText: text }
}

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

const CONVERSATIONAL_PROMPT = `You are Carl, a friendly and helpful AI assistant.

Your role is to have natural, engaging conversations with users. You can:
- Answer questions and provide information
- Discuss topics in a conversational manner
- Be Professional & Polite but understanding too

Keep responses concise, friendly, and helpful.

IMPORTANT - OPERATION TRIGGERING:
When a user asks for help with a task that requires multiple steps or actionable items (e.g., "help me plan my day", "organize my project", "create a study schedule"), you can TRIGGER the operation mode by including this special tag in your response:

<doOperation prompt="detailed description of the task for todo list generation">

When you use this tag:
1. The prompt inside should be a clear, detailed description of what todo list to create
2. You can add a brief message before the tag explaining what you're doing
3. The operation system will take over and generate the todo list

Example response:
"I'll help you plan your day! Let me create a structured todo list for you.

<doOperation prompt="Create a daily schedule for a productive workday including morning routine, work tasks, breaks, and evening activities">"

Only use this tag when the user clearly needs an actionable plan or todo list. For simple questions or conversations, respond normally.`

const OPERATIONAL_PROMPT = `You are Carl, an AI task planner and executor.

Your role is to break down user requests into actionable todo lists. When a user describes a task or goal:

1. Analyze the request and identify all necessary steps
2. Create a comprehensive, ordered todo list
3. Present it in the required JSON format

REQUIRED JSON FORMAT (must be in a \`\`\`json code block):
\`\`\`json
[
  {"id": "1", "text": "Clear, actionable task description", "completed": false},
  {"id": "2", "text": "Next task description", "completed": false},
  {"id": "3", "text": "Final task description", "completed": false}
]
\`\`\`

After the JSON, add a brief message asking if the plan looks good.

Guidelines:
- Make tasks specific and actionable
- Order tasks logically (dependencies first)
- Keep each task focused on one action
- Use clear, concise language
- Include 3-10 tasks typically (adjust based on complexity)`

// ============================================================================
// CORE AI FUNCTIONS
// ============================================================================

/**
 * DoOperation - Handles operational mode where AI generates actionable todo lists
 * @param prompt - The user's task description
 * @param conversationContext - Previous conversation context (optional)
 * @param activeContext - Metadata context with todo lists and other data (optional, JSON string)
 * @param model - The AI model instance
 * @returns Object containing todo list and response message
 */
async function DoOperation(
    prompt: string,
    conversationContext: string = '',
    activeContext: string = '',
    model: any
): Promise<{ todoList: any[] | null; message: string; rawResponse: string }> {
    console.log('🔧 OPERATION MODE: Generating todo list for:', prompt.substring(0, 100))

    // Build the operational prompt
    let fullPrompt = OPERATIONAL_PROMPT + '\n\n'

    if (conversationContext) {
        fullPrompt += `[Context from previous conversation]:\n${conversationContext}\n\n`
    }

    // Parse and format metadata context if present
    if (activeContext) {
        try {
            const metadataContext = JSON.parse(activeContext)
            if (Array.isArray(metadataContext) && metadataContext.length > 0) {
                console.log('📋 Including metadata context:', metadataContext.length, 'items')
                fullPrompt += `[Previous metadata context - Todo lists and other data from earlier messages]:\n`

                metadataContext.forEach((item, index) => {
                    fullPrompt += `\nMessage ${index + 1} (${item.role}):\n`
                    fullPrompt += `Content: ${item.content}\n`
                    if (item.metadata?.todoList) {
                        fullPrompt += `Todo List:\n${JSON.stringify(item.metadata.todoList, null, 2)}\n`
                    }
                    if (item.metadata && Object.keys(item.metadata).length > 0) {
                        fullPrompt += `Other Metadata: ${JSON.stringify(item.metadata, null, 2)}\n`
                    }
                })
                fullPrompt += '\n'
            }
        } catch (e) {
            console.warn('⚠️ Failed to parse metadata context:', e)
        }
    }

    fullPrompt += `User's task: ${prompt}\n\nGenerate a comprehensive todo list for this task.`

    // Generate response
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    console.log('🤖 OPERATION RESPONSE:', text)

    // Extract todo list
    const { todoList, cleanedText } = extractTodoList(text)

    if (!todoList) {
        console.warn('⚠️ Operation mode failed to generate todo list')
    }

    return {
        todoList,
        message: cleanedText,
        rawResponse: text
    }
}

/**
 * HandleConversation - Handles conversational mode for general chat
 * @param prompt - The user's message
 * @param conversationContext - Previous conversation context
 * @param activeContext - Metadata context with todo lists and other data (JSON string)
 * @param model - The AI model instance
 * @returns The AI's conversational response
 */
async function HandleConversation(
    prompt: string,
    conversationContext: string = '',
    activeContext: string = '',
    model: any
): Promise<string> {
    console.log('💬 CONVERSATIONAL MODE: Responding to:', prompt.substring(0, 100))

    // Build the conversational prompt
    let fullPrompt = CONVERSATIONAL_PROMPT + '\n\n'

    if (conversationContext) {
        fullPrompt += `[Previous conversation]:\n${conversationContext}\n\n`
    }

    // Parse and format metadata context if present
    if (activeContext) {
        try {
            const metadataContext = JSON.parse(activeContext)
            if (Array.isArray(metadataContext) && metadataContext.length > 0) {
                console.log('📋 Including metadata context in conversation:', metadataContext.length, 'items')
                fullPrompt += `[Active context - Previous todo lists and metadata]:\n`

                metadataContext.forEach((item, index) => {
                    fullPrompt += `\n${index + 1}. ${item.role} message: "${item.content}..."\n`
                    if (item.metadata?.todoList) {
                        fullPrompt += `   Associated Todo List (${item.metadata.todoList.length} items):\n`
                        item.metadata.todoList.forEach((todo: any) => {
                            fullPrompt += `   - [${todo.completed ? 'x' : ' '}] ${todo.text}\n`
                        })
                    }
                })
                fullPrompt += '\nYou can reference these todo lists in your responses.\n\n'
            }
        } catch (e) {
            console.warn('⚠️ Failed to parse metadata context in conversation:', e)
        }
    }

    fullPrompt += `User: ${prompt}`

    // Generate response
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    console.log('🤖 CONVERSATIONAL RESPONSE:', text.substring(0, 200))

    return text
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
    try {
        const {
            messages,
            context = '',
            previous_chats = [],
            mode = 'auto' // 'auto', 'conversation', 'operation'
        } = await req.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            )
        }

        // Get the Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        // Calculate tokens from previous chats
        const totalTokens = calculateTotalTokens(previous_chats)
        const TOKEN_LIMIT = 8000

        let conversationContext = ''

        // If tokens exceed 8k, summarize the conversation
        if (totalTokens > TOKEN_LIMIT && previous_chats.length > 0) {
            console.log(`Token limit exceeded (${totalTokens} tokens). Summarizing conversation...`)
            conversationContext = await summarizeConversation(previous_chats, model)
        } else if (previous_chats.length > 0) {
            // Include full conversation history if under token limit
            conversationContext = previous_chats
                .map((chat: { role: string; content: string }) => `${chat.role}: ${chat.content}`)
                .join('\n\n')
        }

        // Get the current user message
        const lastMessage = messages[messages.length - 1]
        const userPrompt = lastMessage.content

        // Detect if user wants operational mode (auto-detect or explicit)
        const isOperationalRequest = mode === 'operation' ||
            (mode === 'auto' && /\b(help me|plan|organize|create|build|make|todo|task|step|guide)\b/i.test(userPrompt))

        let responseData: any = {
            tokens_used: totalTokens,
            was_summarized: totalTokens > TOKEN_LIMIT,
            mode_used: 'conversation', // Will be updated based on actual flow
            ai_triggered_operation: false
        }

        if (isOperationalRequest && mode === 'operation') {
            // EXPLICIT OPERATION MODE: Directly generate todo list
            console.log('🎯 Explicit operation mode requested')
            const { todoList, message } = await DoOperation(
                userPrompt,
                conversationContext,
                context,
                model
            )

            responseData.content = message
            responseData.todoList = todoList
            responseData.operation_triggered = true
            responseData.mode_used = 'operation'
        } else {
            // CONVERSATIONAL MODE: Let AI decide if it wants to trigger operation
            console.log('💬 Starting in conversational mode')
            const conversationalResponse = await HandleConversation(
                userPrompt,
                conversationContext,
                context,
                model
            )

            // Check if AI triggered operation mode
            const { triggered, operationPrompt, messageBeforeTrigger } = parseOperationTrigger(conversationalResponse)

            if (triggered && operationPrompt) {
                // AI TRIGGERED OPERATION: Run DoOperation with AI's prompt
                console.log('🤖 AI triggered operation mode!')
                console.log('   AI\'s operation prompt:', operationPrompt)

                const { todoList, message: operationMessage } = await DoOperation(
                    operationPrompt,
                    conversationContext,
                    context,
                    model
                )

                // Combine the conversational message with operation result
                responseData.content = messageBeforeTrigger
                responseData.todoList = todoList
                responseData.operation_triggered = true
                responseData.ai_triggered_operation = true
                responseData.mode_used = 'conversation->operation'
                responseData.operation_message = operationMessage // Additional context from operation
            } else {
                // PURE CONVERSATION: No operation triggered
                responseData.content = conversationalResponse
                responseData.todoList = null
                responseData.operation_triggered = false
                responseData.mode_used = 'conversation'
            }
        }

        console.log('📤 Sending response:', {
            mode: responseData.mode_used,
            hasTodoList: !!responseData.todoList,
            aiTriggered: responseData.ai_triggered_operation,
            contentPreview: responseData.content.substring(0, 100)
        })

        return NextResponse.json(responseData)
    } catch (error: any) {
        console.error('Error in chat API:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate response' },
            { status: 500 }
        )
    }
}
