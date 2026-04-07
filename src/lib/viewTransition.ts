import { flushSync } from 'react-dom'

/**
 * Wraps a React state update in `document.startViewTransition()` so the
 * browser captures the old DOM, applies the update, captures the new DOM,
 * and crossfades between them.
 *
 * Why `flushSync`: React 18+ batches updates and may defer them past the
 * tick where the View Transitions API needs the new DOM to exist. Forcing
 * a synchronous flush inside the transition callback guarantees the new
 * tree is in the document before the browser snapshots it.
 *
 * Browser support: Chrome / Edge / Safari (stable as of 2024-25), Firefox
 * partial as of early 2025. Where the API is missing we fall back to a
 * plain `flushSync` — same behavior, just no animation. The site never
 * looks worse than it does today on unsupported browsers.
 *
 * SSR safety: if `document` is undefined (Node SSR pass) we just run the
 * callback synchronously — there's no DOM to transition anyway.
 */
export function withViewTransition(callback: () => void): void {
  if (typeof document === 'undefined') {
    callback()
    return
  }

  // The API is still flagged as experimental in TypeScript's lib.dom.d.ts
  // in some toolchains, so reach for it via a narrow type assertion rather
  // than relying on global type augmentation.
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => unknown
  }

  if (typeof doc.startViewTransition !== 'function') {
    flushSync(callback)
    return
  }

  doc.startViewTransition(() => {
    flushSync(callback)
  })
}
