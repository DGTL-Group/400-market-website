import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import EventsListClient, { type ClientEvent } from '@/components/EventsListClient'

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Special market days, themed weekends, and seasonal events at The 400 Market in Innisfil, Ontario.',
}

// ISR: serve a cached static render and refresh in the background at most
// once per hour. The Events collection's afterChange/afterDelete hooks
// also call revalidatePath('/events') for instant updates on edits, so
// this hour-long window is just the safety net for scheduled publishes
// and any out-of-band data changes (direct DB writes, migrations, etc).
export const revalidate = 3600

type Props = {
  searchParams: Promise<{ view?: string; page?: string }>
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
  const initialView = view ?? ''
  const initialPage = Number(page) || 1

  // Fetch ALL events in one go and hand them to the client. Filtering and
  // pagination then happen entirely in the browser, so swapping filters or
  // flipping pages is instant — no server round-trip, no grid snap. The
  // dataset is small (a market does maybe a few dozen events a year), so
  // shipping it all to the client is cheap. The 1000-doc cap is just a
  // safety net.
  const payload = await getPayload({ config })
  const { docs: events } = await payload.find({
    collection: 'events',
    sort: 'startDate',
    limit: 1000,
  })

  // Server captures "now" once and passes it to the client so SSR and the
  // first hydration agree on which events count as upcoming/past.
  const serverNow = new Date().toISOString()

  const clientEvents: ClientEvent[] = events.map((event) => {
    const image = event.featuredImage as
      | { url?: string | null; alt?: string | null }
      | null
    return {
      id: event.id,
      name: event.name,
      slug: event.slug,
      startDate: event.startDate,
      endDate: event.endDate ?? null,
      description: extractDescription(event.description),
      location: event.location ?? null,
      featuredImage: image
        ? { url: image.url ?? null, alt: image.alt ?? null }
        : null,
    }
  })

  return (
    <>
      {/* Yellow hero band */}
      <section className="bg-brand-yellow px-6 md:px-20 py-6 md:py-8">
        <div className="max-w-content mx-auto">
          <h1 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-2">
            EVENTS
          </h1>
          <p className="font-body text-body-md text-brand-dark/80 max-w-2xl">
            Special market days, themed weekends, and seasonal events at The 400 Market.
          </p>
        </div>
      </section>

      {/* Filter bar + paginated rows — all client-driven so filter clicks
          don't trigger a server round trip. */}
      <EventsListClient
        events={clientEvents}
        initialView={initialView}
        initialPage={initialPage}
        serverNow={serverNow}
      />

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
          <Link
            href="/become-a-vendor"
            className="bg-brand-dark text-white px-6 py-4 font-bold text-[13px] rounded-button whitespace-nowrap hover:bg-text-secondary transition-colors duration-500"
          >
            BECOME A MERCHANT
          </Link>
        </div>
      </section>
    </>
  )
}
