import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { findAllOkrs } from "@/lib/okr/repository"
import type { UserRole } from "@/lib/auth/rbac"

export default async function OkrPage() {
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role) notFound()

  const okrs = await findAllOkrs(role, null)
  const canCreate = role !== "Dev"

  return (
    <main>
      <header>
        <a href="/dashboard">← Dashboard</a>
        <h1>OKRs</h1>
        {canCreate && <a href="/okr/new">+ Nuevo OKR</a>}
      </header>

      {okrs.length === 0 ? (
        <p>No hay OKRs registrados aún.</p>
      ) : (
        <ul>
          {okrs.map((okr) => (
            <li key={okr.id}>
              <a href={`/okr/${okr.id}`}>{okr.objective}</a>
              <span>{okr.period}</span>
              <span>CoE: {okr.coe_id}</span>
              <span>
                {okr.key_results.length} KR{okr.key_results.length !== 1 ? "s" : ""} ·{" "}
                {okr.avg_progress}% promedio
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
