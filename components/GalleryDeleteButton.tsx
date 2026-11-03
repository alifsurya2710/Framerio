'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Tombol hapus foto untuk pemiliknya (role USER) di halaman Galeri.
 * Menghapus lewat DELETE /api/photos/[id] lalu refresh server component.
 */
export default function GalleryDeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const onDelete = async () => {
    if (!confirm('Hapus foto ini dari galeri Anda? Tindakan ini tidak bisa dibatalkan.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Gagal menghapus foto')
      }
      router.refresh()
    } catch (e: any) {
      alert(e.message)
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={onDelete}
      disabled={deleting}
      className="block w-full text-center text-[10px] font-bold py-2 rounded-xl bg-white border border-rose-300 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors disabled:opacity-50"
    >
      {deleting ? 'Menghapus...' : '✕ Hapus'}
    </button>
  )
}
