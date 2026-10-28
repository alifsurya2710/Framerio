import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  yearly: 365,
}

const PLAN_AMOUNT: Record<string, number> = {
  monthly: 10000,
  yearly: 120000,
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sub = await prisma.subscription.findUnique({
    where: { id: params.id },
    include: { user: { select: { email: true, name: true } } },
  })
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}
    const now = new Date()

    if (body.plan !== undefined) {
      if (!PLAN_DAYS[body.plan]) {
        return NextResponse.json({ error: 'Plan tidak valid' }, { status: 400 })
      }
      data.plan = body.plan
      if (body.amount === undefined) data.amount = PLAN_AMOUNT[body.plan]
    }

    if (body.method !== undefined) {
      if (!['DANA', 'GOPAY'].includes(body.method)) {
        return NextResponse.json({ error: 'Metode tidak valid' }, { status: 400 })
      }
      data.method = body.method
    }

    if (body.amount !== undefined) {
      const amt = Number(body.amount)
      if (!Number.isFinite(amt) || amt < 0) {
        return NextResponse.json({ error: 'Nominal tidak valid' }, { status: 400 })
      }
      data.amount = amt
    }

    if (body.endsAt !== undefined) {
      data.endsAt = body.endsAt ? new Date(body.endsAt) : null
    }

    if (body.status !== undefined) {
      if (!['PENDING', 'PAID', 'REJECTED', 'EXPIRED'].includes(body.status)) {
        return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
      }
      data.status = body.status

      if (body.status === 'PAID') {
        const plan = (body.plan as string) || sub.plan
        const days = PLAN_DAYS[plan] ?? 30
        if (!sub.startsAt) data.startsAt = now
        if (body.endsAt === undefined && !sub.endsAt) {
          data.endsAt = new Date(now.getTime() + days * 86400000)
        }
      }
    }

    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data,
      include: { user: { select: { id: true, email: true, name: true } } },
    })

    // Riwayat notif jika status berubah ke PAID/REJECTED
    if (body.status && body.status !== sub.status && ['PAID', 'REJECTED'].includes(body.status)) {
      await prisma.notification.updateMany({
        where: { orderId: sub.orderId, type: 'proof_submitted' },
        data: { read: true },
      })

      const userLabel = sub.user.name || sub.user.email
      if (body.status === 'PAID') {
        const endsLabel = updated.endsAt
          ? updated.endsAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : '—'
        await prisma.notification.create({
          data: {
            type: 'payment_approved',
            title: 'Pembayaran Dikonfirmasi',
            body: `Langganan ${userLabel} (${updated.plan.toUpperCase()}) telah diaktifkan hingga ${endsLabel}.`,
            userId: sub.userId,
            orderId: sub.orderId,
            read: true,
          },
        })
      } else {
        await prisma.notification.create({
          data: {
            type: 'payment_rejected',
            title: 'Pembayaran Ditolak',
            body: `Pembayaran ${userLabel} untuk paket ${updated.plan.toUpperCase()} ditolak.`,
            userId: sub.userId,
            orderId: sub.orderId,
            read: true,
          },
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gagal update subscription' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sub = await prisma.subscription.findUnique({ where: { id: params.id } })
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.subscription.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
