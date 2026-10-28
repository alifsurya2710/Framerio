import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminUsersList from '@/components/AdminUsersList'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  const users = await prisma.user.findMany({
    include: {
      subscriptions: {
        where: { status: 'PAID' },
        orderBy: { endsAt: 'desc' },
        take: 1,
      },
      _count: { select: { photos: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = users.map((u) => {
    const sub = u.subscriptions[0]
    const active = sub && sub.endsAt && sub.endsAt > new Date()
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      trialEndsAt: u.trialEndsAt.toISOString(),
      photoCount: u._count.photos,
      subscription: active
        ? { plan: sub.plan, endsAt: sub.endsAt!.toISOString() }
        : null,
    }
  })

  return (
    <div>
      <div className="mb-8">
        <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1">Manajemen</div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Users</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{users.length} akun terdaftar di platform.</p>
      </div>

      <AdminUsersList users={serialized} currentAdminId={session!.user.id} />
    </div>
  )
}
