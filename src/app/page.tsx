'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowUp, Plus, Loader2, Trash2 } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'
import { supabase, type Chat, type Message, type TodoItem } from '@/lib/supabase'
import { useUser } from '@clerk/nextjs'
import { Card } from '@/components/ui/card'
import { useSearchParams, useRouter } from 'next/navigation'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { TodoListCard } from '@/components/TodoListCard'
import { WorkflowBoard } from '@/components/workflow/WorkflowBoard'
import { ActiveStepCard } from '@/components/workflow/ActiveStepCard'
import { ConnectionsManager } from '@/components/workflow/ConnectionsManager'
import { ActionType } from '@/lib/integrations'

export default function ChatbotUI() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Integration State
  const [enabledActions, setEnabledActions] = useState<ActionType[]>([
    'calendar_create_event', 'calendar_get_events', 'gmail_send_email', 'gmail_search', 'slack_send_message' // Defaults
  ]);

  const toggleAction = (id: ActionType) => {
    setEnabledActions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Load chats on mount and check URL for chatId
  useEffect(() => {
    if (user) {
      loadChats()
      const chatIdFromUrl = searchParams.get('chatId')
      if (chatIdFromUrl) {
        setCurrentChatId(chatIdFromUrl)
      }
    }
  }, [user, searchParams])

  // Load messages when chat changes
  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId)
      // Update URL with current chat ID
      router.push(`/?chatId=${currentChatId}`, { scroll: false })
    }
  }, [currentChatId, router])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChats = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error loading chats:', error)
      return
    }

    setChats(data || [])
  }

  const loadMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
      return
    }

    setMessages(data || [])
  }

  const createNewChat = async () => {
    if (!user) return

    router.push('/', { scroll: false })
    setCurrentChatId("")
    setMessages([])
  }

  const sendMessage = async (overrideText?: string) => {
    const textToSend = typeof overrideText === 'string' ? overrideText : input
    if (!textToSend.trim() || !user) return

    // Create a new chat if none exists
    let chatId = currentChatId
    if (!chatId) {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          user_id: user.id,
          title: textToSend.slice(0, 50),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating chat:', error)
        return
      }

      chatId = data.id
      setCurrentChatId(chatId)
      setChats([data, ...chats])
    }

    const userMessage = textToSend
    if (!overrideText) {
      setInput('')
    }
    setIsLoading(true)

    // Save user message to database
    const { data: userMsgData, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        role: 'user',
        content: userMessage,
      })
      .select()
      .single()

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError)
      setIsLoading(false)
      return
    }

    // Update messages state
    setMessages((prev) => [...prev, userMsgData])

    try {
      // Prepare previous chats for context (exclude the current message)
      const previousChats = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Build context with metadata from messages
      const contextData = messages
        .filter(msg => msg.metadata && Object.keys(msg.metadata).length > 0)
        .map(msg => ({
          role: msg.role,
          content: msg.content.substring(0, 100), // Brief content preview
          metadata: msg.metadata
        }))

      // Convert context to JSON string for AI
      const contextString = contextData.length > 0
        ? JSON.stringify(contextData, null, 2)
        : ''

      console.log('📤 Sending context with metadata:', {
        metadataCount: contextData.length,
        contextPreview: contextString.substring(0, 200)
      })

      // Call AI API with conversation history
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          previous_chats: previousChats,
          context: contextString,
          connected_contexts: enabledActions // Send actions to AI
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      // Debug: Log todo list/workflow data
      console.log('📥 API Response received:', {
        hasTodoList: !!data.todoList,
        hasWorkflow: !!data.workflow,
        contentPreview: data.content?.substring(0, 100)
      })

      // Log token usage and summarization status
      if (data.tokens_used) {
        console.log(`Tokens used: ${data.tokens_used}`)
        if (data.was_summarized) {
          console.log('Conversation was summarized due to token limit')
        }
      }

      // Prepare metadata with todo list or workflow if present
      const metadata = data.todoList
        ? { todoList: data.todoList }
        : data.workflow
          ? { workflow: data.workflow }
          : undefined

      console.log('💾 Metadata to save:', metadata)

      // Save AI response to database
      const { data: aiMsgData, error: aiMsgError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          role: 'assistant',
          content: data.content,
          metadata: metadata,
        })
        .select()
        .single()

      if (aiMsgError) {
        console.error('Error saving AI message:', aiMsgError)
      } else {
        setMessages((prev) => [...prev, aiMsgData])
      }

      // Update chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId)

      // Reload chats to update order
      loadChats()
    } catch (error) {
      console.error('Error getting AI response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }


  if (!user) {
    return (
      <div className="flex w-full h-[89vh] items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground">
            Please sign in to use the chatbot
          </p>
        </Card>
      </div>
    )
  }

  const deleteChat = async (id: string) => {
    const { error: Delerror } = await supabase
      .from('chats')
      .delete()
      .eq('id', id)

    if (Delerror) {
      console.error('Error deleting chat:', Delerror)
      return
    }

    loadChats()
  }

  const handleTodoUpdate = async (messageId: string, updatedTodoList: TodoItem[]) => {
    // Update in database
    const { error } = await supabase
      .from('messages')
      .update({ metadata: { todoList: updatedTodoList } })
      .eq('id', messageId)

    if (error) {
      console.error('Error updating todo list:', error)
      return
    }

    // Update local state
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, metadata: { todoList: updatedTodoList } }
          : msg
      )
    )
  }

  const handleRunNode = async (nodeId: string, nodeLabel: string, nodeData?: any, context?: string) => {
    // Construct prompt for this step
    let stepPrompt = `Execute step: ${nodeLabel}.\n`;
    if (nodeData?.config) {
      stepPrompt += `Configuration:\n${JSON.stringify(nodeData.config, null, 2)}\n`;
    }

    const userMessage = `Running Step: ${nodeLabel}`;
    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, id: userMsgId, chat_id: currentChatId || '', created_at: new Date().toISOString() } as any,
      { role: 'assistant', content: 'Executing...', isLoading: true, id: assistantMsgId, chat_id: currentChatId || '', created_at: new Date().toISOString() } as any
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: stepPrompt }],
          previous_chats: [],
          context: context || '',
          mode: 'conversation',
          connected_contexts: enabledActions
        }),
      });

      const data = await response.json();

      // Update UI
      setMessages((prev) => {
        const newHistory = [...prev];
        const loadMsgIndex = newHistory.findIndex(m => m.id === assistantMsgId);
        if (loadMsgIndex !== -1) {
          newHistory[loadMsgIndex] = {
            ...newHistory[loadMsgIndex],
            content: data.error ? `Error: ${data.error}` : data.content,
            isLoading: false
          } as any;
        }
        return newHistory;
      });

      setIsLoading(false);
      return data.content || "Success";

    } catch (error) {
      console.error("Step execution failed", error);
      setMessages((prev) => {
        const newHistory = [...prev];
        const loadMsgIndex = newHistory.findIndex(m => m.id === assistantMsgId);
        if (loadMsgIndex !== -1) {
          newHistory[loadMsgIndex] = {
            ...newHistory[loadMsgIndex],
            content: "Failed to execute step.",
            isLoading: false
          } as any;
        }
        return newHistory;
      });
      setIsLoading(false);
      return null;
    }
  };

  return (
    <div className="flex w-full gap-2 h-[89vh]">
      {/* Sidebar */}
      <div className="w-[20%] p-3 border-r-2 border-t-2 rounded-tr-xl border-border flex flex-col gap-4">
        <Button
          onClick={createNewChat}
          className="w-full gap-2"
          variant="outline"
        >
          <Plus size={18} />
          New Chat
        </Button>

        {/* Connections Section */}
        <ConnectionsManager
          connectedIds={enabledActions}
          onToggle={toggleAction}
        />

        <div className="flex flex-col gap-2 overflow-y-auto flex-1 h-full">
          <h3 className="text-xs font-semibold text-muted-foreground px-2 mt-2">Previous Chats</h3>
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setCurrentChatId(chat.id)}
              className={`w-full flex justify-between border cursor-pointer hover:bg-accent rounded-xl p-3 transition-colors ${currentChatId === chat.id ? 'bg-accent' : 'border-border'
                }`}
            >
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium">{chat.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(chat.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center">
                <Trash2 size={14} className="cursor-pointer text-muted-foreground hover:text-red-500" onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col ">
        {messages.length === 0 && !currentChatId ? (
          // Empty state
          <div className="m-auto flex w-[60%] m-auto flex-col justify-center">
            <div className="mb-8">
              <p className="text-2xl font-bold text-center">
                AI knows your workspace to complete a task
              </p>
            </div>
            <div className="flex gap-3">
              <Input
                placeholder="Ask about your workspace to complete a task"
                className="p-5 py-7"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button
                className="py-7 px-5 cursor-pointer"
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <ArrowUp size={45} />
                )}
              </Button>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                use <kbd className="px-1 py-0.5 bg-muted rounded">@file</kbd> to
                mention a file or a directory.
              </p>
            </div>
          </div>
        ) : (
          // Messages view
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto w-[70%] m-auto p-6 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col gap-3 ${message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                >
                  {/* Display todo list card if present */}
                  {message.metadata?.todoList && message.metadata.todoList.length > 0 && (
                    <div className="max-w-[70%] w-full">
                      <TodoListCard
                        todoList={message.metadata.todoList}
                        onUpdate={(updatedList) => handleTodoUpdate(message.id, updatedList)}
                        messageId={message.id}
                      />
                    </div>
                  )}

                  {/* Display Workflow Board if present */}
                  {message.metadata?.workflow && (
                    <div className="flex flex-col gap-4 w-full">
                      <WorkflowBoard
                        initialData={message.metadata.workflow}
                        onRunNode={handleRunNode}
                      />
                    </div>
                  )}

                  {/* Display message content - Only if content exists */}
                  {message.content && message.content.trim().length > 0 && (
                    <Card
                      className={`max-w-[70%] p-4 ${message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                        }`}
                    >
                      {message.role === 'assistant' ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </Card>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="max-w-[70%] p-4 bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        Carl is thinking...
                      </p>
                    </div>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-border p-4">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <Input
                  placeholder="Type your message..."
                  className="p-5 py-7"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  className="py-7 px-5 cursor-pointer"
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <ArrowUp size={45} />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                use <kbd className="px-1 py-0.5 bg-muted rounded">@file</kbd> to
                mention a file or a directory.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}