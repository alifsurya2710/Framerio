import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/Navbar'
import PwaInstallPrompt from '@/components/PwaInstallPrompt'
import Mobile3DSplash from '@/components/Mobile3DSplash'

export const metadata: Metadata = {
  title: 'Framerio — Pocket-Sized Photo Studio & 3D Retro Booth',
  description: 'Studio photobooth online bergaya konsol retro premium. Abadikan momen, cetak photostrip, dan simpan kenangan.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png'
  },
  themeColor: '#e85200',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Framerio'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#c5c4c0] text-zinc-900 selection:bg-[#e85200] selection:text-white">
        <Providers>
          {/* 3D Animated Splash Screen khusus Mobile */}
          <Mobile3DSplash />

          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <PwaInstallPrompt />
          </div>
        </Providers>
      </body>
    </html>
  )
}
