import type { Metadata } from 'next'
import type { Where } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import PageLayout from '@/components/PageLayout'
import EventRow from '@/components/EventRow'
import EventsFilter from '@/components/EventsFilter'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Special market days, themed weekends, and seasonal events at The 400 Market in Innisfil, Ontario.',
}

type Props = {
  searchParams: Promise<{ view?: string; page?: string }>
}

function startOfTorontoMonth(d: Date): Date {
  // Compute the first day of the month in America/Toronto, returned as UTC instant.
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
  })
  const parts = fmt.formatToParts(d)
  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  // First day of that month at 00:00 in Toronto. Use a generous UTC offset (UTC noon)
  // — month boundary tolerance for filtering doesn't need millisecond precision.
  return new Date(Date.UTC(year, month - 1, 1, 5, 0, 0))
}

function endOfTorontoMonth(d: Date): Date {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
  })
  const parts = fmt.formatToParts(d)
  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  // First day of NEXT month, then we'll filter `< nextMonth`.
  return new Date(Date.UTC(year, month, 1, 5, 0, 0))
}

function extractDescription(rich: unknown): string {
  // Pull the first paragraph text from a Lexical SerializedEditorState.
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

export default async function EventsPage({ searchParams }: Props) {
  const { view, page } = await searchParams
  const currentPage = Number(page) || 1
  const perPage = 8

  const payload = await getPayload({ config })
  const now = new Date()

  const where: Where = {}
  let sort = 'startDate'

  if (view === 'past') {
    where.startDate = { less_than: now.toISOString() }
    sort = '-startDate'
  } else if (view === 'month') {
    const start = startOfTorontoMonth(now)
    const end = endOfTorontoMonth(now)
    where.and = [
      { startDate: { greater_than_equal: start.toISOString() } },
      { startDate: { less_than: end.toISOString() } },
    ]
  } else if (view === 'all') {
    // No date filter
  } else {
    // Default: upcoming
    where.startDate = { greater_than_equal: now.toISOString() }
  }

  const { docs: events, totalPages } = await payload.find({
    collection: 'events',
    where,
    sort,
    limit: perPage,
    page: currentPage,
  })

  const queryString = view ? `view=${view}&` : ''

  return (
    <PageLayout showCheckmark>
      {/* Yellow hero band */}
      <section className="bg-brand-yellow px-6 md:px-20 py-12 md:py-16">
        <div className="max-w-content mx-auto">
          <h1 className="font-display text-display-xl uppercase tracking-wide text-brand-dark font-black mb-3">
            EVENTS
          </h1>
          <p className="font-body text-body-lg text-brand-dark/80 max-w-2xl">
            Special market days, themed weekends, and seasonal events at The 400 Market.
          </p>
        </div>
      </section>

      {/* Filter tab bar */}
      <EventsFilter />

      {/* Event rows */}
      <section className="max-w-content mx-auto">
        {events.length === 0 ? (
          <p className="text-text-secondary text-body-md py-20 text-center">
            No events found for this view.
          </p>
        ) : (
          events.map((event, i) => {
            const image = event.featuredImage as { url?: string | null; alt?: string | null } | null
            return (
              <EventRow
                key={event.id}
                name={event.name}
                slug={event.slug}
                startDate={event.startDate}
                endDate={event.endDate}
                description={extractDescription(event.description)}
                location={event.location}
                featuredImage={image}
                featured={view !== 'past' && i === 0 && currentPage === 1}
                highlight={i % 2 === 1}
              />
            )
          })
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/events?${queryString}page=${p}`}
                className={`px-4 py-2 rounded-button text-body-sm font-semibold transition-colors duration-500 ${
                  p === currentPage
                    ? 'bg-brand-yellow text-brand-dark'
                    : 'bg-surface-light text-text-secondary hover:bg-brand-yellow/20'
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-12">
        <div className="bg-brand-yellow rounded-button px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-display-md md:text-display-lg uppercase tracking-wide text-brand-dark font-black">
              READY TO JOIN THE MARKET?
            </h2>
            <p className="font-body text-body-md text-text-primary mt-1">
              Apply for a booth and join us at our next themed weekend.
            </p>
          </div>
          <a
            href="/become-a-vendor"
            className="bg-brand-dark text-white px-6 py-4 font-bold text-[13px] rounded-button whitespace-nowrap hover:bg-text-secondary transition-colors duration-500"
          >
            BECOME A MERCHANT
          </a>
        </div>
      </section>
    </PageLayout>
  )
}
