import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { canUseBooth } from '@/lib/access'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Photobooth from '@/components/Photobooth'
import Link from 'next/link'

export default async function BoothPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const access = await canUseBooth(session.user.id)
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const sisaHari = user
    ? Math.max(0, Math.ceil((user.trialEndsAt.getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div>
      {/* Trial banner */}
      {access.allowed && access.reason === 'trial' && (
        <div className="w-full bg-[#e85200]/10 border-b border-[#e85200]/20 px-4 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-[#c44400]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e85200] animate-pulse" />
          Trial aktif — sisa <strong>{sisaHari} hari</strong> lagi.{' '}
          <Link href="/pricing" className="underline underline-offset-2 hover:text-[#e85200] transition">
            Langganan sekarang
          </Link>{' '}
          untuk akses penuh.
        </div>
      )}
      <Photobooth allowed={access.allowed} />
    </div>
  )
}
