import type { Metadata } from 'next'
import Link from 'next/link'
import { getYearsInBusiness } from '@/lib/marketFacts'
import OpenClosedBadge from '@/components/OpenClosedBadge'

const yearsInBusiness = getYearsInBusiness()

// Paste the Lightwidget iframe URL here once the widget is configured.
// Leaving this empty renders a placeholder with a "View on Instagram" CTA.
const INSTAGRAM_WIDGET_URL = ''

export const metadata: Metadata = {
  title: 'About Us',
  description: `For over ${yearsInBusiness} years, The 400 Market has been Simcoe County's home for local vendors, fresh food, and community. Learn our story.`,
}

export default function AboutUsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="bg-brand-yellow px-6 md:px-20 py-6 md:py-8">
        <div className="max-w-content mx-auto">
          <h1 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-2">
            ABOUT US
          </h1>
          <p className="font-body text-body-md text-brand-dark/80 max-w-2xl">
            Our story, our mission, and what makes The 400 Market the heart of Simcoe County.
          </p>
        </div>
      </section>

      {/* ─── FROM HUMBLE BEGINNINGS ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-6">
              OUR STORY
            </h2>
            <div className="space-y-4 font-body text-body-md text-text-secondary leading-relaxed">
              <p>
                For over {yearsInBusiness} years, the 400 Market has been the heart of Simcoe
                County&apos;s local economy, uniting entrepreneurs, small businesses,
                and food artisans in one thriving community.
              </p>
              <p>
                With hundreds of unique vendor spaces, thousands of weekly visitors,
                and a dedicated team committed to the market experience, 400 Market is
                more than a shopping destination &mdash; it&apos;s where community happens.
              </p>
              <p>
                Today, the market is managed by Scott Saunders, General Manager.
              </p>
            </div>
          </div>

          {/* TODO: replace with market history photo */}
          <div className="aspect-[4/3] bg-surface-light rounded-button flex items-center justify-center">
            <span className="font-body text-body-sm text-text-subtle">Market History Photo</span>
          </div>
        </div>
      </section>

      {/* ─── OUR MISSION ─── */}
      <section className="bg-brand-dark">
        <div className="max-w-content mx-auto px-6 md:px-20 py-12 md:py-16">
          <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-yellow font-black mb-4">
            OUR MISSION
          </h2>
          <p className="font-body text-body-lg text-text-subtle max-w-3xl leading-relaxed">
            To provide a vibrant, accessible, and welcoming marketplace where local
            vendors thrive and community members discover unique finds, fresh food,
            and lasting connections &mdash; every single weekend.
          </p>
        </div>
      </section>

      {/* ─── VISIT US ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-16 md:py-20">
        <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-8">
          VISIT US
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Hours */}
          <div className="border border-surface-light rounded-button p-6 flex flex-col hover:border-brand-mango transition-colors duration-200">
            <h3 className="font-body font-bold text-body-lg text-text-primary normal-case tracking-normal mb-2">
              Hours
            </h3>
            <div className="mb-3">
              <OpenClosedBadge />
            </div>
            <p className="font-body text-body-md text-text-secondary leading-relaxed">
              Saturday &amp; Sunday<br />
              9:00 AM &ndash; 5:00 PM<br />
              Year-round, rain or shine
            </p>
          </div>

          {/* Location */}
          <a
            href="https://share.google/qGvHeXlwOD08Oodyb"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-surface-light rounded-button p-6 flex flex-col hover:border-brand-mango transition-colors duration-200 group"
          >
            <h3 className="font-body font-bold text-body-lg text-text-primary normal-case tracking-normal mb-2">
              Location
            </h3>
            <p className="font-body text-body-md text-text-secondary leading-relaxed">
              The 400 Market<br />
              2207 Industrial Park Road<br />
              Innisfil, Ontario, L9S 3V9
            </p>
            <span className="font-body text-body-sm font-bold text-brand-mango mt-auto pt-4 inline-flex items-center gap-1.5">
              Get Directions
              <svg
                className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12h16M13 5l7 7-7 7" />
              </svg>
            </span>
          </a>

          {/* Space */}
          <Link
            href="/become-a-vendor"
            className="border border-surface-light rounded-button p-6 flex flex-col hover:border-brand-mango transition-colors duration-200 group"
          >
            <h3 className="font-body font-bold text-body-lg text-text-primary normal-case tracking-normal mb-2">
              Space
            </h3>
            <p className="font-body text-body-md text-text-secondary leading-relaxed">
              105,000 SQ FT of shopping<br />
              Accessible spaces available
            </p>
            <span className="font-body text-body-sm font-bold text-brand-mango mt-auto pt-4 inline-flex items-center gap-1.5">
              Learn More
              <svg
                className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12h16M13 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* ─── INSIDE THE MARKET (Instagram) ─── */}
      {/*
        TODO: replace INSTAGRAM_WIDGET_URL with a Lightwidget embed URL.
        1. Sign up at https://lightwidget.com (free)
        2. Create a new widget pointing at https://www.instagram.com/the400market
        3. Paste the generated iframe URL (looks like //lightwidget.com/widgets/abc123.html)
      */}
      <section className="max-w-content mx-auto px-6 md:px-20 pb-16 md:pb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black">
            INSIDE THE MARKET
          </h2>
          <a
            href="https://www.instagram.com/the400market"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-body-sm text-text-secondary hover:text-brand-mango transition-colors duration-200"
          >
            Follow @the400market on Instagram &rarr;
          </a>
        </div>

        {INSTAGRAM_WIDGET_URL ? (
          <iframe
            src={INSTAGRAM_WIDGET_URL}
            title="The 400 Market on Instagram"
            className="w-full aspect-[16/9] md:aspect-[21/9] rounded-button border-0"
            scrolling="no"
            allowFullScreen
          />
        ) : (
          <div className="aspect-[16/9] md:aspect-[21/9] bg-surface-light rounded-button flex flex-col items-center justify-center gap-4">
            <p className="font-body text-body-md text-text-subtle">
              Instagram feed coming soon.
            </p>
            <a
              href="https://www.instagram.com/the400market"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-dark"
            >
              View on Instagram
            </a>
          </div>
        )}
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-brand-dark">
        <div className="max-w-content mx-auto px-6 md:px-20 py-14 md:py-16 text-center">
          <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-white font-black mb-8">
            READY TO JOIN THE MARKET?
          </h2>
          <Link href="/become-a-vendor" className="btn-primary">
            Become a Merchant
          </Link>
        </div>
      </section>
    </>
  )
}
