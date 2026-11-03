'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

type Testimony = {
  id: string
  rating: number
  date: string
  message: string
  user: { name: string | null }
}

function Stars({ rating, size = 'text-sm' }: { rating: number; size?: string }) {
  return (
    <span className={`${size} text-amber-500`} title={`${rating} dari 5 bintang`}>
      {'★'.repeat(rating)}
      <span className="text-zinc-300">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Bagian Testimoni di beranda:
 * - Menampilkan testimoni yang sudah di-approve admin.
 * - User yang login bisa mengisi bintang 1-5 + tanggal + tanggapan
 *   (masuk antrean persetujuan admin, notifikasi terkirim ke bell admin).
 */
export default function TestimonySection() {
  const { data: session } = useSession()
  const [items, setItems] = useState<Testimony[]>([])
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [date, setDate] = useState(todayStr())
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [feedback, setFeedback] = useState('')

  async function load() {
    try {
      const res = await fetch('/api/testimony')
      if (res.ok) setItems(await res.json())
    } catch {}
  }

  useEffect(() => { void load() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { setFeedback('Pilih bintang 1-5 terlebih dahulu.'); setStatus('err'); return }
    if (message.trim().length < 3) { setFeedback('Tanggapan minimal 3 karakter.'); setStatus('err'); return }

    setStatus('sending')
    setFeedback('')
    try {
      const res = await fetch('/api/testimony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, date, message: message.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim testimoni')
      setStatus('ok')
      setFeedback('✅ Terima kasih! Testimoni Anda terkirim dan menunggu persetujuan admin.')
      setRating(0)
      setMessage('')
      setDate(todayStr())
    } catch (err: any) {
      setStatus('err')
      setFeedback(err.message)
    }
  }

  return (
    <section className="mt-10">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase mb-1">Testimoni</div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Kata Mereka Tentang FramerPhotobooth</h2>
      </div>

      {/* Daftar testimoni yang sudah disetujui */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {items.map((t) => (
            <div key={t.id} className="retro-canvas rounded-2xl border-2 border-white/60 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Stars rating={t.rating} />
                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed">“{t.message}”</p>
              <div className="text-[11px] font-bold text-zinc-800 mt-2.5 truncate">
                — {t.user.name || 'Pengguna FramerPhotobooth'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="retro-canvas rounded-2xl border-2 border-white/60 py-8 px-4 text-center text-xs text-zinc-500 mb-6">
          Belum ada testimoni. Jadilah yang pertama berbagi pengalaman! ✨
        </div>
      )}

      {/* Form untuk user yang login */}
      <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-5 sm:p-6 shadow-md max-w-xl mx-auto">
        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wide mb-3">Beri Testimoni</h3>

        {session?.user ? (
          <form onSubmit={submit} className="space-y-4">
            {/* Bintang 1-5 */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Rating</label>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((s) => {
                    const active = (hover || rating) >= s
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHover(s)}
                        className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl border-2 transition-all hover:scale-105 ${
                          active
                            ? 'bg-amber-400 border-amber-500 shadow-sm'
                            : 'bg-white border-zinc-300 hover:border-amber-300'
                        }`}
                        aria-label={`${s} bintang`}
                      >
                        <span className={`text-xl leading-none ${active ? 'text-white' : 'text-zinc-400'}`}>★</span>
                        <span className={`text-[9px] font-black leading-none mt-0.5 ${active ? 'text-white' : 'text-zinc-400'}`}>{s}</span>
                      </button>
                    )
                  })}
                </div>
                {/* Angka besar di samping: menampilkan rating terpilih */}
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-[#e85200] text-white shadow-md flex-shrink-0">
                  <span className="text-2xl font-black leading-none">{rating || 0}</span>
                  <span className="text-[9px] font-bold leading-none mt-0.5 opacity-80">/ 5</span>
                </div>
              </div>
            </div>

            {/* Tanggal */}
            <div>
              <label htmlFor="testi-date" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tanggal</label>
              <input
                id="testi-date"
                type="date"
                value={date}
                max={todayStr()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                required
              />
            </div>

            {/* Tanggapan */}
            <div>
              <label htmlFor="testi-msg" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tanggapan</label>
              <textarea
                id="testi-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Ceritakan pengalamanmu memakai FramerPhotobooth..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-300 text-xs font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#e85200]/40 resize-none"
                required
              />
              <div className="text-right text-[10px] text-zinc-400 mt-1">{message.length}/500</div>
            </div>

            {feedback && (
              <div
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border ${
                  status === 'ok'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {feedback}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 rounded-full btn-orange-glow text-white text-xs font-black uppercase tracking-wider transition disabled:opacity-50"
            >
              {status === 'sending' ? 'Mengirim...' : 'Kirim Testimoni'}
            </button>
            <p className="text-center text-[10px] text-zinc-400">
              Testimoni tampil di beranda setelah disetujui admin.
            </p>
          </form>
        ) : (
          <p className="text-xs text-zinc-600 text-center py-2">
            <Link href="/login" className="text-[#e85200] font-bold hover:underline">Masuk</Link>{' '}
            untuk membagikan testimoni Anda.
          </p>
        )}
      </div>
    </section>
  )
}
