import Link from 'next/link'
import Logo from './Logo'
import NewsletterForm from './NewsletterForm'
import SocialIcons from './SocialIcons'

const navColumns = [
  {
    title: 'EXPLORE',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Vendors', href: '/vendors' },
      { label: 'Events', href: '/events' },
      { label: 'Shop', href: '/shop' },
      { label: 'News', href: '/news' },
    ],
  },
  {
    title: 'MARKET',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact Us', href: '/contact-us' },
    ],
  },
  {
    title: 'POLICIES',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Use', href: '/terms-of-use' },
    ],
  },
]

export default function Footer({ showTagline = true, headingClass = 'footer-heading', socialLayout = 'horizontal' as 'horizontal' | 'vertical', showCheckmark = false }: { showTagline?: boolean; headingClass?: string; socialLayout?: 'horizontal' | 'vertical'; showCheckmark?: boolean }) {
  return (
    <footer>
      {/* Yellow newsletter banner — "Stay in the Loop" */}
      <div className="bg-brand-yellow px-6 md:px-20 py-10">
        <div className="max-w-content mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-display-md md:text-display-lg text-brand-dark font-black">
              STAY IN THE LOOP
            </h2>
            <p className="font-body text-body-md text-text-primary mt-1">
              Market news, merchant spotlights, and event updates to your inbox.
            </p>
          </div>
          <NewsletterForm showCheckmark={showCheckmark} />
        </div>
      </div>

      {/* Main dark footer */}
      <div className="bg-footer-bg px-6 md:px-20 py-10">
        <div className="max-w-content mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr_auto] gap-10">
          {/* Brand block — logo + tagline */}
          <div className={`flex flex-col items-center ${showTagline ? '' : 'justify-center'}`}>
            <div className={`${showTagline ? 'w-28' : 'w-36'}`}>
              <Logo id={`footer-logo${showTagline ? '-a' : '-b'}`} className="w-full h-auto" />
            </div>
            {showTagline && (
              <p className="font-display text-text-subtle font-bold tracking-wider mt-6 text-center text-[18px]">
                FOOD, FINDS &amp; FUN.<br />
                OPEN EVERY WEEK-END.
              </p>
            )}
          </div>

          {/* Navigation columns */}
          <div className="flex flex-wrap gap-10">
            {navColumns.map((col) => (
              <div key={col.title}>
                <h5 className={headingClass}>
                  {col.title}
                </h5>
                <nav className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="footer-text"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}

            {/* Visit Us column */}
            <div>
              <h5 className={headingClass}>
                VISIT US
              </h5>
              <div className="flex flex-col gap-2">
                <a
                  href="https://share.google/qGvHeXlwOD08Oodyb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-text leading-relaxed"
                >
                  The 400 Market<br />
                  2207 Industrial Park Rd<br />
                  Innisfil, ON L9S 3V9
                </a>
                <a href="tel:7054361010" className="footer-text">
                  705-436-1010
                </a>
              </div>
            </div>
          </div>

          {/* Follow Us — social icons */}
          <div>
            <h5 className={headingClass}>
              FOLLOW US ON SOCIALS
            </h5>
            <SocialIcons layout={socialLayout} />
          </div>
        </div>
      </div>

      {/* Footer bottom bar */}
      <div className="bg-footer-bg border-t border-[#555] px-6 md:px-20 py-4">
        <div className="max-w-content mx-auto flex flex-col sm:flex-row justify-between gap-2">
          <span className="text-footer-bottom text-[14px]">
            &copy; 2026 The 400 Market. All rights reserved.
          </span>
          <a
            href="https://dgtlgroup.io"
            target="_blank"
            rel="noopener noreferrer"
            className="group text-footer-bottom text-[14px] hover:text-white transition-colors duration-500 ease-in-out"
          >
            Designed with{' '}
            <span className="inline-block relative">
              <span className="group-hover:opacity-0 transition-opacity duration-300 ease-in-out">love</span>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 ease-in-out text-red-500 text-[20px]">
                &#10084;
              </span>
            </span>
            {' '}by <span className="underline group-hover:text-brand-yellow transition-colors duration-500 ease-in-out">DGTL Group</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
