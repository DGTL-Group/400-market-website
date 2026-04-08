'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Page-level fade transition wrapper.
 *
 * Listens for pathname changes and replays a CSS fade-in animation on the
 * content wrapper. The remove + force-reflow + add-class trick is the
 * standard way to replay a CSS animation on a node that's already been
 * mounted — without the reflow, re-adding the same class is a no-op.
 *
 * Pairs with two things in globals.css:
 *   1. `@view-transition { navigation: auto }` — gives Chromium browsers
 *      a free native crossfade as the snapshot machinery hands off old to
 *      new DOM.
 *   2. `.animate-page-swap` keyframe — the visible JS-driven fade that
 *      runs in EVERY browser, regardless of native VT support.
 *
 * The two layer cleanly: on Chromium, the native VT crossfade hides the
 * snap of the new DOM appearing, and the JS fade adds a soft entry on top.
 * On Firefox/Safari (no `@view-transition` support), the JS fade carries
 * the entire animation. Either way the user sees a smooth swap.
 *
 * First-render skip: we don't fire the animation on initial mount because
 * the page would awkwardly fade in on every full page load (which would
 * compete with the hero reveal and just feels off).
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const el = wrapperRef.current
    if (!el) return
    el.classList.remove('animate-page-swap')
    // Force reflow. The `void` discards the read, but the browser still
    // has to flush style/layout for the offsetWidth access, which resets
    // the animation so the next classList.add actually replays it.
    void el.offsetWidth
    el.classList.add('animate-page-swap')
  }, [pathname])

  return <div ref={wrapperRef}>{children}</div>
}
