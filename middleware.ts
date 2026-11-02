import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// SAMA persis dengan lib/auth.ts: middleware (Edge runtime) dan server
// harus memakai secret yang sama, kalau tidak token sesi tidak bisa
// didekripsi dan user yang sudah login malah diarahkan ke halaman login.
const secret = process.env.NEXTAUTH_SECRET || 'framerio-secret-fallback-key-2026'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    return NextResponse.next()
  },
  {
    secret,
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: '/login' }
  }
)

export const config = {
  matcher: [
    '/booth/:path*',
    '/gallery/:path*',
    '/payment/:path*',
    '/account/:path*',
    '/admin/:path*'
  ]
}