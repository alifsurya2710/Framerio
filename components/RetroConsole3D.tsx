'use client'
import React, { useRef, useState } from 'react'
import Link from 'next/link'

export default function RetroConsole3D() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotX, setRotX] = useState(16)
  const [rotY, setRotY] = useState(-18)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setRotX(16 - (y / rect.height) * 14)
    setRotY(-18 + (x / rect.width) * 16)
  }

  const handleMouseLeave = () => {
    setRotX(16)
    setRotY(-18)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-[1/1.55] cursor-pointer transition-transform duration-200 ease-out preserve-3d mx-auto"
      style={{
        transform: `perspective(2000px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(5deg)`,
      }}
    >
      {/* 3D Realistic Soft Ambient Drop Shadow */}
      <div 
        className="absolute -bottom-10 -left-6 w-[115%] h-24 bg-black/25 blur-3xl rounded-full transform rotate-3 pointer-events-none" 
      />

      {/* Main Console Body: Orange Back Chasis */}
      <div 
        className="absolute inset-0 rounded-[44px] bg-[#f95900] shadow-[inset_-8px_-8px_16px_rgba(0,0,0,0.35),inset_4px_4px_8px_rgba(255,255,255,0.4)] border-4 border-[#e04f00]"
        style={{ transform: 'translateZ(-16px)' }}
      >
        {/* Right side power/volume toggle pill */}
        <div className="absolute right-[-14px] top-28 w-3 h-16 bg-[#d94800] rounded-r-lg border border-[#ff7b2b] shadow-md" />
      </div>

      {/* Front Face Chasis: Matte Off-White / Cream Shell */}
      <div 
        className="absolute inset-[6px] rounded-[38px] bg-gradient-to-b from-[#f5f4ef] via-[#eeede8] to-[#e4e2dc] shadow-[0_12px_30px_rgba(0,0,0,0.22),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-4px_8px_rgba(0,0,0,0.12)] p-6 flex flex-col justify-between border border-[#e8e6df]"
        style={{ transform: 'translateZ(12px)' }}
      >
        {/* Top: Bezel & Display Screen */}
        <div className="relative w-full aspect-[1.18/1] rounded-[24px] bg-[#ff5900] p-[7px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)]">
          {/* Inner Glossy Glass Screen */}
          <div className="relative w-full h-full rounded-[18px] bg-gradient-to-b from-[#1c1c1f] via-[#121214] to-[#09090b] overflow-hidden flex flex-col items-center justify-center border border-black/80 shadow-[inset_0_4px_16px_rgba(0,0,0,0.8)]">
            {/* Screen Glass Reflection */}
            <div className="absolute -top-16 -left-12 w-48 h-56 bg-gradient-to-br from-white/18 to-transparent rounded-full transform -rotate-45 pointer-events-none blur-[1px]" />
            
            {/* Screen Content: Live Viewfinder graphic */}
            <div className="relative z-10 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#ff5900]/80 flex items-center justify-center text-[#ff5900] text-xs font-mono font-bold animate-spin" style={{ animationDuration: '10s' }}>
                FOTO
              </div>
              <span className="text-[11px] font-mono font-bold text-white tracking-widest mt-2 uppercase">
                KAMERA FRAMERIO
              </span>
              <span className="text-[9px] font-mono text-zinc-400 mt-0.5">
                HITUNG MUNDUR 5 DETIK
              </span>
            </div>

            {/* Corner Viewfinder Brackets */}
            <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-white/40" />
            <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-white/40" />
            <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-white/40" />
            <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-white/40" />
          </div>
        </div>

        {/* Middle Section: D-Pad and Action Buttons */}
        <div className="relative mt-5 flex items-center justify-between px-2">
          {/* D-Pad Matte Black */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Horizontal Bar */}
            <div className="absolute w-20 h-7 bg-[#232326] rounded-md shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-[#111]" />
            {/* Vertical Bar */}
            <div className="absolute w-7 h-20 bg-[#232326] rounded-md shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-[#111]" />
            {/* Center Indent */}
            <div className="relative z-10 w-4 h-4 rounded-full bg-[#18181b] shadow-inner" />
          </div>

          {/* Right Action Buttons */}
          <div className="relative flex gap-3.5 transform -rotate-12 translate-y-[-4px]">
            {/* Button B */}
            <Link 
              href="/booth"
              className="w-10 h-10 rounded-full bg-gradient-to-b from-[#ff7a26] via-[#f75800] to-[#d64a00] shadow-[0_6px_12px_rgba(217,74,0,0.4),inset_0_2px_2px_rgba(255,255,255,0.6)] border border-[#e85200] active:scale-95 transition-transform flex items-center justify-center text-white/90 font-black text-xs font-mono"
            >
              B
            </Link>
            {/* Button A (Elevated) */}
            <Link 
              href="/booth"
              className="w-10 h-10 rounded-full bg-gradient-to-b from-[#ff7a26] via-[#f75800] to-[#d64a00] shadow-[0_6px_12px_rgba(217,74,0,0.4),inset_0_2px_2px_rgba(255,255,255,0.6)] border border-[#e85200] -translate-y-3 active:scale-95 transition-transform flex items-center justify-center text-white/90 font-black text-xs font-mono"
            >
              A
            </Link>
          </div>
        </div>

        {/* Lower Section: Select/Start Pill Buttons & Speaker Grill */}
        <div className="mt-4 flex items-end justify-between px-1">
          {/* Orange Accent Stripes */}
          <div className="flex flex-col gap-1.5 pb-2">
            <span className="w-5 h-1.5 rounded-full bg-[#f95900] shadow-sm" />
            <span className="w-5 h-1.5 rounded-full bg-[#f95900] shadow-sm" />
            <span className="w-5 h-1.5 rounded-full bg-[#f95900] shadow-sm" />
          </div>

          {/* Select & Start Pill Buttons */}
          <div className="flex gap-2.5 pb-3 -ml-4">
            <div className="w-8 h-3 rounded-full bg-[#2a2a2e] shadow-[0_2px_4px_rgba(0,0,0,0.3)] transform -rotate-25" />
            <div className="w-8 h-3 rounded-full bg-[#2a2a2e] shadow-[0_2px_4px_rgba(0,0,0,0.3)] transform -rotate-25" />
          </div>

          {/* Perforated Dot Matrix Speaker Holes */}
          <div className="grid grid-cols-5 gap-1.5 p-1 pb-1">
            {Array.from({ length: 25 }).map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 rounded-full bg-[#353538] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)] opacity-85" 
              />
            ))}
          </div>
        </div>

        {/* Bottom USB-C Port Indent */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-[#222] shadow-inner" />
      </div>
    </div>
  )
}
