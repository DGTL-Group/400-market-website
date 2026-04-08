import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieConsent from '@/components/CookieConsent'
import KonamiConfetti from '@/components/KonamiConfetti'
import PageTransition from '@/components/PageTransition'

/**
 * Chrome layout — shared header + footer + page transition shell for
 * every content page. Lives in its own route group so it applies to
 * /events, /news, /privacy-policy, /terms-of-use, etc. but NOT to the
 * coming-soon home page or the 404 whack-a-vendor page, which both have
 * their own bespoke chrome.
 *
 * Why this must be a layout.tsx and not a <PageLayout> component each
 * page imports: a per-page wrapper component gets unmounted and
 * remounted on every navigation, so any client state inside it (like
 * PageTransition's enter/exit phase tracking) is wiped between routes
 * and the exit animation never gets a chance to fire. A real
 * layout.tsx, on the other hand, persists across navigations within
 * its segment — only `{children}` changes — so Header stays mounted,
 * PageTransition keeps its state, and the enter→exit derived-state
 * handoff actually works.
 */
export default function ChromeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* PageTransition wraps ONLY main so the Header and Footer stay
          perfectly static across route changes — no fading, no
          remount, no flash of empty nav. */}
      <PageTransition>
        <main>{children}</main>
      </PageTransition>
      <Footer socialLayout="vertical" showTagline={false} headingClass="footer-heading-lg" showCheckmark />
      <CookieConsent />
      <KonamiConfetti />
    </>
  )
}
