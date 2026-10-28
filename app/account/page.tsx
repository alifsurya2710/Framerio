import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteAccountForm from '@/components/DeleteAccountForm'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      role: true,
      trialEndsAt: true,
      createdAt: true,
      _count: { select: { photos: true, subscriptions: true } },
    },
  })
  if (!user) redirect('/login')

  const isUser = user.role === 'USER'

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8">
        <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mb-1">
          Pengaturan
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Akun Saya</h1>
        <p className="text-xs text-zinc-500 mt-1">Kelola informasi dan keamanan akun Framerio.</p>
      </div>

      <div className="space-y-3">
        <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-5 shadow-md">
          <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mb-4">
            Profil
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-zinc-800 text-white flex items-center justify-center text-sm font-black">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-black text-zinc-900">{user.name || '—'}</div>
              <div className="text-xs text-zinc-500">{user.email}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/50 rounded-xl border border-zinc-200 px-3 py-2.5">
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Role</div>
              <div className="font-bold text-zinc-800 mt-0.5">{user.role}</div>
            </div>
            <div className="bg-white/50 rounded-xl border border-zinc-200 px-3 py-2.5">
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Bergabung</div>
              <div className="font-bold text-zinc-800 mt-0.5">
                {user.createdAt.toLocaleDateString('id-ID')}
              </div>
            </div>
            <div className="bg-white/50 rounded-xl border border-zinc-200 px-3 py-2.5">
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Foto</div>
              <div className="font-bold text-zinc-800 mt-0.5">{user._count.photos}</div>
            </div>
            <div className="bg-white/50 rounded-xl border border-zinc-200 px-3 py-2.5">
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Trial s/d</div>
              <div className="font-bold text-zinc-800 mt-0.5">
                {user.trialEndsAt.toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {isUser ? (
          <div className="rounded-[24px] border-2 border-red-200/80 bg-red-50/50 p-5 shadow-md">
            <div className="text-[9px] font-mono tracking-widest text-red-500 uppercase mb-2">
              Zona Berbahaya
            </div>
            <h2 className="text-sm font-black text-zinc-900 mb-1">Hapus Akun</h2>
            <p className="text-xs text-zinc-600 leading-relaxed mb-4">
              Setelah dihapus, semua foto ({user._count.photos}) dan riwayat langganan (
              {user._count.subscriptions}) ikut hilang dan tidak bisa dikembalikan.
            </p>
            <DeleteAccountForm />
          </div>
        ) : (
          <div className="rounded-[24px] border-2 border-zinc-200 bg-white/40 p-5">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Akun admin tidak bisa dihapus lewat halaman ini. Kelola user dari{' '}
              <Link href="/admin/users" className="text-[#e85200] font-bold hover:underline">
                panel admin
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
