'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import MathCaptcha from '@/components/MathCaptcha'
import BrandLogo from '@/components/BrandLogo'

const PASSWORD_RULES = [
  { id: 'length', label: 'Minimal 8 karakter',  test: (p: string) => p.length >= 8 },
  { id: 'upper',  label: 'Huruf besar (A-Z)',    test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower',  label: 'Huruf kecil (a-z)',    test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'Angka (0-9)',           test: (p: string) => /[0-9]/.test(p) },
  { id: 'symbol', label: 'Simbol (@$!%*?&)',     test: (p: string) => /[@$!%*?&]/.test(p) },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [captchaValid, setCaptchaValid] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const passwordChecks = PASSWORD_RULES.map(r => ({ ...r, passed: r.test(form.password) }))
  const allPassed = passwordChecks.every(r => r.passed)
  const passedCount = passwordChecks.filter(r => r.passed).length

  const strengthColor =
    passedCount <= 1 ? 'bg-red-500' :
    passedCount <= 2 ? 'bg-orange-500' :
    passedCount <= 3 ? 'bg-yellow-500' :
    passedCount <= 4 ? 'bg-blue-500' :
    'bg-emerald-500'

  const strengthLabel =
    passedCount <= 1 ? 'Sangat Lemah' :
    passedCount <= 2 ? 'Lemah' :
    passedCount <= 3 ? 'Cukup' :
    passedCount <= 4 ? 'Kuat' :
    'Sangat Kuat'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!captchaValid) {
      setError('Selesaikan verifikasi matematika dengan benar.')
      return
    }

    if (!allPassed) {
      setError('Kata sandi belum memenuhi semua persyaratan.')
      setPasswordTouched(true)
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

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <BrandLogo width={756} height={155} className="mx-auto mb-4 h-auto w-[184px]" />
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

          {/* Username */}
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

          {/* Email */}
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

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className={`w-full bg-white border rounded-2xl px-4 py-3 pr-12 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 transition text-sm shadow-inner ${
                  passwordTouched && !allPassed
                    ? 'border-red-400 focus:ring-red-400/50 focus:border-red-400'
                    : allPassed && form.password
                    ? 'border-emerald-400 focus:ring-emerald-400/50 focus:border-emerald-400'
                    : 'border-zinc-300 focus:ring-[#e85200]/50 focus:border-[#e85200]'
                }`}
                placeholder="Buat kata sandi yang kuat"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value })
                  setPasswordTouched(true)
                }}
                onFocus={() => setPasswordTouched(true)}
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

            {/* Strength bar + Checklist */}
            {passwordTouched && form.password && (
              <div className="mt-2.5 bg-white rounded-2xl border border-zinc-200 p-3 space-y-2.5 shadow-sm">
                {/* Strength bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Kekuatan</span>
                    <span className={`text-[10px] font-black ${
                      passedCount <= 2 ? 'text-red-500' :
                      passedCount <= 3 ? 'text-yellow-600' :
                      passedCount <= 4 ? 'text-blue-600' : 'text-emerald-600'
                    }`}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${(passedCount / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="grid grid-cols-1 gap-1.5">
                  {passwordChecks.map((rule) => (
                    <div key={rule.id} className="flex items-center gap-2">
                      <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                        rule.passed ? 'bg-emerald-500' : 'bg-zinc-200'
                      }`}>
                        {rule.passed ? (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        )}
                      </div>
                      <span className={`text-[11px] font-medium transition-colors ${
                        rule.passed ? 'text-emerald-700' : 'text-zinc-500'
                      }`}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <MathCaptcha onValidate={setCaptchaValid} />

          <button
            disabled={loading || !captchaValid || !allPassed}
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
