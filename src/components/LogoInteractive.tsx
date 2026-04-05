'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Logo from './Logo'

const YEARS = new Date().getFullYear() - 1986

export default function LogoInteractive({ id, className, showEstTooltip = false }: { id: string; className: string; showEstTooltip?: boolean }) {
  const router = useRouter()
  const [boopCount, setBoopCount] = useState(0)
  const [boopMessage, setBoopMessage] = useState('')
  const [wobbling, setWobbling] = useState(false)
  const [showEst, setShowEst] = useState(false)
  const [estFading, setEstFading] = useState(false)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const estTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
      clickTimer.current = null
    }

    // Hide EST tooltip on click
    setShowEst(false)
    if (estTimer.current) clearTimeout(estTimer.current)

    if (currentCount >= 3) {
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
      clickTimer.current = setTimeout(() => {
        countRef.current = 0
        setBoopCount(0)
        router.push('/')
      }, 700)
    }
  }, [router, messages])

  const countRef = useRef(0)

  const handleMouseEnter = useCallback(() => {
    setWobbling(true)

    if (showEstTooltip && !boopMessage) {
      estTimer.current = setTimeout(() => setShowEst(true), 1300)
    }
  }, [showEstTooltip, boopMessage])

  const handleMouseLeave = useCallback(() => {
    if (estTimer.current) clearTimeout(estTimer.current)
    if (showEst) {
      setEstFading(true)
      setTimeout(() => {
        setShowEst(false)
        setEstFading(false)
      }, 300)
    }
  }, [showEst])

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
        onMouseLeave={handleMouseLeave}
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
      {showEst && !boopMessage && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-brand-dark text-white text-[11px] font-semibold px-3 py-1.5 rounded-button z-50 ${estFading ? 'animate-est-fade-out' : 'animate-est-fade'}`}>
          That&apos;s {YEARS} years of food, finds &amp; fun!
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-dark rotate-45" />
        </div>
      )}
    </div>
  )
}
