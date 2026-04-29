import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { loadDocBySlug } from "@/lib/docs/loader"
import { loadOnboardingSteps } from "@/lib/onboarding/loader"
import MarkdownRenderer from "@/components/docs/MarkdownRenderer"
import type { UserRole } from "@/lib/auth/rbac"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function OnboardingStepPage({ params }: PageProps) {
  const { slug } = await params
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role) notFound()

  const [doc, allSteps] = await Promise.all([
    loadDocBySlug(slug, role),
    loadOnboardingSteps(role),
  ])

  if (!doc) notFound()

  const currentIndex = allSteps.findIndex((s) => s.slug === slug)
  const prev = currentIndex > 0 ? allSteps[currentIndex - 1] : null
  const next =
    currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null

  return (
    <main>
      <header>
        <a href="/onboarding">← Onboarding</a>
        {allSteps.length > 0 && (
          <span>
            Paso {(currentIndex + 1)} de {allSteps.length}
          </span>
        )}
        <h1>{doc.title}</h1>
      </header>

      <article>
        <MarkdownRenderer content={doc.content} />
      </article>

      <nav>
        {prev && <a href={`/onboarding/${prev.slug}`}>← {prev.title}</a>}
        {next && <a href={`/onboarding/${next.slug}`}>{next.title} →</a>}
      </nav>
    </main>
  )
}
