import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canUseBooth } from '@/lib/access'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const access = await canUseBooth(session.user.id)
  if (!access.allowed) return NextResponse.json({ error: 'Trial habis' }, { status: 403 })

  const { imageData, layout } = await req.json()
  if (!imageData) return NextResponse.json({ error: 'No image' }, { status: 400 })

  const photo = await prisma.photo.create({
    data: { userId: session.user.id, imageData, layout: layout || 'strip' }
  })
  return NextResponse.json({ id: photo.id })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const photos = await prisma.photo.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(photos)
}