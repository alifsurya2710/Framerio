import { prisma } from '@/lib/prisma'
import AdminPhotoGrid from '@/components/AdminPhotoGrid'

export default async function AdminPhotosPage() {
  const photos = await prisma.photo.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const serialized = photos.map((p) => ({
    id: p.id,
    imageData: p.imageData,
    layout: p.layout,
    createdAt: p.createdAt.toISOString(),
    user: p.user,
  }))

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1">Manajemen</div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Lihat Foto</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          {photos.length} foto dari semua user · hanya admin yang bisa mengakses.
        </p>
      </div>

      <AdminPhotoGrid photos={serialized} />
    </div>
  )
}
