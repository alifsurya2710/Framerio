'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import MathCaptcha from '@/components/MathCaptcha'
import BrandLogo from '@/components/BrandLogo'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [captchaValid, setCaptchaValid] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!captchaValid) {
      setError('Selesaikan verifikasi matematika dengan benar.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Pendaftaran akun gagal.')
    } else {
      // Langsung login otomatis menggunakan identifier (bisa username atau email)
      await signIn('credentials', {
        identifier: form.email,
        password: form.password,
        callbackUrl: '/booth'
      })
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-[#e4e3de] rounded-[36px] p-6 sm:p-10 border-4 border-white shadow-xl">
        <div className="text-center mb-6 sm:mb-8">
          <BrandLogo
            width={756}
            height={155}
            className="mx-auto mb-4 h-auto w-[184px]"
          />
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight uppercase">
            Pendaftaran Akun
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-medium">
            Dapatkan uji coba gratis 7 hari di Framerio
          </p>
        </div>

        {error && (
          <div className="bg-rose-100 border border-rose-300 text-rose-700 p-3.5 rounded-2xl mb-5 text-xs sm:text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
              Username Unik
            </label>
            <input
              type="text"
              required
              className="w-full bg-white border border-zinc-300 rounded-2xl px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#e85200]/50 focus:border-[#e85200] transition text-sm shadow-inner"
              placeholder="Contoh: namakamu"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
              Alamat Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-white border border-zinc-300 rounded-2xl px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#e85200]/50 focus:border-[#e85200] transition text-sm shadow-inner"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                className="w-full bg-white border border-zinc-300 rounded-2xl px-4 py-3 pr-12 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#e85200]/50 focus:border-[#e85200] transition text-sm shadow-inner"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 p-1.5 transition"
                title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <MathCaptcha onValidate={setCaptchaValid} />

          <button
            disabled={loading || !captchaValid}
            className="w-full mt-2 btn-orange-glow text-white py-3.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Mendaftarkan Akun...' : 'Daftar dan Mulai Akses'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-300 text-center">
          <p className="text-xs text-zinc-600 font-medium">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-[#e85200] hover:underline font-bold">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
