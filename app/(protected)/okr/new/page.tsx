import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { createOkrAction } from "@/lib/okr/actions"
import type { UserRole } from "@/lib/auth/rbac"

export default async function OkrNewPage() {
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role || (role !== "Coordinador" && role !== "Gerencia")) notFound()

  return (
    <main>
      <header>
        <a href="/okr">← OKRs</a>
        <h1>Nuevo OKR</h1>
      </header>

      <form action={createOkrAction}>
        <fieldset>
          <legend>OKR</legend>
          <label>
            Período (ej: Q2-2026)
            <input name="period" required placeholder="Q2-2026" />
          </label>
          <label>
            CoE
            <input name="coe_id" required placeholder="plataforma" />
          </label>
          <label>
            Objetivo
            <textarea name="objective" required rows={3} />
          </label>
        </fieldset>

        {[0, 1, 2].map((i) => (
          <fieldset key={i}>
            <legend>Key Result {i + 1}{i === 0 ? " (requerido)" : " (opcional)"}</legend>
            <label>
              Descripción
              <input name={`kr_description_${i}`} required={i === 0} />
            </label>
            <label>
              KPI
              <input name={`kr_kpi_${i}`} required={i === 0} />
            </label>
            <label>
              Baseline
              <input name={`kr_baseline_${i}`} type="number" required={i === 0} />
            </label>
            <label>
              Target
              <input name={`kr_target_${i}`} type="number" required={i === 0} />
            </label>
            <label>
              Responsable
              <input name={`kr_responsible_${i}`} required={i === 0} />
            </label>
            <label>
              Fecha límite
              <input name={`kr_due_date_${i}`} type="date" required={i === 0} />
            </label>
          </fieldset>
        ))}

        <button type="submit">Crear OKR</button>
      </form>
    </main>
  )
}
