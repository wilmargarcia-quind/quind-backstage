"use client"

import { useEffect, useRef, useId } from "react"

interface MermaidBlockProps {
  code: string
}

export default function MermaidBlock({ code }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rawId = useId()
  const diagramId = `mermaid-${rawId.replace(/:/g, "")}`

  useEffect(() => {
    let cancelled = false

    async function render() {
      const mermaid = (await import("mermaid")).default
      mermaid.initialize({ startOnLoad: false, theme: "default" })

      if (!containerRef.current || cancelled) return

      try {
        const { svg } = await mermaid.render(diagramId, code)
        if (containerRef.current && !cancelled) {
          containerRef.current.innerHTML = svg
        }
      } catch {
        if (containerRef.current && !cancelled) {
          containerRef.current.textContent = code
        }
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [code, diagramId])

  return <div ref={containerRef} aria-label="Diagrama Mermaid" />
}
