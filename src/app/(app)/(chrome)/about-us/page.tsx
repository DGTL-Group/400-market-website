import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'For over 35 years, The 400 Market has been Simcoe County\'s home for local vendors, fresh food, and community. Learn our story.',
}

export default function AboutUsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-brand-dark overflow-hidden">
        {/* TODO: replace placeholder with market interior wide-shot image */}
        <div className="absolute inset-0 bg-brand-dark/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/80 to-transparent z-10" />
        <div className="w-full h-full absolute inset-0 bg-surface-light/10" />

        <div className="relative z-20 max-w-content mx-auto px-6 md:px-20 py-20 md:py-28 min-h-[360px] flex flex-col justify-end">
          <h1 className="font-display text-[48px] md:text-[64px] leading-[1.05] tracking-wide text-brand-yellow font-black">
            OUR STORY
          </h1>
        </div>
      </section>

      {/* ─── FROM HUMBLE BEGINNINGS ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-6">
              FROM HUMBLE BEGINNINGS
            </h2>
            <div className="space-y-4 font-body text-body-md text-text-secondary leading-relaxed">
              <p>
                For over 35 years, the 400 Market has been the heart of Simcoe
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
      <section className="bg-brand-yellow">
        <div className="max-w-content mx-auto px-6 md:px-20 py-12 md:py-16">
          <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-4">
            OUR MISSION
          </h2>
          <p className="font-body text-body-lg text-brand-dark/80 max-w-3xl leading-relaxed">
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
          <div className="border border-surface-light rounded-button p-6">
            <h3 className="font-body font-bold text-body-lg text-text-primary normal-case tracking-normal mb-2">
              Hours
            </h3>
            <p className="font-body text-body-md text-text-secondary leading-relaxed">
              Saturday &amp; Sunday<br />
              9:00 AM &ndash; 5:00 PM<br />
              Year-round, rain or shine
            </p>
          </div>

          <div className="border border-surface-light rounded-button p-6">
            <h3 className="font-body font-bold text-body-lg text-text-primary normal-case tracking-normal mb-2">
              Location
            </h3>
            <p className="font-body text-body-md text-text-secondary leading-relaxed">
              The 400 Market<br />
              2207 Industrial Park Road<br />
              Innisfil, Ontario, L9S 3V9
            </p>
          </div>

          <div className="border border-surface-light rounded-button p-6">
            <h3 className="font-body font-bold text-body-lg text-text-primary normal-case tracking-normal mb-2">
              Space
            </h3>
            <p className="font-body text-body-md text-text-secondary leading-relaxed">
              105,000 SQ FT of shopping<br />
              Accessible spaces available
            </p>
          </div>
        </div>
      </section>

      {/* ─── INSIDE THE MARKET (Gallery) ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 pb-16 md:pb-20">
        <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-8">
          INSIDE THE MARKET
        </h2>

        {/* TODO: replace placeholders with actual gallery images */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="aspect-[4/3] bg-surface-light rounded-button flex items-center justify-center"
            >
              <span className="font-body text-body-sm text-text-subtle">Gallery {n}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-brand-dark">
        <div className="max-w-content mx-auto px-6 md:px-20 py-14 md:py-16 text-center">
          <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-yellow font-black mb-4">
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
