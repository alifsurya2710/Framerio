import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Framerio — Studio Foto & Photobooth Retro',
  description: 'Studio photobooth online bergaya konsol retro. Abadikan momen, cetak photostrip, dan simpan kenangan Anda.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#c5c4c0] text-zinc-900 selection:bg-[#e85200] selection:text-white">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
