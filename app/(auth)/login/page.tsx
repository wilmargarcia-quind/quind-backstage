import { redirect } from "next/navigation"
import { auth, signIn } from "@/auth"

interface LoginPageProps {
  searchParams: { error?: string; callbackUrl?: string }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()

  if (session) {
    redirect(searchParams.callbackUrl ?? "/dashboard")
  }

  return (
    <main>
      <h1>Quind Backstage</h1>
      {searchParams.error === "AccessDenied" && (
        <p>
          No tienes acceso a esta plataforma. Asegúrate de pertenecer a la
          organización Quind en GitHub.
        </p>
      )}
      <form
        action={async () => {
          "use server"
          await signIn("github", {
            redirectTo: searchParams.callbackUrl ?? "/dashboard",
          })
        }}
      >
        <button type="submit">Iniciar sesión con GitHub</button>
      </form>
    </main>
  )
}
