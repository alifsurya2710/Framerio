import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@framerio.com'
  const name = process.env.ADMIN_NAME || 'adminframerio'
  const password = process.env.ADMIN_PASSWORD || 'admin12345'
  const hash = await bcrypt.hash(password, 10)

  // Hapus admin lama (email lama) jika berbeda
  const legacy = await prisma.user.findUnique({ where: { email: 'admin@snapbooth.com' } })
  if (legacy && email !== 'admin@snapbooth.com') {
    await prisma.user.delete({ where: { id: legacy.id } })
    console.log('🗑  Admin lama dihapus: admin@snapbooth.com')
  }

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: 'ADMIN',
      password: hash,
    },
    create: {
      email,
      name,
      password: hash,
      role: 'ADMIN',
      trialEndsAt: new Date(Date.now() + 365 * 86400000),
    },
  })
  console.log('✅ Admin seeded:', email, `(${name})`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); process.exit(1) })