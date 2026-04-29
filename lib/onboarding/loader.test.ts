import { describe, it, expect, vi, beforeEach } from "vitest"
import type { DocMetadata } from "@/lib/docs/types"

vi.mock("@/lib/docs/loader", () => ({
  loadDocsByCategoryAndRole: vi.fn(),
}))

import { loadDocsByCategoryAndRole } from "@/lib/docs/loader"
import { loadOnboardingSteps } from "./loader"

const mockLoadDocs = vi.mocked(loadDocsByCategoryAndRole)

function makeDoc(overrides: Partial<DocMetadata> = {}): DocMetadata {
  return {
    slug: "step-1",
    title: "Paso 1",
    category: "onboarding",
    tags: [],
    role_visibility: ["Dev"],
    ...overrides,
  }
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe("loadOnboardingSteps", () => {
  it("returns steps with sequential step numbers when order is undefined", async () => {
    mockLoadDocs.mockResolvedValue([
      makeDoc({ slug: "intro", title: "Introducción" }),
      makeDoc({ slug: "setup", title: "Configuración" }),
      makeDoc({ slug: "first-pr", title: "Primera PR" }),
    ])

    const steps = await loadOnboardingSteps("Dev")

    expect(steps).toHaveLength(3)
    expect(steps[0].step).toBe(1)
    expect(steps[1].step).toBe(2)
    expect(steps[2].step).toBe(3)
  })

  it("uses doc order field as step number when present", async () => {
    mockLoadDocs.mockResolvedValue([
      makeDoc({ slug: "step-a", order: 5 }),
      makeDoc({ slug: "step-b", order: 10 }),
    ])

    const steps = await loadOnboardingSteps("Dev")

    expect(steps[0].step).toBe(5)
    expect(steps[1].step).toBe(10)
  })

  it("calls loadDocsByCategoryAndRole with 'onboarding' category and given role", async () => {
    mockLoadDocs.mockResolvedValue([])

    await loadOnboardingSteps("TL")

    expect(mockLoadDocs).toHaveBeenCalledWith("onboarding", "TL")
  })

  it("returns empty array when no onboarding docs exist for the role", async () => {
    mockLoadDocs.mockResolvedValue([])

    const steps = await loadOnboardingSteps("Gerencia")

    expect(steps).toEqual([])
  })

  it("propagates slug and title from the original doc", async () => {
    mockLoadDocs.mockResolvedValue([
      makeDoc({ slug: "bienvenida", title: "Bienvenida a Quind" }),
    ])

    const steps = await loadOnboardingSteps("Dev")

    expect(steps[0].slug).toBe("bienvenida")
    expect(steps[0].title).toBe("Bienvenida a Quind")
  })
})
