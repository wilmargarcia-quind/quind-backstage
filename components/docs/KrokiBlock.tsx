"use client"

import { useEffect, useState } from "react"

interface KrokiBlockProps {
  type: string
  code: string
}

export default function KrokiBlock({ type, code }: KrokiBlockProps) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const res = await fetch("/api/diagrams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, source: code }),
        })
        if (!res.ok) throw new Error("render failed")
        const text = await res.text()
        if (!cancelled) setSvg(text)
      } catch {
        if (!cancelled) setError(true)
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [type, code])

  if (error) return <pre>{code}</pre>
  if (!svg) return <p aria-live="polite">Renderizando diagrama...</p>

  // SVG proviene de Kroki (fuente: docs internas en quind-architecture-docs)
  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{ __html: svg }} aria-label={`Diagrama ${type}`} />
}
