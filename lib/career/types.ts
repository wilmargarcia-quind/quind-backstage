import type { DocMetadata } from "@/lib/docs/types"

export type RoleLevel = "Dev Jr" | "Dev Sr" | "TL" | "Coordinador"

export const ROLE_LEVELS: RoleLevel[] = ["Dev Jr", "Dev Sr", "TL", "Coordinador"]

export interface CareerPathMetadata extends DocMetadata {
  role_level: RoleLevel
}

export interface CareerPathDoc extends CareerPathMetadata {
  content: string
}
