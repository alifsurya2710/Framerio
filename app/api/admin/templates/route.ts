import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

