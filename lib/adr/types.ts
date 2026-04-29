import type { DocMetadata } from "@/lib/docs/types"

export type AdrStatus = "Proposed" | "Accepted" | "Deprecated"

export const ADR_STATUSES: AdrStatus[] = ["Proposed", "Accepted", "Deprecated"]

export interface AdrMetadata extends DocMetadata {
  status: AdrStatus
  authors: string[]
  decision_date: string
}

export interface AdrDoc extends AdrMetadata {
  content: string
}
