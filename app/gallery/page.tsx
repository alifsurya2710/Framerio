import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function GalleryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const photos = await prisma.photo.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1">
          Koleksi Pribadi
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Galeri Saya
        </h1>
        {photos.length > 0 && (
          <p className="text-xs text-zinc-500 mt-1">{photos.length} foto tersimpan di akun Anda.</p>
        )}
      </div>

      {photos.length === 0 ? (
        /* Empty state */
        <div className="retro-canvas retro-grid-bg rounded-[28px] border-2 border-white/60 py-20 px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/60 border border-white/80 flex items-center justify-center text-3xl mb-4 shadow-sm">
            ◉
          </div>
          <h2 className="text-base font-black text-zinc-800 mb-1">Belum Ada Foto</h2>
          <p className="text-xs text-zinc-500 mb-6 max-w-xs mx-auto">
            Yuk ambil foto pertamamu di studio Framerio dan simpan ke galeri.
          </p>
          <Link
            href="/booth"
            className="inline-flex items-center gap-2 btn-orange-glow px-6 py-3 rounded-full text-white font-extrabold text-xs tracking-wider uppercase transition-transform hover:scale-105 active:scale-95"
          >
            Buka Studio &rarr;
          </Link>
        </div>
      ) : (
        /* Photo grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="group retro-canvas rounded-2xl border-2 border-white/60 overflow-hidden hover:-translate-y-0.5 transition-all shadow-sm"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-zinc-200">
                <img
                  src={p.imageData}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/20 transition-colors" />
              </div>

              {/* Info */}
              <div className="px-3 py-2.5 space-y-2">
                <div className="text-[10px] text-zinc-500 font-mono">
                  {new Date(p.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <a
                  href={p.imageData}
                  download={`framerio-${p.id}.jpg`}
                  className="block w-full text-center text-[10px] font-bold py-2 rounded-xl bg-zinc-800 hover:bg-[#e85200] text-white transition-colors"
                >
                  ↓ Unduh
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
