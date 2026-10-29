import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST: Admin membuat template baru (cari user admin by email, bukan by session ID)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    // Cari user admin by email dari session — lebih reliable dari ID yang bisa basi
    const adminEmail = session.user.email
    if (!adminEmail) {
      return NextResponse.json({ success: false, message: 'Session tidak valid' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!adminUser) {
      // Auto-upsert admin jika belum ada (misal setelah reset DB)
      const bcrypt = await import('bcryptjs')
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin1027', 10)
      const created = await prisma.user.create({
        data: {
          id: session.user.id || undefined,
          email: adminEmail,
          name: session.user.name || 'adminframerio',
          password: hash,
          role: 'ADMIN',
          trialEndsAt: new Date(Date.now() + 365 * 86400000)
        }
      })
      // Rekursif: buat template setelah admin dibuat
      const body = await req.json()
      return createTemplate(created.id, body, true)
    }

    const body = await req.json()
    return createTemplate(adminUser.id, body, true)
  } catch (error: any) {
    console.error('Error admin creating template:', error)
    return NextResponse.json({ success: false, message: 'Gagal membuat template: ' + error.message }, { status: 500 })
  }
}

async function createTemplate(userId: string, body: any, isAdmin: boolean) {
  const {
    name,
    category = 'Kustom',
    tag = 'Official',
    tagColor = 'bg-orange-500 text-white',
    photosCount = 4,
    recommendedLayout = 'strip4',
    bg = '#ffffff',
    frame = '#000000',
    frameWidth = 0,
    rounded = 8,
    gap = 10,
    pad = 16,
    textColor = '#1c1c1c',
    labelText,
    subText = 'FRAMERIO PHOTOBOOTH',
    filter = 'none',
    styleType = 'custom',
    bgImage = null,
    isPublic = true
  } = body

  if (!name?.trim()) {
    return NextResponse.json({ success: false, message: 'Nama template wajib diisi' }, { status: 400 })
  }

  const template = await prisma.customTemplate.create({
    data: {
      userId,
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
      labelText: labelText || name.trim(),
      subText,
      filter,
      styleType,
      bgImage: bgImage ? String(bgImage) : null,
      isPublic: Boolean(isPublic)
    }
  })

  return NextResponse.json({ success: true, template, message: 'Template berhasil dibuat!' })
}

// GET: Admin mengambil semua custom template di sistem
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const templates = await prisma.customTemplate.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, templates })
  } catch (error: any) {
    console.error('Error admin fetching templates:', error)
    return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 })
  }
}

// PATCH: Admin mengubah status publik (isPublic) atau mengedit template
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { id, isPublic, name, category, tag } = body

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID diperlukan' }, { status: 400 })
    }

    const updated = await prisma.customTemplate.update({
      where: { id },
      data: {
        ...(typeof isPublic === 'boolean' ? { isPublic } : {}),
        ...(name ? { name } : {}),
        ...(category ? { category } : {}),
        ...(tag ? { tag } : {})
      }
    })

    return NextResponse.json({ success: true, template: updated, message: 'Template berhasil diperbarui' })
  } catch (error: any) {
    console.error('Error admin updating template:', error)
    return NextResponse.json({ success: false, message: 'Gagal memperbarui template' }, { status: 500 })
  }
}

// DELETE: Admin menghapus template apapun
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID diperlukan' }, { status: 400 })
    }

    await prisma.customTemplate.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Template berhasil dihapus oleh Admin' })
  } catch (error: any) {
    console.error('Error admin deleting template:', error)
    return NextResponse.json({ success: false, message: 'Gagal menghapus template' }, { status: 500 })
  }
}

