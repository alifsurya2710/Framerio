'use client'
import { useState } from 'react'

interface Sub {
  id: string
  orderId: string
  plan: string
  method: string
  amount: number
  status: string
  proofData: string | null
  createdAt: string
  endsAt: string | null
  userId: string
  user: { email: string; name?: string | null }
}

type UserOption = { id: string; email: string; name: string | null }

type FormState = {
  userId: string
  plan: 'monthly' | 'yearly'
  method: 'DANA' | 'GOPAY'
  status: 'PENDING' | 'PAID' | 'REJECTED' | 'EXPIRED'
  amount: string
  endsAt: string
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  PAID: { label: 'Aktif', cls: 'bg-green-100 text-green-700 border-green-200' },
  PENDING: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  REJECTED: { label: 'Ditolak', cls: 'bg-red-100 text-red-700 border-red-200' },
  EXPIRED: { label: 'Kadaluarsa', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
}

const PLAN_AMOUNT = { monthly: 10000, yearly: 120000 }

function daysLeft(endsAt: string | null, status: string): number | null {
  if (status !== 'PAID' || !endsAt) return null
  const ms = new Date(endsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

function daysLeftLabel(days: number | null) {
  if (days === null) return '—'
  if (days === 0) return 'Habis hari ini'
  if (days === 1) return '1 hari lagi'
  return `${days} hari lagi`
}

function emptyForm(users: UserOption[]): FormState {
  return {
    userId: users[0]?.id || '',
    plan: 'monthly',
    method: 'DANA',
    status: 'PENDING',
    amount: String(PLAN_AMOUNT.monthly),
    endsAt: '',
  }
}

function toDateInput(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 10)
}

export default function AdminSubsList({
  subs,
  users,
}: {
  subs: Sub[]
  users: UserOption[]
}) {
  const [viewProof, setViewProof] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Sub | null>(null)
  const [form, setForm] = useState<FormState>(() => emptyForm(users))
  const [error, setError] = useState('')

  function openCreate() {
    setEditing(null)
    setForm(emptyForm(users))
    setError('')
    setModal('create')
  }

  function openEdit(s: Sub) {
    setEditing(s)
    setForm({
      userId: s.userId,
      plan: s.plan === 'yearly' ? 'yearly' : 'monthly',
      method: s.method === 'GOPAY' ? 'GOPAY' : 'DANA',
      status: (['PENDING', 'PAID', 'REJECTED', 'EXPIRED'].includes(s.status)
        ? s.status
        : 'PENDING') as FormState['status'],
      amount: String(s.amount),
      endsAt: toDateInput(s.endsAt),
    })
    setError('')
    setModal('edit')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      userId: form.userId,
      plan: form.plan,
      method: form.method,
      status: form.status,
      amount: Number(form.amount) || PLAN_AMOUNT[form.plan],
      endsAt: form.endsAt || undefined,
    }

    const res =
      modal === 'create'
        ? await fetch('/api/admin/subscriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/admin/subscriptions/${editing!.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plan: payload.plan,
              method: payload.method,
              status: payload.status,
              amount: payload.amount,
              endsAt: form.endsAt || null,
            }),
          })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Gagal menyimpan')
      return
    }
    window.location.reload()
  }

  async function quickStatus(id: string, status: 'PAID' | 'REJECTED') {
    if (!confirm(`Set status ke ${status === 'PAID' ? 'AKTIF' : 'DITOLAK'}?`)) return
    setLoading(true)
    const res = await fetch(`/api/admin/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    if (!res.ok) {
      alert('Gagal mengupdate status.')
      return
    }
    window.location.reload()
  }

  async function remove(s: Sub) {
    if (!confirm(`Hapus order ${s.orderId}?`)) return
    setLoading(true)
    const res = await fetch(`/api/admin/subscriptions/${s.id}`, { method: 'DELETE' })
    setLoading(false)
    if (!res.ok) {
      alert('Gagal menghapus.')
      return
    }
    window.location.reload()
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={openCreate}
          disabled={users.length === 0}
          className="px-4 py-2.5 rounded-xl bg-[#e85200] hover:bg-[#d64800] text-white text-xs font-bold shadow-md shadow-[#e85200]/25 transition disabled:opacity-40"
        >
          + Tambah Subscription
        </button>
      </div>

      {subs.length === 0 ? (
        <div className="bg-[#d4d3cf] rounded-2xl border border-zinc-400/30 py-20 text-center">
          <div className="text-4xl mb-3 opacity-30">◇</div>
          <div className="text-sm font-semibold text-zinc-500">Belum ada pesanan masuk.</div>
        </div>
      ) : (
        <div className="bg-[#d4d3cf] rounded-2xl border border-zinc-400/30 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-400/30 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700">Semua Pesanan</span>
            <span className="text-[10px] font-mono text-zinc-500">{subs.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-zinc-400/30">
                  {['Order ID', 'User', 'Plan', 'Metode', 'Nominal', 'Status', 'Sisa', 'Aksi'].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase ${
                        h === 'Nominal' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => {
                  const st = statusConfig[s.status] ?? {
                    label: s.status,
                    cls: 'bg-zinc-100 text-zinc-500 border-zinc-200',
                  }
                  const left = daysLeft(s.endsAt, s.status)
                  const expired = s.status === 'PAID' && left === 0
                  return (
                    <tr key={s.id} className="border-b border-zinc-400/20 hover:bg-white/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[10px] text-zinc-500 bg-white/60 px-2 py-0.5 rounded-lg border border-zinc-300">
                          {s.orderId.slice(0, 14)}…
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-semibold text-zinc-700 truncate max-w-[160px] block">
                          {s.user.email}
                        </span>
                        {s.user.name && (
                          <span className="text-[10px] text-zinc-500 font-mono">{s.user.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-bold text-zinc-800 uppercase tracking-wide">
                          {s.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold text-zinc-600 bg-white/60 border border-zinc-300 px-2 py-0.5 rounded-lg">
                          {s.method}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-xs font-black text-zinc-800 tabular-nums">
                          Rp {s.amount.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            expired ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : st.cls
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              expired
                                ? 'bg-zinc-400'
                                : s.status === 'PAID'
                                  ? 'bg-green-500'
                                  : s.status === 'PENDING'
                                    ? 'bg-amber-500 animate-pulse'
                                    : 'bg-red-400'
                            }`}
                          />
                          {expired ? 'Habis' : st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {left === null ? (
                          <span className="text-[11px] text-zinc-400">—</span>
                        ) : (
                          <div>
                            <div
                              className={`text-[11px] font-bold tabular-nums ${
                                left <= 3 ? 'text-red-600' : left <= 7 ? 'text-amber-700' : 'text-green-700'
                              }`}
                            >
                              {daysLeftLabel(left)}
                            </div>
                            {s.endsAt && (
                              <div className="text-[9px] text-zinc-500 font-mono mt-0.5">
                                s/d {new Date(s.endsAt).toLocaleDateString('id-ID')}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {s.proofData && (
                            <button
                              onClick={() => setViewProof(s.proofData)}
                              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white/60 hover:bg-white text-zinc-700 border border-zinc-300 transition whitespace-nowrap"
                            >
                              Bukti
                            </button>
                          )}
                          {s.status === 'PENDING' && (
                            <button
                              onClick={() => quickStatus(s.id, 'PAID')}
                              disabled={loading}
                              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50 whitespace-nowrap"
                            >
                              Aktifkan
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(s)}
                            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-white/60 hover:bg-white text-zinc-700 border border-zinc-300 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => remove(s)}
                            disabled={loading}
                            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition disabled:opacity-50"
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
          </div>
        </div>
      )}

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
                {modal === 'create' ? 'Tambah Subscription' : 'Edit Subscription'}
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

              {modal === 'create' && (
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">User</span>
                  <select
                    required
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email}{u.name ? ` (${u.name})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {modal === 'edit' && editing && (
                <div className="text-xs text-zinc-600 bg-white/60 border border-zinc-300 rounded-xl px-3 py-2.5">
                  <div className="font-mono text-[10px] text-zinc-500">{editing.orderId}</div>
                  <div className="font-semibold mt-0.5">{editing.user.email}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Plan</span>
                  <select
                    value={form.plan}
                    onChange={(e) => {
                      const plan = e.target.value as 'monthly' | 'yearly'
                      setForm({ ...form, plan, amount: String(PLAN_AMOUNT[plan]) })
                    }}
                    className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Metode</span>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value as 'DANA' | 'GOPAY' })}
                    className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                  >
                    <option value="DANA">DANA</option>
                    <option value="GOPAY">GOPAY</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</span>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as FormState['status'] })
                    }
                    className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nominal</span>
                  <input
                    type="number"
                    min={0}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Berakhir {form.status === 'PAID' && <span className="normal-case font-normal">(opsional, auto jika kosong)</span>}
                </span>
                <input
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="mt-1 w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85200]/40"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-full bg-[#e85200] hover:bg-[#d64800] text-white text-xs font-extrabold uppercase tracking-wider disabled:opacity-50 transition"
              >
                {loading ? 'Menyimpan...' : modal === 'create' ? 'Buat Subscription' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {viewProof && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm"
          onClick={() => setViewProof(null)}
        >
          <div
            className="relative bg-[#ecebe6] rounded-[28px] border-2 border-white shadow-2xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-zinc-300 flex items-center justify-between">
              <span className="text-sm font-black text-zinc-900">Bukti Pembayaran</span>
              <button
                onClick={() => setViewProof(null)}
                className="w-7 h-7 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-600 flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <img src={viewProof} alt="Bukti pembayaran" className="w-full rounded-xl object-contain max-h-[65vh]" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
