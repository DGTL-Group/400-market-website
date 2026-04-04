import Link from 'next/link'
import Logo from './Logo'
import NewsletterForm from './NewsletterForm'

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

export default function Footer({ showTagline = true, headingClass = 'footer-heading' }: { showTagline?: boolean; headingClass?: string }) {
  return (
    <footer>
      {/* Main footer */}
      <div className="bg-footer-bg px-6 md:px-20 pt-10 pb-6">
        <div className="max-w-content mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr_300px] gap-10">
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
                      className="text-text-subtle text-[13px] hover:text-white transition-colors"
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
              <div className="flex flex-col gap-2 text-text-subtle text-[13px]">
                <a
                  href="https://share.google/qGvHeXlwOD08Oodyb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors leading-relaxed"
                >
                  The 400 Market<br />
                  2207 Industrial Park Rd<br />
                  Innisfil, ON L9S 3V9
                </a>
                <a href="tel:7054361010" className="hover:text-white transition-colors">
                  705-436-1010
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className={headingClass}>
              STAY IN THE LOOP
            </h5>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Footer bottom bar */}
      <div className="bg-footer-bg border-t border-[#555] px-6 md:px-20 py-4">
        <div className="max-w-content mx-auto flex flex-col sm:flex-row justify-between gap-2">
          <span className="text-footer-bottom text-[12px]">
            &copy; 2026 The 400 Market. All rights reserved.
          </span>
          <a
            href="https://dgtlgroup.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-footer-bottom text-[12px] hover:text-white transition-colors"
          >
            Designed with love by <span className="underline">DGTL Group</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
