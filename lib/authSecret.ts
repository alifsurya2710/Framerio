/**
 * Satu sumber kebenaran untuk secret NextAuth.
 *
 * Dipakai oleh server Node (lib/auth.ts) DAN middleware Edge (middleware.ts)
 * supaya cookie sesi SELALU ditandatangani & didekripsi dengan secret yang
 * sama. Kalau keduanya beda, user yang sudah login (mis. admin) akan
 * terlempar kembali ke halaman login saat membuka halaman terproteksi.
 *
 * PENTING: file ini harus tetap "ringan" (tanpa Prisma/bcrypt) agar aman
 * diimpor oleh middleware yang berjalan di Edge runtime.
 */
export const AUTH_SECRET: string =
  process.env.NEXTAUTH_SECRET || 'framerio-secret-fallback-key-2026'
