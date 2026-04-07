'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import WhackAVendor from '@/components/WhackAVendor'

// Crossfade duration. Must match the Tailwind transition-opacity duration
// applied below — if you change one, change the other.
const FADE_MS = 300

export default function NotFound() {
  const [phase, setPhase] = useState<'intro' | 'game'>('intro')
  const [fadingOut, setFadingOut] = useState(false)

  const startGame = () => {
    setFadingOut(true)
    // Wait for the fade-out to finish, then swap content. The opposite
    // direction of the same className transition gives us the fade-in.
    window.setTimeout(() => {
      setPhase('game')
      setFadingOut(false)
    }, FADE_MS)
  }

  return (
    // Outer container is a top-anchored flex column. We intentionally do NOT
    // use `justify-center` here because the game phase renders a leaderboard
    // below the grid that loads async — if the parent were vertically centered,
    // the grid would jump upward the moment the leaderboard's rows arrive.
    // Instead, the intro phase opts back into vertical centering via `flex-1`
    // on the inner wrapper (no layout shift there because the intro is static).
    <div className="min-h-screen flex flex-col items-center bg-brand-dark text-white px-4 py-8 sm:py-12">
      <div
        className={`flex flex-col items-center w-full transition-opacity duration-300 ${
          fadingOut ? 'opacity-0' : 'opacity-100'
        } ${phase === 'intro' ? 'flex-1 justify-center' : ''}`}
      >
        {phase === 'intro' ? (
          <>
            <Logo
              id="not-found-logo"
              className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] mb-4 sm:mb-6"
            />
            <div className="font-display font-medium text-[4rem] sm:text-[5rem] md:text-[6rem] text-brand-yellow tracking-widest leading-none mb-2 sm:mb-3">
              404
            </div>
            <h1 className="font-display text-display-sm sm:text-display-md md:text-display-lg uppercase tracking-wide mb-4 sm:mb-6 text-center">
              LOOKS LIKE YOU&apos;RE LOST
            </h1>
            <p className="font-body text-body-sm sm:text-body-md text-text-subtle max-w-md text-center mb-6 sm:mb-8 px-2">
              The page you&apos;re looking for has wandered off. While you&apos;re here, want to whack some vendors?
            </p>
            <button type="button" onClick={startGame} className="btn-primary">
              START GAME
            </button>
          </>
        ) : (
          <WhackAVendor autoStart />
        )}

        <Link
          href="/"
          className="mt-6 sm:mt-10 inline-flex items-center gap-2 font-body font-bold text-[13px] uppercase tracking-wide text-text-subtle hover:text-brand-yellow transition-colors duration-300"
        >
          <span aria-hidden className="text-base leading-none">&larr;</span>
          <span>Skip the game and go home</span>
        </Link>
      </div>
    </div>
  )
}
