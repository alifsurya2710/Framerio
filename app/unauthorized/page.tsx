import Link from 'next/link'

export default function Unauthorized() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="retro-canvas retro-grid-bg rounded-[32px] border-2 border-white/60 p-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center font-black text-red-500 text-2xl mb-5">
            403
          </div>
          <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1">
            Akses Ditolak
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">
            Tidak Ada Izin
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed mb-7">
            Kamu tidak memiliki akses ke halaman ini. Halaman ini hanya tersedia untuk admin.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 btn-orange-glow px-7 py-3.5 rounded-full text-white font-extrabold text-xs tracking-wider uppercase hover:scale-105 transition-transform"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
