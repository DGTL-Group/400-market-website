import Header from './Header'
import Footer from './Footer'
import CookieConsent from './CookieConsent'

export default function PageLayout({ children, showCheckmark = false }: { children: React.ReactNode; showCheckmark?: boolean }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer socialLayout="vertical" showTagline={false} headingClass="footer-heading-lg" showCheckmark={showCheckmark} />
      <CookieConsent />
    </>
  )
}
