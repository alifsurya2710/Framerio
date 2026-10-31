'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PASSWORD_RULES } from '@/lib/password'

type Props = {
  initialName: string
  initialEmail: string
}

/** Input password dengan ikon mata (lihat/sembunyikan) */
function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  invalid,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
  invalid?: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <label className="block">
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="relative mt-1">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`w-full bg-white border rounded-xl px-3 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40 ${
            invalid ? 'border-red-300' : 'border-zinc-300'
          }`}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Sembunyikan password' : 'Lihat password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition"
        >
          {show ? (
            /* mata terbuka */
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            /* mata coret */
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </button>
      </div>
    </label>
  )
}

export default function AccountEditForm({ initialName, initialEmail }: Props) {
  const router = useRouter()
  const { update } = useSession()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  const changingPassword = newPassword.length > 0

  function resetForm() {
    setName(initialName)
    setEmail(initialEmail)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowNewPassword(false)
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('Nama tidak boleh kosong.')
      return
    }
    if (changingPassword) {
      const failed = PASSWORD_RULES.filter((r) => !r.test(newPassword))
      if (failed.length > 0) {
        setError(`Password belum memenuhi: ${failed.map((r) => r.label).join(', ')}`)
        return
      }
      if (newPassword !== confirmPassword) {
        setError('Konfirmasi password tidak cocok.')
        return
      }
      if (!currentPassword) {
        setError('Password saat ini wajib diisi untuk ganti password.')
        return
      }
    }

    setLoading(true)
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        currentPassword: changingPassword ? currentPassword : undefined,
        newPassword: changingPassword ? newPassword : undefined,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Gagal menyimpan perubahan.')
      return
    }

    setSuccess('Profil berhasil disimpan!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    // Sinkronkan nama/email di session (navbar) lalu refresh data server
    await update({ name: data.user?.name, email: data.user?.email })
    router.refresh()
    setTimeout(() => {
      setOpen(false)
      setSuccess('')
    }, 1200)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-1.5 rounded-full text-[10px] font-bold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 shadow-sm transition"
      >
        ✏️ Edit Profil
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm"
      onClick={() => !loading && setOpen(false)}
    >
      <div
        className="relative bg-[#ecebe6] rounded-[28px] border-2 border-white shadow-2xl overflow-x-hidden overflow-y-auto max-h-[90vh] max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-zinc-300 flex items-center justify-between sticky top-0 bg-[#ecebe6] z-10">
          <span className="text-sm font-black text-zinc-900">Edit Profil</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="w-7 h-7 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-600 flex items-center justify-center text-xs font-bold transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-xs font-semibold">
              {success}
            </div>
          )}

          <label className="block">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Nama Pengguna
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
              placeholder="Nama pengguna"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Gmail / Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
              placeholder="email@gmail.com"
              autoComplete="email"
            />
          </label>

          <div className="pt-1 border-t border-zinc-300">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-3">
              Ganti Password <span className="normal-case font-medium text-zinc-400">(opsional — isi hanya jika ingin ganti)</span>
            </div>
          </div>

          <PasswordField
            label="Password Saat Ini"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Wajib saat ganti password"
            autoComplete="current-password"
            required={changingPassword}
          />

          <label className="block">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Password Baru
            </span>
            <div className="relative mt-1">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                placeholder="Min. 8 karakter, ada A-Z, a-z, 0-9, @$!%*?&"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((s) => !s)}
                aria-label={showNewPassword ? 'Sembunyikan password' : 'Lihat password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showNewPassword ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            {/* Checklist syarat password */}
            {changingPassword && (
              <ul className="mt-2 space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(newPassword)
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
          </label>

          {changingPassword && (
            <>
              <PasswordField
                label="Konfirmasi Password Baru"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Ulangi password baru"
                autoComplete="new-password"
                invalid={!!confirmPassword && confirmPassword !== newPassword}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[10px] font-semibold text-red-600 -mt-1">Konfirmasi tidak cocok.</p>
              )}
            </>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-white bg-[#e85200] hover:bg-[#ff5d07] disabled:opacity-50 shadow-md transition"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
