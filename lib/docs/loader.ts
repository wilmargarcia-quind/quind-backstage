import { readdir, readFile } from "fs/promises"
import { join } from "path"
import matter from "gray-matter"
import type { Doc, DocMetadata } from "./types"
import type { UserRole } from "@/lib/auth/rbac"

const ALL_ROLES: UserRole[] = ["Dev", "TL", "Coordinador", "Gerencia"]

const DOCS_PATH =
  process.env.DOCS_PATH ?? join(process.cwd(), "quind-architecture-docs")

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    const results: string[] = []
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...(await collectMarkdownFiles(fullPath)))
      } else if (/\.mdx?$/.test(entry.name)) {
        results.push(fullPath)
      }
    }
    return results
  } catch {
    return []
  }
}

async function parseDocFile(filePath: string): Promise<Doc | null> {
  try {
    const raw = await readFile(filePath, "utf-8")
    const { data, content } = matter(raw)

    if (!data.slug || !data.title) return null

    return {
      slug: String(data.slug),
      title: String(data.title),
      category: String(data.category ?? "general"),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      role_visibility: Array.isArray(data.role_visibility)
        ? (data.role_visibility as UserRole[])
        : ALL_ROLES,
      content,
    }
  } catch {
    return null
  }
}

export async function loadAllDocs(): Promise<Doc[]> {
  const files = await collectMarkdownFiles(DOCS_PATH)
  const docs = await Promise.all(files.map(parseDocFile))
  return docs.filter((doc): doc is Doc => doc !== null)
}

export async function loadDocsByRole(role: UserRole): Promise<DocMetadata[]> {
  const docs = await loadAllDocs()
  return docs
    .filter((doc) => doc.role_visibility.includes(role))
    .map(({ content: _content, ...metadata }) => metadata)
}

export async function loadDocBySlug(
  slug: string,
  role: UserRole
): Promise<Doc | null> {
  const docs = await loadAllDocs()
  const doc = docs.find((d) => d.slug === slug) ?? null
  if (!doc || !doc.role_visibility.includes(role)) return null
  return doc
}
