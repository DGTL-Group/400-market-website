import type { Metadata } from 'next'
import Link from 'next/link'
import MerchantApplicationForm from '@/components/MerchantApplicationForm'

export const metadata: Metadata = {
  title: 'Become a Merchant',
  description:
    'Join Ontario\'s #1 indoor weekend market. Flexible booth rentals, established foot traffic, and a thriving vendor community at The 400 Market in Innisfil.',
}

const benefits = [
  {
    title: 'Established Traffic',
    description: 'Thousands of shoppers every weekend. No building your own audience.',
  },
  {
    title: 'Flexible Rentals',
    description: 'New merchants enjoy flexible options — one-day, weekend, or monthly rentals. No long-term leases.',
  },
  {
    title: 'Indoor Year-Round',
    description: 'Rain or shine — the market is fully indoors. Never lose a market day to weather.',
  },
  {
    title: 'Low Commitment',
    description: "Only first and last month's rent as deposit. 30-day notice to leave — that's it.",
  },
]

const monthlyRates = [
  { type: 'Outdoor \u2014 Wooden Stall / Parking Lot', size: '\u2014', rate: '$350/month', taxes: 'Included' },
  { type: 'Indoor Booth', size: "8\u2019\u00d78\u2019", rate: '$500/month', taxes: 'Included' },
  { type: 'Indoor Booth', size: "8\u2019\u00d716\u2019", rate: '$975/month', taxes: 'Included' },
  { type: 'Indoor Booth', size: "8\u2019\u00d724\u2019", rate: '$1,200/month', taxes: 'Included' },
  { type: 'Indoor Booth', size: "8\u2019\u00d732\u2019", rate: '$1,450/month', taxes: 'Included' },
]

const dailyRates = [
  { type: 'Outdoor \u2014 Parking Lot (20\u00d720, no tables)', sat: '$50', sun: '$50', weekend: '$100' },
  { type: 'Outdoor \u2014 Wooden Stall', sat: '$50', sun: '$50', weekend: '$100' },
  { type: 'Indoor \u2014 8\u2019\u00d78\u2019 Booth', sat: '$75', sun: '$75', weekend: '$150' },
]

export default function BecomeAVendorPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-brand-dark overflow-hidden">
        <div className="max-w-content mx-auto px-6 md:px-20 py-16 md:py-20 min-h-[320px] flex flex-col justify-center">
          <h1 className="font-display text-[40px] md:text-[56px] leading-[1.05] tracking-wide text-brand-yellow font-black max-w-[580px]">
            BECOME A MERCHANT
          </h1>
          <p className="font-body text-body-md text-text-subtle mt-5 max-w-[560px] leading-relaxed">
            For over 35 years, the 400 Market has been the heart of Simcoe County&apos;s
            local economy, uniting entrepreneurs, small businesses, and food artisans
            in one thriving community.
          </p>
        </div>
      </section>

      {/* ─── WHY SELL ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-16 md:py-20">
        <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-8">
          WHY SELL AT 400 MARKET?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-surface-light p-6 border-l-[5px] border-brand-yellow"
            >
              <h3 className="font-body font-bold text-body-lg text-text-primary normal-case tracking-normal mb-2">
                {b.title}
              </h3>
              <p className="font-body text-body-sm text-text-secondary">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── MONTHLY RATES ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 pb-16 md:pb-20">
        <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-6">
          MONTHLY RATES
        </h2>

        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b-2 border-brand-dark">
                <th className="font-body text-body-sm font-bold text-text-primary py-3 pr-4">Booth Type</th>
                <th className="font-body text-body-sm font-bold text-text-primary py-3 pr-4">Size</th>
                <th className="font-body text-body-sm font-bold text-text-primary py-3 pr-4">Monthly Rate</th>
                <th className="font-body text-body-sm font-bold text-text-primary py-3">Taxes</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRates.map((r, i) => (
                <tr key={i} className="border-b border-surface-light">
                  <td className="font-body text-body-sm text-text-secondary py-3 pr-4">{r.type}</td>
                  <td className="font-body text-body-sm text-text-secondary py-3 pr-4">{r.size}</td>
                  <td className="font-body text-body-sm text-text-primary font-semibold py-3 pr-4">{r.rate}</td>
                  <td className="font-body text-body-sm text-text-secondary py-3">{r.taxes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── DAILY & WEEKEND RATES ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 pb-16 md:pb-20">
        <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-6">
          DAILY &amp; WEEKEND RATES
        </h2>

        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b-2 border-brand-dark">
                <th className="font-body text-body-sm font-bold text-text-primary py-3 pr-4">Booth Type</th>
                <th className="font-body text-body-sm font-bold text-text-primary py-3 pr-4">Saturday</th>
                <th className="font-body text-body-sm font-bold text-text-primary py-3 pr-4">Sunday</th>
                <th className="font-body text-body-sm font-bold text-text-primary py-3">Full Weekend</th>
              </tr>
            </thead>
            <tbody>
              {dailyRates.map((r, i) => (
                <tr key={i} className="border-b border-surface-light">
                  <td className="font-body text-body-sm text-text-secondary py-3 pr-4">{r.type}</td>
                  <td className="font-body text-body-sm text-text-primary font-semibold py-3 pr-4">{r.sat}</td>
                  <td className="font-body text-body-sm text-text-primary font-semibold py-3 pr-4">{r.sun}</td>
                  <td className="font-body text-body-sm text-text-primary font-semibold py-3">{r.weekend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-1">
          <p className="font-body text-body-sm text-text-secondary">
            Payment is due prior to set up. Set up is between 7:30&ndash;8:30 AM.
          </p>
          <p className="font-body text-body-sm text-text-secondary">
            Permanent merchants: first and last month&apos;s rent as deposit. 30-day notice upon leaving.
          </p>
        </div>
      </section>

      {/* ─── AVAILABLE BOOTHS (FLOOR PLAN) ─── */}
      <section className="bg-surface-light py-16 md:py-20">
        <div className="max-w-content mx-auto px-6 md:px-20">
          <div className="text-center mb-8">
            <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black">
              AVAILABLE BOOTHS
            </h2>
            <p className="font-body text-body-lg text-text-secondary mt-3">
              See where the open spaces are &mdash; contact us to reserve yours.
            </p>
          </div>

          <div className="mx-auto max-w-[85%] bg-white rounded-button overflow-hidden border border-surface-light">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/home/market-floor-plan.webp"
              alt="The 400 Market floor plan showing booth numbers and sections"
              className="w-full h-auto block"
            />
          </div>

          <div className="text-center mt-8">
            <Link href="/contact-us" className="btn-dark">
              Contact Us to Reserve
            </Link>
          </div>
        </div>
      </section>

      {/* ─── APPLICATION FORM ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-16 md:py-20">
        <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-3">
          APPLY FOR A BOOTH
        </h2>
        <p className="font-body text-body-lg text-text-secondary mb-8">
          Fill out the form and our team will be in touch within 2 business days.
        </p>

        <MerchantApplicationForm />
      </section>
    </>
  )
}
