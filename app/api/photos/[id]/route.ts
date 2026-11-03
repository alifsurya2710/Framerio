import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/photos/[id]
 * User biasa boleh menghapus foto MILIKNYA sendiri dari galeri.
 * Query dikunci dengan id + userId sehingga foto milik user lain
 * tidak bisa dihapus meski id-nya diketahui. (Foto milik user mana pun
 * tetap bisa dihapus admin lewat /api/admin/photos/[id].)
 */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await prisma.photo.deleteMany({
    where: { id: params.id, userId: session.user.id },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
