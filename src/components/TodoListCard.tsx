'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, X, Edit2, Trash2, Plus } from 'lucide-react'
import { useState } from 'react'
import { TodoItem } from '@/lib/supabase'

interface TodoListCardProps {
    todoList: TodoItem[]
    onUpdate: (updatedList: TodoItem[]) => void
    messageId: string
}

export function TodoListCard({ todoList, onUpdate, messageId }: TodoListCardProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editText, setEditText] = useState('')
    const [newTaskText, setNewTaskText] = useState('')
    const [isAddingTask, setIsAddingTask] = useState(false)

    const handleToggle = (id: string) => {
        const updated = todoList.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        )
        onUpdate(updated)
    }

    const handleEdit = (id: string, text: string) => {
        setEditingId(id)
        setEditText(text)
    }

    const handleSaveEdit = (id: string) => {
        if (editText.trim()) {
            const updated = todoList.map(item =>
                item.id === id ? { ...item, text: editText.trim() } : item
            )
            onUpdate(updated)
        }
        setEditingId(null)
        setEditText('')
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditText('')
    }

    const handleDelete = (id: string) => {
        const updated = todoList.filter(item => item.id !== id)
        onUpdate(updated)
    }

    const handleAddTask = () => {
        if (newTaskText.trim()) {
            const newTask: TodoItem = {
                id: Date.now().toString(),
                text: newTaskText.trim(),
                completed: false
            }
            onUpdate([...todoList, newTask])
            setNewTaskText('')
            setIsAddingTask(false)
        }
    }

    return (
        <Card className="p-4 bg-muted/50 border-2 border-primary/20">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">📋 Action Plan</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingTask(!isAddingTask)}
                    className="h-8 px-2"
                >
                    <Plus size={16} />
                </Button>
            </div>

            <div className="space-y-2">
                {todoList.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-background/50 transition-colors group"
                    >
                        <button
                            onClick={() => handleToggle(item.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${item.completed
                                    ? 'bg-primary border-primary'
                                    : 'border-muted-foreground/30 hover:border-primary'
                                }`}
                        >
                            {item.completed && <Check size={14} className="text-primary-foreground" />}
                        </button>

                        {editingId === item.id ? (
                            <div className="flex-1 flex items-center gap-2">
                                <Input
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleSaveEdit(item.id)
                                        if (e.key === 'Escape') handleCancelEdit()
                                    }}
                                    className="h-8 text-sm"
                                    autoFocus
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSaveEdit(item.id)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Check size={14} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="h-8 w-8 p-0"
                                >
                                    <X size={14} />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <span
                                    className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''
                                        }`}
                                >
                                    {item.text}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(item.id, item.text)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(item.id)}
                                        className="h-8 w-8 p-0 hover:text-destructive"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {isAddingTask && (
                    <div className="flex items-center gap-2 p-2">
                        <div className="w-5 h-5 flex-shrink-0" />
                        <Input
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleAddTask()
                                if (e.key === 'Escape') {
                                    setIsAddingTask(false)
                                    setNewTaskText('')
                                }
                            }}
                            placeholder="Add a new task..."
                            className="h-8 text-sm"
                            autoFocus
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleAddTask}
                            className="h-8 w-8 p-0"
                        >
                            <Check size={14} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsAddingTask(false)
                                setNewTaskText('')
                            }}
                            className="h-8 w-8 p-0"
                        >
                            <X size={14} />
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                    {todoList.filter(t => t.completed).length} of {todoList.length} completed
                </p>
            </div>
        </Card>
    )
}
