"use client"

import dynamic from "next/dynamic"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import type { Components } from "react-markdown"

const MermaidBlock = dynamic(() => import("./MermaidBlock"), { ssr: false })

const components: Components = {
  code({ className, children }) {
    const language = className?.replace("language-", "") ?? ""
    if (language === "mermaid") {
      return <MermaidBlock code={String(children).trim()} />
    }
    return <code className={className}>{children}</code>
  },
}

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}
