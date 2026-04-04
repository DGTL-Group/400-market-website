import Header from './Header'
import Footer from './Footer'
import CookieConsent from './CookieConsent'

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer socialLayout="vertical" showTagline={false} headingClass="footer-heading-lg" />
      <CookieConsent />
    </>
  )
}
