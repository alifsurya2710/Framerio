'use client'
import { useState } from 'react'
import Link from 'next/link'
import MathCaptcha from '@/components/MathCaptcha'
import BrandLogo from '@/components/BrandLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [captchaValid, setCaptchaValid] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!captchaValid) {
      setError('Selesaikan verifikasi matematika terlebih dahulu.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Gagal mengirim permintaan reset.')
        return
      }
      setSent(true)
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-[#e4e3de] rounded-[36px] p-6 sm:p-10 border-4 border-white shadow-xl">
        <div className="text-center mb-6 sm:mb-8">
          <BrandLogo width={756} height={155} className="mx-auto mb-4 h-auto w-[184px]" />
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight uppercase">
            Lupa Kata Sandi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-medium">
            Kami akan mengirim tautan reset ke email Anda
          </p>
        </div>

        {sent ? (
          <div className="space-y-5">
            <div className="bg-green-50 border-2 border-green-300 text-green-800 p-4 rounded-2xl text-sm font-medium leading-relaxed">
              ✅ Permintaan terkirim!<br />
              Jika email Anda terdaftar, cek <strong>inbox</strong> (atau folder
              <strong> spam</strong>) untuk tautan reset. Tautan berlaku 60 menit.
            </div>
            <button
              onClick={() => {
                setSent(false)
                setCaptchaValid(false)
              }}
              className="w-full py-3 rounded-full bg-white border border-zinc-300 text-zinc-700 text-xs font-black uppercase tracking-wider hover:bg-zinc-50 transition"
            >
              Kirim ke email lain
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-100 border border-rose-300 text-rose-700 p-3.5 rounded-2xl text-xs sm:text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
                Alamat Email
              </label>
              <input
                type="email"
                required
                className="w-full bg-white border border-zinc-300 rounded-2xl px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#e85200]/50 focus:border-[#e85200] transition text-sm shadow-inner"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <MathCaptcha onValidate={setCaptchaValid} />

            <button
              disabled={loading || !captchaValid}
              className="w-full mt-2 btn-orange-glow text-white py-3.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-zinc-300 text-center">
          <p className="text-xs text-zinc-600 font-medium">
            Ingat kata sandi Anda?{' '}
            <Link href="/login" className="text-[#e85200] hover:underline font-bold">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
