import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        authenticated: false,
        canCreateTemplate: false,
        reason: 'Belum login'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: {
            status: 'PAID',
            endsAt: { gt: new Date() }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        canCreateTemplate: false,
        reason: 'User tidak ditemukan'
      })
    }

    const isAdmin = user.role === 'ADMIN'
    const isTrialActive = user.trialEndsAt ? new Date(user.trialEndsAt) > new Date() : false
    const hasActiveSub = user.subscriptions && user.subscriptions.length > 0
    const canCreateTemplate = isAdmin || isTrialActive || hasActiveSub

    return NextResponse.json({
      authenticated: true,
      role: user.role,
      isAdmin,
      isTrialActive,
      trialEndsAt: user.trialEndsAt,
      hasActiveSub,
      canCreateTemplate
    })
  } catch (error: any) {
    console.error('Error checking user access:', error)
    return NextResponse.json({ authenticated: false, canCreateTemplate: false }, { status: 500 })
  }
}

