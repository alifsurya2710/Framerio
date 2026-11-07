import { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { AUTH_SECRET } from './authSecret'

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 hari (memastikan cookie persisten di mobile browser & PWA)
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
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
    async jwt({ token, user, trigger, session }) {
      // Saat user edit profil sendiri, sinkronkan nama & email di token
      // (dikirim lewat useSession().update() dari halaman akun).
      if (trigger === 'update' && session) {
        token.name = (session as any).name ?? token.name
        token.email = (session as any).email ?? token.email
      }
      if (user) token.role = (user as any).role
      // Hanya query DB jika token belum punya role (mis. token lama dari sebelum upgrade).
      // Ini mencegah 1 query DB setiap request yang bisa menguras connection pool.
      if (token.role === undefined && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        })
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
