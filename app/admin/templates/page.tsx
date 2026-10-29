'use client'

import { useState, useEffect } from 'react'
import Card3D from '@/components/Card3D'
import AdminCreateTemplateModal from '@/components/AdminCreateTemplateModal'

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
  bgImage?: string | null
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <span className="text-[#e85200]">▣</span> Kelola Template Perangkat
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Template yang dibuat dari upload gambar perangkat — oleh pengguna maupun administrator.
          </p>
        </div>

        {/* Tombol Buat Template Baru */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e85200] hover:bg-[#ff5d07] text-white text-xs font-black shadow-lg shadow-orange-500/20 transition-all"
        >
          <span className="text-base">📤</span>
          Buat Template Baru
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#b8b7b2] p-1 rounded-xl shadow-inner text-xs font-bold text-zinc-700 w-fit">
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
          Pribadi ({templates.filter((t) => !t.isPublic).length})
        </button>
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
          <p className="text-sm font-bold text-zinc-600">Belum ada template yang tersimpan.</p>
          <p className="text-xs text-zinc-500 mt-1">
            Klik "Buat Template Baru" di atas untuk upload template dari perangkat.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-5 py-2 rounded-xl bg-[#e85200] text-white text-xs font-black hover:bg-[#ff5d07] transition"
          >
            📤 Upload Template Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tmpl) => (
            <Card3D
              key={tmpl.id}
              className="bg-[#f5f4ef] rounded-2xl border border-black/10 shadow-[0_8px_20px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden"
            >
              {/* Preview Gambar Template */}
              <div className="relative bg-zinc-200 overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: 220 }}>
                {tmpl.bgImage ? (
                  <img
                    src={tmpl.bgImage}
                    alt={tmpl.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <div className="text-center">
                      <div className="text-4xl mb-1">🖼</div>
                      <p className="text-xs">Tidak ada gambar</p>
                    </div>
                  </div>
                )}

                {/* Status Badge Overlay */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      tmpl.isPublic
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-800/80 text-white'
                    }`}
                  >
                    {tmpl.isPublic ? '🌐 Publik' : '🔒 Pribadi'}
                  </span>
                </div>

                {/* Role Badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      tmpl.user?.role === 'ADMIN'
                        ? 'bg-[#e85200] text-white'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {tmpl.user?.role === 'ADMIN' ? '⭐ Admin' : '👤 User'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                {/* Info */}
                <div className="space-y-2 mb-4">
                  <h3 className="text-sm font-black text-zinc-900 leading-tight">{tmpl.name}</h3>
                  <div className="text-[10px] text-zinc-500 bg-zinc-100 p-2 rounded-lg border border-zinc-200 space-y-0.5">
                    <div>
                      <strong className="text-zinc-700">Pembuat:</strong>{' '}
                      {tmpl.user?.name || tmpl.user?.email}
                    </div>
                    <div>
                      <strong className="text-zinc-700">Foto:</strong> {tmpl.photosCount} pose
                      {' · '}
                      <strong className="text-zinc-700">Layout:</strong> {tmpl.recommendedLayout}
                    </div>
                    <div>
                      <strong className="text-zinc-700">Dibuat:</strong>{' '}
                      {new Date(tmpl.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2">
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
              </div>
            </Card3D>
          ))}
        </div>
      )}

      {/* Modal Buat Template Baru (Admin) */}
      <AdminCreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTemplates}
      />
    </div>
  )
}
