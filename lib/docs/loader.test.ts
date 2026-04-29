import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Dirent } from "fs"

vi.mock("fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}))

import { readdir, readFile } from "fs/promises"
import { loadAllDocs, loadDocsByRole, loadDocBySlug } from "./loader"

const mockReaddir = vi.mocked(readdir)
const mockReadFile = vi.mocked(readFile)

function makeDirent(name: string, isDir = false): Dirent {
  return {
    name,
    isDirectory: () => isDir,
    isFile: () => !isDir,
  } as unknown as Dirent
}

const devDoc = `---
slug: dev-guide
title: Guía de Desarrollo
category: guide
tags: [dev]
role_visibility: [Dev, TL, Coordinador, Gerencia]
---
# Guía de Desarrollo
Contenido para todos.`

const tlDoc = `---
slug: tl-okr-guide
title: Guía OKRs para TL
category: okr
tags: [tl, okr]
role_visibility: [TL, Coordinador, Gerencia]
---
# Guía OKRs
Solo para TL y superiores.`

const gerenciaDoc = `---
slug: gerencia-strategy
title: Estrategia Gerencia
category: strategy
tags: [gerencia]
role_visibility: [Gerencia]
---
# Estrategia
Solo para Gerencia.`

const malformedDoc = `---
title: Sin Slug
---
Contenido sin slug.`

const noFrontmatterDoc = `# Sin frontmatter
Solo contenido.`

beforeEach(() => {
  vi.resetAllMocks()
})

describe("loadAllDocs", () => {
  it("returns all valid docs from the filesystem", async () => {
    mockReaddir.mockResolvedValue([
      makeDirent("dev-guide.md"),
      makeDirent("tl-okr-guide.md"),
    ] as unknown as Awaited<ReturnType<typeof readdir>>)

    mockReadFile
      .mockResolvedValueOnce(devDoc as unknown as Buffer)
      .mockResolvedValueOnce(tlDoc as unknown as Buffer)

    const docs = await loadAllDocs()
    expect(docs).toHaveLength(2)
    expect(docs.map((d) => d.slug)).toEqual(
      expect.arrayContaining(["dev-guide", "tl-okr-guide"])
    )
  })

  it("returns empty array when docs directory does not exist", async () => {
    mockReaddir.mockRejectedValue(new Error("ENOENT"))
    const docs = await loadAllDocs()
    expect(docs).toEqual([])
  })

  it("skips docs with missing slug or title", async () => {
    mockReaddir.mockResolvedValue([
      makeDirent("malformed.md"),
    ] as unknown as Awaited<ReturnType<typeof readdir>>)
    mockReadFile.mockResolvedValueOnce(malformedDoc as unknown as Buffer)

    const docs = await loadAllDocs()
    expect(docs).toHaveLength(0)
  })

  it("skips docs without frontmatter", async () => {
    mockReaddir.mockResolvedValue([
      makeDirent("no-fm.md"),
    ] as unknown as Awaited<ReturnType<typeof readdir>>)
    mockReadFile.mockResolvedValueOnce(noFrontmatterDoc as unknown as Buffer)

    const docs = await loadAllDocs()
    expect(docs).toHaveLength(0)
  })

  it("defaults role_visibility to all roles when not specified", async () => {
    const docWithoutVisibility = `---
slug: open-doc
title: Documento Abierto
category: general
---
Contenido.`
    mockReaddir.mockResolvedValue([
      makeDirent("open.md"),
    ] as unknown as Awaited<ReturnType<typeof readdir>>)
    mockReadFile.mockResolvedValueOnce(docWithoutVisibility as unknown as Buffer)

    const docs = await loadAllDocs()
    expect(docs[0]?.role_visibility).toEqual([
      "Dev",
      "TL",
      "Coordinador",
      "Gerencia",
    ])
  })
})

describe("loadDocsByRole", () => {
  beforeEach(() => {
    mockReaddir.mockResolvedValue([
      makeDirent("dev-guide.md"),
      makeDirent("tl-okr-guide.md"),
      makeDirent("gerencia-strategy.md"),
    ] as unknown as Awaited<ReturnType<typeof readdir>>)
    mockReadFile
      .mockResolvedValueOnce(devDoc as unknown as Buffer)
      .mockResolvedValueOnce(tlDoc as unknown as Buffer)
      .mockResolvedValueOnce(gerenciaDoc as unknown as Buffer)
  })

  it("returns all docs visible to Dev role", async () => {
    const docs = await loadDocsByRole("Dev")
    expect(docs.map((d) => d.slug)).toEqual(["dev-guide"])
  })

  it("returns docs visible to TL role", async () => {
    const docs = await loadDocsByRole("TL")
    expect(docs.map((d) => d.slug)).toEqual(
      expect.arrayContaining(["dev-guide", "tl-okr-guide"])
    )
  })

  it("returns all docs for Gerencia role", async () => {
    const docs = await loadDocsByRole("Gerencia")
    expect(docs).toHaveLength(3)
  })

  it("does not expose content field in metadata", async () => {
    const docs = await loadDocsByRole("Dev")
    expect(docs[0]).not.toHaveProperty("content")
  })
})

describe("loadDocBySlug", () => {
  beforeEach(() => {
    mockReaddir.mockResolvedValue([
      makeDirent("dev-guide.md"),
      makeDirent("tl-okr-guide.md"),
    ] as unknown as Awaited<ReturnType<typeof readdir>>)
    mockReadFile
      .mockResolvedValueOnce(devDoc as unknown as Buffer)
      .mockResolvedValueOnce(tlDoc as unknown as Buffer)
  })

  it("returns doc when role has access", async () => {
    const doc = await loadDocBySlug("dev-guide", "Dev")
    expect(doc).not.toBeNull()
    expect(doc?.slug).toBe("dev-guide")
    expect(doc?.content).toContain("Guía de Desarrollo")
  })

  it("returns null when role does not have access", async () => {
    const doc = await loadDocBySlug("tl-okr-guide", "Dev")
    expect(doc).toBeNull()
  })

  it("returns null when slug does not exist", async () => {
    const doc = await loadDocBySlug("non-existent", "Gerencia")
    expect(doc).toBeNull()
  })

  it("returns doc for TL accessing tl-only content", async () => {
    const doc = await loadDocBySlug("tl-okr-guide", "TL")
    expect(doc).not.toBeNull()
    expect(doc?.slug).toBe("tl-okr-guide")
  })
})
