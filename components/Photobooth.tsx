'use client'
import { useEffect, useRef, useState } from 'react'

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type Layout = 'strip4' | 'strip2' | 'grid4' | 'wide2' | 'solo'

type Template = {
  id: string
  name: string
  emoji: string
  bg: string
  frame: string
  frameWidth: number
  rounded: number
  gap: number
  pad: number
  textColor: string
  labelText: string
  filter: string
  previewBorder: string
}

type LayoutDef = { id: Layout; name: string; count: number }

/* ════════════════════════════════════════════════════════════
   LAYOUTS
════════════════════════════════════════════════════════════ */
const LAYOUTS: LayoutDef[] = [
  { id: 'strip4', name: 'Strip 4', count: 4 },
  { id: 'strip2', name: 'Strip 2', count: 2 },
  { id: 'grid4',  name: 'Grid 2×2', count: 4 },
  { id: 'wide2',  name: 'Wide 2', count: 2 },
  { id: 'solo',   name: 'Solo', count: 1 },
]

/* ════════════════════════════════════════════════════════════
   25 TEMPLATES
════════════════════════════════════════════════════════════ */
const TEMPLATES: Template[] = [
  // 1
  { id:'minimal', name:'Minimal', emoji:'🤍',
    bg:'#ffffff', frame:'#eeeeee', frameWidth:16, rounded:0, gap:8, pad:20,
    textColor:'#aaaaaa', labelText:'FRAMERIO', filter:'none', previewBorder:'#e5e5e5' },
  // 2
  { id:'korean', name:'Korean Film', emoji:'🎞',
    bg:'#f5f0e8', frame:'#e8dfc8', frameWidth:22, rounded:4, gap:8, pad:24,
    textColor:'#9b8c6e', labelText:'필름 FRAMERIO ✦', filter:'sepia(20%) contrast(105%)', previewBorder:'#d4c5a9' },
  // 3
  { id:'vintage', name:'Vintage', emoji:'📷',
    bg:'#e8dcc8', frame:'#c8a96e', frameWidth:16, rounded:2, gap:10, pad:20,
    textColor:'#7a5c3a', labelText:'✦ VINTAGE STUDIO ✦', filter:'sepia(35%) saturate(80%)', previewBorder:'#c8a96e' },
  // 4
  { id:'pink', name:'Pink Aura', emoji:'🌸',
    bg:'#fff0f5', frame:'#ffb6c8', frameWidth:16, rounded:14, gap:10, pad:20,
    textColor:'#d4608a', labelText:'♡ FRAMERIO ♡', filter:'saturate(110%) hue-rotate(-8deg)', previewBorder:'#ffb6c8' },
  // 5
  { id:'dark', name:'Dark Film', emoji:'🖤',
    bg:'#181818', frame:'#303030', frameWidth:18, rounded:6, gap:8, pad:20,
    textColor:'#606060', labelText:'● FRAMERIO STUDIO', filter:'contrast(110%) brightness(88%)', previewBorder:'#3a3a3a' },
  // 6
  { id:'neon', name:'Y2K Neon', emoji:'⚡',
    bg:'#0d0d1c', frame:'#7c3aed', frameWidth:14, rounded:0, gap:6, pad:18,
    textColor:'#a78bfa', labelText:'⚡ FRAMERIO 2026 ⚡', filter:'saturate(160%) hue-rotate(220deg) brightness(110%)', previewBorder:'#7c3aed' },
  // 7
  { id:'pastel', name:'Pastel Sky', emoji:'🩵',
    bg:'#e8f4fd', frame:'#7dd3fc', frameWidth:14, rounded:18, gap:12, pad:22,
    textColor:'#0369a1', labelText:'✿ FRAMERIO ✿', filter:'saturate(90%) brightness(105%)', previewBorder:'#7dd3fc' },
  // 8
  { id:'retro', name:'Retro Orange', emoji:'🟠',
    bg:'#fff7ed', frame:'#e85200', frameWidth:18, rounded:0, gap:10, pad:22,
    textColor:'#c2410c', labelText:'FRAMERIO / 2026', filter:'sepia(8%) saturate(120%)', previewBorder:'#e85200' },
  // 9
  { id:'forest', name:'Forest', emoji:'🌿',
    bg:'#f0f7ee', frame:'#4a7c59', frameWidth:16, rounded:8, gap:10, pad:20,
    textColor:'#2d5a3d', labelText:'✦ NATURE STUDIO ✦', filter:'saturate(90%) hue-rotate(10deg)', previewBorder:'#4a7c59' },
  // 10
  { id:'rose', name:'Rose Gold', emoji:'🌹',
    bg:'#fdf2f0', frame:'#c9736a', frameWidth:16, rounded:8, gap:10, pad:22,
    textColor:'#8b3a34', labelText:'◆ ROSE FRAMERIO ◆', filter:'sepia(15%) saturate(120%) hue-rotate(-5deg)', previewBorder:'#c9736a' },
  // 11
  { id:'polaroid', name:'Polaroid', emoji:'🟦',
    bg:'#ffffff', frame:'#ffffff', frameWidth:0, rounded:4, gap:6, pad:14,
    textColor:'#555555', labelText:'framerio 📷', filter:'none', previewBorder:'#cccccc' },
  // 12
  { id:'midnight', name:'Midnight', emoji:'🌙',
    bg:'#0f1729', frame:'#1e3a5f', frameWidth:16, rounded:10, gap:8, pad:20,
    textColor:'#4a90d9', labelText:'✦ MIDNIGHT STUDIO', filter:'brightness(85%) saturate(80%) hue-rotate(200deg)', previewBorder:'#1e3a5f' },
  // 13
  { id:'cherry', name:'Cherry', emoji:'🍒',
    bg:'#fff0ee', frame:'#e53935', frameWidth:14, rounded:6, gap:8, pad:18,
    textColor:'#b71c1c', labelText:'♥ FRAMERIO ♥', filter:'saturate(120%) hue-rotate(-15deg)', previewBorder:'#e53935' },
  // 14
  { id:'cafe', name:'Café Latte', emoji:'☕',
    bg:'#f5efe6', frame:'#a67c52', frameWidth:18, rounded:6, gap:10, pad:22,
    textColor:'#6b4226', labelText:'CAFÉ FRAMERIO', filter:'sepia(25%) brightness(98%)', previewBorder:'#a67c52' },
  // 15
  { id:'holographic', name:'Holo', emoji:'🌈',
    bg:'linear-gradient(135deg,#fce4f3,#e8eaff,#d4f5e9)', frame:'#c084fc', frameWidth:14, rounded:16, gap:8, pad:18,
    textColor:'#7c3aed', labelText:'✦ HOLOGRAPHIC ✦', filter:'saturate(130%) hue-rotate(15deg) brightness(108%)', previewBorder:'#c084fc' },
  // 16
  { id:'sage', name:'Sage Green', emoji:'🍃',
    bg:'#eef2eb', frame:'#87a878', frameWidth:14, rounded:10, gap:10, pad:20,
    textColor:'#4a6741', labelText:'sage. framerio', filter:'saturate(80%) brightness(102%)', previewBorder:'#87a878' },
  // 17
  { id:'denim', name:'Denim', emoji:'👖',
    bg:'#eaf0f8', frame:'#3b5998', frameWidth:18, rounded:4, gap:8, pad:22,
    textColor:'#2b4480', labelText:'FRAMERIO DENIM', filter:'saturate(90%) hue-rotate(200deg)', previewBorder:'#3b5998' },
  // 18
  { id:'gold', name:'Gold Luxury', emoji:'✨',
    bg:'#1a1400', frame:'#d4af37', frameWidth:20, rounded:4, gap:10, pad:24,
    textColor:'#d4af37', labelText:'◈ FRAMERIO LUXURY ◈', filter:'sepia(20%) saturate(110%) brightness(90%)', previewBorder:'#d4af37' },
  // 19
  { id:'bubblegum', name:'Bubblegum', emoji:'🍬',
    bg:'#fff5fa', frame:'#ff80b0', frameWidth:12, rounded:20, gap:12, pad:18,
    textColor:'#ff4d94', labelText:'✿ bubble.framerio ✿', filter:'saturate(130%) brightness(107%) hue-rotate(-5deg)', previewBorder:'#ff80b0' },
  // 20
  { id:'terracotta', name:'Terracotta', emoji:'🏺',
    bg:'#f5e8df', frame:'#c4704a', frameWidth:16, rounded:4, gap:10, pad:20,
    textColor:'#8b4513', labelText:'TERRA FRAMERIO', filter:'sepia(20%) saturate(110%) hue-rotate(-10deg)', previewBorder:'#c4704a' },
  // 21
  { id:'arctic', name:'Arctic', emoji:'🧊',
    bg:'#f0f8ff', frame:'#a8d8ea', frameWidth:14, rounded:16, gap:10, pad:22,
    textColor:'#4a90b8', labelText:'❄ FRAMERIO ❄', filter:'saturate(70%) brightness(108%) hue-rotate(190deg)', previewBorder:'#a8d8ea' },
  // 22
  { id:'film', name:'Film Noir', emoji:'🎬',
    bg:'#111111', frame:'#888888', frameWidth:14, rounded:0, gap:4, pad:16,
    textColor:'#777777', labelText:'FRAMERIO NOIR', filter:'grayscale(80%) contrast(120%)', previewBorder:'#555555' },
  // 23
  { id:'lavender', name:'Lavender', emoji:'💜',
    bg:'#f5f0ff', frame:'#9b72cf', frameWidth:16, rounded:14, gap:10, pad:20,
    textColor:'#6b3fa0', labelText:'✦ lavender.framerio', filter:'saturate(90%) hue-rotate(255deg) brightness(105%)', previewBorder:'#9b72cf' },
  // 24
  { id:'sunset', name:'Sunset', emoji:'🌅',
    bg:'#fff3e0', frame:'#ff7043', frameWidth:16, rounded:6, gap:8, pad:20,
    textColor:'#bf360c', labelText:'SUNSET FRAMERIO', filter:'saturate(130%) hue-rotate(-20deg) brightness(105%)', previewBorder:'#ff7043' },
  // 25
  { id:'matrix', name:'Matrix', emoji:'💚',
    bg:'#001200', frame:'#00ff41', frameWidth:10, rounded:0, gap:4, pad:14,
    textColor:'#00cc33', labelText:'[FRAMERIO.EXE]', filter:'saturate(200%) hue-rotate(100deg) brightness(80%)', previewBorder:'#00ff41' },
]

