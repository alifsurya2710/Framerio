import { prisma } from '@/lib/prisma'
import Link from 'next/link'

function daysLeft(endsAt: Date | null): number | null {
  if (!endsAt) return null
  const ms = endsAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

function daysLeftLabel(days: number | null) {
  if (days === null) return '—'
  if (days === 0) return 'Habis hari ini'
  if (days === 1) return '1 hari lagi'
  return `${days} hari lagi`
}

function daysLeftClass(days: number | null) {
  if (days === null) return 'text-zinc-400'
  if (days <= 3) return 'text-red-600'
  if (days <= 7) return 'text-amber-700'
  return 'text-green-700'
}

export default async function AdminDashboard() {
  const now = new Date()

  const [users, photos, activeSubs, pendingSubs, unreadNotifs, paidList] = await Promise.all([
    prisma.user.count(),
    prisma.photo.count(),
    prisma.subscription.count({
      where: { status: 'PAID', endsAt: { gt: now } },
    }),
    prisma.subscription.count({ where: { status: 'PENDING' } }),
    prisma.notification.count({ where: { read: false } }),
    prisma.subscription.findMany({
      where: { status: 'PAID', endsAt: { gt: now } },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { endsAt: 'asc' },
      take: 30,
    }),
  ])

  const cards = [
    {
      label: 'Total User',
      value: users,
      icon: '◎',
      href: '/admin/users',
      color: 'from-zinc-800 to-zinc-700',
      accent: 'text-zinc-300',
    },
    {
      label: 'Total Foto',
      value: photos,
      icon: '◉',
      href: '/admin/photos',
      color: 'from-zinc-800 to-zinc-700',
      accent: 'text-zinc-300',
    },
    {
      label: 'Langganan Aktif',
      value: activeSubs,
      icon: '◈',
      href: '/admin/subscriptions',
      color: 'from-[#e85200] to-[#c44400]',
      accent: 'text-orange-200',
    },
    {
      label: 'Notifikasi Baru',
      value: unreadNotifs,
      icon: '◇',
      href: '/admin/subscriptions',
      color: unreadNotifs > 0 ? 'from-amber-600 to-amber-700' : 'from-zinc-800 to-zinc-700',
      accent: unreadNotifs > 0 ? 'text-amber-200' : 'text-zinc-300',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1">Overview</div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Ringkasan data terbaru platform Framerio.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`relative bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white overflow-hidden group hover:-translate-y-0.5 transition-all shadow-lg`}
          >
            <div className={`text-2xl font-mono font-bold ${c.accent} mb-0.5`}>{c.icon}</div>
            <div className="text-3xl font-black tabular-nums">{c.value}</div>
            <div className="text-[11px] font-semibold text-white/70 mt-1">{c.label}</div>
            <div className="absolute right-4 bottom-4 text-[40px] font-black opacity-5 select-none pointer-events-none">
              {c.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Paid users + countdown */}
      <div className="bg-[#d4d3cf] rounded-2xl border border-zinc-400/30 overflow-hidden mb-8">
        <div className="px-5 py-3.5 border-b border-zinc-400/30 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-zinc-700">User yang Sudah Bayar</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Sisa masa langganan · {activeSubs} aktif
              {pendingSubs > 0 ? ` · ${pendingSubs} order belum bayar` : ''}
            </div>
          </div>
          <Link
            href="/admin/subscriptions"
            className="text-[10px] font-bold text-[#e85200] hover:text-[#c44400] transition whitespace-nowrap"
          >
            Lihat semua →
          </Link>
        </div>

        {paidList.length === 0 ? (
          <div className="py-14 text-center text-zinc-500 text-xs">Belum ada langganan aktif.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-zinc-400/30">
                  {['User', 'Paket', 'Metode', 'Berakhir', 'Sisa'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paidList.map((s) => {
                  const left = daysLeft(s.endsAt)
                  return (
                    <tr key={s.id} className="border-b border-zinc-400/20 hover:bg-white/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-bold text-zinc-800">{s.user.email}</div>
                        {s.user.name && (
                          <div className="text-[10px] text-zinc-500 font-mono">{s.user.name}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-wide">
                          {s.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold text-zinc-600 bg-white/60 border border-zinc-300 px-2 py-0.5 rounded-lg">
                          {s.method}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {s.endsAt
                            ? s.endsAt.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${daysLeftClass(left)}`}>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              left !== null && left <= 3
                                ? 'bg-red-500 animate-pulse'
                                : left !== null && left <= 7
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                            }`}
                          />
                          {daysLeftLabel(left)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-[#d4d3cf] rounded-2xl border border-zinc-400/30 p-5">
        <div className="text-[10px] font-mono tracking-[0.15em] text-zinc-500 uppercase mb-3">Akses Cepat</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { href: '/admin/photos', label: 'Kelola Foto', desc: 'Lihat & hapus foto user' },
            { href: '/admin/users', label: 'Kelola Users', desc: 'Daftar semua akun' },
            { href: '/admin/subscriptions', label: 'Kelola Subscriptions', desc: 'Riwayat & status pembayaran' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-3 bg-white/60 hover:bg-white rounded-xl border border-white/80 group transition-all"
            >
              <div>
                <div className="text-xs font-bold text-zinc-800">{item.label}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
              </div>
              <span className="text-[#e85200] text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
