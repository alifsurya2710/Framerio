import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { AUTH_SECRET } from '@/lib/authSecret'

// Secret WAJIB sama dengan lib/auth.ts (dijamin lewat lib/authSecret.ts).
// Middleware (Edge runtime) dan server harus memakai secret identik, kalau
// tidak token sesi tidak bisa didekripsi dan admin/user yang sudah login
// malah disuruh login kembali saat membuka Studio.
const secret = AUTH_SECRET

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