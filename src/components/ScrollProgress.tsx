'use client'

import { useRef, useEffect } from 'react'

export default function ScrollProgress() {
  const clipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number
    let current = 0
    let target = 0

    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      target = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
    }

    function animate() {
      const diff = target - current
      // Max speed: 0.25% per frame (~15% per second at 60fps)
      const maxStep = 0.25
      const step = Math.sign(diff) * Math.min(Math.abs(diff) * 0.01, maxStep)

      current += step

      // Snap when extremely close
      if (Math.abs(diff) < 0.01) {
        current = target
      }

      if (clipRef.current) {
        clipRef.current.style.clipPath = `inset(0 ${100 - current}% 0 0)`
      }

      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="sticky top-[calc(3px+130px)] left-0 right-0 z-[55] h-[4px] pointer-events-none -mt-[4px]">
      <div
        ref={clipRef}
        className="h-full w-full bg-gradient-to-r from-brand-yellow to-brand-orange"
        style={{ clipPath: 'inset(0 100% 0 0)', willChange: 'clip-path' }}
      />
    </div>
  )
}
