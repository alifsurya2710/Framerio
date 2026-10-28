import { prisma } from '@/lib/prisma'
import AdminSubsList from '@/components/AdminSubsList'

export default async function AdminSubsPage() {
  const now = new Date()

  const [subs, users] = await Promise.all([
    prisma.subscription.findMany({
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.user.findMany({
      select: { id: true, email: true, name: true },
      orderBy: { email: 'asc' },
    }),
  ])

  const serialized = subs.map((s) => ({
    id: s.id,
    userId: s.userId,
    orderId: s.orderId,
    plan: s.plan,
    method: s.method,
    amount: s.amount,
    status: s.status,
    proofData: s.proofData,
    createdAt: s.createdAt.toISOString(),
    endsAt: s.endsAt?.toISOString() || null,
    user: s.user,
  }))

  const active = subs.filter((s) => s.status === 'PAID' && s.endsAt && s.endsAt > now).length
  const pending = subs.filter((s) => s.status === 'PENDING').length

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1">Manajemen</div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Subscriptions</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {subs.length} total · {active} aktif · hitung mundur perpanjangan di kolom Sisa.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-700 px-4 py-2 rounded-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {active} langganan aktif
          </div>
          {pending > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {pending} belum bayar
            </div>
          )}
        </div>
      </div>

      <AdminSubsList subs={serialized} users={users} />
    </div>
  )
}
