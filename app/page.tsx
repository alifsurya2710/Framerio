'use client'
import { useState } from 'react'
import Link from 'next/link'
import RetroConsole3D from '@/components/RetroConsole3D'

interface FeatureDetail {
  id: string
  badge: string
  title: string
  desc: string
  details: {
    heading: string
    subheading: string
    points: { label: string; text: string }[]
    ctaUrl: string
    ctaText: string
  }
}

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<FeatureDetail | null>(null)

  const features: FeatureDetail[] = [
    {
      id: 'camera',
      badge: 'MULTI-PERANGKAT',
      title: 'Kamera HP & Komputer',
      desc: 'Bisa langsung beralih kamera depan atau belakang dengan pencerminan otomatis di browser.',
      details: {
        heading: 'Teknologi Kamera Fleksibel & Cepat',
        subheading: 'Dapat diakses instan dari Safari iPhone, Chrome Android, hingga browser laptop tanpa aplikasi tambahan.',
        points: [
          {
            label: 'Dukungan Kamera Depan & Belakang',
            text: 'Mudah berganti sudut pengambilan gambar hanya dengan 1 kali klik tombol Balik Kamera.'
          },
          {
            label: 'Koreksi Pencerminan Otomatis',
            text: 'Kamera depan otomatis dicerminkan sehingga pose terlihat alami layaknya sedang bercermin.'
          },
          {
            label: 'Kualitas Tajam HD',
            text: 'Tingkat frame stabil dan pencahayaan otomatis menyesuaikan sensor kamera perangkat Anda.'
          },
          {
            label: 'Hitung Mundur 5 Detik',
            text: 'Memberikan waktu 5 detik yang cukup untuk bersiap dan bergaya sebelum foto diambil.'
          }
        ],
        ctaUrl: '/booth',
        ctaText: 'Buka Studio Kamera'
      }
    },
    {
      id: 'print',
      badge: 'CETAK INSTAN',
      title: 'Photostrip & Postcard',
      desc: 'Pilihan layout 4-strip estetik khas photobooth, siap dicetak langsung atau disimpan ke galeri.',
      details: {
        heading: 'Pilihan Tata Letak & Hasil Cetak Siap Pakai',
        subheading: 'Hasilkan cetakan bergaya photobooth modern yang pas untuk dipajang atau disimpan di dompet.',
        points: [
          {
            label: 'Photostrip Vertikal (4 Pose)',
            text: 'Format memanjang klasik khas studio foto Korea dengan stempel tanggal otomatis.'
          },
          {
            label: 'Postcard Format Lebar (2 Pose)',
            text: 'Format lanskap 2 pose ideal untuk foto bersama dengan bidang tangkapan lebih luas.'
          },
          {
            label: 'Dukungan Cetak Langsung',
            text: 'Terkoneksi langsung ke printer thermal mini, printer Bluetooth, atau printer rumahan.'
          },
          {
            label: 'Unduh JPG Kualitas Tinggi',
            text: 'Simpan file gambar asli langsung ke memori galeri ponsel Anda dengan resolusi jernih.'
          }
        ],
        ctaUrl: '/booth',
        ctaText: 'Coba Buat Photostrip'
      }
    },
    {
      id: 'vault',
      badge: 'PENYIMPANAN AMAN',
      title: 'Galeri Pribadi Cloud',
      desc: 'Semua foto tersimpan teratur dengan cadangan awan aman, hanya bisa diakses oleh akun Anda.',
      details: {
        heading: 'Penyimpanan Cloud Terenkripsi & Teratur',
        subheading: 'Semua hasil photobooth Anda tersimpan aman dan terproteksi di akun pribadi.',
        points: [
          {
            label: 'Akses Galeri Tanpa Batas',
            text: 'Buka dan unduh kembali arsip foto lama Anda kapan pun dan dari perangkat mana saja.'
          },
          {
            label: 'Privasi Terlindungi Penuh',
            text: 'Setiap foto terikat ke akun pengguna dengan otentikasi ketat sehingga data aman.'
          },
          {
            label: 'Riwayat Tanggal Pengambilan',
            text: 'Setiap strip foto mencatat tanggal pengambilan momen secara otomatis.'
          },
          {
            label: 'Cetak Ulang Kapan Saja',
            text: 'Foto di galeri dapat dicetak ulang langsung ke printer tanpa perlu memotret dari awal.'
          }
        ],
        ctaUrl: '/gallery',
        ctaText: 'Buka Galeri Saya'
      }
    }
  ]

  return (
    <div className="w-full min-h-screen py-4 sm:py-8 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Outer Big Industrial Retro Canvas Wrapper */}
      <div className="relative w-full max-w-[1240px] retro-canvas retro-grid-bg rounded-[32px] sm:rounded-[48px] border-4 border-white/60 p-5 sm:p-12 lg:p-16 overflow-hidden">
        
        {/* Giant Background Typography: RETRO */}
        <div className="absolute top-8 left-6 sm:left-10 select-none pointer-events-none z-0">
          <span className="text-giant-outline text-5xl sm:text-8xl md:text-[120px] block opacity-30 font-black tracking-wider">
            RETRO
          </span>
        </div>

        {/* Watermark Caption yang Diperkecil & Pas di Mobile dan Desktop: 'PLAY' & 'MORE' */}
        <div className="absolute bottom-4 sm:bottom-6 left-6 sm:left-12 select-none pointer-events-none z-0">
          <span className="text-giant-watermark text-4xl sm:text-7xl md:text-8xl lg:text-9xl block font-black opacity-60">
            PLAY
          </span>
        </div>

        <div className="absolute bottom-4 sm:bottom-6 right-6 sm:right-12 select-none pointer-events-none z-0">
          <span className="text-giant-watermark text-4xl sm:text-7xl md:text-8xl lg:text-9xl block font-black opacity-60">
            MORE
          </span>
        </div>

        {/* Content Layout Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[520px]">
          
          {/* Left Column: Heading, Slogan & Action Buttons (Bahasa Indonesia) */}
          <div className="lg:col-span-6 flex flex-col items-start justify-center pt-4 sm:pt-0">
            {/* Year Tag / 2026 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs sm:text-sm font-bold text-[#e85200] tracking-widest">
                / 2026
              </span>
            </div>

            {/* Slogan Title dalam Bahasa Indonesia */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-[1.12] max-w-lg uppercase">
              STUDIO FOTO POKET DESAIN KONSOL PREMIUM
            </h1>

            <p className="mt-4 text-xs sm:text-base text-zinc-600 max-w-md font-medium leading-relaxed">
              Studio photobooth digital bergaya konsol retro premium. Abadikan momen estetik bersama sahabat, cetak photostrip 4-pose dengan hitung mundur 5 detik, dan simpan selamanya.
            </p>

            {/* CTA Buttons (Bahasa Indonesia) */}
            <div className="mt-6 sm:mt-10 flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                href="/booth"
                className="btn-orange-glow px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-transform hover:scale-105 active:scale-95"
              >
                MULAI FOTO
              </Link>
              <Link
                href="/pricing"
                className="btn-white-pill px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-extrabold text-xs sm:text-sm tracking-wider uppercase border border-zinc-200 transition-transform hover:scale-105 active:scale-95"
              >
                PAKET HARGA
              </Link>
            </div>
          </div>

          {/* Right Column: High-End 3D Interactive Retro Console */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-4 sm:py-6">
            <RetroConsole3D />

            {/* Right Side Annotation text diposisikan rapi di bawah konsol agar tidak bertubrukan */}
            <div className="mt-6 w-full max-w-[340px] text-[11px] leading-relaxed text-zinc-600 font-medium bg-white/60 p-3 rounded-2xl border border-white/80 shadow-sm text-center">
              Pengalaman photobooth retro interaktif untuk mengabadikan momen berharga secara instan dan tersimpan aman di cloud.
            </div>
          </div>
        </div>

        {/* Feature Cards Bottom Strip */}
        <div className="relative z-10 mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-zinc-400/40 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f) => (
            <div
              key={f.id}
              onClick={() => setActiveFeature(f)}
              className="bg-white/65 hover:bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/80 shadow-sm cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#e85200] bg-[#e85200]/10 px-2.5 py-0.5 rounded-full">
                  {f.badge}
                </span>
                <span className="text-xs text-zinc-400 group-hover:text-zinc-800 transition">
                  &rarr;
                </span>
              </div>
              <h3 className="font-extrabold text-zinc-900 text-sm sm:text-base">{f.title}</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Detail Dialog Modal */}
      {activeFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#ecebe6] rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 border-2 border-white shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between pb-4 border-b border-zinc-300">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-full bg-[#e85200] text-white">
                  {activeFeature.badge}
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-zinc-900 mt-2">
                  {activeFeature.details.heading}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                  {activeFeature.details.subheading}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveFeature(null)}
                className="w-8 h-8 rounded-full bg-zinc-300 hover:bg-zinc-400 text-zinc-800 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="py-4 sm:py-5 space-y-2.5 sm:space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {activeFeature.details.points.map((point, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-3.5 rounded-xl bg-white/80 border border-zinc-200"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#e85200]" />
                    {point.label}
                  </h4>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed pl-4">
                    {point.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-300 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveFeature(null)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white text-zinc-700 text-xs font-bold border border-zinc-300 hover:bg-zinc-100 transition"
              >
                Tutup
              </button>
              <Link
                href={activeFeature.details.ctaUrl}
                className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#e85200] hover:bg-[#d64800] text-white text-xs font-bold shadow-md shadow-[#e85200]/30 transition"
              >
                {activeFeature.details.ctaText} &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer info dengan kredit Alif Surya */}
      <footer className="mt-6 text-center text-xs text-zinc-600 font-medium flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <span>&copy; 2026 Framerio Studio &bull; Pengalaman Photobooth Bergaya Konsol Saku &bull;</span>
        <span>Dibuat oleh</span>
        <a
          href="https://www.instagram.com/mochalifsurya/?__pwa=1"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[#e85200] hover:underline transition-colors inline-flex items-center gap-1"
        >
          Alif Surya &rarr;
        </a>
      </footer>
    </div>
  )
}
