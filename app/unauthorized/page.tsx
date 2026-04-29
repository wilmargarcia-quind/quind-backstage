import { auth, signOut } from "@/auth"

export default async function UnauthorizedPage() {
  const session = await auth()

  return (
    <main>
      <h1>Acceso no autorizado</h1>
      {session?.user?.role === null ? (
        <p>
          Tu cuenta de GitHub no está asociada a ningún equipo de Quind con
          acceso a Backstage. Contacta a tu Tech Lead.
        </p>
      ) : (
        <p>No tienes permisos para acceder a esta sección.</p>
      )}
      <nav>
        <a href="/dashboard">Volver al inicio</a>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <button type="submit">Cerrar sesión</button>
        </form>
      </nav>
    </main>
  )
}
