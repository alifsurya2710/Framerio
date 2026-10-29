'use client'
import { useState, useEffect } from 'react'

export default function Mobile3DSplash() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Tampilkan hanya di perangkat mobile (lebar layar < 768px)
    if (window.innerWidth < 768) {
      // Cek apakah baru pertama kali dibuka dalam sesi ini
      const shownInSession = sessionStorage.getItem('framerio_splash_shown')
      if (!shownInSession) {
        setVisible(true)
        sessionStorage.setItem('framerio_splash_shown', 'true')

        // Animasi fade out setelah 2.2 detik
        const fadeTimer = setTimeout(() => {
          setFading(true)
        }, 2200)

        // Hapus elemen splash setelah 2.7 detik
        const hideTimer = setTimeout(() => {
          setVisible(false)
        }, 2700)

        return () => {
          clearTimeout(fadeTimer)
          clearTimeout(hideTimer)
        }
      }
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#c3c2be] transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial glow */}
      <div className="absolute w-72 h-72 rounded-full bg-[#ff5e00]/20 blur-3xl pointer-events-none animate-pulse" />

      {/* 3D Floating & Rotating Console Icon Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className="relative w-28 h-28 rounded-[28px] bg-[#ff5e00] p-2.5 shadow-[0_20px_50px_rgba(232,82,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)] border-2 border-white/60 animate-bounce"
          style={{
            animationDuration: '2s',
            perspective: '1000px',
            transform: 'rotateX(15deg) rotateY(-15deg)',
          }}
        >
          {/* Gambar Favicon Asli */}
          <div className="w-full h-full rounded-2xl bg-white/20 p-1 flex items-center justify-center overflow-hidden">
            <img
              src="/icon.png"
              alt="Framerio Logo"
              className="w-full h-full object-contain drop-shadow-md"
              onError={(e) => {
                (e.target as any).src = '/framerio-logo.png'
              }}
            />
          </div>

          {/* 3D Corner Highlight */}
          <div className="absolute top-1 left-2 w-10 h-3 bg-white/30 rounded-full blur-[1px]" />
        </div>

        {/* Brand Name Typography */}
        <div className="mt-8 text-center flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#e85200] flex items-center justify-center text-white font-mono font-bold text-xs shadow-sm">
              +
            </span>
            <span className="font-black text-xl tracking-[0.25em] text-zinc-900 uppercase">
              FRAMERIO
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#e85200] mt-1.5 uppercase">
            STUDIO PHOTOBOOTH 3D
          </span>
        </div>

        {/* Loading Progress Bar */}
        <div className="mt-6 w-36 h-1.5 bg-zinc-300/80 rounded-full overflow-hidden border border-white/50">
          <div className="h-full bg-gradient-to-r from-[#ff5e00] to-[#e85200] rounded-full animate-pulse w-full" />
        </div>
      </div>
    </div>
  )
}

