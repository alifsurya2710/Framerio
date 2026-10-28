import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const PLANS: Record<string, { amount: number; days: number }> = {
  monthly: { amount: 10000, days: 30 },
  yearly: { amount: 120000, days: 365 },
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const subs = await prisma.subscription.findMany({
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(subs)
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { userId, email, plan, method, status, amount, endsAt } = await req.json()

    const p = PLANS[plan]
    if (!p) return NextResponse.json({ error: 'Plan tidak valid' }, { status: 400 })
    if (!['DANA', 'GOPAY'].includes(method)) {
      return NextResponse.json({ error: 'Metode tidak valid' }, { status: 400 })
    }

    let targetUserId = userId as string | undefined
    if (!targetUserId && email) {
      const user = await prisma.user.findUnique({
        where: { email: String(email).trim().toLowerCase() },
      })
      if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
      targetUserId = user.id
    }
    if (!targetUserId) {
      return NextResponse.json({ error: 'userId atau email wajib' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    const subStatus = ['PENDING', 'PAID', 'REJECTED', 'EXPIRED'].includes(status)
      ? status
      : 'PENDING'

    const now = new Date()
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const data: any = {
      userId: targetUserId,
      orderId,
      plan,
      method,
      amount: typeof amount === 'number' ? amount : p.amount,
      status: subStatus,
    }

    if (subStatus === 'PAID') {
      data.startsAt = now
      data.endsAt = endsAt
        ? new Date(endsAt)
        : new Date(now.getTime() + p.days * 86400000)
    } else if (endsAt) {
      data.endsAt = new Date(endsAt)
    }

    const sub = await prisma.subscription.create({
      data,
      include: { user: { select: { id: true, email: true, name: true } } },
    })

    return NextResponse.json(sub, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gagal membuat subscription' }, { status: 500 })
  }
}
