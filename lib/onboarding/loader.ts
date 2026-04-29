import { loadDocsByCategoryAndRole } from "@/lib/docs/loader"
import type { UserRole } from "@/lib/auth/rbac"
import type { OnboardingStep } from "./types"

export async function loadOnboardingSteps(
  role: UserRole
): Promise<OnboardingStep[]> {
  const docs = await loadDocsByCategoryAndRole("onboarding", role)
  return docs.map((doc, index) => ({
    ...doc,
    step: doc.order ?? index + 1,
  }))
}
