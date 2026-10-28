'use client'
import React, { useRef, useState } from 'react'

interface Card3DProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  onClick?: () => void
}

export default function Card3D({ children, className = '', intensity = 15, onClick }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotX = ((y - centerY) / centerY) * -intensity
    const rotY = ((x - centerX) / centerX) * intensity

    setRotateX(rotX)
    setRotateY(rotY)
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25
    })
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setGlarePos((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`perspective-1000 transition-all duration-300 ease-out ${className}`}
      style={{
        transformStyle: 'preserve-3d'
      }}
    >
      <div
        className="relative w-full h-full rounded-2xl transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Holographic dynamic glare overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.4), transparent 70%)`,
            opacity: glarePos.opacity
          }}
        />
        <div className="relative z-0 h-full">{children}</div>
      </div>
    </div>
  )
}

