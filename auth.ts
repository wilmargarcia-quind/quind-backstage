import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"
import { mapTeamsToRole, getDevRole } from "@/lib/auth/rbac"
import { fetchUserTeams } from "@/lib/auth/github"

export const authConfig = {
  providers: [
    GitHub({
      authorization: {
        params: { scope: "read:user user:email read:org" },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        // Captura el GitHub username en el primer sign-in
        const githubLogin = (profile as { login?: string })?.login ?? ""
        token.githubLogin = githubLogin

        // Dev bypass: si el usuario está en DEV_ADMIN_USERS, asigna Gerencia sin consultar teams
        const devRole = getDevRole(githubLogin)
        if (devRole) {
          token.role = devRole
        } else {
          const teams = await fetchUserTeams(account.access_token)
          token.role = mapTeamsToRole(teams)
        }
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role ?? null
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
