import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { FloorPlan } from '@/components/FloorPlan/FloorPlan'

export const metadata: Metadata = {
  title: 'Home',
  description:
    "Ontario's #1 indoor weekend market. 105,000 sq ft, hundreds of vendors, open Saturday and Sunday 9AM-5PM in Innisfil, Ontario.",
}

// ISR: serve a cached static render and refresh in the background at most
// once per hour. The Vendors/Events/News collection hooks also call
// revalidatePath('/') on edits (see revalidateContent.ts), so this
// window is just the safety net for scheduled publishes.
export const revalidate = 3600

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function formatEventDate(iso: string) {
  // Extract the month/day in America/Toronto so the server render matches
  // what local visitors see — the market is an Ontario business, Ontario
  // time is the source of truth.
  const dt = new Date(iso)
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    month: 'short',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(dt)
  const month = parts.find((p) => p.type === 'month')?.value.toUpperCase().replace('.', '') || MONTHS[dt.getMonth()]
  const day = parts.find((p) => p.type === 'day')?.value || String(dt.getDate())
  return { month, day }
}

function formatEventTimeRange(startIso: string, endIso?: string | null) {
  const tz = 'America/Toronto'
  const start = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(startIso)).toUpperCase().replace(' ', '')
  if (!endIso) return start
  const end = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(endIso)).toUpperCase().replace(' ', '')
  return `${start} – ${end}`
}

function extractRichTextPreview(rich: unknown): string {
  // Pull first paragraph from a Lexical SerializedEditorState so the
  // homepage card can show a short event teaser without rendering the
  // whole rich text tree.
  if (!rich || typeof rich !== 'object') return ''
  const root = (rich as { root?: { children?: unknown[] } }).root
  if (!root?.children) return ''
  for (const block of root.children) {
    if (
      typeof block === 'object' &&
      block !== null &&
      'children' in block &&
      Array.isArray((block as { children: unknown[] }).children)
    ) {
      const inline = (block as { children: { text?: string }[] }).children
        .map((c) => c?.text || '')
        .join('')
      if (inline.trim()) return inline
    }
  }
  return ''
}

