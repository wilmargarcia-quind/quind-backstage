import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { loadDocBySlug } from "@/lib/docs/loader"
import MarkdownRenderer from "@/components/docs/MarkdownRenderer"
import { logAccessSilent } from "@/lib/audit/logger"
import type { UserRole } from "@/lib/auth/rbac"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role) notFound()

  const doc = await loadDocBySlug(slug, role)

  if (!doc) notFound()

  logAccessSilent(session.user.githubLogin ?? session.user.email ?? "unknown", "doc", slug)

  return (
    <main>
      <header>
        <a href="/docs">← Documentación</a>
        <h1>{doc.title}</h1>
        <span>{doc.category}</span>
      </header>
      <article>
        <MarkdownRenderer content={doc.content} />
      </article>
    </main>
  )
}
