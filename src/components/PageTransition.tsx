'use client'

import { usePathname } from 'next/navigation'

/**
 * Page-level fade transition wrapper.
 *
 * Implementation: keyed remount inside an outer host div. When the
 * pathname changes, the inner keyed div is unmounted and a fresh one is
 * mounted with `animate-page-swap` baked into the JSX. The keyframe runs
 * from frame 1 on the new DOM node — no useEffect timing games.
 *
 * Why the OUTER host div: in React, putting `key` on the root element
 * returned by a component doesn't always force a remount, because the
 * single-child reconciliation path can reuse the DOM node if types match.
 * Wrapping it in a stable host div puts the keyed div into a children
 * slot of host, where React's reconciler reliably honors the key change.
 *
 * Why we abandoned the useEffect approach earlier: useEffect fires AFTER
 * the browser paints. By then the new page is already on screen in its
 * final state, so any class added in the effect runs against an
 * invisible-to-the-user target.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div>
      <div key={pathname} className="animate-page-swap">
        {children}
      </div>
    </div>
  )
}
