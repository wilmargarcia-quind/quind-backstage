import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { loadAdrList } from "@/lib/adr/loader"
import { ADR_STATUSES, type AdrStatus } from "@/lib/adr/types"
import type { UserRole } from "@/lib/auth/rbac"

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdrPage({ searchParams }: PageProps) {
  const session = await auth()
  const role = session?.user?.role as UserRole | null
  if (!role) notFound()

  const { status } = await searchParams
  const statusFilter =
    status && ADR_STATUSES.includes(status as AdrStatus)
      ? (status as AdrStatus)
      : undefined

  const adrs = await loadAdrList(role, statusFilter)

  return (
    <main>
      <header>
        <a href="/dashboard">← Dashboard</a>
        <h1>Architecture Decision Records</h1>
      </header>

      <nav>
        <a href="/adr">Todos</a>
        {ADR_STATUSES.map((s) => (
          <a key={s} href={`/adr?status=${s}`}>
            {s}
          </a>
        ))}
      </nav>

      {adrs.length === 0 ? (
        <p>No hay ADRs disponibles{statusFilter ? ` con estado "${statusFilter}"` : ""}.</p>
      ) : (
        <ul>
          {adrs.map((adr) => (
            <li key={adr.slug}>
              <a href={`/adr/${adr.slug}`}>{adr.title}</a>
              <span>{adr.status}</span>
              {adr.decision_date && <span>{adr.decision_date}</span>}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
