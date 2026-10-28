'use client'
import { useState } from 'react'

interface Photo {
  id: string
  imageData: string
  layout: string
  createdAt: string
  user: { email: string; name: string | null }
}

export default function AdminPhotoGrid({ photos }: { photos: Photo[] }) {
  const [preview, setPreview] = useState<Photo | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Yakin hapus foto ini? Tindakan tidak dapat dibatalkan.')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' })
    if (res.ok) window.location.reload()
    else {
      alert('Gagal menghapus foto.')
      setDeleting(null)
    }
  }

  if (photos.length === 0) {
    return (
      <div className="bg-[#d4d3cf] rounded-2xl border border-zinc-400/30 py-20 text-center">
        <div className="text-4xl mb-3 opacity-30">◉</div>
        <div className="text-sm font-semibold text-zinc-500">Belum ada foto tersimpan.</div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {photos.map((p) => (
          <div
            key={p.id}
            className="bg-[#d4d3cf] border border-zinc-400/30 rounded-2xl overflow-hidden group hover:-translate-y-0.5 transition-all shadow-sm"
          >
            {/* Image */}
            <div
              className="relative aspect-square cursor-pointer bg-zinc-200 overflow-hidden"
              onClick={() => setPreview(p)}
            >
              <img
                src={p.imageData}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/20 transition-colors flex items-center justify-center">
                <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/50 px-3 py-1.5 rounded-full">
                  Lihat
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 space-y-1.5">
              <div className="text-[10px] font-bold text-zinc-700 truncate">
                {p.user.name || p.user.email.split('@')[0]}
              </div>
              <div className="text-[9px] font-mono text-zinc-500 truncate">{p.user.email}</div>
              <div className="text-[9px] text-zinc-400">
                {new Date(p.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-1">
                <a
                  href={p.imageData}
                  download={`framerio-${p.id}.jpg`}
                  className="flex-1 text-center text-[10px] font-bold py-1.5 rounded-lg bg-white/60 hover:bg-white text-zinc-700 border border-zinc-300 transition"
                >
                  ↓ Unduh
                </a>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  className="flex-1 text-center text-[10px] font-bold py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition disabled:opacity-50"
                >
                  {deleting === p.id ? '...' : '✕ Hapus'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative bg-[#ecebe6] rounded-[28px] border-2 border-white shadow-2xl overflow-hidden max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img src={preview.imageData} alt="" className="w-full object-contain max-h-[60vh]" />
            </div>
            <div className="px-5 py-4 space-y-1">
              <div className="text-xs font-bold text-zinc-800">
                {preview.user.name || preview.user.email.split('@')[0]}
              </div>
              <div className="text-[10px] font-mono text-zinc-500">{preview.user.email}</div>
              <div className="text-[10px] text-zinc-400">
                {new Date(preview.createdAt).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <a
                href={preview.imageData}
                download={`framerio-${preview.id}.jpg`}
                className="flex-1 text-center text-xs font-bold py-2.5 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition"
              >
                ↓ Unduh Foto
              </a>
              <button
                onClick={() => setPreview(null)}
                className="px-4 text-xs font-bold py-2.5 rounded-xl bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-100 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
