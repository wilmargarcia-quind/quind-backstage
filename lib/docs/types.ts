import type { UserRole } from "@/lib/auth/rbac"

export interface DocMetadata {
  slug: string
  title: string
  category: string
  tags: string[]
  role_visibility: UserRole[]
  role_level?: string
  order?: number
}

export interface Doc extends DocMetadata {
  content: string
}
