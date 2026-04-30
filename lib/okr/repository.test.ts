import { describe, it, expect, vi, beforeEach } from "vitest"

const mocks = vi.hoisted(() => {
  const findMany = vi.fn()
  const findFirst = vi.fn()
  const insertValues = vi.fn().mockResolvedValue(undefined)
  const updateSetWhere = vi.fn().mockResolvedValue(undefined)
  const deleteWhere = vi.fn().mockResolvedValue(undefined)
  return { findMany, findFirst, insertValues, updateSetWhere, deleteWhere }
})

vi.mock("@/lib/db/client", () => ({
  db: {
    query: {
      okrs: {
        findMany: mocks.findMany,
        findFirst: mocks.findFirst,
      },
    },
    insert: () => ({ values: mocks.insertValues }),
    update: () => ({ set: () => ({ where: mocks.updateSetWhere }) }),
    delete: () => ({ where: mocks.deleteWhere }),
  },
}))

import {
  findAllOkrs,
  findOkrById,
  createOkr,
  updateKrProgress,
  deleteOkr,
} from "./repository"

function makeOkrRow(overrides = {}) {
  return {
    id: "okr-1",
    period: "Q2-2026",
    coe_id: "plataforma",
    objective: "Aumentar cobertura de tests",
    created_at: new Date("2026-04-01"),
    updated_at: new Date("2026-04-01"),
    keyResults: [],
    ...overrides,
  }
}

function makeKrRow(overrides = {}) {
  return {
    id: "kr-1",
    okr_id: "okr-1",
    description: "Cubrir módulo auth",
    kpi: "% cobertura",
    baseline: 60,
    target: 80,
    current_value: 60,
    responsible: "wilmargarcia-quind",
    due_date: "2026-06-30",
    progress: 0,
    ...overrides,
  }
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.insertValues.mockResolvedValue(undefined)
  mocks.updateSetWhere.mockResolvedValue(undefined)
  mocks.deleteWhere.mockResolvedValue(undefined)
})

describe("findAllOkrs", () => {
  it("returns OKRs with avg_progress 0 when no KRs", async () => {
    mocks.findMany.mockResolvedValue([makeOkrRow()])

    const result = await findAllOkrs("Gerencia", null)

    expect(result).toHaveLength(1)
    expect(result[0].avg_progress).toBe(0)
    expect(result[0].key_results).toEqual([])
  })

  it("calculates avg_progress from KR progress values", async () => {
    mocks.findMany.mockResolvedValue([
      makeOkrRow({
        keyResults: [makeKrRow({ progress: 25 }), makeKrRow({ id: "kr-2", progress: 75 })],
      }),
    ])

    const result = await findAllOkrs("Coordinador", null)

    expect(result[0].avg_progress).toBe(50)
  })

  it("returns empty array when no OKRs exist", async () => {
    mocks.findMany.mockResolvedValue([])

    const result = await findAllOkrs("TL", null)

    expect(result).toEqual([])
  })

  it("calls findMany for Gerencia (no coe filter)", async () => {
    mocks.findMany.mockResolvedValue([])

    await findAllOkrs("Gerencia", null)

    expect(mocks.findMany).toHaveBeenCalledOnce()
  })

  it("calls findMany for TL with null coeId (dev mode — no filter)", async () => {
    mocks.findMany.mockResolvedValue([])

    await findAllOkrs("TL", null)

    expect(mocks.findMany).toHaveBeenCalledOnce()
  })
})

describe("findOkrById", () => {
  it("returns OKR when found and accessible", async () => {
    mocks.findFirst.mockResolvedValue(makeOkrRow({ keyResults: [makeKrRow()] }))

    const result = await findOkrById("okr-1", "Gerencia", null)

    expect(result).not.toBeNull()
    expect(result?.id).toBe("okr-1")
    expect(result?.key_results).toHaveLength(1)
  })

  it("returns null when not found", async () => {
    mocks.findFirst.mockResolvedValue(undefined)

    const result = await findOkrById("nonexistent", "Gerencia", null)

    expect(result).toBeNull()
  })

  it("returns null when TL coeId doesn't match okr coe_id", async () => {
    mocks.findFirst.mockResolvedValue(makeOkrRow({ coe_id: "datos" }))

    const result = await findOkrById("okr-1", "TL", "plataforma")

    expect(result).toBeNull()
  })

  it("returns OKR when TL coeId matches", async () => {
    mocks.findFirst.mockResolvedValue(makeOkrRow({ coe_id: "plataforma" }))

    const result = await findOkrById("okr-1", "TL", "plataforma")

    expect(result).not.toBeNull()
  })
})

describe("createOkr", () => {
  const validInput = {
    period: "Q2-2026",
    coe_id: "plataforma",
    objective: "Mejorar cobertura",
    key_results: [
      {
        description: "Cubrir auth",
        kpi: "% cobertura",
        baseline: 60,
        target: 80,
        responsible: "wilmargarcia-quind",
        due_date: "2026-06-30",
      },
    ],
  }

  it("creates OKR and returns it with key_results", async () => {
    const result = await createOkr(validInput, "Coordinador")

    expect(result.period).toBe("Q2-2026")
    expect(result.key_results).toHaveLength(1)
    expect(result.avg_progress).toBe(0)
    expect(mocks.insertValues).toHaveBeenCalledTimes(2)
  })

  it("throws Forbidden for Dev role", async () => {
    await expect(createOkr(validInput, "Dev")).rejects.toThrow("Forbidden")
  })

  it("throws Forbidden for TL role", async () => {
    await expect(createOkr(validInput, "TL")).rejects.toThrow("Forbidden")
  })

  it("throws when no key_results provided", async () => {
    await expect(
      createOkr({ ...validInput, key_results: [] }, "Gerencia")
    ).rejects.toThrow("At least one key result is required")
  })

  it("sets current_value equal to baseline on creation", async () => {
    const result = await createOkr(validInput, "Gerencia")

    expect(result.key_results[0].current_value).toBe(60)
    expect(result.key_results[0].progress).toBe(0)
  })
})

describe("updateKrProgress", () => {
  it("updates progress for TL role", async () => {
    await expect(
      updateKrProgress("kr-1", { progress: 50, current_value: 70 }, "TL")
    ).resolves.toBeUndefined()

    expect(mocks.updateSetWhere).toHaveBeenCalledOnce()
  })

  it("throws Forbidden for Dev role", async () => {
    await expect(
      updateKrProgress("kr-1", { progress: 25, current_value: 65 }, "Dev")
    ).rejects.toThrow("Forbidden")
  })
})

describe("deleteOkr", () => {
  it("deletes OKR for Coordinador", async () => {
    await expect(deleteOkr("okr-1", "Coordinador")).resolves.toBeUndefined()

    expect(mocks.deleteWhere).toHaveBeenCalledOnce()
  })

  it("throws Forbidden for TL role", async () => {
    await expect(deleteOkr("okr-1", "TL")).rejects.toThrow("Forbidden")
  })

  it("throws Forbidden for Dev role", async () => {
    await expect(deleteOkr("okr-1", "Dev")).rejects.toThrow("Forbidden")
  })
})
