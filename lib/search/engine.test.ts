import { describe, it, expect } from "vitest"
import { searchDocs } from "./engine"

function makeDoc(overrides: {
  slug?: string
  title?: string
  tags?: string[]
  content?: string
  category?: string
}) {
  return {
    slug: overrides.slug ?? "doc-1",
    title: overrides.title ?? "Documento de prueba",
    category: overrides.category ?? "docs",
    tags: overrides.tags ?? [],
    role_visibility: ["Dev" as const],
    content: overrides.content ?? "Contenido genérico del documento.",
  }
}

describe("searchDocs", () => {
  it("returns empty array for empty query", () => {
    const docs = [makeDoc({})]
    expect(searchDocs(docs, "")).toEqual([])
    expect(searchDocs(docs, "   ")).toEqual([])
  })

  it("matches by title (highest score)", () => {
    const docs = [
      makeDoc({ slug: "a", title: "Stack tecnológico Quind", content: "irrelevante" }),
      makeDoc({ slug: "b", title: "Otro doc", content: "Stack tecnológico aquí" }),
    ]

    const results = searchDocs(docs, "stack")

    expect(results[0].slug).toBe("a")
    expect(results[1].slug).toBe("b")
  })

  it("matches by tag", () => {
    const docs = [
      makeDoc({ slug: "tagged", tags: ["drizzle", "postgres"], content: "sin match" }),
      makeDoc({ slug: "untagged", tags: [], content: "sin match" }),
    ]

    const results = searchDocs(docs, "drizzle")

    expect(results).toHaveLength(1)
    expect(results[0].slug).toBe("tagged")
  })

  it("matches by content", () => {
    const docs = [makeDoc({ content: "Este doc habla sobre Vitest y testing" })]

    const results = searchDocs(docs, "vitest")

    expect(results).toHaveLength(1)
  })

  it("excludes docs with no match", () => {
    const docs = [
      makeDoc({ slug: "match", title: "Drizzle ORM" }),
      makeDoc({ slug: "no-match", title: "Otro tema", content: "nada relevante" }),
    ]

    const results = searchDocs(docs, "drizzle")

    expect(results).toHaveLength(1)
    expect(results[0].slug).toBe("match")
  })

  it("is case-insensitive", () => {
    const docs = [makeDoc({ title: "Stack Tecnológico" })]

    expect(searchDocs(docs, "STACK")).toHaveLength(1)
    expect(searchDocs(docs, "stack")).toHaveLength(1)
  })

  it("includes excerpt from content", () => {
    const docs = [makeDoc({ content: "La solución usa Drizzle ORM para acceso a datos." })]

    const results = searchDocs(docs, "drizzle")

    expect(results[0].excerpt).toContain("Drizzle")
  })

  it("sorts by score descending", () => {
    const docs = [
      makeDoc({ slug: "content-only", title: "Otro", content: "drizzle mencionado aquí" }),
      makeDoc({ slug: "title-match", title: "Drizzle ORM", content: "drizzle también" }),
    ]

    const results = searchDocs(docs, "drizzle")

    expect(results[0].slug).toBe("title-match")
  })
})
