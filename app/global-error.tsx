'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4">
        <div className="text-center p-8 border border-white/10 rounded-2xl bg-slate-900 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Terjadi Kendala Sistem</h2>
          <p className="text-sm text-slate-400 mb-6">{error.message || 'Silakan muat ulang halaman.'}</p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-pink-600 rounded-xl font-bold text-white text-sm"
          >
            Muat Ulang
          </button>
        </div>
      </body>
    </html>
  )
}

