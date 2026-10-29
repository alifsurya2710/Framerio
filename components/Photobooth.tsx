'use client'
import { useEffect, useRef, useState } from 'react'
import CustomTemplateModal from './CustomTemplateModal'
import Link from 'next/link'

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
export type Layout = 
  | 'strip4' 
  | 'strip3' 
  | 'strip2' 
  | 'grid4' 
  | 'grid6' 
  | 'grid8' 
  | 'grid3' 
  | 'wide2' 
  | 'hero1sub2' 
  | 'polaroid2' 
  | 'solo'

type Category = 'Semua' | 'Karakter & Kartun' | 'Tiket & Majalah' | 'Polkadot & Renda' | 'Batik & Denim'

export type Template = {
  id: string
  name: string
  category: Category | string
  tag: string
  tagColor?: string
  usesCount: string
  photosCount: number
  recommendedLayout: Layout | string
  bg: string
  frame: string
  frameWidth: number
  rounded: number
  gap: number
  pad: number
  textColor: string
  labelText: string
  subText?: string
  filter: string
  styleType: 
    | 'snoopy' 
    | 'polkadot-brown' 
    | 'polkadot-blue-lace' 
    | 'ticket' 
    | 'newspaper-blur' 
    | 'couple-minimal' 
    | 'batik' 
    | 'denim-stars'
    | 'love'
    | 'retro'
    | 'custom'
    | string
  bgImage?: string | null
  isCustom?: boolean
  isPublic?: boolean
}

type LayoutDef = { id: Layout; name: string; count: number }

/* ════════════════════════════════════════════════════════════
   LAYOUTS (MENDUKUNG HINGGA 6 & 8 FOTO SEPERTI GAMBAR)
════════════════════════════════════════════════════════════ */
export const LAYOUTS: LayoutDef[] = [
  { id: 'strip4',    name: 'Strip 4',       count: 4 },
  { id: 'strip3',    name: 'Strip 3',       count: 3 },
  { id: 'strip2',    name: 'Strip 2',       count: 2 },
  { id: 'grid4',     name: 'Grid 2×2',      count: 4 },
  { id: 'grid6',     name: 'Grid 6 (2×3)',  count: 6 },
  { id: 'grid8',     name: 'Grid 8 (2×4)',  count: 8 },
  { id: 'grid3',     name: 'Grid 1×3',      count: 3 },
  { id: 'wide2',     name: 'Wide Postcard', count: 2 },
  { id: 'hero1sub2', name: 'Majalah 1+2',   count: 3 },
  { id: 'polaroid2', name: 'Polaroid Duo',  count: 2 },
]

