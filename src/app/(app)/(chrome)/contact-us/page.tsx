import type { Metadata } from 'next'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with The 400 Market in Innisfil, Ontario. Questions, merchant inquiries, or just saying hello.',
}

export default function ContactPage() {
  return (
    <>
      {/* Yellow hero band */}
      <section className="bg-brand-yellow px-6 md:px-20 py-6 md:py-8">
        <div className="max-w-content mx-auto">
          <h1 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-2">
            CONTACT US
          </h1>
          <p className="font-body text-body-md text-brand-dark/80 max-w-2xl">
            We&apos;d love to hear from you. Questions, merchant inquiries, or just saying hello.
          </p>
        </div>
      </section>

      {/* Form + Info — two-column on desktop, stacked on mobile */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Contact form */}
          <div>
            <h2 className="font-display text-display-sm uppercase tracking-wide text-brand-dark font-black mb-6">
              SEND US A MESSAGE
            </h2>
            <ContactForm />
          </div>

          {/* Contact info */}
          <div>
            <h2 className="font-display text-display-sm uppercase tracking-wide text-brand-dark font-black mb-6">
              GET IN TOUCH
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-body text-body-sm font-bold text-text-primary uppercase tracking-wide mb-1">
                  Address
                </h3>
                <a
                  href="https://share.google/qGvHeXlwOD08Oodyb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-body-md text-text-secondary leading-relaxed hover:text-brand-mango transition-colors duration-200"
                >
                  The 400 Market<br />
                  2207 Industrial Park Road<br />
                  Innisfil, Ontario, L9S 3V9
                </a>
              </div>

              <div>
                <h3 className="font-body text-body-sm font-bold text-text-primary uppercase tracking-wide mb-1">
                  Phone
                </h3>
                <p className="font-body text-body-md text-text-secondary">
                  <a href="tel:+17054361010" className="hover:text-brand-mango">
                    705-436-1010
                  </a>
                </p>
              </div>

              <div>
                <h3 className="font-body text-body-sm font-bold text-text-primary uppercase tracking-wide mb-1">
                  Email
                </h3>
                <p className="font-body text-body-md text-text-secondary">
                  <a href="mailto:manager@400market.com" className="hover:text-brand-mango">
                    manager@400market.com
                  </a>
                </p>
              </div>

              <div>
                <h3 className="font-body text-body-sm font-bold text-text-primary uppercase tracking-wide mb-1">
                  Hours
                </h3>
                <p className="font-body text-body-md text-text-secondary leading-relaxed">
                  Sat &amp; Sun &nbsp;9:00 AM &ndash; 5:00 PM<br />
                  Rain or shine &middot; Year-round
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps embed */}
      <section className="max-w-content mx-auto px-6 md:px-20 pb-12 md:pb-16">
        <iframe
          title="The 400 Market location on Google Maps"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6000.0!2d-79.5815!3d44.3185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882aa3b3c4f2a3a1%3A0x1234567890abcdef!2s2207%20Industrial%20Park%20Rd%2C%20Innisfil%2C%20ON%20L9S%203V9!5e0!3m2!1sen!2sca!4v1700000000000"
          width="100%"
          height="425"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-button"
        />
      </section>
    </>
  )
}
