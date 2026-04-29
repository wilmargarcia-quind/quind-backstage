import { loadDocsByCategoryAndRole, loadDocBySlug } from "@/lib/docs/loader"
import type { DocMetadata } from "@/lib/docs/types"
import type { UserRole } from "@/lib/auth/rbac"
import { ROLE_LEVELS, type CareerPathDoc, type CareerPathMetadata, type RoleLevel } from "./types"

function toCareerPathMetadata(doc: DocMetadata): CareerPathMetadata | null {
  if (!doc.role_level || !ROLE_LEVELS.includes(doc.role_level as RoleLevel)) return null
  return {
    ...doc,
    role_level: doc.role_level as RoleLevel,
  }
}

export async function loadCareerPaths(role: UserRole): Promise<CareerPathMetadata[]> {
  const docs = await loadDocsByCategoryAndRole("career-path", role)
  return docs
    .map(toCareerPathMetadata)
    .filter((cp): cp is CareerPathMetadata => cp !== null)
}

export async function loadCareerPathBySlug(
  slug: string,
  role: UserRole
): Promise<CareerPathDoc | null> {
  const doc = await loadDocBySlug(slug, role)
  if (!doc) return null
  const meta = toCareerPathMetadata(doc)
  if (!meta) return null
  return { ...meta, content: doc.content }
}
