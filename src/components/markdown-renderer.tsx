import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
    content: string
    className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    return (
        <div className={`markdown-body ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                    // Custom rendering for code blocks
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline ? (
                            <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-2">
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            </pre>
                        ) : (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                                {children}
                            </code>
                        )
                    },
                    // Custom rendering for links
                    a({ node, children, ...props }: any) {
                        return (
                            <a
                                className="text-primary hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                            >
                                {children}
                            </a>
                        )
                    },
                    // Custom rendering for blockquotes
                    blockquote({ node, children, ...props }: any) {
                        return (
                            <blockquote
                                className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
                                {...props}
                            >
                                {children}
                            </blockquote>
                        )
                    },
                    // Custom rendering for tables
                    table({ node, children, ...props }: any) {
                        return (
                            <div className="overflow-x-auto my-4">
                                <table className="min-w-full border border-border" {...props}>
                                    {children}
                                </table>
                            </div>
                        )
                    },
                    thead({ node, children, ...props }: any) {
                        return (
                            <thead className="bg-muted" {...props}>
                                {children}
                            </thead>
                        )
                    },
                    th({ node, children, ...props }: any) {
                        return (
                            <th className="border border-border px-4 py-2 text-left font-semibold" {...props}>
                                {children}
                            </th>
                        )
                    },
                    td({ node, children, ...props }: any) {
                        return (
                            <td className="border border-border px-4 py-2" {...props}>
                                {children}
                            </td>
                        )
                    },
                    // Custom rendering for lists
                    ul({ node, children, ...props }: any) {
                        return (
                            <ul className="list-disc list-inside my-2 space-y-1" {...props}>
                                {children}
                            </ul>
                        )
                    },
                    ol({ node, children, ...props }: any) {
                        return (
                            <ol className="list-decimal list-inside my-2 space-y-1" {...props}>
                                {children}
                            </ol>
                        )
                    },
                    // Custom rendering for headings
                    h1({ node, children, ...props }: any) {
                        return (
                            <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>
                                {children}
                            </h1>
                        )
                    },
                    h2({ node, children, ...props }: any) {
                        return (
                            <h2 className="text-xl font-bold mt-5 mb-3" {...props}>
                                {children}
                            </h2>
                        )
                    },
                    h3({ node, children, ...props }: any) {
                        return (
                            <h3 className="text-lg font-bold mt-4 mb-2" {...props}>
                                {children}
                            </h3>
                        )
                    },
                    // Custom rendering for paragraphs
                    p({ node, children, ...props }: any) {
                        return (
                            <p className="my-2 leading-relaxed" {...props}>
                                {children}
                            </p>
                        )
                    },
                    // Custom rendering for horizontal rules
                    hr({ node, ...props }: any) {
                        return <hr className="my-4 border-border" {...props} />
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