/* ════════════════════════════════════════════════════════════
   TEMPLATES — 13 TEMPLATE (8 lama + 5 baru dari foto user)
════════════════════════════════════════════════════════════ */
const TEMPLATES: Template[] = [
  // ── 1. SNOOPY & MIFFY ───────────────────────────────────
  {
    id: 'snoopy-miffy',
    name: 'Snoopy & Miffy',
    category: 'Karakter & Kartun',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '5.638 uses',
    photosCount: 3,
    recommendedLayout: 'strip3',
    bg: '#ffffff',
    frame: '#475569',
    frameWidth: 3,
    rounded: 18,
    gap: 16,
    pad: 24,
    textColor: '#1e293b',
    labelText: 'SNOOPY & MIFFY',
    subText: 'DREAMING TOGETHER',
    filter: 'brightness(103%) contrast(104%)',
    styleType: 'snoopy'
  },

  // ── 2. TICKET CONCERT ────────────────────────────────────
  {
    id: 'ticket-solo',
    name: 'Ticket Solo is Solo',
    category: 'Tiket & Majalah',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '3.821 uses',
    photosCount: 4,
    recommendedLayout: 'strip4',
    bg: '#fcf8f2',
    frame: '#7f1d1d',
    frameWidth: 16,
    rounded: 12,
    gap: 12,
    pad: 20,
    textColor: '#7f1d1d',
    labelText: 'Solo is Solo',
    subText: 'ROW B2 • SHOW 02 • SEPTEMBER 20.00',
    filter: 'sepia(18%) contrast(105%)',
    styleType: 'ticket'
  },

  // ── 3. POLKADOT BROWN ────────────────────────────────────
  {
    id: 'safari-polkadot-brown',
    name: 'Safari Polkadot Brown',
    category: 'Polkadot & Renda',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '6.354 uses',
    photosCount: 6,
    recommendedLayout: 'grid6',
    bg: '#2b1810',
    frame: '#bae6fd',
    frameWidth: 0,
    rounded: 14,
    gap: 14,
    pad: 22,
    textColor: '#bae6fd',
    labelText: 'framerio booth',
    subText: 'SAFARI POLKADOT',
    filter: 'contrast(106%) saturate(110%)',
    styleType: 'polkadot-brown'
  },

  // ── 4. POLKADOT BLUE LACE ────────────────────────────────
  {
    id: 'safari-polkadot-blue',
    name: 'Safari Polkadot Blue & Lace',
    category: 'Polkadot & Renda',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '4.283 uses',
    photosCount: 6,
    recommendedLayout: 'grid6',
    bg: '#1e293b',
    frame: '#cbd5e1',
    frameWidth: 0,
    rounded: 14,
    gap: 14,
    pad: 22,
    textColor: '#ffffff',
    labelText: 'framerio booth',
    subText: 'VINTAGE LACE EDITION',
    filter: 'contrast(108%) saturate(105%)',
    styleType: 'polkadot-blue-lace'
  },

  // ── 5. KORAN "FOTO KITA BLUR" ────────────────────────────
  {
    id: 'koran-foto-blur',
    name: 'Koran Foto Kita Blur',
    category: 'Tiket & Majalah',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '21.122 uses',
    photosCount: 2,
    recommendedLayout: 'hero1sub2',
    bg: '#fafaf9',
    frame: '#1c1917',
    frameWidth: 2,
    rounded: 4,
    gap: 12,
    pad: 18,
    textColor: '#b91c1c',
    labelText: 'FOTO KITA BLUR',
    subText: 'Tak Banyak Yang Kulihat • Sal Priadi',
    filter: 'contrast(105%)',
    styleType: 'newspaper-blur'
  },

  // ── 6. COUPLE MINIMAL ────────────────────────────────────
  {
    id: 'couple-8-minimal',
    name: 'Couple 8 Split Studio',
    category: 'Karakter & Kartun',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '19.301 uses',
    photosCount: 4,
    recommendedLayout: 'strip4',
    bg: '#ffffff',
    frame: '#f1f5f9',
    frameWidth: 6,
    rounded: 2,
    gap: 8,
    pad: 12,
    textColor: '#64748b',
    labelText: 'COUPLE MOMENTS',
    subText: 'FRAMERIO MEMORIES',
    filter: 'none',
    styleType: 'couple-minimal'
  },

  // ── 7. BATIK VINTAGE ─────────────────────────────────────
  {
    id: 'frame-batik-vintage',
    name: 'Frame Batik Nusantara',
    category: 'Batik & Denim',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '1.810 uses',
    photosCount: 8,
    recommendedLayout: 'grid8',
    bg: '#fbf7ee',
    frame: '#ca8a04',
    frameWidth: 0,
    rounded: 8,
    gap: 12,
    pad: 20,
    textColor: '#854d0e',
    labelText: 'BATIK FRAMERIO',
    subText: 'NUSANTARA HERITAGE',
    filter: 'sepia(15%) contrast(105%)',
    styleType: 'batik'
  },

  // ── 8. KK STUDIO DENIM STARS ─────────────────────────────
  {
    id: 'kk-studio-denim',
    name: 'KK Studio Denim Stars 4R',
    category: 'Batik & Denim',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '4.827 uses',
    photosCount: 8,
    recommendedLayout: 'grid8',
    bg: '#1e3a5f',
    frame: '#fef08a',
    frameWidth: 0,
    rounded: 8,
    gap: 12,
    pad: 20,
    textColor: '#fef08a',
    labelText: 'KK STUDIO 4R',
    subText: 'GOLD STARS & DENIM',
    filter: 'contrast(108%) saturate(115%)',
    styleType: 'denim-stars'
  },

  // ════════════════════════════════════════════════════════
  // TEMPLATE BARU — 5 TEMPLATE DARI FOTO USER
  // ════════════════════════════════════════════════════════

  // ── 9. POLAROID DENIM (foto 1: kamera polaroid denim biru, 4 foto filmstrip) ──
  {
    id: 'polaroid-denim',
    name: 'Polaroid Denim Filmstrip',
    category: 'Karakter & Kartun',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '0 uses',
    photosCount: 4,
    recommendedLayout: 'strip4',
    bg: '#1e3a5f',
    bgImage: '/templates/polaroid-denim.jpg',
    frame: '#ffffff',
    frameWidth: 3,
    rounded: 4,
    gap: 0,
    pad: 0,
    textColor: '#ffffff',
    labelText: 'Polaroid Memories',
    subText: 'FRAMERIO × ONE STEP 2',
    filter: 'none',
    styleType: 'bgimage-strip4'
  },

  // ── 10. THE 1975 NEWSPAPER (foto 2: koran hitam putih, 3 foto filmstrip) ──
  {
    id: 'the1975-newspaper',
    name: 'The 1975 — About You',
    category: 'Tiket & Majalah',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '0 uses',
    photosCount: 3,
    recommendedLayout: 'strip3',
    bg: '#f5f0e8',
    bgImage: '/templates/the1975-newspaper.jpg',
    frame: '#111111',
    frameWidth: 2,
    rounded: 0,
    gap: 0,
    pad: 0,
    textColor: '#111111',
    labelText: 'ABOUT YOU',
    subText: 'THE 1975 • DAILY REPORT',
    filter: 'grayscale(100%) contrast(110%)',
    styleType: 'bgimage-strip3'
  },

  // ── 11. SNOOPY DENIM RECEIPTIFY (foto 3: denim + snoopy + kwitansi, 4 foto) ──
  {
    id: 'snoopy-denim-receiptify',
    name: 'Snoopy Denim Receiptify',
    category: 'Karakter & Kartun',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '0 uses',
    photosCount: 4,
    recommendedLayout: 'strip4',
    bg: '#4a6584',
    bgImage: '/templates/snoopy-denim-receiptify.jpg',
    frame: '#ffffff',
    frameWidth: 3,
    rounded: 4,
    gap: 0,
    pad: 0,
    textColor: '#ffffff',
    labelText: 'My Receiptify',
    subText: 'LAST MONTH • FRAMERIO',
    filter: 'none',
    styleType: 'bgimage-strip4'
  },

  // ── 12. POLAROID BROWN AESTHETIC (foto 4: kamera polaroid background beige, 3 foto) ──
  {
    id: 'polaroid-brown-aesthetic',
    name: 'Polaroid Brown Aesthetic',
    category: 'Karakter & Kartun',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '0 uses',
    photosCount: 3,
    recommendedLayout: 'strip3',
    bg: '#c9a882',
    bgImage: '/templates/polaroid-brown-aesthetic.jpg',
    frame: '#ffffff',
    frameWidth: 3,
    rounded: 4,
    gap: 0,
    pad: 0,
    textColor: '#5c3d1e',
    labelText: 'My Girl ♥ Love',
    subText: 'FRAMERIO × POLAROID',
    filter: 'sepia(10%) warmth(5%)',
    styleType: 'bgimage-strip3'
  },

  // ── 13. COOL MEMORIES NAVY (foto 5: crumpled navy paper, 2 foto strip vintage) ──
  {
    id: 'cool-memories-navy',
    name: 'Cool Memories Navy',
    category: 'Tiket & Majalah',
    tag: 'Free',
    tagColor: 'bg-purple-600 text-white',
    usesCount: '0 uses',
    photosCount: 2,
    recommendedLayout: 'strip2',
    bg: '#1a2744',
    bgImage: '/templates/cool-memories-navy.jpg',
    frame: '#f0e6d0',
    frameWidth: 6,
    rounded: 4,
    gap: 0,
    pad: 0,
    textColor: '#f0e6d0',
    labelText: 'cool memories',
    subText: 'GOT HITCHED • FRAMERIO',
    filter: 'none',
    styleType: 'bgimage-strip2'
  }
]

