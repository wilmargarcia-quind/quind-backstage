import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { loadAllDocs } from "@/lib/docs/loader"
import { searchDocs } from "@/lib/search/engine"
import type { UserRole } from "@/lib/auth/rbac"

const CATEGORY_PATH: Record<string, string> = {
  adr: "/adr",
  onboarding: "/onboarding",
  "career-path": "/career",
  docs: "/docs",
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role) notFound()

  const query = q?.trim() ?? ""
  let results = []

  if (query) {
    const allDocs = await loadAllDocs()
    const accessible = allDocs.filter((doc) => doc.role_visibility.includes(role))
    results = searchDocs(accessible, query)
  }

  const basePath = (category: string, slug: string) =>
    `${CATEGORY_PATH[category] ?? "/docs"}/${slug}`

  return (
    <main>
      <header>
        <a href="/dashboard">← Dashboard</a>
        <h1>Búsqueda</h1>
      </header>

      <form method="GET">
        <label>
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Buscar en la documentación…"
            autoFocus
          />
        </label>
        <button type="submit">Buscar</button>
      </form>

      {query && (
        <section>
          <p>
            {results.length === 0
              ? `Sin resultados para "${query}"`
              : `${results.length} resultado${results.length !== 1 ? "s" : ""} para "${query}"`}
          </p>

          <ul>
            {results.map((r) => (
              <li key={r.slug}>
                <a href={basePath(r.category, r.slug)}>{r.title}</a>
                <span>{r.category}</span>
                {r.tags.length > 0 && <span>{r.tags.join(", ")}</span>}
                <p>{r.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
