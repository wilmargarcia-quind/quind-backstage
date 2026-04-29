import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { loadCareerPathBySlug, loadCareerPaths } from "@/lib/career/loader"
import MarkdownRenderer from "@/components/docs/MarkdownRenderer"
import type { UserRole } from "@/lib/auth/rbac"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CareerPathDetailPage({ params }: PageProps) {
  const { slug } = await params
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role) notFound()

  const [doc, allPaths] = await Promise.all([
    loadCareerPathBySlug(slug, role),
    loadCareerPaths(role),
  ])

  if (!doc) notFound()

  const sameLevelPaths = allPaths.filter((p) => p.role_level === doc.role_level)
  const currentIndex = sameLevelPaths.findIndex((p) => p.slug === slug)
  const prev = currentIndex > 0 ? sameLevelPaths[currentIndex - 1] : null
  const next = currentIndex < sameLevelPaths.length - 1 ? sameLevelPaths[currentIndex + 1] : null

  return (
    <main>
      <header>
        <a href="/career">← Rutas de carrera</a>
        <span>{doc.role_level}</span>
        <h1>{doc.title}</h1>
      </header>

      <article>
        <MarkdownRenderer content={doc.content} />
      </article>

      <nav>
        {prev && <a href={`/career/${prev.slug}`}>← {prev.title}</a>}
        {next && <a href={`/career/${next.slug}`}>{next.title} →</a>}
      </nav>
    </main>
  )
}
