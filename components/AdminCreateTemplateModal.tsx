'use client'

import { useState, useRef } from 'react'

interface AdminCreateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const LAYOUT_MAP: Record<number, string> = {
  1: 'solo', 2: 'strip2', 3: 'strip3', 4: 'strip4',
  5: 'grid6', 6: 'grid6', 7: 'grid8', 8: 'grid8',
  9: 'grid8', 10: 'grid8'
}

const SHAPE_OPTIONS = [
  {
    id: 'rectangle',
    label: 'Persegi',
    preview: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <rect x="4" y="4" width="32" height="32" rx="2" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 'rounded',
    label: 'Bulat Sudut',
    preview: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <rect x="4" y="4" width="32" height="32" rx="12" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 'circle',
    label: 'Lingkaran',
    preview: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <circle cx="20" cy="20" r="16" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 'heart',
    label: 'Hati',
    preview: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <path d="M20 34 C20 34 4 24 4 14 C4 9 8 6 12 6 C15.5 6 18 8 20 10.5 C22 8 24.5 6 28 6 C32 6 36 9 36 14 C36 24 20 34 20 34Z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 'star',
    label: 'Bintang',
    preview: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <polygon points="20,4 24,15 36,15 26,23 30,35 20,27 10,35 14,23 4,15 16,15" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 'hexagon',
    label: 'Heksagon',
    preview: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <polygon points="20,4 35,12 35,28 20,36 5,28 5,12" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 'diamond',
    label: 'Berlian',
    preview: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <polygon points="20,4 36,20 20,36 4,20" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 'triangle',
    label: 'Segitiga',
    preview: (
      <svg viewBox="0 0 40 40" className="w-8 h-8">
        <polygon points="20,4 36,36 4,36" fill="currentColor"/>
      </svg>
    )
  },
]

