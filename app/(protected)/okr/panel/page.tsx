import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { findAllOkrs, findDistinctPeriods } from "@/lib/okr/repository"
import type { UserRole } from "@/lib/auth/rbac"
import type { OkrWithKeyResults } from "@/lib/okr/types"

interface PageProps {
  searchParams: Promise<{ period?: string }>
}

export default async function OkrPanelPage({ searchParams }: PageProps) {
  const { period } = await searchParams
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role) notFound()

  const [periods, okrs] = await Promise.all([
    findDistinctPeriods(),
    findAllOkrs(role, null, period),
  ])

  const selectedPeriod = period ?? periods[0]

  const byCoe = okrs.reduce<Record<string, OkrWithKeyResults[]>>((acc, okr) => {
    acc[okr.coe_id] = [...(acc[okr.coe_id] ?? []), okr]
    return acc
  }, {})

  const overallProgress =
    okrs.length > 0
      ? Math.round(okrs.reduce((sum, o) => sum + o.avg_progress, 0) / okrs.length)
      : 0

  return (
    <main>
      <header>
        <a href="/dashboard">← Dashboard</a>
        <h1>Panel OKRs</h1>
        <a href="/okr">Gestión →</a>
      </header>

      {periods.length > 0 && (
        <form method="GET">
          <label>
            Período
            <select name="period" defaultValue={selectedPeriod ?? ""}>
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Filtrar</button>
        </form>
      )}

      <section>
        <h2>Resumen{selectedPeriod ? ` — ${selectedPeriod}` : ""}</h2>
        <p>
          {okrs.length} OKR{okrs.length !== 1 ? "s" : ""} · Progreso promedio:{" "}
          {overallProgress}%
        </p>
      </section>

      {okrs.length === 0 ? (
        <p>No hay OKRs para el período seleccionado.</p>
      ) : (
        Object.entries(byCoe).map(([coe, coeOkrs]) => {
          const coeAvg = Math.round(
            coeOkrs.reduce((s, o) => s + o.avg_progress, 0) / coeOkrs.length
          )
          return (
            <section key={coe}>
              <h2>
                CoE: {coe} — {coeAvg}% promedio
              </h2>

              {coeOkrs.map((okr) => (
                <article key={okr.id}>
                  <h3>
                    <a href={`/okr/${okr.id}`}>{okr.objective}</a>
                  </h3>
                  <p>Progreso OKR: {okr.avg_progress}%</p>

                  {okr.key_results.length > 0 && (
                    <ul>
                      {okr.key_results.map((kr) => (
                        <li key={kr.id}>
                          <strong>{kr.description}</strong> —{" "}
                          {kr.progress}% (actual: {kr.current_value}/{kr.target}{" "}
                          {kr.kpi}) · {kr.responsible} · vence {kr.due_date}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </section>
          )
        })
      )}
    </main>
  )
}
