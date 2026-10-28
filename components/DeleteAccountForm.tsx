'use client'
import { useState } from 'react'
import { signOut } from 'next-auth/react'

export default function DeleteAccountForm() {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (confirmText.trim().toUpperCase() !== 'HAPUS') {
      setError('Ketik HAPUS untuk konfirmasi.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Gagal menghapus akun.')
      return
    }

    await signOut({ callbackUrl: '/?deleted=1' })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition"
      >
        Hapus Akun Saya
      </button>
    )
  }

  return (
    <form onSubmit={handleDelete} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <p className="text-xs text-zinc-600 leading-relaxed">
        Tindakan ini permanen. Foto, langganan, dan data akun akan dihapus.
      </p>

      <label className="block">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Password saat ini
        </span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          placeholder="Masukkan password"
          autoComplete="current-password"
        />
      </label>

      <label className="block">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Ketik HAPUS untuk konfirmasi
        </span>
        <input
          type="text"
          required
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          placeholder="HAPUS"
        />
      </label>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
        >
          {loading ? 'Menghapus...' : 'Ya, Hapus Permanen'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setOpen(false)
            setPassword('')
            setConfirmText('')
            setError('')
          }}
          className="px-5 py-2.5 rounded-full text-xs font-bold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
