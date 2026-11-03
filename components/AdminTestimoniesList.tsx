'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Testimony = {
  id: string
  rating: number
  date: string
  message: string
  status: string
  createdAt: string
  user: { email: string; name?: string | null }
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  APPROVED: { label: 'Disetujui', cls: 'bg-green-100 text-green-700 border-green-200' },
  PENDING: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  REJECTED: { label: 'Ditolak', cls: 'bg-red-100 text-red-700 border-red-200' },
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500 text-sm tracking-tight" title={`${rating} dari 5 bintang`}>
      {'★'.repeat(rating)}
      <span className="text-zinc-300">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export default function AdminTestimoniesList({ testimonies }: { testimonies: Testimony[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const shown = testimonies.filter((t) => filter === 'ALL' || t.status === filter)

  async function act(id: string, action: 'APPROVE' | 'REJECT') {
    setLoadingId(id)
    setError('')
    try {
      const res = await fetch(`/api/admin/testimonies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal memperbarui')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingId(null)
    }
  }

  // Hapus permanen oleh admin (dengan konfirmasi)
  async function remove(id: string) {
    if (!confirm('Hapus testimoni ini permanen? Tindakan tidak bisa dibatalkan.')) return
    setLoadingId(id)
    setError('')
    try {
      const res = await fetch(`/api/admin/testimonies/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal menghapus')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingId(null)
    }
  }

  const tabs: Array<{ key: typeof filter; label: string; count: number }> = [
    { key: 'ALL', label: 'Semua', count: testimonies.length },
    { key: 'PENDING', label: 'Menunggu', count: testimonies.filter((t) => t.status === 'PENDING').length },
    { key: 'APPROVED', label: 'Disetujui', count: testimonies.filter((t) => t.status === 'APPROVED').length },
    { key: 'REJECTED', label: 'Ditolak', count: testimonies.filter((t) => t.status === 'REJECTED').length },
  ]

  return (
    <div>
      {/* Filter tab */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
              filter === t.key
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-100'
            }`}
          >
            {t.label} <span className="opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold mb-3">
          {error}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="retro-canvas rounded-2xl border-2 border-white/60 py-14 text-center text-xs text-zinc-500">
          Belum ada testimoni pada filter ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {shown.map((t) => {
            const sc = statusConfig[t.status] || statusConfig.PENDING
            return (
              <div
                key={t.id}
                className="retro-canvas rounded-2xl border-2 border-white/60 p-4 shadow-sm flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-black text-zinc-800 truncate">
                      {t.user.name || t.user.email}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono truncate">{t.user.email}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sc.cls}`}>
                      {sc.label}
                    </span>
                    {/* Hapus permanen */}
                    <button
                      onClick={() => remove(t.id)}
                      disabled={loadingId === t.id}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold bg-white border border-red-300 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition disabled:opacity-50"
                      title="Hapus permanen"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Stars rating={t.rating} />
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed bg-white/60 border border-white/80 rounded-xl px-3 py-2.5 min-h-[64px]">
                  “{t.message}”
                </p>

                <div className="flex gap-2 mt-auto">
                  {t.status !== 'APPROVED' && (
                    <button
                      onClick={() => act(t.id, 'APPROVE')}
                      disabled={loadingId === t.id}
                      className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50"
                    >
                      ✓ Setujui
                    </button>
                  )}
                  {t.status !== 'REJECTED' && (
                    <button
                      onClick={() => act(t.id, 'REJECT')}
                      disabled={loadingId === t.id}
                      className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-white border border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition disabled:opacity-50"
                    >
                      ✕ Tolak
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
