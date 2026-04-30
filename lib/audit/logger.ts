import { db } from "@/lib/db/client"
import { accessLogs } from "@/lib/db/schema"

export type ResourceType = "doc" | "adr" | "okr" | "onboarding" | "career"

export async function logAccess(
  githubLogin: string,
  resourceType: ResourceType,
  resourceSlug: string
): Promise<void> {
  await db.insert(accessLogs).values({
    id: crypto.randomUUID(),
    github_login: githubLogin,
    resource_type: resourceType,
    resource_slug: resourceSlug,
  })
}

// Fire-and-forget: use in server components without blocking render
export function logAccessSilent(
  githubLogin: string,
  resourceType: ResourceType,
  resourceSlug: string
): void {
  logAccess(githubLogin, resourceType, resourceSlug).catch(() => {
    // non-critical — never fail the page render over a log write
  })
}
