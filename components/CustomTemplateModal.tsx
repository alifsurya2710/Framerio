'use client'

import { useState, useRef } from 'react'

interface CustomTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newTemplate: any) => void
  isAdmin: boolean
}

const COLOR_PRESETS = [
  '#ffffff', '#000000', '#f8fafc', '#fce7f3', '#fed7aa',
  '#fef08a', '#dcfce7', '#e0e7ff', '#fae8ff', '#2b1810', '#1e293b'
]

const FRAME_COLORS = [
  '#e85200', '#000000', '#ffffff', '#db2777', '#7c3aed',
  '#2563eb', '#059669', '#d97706', '#7f1d1d', '#475569'
]

export default function CustomTemplateModal({
  isOpen,
  onClose,
  onSuccess,
  isAdmin
}: CustomTemplateModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Karakter & Kartun')
  const [photosCount, setPhotosCount] = useState<number>(4)
  const [recommendedLayout, setRecommendedLayout] = useState('strip4')
  const [bg, setBg] = useState('#ffffff')
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [bgImageName, setBgImageName] = useState<string>('')
  const [frame, setFrame] = useState('#e85200')
  const [frameWidth, setFrameWidth] = useState<number>(4)
  const [rounded, setRounded] = useState<number>(12)
  const [gap, setGap] = useState<number>(12)
  const [pad, setPad] = useState<number>(16)
  const [textColor, setTextColor] = useState('#1c1c1c')
  const [labelText, setLabelText] = useState('My Memories')
  const [subText, setSubText] = useState('FRAMERIO PHOTOBOOTH')
  const [filter, setFilter] = useState('none')
  const [isPublic, setIsPublic] = useState(isAdmin)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleLayoutChange = (count: number) => {
    setPhotosCount(count)
    if (count === 2) setRecommendedLayout('strip2')
    else if (count === 3) setRecommendedLayout('strip3')
    else if (count === 4) setRecommendedLayout('strip4')
    else if (count === 6) setRecommendedLayout('grid6')
    else if (count === 8) setRecommendedLayout('grid8')
  }

  // Upload file gambar dari perangkat (HP/Laptop)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi ukuran: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setBgImage(result)
      setBgImageName(file.name)
      setErrorMsg('')
    }
    reader.onerror = () => {
      setErrorMsg('Gagal membaca gambar dari perangkat')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setBgImage(null)
    setBgImageName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMsg('Nama template tidak boleh kosong')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          tag: isAdmin ? 'Official' : 'Custom',
          tagColor: isAdmin ? 'bg-orange-500 text-white' : 'bg-purple-600 text-white',
          photosCount,
          recommendedLayout,
          bg,
          bgImage,
          frame,
          frameWidth,
          rounded,
          gap,
          pad,
          textColor,
          labelText,
          subText,
          filter,
          styleType: 'custom',
          isPublic: isAdmin ? isPublic : false
        })
      })

      const data = await res.json()
      if (data.success && data.template) {
        onSuccess(data.template)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#f5f4ef] rounded-3xl border-2 border-white shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-7 relative text-zinc-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center text-zinc-700 font-bold"
        >
          ✕
        </button>

        {/* Title */}
        <div className="mb-5">
          <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#e85200] text-white mb-2">
            ✨ Studio Kreatif
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Buat Template Kolase Kustom
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Gunakan warna tema atau upload template gambar dari perangkat HP/Laptop Anda.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Live Preview Box */}
          <div className="bg-[#e7e5df] p-3 rounded-2xl border border-zinc-300/80">
            <span className="text-[10px] uppercase font-bold text-zinc-600 block mb-2">
              Pratinjau Desain Real-time
            </span>
            <div
              className="mx-auto rounded-xl p-3 flex flex-col items-center justify-between border shadow-md transition-all max-w-[280px] relative overflow-hidden bg-cover bg-center"
              style={{
                backgroundColor: bg,
                backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                borderColor: frame,
                borderWidth: `${Math.min(frameWidth, 6)}px`
              }}
            >
              {/* Overlay jika ada gambar template agar foto tetap jelas */}
              {bgImage && <div className="absolute inset-0 bg-black/10 pointer-events-none" />}

              <div
                className="w-full grid gap-1.5 min-h-[100px] relative z-10"
                style={{
                  gridTemplateColumns:
                    photosCount > 4
                      ? 'repeat(3, 1fr)'
                      : photosCount === 2
                      ? 'repeat(2, 1fr)'
                      : photosCount === 3
                      ? 'repeat(1, 1fr)'
                      : 'repeat(2, 1fr)'
                }}
              >
                {Array.from({ length: photosCount }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded bg-zinc-200/90 border border-dashed flex items-center justify-center text-[9px] font-mono font-bold text-zinc-700 shadow-inner"
                    style={{
                      borderRadius: `${Math.min(rounded, 16)}px`,
                      borderColor: frame
                    }}
                  >
                    Foto #{i + 1}
                  </div>
                ))}
              </div>

              <div className="w-full text-center mt-3 pt-2 border-t border-black/10 relative z-10 bg-white/60 backdrop-blur-sm rounded-lg px-2">
                <p className="font-bold text-xs truncate" style={{ color: textColor }}>
                  {labelText || 'Judul Template'}
                </p>
                <p className="text-[9px] opacity-75 uppercase tracking-wider truncate" style={{ color: textColor }}>
                  {subText || 'Sub Judul'}
                </p>
              </div>
            </div>
          </div>

          {/* ── FITUR BARU: UPLOAD GAMBAR DARI PERANGKAT ── */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#e85200]/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="font-black text-xs text-zinc-900 flex items-center gap-1.5">
                  <span className="text-[#e85200] text-sm">📁</span> Template Gambar dari Perangkat
                </label>
                <p className="text-[10px] text-zinc-500">
                  Upload file desain/frame (PNG, JPG, SVG) langsung dari galeri HP atau folder laptop Anda.
                </p>
              </div>
              {bgImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition"
                >
                  Hapus Gambar
                </button>
              )}
            </div>

            <div className="mt-2 flex flex-col sm:flex-row items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="template-file-upload"
              />
              <label
                htmlFor="template-file-upload"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-dashed border-[#e85200] text-[#e85200] font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition"
              >
                <span>📤</span> {bgImage ? 'Ganti Template Gambar' : 'Pilih Gambar dari Perangkat'}
              </label>

              {bgImageName && (
                <span className="text-[11px] font-mono text-zinc-600 truncate max-w-xs">
                  ✓ {bgImageName}
                </span>
              )}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nama Template */}
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Nama Template</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Frame Ulang Tahun Pink"
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#e85200]"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#e85200]"
              >
                <option value="Kustom">Kustom Perangkat (Custom)</option>
                <option value="Karakter & Kartun">Karakter & Kartun</option>
                <option value="Tiket & Majalah">Tiket & Majalah</option>
                <option value="Polkadot & Renda">Polkadot & Renda</option>
                <option value="Batik & Denim">Batik & Denim</option>
              </select>
            </div>
          </div>

          {/* Jumlah Foto & Layout */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">Jumlah Foto / Pose</label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 6, 8].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => handleLayoutChange(num)}
                  className={`py-2 rounded-xl font-bold text-xs transition-all ${
                    photosCount === num
                      ? 'bg-[#e85200] text-white shadow-md'
                      : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {num} Foto
                </button>
              ))}
            </div>
          </div>

          {/* Label & Subteks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Teks Utama Frame</label>
              <input
                type="text"
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                placeholder="Contoh: Happy Birthday"
                className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#e85200]"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Teks Tambahan / Tanggal</label>
              <input
                type="text"
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                placeholder="Contoh: BEST DAY EVER • 2026"
                className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#e85200]"
              />
            </div>
          </div>

          {/* Warna Background & Warna Frame */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Background Color */}
            <div className="bg-white p-3 rounded-xl border border-zinc-300">
              <label className="block font-bold text-zinc-700 mb-1 flex items-center justify-between">
                <span>Warna Dasar Background</span>
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0"
                />
              </label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setBg(c)}
                    className="w-5 h-5 rounded-full border border-black/20"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Frame / Accent Color */}
            <div className="bg-white p-3 rounded-xl border border-zinc-300">
              <label className="block font-bold text-zinc-700 mb-1 flex items-center justify-between">
                <span>Warna Garis Frame</span>
                <input
                  type="color"
                  value={frame}
                  onChange={(e) => setFrame(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0"
                />
              </label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {FRAME_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setFrame(c)}
                    className="w-5 h-5 rounded-full border border-black/20"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sliders Kerapian */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-xl border border-zinc-300">
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 mb-1">
                Tebal Garis ({frameWidth}px)
              </label>
              <input
                type="range"
                min="0"
                max="16"
                value={frameWidth}
                onChange={(e) => setFrameWidth(Number(e.target.value))}
                className="w-full accent-[#e85200]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 mb-1">
                Sudut Foto ({rounded}px)
              </label>
              <input
                type="range"
                min="0"
                max="32"
                value={rounded}
                onChange={(e) => setRounded(Number(e.target.value))}
                className="w-full accent-[#e85200]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 mb-1">
                Jarak Foto ({gap}px)
              </label>
              <input
                type="range"
                min="4"
                max="24"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full accent-[#e85200]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-600 mb-1">
                Warna Teks
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-6 rounded cursor-pointer border-0"
              />
            </div>
          </div>

          {/* Filter Kamera Bawaan */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1">Efek Filter Bawaan</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#e85200]"
            >
              <option value="none">Normal (Tanpa Filter)</option>
              <option value="sepia(20%) contrast(105%)">Warm Vintage Sepia</option>
              <option value="grayscale(100%) contrast(115%)">Monochrome Retro B&W</option>
              <option value="brightness(108%) contrast(104%) saturate(110%)">Bright Pastel Aura</option>
              <option value="contrast(120%) saturate(125%)">Y2K Vibrant</option>
            </select>
          </div>

          {/* Khusus Admin: Toggle Publikasikan Langsung */}
          {isAdmin && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-amber-900 text-xs">Publikasikan ke Semua User (Admin Only)</p>
                <p className="text-[10px] text-amber-700">Jika aktif, template ini akan langsung tampil di katalog publik photobooth semua pengunjung.</p>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 accent-[#e85200] rounded cursor-pointer"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3 border-t border-zinc-300 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl font-bold bg-zinc-200 hover:bg-zinc-300 text-zinc-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-black bg-[#e85200] hover:bg-[#ff5d07] text-white shadow-lg shadow-orange-500/30 transition flex items-center gap-2"
            >
              {loading ? 'Menyimpan...' : 'Simpan & Gunakan Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
