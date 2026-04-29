import type { DefaultSession } from "next-auth"
import type { UserRole } from "@/lib/auth/rbac"

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole | null
    accessToken?: string
    githubLogin?: string
  }
}
