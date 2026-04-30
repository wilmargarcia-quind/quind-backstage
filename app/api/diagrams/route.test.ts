import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

import { POST } from "./route"

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/diagrams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe("POST /api/diagrams", () => {
  it("proxies plantuml to Kroki and returns SVG", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => "<svg>diagram</svg>",
    })

    const res = await POST(makeRequest({ type: "plantuml", source: "@startuml\nA -> B\n@enduml" }))

    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toBe("image/svg+xml")
    expect(await res.text()).toBe("<svg>diagram</svg>")
  })

  it("calls Kroki with the correct URL and method", async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => "<svg/>" })

    await POST(makeRequest({ type: "graphviz", source: "digraph { A -> B }" }))

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/graphviz/svg"),
      expect.objectContaining({ method: "POST" })
    )
  })

  it("returns 400 for disallowed diagram type", async () => {
    const res = await POST(makeRequest({ type: "mermaid", source: "graph TD; A --> B" }))

    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("returns 400 when type is missing", async () => {
    const res = await POST(makeRequest({ source: "@startuml\n@enduml" }))

    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("returns 400 when source is missing", async () => {
    const res = await POST(makeRequest({ type: "plantuml" }))

    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest("http://localhost/api/diagrams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    })

    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it("forwards upstream error status from Kroki", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 422 })

    const res = await POST(makeRequest({ type: "plantuml", source: "invalid" }))

    expect(res.status).toBe(422)
  })

  it("returns 502 when Kroki is unreachable", async () => {
    mockFetch.mockRejectedValue(new Error("ECONNREFUSED"))

    const res = await POST(makeRequest({ type: "plantuml", source: "@startuml\n@enduml" }))

    expect(res.status).toBe(502)
  })
})
