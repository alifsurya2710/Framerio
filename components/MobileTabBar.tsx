'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

// Tab untuk pengunjung yang BELUM login (hanya 3)
const GUEST_TABS = [
  { href: '/', label: 'Konsol' },
  { href: '/pricing', label: 'Harga' },
  { href: '/login', label: 'Masuk' },
]

// Tab untuk role USER (di luar panel admin)
const USER_TABS = [
  { href: '/', label: 'Konsol' },
  { href: '/booth', label: 'Studio' },
  { href: '/gallery', label: 'Galeri' },
  { href: '/pricing', label: 'Harga' },
  { href: '/account', label: 'Akun' },
]

// Tab untuk role ADMIN (saat berada di dalam /admin)
const ADMIN_TABS = [
  { href: '/admin', label: 'Dasbor' },
  { href: '/admin/photos', label: 'Foto' },
  { href: '/admin/templates', label: 'Templat' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/subscriptions', label: 'Subs' },
  { href: '/admin/testimonies', label: 'Testi' },
]

export default function MobileTabBar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Tampil untuk semua (login maupun tidak); kecuali halaman pembayaran
  if (pathname.startsWith('/payment')) return null

  const isAdmin = (session?.user as any)?.role === 'ADMIN'
  const tabs = !session
    ? GUEST_TABS
    : isAdmin && pathname.startsWith('/admin')
      ? ADMIN_TABS
      : USER_TABS

  const isActive = (href: string) =>
    href === '/' || href === '/admin' ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* Spacer agar konten tidak tertutup bar (hanya mobile) */}
      <div className="md:hidden h-14 flex-shrink-0" aria-hidden />

      {/* Bottom Tab Bar — solid penuh menutupi bawah layar, hanya mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#ecebe6] border-t-2 border-zinc-300 shadow-[0_-4px_16px_rgba(0,0,0,0.10)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Navigasi bawah"
      >
        <div className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((tab) => {
            const active = isActive(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`py-3.5 px-1 text-center text-[13px] font-bold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis transition-colors ${
                  active
                    ? 'text-[#e85200] bg-white/70'
                    : 'text-zinc-600 active:text-zinc-900'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
