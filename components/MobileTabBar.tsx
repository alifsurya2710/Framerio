'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

type TabItem = {
  href: string
  label: string
  icon: (active: boolean) => React.ReactNode
}

// Icon helper functions
const ConsoleIcon = (active: boolean) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <path d="M6 12h4m-2-2v4" />
    <circle cx="16" cy="10" r="1" fill="currentColor" />
    <circle cx="18" cy="14" r="1" fill="currentColor" />
  </svg>
)

const CameraIcon = (active: boolean) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
)

const GalleryIcon = (active: boolean) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const PricingIcon = (active: boolean) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

const AccountIcon = (active: boolean) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const LoginIcon = (active: boolean) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
)

const DashboardIcon = (active: boolean) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
)

const TemplateIcon = (active: boolean) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5z" />
    <path d="M4 13a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6z" />
    <path d="M16 12h4v8h-4z" />
  </svg>
)

const UsersIcon = (active: boolean) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const SubsIcon = (active: boolean) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
)

const TestiIcon = (active: boolean) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

// Tab untuk pengunjung yang BELUM login
const GUEST_TABS: TabItem[] = [
  { href: '/', label: 'Konsol', icon: ConsoleIcon },
  { href: '/pricing', label: 'Harga', icon: PricingIcon },
  { href: '/login', label: 'Masuk', icon: LoginIcon },
]

// Tab untuk role USER (di luar panel admin)
const USER_TABS: TabItem[] = [
  { href: '/', label: 'Konsol', icon: ConsoleIcon },
  { href: '/booth', label: 'Studio', icon: CameraIcon },
  { href: '/gallery', label: 'Galeri', icon: GalleryIcon },
  { href: '/pricing', label: 'Harga', icon: PricingIcon },
  { href: '/account', label: 'Akun', icon: AccountIcon },
]

// Tab untuk role ADMIN (saat berada di dalam /admin)
const ADMIN_TABS: TabItem[] = [
  { href: '/admin', label: 'Dasbor', icon: DashboardIcon },
  { href: '/admin/photos', label: 'Foto', icon: GalleryIcon },
  { href: '/admin/templates', label: 'Templat', icon: TemplateIcon },
  { href: '/admin/users', label: 'Users', icon: UsersIcon },
  { href: '/admin/subscriptions', label: 'Subs', icon: SubsIcon },
  { href: '/admin/testimonies', label: 'Testi', icon: TestiIcon },
]

export default function MobileTabBar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Sembunyikan di alur pembayaran agar tidak mengganggu checkout
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
      {/* Spacer agar konten paling bawah tidak tertutup navigation bar */}
      <div className="md:hidden h-20 flex-shrink-0" aria-hidden />

      {/* Floating Modern iOS / Modern App Style Nav Bar */}
      <nav
        className="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-white/85 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl transition-all"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px) - 6px, 0px)' }}
        aria-label="Navigasi bawah"
      >
        <div className="flex items-center justify-around py-1.5 px-1.5">
          {tabs.map((tab) => {
            const active = isActive(tab.href)
            const isStudio = tab.href === '/booth'

            // Desain aksen khusus untuk tombol utama "Studio" jika sedang di user mode
            if (isStudio) {
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex flex-col items-center justify-center -mt-4 relative group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                      active
                        ? 'bg-[#e85200] text-white shadow-[0_6px_20px_rgba(232,82,0,0.45)] scale-105'
                        : 'bg-[#e85200] text-white shadow-[0_4px_14px_rgba(232,82,0,0.35)] active:scale-95'
                    }`}
                  >
                    {tab.icon(true)}
                  </div>
                  <span
                    className={`text-[10px] font-black tracking-wide mt-1 uppercase ${
                      active ? 'text-[#e85200]' : 'text-zinc-600'
                    }`}
                  >
                    {tab.label}
                  </span>
                </Link>
              )
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 relative ${
                  active
                    ? 'text-[#e85200] font-black'
                    : 'text-zinc-500 hover:text-zinc-900 active:scale-95 font-semibold'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all duration-200 ${
                    active ? 'bg-[#e85200]/10 text-[#e85200] scale-105' : 'text-zinc-500'
                  }`}
                >
                  {tab.icon(active)}
                </div>
                <span className="text-[10px] tracking-tight leading-tight mt-0.5">
                  {tab.label}
                </span>

                {/* Indikator dot aktif di bawah */}
                {active && (
                  <span className="w-1 h-1 bg-[#e85200] rounded-full mt-0.5 animate-pulse" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

