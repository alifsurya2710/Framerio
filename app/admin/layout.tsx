import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminNotifBell from '@/components/AdminNotifBell'
import BrandLogo from '@/components/BrandLogo'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/photos', label: 'Lihat Foto', icon: '◉' },
  { href: '/admin/users', label: 'Users', icon: '◎' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: '◇' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') redirect('/unauthorized')

  return (
    <div className="min-h-screen flex bg-[#c5c4c0]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-[#1c1c1c] text-white relative">
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
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/10 transition-all group"
            >
              <span className="text-[#e85200] text-base w-4 text-center group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-5 py-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] text-zinc-600 hover:text-zinc-400 transition font-mono"
          >
            ← Kembali ke Aplikasi
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-[#d4d3cf] border-b border-zinc-400/30 px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-zinc-500 font-mono tracking-wider">
            ADMIN · {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-3">
            <AdminNotifBell />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-zinc-600 font-semibold">
                {(session?.user as any)?.email}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
