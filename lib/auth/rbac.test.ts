import { describe, it, expect, beforeEach } from "vitest"
import { mapTeamsToRole, canAccessRoute } from "./rbac"

describe("mapTeamsToRole", () => {
  beforeEach(() => {
    process.env.GITHUB_ORG = "quind"
  })

  it("assigns Dev role for dev team", () => {
    expect(mapTeamsToRole(["quind/dev"])).toBe("Dev")
  })

  it("assigns TL role for tech-leads team", () => {
    expect(mapTeamsToRole(["quind/tech-leads"])).toBe("TL")
  })

  it("assigns Coordinador role for coordinadores team", () => {
    expect(mapTeamsToRole(["quind/coordinadores"])).toBe("Coordinador")
  })

  it("assigns Gerencia role for gerencia team", () => {
    expect(mapTeamsToRole(["quind/gerencia"])).toBe("Gerencia")
  })

  it("returns null when teams list is empty", () => {
    expect(mapTeamsToRole([])).toBeNull()
  })

  it("returns null when no team matches a known role", () => {
    expect(mapTeamsToRole(["quind/unknown", "other-org/dev"])).toBeNull()
  })

  it("prioritizes Gerencia over all other roles", () => {
    expect(mapTeamsToRole(["quind/dev", "quind/gerencia"])).toBe("Gerencia")
    expect(
      mapTeamsToRole(["quind/tech-leads", "quind/coordinadores", "quind/gerencia"])
    ).toBe("Gerencia")
  })

  it("prioritizes Coordinador over TL and Dev", () => {
    expect(
      mapTeamsToRole(["quind/dev", "quind/tech-leads", "quind/coordinadores"])
    ).toBe("Coordinador")
  })

  it("prioritizes TL over Dev", () => {
    expect(mapTeamsToRole(["quind/dev", "quind/tech-leads"])).toBe("TL")
  })

  it("ignores teams from other organizations", () => {
    expect(mapTeamsToRole(["other-org/dev", "external/gerencia"])).toBeNull()
  })
})

describe("canAccessRoute", () => {
  it("denies access when role is null", () => {
    expect(canAccessRoute(null, "/docs")).toBe(false)
    expect(canAccessRoute(null, "/okr")).toBe(false)
    expect(canAccessRoute(null, "/dashboard")).toBe(false)
  })

  it("denies access when role is undefined", () => {
    expect(canAccessRoute(undefined, "/docs")).toBe(false)
  })

  it("allows Dev to access docs", () => {
    expect(canAccessRoute("Dev", "/docs")).toBe(true)
  })

  it("allows Dev to access dashboard", () => {
    expect(canAccessRoute("Dev", "/dashboard")).toBe(true)
  })

  it("denies Dev access to /okr routes", () => {
    expect(canAccessRoute("Dev", "/okr")).toBe(false)
    expect(canAccessRoute("Dev", "/okr/q2-2026")).toBe(false)
  })

  it("allows TL to access /okr routes", () => {
    expect(canAccessRoute("TL", "/okr")).toBe(true)
    expect(canAccessRoute("TL", "/okr/q2-2026")).toBe(true)
  })

  it("allows Coordinador to access /okr routes", () => {
    expect(canAccessRoute("Coordinador", "/okr")).toBe(true)
  })

  it("allows Gerencia to access /okr routes", () => {
    expect(canAccessRoute("Gerencia", "/okr")).toBe(true)
  })

  it("allows all roles to access non-restricted routes", () => {
    const roles = ["Dev", "TL", "Coordinador", "Gerencia"] as const
    for (const role of roles) {
      expect(canAccessRoute(role, "/dashboard")).toBe(true)
      expect(canAccessRoute(role, "/docs")).toBe(true)
      expect(canAccessRoute(role, "/adr")).toBe(true)
      expect(canAccessRoute(role, "/career")).toBe(true)
    }
  })
})
