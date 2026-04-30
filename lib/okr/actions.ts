"use server"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createOkr, updateKrProgress, deleteOkr } from "./repository"
import type { UserRole } from "@/lib/auth/rbac"
import type { OkrProgress } from "./types"

export async function createOkrAction(formData: FormData) {
  const session = await auth()
  const role = session?.user?.role as UserRole | null
  if (!role) throw new Error("Unauthenticated")

  const period = (formData.get("period") as string).trim()
  const coe_id = (formData.get("coe_id") as string).trim()
  const objective = (formData.get("objective") as string).trim()

  const krs = []
  for (let i = 0; i < 3; i++) {
    const description = ((formData.get(`kr_description_${i}`) as string) ?? "").trim()
    const kpi = ((formData.get(`kr_kpi_${i}`) as string) ?? "").trim()
    const baseline = parseInt((formData.get(`kr_baseline_${i}`) as string) ?? "", 10)
    const target = parseInt((formData.get(`kr_target_${i}`) as string) ?? "", 10)
    const responsible = ((formData.get(`kr_responsible_${i}`) as string) ?? "").trim()
    const due_date = ((formData.get(`kr_due_date_${i}`) as string) ?? "").trim()

    if (description && kpi && !isNaN(baseline) && !isNaN(target) && responsible && due_date) {
      krs.push({ description, kpi, baseline, target, responsible, due_date })
    }
  }

  await createOkr({ period, coe_id, objective, key_results: krs }, role)
  redirect("/okr")
}

export async function updateKrProgressAction(krId: string, formData: FormData) {
  const session = await auth()
  const role = session?.user?.role as UserRole | null
  if (!role) throw new Error("Unauthenticated")

  const progress = parseInt(formData.get("progress") as string, 10) as OkrProgress
  const current_value = parseInt(formData.get("current_value") as string, 10)

  await updateKrProgress(krId, { progress, current_value }, role)
}

export async function deleteOkrAction(id: string, _formData: FormData) {
  const session = await auth()
  const role = session?.user?.role as UserRole | null
  if (!role) throw new Error("Unauthenticated")

  await deleteOkr(id, role)
  redirect("/okr")
}
