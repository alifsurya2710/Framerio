import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json()
    const trimmed = identifier?.trim()
    if (!trimmed) {
      return NextResponse.json({ error: 'Username atau Email wajib diisi' }, { status: 400 })
    }

    // Cari pengguna berdasarkan Email ATAU Username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: trimmed, mode: 'insensitive' } },
          { name: { equals: trimmed, mode: 'insensitive' } }
        ]
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Akun dengan Username atau Email tersebut tidak ditemukan' },
        { status: 404 }
      )
    }

    // Buat password acak sementara
    const tempPassword = 'FR-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Kata sandi baru berhasil disiapkan.',
      tempPassword,
      email: user.email,
      username: user.name
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses lupa kata sandi' },
      { status: 500 }
    )
  }
}
