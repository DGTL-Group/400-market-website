import { notFound } from 'next/navigation'

/**
 * Catch-all route inside the (app) group.
 *
 * Why this exists:
 * - Next.js only auto-uses `app/not-found.tsx` for unmatched URLs.
 * - Our app uses route groups `(app)` and `(payload)`, each with their own
 *   layout — there is no top-level `app/layout.tsx`, so we cannot put a
 *   `not-found.tsx` directly at `app/`.
 * - This catch-all matches any URL not handled by a more specific route in
 *   `(app)`, then triggers `notFound()`, which renders `(app)/not-found.tsx`
 *   wrapped in the `(app)` layout (so global CSS, fonts, header/footer all
 *   work as expected).
 *
 * `(payload)` routes (e.g. /admin) take precedence because they are more
 * specific than this catch-all.
 */
export default function CatchAllNotFound() {
  notFound()
}
