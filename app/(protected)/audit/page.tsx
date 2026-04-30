import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db/client"
import { accessLogs } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import type { UserRole } from "@/lib/auth/rbac"

const PAGE_SIZE = 50

export default async function AuditPage() {
  const session = await auth()
  const role = session?.user?.role as UserRole | null

  if (!role || (role !== "Coordinador" && role !== "Gerencia")) notFound()

  const logs = await db
    .select()
    .from(accessLogs)
    .orderBy(desc(accessLogs.accessed_at))
    .limit(PAGE_SIZE)

  return (
    <main>
      <header>
        <a href="/dashboard">← Dashboard</a>
        <h1>Audit log de accesos</h1>
        <p>Últimos {PAGE_SIZE} eventos</p>
      </header>

      {logs.length === 0 ? (
        <p>Sin eventos registrados aún.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Tipo</th>
              <th>Recurso</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.github_login}</td>
                <td>{log.resource_type}</td>
                <td>{log.resource_slug}</td>
                <td>{log.accessed_at.toISOString().replace("T", " ").slice(0, 19)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
