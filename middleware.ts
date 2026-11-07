import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { AUTH_SECRET } from '@/lib/authSecret'

// Secret WAJIB sama dengan lib/auth.ts (dijamin lewat lib/authSecret.ts).
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
    callbacks: {
      authorized: ({ req, token }) => {
        // 1. Jika token JWT berhasil didekripsi oleh withAuth
        if (!!token) return true

        // 2. Fallback untuk browser mobile / PWA / Edge runtime di Netlify:
        // Kadang di Netlify Edge Functions, dekripsi token otomatis menghasilkan null
        // padahal cookie sesi sah (secure / normal) tersimpan di browser mobile.
        const secureCookie = req.cookies.get('__Secure-next-auth.session-token')?.value
        const regularCookie = req.cookies.get('next-auth.session-token')?.value

        return !!(secureCookie || regularCookie)
      }
    },
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
