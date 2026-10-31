import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validatePassword } from '@/lib/password'

/** Edit profil sendiri (nama, email, password) — khusus role USER */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'USER') {
    return NextResponse.json(
      { error: 'Hanya akun USER yang bisa mengubah profil lewat fitur ini' },
      { status: 403 }
    )
  }

  const { name, email, currentPassword, newPassword } = await req.json().catch(() => ({} as any))

  const hasName = typeof name === 'string' && name.trim().length > 0
  const hasEmail = typeof email === 'string' && email.trim().length > 0
  const wantsPassword = typeof newPassword === 'string' && newPassword.length > 0

  if (!hasName && !hasEmail && !wantsPassword) {
    return NextResponse.json({ error: 'Tidak ada perubahan yang dikirim' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 })

  const data: { name?: string; email?: string; password?: string } = {}

  if (hasName) {
    const trimmed = name.trim()
    if (trimmed.length > 100) {
      return NextResponse.json({ error: 'Nama maksimal 100 karakter' }, { status: 400 })
    }
    data.name = trimmed
  }

  if (hasEmail) {
    const trimmedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }
    const taken = await prisma.user.findFirst({
      where: { email: trimmedEmail, id: { not: user.id } }
    })
    if (taken) {
      return NextResponse.json({ error: 'Email sudah dipakai akun lain' }, { status: 409 })
    }
    data.email = trimmedEmail
  }

  if (wantsPassword) {
    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json({ error: 'Password saat ini wajib diisi untuk ganti password' }, { status: 400 })
    }
    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) {
      return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 })
    }
    const pwError = validatePassword(newPassword)
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 })
    }
    data.password = await bcrypt.hash(newPassword, 10)
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { name: true, email: true }
  })

  return NextResponse.json({ ok: true, user: updated })
}

/** Hapus akun sendiri — khusus role USER */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'USER') {
    return NextResponse.json(
      { error: 'Hanya akun USER yang bisa menghapus akun lewat fitur ini' },
      { status: 403 }
    )
  }

  const { password } = await req.json().catch(() => ({ password: '' }))
  if (!password) {
    return NextResponse.json({ error: 'Password wajib diisi untuk konfirmasi' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    return NextResponse.json({ error: 'Password salah' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: user.id } })

  return NextResponse.json({ ok: true })
}
