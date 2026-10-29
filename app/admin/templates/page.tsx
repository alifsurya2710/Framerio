'use client'

import { useState, useEffect } from 'react'
import Card3D from '@/components/Card3D'

interface TemplateItem {
  id: string
  name: string
  category: string
  tag: string
  tagColor: string
  photosCount: number
  recommendedLayout: string
  bg: string
  frame: string
  frameWidth: number
  rounded: number
  gap: number
  pad: number
  textColor: string
  labelText: string
  subText: string
  filter: string
  styleType: string
  isPublic: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/templates')
      const data = await res.json()
      if (data.success) {
        setTemplates(data.templates)
      } else {
        setError(data.message || 'Gagal memuat template')
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleTogglePublic = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPublic: !currentStatus })
      })
      const data = await res.json()
      if (data.success) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isPublic: !currentStatus } : t))
        )
      } else {
        alert(data.message || 'Gagal memperbarui status publikasi')
      }
    } catch {
      alert('Gagal menghubungi server')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus template ini secara permanen?')) return
    try {
      const res = await fetch(`/api/admin/templates?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id))
      } else {
        alert(data.message || 'Gagal menghapus template')
      }
    } catch {
      alert('Gagal menghubungi server')
    }
  }

  const filtered = templates.filter((t) => {
    if (filter === 'public') return t.isPublic
    if (filter === 'private') return !t.isPublic
    return true
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <span className="text-[#e85200]">▣</span> Kelola Custom Template
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Daftar template yang dibuat oleh Pengguna (Trial 7 hari / Member Aktif) dan Administrator.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#b8b7b2] p-1 rounded-xl shadow-inner text-xs font-bold text-zinc-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all' ? 'bg-[#1c1c1c] text-white shadow-md' : 'hover:bg-white/40'
            }`}
          >
            Semua ({templates.length})
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'public' ? 'bg-emerald-700 text-white shadow-md' : 'hover:bg-white/40'
            }`}
          >
            Publik ({templates.filter((t) => t.isPublic).length})
          </button>
          <button
            onClick={() => setFilter('private')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'private' ? 'bg-zinc-800 text-white shadow-md' : 'hover:bg-white/40'
            }`}
          >
            Pribadi User ({templates.filter((t) => !t.isPublic).length})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center font-mono text-sm text-zinc-600">
          Memuat daftar template...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-[#dad9d4] rounded-2xl border-2 border-dashed border-zinc-400">
          <p className="text-sm font-bold text-zinc-600">Belum ada template kustom yang dibuat.</p>
          <p className="text-xs text-zinc-500 mt-1">
            User dapat membuatnya langsung dari Photobooth Console dengan tombol "+ Buat Template Sendiri".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tmpl) => (
            <Card3D
              key={tmpl.id}
              className="bg-[#f5f4ef] rounded-2xl p-5 border border-black/10 shadow-[0_8px_20px_rgba(0,0,0,0.08)] flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700">
                      {tmpl.category}
                    </span>
                    <h3 className="text-base font-black text-zinc-900 mt-1">{tmpl.name}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tmpl.isPublic
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {tmpl.isPublic ? 'Publik (Semua User)' : 'Pribadi User'}
                  </span>
                </div>

                {/* Creator info */}
                <div className="text-[11px] text-zinc-500 mb-3 bg-zinc-100 p-2 rounded-lg border border-zinc-200">
                  <div>
                    <strong className="text-zinc-700">Pembuat:</strong> {tmpl.user?.name || tmpl.user?.email}
                  </div>
                  <div>
                    <strong className="text-zinc-700">Role:</strong> {tmpl.user?.role} |{' '}
                    <strong className="text-zinc-700">Foto:</strong> {tmpl.photosCount} pose ({tmpl.recommendedLayout})
                  </div>
                </div>

                {/* Mini Visual Preview */}
                <div
                  className="w-full h-36 rounded-xl p-3 flex flex-col items-center justify-between border shadow-inner mb-4 transition-transform"
                  style={{
                    backgroundColor: tmpl.bg,
                    borderColor: tmpl.frame || '#333'
                  }}
                >
                  <div
                    className="w-full grid gap-1.5 h-20"
                    style={{
                      gridTemplateColumns:
                        tmpl.photosCount > 4
                          ? 'repeat(3, 1fr)'
                          : tmpl.photosCount === 2
                          ? 'repeat(2, 1fr)'
                          : 'repeat(4, 1fr)'
                    }}
                  >
                    {Array.from({ length: Math.min(tmpl.photosCount, 6) }).map((_, idx) => (
                      <div
                        key={idx}
                        className="h-full rounded bg-black/10 border border-black/20 flex items-center justify-center text-[8px] font-mono font-bold"
                        style={{
                          borderRadius: `${tmpl.rounded / 2}px`,
                          borderColor: tmpl.frame
                        }}
                      >
                        #{idx + 1}
                      </div>
                    ))}
                  </div>

                  <div className="w-full text-center">
                    <p
                      className="text-xs font-bold truncate leading-tight"
                      style={{ color: tmpl.textColor }}
                    >
                      {tmpl.labelText}
                    </p>
                    <p
                      className="text-[9px] uppercase tracking-wider opacity-75 truncate"
                      style={{ color: tmpl.textColor }}
                    >
                      {tmpl.subText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTogglePublic(tmpl.id, tmpl.isPublic)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    tmpl.isPublic
                      ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  }`}
                >
                  {tmpl.isPublic ? 'Jadikan Pribadi' : 'Publikasikan'}
                </button>

                <button
                  onClick={() => handleDelete(tmpl.id)}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-red-100 hover:bg-red-200 text-red-700 transition-all border border-red-200"
                >
                  Hapus
                </button>
              </div>
            </Card3D>
          ))}
        </div>
      )}
    </div>
  )
}
