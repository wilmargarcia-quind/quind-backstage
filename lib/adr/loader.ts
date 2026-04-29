import { loadDocsByCategoryAndRole, loadDocBySlug } from "@/lib/docs/loader"
import type { DocMetadata } from "@/lib/docs/types"
import type { UserRole } from "@/lib/auth/rbac"
import { ADR_STATUSES, type AdrDoc, type AdrMetadata, type AdrStatus } from "./types"

function toAdrMetadata(doc: DocMetadata): AdrMetadata | null {
  if (!doc.status || !ADR_STATUSES.includes(doc.status as AdrStatus)) return null
  return {
    ...doc,
    status: doc.status as AdrStatus,
    authors: doc.authors ?? [],
    decision_date: doc.decision_date ?? "",
  }
}

export async function loadAdrList(
  role: UserRole,
  statusFilter?: AdrStatus
): Promise<AdrMetadata[]> {
  const docs = await loadDocsByCategoryAndRole("adr", role)
  const adrs = docs
    .map(toAdrMetadata)
    .filter((adr): adr is AdrMetadata => adr !== null)
    .sort((a, b) => b.decision_date.localeCompare(a.decision_date))

  return statusFilter ? adrs.filter((adr) => adr.status === statusFilter) : adrs
}

export async function loadAdrBySlug(
  slug: string,
  role: UserRole
): Promise<AdrDoc | null> {
  const doc = await loadDocBySlug(slug, role)
  if (!doc) return null
  const meta = toAdrMetadata(doc)
  if (!meta) return null
  return { ...meta, content: doc.content }
}
