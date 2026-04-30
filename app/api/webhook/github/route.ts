import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

const DOC_PATHS = ["/docs", "/adr", "/onboarding", "/career"]

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(payload, "utf-8")
    .digest("hex")}`
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const payload = await req.text()
  const signature = req.headers.get("x-hub-signature-256")

  if (!verifySignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = req.headers.get("x-github-event")
  if (event !== "push") {
    return NextResponse.json({ message: `Event '${event}' ignored` })
  }

  for (const path of DOC_PATHS) {
    revalidatePath(path, "layout")
  }

  return NextResponse.json({ revalidated: true, paths: DOC_PATHS })
}
