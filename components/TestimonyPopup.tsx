'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Notif = {
  id: string
  type: string
  title: string
  body: string
  createdAt: string
}

/**
 * Pop-up di tengah layar admin saat ada testimoni baru masuk.
 * Polling notifikasi yang sudah ada (tanpa endpoint baru) dan hanya
 * menampilkan pop-up untuk notif 'testimony_submitted' yang BARU
 * (bukan riwayat lama saat halaman pertama dibuka).
 */
export default function TestimonyPopup() {
  const [popup, setPopup] = useState<Notif | null>(null)
  const baselineDone = useRef(false)
  const lastSeenId = useRef<string | null>(null)

  useEffect(() => {
    let stopped = false

    async function check() {
      try {
        const res = await fetch('/api/admin/notifications')
        if (!res.ok) return
        const data = await res.json()
        if (stopped) return

        // Hanya notif testimoni, terbaru pertama (API sudah urut desc)
        const testi = (data.notifications as Notif[]).filter(
          (n) => n.type === 'testimony_submitted'
        )
        const newest = testi[0] || null

        if (!baselineDone.current) {
          // Pengaturan awal: catat yang terbaru, JANGAN pop-up untuk riwayat lama
          baselineDone.current = true
          lastSeenId.current = newest?.id || null
          return
        }

        if (newest && newest.id !== lastSeenId.current) {
          lastSeenId.current = newest.id
          setPopup(newest)
        }
      } catch {}
    }

    check()
    const interval = setInterval(check, 15000)
    return () => {
      stopped = true
      clearInterval(interval)
    }
  }, [])

  // Tutup otomatis setelah 15 detik
  useEffect(() => {
    if (!popup) return
    const t = setTimeout(() => setPopup(null), 15000)
    return () => clearTimeout(t)
  }, [popup])

  if (!popup) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#ecebe6] rounded-[24px] border-2 border-white shadow-2xl p-6 text-center">
        {/* Ikon bintang besar */}
        <div className="mx-auto w-16 h-16 rounded-full bg-[#e85200] flex items-center justify-center shadow-lg shadow-[#e85200]/40 mb-4 animate-bounce">
          <span className="text-white text-3xl leading-none">★</span>
        </div>

        <div className="text-[10px] font-mono tracking-[0.2em] text-[#e85200] uppercase mb-1">
          Testimoni Baru Masuk
        </div>
        <h3 className="text-lg font-black text-zinc-900 mb-1">{popup.title}</h3>
        <p className="text-xs text-zinc-600 leading-relaxed mb-5">{popup.body}</p>

        <div className="flex gap-2.5">
          <button
            onClick={() => setPopup(null)}
            className="flex-1 px-4 py-2.5 rounded-full bg-white text-zinc-700 text-xs font-bold border border-zinc-300 hover:bg-zinc-100 transition"
          >
            Tutup
          </button>
          <Link
            href="/admin/testimonies"
            onClick={() => setPopup(null)}
            className="flex-1 px-4 py-2.5 rounded-full bg-[#e85200] hover:bg-[#d64800] text-white text-xs font-bold shadow-md shadow-[#e85200]/30 transition"
          >
            Lihat Testimoni &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
