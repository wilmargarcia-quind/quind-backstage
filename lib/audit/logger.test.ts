import { describe, it, expect, vi, beforeEach } from "vitest"

const mocks = vi.hoisted(() => ({
  insertValues: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/lib/db/client", () => ({
  db: {
    insert: () => ({ values: mocks.insertValues }),
  },
}))

import { logAccess, logAccessSilent } from "./logger"

beforeEach(() => {
  vi.resetAllMocks()
  mocks.insertValues.mockResolvedValue(undefined)
})

describe("logAccess", () => {
  it("inserts an access log entry", async () => {
    await logAccess("wilmargarcia-quind", "doc", "stack-tecnico")

    expect(mocks.insertValues).toHaveBeenCalledOnce()
    const [record] = mocks.insertValues.mock.calls[0]
    expect(record.github_login).toBe("wilmargarcia-quind")
    expect(record.resource_type).toBe("doc")
    expect(record.resource_slug).toBe("stack-tecnico")
    expect(record.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it("throws when db insert fails", async () => {
    mocks.insertValues.mockRejectedValue(new Error("DB error"))

    await expect(logAccess("user", "adr", "adr-001")).rejects.toThrow("DB error")
  })
})

describe("logAccessSilent", () => {
  it("calls logAccess without throwing on failure", async () => {
    mocks.insertValues.mockRejectedValue(new Error("DB unavailable"))

    expect(() => logAccessSilent("user", "okr", "okr-1")).not.toThrow()
    // wait for the promise to settle
    await new Promise((r) => setTimeout(r, 10))
  })

  it("inserts the entry on success", async () => {
    logAccessSilent("wilmargarcia-quind", "career", "ruta-dev-jr")
    await new Promise((r) => setTimeout(r, 10))

    expect(mocks.insertValues).toHaveBeenCalledOnce()
  })
})