/* ════════════════════════════════════════════════════════════
   CANVAS UTILITIES
════════════════════════════════════════════════════════════ */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number, rx = 0
) {
  const r = Math.max(w / img.width, h / img.height)
  const nw = img.width * r, nh = img.height * r
  const nx = x + (w - nw) / 2, ny = y + (h - nh) / 2
  ctx.save()
  ctx.beginPath()
  if (rx > 0) ctx.roundRect(x, y, w, h, rx)
  else ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.drawImage(img, nx, ny, nw, nh)
  ctx.restore()
}

async function composeCollage(imgs64: string[], layout: Layout, tpl: Template): Promise<string> {
  const imgs = await Promise.all(imgs64.map(loadImage))
  const { bg, frame, frameWidth: fw, rounded: rx, gap, pad, textColor, labelText } = tpl
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const LABEL_H = 38

  function fillBg(w: number, h: number) {
    if (bg.startsWith('linear-gradient')) {
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, '#fce4f3')
      grad.addColorStop(0.5, '#e8eaff')
      grad.addColorStop(1, '#d4f5e9')
      ctx.fillStyle = grad
    } else {
      ctx.fillStyle = bg
    }
    ctx.fillRect(0, 0, w, h)
  }

  function drawFrame(cw: number, ch: number) {
    if (fw <= 0) return
    ctx.strokeStyle = frame; ctx.lineWidth = fw
    if (rx > 0) {
      ctx.beginPath(); ctx.roundRect(fw / 2, fw / 2, cw - fw, ch - fw, rx + fw / 2); ctx.stroke()
    } else {
      ctx.strokeRect(fw / 2, fw / 2, cw - fw, ch - fw)
    }
  }

  function drawLabel(cw: number, ch: number) {
    ctx.fillStyle = textColor
    ctx.font = `bold ${Math.round(LABEL_H * 0.52)}px -apple-system, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(labelText, cw / 2, ch - fw - 8)
  }

  if (layout === 'strip4' || layout === 'strip2') {
    const count = layout === 'strip4' ? 4 : 2
    const usedImgs = imgs.slice(0, count)
    const cw = 480, photoH = 320
    const ch = fw * 2 + pad * 2 + count * photoH + (count - 1) * gap + LABEL_H + 12
    canvas.width = cw; canvas.height = ch
    fillBg(cw, ch); drawFrame(cw, ch)
    const ix = fw + pad, iw = cw - fw * 2 - pad * 2
    usedImgs.forEach((img, i) => {
      drawCover(ctx, img, ix, fw + pad + i * (photoH + gap), iw, photoH, rx)
    })
    drawLabel(cw, ch)

  } else if (layout === 'grid4') {
    const usedImgs = imgs.slice(0, 4)
    const cw = 800, ch = 800
    canvas.width = cw; canvas.height = ch
    fillBg(cw, ch); drawFrame(cw, ch)
    const iw = cw - fw * 2 - pad * 2, ih = ch - fw * 2 - pad * 2 - LABEL_H
    const cw2 = (iw - gap) / 2, ch2 = (ih - gap) / 2
    usedImgs.forEach((img, i) => {
      const col = i % 2, row = Math.floor(i / 2)
      drawCover(ctx, img, fw + pad + col * (cw2 + gap), fw + pad + row * (ch2 + gap), cw2, ch2, rx)
    })
    drawLabel(cw, ch)

  } else if (layout === 'wide2') {
    const usedImgs = imgs.slice(0, 2)
    const cw = 1000, ch = 520
    canvas.width = cw; canvas.height = ch
    fillBg(cw, ch); drawFrame(cw, ch)
    const iw = cw - fw * 2 - pad * 2, ih = ch - fw * 2 - pad * 2 - LABEL_H
    const cw2 = (iw - gap) / 2
    usedImgs.forEach((img, i) => {
      drawCover(ctx, img, fw + pad + i * (cw2 + gap), fw + pad, cw2, ih, rx)
    })
    drawLabel(cw, ch)

  } else {
    const cw = 600, ch = 620
    canvas.width = cw; canvas.height = ch
    fillBg(cw, ch); drawFrame(cw, ch)
    const ix = fw + pad, iy = fw + pad
    const iw = cw - fw * 2 - pad * 2, ih = ch - fw * 2 - pad * 2 - LABEL_H
    drawCover(ctx, imgs[0], ix, iy, iw, ih, rx)
    drawLabel(cw, ch)
  }

  return canvas.toDataURL('image/jpeg', 0.95)
}

/* ════════════════════════════════════════════════════════════
   COLLAGE CSS PREVIEW
════════════════════════════════════════════════════════════ */
function CollagePreview({ shots, layout, tpl, size = 'md' }: {
  shots: string[]; layout: Layout; tpl: Template; size?: 'sm' | 'md'
}) {
  const count = LAYOUTS.find(l => l.id === layout)!.count
  const imgs = shots.slice(0, count)
  const pad = size === 'sm' ? 5 : 10
  const gap = size === 'sm' ? 2 : 5
  const fw = size === 'sm' ? Math.min(4, tpl.frameWidth / 4) : Math.min(8, tpl.frameWidth / 2)
  const rx = size === 'sm' ? Math.min(6, tpl.rounded / 2) : Math.min(12, tpl.rounded)

  const bg = tpl.bg.startsWith('linear-gradient')
    ? 'linear-gradient(135deg,#fce4f3,#e8eaff,#d4f5e9)'
    : tpl.bg

  const outer: React.CSSProperties = {
    background: bg,
    border: `${fw}px solid ${tpl.frame}`,
    borderRadius: rx + fw,
    padding: pad,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  }

  const ph: React.CSSProperties = { objectFit: 'cover', width: '100%', height: '100%', filter: tpl.filter, borderRadius: rx }
  const empty: React.CSSProperties = { ...ph, background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#aaa' }
  const label: React.CSSProperties = { color: tpl.textColor, fontSize: size === 'sm' ? 7 : 9, fontWeight: 700, textAlign: 'center', fontFamily: 'monospace', letterSpacing: '0.08em', paddingTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }

  function cell(i: number, style?: React.CSSProperties) {
    return imgs[i]
      ? <img key={i} src={imgs[i]} alt="" style={{ ...ph, ...style }} />
      : <div key={i} style={{ ...empty, ...style }}>{i + 1}</div>
  }

  let grid: React.ReactNode
  if (layout === 'strip4' || layout === 'strip2') {
    const c = layout === 'strip4' ? 4 : 2
    grid = <div style={{ display: 'flex', flexDirection: 'column', gap, flex: 1 }}>
      {Array.from({ length: c }).map((_, i) => (
        <div key={i} style={{ flex: 1, overflow: 'hidden', borderRadius: rx, background: '#ddd', minHeight: size === 'sm' ? 22 : 36 }}>
          {cell(i)}
        </div>
      ))}
    </div>
  } else if (layout === 'grid4') {
    grid = <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap, flex: 1 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ overflow: 'hidden', borderRadius: rx, background: '#ddd', aspectRatio: '1' }}>
          {cell(i)}
        </div>
      ))}
    </div>
  } else if (layout === 'wide2') {
    grid = <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap, flex: 1 }}>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} style={{ overflow: 'hidden', borderRadius: rx, background: '#ddd', aspectRatio: '3/4' }}>
          {cell(i)}
        </div>
      ))}
    </div>
  } else {
    grid = <div style={{ flex: 1, overflow: 'hidden', borderRadius: rx, background: '#ddd', aspectRatio: '1' }}>
      {cell(0)}
    </div>
  }

  return (
    <div style={outer}>
      {grid}
      <div style={label}>{tpl.labelText}</div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   LAYOUT SVG THUMB
════════════════════════════════════════════════════════════ */
function LayoutThumb({ id, active }: { id: Layout; active: boolean }) {
  const c = active ? '#e85200' : '#9ca3af'
  if (id === 'strip4') return <svg width={22} height={28} viewBox="0 0 22 28"><rect x={1} y={1} width={20} height={5} rx={1} fill={c}/><rect x={1} y={8} width={20} height={5} rx={1} fill={c}/><rect x={1} y={15} width={20} height={5} rx={1} fill={c}/><rect x={1} y={22} width={20} height={5} rx={1} fill={c}/></svg>
  if (id === 'strip2') return <svg width={22} height={28} viewBox="0 0 22 28"><rect x={1} y={4} width={20} height={9} rx={1} fill={c}/><rect x={1} y={15} width={20} height={9} rx={1} fill={c}/></svg>
  if (id === 'grid4')  return <svg width={26} height={26} viewBox="0 0 26 26"><rect x={1} y={1} width={11} height={11} rx={1} fill={c}/><rect x={14} y={1} width={11} height={11} rx={1} fill={c}/><rect x={1} y={14} width={11} height={11} rx={1} fill={c}/><rect x={14} y={14} width={11} height={11} rx={1} fill={c}/></svg>
  if (id === 'wide2')  return <svg width={28} height={20} viewBox="0 0 28 20"><rect x={1} y={1} width={12} height={18} rx={1} fill={c}/><rect x={15} y={1} width={12} height={18} rx={1} fill={c}/></svg>
  return <svg width={24} height={24} viewBox="0 0 24 24"><rect x={2} y={2} width={20} height={20} rx={2} fill={c}/></svg>
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function Photobooth({ allowed }: { allowed: boolean }) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)

  const [facing,    setFacing]    = useState<'user' | 'environment'>('user')
  const [ready,     setReady]     = useState(false)
  const [layout,    setLayout]    = useState<Layout>('strip4')
  const [template,  setTemplate]  = useState<Template>(TEMPLATES[1]) // Korean Film default
  const [shots,     setShots]     = useState<string[]>([])
  const [capturing, setCapturing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [result,    setResult]    = useState<string | null>(null)
  const [saved,     setSaved]     = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [step,      setStep]      = useState<'shoot' | 'result'>('shoot')

  const layoutDef = LAYOUTS.find(l => l.id === layout)!

  /* ── camera ── */
  async function startCamera() {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      setReady(true); setError(null)
    } catch (e: any) { setError('Tidak bisa akses kamera: ' + (e?.message || e)) }
  }

  useEffect(() => {
    if (allowed && step === 'shoot') startCamera()
    return () => streamRef.current?.getTracks().forEach(t => t.stop())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing, allowed, step])

  function captureFrame() {
    const v = videoRef.current!
    const c = document.createElement('canvas')
    c.width = v.videoWidth; c.height = v.videoHeight
    const ctx = c.getContext('2d')!
    if (facing === 'user') { ctx.translate(c.width, 0); ctx.scale(-1, 1) }
    ctx.drawImage(v, 0, 0)
    return c.toDataURL('image/jpeg', 0.9)
  }

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

  async function runCapture() {
    if (!videoRef.current || !ready || capturing) return
    setCapturing(true); setShots([])
    const collected: string[] = []
    for (let i = 0; i < layoutDef.count; i++) {
      for (let c = 5; c >= 1; c--) { setCountdown(c); await sleep(1000) }
      setCountdown(null)
      collected.push(captureFrame())
      setShots([...collected])
      await sleep(500)
    }
    setCapturing(false)
  }

  async function handleGenerate() {
    const composed = await composeCollage(shots, layout, template)
    setResult(composed); setSaved(false); setStep('result')
  }

  function handlePrint() {
    if (!result) return
    const win = window.open('', '_blank')
    if (!win) { alert('Popup diblokir.'); return }
    win.document.write(`<!doctype html><html><head><title>Print</title><style>@page{margin:0}body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}img{max-width:100%;max-height:100vh}</style></head><body><img src="${result}" onload="window.print();setTimeout(()=>window.close(),500);"/></body></html>`)
    win.document.close()
  }

  function handleDownload() {
    if (!result) return
    const a = document.createElement('a'); a.href = result; a.download = `framerio-${Date.now()}.jpg`; a.click()
  }

  async function handleSave() {
    if (!result || saved) return
    setSaving(true)
    try {
      const res = await fetch('/api/photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageData: result, layout }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan')
      setSaved(true)
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  function reset() { setShots([]); setResult(null); setSaved(false); setStep('shoot'); setError(null) }

  /* ── access denied ── */
  if (!allowed) return (
    <div className="w-full max-w-md mx-auto px-4 py-16 text-center">
      <div className="retro-canvas retro-grid-bg rounded-[32px] border-2 border-white/60 p-10">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#e85200]/10 border border-[#e85200]/20 flex items-center justify-center font-black text-[#e85200] text-xl mb-5">✕</div>
        <h2 className="text-xl font-black text-zinc-900 mb-2">Masa Akses Berakhir</h2>
        <p className="text-xs text-zinc-500 mb-7 leading-relaxed">Pilih paket langganan untuk melanjutkan penggunaan studio.</p>
        <a href="/pricing" className="inline-flex items-center gap-2 btn-orange-glow px-7 py-3.5 rounded-full text-white font-extrabold text-xs tracking-wider uppercase hover:scale-105 transition-transform">
          Lihat Paket Harga →
        </a>
      </div>
    </div>
  )

  /* ══════════════════════════════════════════════════════════
     SHOOT STEP  — 3-column layout
     Left: camera  |  Center: collage preview  |  Right: templates
  ══════════════════════════════════════════════════════════ */
  if (step === 'shoot') return (
    <div className="w-full px-3 sm:px-5 py-4 space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between">
          {error}<button onClick={() => setError(null)} className="ml-3 font-black">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_280px] gap-3 items-start">

        {/* ── COL 1: Camera ───────────────────────────────── */}
        <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-3.5 shadow-md">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">Kamera</span>
            <div className="flex items-center gap-3">
              {/* Layout picker inline */}
              <div className="flex gap-1">
                {LAYOUTS.map(l => (
                  <button key={l.id} onClick={() => { setLayout(l.id); setShots([]) }} title={l.name}
                    className={`p-1.5 rounded-lg transition-all ${layout === l.id ? 'bg-[#e85200]/15 ring-1 ring-[#e85200]' : 'hover:bg-white/60'}`}>
                    <LayoutThumb id={l.id} active={layout === l.id} />
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-semibold text-zinc-400">{shots.length}/{layoutDef.count}</span>
            </div>
          </div>

          {/* Viewfinder */}
          <div className="relative rounded-xl overflow-hidden bg-zinc-900" style={{ aspectRatio: '4/3' }}>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {countdown !== null && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/70 backdrop-blur-sm">
                <span className="text-white font-black tabular-nums drop-shadow-2xl" style={{ fontSize: 'clamp(4rem,18vw,8rem)' }}>{countdown}</span>
                <span className="text-[#e85200] text-[10px] font-bold tracking-widest mt-2 uppercase">Pose {shots.length + 1}/{layoutDef.count}</span>
              </div>
            )}
            {!ready && countdown === null && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs bg-zinc-900/90">Menghubungkan kamera...</div>
            )}
            {/* Progress dots */}
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
              {Array.from({ length: layoutDef.count }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < shots.length ? 'bg-[#e85200]' : 'bg-white/35'}`} />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 mt-2.5 items-center">
            <button onClick={() => setFacing(f => f === 'user' ? 'environment' : 'user')}
              className="px-3.5 py-2 rounded-full text-xs font-bold bg-white/60 hover:bg-white border border-zinc-300 text-zinc-700 transition flex-shrink-0">
              ↺ Balik
            </button>
            <button onClick={runCapture} disabled={capturing || !ready}
              className="flex-1 btn-orange-glow py-2.5 rounded-full text-white font-extrabold text-xs tracking-wide uppercase transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed">
              {capturing ? `Mengambil ${shots.length + 1}/${layoutDef.count}...` : 'Mulai Foto (5s)'}
            </button>
          </div>

          {/* Shots strip */}
          {shots.length > 0 && (
            <div className="mt-3">
              <div className="flex gap-1.5 flex-wrap">
                {shots.map((s, i) => (
                  <img key={i} src={s} alt="" className="h-14 w-auto rounded-lg border-2 border-white/80 object-cover shadow-sm" />
                ))}
                {Array.from({ length: layoutDef.count - shots.length }).map((_, i) => (
                  <div key={i} className="h-14 w-20 rounded-lg border-2 border-dashed border-zinc-300/60 flex items-center justify-center text-[10px] text-zinc-300">{shots.length + i + 1}</div>
                ))}
              </div>
              {shots.length === layoutDef.count && (
                <button onClick={handleGenerate}
                  className="mt-2.5 w-full btn-orange-glow py-2.5 rounded-full text-white font-extrabold text-xs uppercase tracking-wide hover:scale-[1.02] transition-transform shadow-md">
                  Buat Kolase →
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── COL 2: Live collage preview ─────────────────── */}
        <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-3.5 shadow-md flex flex-col">
          <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mb-2">Pratinjau</div>
          <div className="flex-1 flex items-center justify-center">
            <CollagePreview shots={shots} layout={layout} tpl={template} size="md" />
          </div>
          <div className="mt-2.5 text-center">
            <span className="text-[9px] font-bold text-zinc-400">{template.name}</span>
          </div>
        </div>

        {/* ── COL 3: Template picker ───────────────────────── */}
        <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-3.5 shadow-md">
          <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mb-2">
            Template <span className="text-zinc-400">({TEMPLATES.length})</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 overflow-y-auto max-h-[520px] pr-0.5"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplate(t)} title={t.name}
                className={`relative flex flex-col items-center justify-end rounded-xl border-2 overflow-hidden transition-all group ${
                  template.id === t.id
                    ? 'border-[#e85200] shadow-md scale-[1.06] z-10'
                    : 'border-transparent hover:border-zinc-300 hover:scale-[1.03]'
                }`}
                style={{ aspectRatio: '2/3' }}
              >
                {/* Mini collage as background */}
                <div className="absolute inset-0 p-1" style={{ background: t.bg.startsWith('linear') ? 'linear-gradient(135deg,#fce4f3,#e8eaff,#d4f5e9)' : t.bg }}>
                  <CollagePreview shots={shots} layout={layout} tpl={t} size="sm" />
                </div>
                {/* Name overlay */}
                <div className="relative z-10 w-full px-1 pb-1 pt-3"
                  style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 100%)' }}>
                  <div className="text-[7px] font-bold text-white leading-tight text-center drop-shadow truncate">{t.name}</div>
                </div>
                {template.id === t.id && (
                  <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#e85200] rounded-full flex items-center justify-center text-[7px] text-white font-black z-20">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  /* ══════════════════════════════════════════════════════════
     RESULT STEP
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="w-full px-3 sm:px-5 py-4">
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between">
          {error}<button onClick={() => setError(null)} className="ml-3 font-black">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px_280px] gap-3 items-start">

        {/* Result image */}
        <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-4 shadow-md flex items-center justify-center min-h-[300px]">
          {result && <img src={result} alt="Kolase" className="max-h-[580px] w-auto rounded-xl shadow-xl" style={{ maxWidth: '100%' }} />}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-4 shadow-md">
            <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mb-1">Kolase Siap</div>
            <h3 className="text-base font-black text-zinc-900 mb-1">Foto Berhasil!</h3>
            <p className="text-[10px] text-zinc-500 mb-3 leading-relaxed">
              <strong>{template.name}</strong> · <strong>{layoutDef.name}</strong>
            </p>
            <div className="space-y-2">
              <button onClick={handlePrint} className="w-full btn-white-pill border border-zinc-200 py-2.5 rounded-full font-extrabold text-xs tracking-wide uppercase hover:scale-[1.02] transition-transform">
                🖨 Cetak
              </button>
              <button onClick={handleDownload} className="w-full py-2.5 rounded-full font-extrabold text-xs uppercase text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform">
                ↓ Unduh JPG
              </button>
              <button onClick={handleSave} disabled={saving || saved}
                className="w-full btn-orange-glow py-2.5 rounded-full text-white font-extrabold text-xs uppercase hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:scale-100">
                {saved ? '✓ Tersimpan' : saving ? 'Menyimpan...' : '☁ Simpan ke Galeri'}
              </button>
              <button onClick={reset} className="w-full py-2.5 rounded-full text-xs font-bold text-zinc-400 hover:text-zinc-600 border border-transparent hover:border-zinc-200 transition">
                ← Mulai dari Awal
              </button>
            </div>
          </div>
        </div>

        {/* Re-pick template on result screen */}
        <div className="retro-canvas rounded-[24px] border-2 border-white/60 p-3.5 shadow-md">
          <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mb-2">Ganti Template</div>
          <div className="grid grid-cols-5 gap-1.5 overflow-y-auto max-h-[480px]"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
            {TEMPLATES.map(t => (
              <button key={t.id}
                onClick={async () => {
                  setTemplate(t)
                  const c = await composeCollage(shots, layout, t)
                  setResult(c); setSaved(false)
                }}
                title={t.name}
                className={`relative flex flex-col items-center justify-end rounded-xl border-2 overflow-hidden transition-all ${
                  template.id === t.id ? 'border-[#e85200] shadow-md scale-[1.06] z-10' : 'border-transparent hover:border-zinc-300 hover:scale-[1.03]'
                }`}
                style={{ aspectRatio: '2/3' }}
              >
                <div className="absolute inset-0 p-1" style={{ background: t.bg.startsWith('linear') ? 'linear-gradient(135deg,#fce4f3,#e8eaff,#d4f5e9)' : t.bg }}>
                  <CollagePreview shots={shots} layout={layout} tpl={t} size="sm" />
                </div>
                <div className="relative z-10 w-full px-1 pb-1 pt-3" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 100%)' }}>
                  <div className="text-[7px] font-bold text-white leading-tight text-center drop-shadow truncate">{t.name}</div>
                </div>
                {template.id === t.id && (
                  <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#e85200] rounded-full flex items-center justify-center text-[7px] text-white font-black z-20">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
