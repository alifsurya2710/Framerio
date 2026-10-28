import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  yearly: 365,
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sub = await prisma.subscription.findUnique({ where: { id: params.id } })
  if (!sub || sub.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json(sub)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await prisma.subscription.findUnique({
    where: { id: params.id },
    include: { user: { select: { email: true, name: true } } },
  })
  if (!sub || sub.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (sub.status === 'PAID') {
    return NextResponse.json({ error: 'Sudah aktif' }, { status: 400 })
  }

  const { proofData } = await req.json()
  if (!proofData) return NextResponse.json({ error: 'No proof' }, { status: 400 })

  const days = PLAN_DAYS[sub.plan] ?? 30
  const now = new Date()
  const endsAt = new Date(now.getTime() + days * 86400000)

  // Auto-aktifkan langganan saat bukti transfer dikirim
  const updated = await prisma.subscription.update({
    where: { id: params.id },
    data: {
      proofData,
      status: 'PAID',
      startsAt: now,
      endsAt,
    },
  })

  const userLabel = sub.user.name || sub.user.email
  const endsLabel = endsAt.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  await prisma.notification.create({
    data: {
      type: 'proof_submitted',
      title: 'Pembayaran Diterima',
      body: `${userLabel} sudah bayar paket ${sub.plan.toUpperCase()} via ${sub.method} (Rp ${sub.amount.toLocaleString('id-ID')}). Langganan aktif hingga ${endsLabel}.`,
      userId: session.user.id,
      orderId: sub.orderId,
    },
  })

  return NextResponse.json({ ok: true, status: updated.status, endsAt: updated.endsAt })
}
