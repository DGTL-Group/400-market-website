'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [entered, setEntered] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const [bannerHeight, setBannerHeight] = useState(0)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  useEffect(() => {
    if (visible && bannerRef.current) {
      setBannerHeight(bannerRef.current.offsetHeight)
      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true))
      })
    }
  }, [visible])

  function dismiss(choice: 'accepted' | 'declined') {
    localStorage.setItem('cookie-consent', choice)
    setDismissing(true)
    setTimeout(() => {
      setVisible(false)
      setBannerHeight(0)
    }, 500)
  }

  if (!visible) return null

  return (
    <>
      {/* Spacer matching footer bg color */}
      <div
        className="bg-footer-bg transition-all duration-500 ease-in-out"
        style={{ height: dismissing ? 0 : entered ? bannerHeight : 0 }}
      />

      <div
        ref={bannerRef}
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-in-out ${
          dismissing ? 'translate-y-full' : entered ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Liquid Glass banner */}
        <div className="relative">
          {/* Glass panel */}
          <div
            className="relative border-t border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.25)] px-6 py-4"
          >
            {/* Top gradient sheen */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            {/* Inner light edge */}
            <div className="absolute inset-px shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 max-w-content mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-brand-dark text-body-sm text-center sm:text-left">
                We use essential cookies for payments and optional cookies for advertising analytics (Meta Pixel).
                See our{' '}
                <Link href="/privacy-policy" className="text-brand-yellow underline hover:text-brand-orange transition-colors duration-500">
                  Privacy Policy
                </Link>
                .
              </p>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => dismiss('declined')}
                  className="px-4 py-2 text-body-sm font-semibold text-brand-dark border border-brand-dark/30 rounded-button hover:bg-brand-dark hover:text-white transition-colors duration-500"
                >
                  Decline
                </button>
                <button
                  onClick={() => dismiss('accepted')}
                  className="px-4 py-2 text-body-sm font-bold bg-brand-yellow text-brand-dark rounded-button hover:bg-brand-orange transition-colors duration-500"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
