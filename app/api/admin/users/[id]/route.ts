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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      trialEndsAt: true,
      createdAt: true,
      _count: { select: { photos: true, subscriptions: true } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const existing = await prisma.user.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.name !== undefined) data.name = body.name?.trim() || null

    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase()
      if (!email.includes('@')) {
        return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
      }
      if (email !== existing.email) {
        const taken = await prisma.user.findUnique({ where: { email } })
        if (taken) return NextResponse.json({ error: 'Email sudah dipakai' }, { status: 400 })
      }
      data.email = email
    }

    if (body.role !== undefined) {
      if (!['USER', 'ADMIN'].includes(body.role)) {
        return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 })
      }
      // Jangan turunkan role diri sendiri
      if (params.id === session.user.id && body.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Tidak bisa menurunkan role akun sendiri' }, { status: 400 })
      }
      data.role = body.role
    }

    if (body.trialEndsAt !== undefined) {
      data.trialEndsAt = new Date(body.trialEndsAt)
    }

    if (body.password) {
      if (String(body.password).length < 8) {
        return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
      }
      data.password = await bcrypt.hash(body.password, 10)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        trialEndsAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gagal update user' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (params.id === session.user.id) {
    return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
