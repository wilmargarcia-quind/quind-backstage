import type { UserRole } from "@/lib/auth/rbac"

export interface DocMetadata {
  slug: string
  title: string
  category: string
  tags: string[]
  role_visibility: UserRole[]
}

export interface Doc extends DocMetadata {
  content: string
}
