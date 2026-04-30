import type { DocMetadata } from "@/lib/docs/types"

export interface SearchResult {
  slug: string
  title: string
  category: string
  tags: string[]
  excerpt: string
  score: number
}

const EXCERPT_RADIUS = 120

function excerpt(content: string, query: string): string {
  const idx = content.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return content.slice(0, EXCERPT_RADIUS).trim() + "…"
  const start = Math.max(0, idx - EXCERPT_RADIUS / 2)
  const end = Math.min(content.length, idx + EXCERPT_RADIUS / 2)
  const raw = content.slice(start, end).replace(/\n+/g, " ").trim()
  return (start > 0 ? "…" : "") + raw + (end < content.length ? "…" : "")
}

function score(doc: { title: string; tags: string[]; content: string }, query: string): number {
  const q = query.toLowerCase()
  let s = 0
  if (doc.title.toLowerCase().includes(q)) s += 10
  if (doc.tags.some((t) => t.toLowerCase().includes(q))) s += 5
  if (doc.content.toLowerCase().includes(q)) s += 1
  return s
}

export function searchDocs(
  docs: (DocMetadata & { content: string })[],
  query: string
): SearchResult[] {
  const q = query.trim()
  if (!q) return []

  return docs
    .map((doc) => ({ doc, score: score(doc, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ doc }) => ({
      slug: doc.slug,
      title: doc.title,
      category: doc.category,
      tags: doc.tags,
      excerpt: excerpt(doc.content, q),
      score: score(doc, q),
    }))
}
