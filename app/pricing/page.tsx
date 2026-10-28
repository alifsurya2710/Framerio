'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const PLANS = {
  monthly: {
    label: 'Paket Bulanan',
    badge: 'Populer',
    amount: 10000,
    days: 30,
    desc: 'Akses penuh selama 30 hari untuk cetak dan unduh hasil foto.'
  },
  yearly: {
    label: 'Paket Tahunan',
    badge: 'Hemat',
    amount: 120000,
    days: 365,
    desc: 'Akses satu tahun penuh dengan penyimpanan cloud tanpa batasan.'
  }
}

/** Buka aplikasi e-wallet lalu fallback ke web jika tidak ter-install */
function openEwallet(method: 'DANA' | 'GOPAY', amount: number, phone: string) {
  if (method === 'DANA') {
    // Deep link DANA (mobile app)
    const deepLink = `dana://pay?amount=${amount}&receiver=${encodeURIComponent(phone)}`
    // Web fallback
    const webLink = `https://link.dana.id/pay?to=${encodeURIComponent(phone)}&amount=${amount}`
    tryDeepLink(deepLink, webLink)
  } else {
    // Deep link GoPay via Gojek
    const deepLink = `gojek://gopay/merchant/pay?amount=${amount}&phone=${encodeURIComponent(phone)}`
    const webLink = `https://gojek.com/gopay`
    tryDeepLink(deepLink, webLink)
  }
}

