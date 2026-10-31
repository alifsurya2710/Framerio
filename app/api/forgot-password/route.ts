import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendMail, appUrl, resetPasswordEmailHtml } from '@/lib/mail'

const TOKEN_TTL_MINUTES = 60
const RESEND_COOLDOWN_MS = 60_000 // 1 request / menit / email

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Selalu balas sukses supaya pihak lain tidak bisa tahu email terdaftar atau tidak
    const genericOk = NextResponse.json({
      ok: true,
      message: 'Jika email Anda terdaftar, tautan reset telah dikirim. Cek inbox (atau spam) Anda.',
    })

    if (!user) return genericOk

    // Rate limit: jangan kirim email jika request terakhir < 60 detik lalu
    const last = await prisma.passwordResetToken.findFirst({
      where: { email, usedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    if (last && Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      return genericOk
    }

    // Hapus token lama yang belum dipakai, lalu buat yang baru
    await prisma.passwordResetToken.deleteMany({ where: { email, usedAt: null } })

    const rawToken = crypto.randomBytes(32).toString('hex')
    await prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash: sha256(rawToken),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000),
      },
    })

    const link = `${appUrl(req)}/reset-password?token=${rawToken}`

    try {
      await sendMail({
        to: email,
        subject: 'Reset Kata Sandi Framerio',
        html: resetPasswordEmailHtml(link, TOKEN_TTL_MINUTES),
      })
    } catch (mailErr) {
      console.error('[forgot-password] gagal kirim email:', mailErr)
      return NextResponse.json(
        { error: 'Gagal mengirim email. Konfigurasi SMTP belum benar.' },
        { status: 500 }
      )
    }

    return genericOk
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Terjadi kesalahan' }, { status: 500 })
  }
}