export default function AdminCreateTemplateModal({
  isOpen, onClose, onSuccess
}: AdminCreateTemplateModalProps) {
  const [name, setName] = useState('')
  const [photosCount, setPhotosCount] = useState<number>(4)
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [bgImageName, setBgImageName] = useState<string>('')
  const [isPublic, setIsPublic] = useState(true)
  const [photoShape, setPhotoShape] = useState<string>('rectangle')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) { setErrorMsg('Ukuran file maksimal 8MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setBgImage(ev.target?.result as string)
      setBgImageName(file.name)
      setErrorMsg('')
    }
    reader.onerror = () => setErrorMsg('Gagal membaca gambar dari perangkat')
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setBgImage(null)
    setBgImageName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleReset = () => {
    setName('')
    setPhotosCount(4)
    setBgImage(null)
    setBgImageName('')
    setIsPublic(true)
    setPhotoShape('rectangle')
    setErrorMsg('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setErrorMsg('Nama template tidak boleh kosong'); return }
    if (!bgImage) { setErrorMsg('Gambar template wajib diunggah'); return }

    setLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: 'Kustom',
          tag: 'Official',
          tagColor: 'bg-orange-500 text-white',
          photosCount,
          recommendedLayout: LAYOUT_MAP[photosCount] || 'strip4',
          bg: '#ffffff',
          bgImage,
          frame: '#000000',
          frameWidth: 0,
          rounded: 8,
          gap: 10,
          pad: 16,
          textColor: '#1c1c1c',
          labelText: name.trim(),
          subText: 'FRAMERPHOTOBOOTH',
          filter: 'none',
          styleType: 'custom',
          photoShape,
          isPublic
        })
      })
      const data = await res.json()
      if (data.success) {
        handleReset()
        onSuccess()
        onClose()
      } else {
        setErrorMsg(data.message || 'Gagal menyimpan template')
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#f5f4ef] rounded-3xl border-2 border-white shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative text-zinc-900">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center text-zinc-700 font-bold text-sm"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#e85200] text-white mb-2">
            ▣ Admin · Buat Template
          </div>
          <h2 className="text-xl font-black tracking-tight">Tambah Template Baru</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Upload gambar desain template dari perangkat. Pilih jumlah kolase sesuai desain.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 text-xs">

          {/* Upload Area */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">
              Gambar Template <span className="text-red-500">*</span>
            </label>
            <div className="bg-white rounded-2xl border-2 border-dashed border-[#e85200]/50 hover:border-[#e85200] transition-colors p-4">
              {bgImage ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-zinc-200" style={{ aspectRatio: '9/16', maxHeight: 280 }}>
                    <img src={bgImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-end">
                      <div className="w-full p-2 bg-black/40 backdrop-blur-sm">
                        <p className="text-white text-[10px] font-mono truncate">✔ {bgImageName}</p>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={handleRemoveImage} className="w-full py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition">
                    🗑 Ganti / Hapus Gambar
                  </button>
                </div>
              ) : (
                <label htmlFor="admin-template-file-upload" className="flex flex-col items-center justify-center gap-3 py-10 cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 border-2 border-dashed border-[#e85200]/60 flex items-center justify-center text-3xl">📤</div>
                  <div className="text-center">
                    <p className="font-black text-zinc-800 text-sm">Pilih Gambar dari Perangkat</p>
                    <p className="text-zinc-500 text-[10px] mt-1">PNG, JPG, SVG — Maks. 8MB</p>
                    <p className="text-zinc-400 text-[10px]">Galeri HP / Folder Laptop</p>
                  </div>
                  <span className="px-5 py-2 rounded-xl bg-[#e85200] text-white font-bold text-xs hover:bg-[#ff5d07] transition">Buka Galeri</span>
                </label>
              )}
              <input ref={fileInputRef} id="admin-template-file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>

          {/* Nama Template */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">
              Nama Template <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Frame Ulang Tahun Pink 2026"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#e85200]"
            />
          </div>

          {/* Jumlah Kolase 1–10 */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">
              Jumlah Kolase / Pose
              <span className="ml-2 text-[10px] font-normal text-zinc-400">
                (sesuaikan dengan slot foto di desain)
              </span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setPhotosCount(num)}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                    photosCount === num
                      ? 'bg-[#e85200] text-white shadow-md ring-2 ring-[#e85200]/30'
                      : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-orange-50 hover:border-[#e85200]/40'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1.5">
              Dipilih: <strong className="text-zinc-600">{photosCount} foto</strong>
              {' → '}Layout: <span className="font-mono text-zinc-500">{LAYOUT_MAP[photosCount]}</span>
            </p>
          </div>

          {/* Bentuk Kolase / Pose */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">
              Bentuk Kolase / Pose
              <span className="ml-2 text-[10px] font-normal text-zinc-400">(bentuk foto/pose di dalam template)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SHAPE_OPTIONS.map((shape) => (
                <button
                  type="button"
                  key={shape.id}
                  onClick={() => setPhotoShape(shape.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl font-bold text-[10px] transition-all ${
                    photoShape === shape.id
                      ? 'bg-[#e85200] text-white shadow-md ring-2 ring-[#e85200]/30'
                      : 'bg-white border border-zinc-300 text-zinc-600 hover:bg-orange-50 hover:border-[#e85200]/40'
                  }`}
                >
                  <span className={photoShape === shape.id ? 'text-white' : 'text-zinc-500'}>
                    {shape.preview}
                  </span>
                  {shape.label}
                </button>
              ))}
            </div>
          </div>

          {/* Publikasi Toggle */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-amber-900 text-xs">Publikasikan Langsung</p>
              <p className="text-[10px] text-amber-700 mt-0.5">
                Template langsung tampil di katalog photobooth semua pengguna.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:bg-[#e85200] transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>

          {/* Info Box */}
          <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 text-[10px] text-zinc-600 space-y-1">
            <p className="font-bold text-zinc-700">💡 Tips Upload Template:</p>
            <p>• Pilih jumlah kolase sesuai slot foto yang ada di desain gambar</p>
            <p>• Gunakan rasio <strong>9:16</strong> (portrait) untuk hasil terbaik di filmstrip</p>
            <p>• Format PNG dengan transparansi didukung penuh</p>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-zinc-300 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl font-bold bg-zinc-200 hover:bg-zinc-300 text-zinc-700 transition text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !bgImage || !name.trim()}
              className="px-6 py-2.5 rounded-xl font-black bg-[#e85200] hover:bg-[#ff5d07] text-white shadow-lg shadow-orange-500/30 transition disabled:opacity-40 flex items-center gap-2 text-xs"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Menyimpan ke Database...
                </>
              ) : (
                '💾 Simpan Template'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
