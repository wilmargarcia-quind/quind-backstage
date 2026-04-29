import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()
  const user = session!.user

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Bienvenido, {user.name}</p>
      <p>Rol: {user.role ?? "Sin rol asignado — contacta al administrador"}</p>
    </main>
  )
}