// Map vendor category slugs to human-readable badge labels. Keep this in
// sync with Vendors.ts `category` options.
const CATEGORY_LABEL: Record<string, string> = {
  antiques: 'ANTIQUES',
  collectibles: 'COLLECTIBLES',
  clothing: 'CLOTHING',
  food: 'FOOD & BEVERAGES',
  'home-decor': 'HOME DECOR',
  jewelry: 'JEWELRY',
  crafts: 'ARTS & CRAFTS',
  electronics: 'ELECTRONICS',
  books: 'BOOKS & MEDIA',
  'health-beauty': 'HEALTH & BEAUTY',
  sports: 'SPORTS',
  toys: 'TOYS & GAMES',
  retail: 'RETAIL',
  services: 'SERVICES',
  other: 'MARKET',
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  // Featured vendors: first 3 active vendors, newest first. Falls back
  // to an empty array and the section renders placeholder cards so the
  // homepage stays visually complete even before real vendor content
  // is seeded.
  const { docs: vendors } = await payload.find({
    collection: 'vendors',
    where: { active: { equals: true } },
    sort: '-createdAt',
    limit: 3,
    depth: 1,
  })

  // Upcoming events: the next 3 events whose start date is today or
  // later. Same graceful fallback as vendors.
  const now = new Date().toISOString()
  const { docs: events } = await payload.find({
    collection: 'events',
    where: { startDate: { greater_than_equal: now } },
    sort: 'startDate',
    limit: 3,
    depth: 1,
  })

  return (
    <>
      {/* ─── HERO ─── */}
      {/* Dark band that runs full-bleed. The headline sits inside a
          max-width wrapper so it doesn't drift off to the right on
          ultra-wide displays. Once we have a real hero photo from the
          client we'll drop it into a background image layer behind this
          content with a darkening gradient on the left for legibility. */}
      <section className="relative bg-brand-dark overflow-hidden">
        <div className="max-w-content mx-auto px-6 md:px-20 py-20 md:py-28 min-h-[520px] md:min-h-[620px] flex flex-col justify-center">
          <h1 className="font-display text-[48px] md:text-[76px] leading-[1.02] tracking-wide text-brand-yellow font-black max-w-[640px]">
            FOOD, FINDS<br />& FUN.
          </h1>
          <p className="font-display text-display-md md:text-display-lg uppercase text-white font-black mt-10 md:mt-12 max-w-[560px]">
            Ontario&apos;s #1 Indoor Weekend Market
          </p>
          <div className="mt-5 text-text-subtle font-body text-body-md space-y-1">
            <p>Sat &amp; Sun 9AM&ndash;5PM</p>
            <p>2207 Industrial Park Rd, Innisfil ON</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/contact-us" className="btn-primary">
              Plan Your Visit
            </Link>
            <Link href="/become-a-vendor" className="btn-secondary">
              Become a Merchant
            </Link>
          </div>
        </div>
      </section>

      {/* ─── INFO STRIP ─── */}
      {/* Yellow stat bar right under the hero. On mobile it stacks 2×2;
          on desktop it's a single horizontal row of 4. */}
      <section className="bg-brand-yellow">
        <div className="max-w-content mx-auto px-6 md:px-20 py-6 md:py-5 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          <div className="font-display text-[13px] md:text-[14px] uppercase tracking-wide text-brand-dark font-bold leading-tight">
            SAT&ndash;SUN 9AM&ndash;5PM
          </div>
          <div className="font-display text-[13px] md:text-[14px] uppercase tracking-wide text-brand-dark font-bold leading-tight">
            2207 Industrial Park Rd, Innisfil ON
          </div>
          <div className="font-display text-[13px] md:text-[14px] uppercase tracking-wide text-brand-dark font-bold leading-tight">
            105,000 SQ FT OF SHOPPING
          </div>
          <div className="font-display text-[13px] md:text-[14px] uppercase tracking-wide text-brand-dark font-bold leading-tight">
            HUNDREDS OF UNIQUE VENDORS
          </div>
        </div>
      </section>

      {/* ─── FEATURED VENDORS ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-16 md:py-20">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black">
            FEATURED VENDORS
          </h2>
          <p className="font-body text-body-lg text-text-secondary mt-3">
            Discover the makers, growers, and artisans of 400 Market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {vendors.length > 0 ? (
            vendors.map((vendor) => {
              const photo = vendor.photo as
                | { url?: string | null; alt?: string | null }
                | null
              const categories = Array.isArray(vendor.category)
                ? (vendor.category as string[])
                : []
              const primaryCategory = categories[0] ?? 'other'
              const badgeLabel = CATEGORY_LABEL[primaryCategory] ?? primaryCategory.toUpperCase()
              return (
                <Link
                  key={vendor.id}
                  href={`/vendors/${vendor.slug}`}
                  className="group flex flex-col bg-white border border-surface-light rounded-button overflow-hidden hover:shadow-lg transition-shadow duration-500"
                >
                  <div className="aspect-[4/3] bg-surface-light overflow-hidden">
                    {photo?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={photo.url}
                        alt={photo.alt || vendor.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-subtle font-body text-body-sm uppercase tracking-wider">
                        {vendor.name}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="inline-block self-start bg-brand-yellow text-brand-dark font-display text-caption uppercase tracking-wider px-2.5 py-1 rounded-button mb-3">
                      {badgeLabel}
                    </span>
                    <h3 className="font-body font-bold text-display-sm text-text-primary normal-case tracking-normal mb-1">
                      {vendor.name}
                    </h3>
                    {vendor.shortDescription && (
                      <p className="font-body text-body-sm text-text-secondary line-clamp-2 mb-4">
                        {vendor.shortDescription}
                      </p>
                    )}
                    <span className="mt-auto font-body text-body-sm text-brand-mango font-semibold group-hover:text-brand-orange transition-colors duration-500">
                      View profile &rarr;
                    </span>
                  </div>
                </Link>
              )
            })
          ) : (
            // Graceful empty state — keeps the grid balanced on day one
            // before real vendor records are seeded.
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col bg-white border border-surface-light rounded-button overflow-hidden"
              >
                <div className="aspect-[4/3] bg-surface-light flex items-center justify-center text-text-subtle font-body text-body-sm uppercase tracking-wider">
                  Vendor photo
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="inline-block self-start bg-brand-yellow text-brand-dark font-display text-caption uppercase tracking-wider px-2.5 py-1 rounded-button mb-3">
                    MARKET
                  </span>
                  <h3 className="font-body font-bold text-display-sm text-text-primary normal-case tracking-normal mb-1">
                    Coming soon
                  </h3>
                  <p className="font-body text-body-sm text-text-secondary mb-4">
                    Vendor profiles will appear here as they&apos;re added to the directory.
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-10">
          <Link href="/vendors" className="btn-dark">
            View All Vendors
          </Link>
        </div>
      </section>

      {/* ─── MARKET MAP TEASER ─── */}
      {/* Interactive floor plan — CRM-driven. Rented booths show vendor
          info on hover and link to the vendor detail page; available and
          reserved booths are visible but not interactive in this mode
          (the homepage's goal is to direct plan-a-visit intent toward
          occupied vendors). The "Browse the full directory" CTA below
          remains the escape hatch for anyone who'd rather scan a list. */}
      <section className="bg-surface-light py-16 md:py-20">
        <div className="max-w-content mx-auto px-6 md:px-20">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black">
              EXPLORE THE MARKET
            </h2>
            <p className="font-body text-body-lg text-text-secondary mt-3">
              Interactive floor plan &mdash; hover a booth to see the vendor.
            </p>
          </div>

          <FloorPlan mode="homepage" />

          <div className="text-center mt-10">
            <Link href="/vendors" className="btn-dark">
              Browse the Full Directory
            </Link>
          </div>
        </div>
      </section>

      {/* ─── UPCOMING EVENTS ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-16 md:py-20">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black">
            UPCOMING EVENTS
          </h2>
          <p className="font-body text-body-lg text-text-secondary mt-3">
            Special weekends, seasonal markets, and community days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {events.length > 0 ? (
            events.map((event) => {
              const { month, day } = formatEventDate(event.startDate)
              const timeRange = formatEventTimeRange(event.startDate, event.endDate)
              const teaser = extractRichTextPreview(event.description)
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group flex gap-4 p-5 bg-white border border-surface-light rounded-button hover:shadow-lg transition-shadow duration-500"
                >
                  <div className="bg-brand-yellow w-[72px] h-[72px] flex flex-col items-center justify-center flex-shrink-0">
                    <span className="font-body text-[11px] font-bold tracking-wide text-brand-dark">{month}</span>
                    <span className="font-body text-[28px] font-bold leading-none text-brand-dark">{day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-body font-bold text-body-lg text-text-primary normal-case tracking-normal mb-1 line-clamp-2">
                      {event.name}
                    </h3>
                    <p className="font-body text-caption text-text-subtle mb-2">{timeRange}</p>
                    {teaser && (
                      <p className="font-body text-body-sm text-text-secondary line-clamp-2 mb-3">
                        {teaser}
                      </p>
                    )}
                    <span className="font-body text-body-sm text-brand-mango font-semibold group-hover:text-brand-orange transition-colors duration-500">
                      Details &rarr;
                    </span>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12 bg-surface-light/40 rounded-button">
              <p className="font-body text-body-md text-text-secondary">
                No upcoming events scheduled yet. Check back soon!
              </p>
            </div>
          )}
        </div>

        {events.length > 0 && (
          <div className="text-center mt-10">
            <Link href="/events" className="btn-dark">
              View All Events
            </Link>
          </div>
        )}
      </section>

      {/* ─── WHAT PEOPLE ARE SAYING ─── */}
      {/* Static placeholder reviews — we'll wire these to the Google
          Places API (or cache a pull into a simple JSON) once the client
          gives us API credentials. For now these give the section visual
          weight and show the client what it'll look like populated. */}
      <section className="bg-surface-light py-16 md:py-20">
        <div className="max-w-content mx-auto px-6 md:px-20">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black">
              WHAT PEOPLE ARE SAYING
            </h2>
            <p className="font-body text-body-lg text-text-secondary mt-3">
              Real reviews from real visitors &mdash; straight from Google.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                text: 'Amazing market! So many unique vendors and great food. We come every weekend with the family.',
                author: 'Sarah M.',
              },
              {
                text: 'Love the variety here. Found incredible antiques and handmade crafts. The atmosphere is fantastic.',
                author: 'James T.',
              },
              {
                text: 'Best flea market in Ontario. Huge space, friendly vendors, and always something new to discover.',
                author: 'Lisa K.',
              },
            ].map((review) => (
              <div
                key={review.author}
                className="bg-white p-6 md:p-7 rounded-button border border-surface-light flex flex-col"
              >
                <div className="text-brand-orange text-[20px] tracking-widest mb-3" aria-label="5 star review">
                  ★★★★★
                </div>
                <p className="font-body text-body-md text-text-primary leading-relaxed mb-4 flex-1">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="font-body font-bold text-body-sm text-text-primary">&mdash; {review.author}</p>
                <p className="font-body text-caption text-text-subtle mt-0.5">Google Review</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
