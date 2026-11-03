import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/admin/testimonies/[id]
 * Admin menyetujui (APPROVED) atau menolak (REJECTED) sebuah testimoni.
 * Body: { action: 'APPROVE' | 'REJECT' }
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const action = String((body as any).action || '').toUpperCase()

  if (action !== 'APPROVE' && action !== 'REJECT') {
    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
  }

  const updated = await prisma.testimony.update({
    where: { id: params.id },
    data: { status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' },
  })

  return NextResponse.json({ ok: true, testimony: updated })
}

/**
 * DELETE /api/admin/testimonies/[id]
 * Admin menghapus permanen sebuah testimoni.
 */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const deleted = await prisma.testimony.delete({ where: { id: params.id } }).catch(() => null)
  if (!deleted) {
    return NextResponse.json({ error: 'Testimoni tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
