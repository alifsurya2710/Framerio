// ============================================================
// Framerio Service Worker — Auto Update on New Deploy
// ============================================================

const CACHE_NAME = 'framerio-v2'

// File statis yang di-cache (shell app saja)
const STATIC_ASSETS = [
  '/',
  '/icon.png',
  '/manifest.json'
]

// ── INSTALL: cache static assets ────────────────────────────
self.addEventListener('install', (event) => {
  // Skip waiting agar SW baru langsung aktif
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Ignore jika salah satu gagal di-cache
      })
    })
  )
})

// ── ACTIVATE: hapus cache lama, ambil alih semua client ─────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Hapus semua cache versi lama
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      ),
      // Ambil alih semua tab/window yang terbuka
      self.clients.claim()
    ])
  )
})

// ── FETCH: network-first untuk API, cache-first untuk assets ─
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Selalu fetch langsung dari network untuk API & auth
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    event.request.method !== 'GET'
  ) {
    event.respondWith(fetch(event.request))
    return
  }

  // Network-first untuk semua halaman HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/') || fetch(event.request)
      })
    )
    return
  }

  // Cache-first untuk static assets (icon, manifest, dll)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request)
    })
  )
})
