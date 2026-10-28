'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="glass-card p-10 sm:p-14 rounded-3xl border border-white/10 max-w-md w-full shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center font-bold text-pink-400 text-xl mb-4">
          404
        </div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Alamat rute yang Anda tuju tidak tersedia atau sudah berpindah.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm transition shadow-lg shadow-pink-600/30"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/booth"
            className="px-6 py-3 rounded-xl glass-card text-slate-200 hover:text-white font-semibold text-sm transition"
          >
            Menuju Photobooth
          </Link>
        </div>
      </div>
    </div>
  )
}

