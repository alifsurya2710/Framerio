import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const PLANS: Record<string, { amount: number; days: number }> = {
  monthly: { amount: 10000, days: 30 },
  yearly: { amount: 120000, days: 365 }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, method } = await req.json()
  const p = PLANS[plan]
  if (!p || !['DANA', 'GOPAY'].includes(method)) {
    return NextResponse.json({ error: 'Invalid plan/method' }, { status: 400 })
  }

  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const sub = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      orderId,
      plan,
      method,
      amount: p.amount,
      status: 'PENDING'
    }
  })
  return NextResponse.json({ id: sub.id, orderId: sub.orderId })
}