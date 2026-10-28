'use client'
import { useEffect, useState, useRef } from 'react'

type Notif = {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: string
  orderId: string | null
}

const TYPE_ICON: Record<string, string> = {
  proof_submitted: '💳',
  payment_approved: '✓',
  payment_rejected: '✕',
}

const TYPE_COLOR: Record<string, string> = {
  proof_submitted: 'bg-amber-50 border-amber-200',
  payment_approved: 'bg-green-50 border-green-200',
  payment_rejected: 'bg-red-50 border-red-200',
}

export default function AdminNotifBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  async function fetchNotifs() {
    try {
      const res = await fetch('/api/admin/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifs(data.notifications)
      setUnread(data.unreadCount)
    } catch {}
  }

  async function markAllRead() {
    await fetch('/api/admin/notifications', { method: 'PATCH' })
    setUnread(0)
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Poll setiap 20 detik
  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 20000)
    return () => clearInterval(interval)
  }, [])

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    setOpen(!open)
    if (!open && unread > 0) markAllRead()
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Baru saja'
    if (mins < 60) return `${mins} menit lalu`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} jam lalu`
    return `${Math.floor(hrs / 24)} hari lalu`
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/70 hover:bg-white transition border border-zinc-300 text-zinc-600 hover:text-zinc-900"
        title="Notifikasi"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e85200] rounded-full text-white text-[9px] font-black flex items-center justify-center animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-[#1e1e1e] border border-zinc-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
            <span className="text-xs font-black text-white tracking-wide">Notifikasi</span>
            {notifs.length > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-zinc-400 hover:text-zinc-200 transition font-semibold">
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800">
            {notifs.length === 0 ? (
              <div className="py-10 text-center text-zinc-500 text-xs">Belum ada notifikasi.</div>
            ) : (
              notifs.map((n) => (
                <a
                  key={n.id}
                  href="/admin/subscriptions"
                  className={`px-4 py-3 flex gap-3 transition-colors hover:bg-white/5 ${
                    !n.read ? 'bg-white/5' : 'opacity-60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 border ${
                    TYPE_COLOR[n.type] || 'bg-zinc-800 border-zinc-700'
                  }`}>
                    {TYPE_ICON[n.type] || '●'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-white truncate">{n.title}</span>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#e85200] flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5 line-clamp-2">{n.body}</p>
                    <div className="text-[9px] text-zinc-600 mt-1 font-mono">{timeAgo(n.createdAt)}</div>
                  </div>
                </a>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-zinc-700">
            <a href="/admin/subscriptions" className="text-[10px] text-[#e85200] hover:text-orange-400 font-bold transition">
              Lihat semua pesanan →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
