import { describe, it, expect, vi, beforeEach } from "vitest"
import type { DocMetadata } from "@/lib/docs/types"

vi.mock("@/lib/docs/loader", () => ({
  loadDocsByCategoryAndRole: vi.fn(),
  loadDocBySlug: vi.fn(),
}))

import { loadDocsByCategoryAndRole, loadDocBySlug } from "@/lib/docs/loader"
import { loadCareerPaths, loadCareerPathBySlug } from "./loader"

const mockLoadDocs = vi.mocked(loadDocsByCategoryAndRole)
const mockLoadBySlug = vi.mocked(loadDocBySlug)

function makeCareerDoc(overrides: Partial<DocMetadata> = {}): DocMetadata {
  return {
    slug: "career-dev-jr",
    title: "Ruta Dev Jr",
    category: "career-path",
    tags: ["career"],
    role_visibility: ["Dev", "TL", "Coordinador", "Gerencia"],
    role_level: "Dev Jr",
    order: 1,
    ...overrides,
  }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe("loadCareerPaths", () => {
  it("returns career paths with valid role_level", async () => {
    mockLoadDocs.mockResolvedValue([
      makeCareerDoc({ slug: "career-dev-jr", role_level: "Dev Jr" }),
      makeCareerDoc({ slug: "career-dev-sr", role_level: "Dev Sr" }),
    ])

    const paths = await loadCareerPaths("Dev")

    expect(paths).toHaveLength(2)
    expect(paths[0].slug).toBe("career-dev-jr")
    expect(paths[1].slug).toBe("career-dev-sr")
  })

  it("discards docs with missing or invalid role_level", async () => {
    mockLoadDocs.mockResolvedValue([
      makeCareerDoc({ slug: "valid", role_level: "TL" }),
      makeCareerDoc({ slug: "no-level", role_level: undefined }),
      makeCareerDoc({ slug: "bad-level", role_level: "Principal" }),
    ])

    const paths = await loadCareerPaths("TL")

    expect(paths).toHaveLength(1)
    expect(paths[0].slug).toBe("valid")
  })

  it("returns empty array when no docs match", async () => {
    mockLoadDocs.mockResolvedValue([])

    const paths = await loadCareerPaths("Dev")

    expect(paths).toEqual([])
  })

  it("calls loadDocsByCategoryAndRole with 'career-path' category", async () => {
    mockLoadDocs.mockResolvedValue([])

    await loadCareerPaths("Coordinador")

    expect(mockLoadDocs).toHaveBeenCalledWith("career-path", "Coordinador")
  })

  it("maps role_level correctly for all valid values", async () => {
    mockLoadDocs.mockResolvedValue([
      makeCareerDoc({ slug: "cp-dev-jr", role_level: "Dev Jr" }),
      makeCareerDoc({ slug: "cp-dev-sr", role_level: "Dev Sr" }),
      makeCareerDoc({ slug: "cp-tl", role_level: "TL" }),
      makeCareerDoc({ slug: "cp-coord", role_level: "Coordinador" }),
    ])

    const paths = await loadCareerPaths("Gerencia")

    expect(paths.map((p) => p.role_level)).toEqual(["Dev Jr", "Dev Sr", "TL", "Coordinador"])
  })
})

describe("loadCareerPathBySlug", () => {
  it("returns CareerPathDoc when slug exists and role has access", async () => {
    mockLoadBySlug.mockResolvedValue({
      ...makeCareerDoc({ slug: "career-dev-jr", role_level: "Dev Jr" }),
      content: "# Ruta Dev Jr\nMilestones...",
    })

    const cp = await loadCareerPathBySlug("career-dev-jr", "Dev")

    expect(cp).not.toBeNull()
    expect(cp?.slug).toBe("career-dev-jr")
    expect(cp?.role_level).toBe("Dev Jr")
    expect(cp?.content).toContain("Dev Jr")
  })

  it("returns null when loadDocBySlug returns null", async () => {
    mockLoadBySlug.mockResolvedValue(null)

    const cp = await loadCareerPathBySlug("non-existent", "Dev")

    expect(cp).toBeNull()
  })

  it("returns null when doc has invalid role_level", async () => {
    mockLoadBySlug.mockResolvedValue({
      ...makeCareerDoc({ role_level: "Staff" }),
      content: "contenido",
    })

    const cp = await loadCareerPathBySlug("career-dev-jr", "Dev")

    expect(cp).toBeNull()
  })

  it("returns null when doc is missing role_level", async () => {
    mockLoadBySlug.mockResolvedValue({
      ...makeCareerDoc({ role_level: undefined }),
      content: "contenido",
    })

    const cp = await loadCareerPathBySlug("career-dev-jr", "Dev")

    expect(cp).toBeNull()
  })
})
