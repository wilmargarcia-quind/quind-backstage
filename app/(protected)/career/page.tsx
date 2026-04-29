import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { loadCareerPaths } from "@/lib/career/loader"
import { ROLE_LEVELS } from "@/lib/career/types"
import type { UserRole } from "@/lib/auth/rbac"
import type { CareerPathMetadata } from "@/lib/career/types"

export default async function CareerPage() {
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role) notFound()

  const paths = await loadCareerPaths(role)

  const byLevel = ROLE_LEVELS.reduce<Record<string, CareerPathMetadata[]>>(
    (acc, level) => {
      acc[level] = paths.filter((p) => p.role_level === level)
      return acc
    },
    {}
  )

  return (
    <main>
      <header>
        <a href="/dashboard">← Dashboard</a>
        <h1>Rutas de carrera</h1>
        <p>Rol: {role}</p>
      </header>

      {paths.length === 0 ? (
        <p>No hay rutas de carrera configuradas aún.</p>
      ) : (
        ROLE_LEVELS.filter((level) => byLevel[level].length > 0).map((level) => (
          <section key={level}>
            <h2>{level}</h2>
            <ul>
              {byLevel[level].map((cp) => (
                <li key={cp.slug}>
                  <a href={`/career/${cp.slug}`}>{cp.title}</a>
                  {cp.tags.length > 0 && (
                    <span>{cp.tags.join(", ")}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  )
}
