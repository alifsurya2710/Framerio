import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  prismaWarmedUp?: boolean
  prismaKeepAlive?: ReturnType<typeof setInterval>
}

/**
 * Paksa pengaturan connection pool di level kode, supaya tidak bergantung
 * pada parameter di DATABASE_URL (yang bisa tertinggal karena env lama).
 *
 * Development: pakai koneksi LANGSUNG Neon (host tanpa `-pooler`) karena
 * pooler PgBouncer menutup koneksi idle di sisi server, yang memicu error
 * `Error in PostgreSQL connection: Error { kind: Closed }` saat Prisma
 * memakai kembali koneksi mati dari pool-nya.
 *
 * Production (Netlify serverless): tetap pakai pooler — koneksi harus
 * dimultiplex, dan fungsi serverless jarang menahan koneksi idle lama.
 */
function buildDatasourceUrl(): string {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL is not set')
  try {
    const url = new URL(raw)
    const isProd = process.env.NODE_ENV === 'production'

    if (!isProd && url.hostname.includes('-pooler.')) {
      url.hostname = url.hostname.replace('-pooler', '')
    }

    url.searchParams.set('connection_limit', isProd ? '10' : '5')
    url.searchParams.set('pool_timeout', '60')
    url.searchParams.set('connect_timeout', '30')
    return url.toString()
  } catch {
    return raw
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: buildDatasourceUrl() } },
    log: ['error', 'warn'],
  })

/**
 * Warm-up: Neon otomatis men-suspend compute saat idle (autosuspend),
 * yang mematikan koneksi yang sedang dibuka Prisma
 * (error `E57P01: terminating connection due to administrator command`).
 * Query pertama setelah suspend bisa gagal, jadi kita panaskan koneksi
 * di background dengan retry agar compute bangun kembali sebelum request
 * user masuk. Prisma otomatis reconnect setelah koneksi mati.
 */
async function warmUpConnection(client: PrismaClient) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await client.$queryRaw`SELECT 1`
      return
    } catch {
      await new Promise((r) => setTimeout(r, 1500 * attempt))
    }
  }
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  if (!globalForPrisma.prismaWarmedUp) {
    globalForPrisma.prismaWarmedUp = true
    void warmUpConnection(prisma)

    // Keep-alive: kirim query ringan tiap 4 menit supaya compute Neon
    // tidak pernah suspend saat dev server menyala (autosuspend default
    // Neon ±5 menit idle). Tanpa ini koneksi pool Prisma ikut dimatikan
    // Neon dan memunculkan error E57P01 / { kind: Closed }.
    if (!globalForPrisma.prismaKeepAlive) {
      globalForPrisma.prismaKeepAlive = setInterval(() => {
        void prisma.$queryRaw`SELECT 1`.catch(() => {
          // abaikan — koneksi berikutnya akan reconnect otomatis
        })
      }, 4 * 60 * 1000)
    }
  }
}
