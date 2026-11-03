import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/testimony
 * Publik: daftar testimoni yang sudah di-approve admin (untuk beranda).
 */
export async function GET() {
  const testimonies = await prisma.testimony.findMany({
    where: { status: 'APPROVED' },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      rating: true,
      date: true,
      message: true,
      user: { select: { name: true } },
    },
  })
  return NextResponse.json(testimonies)
}

/**
 * POST /api/testimony
 * Role USER mengirim testimoni: bintang 1-5 + tanggal + tanggapan.
 * Status awal PENDING (harus di-approve admin) + notifikasi ke admin.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const rating = Number(body.rating)
  const message = String(body.message || '').trim()
  const date = new Date(body.date)

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating harus bintang 1-5' }, { status: 400 })
  }
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Tanggal tidak valid' }, { status: 400 })
  }
  if (date.getTime() > Date.now()) {
    return NextResponse.json({ error: 'Tanggal tidak boleh di masa depan' }, { status: 400 })
  }
  if (message.length < 3 || message.length > 500) {
    return NextResponse.json({ error: 'Tanggapan harus 3-500 karakter' }, { status: 400 })
  }

  const testimony = await prisma.testimony.create({
    data: { userId: session.user.id, rating, date, message },
  })

  // Notifikasi ke admin (bell di panel admin polling endpoint ini)
  await prisma.notification.create({
    data: {
      type: 'testimony_submitted',
      title: 'Testimoni Baru',
      body: `${session.user.name || session.user.email} memberi ${rating} bintang — menunggu persetujuan.`,
      userId: session.user.id,
    },
  })

  return NextResponse.json({ ok: true, id: testimony.id })
}
