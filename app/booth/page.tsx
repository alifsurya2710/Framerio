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
        <div className="flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
          <div className="w-full max-w-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-[#e85200]/30 rounded-2xl px-4 py-3 sm:px-5 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e85200] opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e85200]" />
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#e85200] flex-shrink-0">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#c44400]">Trial Active</span>
              <span className="bg-white border border-[#e85200]/25 text-[#c44400] text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                {sisaHari} hari lagi
              </span>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto">
              <span className="hidden lg:block text-xs font-medium text-zinc-500">Nikmati studio tanpa batas dengan paket berbayar</span>
              <Link
                href="/pricing"
                className="flex-1 sm:flex-none text-center px-4 py-2 sm:py-1.5 rounded-full text-xs font-bold bg-[#e85200] text-white shadow-sm hover:bg-[#c44400] hover:shadow-md transition whitespace-nowrap"
              >
                Langganan Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}
      <Photobooth allowed={access.allowed} />
    </div>
  )
}
