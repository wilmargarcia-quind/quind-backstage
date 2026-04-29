export type UserRole = "Dev" | "TL" | "Coordinador" | "Gerencia"

const GITHUB_ORG = process.env.GITHUB_ORG ?? "quind"

const TEAM_ROLE_MAP: Record<string, UserRole> = {
  [`${GITHUB_ORG}/dev`]: "Dev",
  [`${GITHUB_ORG}/tech-leads`]: "TL",
  [`${GITHUB_ORG}/coordinadores`]: "Coordinador",
  [`${GITHUB_ORG}/gerencia`]: "Gerencia",
}

const ROLE_PRIORITY: UserRole[] = ["Gerencia", "Coordinador", "TL", "Dev"]

const RESTRICTED_ROUTES: { pattern: string; allowedRoles: UserRole[] }[] = [
  { pattern: "/okr", allowedRoles: ["TL", "Coordinador", "Gerencia"] },
]

// Dev-only: usuarios con acceso Gerencia sin necesitar GitHub Teams
// Solo activo cuando NODE_ENV=development
const DEV_ADMIN_USERS = ["wilmargarcia-quind"]

export function getDevRole(githubUsername: string): UserRole | null {
  if (process.env.NODE_ENV !== "development") return null
  return DEV_ADMIN_USERS.includes(githubUsername) ? "Gerencia" : null
}

export function mapTeamsToRole(teams: string[]): UserRole | null {
  const assignedRoles = teams
    .map((team) => TEAM_ROLE_MAP[team])
    .filter((role): role is UserRole => role !== undefined)

  for (const role of ROLE_PRIORITY) {
    if (assignedRoles.includes(role)) {
      return role
    }
  }

  return null
}

export function canAccessRoute(
  role: UserRole | null | undefined,
  pathname: string
): boolean {
  if (!role) return false

  for (const { pattern, allowedRoles } of RESTRICTED_ROUTES) {
    if (pathname.startsWith(pattern)) {
      return allowedRoles.includes(role)
    }
  }

  return true
}
