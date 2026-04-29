import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { canAccessRoute } from "@/lib/auth/rbac"

const PUBLIC_PATHS = ["/login", "/unauthorized"]

export default auth((req) => {
  const session = req.auth
  const { pathname, origin } = req.nextUrl

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isApiAuthPath = pathname.startsWith("/api/auth")

  if (!session && !isPublicPath && !isApiAuthPath) {
    const loginUrl = new URL("/login", origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", origin))
  }

  if (session && !isPublicPath && !isApiAuthPath) {
    if (!canAccessRoute(session.user.role, pathname)) {
      return NextResponse.redirect(new URL("/unauthorized", origin))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico)$).*)",
  ],
}
