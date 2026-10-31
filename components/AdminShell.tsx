'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminNotifBell from '@/components/AdminNotifBell'
import BrandLogo from '@/components/BrandLogo'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/photos', label: 'Lihat Foto', icon: '◉' },
  { href: '/admin/templates', label: 'Kelola Template', icon: '▣' },
  { href: '/admin/users', label: 'Users', icon: '◎' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: '◇' },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex flex-col items-start gap-2">
          <div className="rounded-md bg-white px-2 py-1">
            <BrandLogo width={756} height={155} className="h-auto w-[140px]" />
          </div>
          <div className="text-[10px] text-zinc-500 font-mono tracking-wider">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                active
                  ? 'text-white bg-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-[#e85200] text-base w-4 text-center group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer sidebar */}
      <div className="px-5 py-4 border-t border-white/10">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 text-[10px] text-zinc-600 hover:text-zinc-400 transition font-mono"
        >
          ← Kembali ke Aplikasi
        </Link>
      </div>
    </>
  )
}

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Tutup drawer saat pindah halaman
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Kunci scroll body saat drawer terbuka
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div className="min-h-screen flex bg-[#c5c4c0]">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col bg-[#1c1c1c] text-white relative">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile (drawer) */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] flex flex-col bg-[#1c1c1c] text-white shadow-2xl transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Tutup menu"
        >
          ✕
        </button>
        <div className="pt-12 flex-1 flex flex-col min-h-0 [&>nav]:overflow-y-auto">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#d4d3cf] border-b border-zinc-400/30 px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 hover:bg-white transition border border-zinc-300 text-zinc-700 flex-shrink-0"
              aria-label="Buka menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="text-[10px] sm:text-xs text-zinc-500 font-mono tracking-wider truncate">
              ADMIN · {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <AdminNotifBell />
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
              <span className="hidden sm:inline text-xs text-zinc-600 font-semibold truncate max-w-[160px]">
                {email}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
