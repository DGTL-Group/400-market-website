'use client'

import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'

/**
 * Page-level sequenced transition wrapper.
 *
 * Storing React element children in state DOES NOT WORK for Next.js App
 * Router. The `children` prop is an RSC (React Server Components)
 * boundary, and if we stash the old element and render it later, React
 * re-resolves it against the CURRENT RSC payload — so the exit layer
 * ends up showing the NEW page's content, not the old one. Visible
 * result: "double fade in, no fade out" when you click a link.
 *
 * Solution: snapshot the actual committed DOM as an HTML string via
 * `outerHTML`, then render it statically in the exit layer using
 * `dangerouslySetInnerHTML`. HTML strings are plain data — they don't
 * participate in reconciliation, so they show exactly the old DOM even
 * after React has moved on to the new route.
 *
 * Why render-phase setState: the standard React "derived state from
 * props" pattern. We need to snapshot the old DOM BEFORE React commits
 * the new children — useEffect / useLayoutEffect would be too late
 * because by then the commit is already done. During the render phase,
 * refs still point to the PREVIOUSLY committed DOM, so we can read the
 * old content directly from `contentRef.current`. The `if` guard
 * prevents infinite loops by only triggering when phase is 'enter'.
 *
 * Why ternary (sequence, not crossfade): exit layer and enter layer
 * render exclusively — never simultaneously — so there's no muddy
 * double-exposure overlap. Old fades fully out, then new fades fully in.
 *
 * Rapid navigations: if the user clicks B while still exiting A, we
 * stay in exit phase showing A until its animation finishes (the exit
 * phase condition only triggers from 'enter'). When exit completes,
 * we jump directly to the current pathname's content — any intermediate
 * paths are effectively skipped, which matches the user's final click.
 */

type DisplayState =
  | { phase: 'enter'; path: string }
  | { phase: 'exit'; path: string; exitHTML: string }

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const contentRef = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState<DisplayState>({
    phase: 'enter',
    path: pathname,
  })

  // Render-phase derived state: when the pathname changes while we're
  // in the 'enter' phase, capture the committed DOM as HTML and switch
  // to 'exit'. contentRef.current still points to the previous commit
  // at this point, so its innerHTML is the OLD page's content.
  if (display.phase === 'enter' && display.path !== pathname) {
    const oldHTML = contentRef.current?.innerHTML ?? ''
    setDisplay({ phase: 'exit', path: display.path, exitHTML: oldHTML })
  }

  if (display.phase === 'exit') {
    return (
      <div>
        <div
          key={`exit-${display.path}`}
          className="animate-page-swap-out"
          dangerouslySetInnerHTML={{ __html: display.exitHTML }}
          onAnimationEnd={(e) => {
            // animationend bubbles. The captured HTML may contain
            // elements with their own animations (logo wobble, hero
            // reveal, etc.) that replay when the string is re-parsed
            // into DOM. Only react to this wrapper's own page-swap-out
            // animation.
            if (e.target !== e.currentTarget) return
            if (e.animationName !== 'page-swap-out') return
            setDisplay({ phase: 'enter', path: pathname })
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <div key={`enter-${pathname}`} ref={contentRef} className="animate-page-swap">
        {children}
      </div>
    </div>
  )
}
