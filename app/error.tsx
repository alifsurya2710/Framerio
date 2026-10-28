'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="glass-card p-8 rounded-2xl border border-white/10 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-2">Terjadi Kesalahan</h2>
        <p className="text-sm text-slate-400 mb-6">{error.message || 'Gagal memuat halaman.'}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm transition"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}

