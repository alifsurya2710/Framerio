'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/** Buka aplikasi e-wallet dengan deep link, fallback ke web */
function openEwallet(method: 'DANA' | 'GOPAY', amount: number, phone: string) {
  if (method === 'DANA') {
    const deepLink = `dana://pay?amount=${amount}&receiver=${encodeURIComponent(phone)}`
    const webLink = `https://link.dana.id/pay?to=${encodeURIComponent(phone)}&amount=${amount}`
    tryDeepLink(deepLink, webLink)
  } else {
    const deepLink = `gojek://gopay/merchant/pay?amount=${amount}&phone=${encodeURIComponent(phone)}`
    const webLink = `https://gojek.com/gopay`
    tryDeepLink(deepLink, webLink)
  }
}

function tryDeepLink(deepLink: string, webFallback: string) {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = deepLink
  document.body.appendChild(iframe)
  setTimeout(() => {
    document.body.removeChild(iframe)
    window.open(webFallback, '_blank')
  }, 1500)
}

export default function PaymentClient({ sub }: { sub: any }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const DANA  = process.env.NEXT_PUBLIC_DANA_NUMBER  || '0812xxxx'
  const GOPAY = process.env.NEXT_PUBLIC_GOPAY_NUMBER || '0812xxxx'
  const number = sub.method === 'DANA' ? DANA : GOPAY

  function handleOpenEwallet() {
    openEwallet(sub.method, sub.amount, number)
  }

  function handleFile(f: File | null) {
    setFile(f)
    if (!f) { setPreview(null); return }
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  async function uploadProof() {
    if (!file) return
    setUploading(true); setError('')
    const reader = new FileReader()
    reader.onload = async () => {
      const proofData = reader.result as string
      const res = await fetch(`/api/subscription/${sub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofData }),
      })
      setUploading(false)
      if (!res.ok) { setError('Gagal upload bukti. Coba lagi.'); return }
      router.refresh()
    }
    reader.readAsDataURL(file)
  }

  /* ── Status: PAID ──────────────────────────────────────── */
  if (sub.status === 'PAID') return (
    <div className="w-full max-w-md mx-auto px-4 py-12 text-center">
      <div className="retro-canvas retro-grid-bg rounded-[32px] border-2 border-white/60 p-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center text-2xl mb-5">✓</div>
        <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1">Pembayaran</div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Langganan Aktif!</h1>
        <p className="text-xs text-zinc-500 leading-relaxed mb-7">
          Akses penuh tersedia hingga{' '}
          <strong className="text-zinc-800">{new Date(sub.endsAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
        </p>
        <Link href="/booth"
          className="inline-flex items-center gap-2 btn-orange-glow px-7 py-3.5 rounded-full text-white font-extrabold text-xs tracking-wider uppercase hover:scale-105 transition-transform">
          Mulai Studio Sekarang →
        </Link>
      </div>
    </div>
  )

  /* ── Status: REJECTED ──────────────────────────────────── */
  if (sub.status === 'REJECTED') return (
    <div className="w-full max-w-md mx-auto px-4 py-12 text-center">
      <div className="retro-canvas retro-grid-bg rounded-[32px] border-2 border-white/60 p-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center font-black text-red-500 text-xl mb-5">✕</div>
        <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1">Pembayaran</div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Pembayaran Ditolak</h1>
        <p className="text-xs text-zinc-500 leading-relaxed mb-7">
          Bukti transfer tidak valid atau tidak sesuai. Silakan coba lagi dengan bukti yang benar.
        </p>
        <Link href="/pricing"
          className="inline-flex items-center gap-2 btn-orange-glow px-7 py-3.5 rounded-full text-white font-extrabold text-xs tracking-wider uppercase hover:scale-105 transition-transform">
          Coba Lagi →
        </Link>
      </div>
    </div>
  )

  /* ── Main payment form ─────────────────────────────────── */
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 sm:py-10">

      {/* Page header */}
      <div className="mb-6">
        <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1">Checkout</div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Pembayaran</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-3">

        {/* Order summary card */}
        <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-5 shadow-md">
          <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mb-4">Ringkasan Pesanan</div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-semibold text-zinc-500 mb-0.5">Order ID</div>
                <div className="font-mono text-xs text-zinc-700 bg-white/60 px-2.5 py-1 rounded-lg border border-zinc-200 inline-block">
                  {sub.orderId}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[10px] font-semibold text-zinc-500 mb-0.5">Plan</div>
                <div className="text-xs font-black text-zinc-900 uppercase tracking-wide">{sub.plan}</div>
              </div>
            </div>

            <div className="h-px bg-zinc-300/40" />

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold text-zinc-500 mb-0.5">Metode</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-[8px] font-black text-white">
                    {sub.method === 'DANA' ? 'D' : 'G'}
                  </div>
                  <span className="text-sm font-black text-zinc-900">{sub.method}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-semibold text-zinc-500 mb-0.5">Total</div>
                <div className="text-2xl font-black text-zinc-900 tabular-nums">
                  Rp {sub.amount.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer info card */}
        <div className="rounded-[24px] border-2 p-5 shadow-md" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)', borderColor: '#e85200' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#e85200] flex items-center justify-center text-white font-black text-xs">→</div>
            <span className="text-xs font-bold text-zinc-700">Transfer ke {sub.method}</span>
          </div>
          <div className="font-mono text-3xl font-black text-zinc-900 tracking-wide mb-1 select-all">
            {number}
          </div>
          <div className="text-[10px] text-zinc-500 font-semibold">a/n Framerio Studio</div>

          {/* Tombol buka aplikasi */}
          <button
            onClick={handleOpenEwallet}
            className="mt-4 w-full btn-orange-glow py-3 rounded-full text-white font-extrabold text-sm tracking-wide uppercase flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-md"
          >
            <span>Buka Aplikasi {sub.method}</span>
            <span>↗</span>
          </button>

          <div className="mt-3 flex items-start gap-2 text-[10px] text-[#c44400] bg-[#e85200]/8 px-3 py-2 rounded-xl font-semibold leading-relaxed">
            <span className="w-1 h-1 rounded-full bg-[#e85200] mt-1 flex-shrink-0" />
            Nominal transfer harus tepat <strong>Rp {sub.amount.toLocaleString('id-ID')}</strong>. Setelah bayar, upload bukti di bawah.
          </div>
        </div>

        {/* Upload section */}
        <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-5 shadow-md">
          <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mb-3">Upload Bukti Transfer</div>

          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all ${
              file ? 'border-[#e85200]/60 bg-[#e85200]/5' : 'border-zinc-300 hover:border-zinc-400 hover:bg-white/40'
            } flex flex-col items-center justify-center p-6 gap-2`}
          >
            {preview ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <img src={preview} alt="preview" className="max-h-40 rounded-xl object-contain border-2 border-white/80 shadow-sm" />
                <span className="text-[10px] font-semibold text-zinc-500">{file?.name}</span>
                <span className="text-[9px] text-[#e85200] font-bold">Klik untuk ganti gambar</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-white/60 border border-zinc-200 flex items-center justify-center text-lg">📎</div>
                <div className="text-xs font-bold text-zinc-700">Klik untuk pilih gambar</div>
                <div className="text-[10px] text-zinc-400">JPG, PNG · Maks 5MB</div>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Submit */}
        <button
          onClick={uploadProof}
          disabled={!file || uploading}
          className="w-full btn-orange-glow py-4 rounded-full text-white font-extrabold text-sm tracking-wider uppercase transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
        >
          {uploading ? 'Mengunggah...' : 'Kirim Bukti Transfer →'}
        </button>

        <p className="text-center text-[10px] text-zinc-400 leading-relaxed">
          Setelah bukti dikirim, langganan aktif otomatis sesuai paket yang dibeli.
        </p>
      </div>
    </div>
  )
}
