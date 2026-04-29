import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { loadOnboardingSteps } from "@/lib/onboarding/loader"
import type { UserRole } from "@/lib/auth/rbac"

export default async function OnboardingPage() {
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role) notFound()

  const steps = await loadOnboardingSteps(role)

  return (
    <main>
      <header>
        <a href="/dashboard">← Dashboard</a>
        <h1>Ruta de onboarding</h1>
        <p>Rol: {role}</p>
      </header>

      {steps.length === 0 ? (
        <p>No hay pasos de onboarding configurados para tu rol aún.</p>
      ) : (
        <ol>
          {steps.map((step) => (
            <li key={step.slug}>
              <span>{step.step}.</span>
              <a href={`/onboarding/${step.slug}`}>{step.title}</a>
              {step.tags.length > 0 && (
                <span>{step.tags.join(", ")}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}
