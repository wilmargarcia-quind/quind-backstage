import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import crypto from "crypto"

const { mockRevalidatePath } = vi.hoisted(() => ({
  mockRevalidatePath: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}))

import { POST } from "./route"

const TEST_SECRET = "test-webhook-secret"

function sign(payload: string, secret = TEST_SECRET) {
  return `sha256=${crypto.createHmac("sha256", secret).update(payload, "utf-8").digest("hex")}`
}

function makeRequest(
  body: string,
  options: { sig?: string | null; event?: string } = {}
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-github-event": options.event ?? "push",
  }
  const sig = options.sig === undefined ? sign(body) : options.sig
  if (sig !== null) headers["x-hub-signature-256"] = sig

  return new NextRequest("http://localhost/api/webhook/github", {
    method: "POST",
    headers,
    body,
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  process.env.GITHUB_WEBHOOK_SECRET = TEST_SECRET
})

describe("POST /api/webhook/github", () => {
  it("revalidates all doc paths on valid push event", async () => {
    const res = await POST(makeRequest('{"ref":"refs/heads/main"}'))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.revalidated).toBe(true)
    expect(mockRevalidatePath).toHaveBeenCalledWith("/docs", "layout")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/adr", "layout")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/onboarding", "layout")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/career", "layout")
  })

  it("returns 401 for invalid signature", async () => {
    const res = await POST(makeRequest('{"ref":"refs/heads/main"}', { sig: "sha256=invalid" }))

    expect(res.status).toBe(401)
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it("returns 401 when signature header is absent", async () => {
    const res = await POST(makeRequest('{"ref":"refs/heads/main"}', { sig: null }))

    expect(res.status).toBe(401)
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it("returns 401 when payload is tampered", async () => {
    const goodSig = sign('{"ref":"refs/heads/main"}')
    const res = await POST(
      makeRequest('{"ref":"refs/heads/other"}', { sig: goodSig })
    )

    expect(res.status).toBe(401)
  })

  it("returns 500 when GITHUB_WEBHOOK_SECRET is not configured", async () => {
    delete process.env.GITHUB_WEBHOOK_SECRET

    const res = await POST(makeRequest('{"ref":"refs/heads/main"}'))

    expect(res.status).toBe(500)
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it("ignores non-push events without revalidating", async () => {
    const body = '{"action":"opened"}'
    const res = await POST(makeRequest(body, { event: "pull_request" }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.message).toContain("ignored")
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it("ignores ping event (first-time GitHub webhook setup)", async () => {
    const body = '{"zen":"Keep it logically awesome."}'
    const res = await POST(makeRequest(body, { event: "ping" }))

    expect(res.status).toBe(200)
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})