/* ════════════════════════════════════════════════════════════
   CANVAS COMPOSE ENGINE (MENDUKUNG DETAIL TIAP STYLE)
════════════════════════════════════════════════════════════ */
async function composeLayout(
  imgs64: string[],
  layout: Layout | string,
  tpl: Template
): Promise<string> {
  const imgs: HTMLImageElement[] = await Promise.all(
    imgs64.map(src => new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image()
      img.onload = () => res(img)
      img.onerror = rej
      img.src = src
    }))
  )

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const pad = tpl.pad * 2, gap = tpl.gap * 2, fw = tpl.frameWidth * 2, rx = tpl.rounded * 2

  // ── Style: BGIMAGE (template gambar dari foto user) ────────
  if (tpl.styleType && tpl.styleType.startsWith('bgimage-')) {
    const count = tpl.photosCount || 4
    // Proporsi portrait seperti foto template (rasio 9:16)
    const cw = 540
    const ch = 960
    canvas.width = cw; canvas.height = ch

    // 1. Gambar template dari file publik sebagai background
    if (tpl.bgImage) {
      try {
        const bgImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = tpl.bgImage!
        })
        ctx.drawImage(bgImg, 0, 0, cw, ch)
      } catch (e) {
        ctx.fillStyle = tpl.bg || '#1a1a2e'
        ctx.fillRect(0, 0, cw, ch)
      }
    } else {
      ctx.fillStyle = tpl.bg || '#ffffff'
      ctx.fillRect(0, 0, cw, ch)
    }

    // 2. Tempatkan foto-foto sesuai posisi filmstrip/strip di gambar template
    // Area foto: umumnya 35-70% tinggi dari tengah ke bawah di tiap template ini
    const photoAreaTop    = Math.round(ch * 0.34)
    const photoAreaBottom = Math.round(ch * 0.88)
    const photoAreaLeft   = Math.round(cw * 0.22)
    const photoAreaRight  = Math.round(cw * 0.78)
    const photoAreaH      = photoAreaBottom - photoAreaTop
    const photoAreaW      = photoAreaRight - photoAreaLeft

    const gapPx = count === 2 ? 20 : 10
    const totalGap = gapPx * (count - 1)
    const cellH = Math.floor((photoAreaH - totalGap) / count)
    const cellW = photoAreaW

    imgs.slice(0, count).forEach((img, i) => {
      const py = photoAreaTop + i * (cellH + gapPx)
      const px = photoAreaLeft

      ctx.save()
      ctx.beginPath()
      ctx.roundRect(px, py, cellW, cellH, 6)
      ctx.clip()
      // Cover crop
      const imgRatio = img.naturalWidth / img.naturalHeight
      const cellRatio = cellW / cellH
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
      if (imgRatio > cellRatio) {
        sw = Math.floor(sh * cellRatio)
        sx = Math.floor((img.naturalWidth - sw) / 2)
      } else {
        sh = Math.floor(sw / cellRatio)
        sy = Math.floor((img.naturalHeight - sh) / 2)
      }
      ctx.drawImage(img, sx, sy, sw, sh, px, py, cellW, cellH)
      ctx.restore()
    })

    return canvas.toDataURL('image/jpeg', 0.95)
  }

  // ── Style: TICKET CONCERT ─────────────────────────────────
  if (tpl.styleType === 'ticket') {
    const cw = 500, count = 4
    const photoH = 240, headerH = 130, footerH = 60
    const ch = headerH + count * photoH + (count - 1) * gap + footerH + pad * 2
    canvas.width = cw; canvas.height = ch

    // Scalloped / Marun Border
    ctx.fillStyle = '#7f1d1d'
    ctx.fillRect(0, 0, cw, ch)
    ctx.fillStyle = '#fcf8f2'
    ctx.fillRect(16, 16, cw - 32, ch - 32)

    // Header Tiket
    ctx.fillStyle = '#7f1d1d'
    ctx.font = 'bold 36px serif'
    ctx.textAlign = 'center'
    ctx.fillText('★ Solo is Solo ★', cw / 2, 60)
    ctx.font = 'bold 15px monospace'
    ctx.fillText('ROW B2  •  SHOW 02  •  SEPTEMBER 20.00', cw / 2, 95)
    ctx.strokeStyle = '#7f1d1d'
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 4])
    ctx.strokeRect(30, 115, cw - 60, 1)
    ctx.setLineDash([])

    // Foto-foto
    const ix = 32, iw = cw - 64
    imgs.slice(0, count).forEach((img, i) => {
      const iy = headerH + pad + i * (photoH + gap)
      ctx.drawImage(img, ix, iy, iw, photoH)
      ctx.strokeStyle = '#7f1d1d'
      ctx.lineWidth = 2
      ctx.strokeRect(ix, iy, iw, photoH)
    })

    // Footer Tiket
    ctx.font = 'bold 13px monospace'
    ctx.fillText('♥ JUST MOMENT • FRAMERIO TICKET ♥', cw / 2, ch - 30)
    return canvas.toDataURL('image/jpeg', 0.95)
  }

  // ── Style: SNOOPY & MIFFY (3 FOTO) ────────────────────────
  if (tpl.styleType === 'snoopy') {
    const cw = 480, count = 3
    const photoH = 340, headerH = 90, footerH = 160
    const ch = headerH + count * photoH + (count - 1) * gap + footerH + pad * 2
    canvas.width = cw; canvas.height = ch

    // Background Putih Bersih
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, cw, ch)

    // Header Snoopy Tidur
    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 20px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('☁️ SNOOPY & MIFFY 🌙', cw / 2, 55)

    const ix = 34, iw = cw - 68
    imgs.slice(0, count).forEach((img, i) => {
      const iy = headerH + pad + i * (photoH + gap)
      // Outline Tipis Hitam Kartun
      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 3
      ctx.strokeRect(ix, iy, iw, photoH)
      ctx.drawImage(img, ix + 2, iy + 2, iw - 4, photoH - 4)

      // Stiker Lucu di Sisi Frame
      ctx.font = '24px sans-serif'
      if (i === 0) ctx.fillText('⭐ ⭐ ⭐', cw - 70, iy + photoH + 20)
      if (i === 1) ctx.fillText('🐰', ix - 10, iy + photoH - 20)
      if (i === 2) ctx.fillText('🌸', cw - 50, iy + 40)
    })

    // Ilustrasi Perahu Kertas Bawah
    ctx.font = '36px sans-serif'
    ctx.fillText('⛵ 🐶 🐰 ✨', cw / 2, ch - 80)
    ctx.font = 'bold 14px monospace'
    ctx.fillStyle = '#64748b'
    ctx.fillText('SAILING IN DREAMS • FRAMERIO', cw / 2, ch - 35)
    return canvas.toDataURL('image/jpeg', 0.95)
  }

  // ── Style: KORAN "FOTO KITA BLUR" ─────────────────────────
  if (tpl.styleType === 'newspaper-blur') {
    const cw = 820, ch = 940
    canvas.width = cw; canvas.height = ch

    ctx.fillStyle = '#fafaf9'
    ctx.fillRect(0, 0, cw, ch)
    ctx.strokeStyle = '#1c1917'
    ctx.lineWidth = 2
    ctx.strokeRect(16, 16, cw - 32, ch - 32)

    // Header Koran
    ctx.font = 'bold 13px serif'
    ctx.fillStyle = '#1c1917'
    ctx.fillText('SPECIAL EDITION  •  NEWS PHOTOBOOTH BY FRAMERIO  •  SPECIAL EDITION', cw / 2, 45)
    ctx.beginPath(); ctx.moveTo(25, 58); ctx.lineTo(cw - 25, 58); ctx.stroke()

    // Judul Besar Koran
    ctx.fillStyle = '#b91c1c'
    ctx.font = '900 52px serif'
    ctx.textAlign = 'center'
    ctx.fillText('FOTO KITA BLUR', cw / 2, 115)
    ctx.fillStyle = '#1e3a8a'
    ctx.font = 'italic 28px serif'
    ctx.fillText('Tak Banyak Yang Kulihat', cw / 2, 155)

    // Foto Utama Besar
    if (imgs[0]) {
      ctx.drawImage(imgs[0], 40, 180, cw - 80, 440)
      ctx.strokeRect(40, 180, cw - 80, 440)
    }

    // Sub-Foto & Kolom Teks Lagu
    if (imgs[1]) {
      ctx.drawImage(imgs[1], 40, 640, 240, 240)
      ctx.strokeRect(40, 640, 240, 240)
    }

    // Teks Koran Kanan
    ctx.textAlign = 'left'
    ctx.fillStyle = '#1c1917'
    ctx.font = 'bold 16px -apple-system, sans-serif'
    ctx.fillText('KAMU BLUEBERRY & AKU PASTRY 🫐🥐', 310, 670)

    ctx.font = '12px serif'
    ctx.fillStyle = '#44403c'
    const article = "Lagu Foto Kita Blur mengingatkan bahwa kenangan terbaik tidak selalu hadir dalam kualitas terbaik. Kadang foto yang buram justru menjadi bukti bahwa kita benar-benar sedang hidup di dalam momen itu: tertawa, bergerak, dan menikmati waktu bersama."
    ctx.fillText(article.substring(0, 65), 310, 710)
    ctx.fillText(article.substring(65, 130), 310, 730)
    ctx.fillText(article.substring(130, 195), 310, 750)
    ctx.fillText(article.substring(195), 310, 770)

    // Player Bar Spotify Style
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(310, 810, cw - 350, 60)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 13px monospace'
    ctx.fillText('▶ NOW PLAYING: FOTO KITA BLUR - SAL PRIADI', 330, 845)

    return canvas.toDataURL('image/jpeg', 0.95)
  }

  // ── Style: POLKADOT COKLAT (SAFARI 6 PHOTOS) ──────────────
  if (tpl.styleType === 'polkadot-brown') {
    const cw = 800, ch = 1100
    canvas.width = cw; canvas.height = ch

    // Dark Chocolate Background
    ctx.fillStyle = '#2b1810'
    ctx.fillRect(0, 0, cw, ch)

    // Big Baby Blue Polkadots
    ctx.fillStyle = '#bae6fd'
    for (let x = 30; x < cw; x += 160) {
      for (let y = 30; y < ch; y += 160) {
        ctx.beginPath()
        ctx.arc(x, y, 42, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 6 Rounded Photos (2 Kolom x 3 Baris)
    const gapX = 24, gapY = 24, marginX = 40, marginY = 60
    const cellW = (cw - marginX * 2 - gapX) / 2
    const cellH = (ch - marginY * 2 - gapY * 2 - 80) / 3

    imgs.slice(0, 6).forEach((img, i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const px = marginX + col * (cellW + gapX)
      const py = marginY + row * (cellH + gapY)

      ctx.save()
      ctx.beginPath()
      ctx.roundRect(px, py, cellW, cellH, 16)
      ctx.clip()
      ctx.drawImage(img, px, py, cellW, cellH)
      ctx.restore()

      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(px, py, cellW, cellH, 16)
      ctx.stroke()
    })

    // Watermark Logo Safari Framerio
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 22px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('framerio safari booth', cw / 2, ch - 35)

    return canvas.toDataURL('image/jpeg', 0.95)
  }

  // ── Style: POLKADOT BLUE & LACE (SAFARI BLUE) ─────────────
  if (tpl.styleType === 'polkadot-blue-lace') {
    const cw = 800, ch = 1100
    canvas.width = cw; canvas.height = ch

    // Navy Blue Background
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, cw, ch)

    // White Polkadots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    for (let x = 40; x < cw; x += 100) {
      for (let y = 40; y < ch; y += 100) {
        ctx.beginPath()
        ctx.arc(x, y, 9, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Renda Putih Vertikal Sisi Kiri
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    for (let y = 0; y < ch; y += 24) {
      ctx.beginPath()
      ctx.arc(28, y + 12, 14, 0, Math.PI * 2)
      ctx.fill()
    }

    // 6 Rounded Photos
    const gapX = 24, gapY = 24, marginX = 64, marginY = 60
    const cellW = (cw - marginX - 40 - gapX) / 2
    const cellH = (ch - marginY * 2 - gapY * 2 - 80) / 3

    imgs.slice(0, 6).forEach((img, i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const px = marginX + col * (cellW + gapX)
      const py = marginY + row * (cellH + gapY)

      ctx.save()
      ctx.beginPath()
      ctx.roundRect(px, py, cellW, cellH, 14)
      ctx.clip()
      ctx.drawImage(img, px, py, cellW, cellH)
      ctx.restore()

      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.roundRect(px, py, cellW, cellH, 14)
      ctx.stroke()
    })

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 22px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('framerio safari booth • blue lace', cw / 2, ch - 35)

    return canvas.toDataURL('image/jpeg', 0.95)
  }

  // ── Style: BATIK NUSANTARA (8 FOTO) ───────────────────────
  if (tpl.styleType === 'batik') {
    const cw = 860, ch = 1140
    canvas.width = cw; canvas.height = ch

    ctx.fillStyle = '#fbf7ee'
    ctx.fillRect(0, 0, cw, ch)

    // Border Batik Emas dan Motif Vertikal Tengah
    ctx.fillStyle = '#ca8a04'
    ctx.fillRect(cw / 2 - 12, 0, 24, ch)
    ctx.fillStyle = '#ef4444'
    for (let y = 20; y < ch; y += 40) {
      ctx.beginPath()
      ctx.arc(cw / 2, y, 6, 0, Math.PI * 2)
      ctx.fill()
    }

    const gapX = 28, gapY = 18, marginX = 40, marginY = 40
    const cellW = (cw - marginX * 2 - gapX) / 2
    const cellH = (ch - marginY * 2 - gapY * 3 - 60) / 4

    imgs.slice(0, 8).forEach((img, i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const px = marginX + col * (cellW + gapX)
      const py = marginY + row * (cellH + gapY)

      ctx.drawImage(img, px, py, cellW, cellH)
      ctx.strokeStyle = '#ca8a04'
      ctx.lineWidth = 2
      ctx.strokeRect(px, py, cellW, cellH)
    })

    ctx.fillStyle = '#854d0e'
    ctx.font = 'bold 18px serif'
    ctx.textAlign = 'center'
    ctx.fillText('BATIK NUSANTARA • FRAMERIO HERITAGE', cw / 2, ch - 20)
    return canvas.toDataURL('image/jpeg', 0.95)
  }

  // ── Style: KK STUDIO DENIM STARS 4R (8 FOTO) ──────────────
  if (tpl.styleType === 'denim-stars') {
    const cw = 860, ch = 1140
    canvas.width = cw; canvas.height = ch

    // Dark Blue Denim Background
    ctx.fillStyle = '#1e3a5f'
    ctx.fillRect(0, 0, cw, ch)

    // Jahitan Renda Putih Vertikal di Tengah & Sisi
    ctx.fillStyle = '#ffffff'
    for (let y = 0; y < ch; y += 30) {
      ctx.fillRect(cw / 2 - 8, y, 16, 16)
    }

    const gapX = 36, gapY = 20, marginX = 44, marginY = 50
    const cellW = (cw - marginX * 2 - gapX) / 2
    const cellH = (ch - marginY * 2 - gapY * 3 - 60) / 4

    imgs.slice(0, 8).forEach((img, i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const px = marginX + col * (cellW + gapX)
      const py = marginY + row * (cellH + gapY)

      // Frame Bintang Emas Berkelip
      ctx.fillStyle = '#fef08a'
      ctx.fillRect(px - 6, py - 6, cellW + 12, cellH + 12)
      ctx.drawImage(img, px, py, cellW, cellH)

      // Bintang di 4 Sudut
      ctx.font = '14px sans-serif'
      ctx.fillText('✦', px - 12, py)
      ctx.fillText('✦', px + cellW + 4, py)
    })

    ctx.fillStyle = '#fef08a'
    ctx.font = 'bold 20px serif'
    ctx.textAlign = 'center'
    ctx.fillText('★ KK STUDIO 4R • DENIM STARS ★', cw / 2, ch - 22)
    return canvas.toDataURL('image/jpeg', 0.95)
  }

  // ── Style: CUSTOM DYNAMIC TEMPLATE ─────────────────────────
  if (tpl.styleType === 'custom' || tpl.isCustom) {
    const count = tpl.photosCount || 4
    let cw = 480, ch = 1200
    if (count === 6) { cw = 600; ch = 900 }
    else if (count === 8) { cw = 600; ch = 1100 }
    else if (count === 2) { cw = 480; ch = 760 }
    else if (count === 3) { cw = 480; ch = 980 }
    else { cw = 480; ch = 1220 }

    canvas.width = cw; canvas.height = ch
    ctx.fillStyle = tpl.bg || '#ffffff'
    ctx.fillRect(0, 0, cw, ch)

    // Render Gambar Template dari Perangkat jika ada
    if (tpl.bgImage) {
      try {
        const bgImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = tpl.bgImage!
        })
        ctx.drawImage(bgImg, 0, 0, cw, ch)
      } catch (err) {
        console.warn('Gagal memuat template gambar background perangkat', err)
      }
    }

    const labelH = 80
    const margin = Math.max(tpl.pad || 16, 16)
    const gapSize = tpl.gap || 12
    const radius = tpl.rounded || 12

    if (count > 4) {
      const cols = 2
      const rows = Math.ceil(count / cols)
      const cellW = (cw - margin * 2 - gapSize * (cols - 1)) / cols
      const cellH = (ch - margin * 2 - labelH - gapSize * (rows - 1)) / rows

      imgs.slice(0, count).forEach((img, i) => {
        const col = i % cols, row = Math.floor(i / cols)
        const px = margin + col * (cellW + gapSize)
        const py = margin + row * (cellH + gapSize)

        ctx.save()
        ctx.beginPath()
        ctx.roundRect(px, py, cellW, cellH, radius)
        ctx.clip()
        ctx.drawImage(img, px, py, cellW, cellH)
        ctx.restore()

        if (tpl.frameWidth && tpl.frameWidth > 0) {
          ctx.strokeStyle = tpl.frame || '#000'
          ctx.lineWidth = tpl.frameWidth
          ctx.beginPath()
          ctx.roundRect(px, py, cellW, cellH, radius)
          ctx.stroke()
        }
      })
    } else {
      const cellW = cw - margin * 2
      const cellH = (ch - margin * 2 - labelH - gapSize * (count - 1)) / count

      imgs.slice(0, count).forEach((img, i) => {
        const py = margin + i * (cellH + gapSize)

        ctx.save()
        ctx.beginPath()
        ctx.roundRect(margin, py, cellW, cellH, radius)
        ctx.clip()
        ctx.drawImage(img, margin, py, cellW, cellH)
        ctx.restore()

        if (tpl.frameWidth && tpl.frameWidth > 0) {
          ctx.strokeStyle = tpl.frame || '#000'
          ctx.lineWidth = tpl.frameWidth
          ctx.beginPath()
          ctx.roundRect(margin, py, cellW, cellH, radius)
          ctx.stroke()
        }
      })
    }

    // Label & Subtext
    ctx.fillStyle = tpl.textColor || '#111827'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(tpl.labelText || 'Framerio Memories', cw / 2, ch - 42)
    if (tpl.subText) {
      ctx.font = '12px sans-serif'
      ctx.fillText(tpl.subText, cw / 2, ch - 22)
    }

    return canvas.toDataURL('image/jpeg', 0.95)
  }

  // ── Style Standar: COUPLE & LAINNYA ───────────────────────
  const cw = 480, count = 4, photoH = 320, LABEL_H = 70
  const ch = fw * 2 + pad * 2 + count * photoH + (count - 1) * gap + LABEL_H
  canvas.width = cw; canvas.height = ch
  ctx.fillStyle = tpl.bg
  ctx.fillRect(0, 0, cw, ch)

  imgs.slice(0, count).forEach((img, i) => {
    const iy = fw + pad + i * (photoH + gap)
    ctx.drawImage(img, fw + pad, iy, cw - (fw + pad) * 2, photoH)
  })

  ctx.fillStyle = tpl.textColor
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(tpl.labelText, cw / 2, ch - 25)

  return canvas.toDataURL('image/jpeg', 0.95)
}

/* ════════════════════════════════════════════════════════════
   COLLAGE CSS PREVIEW (MENAMPILKAN STYLE SEPERTI DI GAMBAR)
════════════════════════════════════════════════════════════ */
function CollagePreview({ shots, tpl, size = 'md' }: {
  shots: string[]; tpl: Template; size?: 'sm' | 'md'
}) {
  const count = tpl.photosCount || 4
  const imgs = shots.slice(0, count)

  // ── Pratinjau BGIMAGE TEMPLATES (foto user dgn background gambar) ──
  if (tpl.styleType && tpl.styleType.startsWith('bgimage-')) {
    return (
      <div
        className="w-full rounded-2xl overflow-hidden shadow-md relative bg-cover bg-center"
        style={{
          backgroundImage: tpl.bgImage ? `url(${tpl.bgImage})` : undefined,
          backgroundColor: tpl.bg || '#1a1a2e',
          aspectRatio: '9/16'
        }}
      >
        {/* overlay tipis agar foto jelas */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Area foto filmstrip: mengikuti proporsi template */}
        <div
          className="absolute flex flex-col gap-[2px]"
          style={{
            top: '34%',
            left: '22%',
            right: '22%',
            bottom: '12%'
          }}
        >
          {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-[2px] overflow-hidden"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.5)'
              }}
            >
              {imgs[i] ? <img src={imgs[i]} className="w-full h-full object-cover" /> : null}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Pratinjau TIKET KONSER ──
  if (tpl.styleType === 'ticket') {
    return (
      <div className="w-full bg-[#fcf8f2] border-4 border-[#7f1d1d] rounded-2xl p-2 flex flex-col gap-1.5 shadow-md">
        <div className="text-center border-b border-[#7f1d1d] pb-1">
          <div className="text-[9px] font-serif font-black text-[#7f1d1d]">Solo is Solo</div>
          <div className="text-[6px] font-mono font-bold text-[#7f1d1d]">ROW B2 • SHOW 02</div>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-zinc-200 rounded border border-[#7f1d1d] overflow-hidden">
              {imgs[i] ? <img src={imgs[i]} className="w-full h-full object-cover" /> : null}
            </div>
          ))}
        </div>
        <div className="text-center text-[6px] font-mono text-[#7f1d1d] pt-1">JUST MOMENT</div>
      </div>
    )
  }

  // ── Pratinjau SNOOPY ──
  if (tpl.styleType === 'snoopy') {
    return (
      <div className="w-full bg-white border-2 border-slate-700 rounded-2xl p-2 flex flex-col gap-1.5 shadow-md">
        <div className="text-center text-[8px] font-bold text-slate-800">☁️ SNOOPY & MIFFY</div>
        <div className="flex flex-col gap-1 flex-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-zinc-100 rounded-lg border-2 border-slate-700 overflow-hidden">
              {imgs[i] ? <img src={imgs[i]} className="w-full h-full object-cover" /> : null}
            </div>
          ))}
        </div>
        <div className="text-center text-[7px] text-slate-600 font-bold">⛵ 🐶 🐰 DREAMING</div>
      </div>
    )
  }

  // ── Pratinjau POLKADOT COKLAT ──
  if (tpl.styleType === 'polkadot-brown') {
    return (
      <div className="w-full bg-[#2b1810] rounded-2xl p-2 flex flex-col gap-1 shadow-md relative overflow-hidden">
        {/* Dots */}
        <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-[#bae6fd] opacity-80" />
        <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#bae6fd] opacity-80" />
        <div className="grid grid-cols-2 gap-1.5 z-10 flex-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-zinc-200 rounded-lg border-2 border-white overflow-hidden">
              {imgs[i] ? <img src={imgs[i]} className="w-full h-full object-cover" /> : null}
            </div>
          ))}
        </div>
        <div className="text-center text-[7px] font-bold text-[#bae6fd] pt-1 z-10">framerio safari</div>
      </div>
    )
  }

  // ── Pratinjau POLKADOT BLUE LACE ──
  if (tpl.styleType === 'polkadot-blue-lace') {
    return (
      <div className="w-full bg-[#1e293b] rounded-2xl p-2 pl-3 flex flex-col gap-1 shadow-md relative border-l-4 border-dashed border-white/60">
        <div className="grid grid-cols-2 gap-1.5 z-10 flex-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-zinc-200 rounded-lg border border-white overflow-hidden">
              {imgs[i] ? <img src={imgs[i]} className="w-full h-full object-cover" /> : null}
            </div>
          ))}
        </div>
        <div className="text-center text-[7px] font-bold text-white pt-1">safari blue lace</div>
      </div>
    )
  }

  // ── Pratinjau KORAN "FOTO KITA BLUR" ──
  if (tpl.styleType === 'newspaper-blur') {
    return (
      <div className="w-full bg-[#fafaf9] border-2 border-stone-800 rounded-xl p-2 flex flex-col gap-1 shadow-md">
        <div className="text-center text-[6px] font-serif border-b border-stone-700 pb-0.5">NEWS PHOTOBOOTH</div>
        <div className="text-center text-[10px] font-black text-red-700 leading-none">FOTO KITA BLUR</div>
        <div className="aspect-[16/10] bg-zinc-200 border border-stone-800 rounded overflow-hidden">
          {imgs[0] ? <img src={imgs[0]} className="w-full h-full object-cover" /> : null}
        </div>
        <div className="flex gap-1 items-center mt-0.5">
          <div className="w-9 h-9 bg-zinc-200 border border-stone-800 rounded flex-shrink-0 overflow-hidden">
            {imgs[1] ? <img src={imgs[1]} className="w-full h-full object-cover" /> : null}
          </div>
          <div className="text-[5px] text-stone-700 leading-tight">
            <strong>BLUEBERRY & PASTRY</strong><br/>Tak banyak yang kulihat...
          </div>
        </div>
      </div>
    )
  }

  // ── Pratinjau BATIK / DENIM (8 FOTO) ──
  if (tpl.styleType === 'batik' || tpl.styleType === 'denim-stars') {
    const isDenim = tpl.styleType === 'denim-stars'
    return (
      <div className={`w-full rounded-2xl p-1.5 flex flex-col gap-1 shadow-md ${isDenim ? 'bg-[#1e3a5f]' : 'bg-[#fbf7ee] border-2 border-[#ca8a04]'}`}>
        <div className="grid grid-cols-2 gap-1 flex-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`aspect-[4/3] rounded overflow-hidden ${isDenim ? 'border border-[#fef08a] bg-zinc-200' : 'border border-[#ca8a04] bg-zinc-100'}`}>
              {imgs[i] ? <img src={imgs[i]} className="w-full h-full object-cover" /> : null}
            </div>
          ))}
        </div>
        <div className={`text-center text-[6px] font-bold ${isDenim ? 'text-[#fef08a]' : 'text-[#854d0e]'}`}>
          {isDenim ? '★ KK STUDIO 4R ★' : 'BATIK NUSANTARA'}
        </div>
      </div>
    )
  }

  // ── Pratinjau CUSTOM / DYNAMIC TEMPLATE ──
  if (tpl.styleType === 'custom' || tpl.isCustom) {
    const count = tpl.photosCount || 4
    return (
      <div
        className="w-full rounded-2xl p-2 flex flex-col gap-1 shadow-sm border relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundColor: tpl.bg || '#ffffff',
          backgroundImage: tpl.bgImage ? `url(${tpl.bgImage})` : undefined,
          borderColor: tpl.frame || '#e5e7eb',
          borderWidth: `${Math.min(tpl.frameWidth || 1, 4)}px`
        }}
      >
        <div
          className={`grid gap-1 flex-1 relative z-10 ${
            count > 4 ? 'grid-cols-2' : count === 3 ? 'grid-cols-1' : count === 2 ? 'grid-cols-1' : 'grid-cols-1'
          }`}
        >
          {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-zinc-200/90 overflow-hidden shadow-sm"
              style={{
                borderRadius: `${Math.min(tpl.rounded || 6, 12)}px`,
                borderColor: tpl.frame || 'transparent',
                borderWidth: tpl.frameWidth ? '1px' : '0'
              }}
            >
              {imgs[i] ? <img src={imgs[i]} className="w-full h-full object-cover" /> : null}
            </div>
          ))}
        </div>
        <div className="text-center pt-1 truncate relative z-10 bg-white/40 backdrop-blur-[2px] rounded-lg mt-0.5 px-1">
          <p className="text-[7px] font-bold truncate leading-tight" style={{ color: tpl.textColor || '#000' }}>
            {tpl.labelText || 'Custom'}
          </p>
          {tpl.subText && (
            <p className="text-[5px] uppercase opacity-75 truncate" style={{ color: tpl.textColor || '#000' }}>
              {tpl.subText}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Default Standard Preview
  return (
    <div className="w-full bg-white rounded-2xl p-2 flex flex-col gap-1 border shadow-sm">
      <div className="flex flex-col gap-1 flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] bg-zinc-200 rounded overflow-hidden">
            {imgs[i] ? <img src={imgs[i]} className="w-full h-full object-cover" /> : null}
          </div>
        ))}
      </div>
      <div className="text-center text-[7px] font-bold text-zinc-700">{tpl.labelText}</div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function Photobooth({ allowed }: { allowed: boolean }) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)

  const [facing,    setFacing]    = useState<'user' | 'environment'>('user')
  const [ready,     setReady]     = useState(false)
  const [template,  setTemplate]  = useState<Template>(TEMPLATES[0]) // Snoopy default
  const [layout,    setLayout]    = useState<Layout | string>(TEMPLATES[0].recommendedLayout)
  const [activeTab, setActiveTab] = useState<Category | string>('Semua')
  const [shots,     setShots]     = useState<string[]>([])
  const [capturing, setCapturing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [result,    setResult]    = useState<string | null>(null)
  const [saved,     setSaved]     = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [step,      setStep]      = useState<'shoot' | 'result'>('shoot')

  // Custom Templates & User Permissions
  const [customTemplates, setCustomTemplates] = useState<Template[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userAccess, setUserAccess] = useState<{
    authenticated: boolean
    canCreateTemplate: boolean
    isAdmin: boolean
    isTrialActive: boolean
    hasActiveSub: boolean
  }>({
    authenticated: false,
    canCreateTemplate: false,
    isAdmin: false,
    isTrialActive: false,
    hasActiveSub: false
  })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Fetch User Access & Custom Templates
  useEffect(() => {
    async function initData() {
      try {
        const [accRes, tplRes] = await Promise.all([
          fetch('/api/user/access'),
          fetch('/api/templates')
        ])
        const accData = await accRes.json()
        if (accData) setUserAccess(accData)

        const tplData = await tplRes.json()
        if (tplData.success && tplData.templates) {
          const mapped: Template[] = tplData.templates.map((t: any) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            tag: t.tag,
            tagColor: t.tagColor,
            usesCount: t.usesCount || '0 uses',
            photosCount: t.photosCount || 4,
            recommendedLayout: t.recommendedLayout || 'strip4',
            bg: t.bg,
            frame: t.frame,
            frameWidth: t.frameWidth,
            rounded: t.rounded,
            gap: t.gap,
            pad: t.pad,
            textColor: t.textColor,
            labelText: t.labelText,
            subText: t.subText,
            filter: t.filter,
            styleType: 'custom',
            bgImage: t.bgImage,
            isCustom: true,
            isPublic: t.isPublic
          }))
          setCustomTemplates(mapped)
        }
      } catch (e) {
        console.error('Failed to init photobooth templates data', e)
      }
    }
    initData()
  }, [])

  const allTemplates = [...TEMPLATES, ...customTemplates]
  const targetPhotoCount = template.photosCount || 4

  const filteredTemplates = activeTab === 'Semua' 
    ? allTemplates 
    : allTemplates.filter(t => t.category === activeTab)

  const handleOpenCreateModal = () => {
    if (!userAccess.authenticated) {
      window.location.href = '/login'
      return
    }
    if (!userAccess.canCreateTemplate) {
      setShowUpgradeModal(true)
      return
    }
    setIsModalOpen(true)
  }

  const handleTemplateCreated = (newTpl: any) => {
    const formatted: Template = {
      id: newTpl.id,
      name: newTpl.name,
      category: newTpl.category,
      tag: newTpl.tag,
      tagColor: newTpl.tagColor,
      usesCount: newTpl.usesCount || '1 uses',
      photosCount: newTpl.photosCount || 4,
      recommendedLayout: newTpl.recommendedLayout || 'strip4',
      bg: newTpl.bg,
      frame: newTpl.frame,
      frameWidth: newTpl.frameWidth,
      rounded: newTpl.rounded,
      gap: newTpl.gap,
      pad: newTpl.pad,
      textColor: newTpl.textColor,
      labelText: newTpl.labelText,
      subText: newTpl.subText,
      filter: newTpl.filter,
      styleType: 'custom',
      bgImage: newTpl.bgImage,
      isCustom: true,
      isPublic: newTpl.isPublic
    }
    setCustomTemplates(prev => [formatted, ...prev])
    selectTemplate(formatted)
  }

  async function startCamera() {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setReady(true)
      setError(null)
    } catch (e: any) {
      setError('Tidak bisa akses kamera: ' + (e?.message || e))
    }
  }

  useEffect(() => {
    if (allowed) startCamera()
    return () => streamRef.current?.getTracks().forEach(t => t.stop())
  }, [facing, allowed])

  function captureFrame(): string {
    const video = videoRef.current!
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')!
    if (facing === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.92)
  }

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

  async function runCapture() {
    if (!videoRef.current || !ready || capturing) return
    setCapturing(true)
    setShots([])
    const total = targetPhotoCount
    const collected: string[] = []

    for (let i = 0; i < total; i++) {
      for (let c = 5; c >= 1; c--) {
        setCountdown(c)
        await sleep(1000)
      }
      setCountdown(null)
      collected.push(captureFrame())
      setShots([...collected])
      await sleep(500)
    }

    const composed = await composeLayout(collected, layout, template)
    setResult(composed)
    setSaved(false)
    setCapturing(false)
    setStep('result')
  }

  async function selectTemplate(newTpl: Template) {
    setTemplate(newTpl)
    setLayout(newTpl.recommendedLayout)
    setShots([])
    setResult(null)
  }

  function handlePrint() {
    if (!result) return
    const win = window.open('', '_blank')
    if (!win) { alert('Izinkan popup browser untuk mencetak foto'); return }
    win.document.write(`<!doctype html><html><head><title>Print Framerio</title>
      <style>
        @page { margin: 0; }
        body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
        img { max-width: 100%; max-height: 100vh; }
      </style>
      </head><body>
      <img src="${result}" onload="window.print(); setTimeout(()=>window.close(), 500);" />
      </body></html>`)
    win.document.close()
  }

  function handleDownload() {
    if (!result) return
    const a = document.createElement('a')
    a.href = result
    a.download = `framerio-${template.id}-${Date.now()}.jpg`
    a.click()
  }

  async function handleSave() {
    if (!result || saved) return
    setSaving(true)
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: result, layout })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan foto')
      setSaved(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (!allowed) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-[#e4e3de] rounded-[36px] border-4 border-white shadow-xl my-12">
        <h2 className="text-2xl font-black text-zinc-900 mb-2 uppercase">Masa Akses Selesai</h2>
        <p className="text-zinc-600 mb-6 text-sm font-medium">Silakan berlangganan untuk menikmati studio photobooth tanpa batas.</p>
        <a href="/pricing" className="inline-block px-8 py-3.5 rounded-full btn-orange-glow text-white font-black text-xs tracking-wider uppercase shadow-md">
          Lihat Paket Langganan
        </a>
      </div>
    )
  }

  return (
    <div className="w-full px-3 sm:px-5 py-4 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="ml-3 font-black">✕</button>
        </div>
      )}

      {step === 'shoot' ? (
        <div className="space-y-4">
          {/* ── TOP SECTION: Camera & Main Live Preview ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3 items-start">
            {/* Camera Viewfinder */}
            <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-3.5 shadow-md">
              <div className="flex items-center justify-between mb-2 px-0.5">
                <span className="text-[11px] font-mono tracking-wider text-zinc-700 font-bold uppercase">
                  Template Aktif: <strong className="text-[#e85200]">{template.name}</strong>
                </span>
                <span className="text-[11px] font-mono font-bold text-[#e85200] bg-white/70 px-2.5 py-0.5 rounded-full border border-white">
                  Pose {shots.length}/{targetPhotoCount}
                </span>
              </div>

              {/* Viewfinder Video */}
              <div className="relative rounded-xl overflow-hidden bg-zinc-900" style={{ aspectRatio: '4/3' }}>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {countdown !== null && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/70 backdrop-blur-sm">
                    <span className="text-white font-black tabular-nums drop-shadow-2xl" style={{ fontSize: 'clamp(4rem,18vw,8rem)' }}>
                      {countdown}
                    </span>
                    <span className="text-[#e85200] text-[11px] font-bold tracking-widest mt-2 uppercase">
                      Pose {shots.length + 1}/{targetPhotoCount}
                    </span>
                  </div>
                )}
                {!ready && countdown === null && (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs bg-zinc-900/90">
                    Menghubungkan kamera...
                  </div>
                )}
                {/* Progress Dots */}
                <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
                  {Array.from({ length: targetPhotoCount }).map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < shots.length ? 'bg-[#e85200]' : 'bg-white/40'}`} />
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2 mt-2.5 items-center">
                <button
                  onClick={() => setFacing(f => f === 'user' ? 'environment' : 'user')}
                  className="px-4 py-2.5 rounded-full text-xs font-bold bg-white/70 hover:bg-white border border-zinc-300 text-zinc-700 transition flex-shrink-0"
                >
                  ↺ Balik Kamera
                </button>
                <button
                  onClick={runCapture}
                  disabled={capturing || !ready}
                  className="flex-1 py-3 rounded-full btn-orange-glow text-white text-xs sm:text-sm font-black uppercase tracking-wider transition disabled:opacity-40"
                >
                  {capturing ? 'Sedang Foto...' : `Mulai Foto (${targetPhotoCount} Pose)`}
                </button>
              </div>
            </div>

            {/* Live Center Collage Preview */}
            <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-3.5 shadow-md flex flex-col items-center">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-bold mb-2">
                Pratinjau ({template.name})
              </span>
              <div className="w-full flex justify-center">
                <div className="w-full max-w-[210px]">
                  <CollagePreview shots={shots} tpl={template} size="md" />
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM SECTION: KATALOG PERSIS SEPERTI GAMBAR 1 & 2 ── */}
          <div className="bg-[#eceae4] rounded-[28px] border-2 border-white p-5 sm:p-7 shadow-md">
            {/* Header Text */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                Pilih Template Kolase Favorit
              </h2>
              <p className="text-xs text-zinc-500 italic mt-0.5">
                Koleksi template aesthetic Snoopy, Tiket Konser, Koran Foto Kita Blur, Batik & Polkadot
              </p>

              {/* Filter Tabs & Tombol Buat Template */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                  {(['Semua', 'Karakter & Kartun', 'Tiket & Majalah', 'Polkadot & Renda', 'Batik & Denim', 'Kustom'] as Category[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeTab === tab
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-white/80 hover:bg-white text-zinc-700 border border-zinc-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tombol Buat Template Sendiri */}
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 rounded-full text-xs font-black bg-[#e85200] hover:bg-[#ff5d07] text-white shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 transform hover:scale-105"
                >
                  <span>✨</span> + Buat Template Sendiri
                </button>
              </div>
            </div>

            {/* Kartu-Kartu Template Persis Gambar 1 & 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-1">
              {filteredTemplates.map(t => {
                const isSelected = template.id === t.id
                return (
                  <div
                    key={t.id}
                    onClick={() => selectTemplate(t)}
                    className={`relative rounded-3xl p-3 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-purple-600 ring-4 ring-purple-500/20 bg-white shadow-xl scale-[1.02]'
                        : 'border-white/80 bg-white/70 hover:bg-white hover:border-purple-300 shadow-sm'
                    }`}
                  >
                    {/* Top Badges (Free & Ad-free style) */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-sm">
                        ✦ Free
                      </span>
                      <span className="text-[9px] font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                        Ad-free
                      </span>
                    </div>

                    {/* Visual Collage Mini Preview */}
                    <div className="w-full flex-1 flex items-center justify-center my-1 relative">
                      <div className="w-full max-w-[130px]">
                        <CollagePreview shots={[]} tpl={t} size="sm" />
                      </div>

                      {/* Hover Pill "Start Creating" */}
                      <div className="absolute inset-0 bg-black/10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="px-3 py-1 rounded-full bg-white text-zinc-900 text-[10px] font-black shadow-md flex items-center gap-1">
                          📸 Pakai Template
                        </span>
                      </div>
                    </div>

                    {/* Bottom Info: Uses Count & Title */}
                    <div className="mt-3 pt-2 border-t border-zinc-200/80">
                      <div className="flex items-center gap-1 text-[9px] font-semibold text-zinc-500 mb-1">
                        <span>👥</span>
                        <span>{t.usesCount}</span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-900 truncate">
                        {t.name}
                      </h4>
                      <p className="text-[10px] font-medium text-zinc-500 mt-0.5">
                        📷 {t.photosCount} photos
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── RESULT STEP ────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="retro-canvas p-6 rounded-[32px] border-4 border-white flex items-center justify-center">
            {result && (
              <img
                src={result}
                alt="Hasil Photobooth"
                className="max-h-[580px] rounded-2xl shadow-2xl border-4 border-white"
              />
            )}
          </div>
          <div className="space-y-3 bg-[#e4e3de] p-6 sm:p-8 rounded-[36px] border-4 border-white shadow-xl">
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase">
              Hasil Foto Selesai
            </h3>
            <p className="text-xs text-zinc-600 mb-6 font-medium">
              Template: {template.name} &bull; {targetPhotoCount} Pose
            </p>

            <button
              onClick={handlePrint}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md transition"
            >
              Cetak ke Printer
            </button>
            <button
              onClick={handleDownload}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md transition"
            >
              Unduh Gambar (JPG)
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="w-full btn-orange-glow text-white py-3.5 rounded-full font-black text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50"
            >
              {saved ? 'Tersimpan di Galeri' : saving ? 'Menyimpan...' : 'Simpan ke Galeri Akun'}
            </button>
            <button
              onClick={() => { setStep('shoot'); setShots([]); setResult(null) }}
              className="w-full bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 py-3 rounded-full font-bold text-xs uppercase transition"
            >
              Ambil Ulang / Ganti Template
            </button>
          </div>
        </div>
      )}

      {/* Modal Buat Template Kustom */}
      <CustomTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTemplateCreated}
        isAdmin={userAccess.isAdmin}
      />

      {/* Modal Ajakan Berlangganan jika trial habis */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#f5f4ef] rounded-3xl border-2 border-white p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl">
              ⭐
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900">Masa Percobaan 7 Hari Selesai</h3>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                Fitur membuat template custom pribadi hanya tersedia untuk pengguna dalam masa trial 7 hari gratis atau pengguna dengan langganan aktif.
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 text-xs text-left space-y-1">
              <p className="font-bold text-zinc-800">Paket Mulai Dari:</p>
              <p className="text-zinc-600">• Rp 10.000 / 30 hari</p>
              <p className="text-zinc-600">• Rp 120.000 / 1 tahun penuh</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-zinc-200 text-zinc-700 hover:bg-zinc-300 transition"
              >
                Nanti Dulu
              </button>
              <Link
                href="/subscription"
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#e85200] text-white hover:bg-[#ff5d07] shadow-lg shadow-orange-500/20 transition flex items-center justify-center"
              >
                Berlangganan Sekarang
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
