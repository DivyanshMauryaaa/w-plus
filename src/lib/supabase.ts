import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Chat {
    id: string
    user_id: string
    title: string
    created_at: string
    updated_at: string
}

export interface TodoItem {
    id: string
    text: string
    completed: boolean
}

export interface Message {
    id: string
    chat_id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
    metadata?: {
        todoList?: TodoItem[]
        workflow?: {
            nodes: any[]
            edges: any[]
        }
    }
}
