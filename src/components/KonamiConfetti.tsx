'use client'

import { useEffect, useCallback, useState } from 'react'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const COLORS = ['#F7D117', '#F7941D', '#E57200', '#fff', '#2C2C2C']
const PARTICLE_COUNT = 120

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  width: number
  height: number
  rotation: number
  rotationSpeed: number
  wobble: number
  wobbleSpeed: number
  opacity: number
}

export default function KonamiConfetti() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [active, setActive] = useState(false)

  const launch = useCallback(() => {
    const newParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: -30 - Math.random() * 800,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 1.5 + 0.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      width: Math.random() * 12 + 10,
      height: Math.random() * 8 + 6,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.08 + 0.03,
      opacity: 1,
    }))
    setParticles(newParticles)
    setActive(true)
  }, [])

  useEffect(() => {
    let index = 0
    let timeout: ReturnType<typeof setTimeout>

    function handleKey(e: KeyboardEvent) {
      if (e.key === KONAMI[index]) {
        index++
        clearTimeout(timeout)
        timeout = setTimeout(() => { index = 0 }, 2000)
        if (index === KONAMI.length) {
          index = 0
          launch()
        }
      } else {
        index = 0
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      clearTimeout(timeout)
    }
  }, [launch])

  useEffect(() => {
    if (!active) return

    let raf: number
    let frame = 0

    function animate() {
      frame++
      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx + Math.sin(p.wobble) * 1.5,
          y: p.y + p.vy,
          vy: p.vy + 0.04,
          vx: p.vx * 0.995,
          rotation: p.rotation + p.rotationSpeed,
          wobble: p.wobble + p.wobbleSpeed,
          opacity: Math.max(0, p.opacity - 0.0015),
        })).filter(p => p.opacity > 0 && p.y < window.innerHeight + 100)

        if (updated.length === 0) {
          setActive(false)
        }
        return updated
      })

      if (frame < 900) {
        raf = requestAnimationFrame(animate)
      } else {
        setActive(false)
        setParticles([])
      }
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [active])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: p.x,
            top: p.y,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: `rotate(${p.rotation}deg) rotateX(${Math.sin(p.wobble) * 60}deg)`,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  )
}
