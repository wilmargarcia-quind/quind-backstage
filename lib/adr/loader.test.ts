import { describe, it, expect, vi, beforeEach } from "vitest"
import type { DocMetadata } from "@/lib/docs/types"

vi.mock("@/lib/docs/loader", () => ({
  loadDocsByCategoryAndRole: vi.fn(),
  loadDocBySlug: vi.fn(),
}))

import { loadDocsByCategoryAndRole, loadDocBySlug } from "@/lib/docs/loader"
import { loadAdrList, loadAdrBySlug } from "./loader"

const mockLoadDocs = vi.mocked(loadDocsByCategoryAndRole)
const mockLoadBySlug = vi.mocked(loadDocBySlug)

function makeAdrDoc(overrides: Partial<DocMetadata> = {}): DocMetadata {
  return {
    slug: "adr-001",
    title: "ADR-001 Baseline Stack",
    category: "adr",
    tags: ["architecture"],
    role_visibility: ["Dev", "TL", "Coordinador", "Gerencia"],
    status: "Accepted",
    authors: ["wilmargarcia-quind"],
    decision_date: "2026-01-15",
    ...overrides,
  }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe("loadAdrList", () => {
  it("returns ADRs sorted by decision_date descending", async () => {
    mockLoadDocs.mockResolvedValue([
      makeAdrDoc({ slug: "adr-001", decision_date: "2026-01-15" }),
      makeAdrDoc({ slug: "adr-003", decision_date: "2026-03-10" }),
      makeAdrDoc({ slug: "adr-002", decision_date: "2026-02-20" }),
    ])

    const adrs = await loadAdrList("Dev")

    expect(adrs.map((a) => a.slug)).toEqual(["adr-003", "adr-002", "adr-001"])
  })

  it("filters by status when statusFilter is provided", async () => {
    mockLoadDocs.mockResolvedValue([
      makeAdrDoc({ slug: "adr-001", status: "Accepted" }),
      makeAdrDoc({ slug: "adr-002", status: "Deprecated" }),
      makeAdrDoc({ slug: "adr-003", status: "Proposed" }),
    ])

    const adrs = await loadAdrList("Dev", "Accepted")

    expect(adrs).toHaveLength(1)
    expect(adrs[0].slug).toBe("adr-001")
  })

  it("returns all ADRs when no statusFilter is given", async () => {
    mockLoadDocs.mockResolvedValue([
      makeAdrDoc({ slug: "adr-001", status: "Accepted" }),
      makeAdrDoc({ slug: "adr-002", status: "Deprecated" }),
    ])

    const adrs = await loadAdrList("TL")

    expect(adrs).toHaveLength(2)
  })

  it("discards docs with missing or invalid status", async () => {
    mockLoadDocs.mockResolvedValue([
      makeAdrDoc({ slug: "valid", status: "Accepted" }),
      makeAdrDoc({ slug: "no-status", status: undefined }),
      makeAdrDoc({ slug: "bad-status", status: "Unknown" }),
    ])

    const adrs = await loadAdrList("Dev")

    expect(adrs).toHaveLength(1)
    expect(adrs[0].slug).toBe("valid")
  })

  it("calls loadDocsByCategoryAndRole with 'adr' category", async () => {
    mockLoadDocs.mockResolvedValue([])

    await loadAdrList("Coordinador")

    expect(mockLoadDocs).toHaveBeenCalledWith("adr", "Coordinador")
  })

  it("defaults authors to empty array when not present", async () => {
    mockLoadDocs.mockResolvedValue([
      makeAdrDoc({ authors: undefined }),
    ])

    const adrs = await loadAdrList("Dev")

    expect(adrs[0].authors).toEqual([])
  })
})

describe("loadAdrBySlug", () => {
  it("returns AdrDoc when slug exists and role has access", async () => {
    mockLoadBySlug.mockResolvedValue({
      ...makeAdrDoc({ slug: "adr-001" }),
      content: "# ADR-001\nDecisión tomada.",
    })

    const adr = await loadAdrBySlug("adr-001", "Dev")

    expect(adr).not.toBeNull()
    expect(adr?.slug).toBe("adr-001")
    expect(adr?.content).toContain("ADR-001")
    expect(adr?.status).toBe("Accepted")
  })

  it("returns null when loadDocBySlug returns null", async () => {
    mockLoadBySlug.mockResolvedValue(null)

    const adr = await loadAdrBySlug("non-existent", "Dev")

    expect(adr).toBeNull()
  })

  it("returns null when doc has invalid status", async () => {
    mockLoadBySlug.mockResolvedValue({
      ...makeAdrDoc({ status: "InvalidStatus" }),
      content: "contenido",
    })

    const adr = await loadAdrBySlug("adr-001", "Dev")

    expect(adr).toBeNull()
  })
})
