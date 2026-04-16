import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import Link from 'next/link'
import FAQAccordion from '@/components/FAQAccordion'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Everything you need to know about visiting and selling at The 400 Market in Innisfil, Ontario.',
}

export const revalidate = 3600

const CATEGORY_ORDER = [
  'general',
  'hours',
  'parking',
  'vendors',
  'buying',
  'gift-certificates',
  'events',
  'become-a-vendor',
] as const

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  hours: 'Hours & Location',
  parking: 'Parking',
  vendors: 'Vendors',
  buying: 'Shopping & Buying',
  'gift-certificates': 'Gift Certificates',
  events: 'Events',
  'become-a-vendor': 'Merchants & Booths',
}

export default async function FAQPage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'faqs',
    sort: 'sortOrder',
    limit: 200,
  })

  // Group by category in display order
  const groups = CATEGORY_ORDER
    .map((cat) => ({
      label: CATEGORY_LABELS[cat],
      items: docs
        .filter((d) => d.category === cat)
        .map((d) => ({
          id: String(d.id),
          question: d.question,
          answer: d.answer as SerializedEditorState,
        })),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="bg-brand-yellow px-6 md:px-20 py-6 md:py-8">
        <div className="max-w-content mx-auto">
          <h1 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-2">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="font-body text-body-md text-brand-dark/80 max-w-2xl">
            Everything you need to know about visiting and selling at 400 Market.
          </p>
        </div>
      </section>

      {/* ─── FAQ ACCORDION ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-16 md:py-20">
        {groups.length > 0 ? (
          <FAQAccordion groups={groups} />
        ) : (
          <div className="text-center py-12">
            <p className="font-body text-body-lg text-text-secondary mb-4">
              FAQs are being added — check back soon.
            </p>
            <Link href="/contact-us" className="btn-dark">
              Contact Us
            </Link>
          </div>
        )}
      </section>
    </>
  )
}
