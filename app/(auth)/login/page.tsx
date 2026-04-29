import { redirect } from "next/navigation"
import { auth, signIn } from "@/auth"

interface LoginPageProps {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()
  const { error, callbackUrl } = await searchParams

  if (session) {
    redirect(callbackUrl ?? "/dashboard")
  }

  return (
    <main>
      <h1>Quind Backstage</h1>
      {error === "AccessDenied" && (
        <p>
          No tienes acceso a esta plataforma. Asegúrate de pertenecer a la
          organización Quind en GitHub.
        </p>
      )}
      <form
        action={async () => {
          "use server"
          await signIn("github", {
            redirectTo: callbackUrl ?? "/dashboard",
          })
        }}
      >
        <button type="submit">Iniciar sesión con GitHub</button>
      </form>
    </main>
  )
}
