import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Ambil template publik (dari admin/semua) + template milik user yang login
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const whereCondition: any = {
      OR: [
        { isPublic: true },
        ...(userId ? [{ userId }] : [])
      ]
    }

    const templates = await prisma.customTemplate.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, templates })
  } catch (error: any) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ success: false, message: 'Gagal memuat template' }, { status: 500 })
  }
}

// POST: Buat template kustom
// Validasi: User harus Admin ATAU masih dalam trial 7 hari ATAU punya langganan PAID aktif
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Silakan login terlebih dahulu' }, { status: 401 })
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
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 })
    }

    const isAdmin = user.role === 'ADMIN'
    const isTrialActive = user.trialEndsAt ? new Date(user.trialEndsAt) > new Date() : false
    const hasActiveSub = user.subscriptions && user.subscriptions.length > 0

    // Hak akses: Admin ATAU Trial aktif ATAU Berlangganan
    if (!isAdmin && !isTrialActive && !hasActiveSub) {
      return NextResponse.json({
        success: false,
        message: 'Masa trial 7 hari Anda telah berakhir. Silakan berlangganan untuk membuat template kustom!'
      }, { status: 403 })
    }

    const body = await req.json()
    const {
      name,
      category = 'Kustom',
      tag = isAdmin ? 'Official' : 'Custom',
      tagColor = isAdmin ? 'bg-orange-500 text-white' : 'bg-purple-600 text-white',
      photosCount = 4,
      recommendedLayout = 'strip4',
      bg = '#ffffff',
      frame = '#e85200',
      frameWidth = 4,
      rounded = 12,
      gap = 12,
      pad = 16,
      textColor = '#1c1c1c',
      labelText = 'My Memories',
      subText = 'FRAMERIO PHOTOBOOTH',
      filter = 'none',
      styleType = 'custom',
      bgImage = null,
      isPublic = false // jika admin bisa set publik langsung
    } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Nama template wajib diisi' }, { status: 400 })
    }

    const template = await prisma.customTemplate.create({
      data: {
        userId: user.id,
        name: name.trim(),
        category,
        tag,
        tagColor,
        photosCount: Number(photosCount) || 4,
        recommendedLayout,
        bg,
        frame,
        frameWidth: Number(frameWidth) || 0,
        rounded: Number(rounded) || 0,
        gap: Number(gap) || 0,
        pad: Number(pad) || 0,
        textColor,
        labelText,
        subText,
        filter,
        styleType,
        bgImage: bgImage ? String(bgImage) : null,
        isPublic: isAdmin ? Boolean(isPublic) : false // non-admin default private untuk akunnya
      }
    })

    return NextResponse.json({ success: true, template, message: 'Template berhasil dibuat!' })
  } catch (error: any) {
    console.error('Error creating template:', error)
    return NextResponse.json({ success: false, message: 'Gagal membuat template: ' + error.message }, { status: 500 })
  }
}

// DELETE: Hapus template sendiri
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID template diperlukan' }, { status: 400 })
    }

    const template = await prisma.customTemplate.findUnique({ where: { id } })
    if (!template) {
      return NextResponse.json({ success: false, message: 'Template tidak ditemukan' }, { status: 404 })
    }

    // Hanya pemilik atau admin yang bisa hapus
    if (template.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Tidak memiliki izin menghapus template ini' }, { status: 403 })
    }

    await prisma.customTemplate.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Template berhasil dihapus' })
  } catch (error: any) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ success: false, message: 'Gagal menghapus template' }, { status: 500 })
  }
}

