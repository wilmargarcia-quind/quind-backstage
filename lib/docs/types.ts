import type { UserRole } from "@/lib/auth/rbac"

export interface DocMetadata {
  slug: string
  title: string
  category: string
  tags: string[]
  role_visibility: UserRole[]
  role_level?: string
  order?: number
  status?: string
  authors?: string[]
  decision_date?: string
}

export interface Doc extends DocMetadata {
  content: string
}
