'use client'
import { useEffect, useRef } from 'react'

export default function Interactive3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Interactive mouse coordinates
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // 3D Particles Simulation
    interface Particle3D {
      x: number
      y: number
      z: number
      size: number
      color: string
      vx: number
      vy: number
      vz: number
    }

    const particles: Particle3D[] = []
    const particleCount = 100
    const colors = ['#ec4899', '#a855f7', '#6366f1', '#38bdf8', '#f43f5e']

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 1000 + 100,
        size: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: -(Math.random() * 1.2 + 0.3)
      })
    }

    // 3D Floating Geometry cubes
    interface Box3D {
      x: number
      y: number
      z: number
      size: number
      rotX: number
      rotY: number
      rotZ: number
      speedX: number
      speedY: number
      color: string
    }

    const boxes: Box3D[] = [
      { x: -width * 0.25, y: -height * 0.1, z: 450, size: 70, rotX: 0, rotY: 0, rotZ: 0, speedX: 0.008, speedY: 0.012, color: 'rgba(236, 72, 153, 0.4)' },
      { x: width * 0.28, y: -height * 0.15, z: 400, size: 85, rotX: 1, rotY: 0.5, rotZ: 0, speedX: -0.01, speedY: 0.009, color: 'rgba(168, 85, 247, 0.4)' },
      { x: width * 0.22, y: height * 0.25, z: 350, size: 60, rotX: 0.5, rotY: 1.2, rotZ: 0, speedX: 0.012, speedY: -0.011, color: 'rgba(56, 189, 248, 0.4)' },
      { x: -width * 0.28, y: height * 0.22, z: 500, size: 90, rotX: 0.2, rotY: 0.8, rotZ: 0, speedX: -0.008, speedY: -0.007, color: 'rgba(244, 63, 94, 0.35)' }
    ]

    const fov = 400

    const render = () => {
      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05
      mouse.y += (mouse.targetY - mouse.y) * 0.05

      const offsetX = (mouse.x - width / 2) * 0.2
      const offsetY = (mouse.y - height / 2) * 0.2

      ctx.clearRect(0, 0, width, height)

      // Draw faint 3D perspective grid in background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.lineWidth = 1
      const cx = width / 2 + offsetX * 0.5
      const cy = height / 2 + offsetY * 0.5

      for (let r = 50; r <= width; r += 120) {
        ctx.beginPath()
        ctx.ellipse(cx, cy, r, r * 0.6, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Update and render 3D particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.z += p.vz
        p.x += p.vx
        p.y += p.vy

        if (p.z <= 10) {
          p.z = 1000
          p.x = (Math.random() - 0.5) * width * 1.5
          p.y = (Math.random() - 0.5) * height * 1.5
        }

        const scale = fov / (fov + p.z)
        const screenX = cx + (p.x - offsetX) * scale
        const screenY = cy + (p.y - offsetY) * scale

        if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
          const alpha = Math.min(1, Math.max(0.1, (1000 - p.z) / 900))
          ctx.beginPath()
          ctx.arc(screenX, screenY, p.size * scale * 1.8, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = alpha * 0.7
          ctx.shadowBlur = 12
          ctx.shadowColor = p.color
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.globalAlpha = 1
        }
      }

      // Render 3D Wireframe floating cubes
      boxes.forEach((box) => {
        box.rotX += box.speedX
        box.rotY += box.speedY

        // 8 cube vertices
        const d = box.size / 2
        const vertices = [
          [-d, -d, -d],
          [d, -d, -d],
          [d, d, -d],
          [-d, d, -d],
          [-d, -d, d],
          [d, -d, d],
          [d, d, d],
          [-d, d, d]
        ]

        // Rotation matrices
        const cosX = Math.cos(box.rotX), sinX = Math.sin(box.rotX)
        const cosY = Math.cos(box.rotY), sinY = Math.sin(box.rotY)

        const projected = vertices.map(([vx, vy, vz]) => {
          // Rotate Y
          const x1 = vx * cosY + vz * sinY
          const z1 = -vx * sinY + vz * cosY

          // Rotate X
          const y2 = vy * cosX - z1 * sinX
          const z2 = vy * sinX + z1 * cosX

          // Position in 3D scene
          const wx = box.x + x1 - offsetX * 0.7
          const wy = box.y + y2 - offsetY * 0.7
          const wz = box.z + z2

          const scale = fov / (fov + wz)
          return {
            x: cx + wx * scale,
            y: cy + wy * scale,
            depth: wz
          }
        })

        // Edge lines between vertices
        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0], // Back face
          [4, 5], [5, 6], [6, 7], [7, 4], // Front face
          [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
        ]

        ctx.strokeStyle = box.color
        ctx.lineWidth = 1.5
        ctx.shadowBlur = 15
        ctx.shadowColor = box.color

        edges.forEach(([start, end]) => {
          ctx.beginPath()
          ctx.moveTo(projected[start].x, projected[start].y)
          ctx.lineTo(projected[end].x, projected[end].y)
          ctx.stroke()
        })
        ctx.shadowBlur = 0
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-pink-600/25 via-purple-600/20 to-indigo-600/10 rounded-full blur-[120px] animate-glow pointer-events-none" />
      <div className="absolute -bottom-[20%] right-[10%] w-[500px] h-[500px] bg-gradient-to-bl from-rose-500/15 via-fuchsia-600/15 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full block opacity-85" />
    </div>
  )
}

