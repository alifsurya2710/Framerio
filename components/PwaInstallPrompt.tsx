'use client'
import { useState, useEffect } from 'react'

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  // ── Daftarkan Service Worker (update otomatis, tanpa banner) ─
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW tidak bisa didaftarkan — abaikan
      })
    }
  }, [])

  // ── PWA Install Prompt ───────────────────────────────────
  useEffect(() => {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone
    ) {
      setIsStandalone(true)
      return
    }

    const dismissedTime = localStorage.getItem('framerio_pwa_dismissed')
    if (
      dismissedTime &&
      Date.now() - parseInt(dismissedTime, 10) < 24 * 60 * 60 * 1000
    ) {
      return
    }

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    const timer = setTimeout(() => {
      if (!isStandalone) setShowPrompt(true)
    }, 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [isStandalone])

  function handleDismiss() {
    setShowPrompt(false)
    localStorage.setItem('framerio_pwa_dismissed', Date.now().toString())
  }

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setShowPrompt(false)
      setDeferredPrompt(null)
    } else {
      alert(
        'Untuk memasang di HP: tekan tombol Share/Bagikan di browser, lalu pilih "Tambahkan ke Layar Utama".'
      )
      setShowPrompt(false)
    }
  }

  return (
    <>
      {/* ── PWA Install Prompt ────────────────────────────── */}
      {showPrompt && !isStandalone && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-zinc-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.18)] flex flex-col gap-4 relative">
            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 rounded-full transition"
              aria-label="Tutup"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Header */}
            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-14 h-14 rounded-2xl bg-[#ff5e00] flex-shrink-0 flex items-center justify-center shadow-md p-1.5 overflow-hidden">
                <img
                  src="/icon.png"
                  alt="Framerio App Icon"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-extrabold text-zinc-900 leading-tight">
                  Pasang Framerio di HP Anda seperti aplikasi biasa?
                </h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed font-medium">
                  Buka lebih cepat dari layar utama, tanpa repot buka browser.
                </p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2.5 px-4 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs sm:text-sm font-bold transition shadow-sm"
              >
                Nanti
              </button>
              <button
                type="button"
                onClick={handleInstall}
                className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#ff5e00] to-[#e85200] hover:opacity-90 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#e85200]/30 flex items-center justify-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Pasang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
