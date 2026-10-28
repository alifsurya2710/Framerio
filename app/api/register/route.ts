import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    const trimmedUsername = name?.trim()
    const trimmedEmail = email?.trim().toLowerCase()

    if (!trimmedUsername) {
      return NextResponse.json({ error: 'Username wajib diisi' }, { status: 400 })
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
    }

    // Cek apakah Email sudah terdaftar
    const existingEmail = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    })
    if (existingEmail) {
      return NextResponse.json({ error: 'Alamat email sudah terdaftar' }, { status: 400 })
    }

    // Cek apakah Username sudah dipakai
    const existingUsername = await prisma.user.findFirst({
      where: {
        name: { equals: trimmedUsername, mode: 'insensitive' }
      }
    })
    if (existingUsername) {
      return NextResponse.json({ error: 'Username ini sudah digunakan, silakan pilih yang lain' }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name: trimmedUsername,
        email: trimmedEmail,
        password: hash,
        trialEndsAt: new Date(Date.now() + 7 * 86400000)
      }
    })

    return NextResponse.json({ id: user.id, email: user.email, name: user.name })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Terjadi kesalahan saat pendaftaran' }, { status: 500 })
  }
}
