import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { loadAdrBySlug } from "@/lib/adr/loader"
import MarkdownRenderer from "@/components/docs/MarkdownRenderer"
import type { UserRole } from "@/lib/auth/rbac"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AdrDetailPage({ params }: PageProps) {
  const { slug } = await params
  const session = await auth()
  const role = session?.user?.role as UserRole | null
  if (!role) notFound()

  const adr = await loadAdrBySlug(slug, role)
  if (!adr) notFound()

  return (
    <main>
      <header>
        <a href="/adr">← ADRs</a>
        <h1>{adr.title}</h1>
        <dl>
          <dt>Estado</dt>
          <dd>{adr.status}</dd>
          {adr.decision_date && (
            <>
              <dt>Fecha de decisión</dt>
              <dd>{adr.decision_date}</dd>
            </>
          )}
          {adr.authors.length > 0 && (
            <>
              <dt>Autores</dt>
              <dd>{adr.authors.join(", ")}</dd>
            </>
          )}
        </dl>
      </header>

      <article>
        <MarkdownRenderer content={adr.content} />
      </article>
    </main>
  )
}
