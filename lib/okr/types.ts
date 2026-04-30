export type OkrProgress = 0 | 25 | 50 | 75 | 100

export const OKR_PROGRESS_VALUES: OkrProgress[] = [0, 25, 50, 75, 100]

export interface KeyResult {
  id: string
  okr_id: string
  description: string
  kpi: string
  baseline: number
  target: number
  current_value: number
  responsible: string
  due_date: string
  progress: OkrProgress
}

export interface Okr {
  id: string
  period: string
  coe_id: string
  objective: string
  created_at: Date
  updated_at: Date
}

export interface OkrWithKeyResults extends Okr {
  key_results: KeyResult[]
  avg_progress: number
}

export interface CreateOkrInput {
  period: string
  coe_id: string
  objective: string
  key_results: Omit<KeyResult, "id" | "okr_id" | "current_value" | "progress">[]
}

export interface UpdateKrProgressInput {
  progress: OkrProgress
  current_value: number
}