function tryDeepLink(deepLink: string, webFallback: string) {
  // Coba buka deep link; jika gagal (browser desktop) fallback ke web
  const start = Date.now()
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = deepLink
  document.body.appendChild(iframe)
  setTimeout(() => {
    document.body.removeChild(iframe)
    // Jika masih di halaman ini setelah 1.5 detik → app tidak ter-install
    if (Date.now() - start < 2000) {
      window.open(webFallback, '_blank')
    }
  }, 1500)
}

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [method, setMethod] = useState<'DANA' | 'GOPAY'>('DANA')
  const [loading, setLoading] = useState(false)

  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  async function handlePay() {
    if (!session?.user) { router.push('/login'); return }
    setLoading(true)
    const res = await fetch('/api/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, method }),
    })
    if (!res.ok) {
      alert('Gagal membuat pesanan')
      setLoading(false)
      return
    }
    const { orderId } = await res.json()
    // Buka aplikasi e-wallet sebelum redirect ke halaman payment
    const phone = method === 'DANA'
      ? (process.env.NEXT_PUBLIC_DANA_NUMBER || '')
      : (process.env.NEXT_PUBLIC_GOPAY_NUMBER || '')
    openEwallet(method, PLANS[plan].amount, phone)
    router.push(`/payment/${orderId}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-10">
        <span className="px-3.5 py-1 rounded-full bg-[#e85200]/10 border border-[#e85200]/30 text-[#e85200] text-xs font-bold uppercase tracking-wider">
          Langganan Premium Framerio
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 mt-3 tracking-tight">
          Pilihan Paket Berlangganan
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 mt-2 max-w-lg mx-auto font-medium">
          Nikmati akses cetak photostrip tanpa batas, frame eksklusif, dan galeri cloud tanpa kuota.
        </p>
      </div>

      {/* Plan Cards (Bisa Langsung Diklik dengan Jelas) */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {Object.entries(PLANS).map(([key, p]) => {
          const isSelected = plan === key
          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => setPlan(key as 'monthly' | 'yearly')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setPlan(key as 'monthly' | 'yearly')
                }
              }}
              className={`relative rounded-[32px] p-6 sm:p-8 transition-all duration-200 cursor-pointer flex flex-col justify-between border-4 select-none ${
                isSelected
                  ? 'bg-zinc-900 text-white border-[#e85200] shadow-2xl scale-[1.02]'
                  : 'bg-[#e4e3de] hover:bg-[#eae9e4] text-zinc-800 border-white shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isSelected
                        ? 'bg-[#e85200] text-white'
                        : 'bg-white text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    {p.badge}
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      isSelected ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    {p.days} Hari Akses
                  </span>
                </div>

                <h3 className="text-2xl font-black">{p.label}</h3>
                <p
                  className={`text-xs mt-1.5 leading-relaxed ${
                    isSelected ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  {p.desc}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span
                    className={`text-sm font-bold ${
                      isSelected ? 'text-[#e85200]' : 'text-[#e85200]'
                    }`}
                  >
                    Rp
                  </span>
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">
                    {p.amount.toLocaleString('id-ID')}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isSelected ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    /{p.days === 30 ? 'bulan' : 'tahun'}
                  </span>
                </div>
              </div>

              <div
                className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-bold ${
                  isSelected ? 'border-zinc-800 text-[#e85200]' : 'border-zinc-300 text-zinc-500'
                }`}
              >
                <span>Status Pilihan</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSelected ? 'bg-[#e85200] animate-pulse' : 'bg-zinc-400'
                    }`}
                  />
                  {isSelected ? 'Paket Terpilih' : 'Klik untuk Pilih'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Admin free banner */}
      {isAdmin && (
        <div className="mb-6 retro-canvas rounded-[24px] border-2 border-[#e85200]/40 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#e85200] flex items-center justify-center text-white font-black text-sm flex-shrink-0">★</div>
          <div>
            <div className="text-sm font-black text-zinc-900">Akun Admin — Akses Gratis Selamanya</div>
            <div className="text-xs text-zinc-500 mt-0.5">Sebagai admin, kamu tidak perlu berlangganan. Semua fitur sudah aktif.</div>
          </div>
          <a href="/booth" className="ml-auto flex-shrink-0 btn-orange-glow px-5 py-2.5 rounded-full text-white font-extrabold text-xs uppercase tracking-wide hover:scale-105 transition-transform">
            Buka Studio →
          </a>
        </div>
      )}

      {/* Payment Selection Box */}
      <div className="bg-[#e4e3de] rounded-[32px] p-6 sm:p-8 border-4 border-white shadow-xl">
        <h3 className="text-base font-black text-zinc-900 mb-3 uppercase tracking-wider">
          Metode Pembayaran E-Wallet
        </h3>

        {/* Method cards with logo */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['DANA', 'GOPAY'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`py-4 px-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                method === m
                  ? 'bg-zinc-900 border-[#e85200] text-white shadow-lg'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                method === m ? 'bg-[#e85200] text-white' : 'bg-zinc-100 text-zinc-700'
              }`}>
                {m === 'DANA' ? 'D' : 'G'}
              </div>
              <span className="text-xs sm:text-sm font-black">{m}</span>
              <span className={`text-[9px] font-semibold ${method === m ? 'text-zinc-400' : 'text-zinc-400'}`}>
                {m === 'DANA' ? 'Dana E-Wallet' : 'GoPay by Gojek'}
              </span>
            </button>
          ))}
        </div>

        {/* Info: akan dibuka otomatis */}
        <div className="mb-4 flex items-start gap-2.5 bg-white/60 rounded-2xl px-4 py-3 border border-zinc-200">
          <div className="w-5 h-5 rounded-full bg-[#e85200]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[#e85200] text-[10px] font-black">i</span>
          </div>
          <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">
            Setelah klik bayar, <strong className="text-zinc-800">aplikasi {method === 'DANA' ? 'DANA' : 'GoPay'} akan terbuka otomatis</strong> di HP atau browser kamu untuk menyelesaikan pembayaran. Lalu upload bukti transfer di halaman berikutnya.
          </p>
        </div>

        <div className="border-t border-zinc-300 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Pembayaran:</div>
            <div className="text-3xl sm:text-4xl font-black text-zinc-900 mt-0.5 tabular-nums">
              Rp {PLANS[plan].amount.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">{PLANS[plan].days} hari akses penuh</div>
          </div>
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 rounded-full btn-orange-glow text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Memproses...' : (
              <>
                <span>Bayar via {method}</span>
                <span className="text-base">→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
