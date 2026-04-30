import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()
  const user = session!.user

  const role = user.role

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Bienvenido, {user.name}</p>
      <p>Rol: {role ?? "Sin rol asignado — contacta al administrador"}</p>

      <nav>
        <ul>
          <li><a href="/search">Búsqueda</a></li>
          <li><a href="/docs">Documentación</a></li>
          <li><a href="/onboarding">Onboarding</a></li>
          <li><a href="/adr">ADRs</a></li>
          <li><a href="/career">Rutas de carrera</a></li>
          {role && role !== "Dev" && (
            <li><a href="/okr/panel">Panel OKRs</a></li>
          )}
        </ul>
      </nav>
    </main>
  )
}
