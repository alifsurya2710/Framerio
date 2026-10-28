import { prisma } from './prisma'

export type AccessResult =
  | { allowed: true; reason: 'admin' | 'trial' | 'subscription' }
  | { allowed: false; reason: 'expired' | 'no-user' }

export async function canUseBooth(userId: string): Promise<AccessResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: 'PAID' },
        orderBy: { endsAt: 'desc' },
        take: 1
      }
    }
  })
  if (!user) return { allowed: false, reason: 'no-user' }
  if (user.role === 'ADMIN') return { allowed: true, reason: 'admin' }
  if (user.trialEndsAt > new Date()) return { allowed: true, reason: 'trial' }
  const sub = user.subscriptions[0]
  if (sub?.endsAt && sub.endsAt > new Date())
    return { allowed: true, reason: 'subscription' }
  return { allowed: false, reason: 'expired' }
}