import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { loadAllDocs } from "@/lib/docs/loader"
import { searchDocs } from "@/lib/search/engine"
import type { UserRole } from "@/lib/auth/rbac"

export async function GET(req: NextRequest) {
  const session = await auth()
  const role = session?.user?.role as UserRole | null
  if (!role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (!q) return NextResponse.json({ results: [] })

  const allDocs = await loadAllDocs()
  const accessible = allDocs.filter((doc) => doc.role_visibility.includes(role))
  const results = searchDocs(accessible, q)

  return NextResponse.json({ results })
}
