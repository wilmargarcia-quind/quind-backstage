import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db/client"
import { okrs, keyResults } from "@/lib/db/schema"
import type { UserRole } from "@/lib/auth/rbac"
import type {
  CreateOkrInput,
  OkrWithKeyResults,
  UpdateKrProgressInput,
  OkrProgress,
} from "./types"

function calcAvgProgress(krs: { progress: number }[]): number {
  if (!krs.length) return 0
  return Math.round(krs.reduce((sum, kr) => sum + kr.progress, 0) / krs.length)
}

function assertCanWrite(role: UserRole): void {
  if (role === "Dev") throw new Error("Forbidden")
}

function assertNotDev(role: UserRole): void {
  if (role === "Dev") throw new Error("Forbidden")
}

export async function findDistinctPeriods(): Promise<string[]> {
  const rows = await db.selectDistinct({ period: okrs.period }).from(okrs)
  return rows.map((r) => r.period).sort().reverse()
}

export async function findAllOkrs(
  role: UserRole,
  coeId: string | null,
  period?: string
): Promise<OkrWithKeyResults[]> {
  const filters = []
  // TL con coeId conocido solo ve su CoE; sin coeId (dev bypass) ve todos
  if (role === "TL" && coeId !== null) filters.push(eq(okrs.coe_id, coeId))
  if (period) filters.push(eq(okrs.period, period))

  const where =
    filters.length === 0 ? undefined
    : filters.length === 1 ? filters[0]
    : and(...filters)

  const rows = await db.query.okrs.findMany({ where, with: { keyResults: true } })
  return rows.map((row) => ({
    ...row,
    key_results: row.keyResults as OkrWithKeyResults["key_results"],
    avg_progress: calcAvgProgress(row.keyResults),
  }))
}

export async function findOkrById(
  id: string,
  role: UserRole,
  coeId: string | null
): Promise<OkrWithKeyResults | null> {
  const row = await db.query.okrs.findFirst({
    where: eq(okrs.id, id),
    with: { keyResults: true },
  })
  if (!row) return null
  if (role === "TL" && coeId !== null && row.coe_id !== coeId) return null
  return {
    ...row,
    key_results: row.keyResults as OkrWithKeyResults["key_results"],
    avg_progress: calcAvgProgress(row.keyResults),
  }
}

export async function createOkr(
  input: CreateOkrInput,
  role: UserRole
): Promise<OkrWithKeyResults> {
  assertCanWrite(role)
  if (!input.key_results.length) throw new Error("At least one key result is required")

  const id = crypto.randomUUID()
  const now = new Date()

  await db.insert(okrs).values({
    id,
    period: input.period,
    coe_id: input.coe_id,
    objective: input.objective,
    created_at: now,
    updated_at: now,
  })

  const krs = input.key_results.map((kr) => ({
    id: crypto.randomUUID(),
    okr_id: id,
    description: kr.description,
    kpi: kr.kpi,
    baseline: kr.baseline,
    target: kr.target,
    current_value: kr.baseline,
    responsible: kr.responsible,
    due_date: kr.due_date,
    progress: 0 as OkrProgress,
  }))

  await db.insert(keyResults).values(krs)

  return {
    id,
    period: input.period,
    coe_id: input.coe_id,
    objective: input.objective,
    created_at: now,
    updated_at: now,
    key_results: krs,
    avg_progress: 0,
  }
}

export async function updateKrProgress(
  krId: string,
  input: UpdateKrProgressInput,
  role: UserRole
): Promise<void> {
  assertNotDev(role)
  await db
    .update(keyResults)
    .set({ progress: input.progress, current_value: input.current_value })
    .where(eq(keyResults.id, krId))
}

export async function deleteOkr(id: string, role: UserRole): Promise<void> {
  assertCanWrite(role)
  await db.delete(okrs).where(eq(okrs.id, id))
}
