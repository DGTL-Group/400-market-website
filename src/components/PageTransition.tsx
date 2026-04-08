'use client'

import { usePathname } from 'next/navigation'

/**
 * Page-level fade transition wrapper.
 *
 * Implementation: keyed remount. When the pathname changes, React unmounts
 * the wrapper div and mounts a fresh one with the `animate-page-swap`
 * class baked into the JSX. The animation runs from frame 1 on the new
 * DOM node — no useEffect, no reflow tricks, no possibility of running
 * "after" the new content has already painted in its final state.
 *
 * Why we abandoned the useEffect approach: useEffect fires AFTER the
 * browser paints. So the user would see the new page snap into its final
 * state, then the animation would start from a blank state and play out.
 * Net effect: zero visible animation. Keyed remount sidesteps this
 * because the new node enters the DOM with the class already applied.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="animate-page-swap">
      {children}
    </div>
  )
}
