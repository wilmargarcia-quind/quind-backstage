import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { findOkrById } from "@/lib/okr/repository"
import { updateKrProgressAction, deleteOkrAction } from "@/lib/okr/actions"
import { OKR_PROGRESS_VALUES } from "@/lib/okr/types"
import { logAccessSilent } from "@/lib/audit/logger"
import type { UserRole } from "@/lib/auth/rbac"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OkrDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role) notFound()

  const okr = await findOkrById(id, role, null)
  if (!okr) notFound()

  logAccessSilent(session.user.githubLogin ?? session.user.email ?? "unknown", "okr", id)

  const canDelete = role !== "Dev"
  const canUpdate = role !== "Dev"

  return (
    <main>
      <header>
        <a href="/okr">← OKRs</a>
        <h1>{okr.objective}</h1>
        <p>
          {okr.period} · CoE: {okr.coe_id} · Progreso promedio: {okr.avg_progress}%
        </p>
      </header>

      <section>
        <h2>Key Results</h2>
        {okr.key_results.length === 0 ? (
          <p>Sin key results registrados.</p>
        ) : (
          <ul>
            {okr.key_results.map((kr) => (
              <li key={kr.id}>
                <strong>{kr.description}</strong>
                <p>
                  KPI: {kr.kpi} · Baseline: {kr.baseline} → Target: {kr.target} ·
                  Actual: {kr.current_value} · Responsable: {kr.responsible} · Vence:{" "}
                  {kr.due_date}
                </p>
                <p>Progreso: {kr.progress}%</p>

                {canUpdate && (
                  <form action={updateKrProgressAction.bind(null, kr.id)}>
                    <label>
                      Nuevo progreso
                      <select name="progress" defaultValue={String(kr.progress)}>
                        {OKR_PROGRESS_VALUES.map((v) => (
                          <option key={v} value={v}>
                            {v}%
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Valor actual
                      <input
                        name="current_value"
                        type="number"
                        defaultValue={kr.current_value}
                      />
                    </label>
                    <button type="submit">Actualizar</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {canDelete && (
        <section>
          <h2>Zona de peligro</h2>
          <form action={deleteOkrAction.bind(null, okr.id)}>
            <button type="submit">Eliminar OKR</button>
          </form>
        </section>
      )}
    </main>
  )
}
