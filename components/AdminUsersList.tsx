'use client'
import { useState } from 'react'

export type AdminUserRow = {
  id: string
  email: string
  name: string | null
  role: string
  trialEndsAt: string
  photoCount: number
  subscription: {
    plan: string
    endsAt: string
  } | null
}

type FormState = {
  name: string
  email: string
  password: string
  role: 'USER' | 'ADMIN'
  trialEndsAt: string
}

const emptyForm = (): FormState => ({
  name: '',
  email: '',
  password: '',
  role: 'USER',
  trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
})

function toDateInput(iso: string) {
  return new Date(iso).toISOString().slice(0, 10)
}

export default function AdminUsersList({
  users,
  currentAdminId,
}: {
  users: AdminUserRow[]
  currentAdminId: string
}) {
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<AdminUserRow | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setError('')
    setModal('create')
  }

  function openEdit(u: AdminUserRow) {
    setEditing(u)
    setForm({
      name: u.name || '',
      email: u.email,
      password: '',
      role: u.role === 'ADMIN' ? 'ADMIN' : 'USER',
      trialEndsAt: toDateInput(u.trialEndsAt),
    })
    setError('')
    setModal('edit')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      role: form.role,
      trialEndsAt: form.trialEndsAt,
    }
    if (form.password) payload.password = form.password

    const res =
      modal === 'create'
        ? await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, password: form.password }),
          })
        : await fetch(`/api/admin/users/${editing!.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Gagal menyimpan')
      return
    }
    window.location.reload()
  }

  async function remove(u: AdminUserRow) {
    if (u.id === currentAdminId) {
      alert('Tidak bisa menghapus akun sendiri.')
      return
    }
    if (!confirm(`Hapus user ${u.email}? Foto & langganan ikut terhapus.`)) return
    setLoading(true)
    const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Gagal menghapus')
      return
    }
    window.location.reload()
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-[#e85200] hover:bg-[#d64800] text-white text-xs font-bold shadow-md shadow-[#e85200]/25 transition"
        >
          + Tambah User
        </button>
      </div>

      <div className="bg-[#d4d3cf] rounded-2xl border border-zinc-400/30 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-400/30 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-700">Semua Akun</span>
          <span className="text-[10px] font-mono text-zinc-500">{users.length} total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-zinc-400/30">
                {['Akun', 'Role', 'Trial s/d', 'Langganan', 'Foto', 'Aksi'].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase ${
                      h === 'Foto' || h === 'Aksi' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const sub = u.subscription
                const active = sub && new Date(sub.endsAt) > new Date()
                return (
                  <tr key={u.id} className="border-b border-zinc-400/20 hover:bg-white/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-800">{u.email}</div>
                          {u.name && <div className="text-[10px] text-zinc-500 font-mono">{u.name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                          u.role === 'ADMIN'
                            ? 'bg-[#e85200] text-white'
                            : 'bg-white/60 text-zinc-600 border border-zinc-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {new Date(u.trialEndsAt).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {active ? (() => {
                        const left = Math.max(
                          0,
                          Math.ceil((new Date(sub!.endsAt).getTime() - Date.now()) / 86400000)
                        )
                        const tone =
                          left <= 3 ? 'text-red-600' : left <= 7 ? 'text-amber-700' : 'text-green-700'
                        const dot =
                          left <= 3 ? 'bg-red-500 animate-pulse' : left <= 7 ? 'bg-amber-500' : 'bg-green-500'
                        return (
                          <div>
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${tone}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                              {left === 0 ? 'Habis hari ini' : `${left} hari lagi`}
                            </span>
                            <div className="text-[9px] text-zinc-500 font-mono mt-0.5">
                              {sub!.plan.toUpperCase()} · s/d {new Date(sub!.endsAt).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                        )
                      })() : (
                        <span className="text-[11px] text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs font-bold text-zinc-700 tabular-nums">{u.photoCount}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(u)}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white/60 hover:bg-white text-zinc-700 border border-zinc-300 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(u)}
                          disabled={loading || u.id === currentAdminId}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition disabled:opacity-40"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="py-16 text-center text-zinc-500 text-sm">Belum ada user terdaftar.</div>
          )}
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm"
          onClick={() => !loading && setModal(null)}
        >
          <div
            className="relative bg-[#ecebe6] rounded-[28px] border-2 border-white shadow-2xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-zinc-300 flex items-center justify-between">
              <span className="text-sm font-black text-zinc-900">
                {modal === 'create' ? 'Tambah User' : 'Edit User'}
              </span>
              <button
                onClick={() => setModal(null)}
                className="w-7 h-7 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-600 flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nama</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                  placeholder="Username"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Password {modal === 'edit' && <span className="normal-case font-normal">(kosongkan jika tidak diubah)</span>}
                </span>
                <input
                  type="password"
                  required={modal === 'create'}
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                  placeholder="Min. 8 karakter"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Role</span>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as 'USER' | 'ADMIN' })}
                    className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Trial s/d</span>
                  <input
                    type="date"
                    required
                    value={form.trialEndsAt}
                    onChange={(e) => setForm({ ...form, trialEndsAt: e.target.value })}
                    className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-full bg-[#e85200] hover:bg-[#d64800] text-white text-xs font-extrabold uppercase tracking-wider disabled:opacity-50 transition"
              >
                {loading ? 'Menyimpan...' : modal === 'create' ? 'Buat User' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
