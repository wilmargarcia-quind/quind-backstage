"use client"

import dynamic from "next/dynamic"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import type { Components } from "react-markdown"

const MermaidBlock = dynamic(() => import("./MermaidBlock"), { ssr: false })
const KrokiBlock = dynamic(() => import("./KrokiBlock"), { ssr: false })

// Map fence language → Kroki type (puml/dot are common aliases)
const KROKI_LANG_MAP: Record<string, string> = {
  plantuml: "plantuml",
  puml: "plantuml",
  c4plantuml: "c4plantuml",
  graphviz: "graphviz",
  dot: "graphviz",
  ditaa: "ditaa",
  erd: "erd",
  svgbob: "svgbob",
  nomnoml: "nomnoml",
  blockdiag: "blockdiag",
  seqdiag: "seqdiag",
  actdiag: "actdiag",
  nwdiag: "nwdiag",
}

const components: Components = {
  code({ className, children }) {
    const language = className?.replace("language-", "") ?? ""
    if (language === "mermaid") {
      return <MermaidBlock code={String(children).trim()} />
    }
    const krokiType = KROKI_LANG_MAP[language]
    if (krokiType) {
      return <KrokiBlock type={krokiType} code={String(children).trim()} />
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
