import { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'framerio-secret-fallback-key-2026',
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { identifier: {}, password: {} },
      async authorize(creds) {
        // Mendukung input 'identifier' (bisa berupa username atau email)
        const loginInput = ((creds as any)?.identifier || (creds as any)?.email)?.trim()
        const password = creds?.password
        if (!loginInput || !password) return null

        // Cari berdasarkan Email ATAU Name/Username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: loginInput, mode: 'insensitive' } },
              { name: { equals: loginInput, mode: 'insensitive' } }
            ]
          }
        })
        if (!user) return null

        const ok = await bcrypt.compare(password as string, user.password)
        if (!ok) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.sub } })
        if (dbUser) token.role = dbUser.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
      }
      return session
    }
  }
}
