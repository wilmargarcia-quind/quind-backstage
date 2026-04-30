import { NextRequest, NextResponse } from "next/server"

const KROKI_URL = process.env.KROKI_URL ?? "https://kroki.io"

const ALLOWED_TYPES = new Set([
  "plantuml",
  "c4plantuml",
  "graphviz",
  "ditaa",
  "erd",
  "svgbob",
  "nomnoml",
  "mscgen",
  "blockdiag",
  "seqdiag",
  "actdiag",
  "nwdiag",
])

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { type, source } = body as { type?: string; source?: string }

  if (!type || !source || !ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid type or missing source" }, { status: 400 })
  }

  try {
    const upstream = await fetch(`${KROKI_URL}/${type}/svg`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: source,
    })

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Diagram render failed" },
        { status: upstream.status }
      )
    }

    const svg = await upstream.text()
    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    })
  } catch {
    return NextResponse.json({ error: "Kroki unavailable" }, { status: 502 })
  }
}
