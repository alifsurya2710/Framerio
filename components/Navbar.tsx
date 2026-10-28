'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import BrandLogo from '@/components/BrandLogo'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  const navItems = [
    { name: 'Studio', href: '/booth', auth: true },
    { name: 'Galeri', href: '/gallery', auth: true },
    { name: 'Harga', href: '/pricing', auth: false }
  ]

  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 pb-2 relative z-50">
      <div className="flex items-center justify-between gap-3">
        {/* Left Segmented Pill Tabs (Hanya ditampilkan di layar desktop/tablet, rapi tanpa scrollbar) */}
        <div className="hidden md:flex items-center p-1 rounded-full pill-tab gap-1">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              pathname === '/'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Konsol
          </Link>

          {navItems.map((item) => {
            if (item.auth && !session) return null
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {item.name}
              </Link>
            )
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#e85200] hover:bg-white/60 transition-all"
            >
              Admin
            </Link>
          )}
        </div>

        <Link href="/" aria-label="Framerio - Beranda" className="flex items-center group flex-shrink-0">
          <BrandLogo
            width={756}
            height={155}
            className="h-auto w-[132px] sm:w-[150px] transition-opacity group-hover:opacity-80"
            priority
          />
        </Link>

        {/* Right Navigation & Mobile Hamburger Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {session ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/account"
                className={`text-xs font-medium transition ${
                  pathname === '/account'
                    ? 'text-zinc-900 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {session.user?.name || session.user?.email?.split('@')[0]}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-zinc-700 shadow-sm border border-zinc-300 hover:bg-zinc-100 transition"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-white/50 transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#e85200] hover:bg-[#d94800] shadow-md shadow-[#e85200]/25 transition"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Tombol Menu Mobile yang Pas & Bersih */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full pill-tab bg-white text-zinc-800 text-xs font-bold shadow-sm border border-zinc-200"
          >
            <span>Menu</span>
            <span className="text-[10px]">{mobileMenuOpen ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {/* Dropdown Menu Khusus Layar Mobile (Tidak Digeser, Pas dan Rapi) */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 rounded-3xl bg-[#e5e4df] border-2 border-white shadow-xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
              pathname === '/' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-700 hover:bg-white/50'
            }`}
          >
            Konsol Utama
          </Link>

          {navItems.map((item) => {
            if (item.auth && !session) return null
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                  active ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-700 hover:bg-white/50'
                }`}
              >
                {item.name}
              </Link>
            )
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#e85200] hover:bg-white/50 transition"
            >
              Panel Admin
            </Link>
          )}

          <div className="pt-2 mt-1 border-t border-zinc-300 flex flex-col gap-2">
            {session ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-700 hover:bg-white/50 transition truncate"
                >
                  Akun · {session.user?.name || session.user?.email}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-zinc-700 shadow-sm border border-zinc-300"
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 w-full">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl text-xs font-bold bg-white text-zinc-700 shadow-sm border border-zinc-300"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl text-xs font-bold bg-[#e85200] text-white shadow-md shadow-[#e85200]/30"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
