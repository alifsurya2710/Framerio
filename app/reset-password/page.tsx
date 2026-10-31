'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'
import { PASSWORD_RULES, validatePassword } from '@/lib/password'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Tautan reset tidak valid. Buka link yang benar dari email Anda.')
      return
    }
    const pwError = validatePassword(password)
    if (pwError) {
      setError(pwError)
      return
    }
    if (password !== confirm) {
      setError('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Gagal mengganti kata sandi.')
        return
      }
      setDone(true)
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-[#e4e3de] rounded-[36px] p-6 sm:p-10 border-4 border-white shadow-xl">
      <div className="text-center mb-6 sm:mb-8">
        <BrandLogo width={756} height={155} className="mx-auto mb-4 h-auto w-[184px]" />
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight uppercase">
          Kata Sandi Baru
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-medium">
          Buat kata sandi baru untuk akun Anda
        </p>
      </div>

      {done ? (
        <div className="space-y-5 text-center">
          <div className="bg-green-50 border-2 border-green-300 text-green-800 p-4 rounded-2xl text-sm font-medium leading-relaxed">
            ✅ Kata sandi berhasil diganti!
          </div>
          <Link
            href="/login"
            className="block w-full btn-orange-glow text-white py-3.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Masuk Sekarang
          </Link>
        </div>
      ) : !token ? (
        <div className="space-y-5">
          <div className="bg-rose-100 border border-rose-300 text-rose-700 p-4 rounded-2xl text-sm font-medium">
            ⚠️ Tautan reset tidak valid. Silakan minta tautan baru.
          </div>
          <Link
            href="/forgot-password"
            className="block text-center text-[#e85200] hover:underline font-bold text-xs"
          >
            Minta tautan reset baru
          </Link>
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
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-white border border-zinc-300 rounded-2xl px-4 py-3 pr-12 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#e85200]/50 focus:border-[#e85200] transition text-sm shadow-inner"
                placeholder="Min. 8 karakter, ada A-Z, a-z, 0-9, @$!%*?&"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 p-1.5 transition"
                title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            {/* Checklist syarat password */}
            {password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(password)
                  return (
                    <li
                      key={rule.id}
                      className={`flex items-center gap-1.5 text-[10px] font-semibold ${
                        ok ? 'text-green-600' : 'text-zinc-400'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black flex-shrink-0 ${
                          ok ? 'bg-green-500 text-white' : 'bg-zinc-200 text-zinc-400'
                        }`}
                      >
                        {ok ? '✓' : '✕'}
                      </span>
                      {rule.label}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
              Konfirmasi Kata Sandi
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full bg-white border border-zinc-300 rounded-2xl px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#e85200]/50 focus:border-[#e85200] transition text-sm shadow-inner"
              placeholder="Ulangi kata sandi baru"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {confirm.length > 0 && (
              <p
                className={`mt-1.5 text-[10px] font-bold ${
                  confirm === password ? 'text-green-600' : 'text-rose-500'
                }`}
              >
                {confirm === password ? '✓ Cocok' : '✕ Belum cocok'}
              </p>
            )}
          </div>

          <button
            disabled={loading}
            className="w-full mt-2 btn-orange-glow text-white py-3.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan...' : 'Ganti Kata Sandi'}
          </button>
        </form>
      )}

      <div className="mt-6 pt-5 border-t border-zinc-300 text-center">
        <p className="text-xs text-zinc-600 font-medium">
          <Link href="/login" className="text-[#e85200] hover:underline font-bold">
            ← Kembali ke halaman masuk
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      {/* useSearchParams butuh boundary Suspense untuk prerender */}
      <Suspense
        fallback={
          <div className="w-full max-w-md text-center py-20 text-zinc-500 text-sm font-mono">
            Memuat...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
