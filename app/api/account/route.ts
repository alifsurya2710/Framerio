import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/** Hapus akun sendiri — khusus role USER */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'USER') {
    return NextResponse.json(
      { error: 'Hanya akun USER yang bisa menghapus akun lewat fitur ini' },
      { status: 403 }
    )
  }

  const { password } = await req.json().catch(() => ({ password: '' }))
  if (!password) {
    return NextResponse.json({ error: 'Password wajib diisi untuk konfirmasi' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    return NextResponse.json({ error: 'Password salah' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: user.id } })

  return NextResponse.json({ ok: true })
}
