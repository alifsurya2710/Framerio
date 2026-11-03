import { prisma } from '@/lib/prisma'
import AdminTestimoniesList from '@/components/AdminTestimoniesList'

export default async function AdminTestimoniesPage() {
  const testimonies = await prisma.testimony.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ createdAt: 'desc' }],
    take: 200,
  })

  const serialized = testimonies.map((t) => ({
    id: t.id,
    rating: t.rating,
    date: t.date.toISOString(),
    message: t.message,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    user: t.user,
  }))

  const pending = serialized.filter((t) => t.status === 'PENDING').length
  const approved = serialized.filter((t) => t.status === 'APPROVED').length

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1">Manajemen</div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Testimoni</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {serialized.length} total · setujui atau tolak testimoni sebelum tampil di beranda.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-700 px-4 py-2 rounded-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {approved} tampil di beranda
          </div>
          {pending > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {pending} menunggu persetujuan
            </div>
          )}
        </div>
      </div>

      <AdminTestimoniesList testimonies={serialized} />
    </div>
  )
}
