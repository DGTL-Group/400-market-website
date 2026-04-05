'use client'

import { useRef, useEffect } from 'react'

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number
    let current = 0

    function update() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const target = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

      // Smooth interpolation — ease toward target
      current += (target - current) * 0.15

      if (barRef.current) {
        barRef.current.style.width = `${current}%`
      }

      // Keep animating if not settled
      if (Math.abs(target - current) > 0.1) {
        raf = requestAnimationFrame(update)
      }
    }

    function handleScroll() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="fixed left-0 right-0 z-[55] h-[4px] pointer-events-none" style={{ top: 'var(--header-height, 135px)' }}>
      <div
        ref={barRef}
        className="h-full bg-brand-yellow"
        style={{ width: '0%', willChange: 'width' }}
      />
    </div>
  )
}
