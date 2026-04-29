import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { loadDocsByRole } from "@/lib/docs/loader"
import type { UserRole } from "@/lib/auth/rbac"

export default async function DocsPage() {
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role) notFound()

  const docs = await loadDocsByRole(role)

  return (
    <main>
      <h1>Documentación técnica</h1>
      {docs.length === 0 ? (
        <p>No hay documentos disponibles para tu rol.</p>
      ) : (
        <ul>
          {docs.map((doc) => (
            <li key={doc.slug}>
              <a href={`/docs/${doc.slug}`}>{doc.title}</a>
              <span>{doc.category}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
