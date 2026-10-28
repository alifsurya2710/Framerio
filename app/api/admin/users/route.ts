import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      trialEndsAt: true,
      createdAt: true,
      _count: { select: { photos: true, subscriptions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { name, email, password, role, trialEndsAt } = await req.json()
    const trimmedName = name?.trim() || null
    const trimmedEmail = email?.trim().toLowerCase()

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
    }
    if (role && !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } })
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        password: hash,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        trialEndsAt: trialEndsAt
          ? new Date(trialEndsAt)
          : new Date(Date.now() + 7 * 86400000),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        trialEndsAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gagal membuat user' }, { status: 500 })
  }
}
