import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validatePassword } from '@/lib/password'

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const token = String(body.token || '')
    const password = String(body.password || '')

    if (!token) {
      return NextResponse.json({ error: 'Token reset tidak ada. Buka ulang link dari email Anda.' }, { status: 400 })
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: sha256(token) },
    })

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Tautan reset tidak valid atau sudah kedaluwarsa. Silakan minta ulang.' },
        { status: 400 }
      )
    }

    const pwError = validatePassword(password)
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: resetToken.email } })
    if (!user) {
      return NextResponse.json({ error: 'Akun tidak ditemukan.' }, { status: 404 })
    }

    const hash = await bcrypt.hash(password, 10)

    // Update password + tandai token terpakai dalam satu transaksi
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hash } }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({ ok: true, message: 'Kata sandi berhasil diganti. Silakan masuk.' })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Terjadi kesalahan' }, { status: 500 })
  }
}
