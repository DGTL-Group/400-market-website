'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Logo from './Logo'

export default function LogoInteractive({ id, className }: { id: string; className: string }) {
  const router = useRouter()
  const [boopCount, setBoopCount] = useState(0)
  const [boopMessage, setBoopMessage] = useState('')
  const [wobbling, setWobbling] = useState(false)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countRef = useRef(0)

  const messages = [
    'Hey, stop booping me!',
    'Seriously, quit it!',
    "I'm a logo, not a button!",
    'Okay okay, you found the easter egg!',
    'Fine... boop away, I guess.',
  ]

  const handleClick = useCallback(() => {
    countRef.current += 1
    const currentCount = countRef.current

    // Clear any pending navigation
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
    }

    if (currentCount >= 3) {
      // Boop mode
      const boopIndex = currentCount - 3
      const msgIndex = Math.min(boopIndex, messages.length - 1)
      setBoopCount(currentCount)
      setBoopMessage(messages[msgIndex])
      if (boopTimer.current) clearTimeout(boopTimer.current)
      boopTimer.current = setTimeout(() => setBoopMessage(''), 2500)

      if (currentCount >= 8) {
        countRef.current = 0
        setBoopCount(0)
      }
    } else {
      // Wait 700ms — if no more clicks, navigate home
      clickTimer.current = setTimeout(() => {
        countRef.current = 0
        setBoopCount(0)
        router.push('/')
      }, 700)
    }
  }, [router, messages])

  const handleMouseEnter = useCallback(() => {
    setWobbling(true)
  }, [])

  const handleAnimationEnd = useCallback(() => {
    setWobbling(false)
  }, [])

  return (
    <div className="relative">
      <button
        type="button"
        className={`block ${className} cursor-pointer`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        aria-label="400 Market Logo"
      >
        <Logo
          id={id}
          className={`w-full h-auto ${wobbling ? 'animate-wobble' : ''}`}
          onAnimationEnd={handleAnimationEnd}
        />
      </button>
      {boopMessage && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-brand-yellow text-brand-dark text-[11px] font-semibold px-3 py-1.5 rounded-button animate-boop-pop z-50">
          {boopMessage}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-yellow rotate-45" />
        </div>
      )}
    </div>
  )
}
