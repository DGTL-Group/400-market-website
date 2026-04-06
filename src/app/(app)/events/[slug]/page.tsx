import type { Metadata } from 'next'
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import PageLayout from '@/components/PageLayout'
import Breadcrumb from '@/components/Breadcrumb'
import EventRow from '@/components/EventRow'
import ScrollProgress from '@/components/ScrollProgress'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'events',
    limit: 1000,
    select: { slug: true },
  })
  return docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const event = docs[0]
  if (!event) return { title: 'Event Not Found' }

  const image = event.featuredImage as { url?: string } | undefined

  return {
    title: event.name,
    description: `${event.name} at The 400 Market in Innisfil, Ontario.`,
    openGraph: {
      images: image?.url ? [{ url: image.url }] : undefined,
    },
  }
}

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Toronto',
  })
}

function formatLongTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Toronto',
    hour12: true,
  })
}

function extractDescription(rich: unknown): string {
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

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const event = docs[0]
  if (!event) notFound()

  const featuredImage = event.featuredImage as { url?: string; alt?: string } | undefined

  const startLong = formatLongDate(event.startDate)
  const startTime = formatLongTime(event.startDate)
  const endLong = event.endDate ? formatLongDate(event.endDate) : null
  const endTime = event.endDate ? formatLongTime(event.endDate) : null

  // Fetch upcoming related events (3 most recent upcoming, excluding current)
  const now = new Date()
  const { docs: relatedEvents } = await payload.find({
    collection: 'events',
    where: {
      and: [
        { slug: { not_equals: slug } },
        { startDate: { greater_than_equal: now.toISOString() } },
      ],
    },
    sort: 'startDate',
    limit: 3,
  })

  return (
    <PageLayout showCheckmark>
      <ScrollProgress />

      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Events', href: '/events' },
          { label: event.name },
        ]}
      />

      {/* Featured image hero */}
      {featuredImage?.url ? (
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
          <img
            src={featuredImage.url}
            alt={featuredImage.alt || event.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="relative w-full h-[280px] md:h-[360px] overflow-hidden bg-brand-yellow flex items-center justify-center">
          <div className="font-display text-[120px] md:text-[200px] font-black text-brand-dark/10 leading-none select-none">
            400
          </div>
        </div>
      )}

      {/* Title area */}
      <section className="max-w-content mx-auto px-6 md:px-20 pt-10 pb-6">
        <p className="text-body-md text-text-secondary mb-2">{startLong}</p>
        <h1 className="font-display text-display-lg uppercase tracking-wide font-bold">{event.name}</h1>
      </section>

      {/* Event info card */}
      <section className="max-w-content mx-auto px-6 md:px-20 pb-8">
        <div className="bg-surface-light/60 rounded-button p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-caption uppercase tracking-wider text-text-secondary mb-1 font-bold">When</p>
            <p className="font-body text-body-md text-text-primary font-semibold">
              {startTime}
              {endTime && (endLong === startLong ? ` – ${endTime}` : ` – ${endLong} ${endTime}`)}
            </p>
          </div>
          <div>
            <p className="text-caption uppercase tracking-wider text-text-secondary mb-1 font-bold">Where</p>
            <p className="font-body text-body-md text-text-primary font-semibold">
              {event.location || '2207 Industrial Park Rd, Innisfil ON'}
            </p>
          </div>
          <div>
            <p className="text-caption uppercase tracking-wider text-text-secondary mb-1 font-bold">Admission</p>
            <p className="font-body text-body-md text-text-primary font-semibold">Free entry · Free parking</p>
          </div>
        </div>
      </section>

      {/* Event description */}
      <article className="prose mx-auto max-w-content px-6 md:px-20">
        <RichText data={event.description as SerializedEditorState} />
      </article>

      {/* CTA banner */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-12">
        <div className="bg-brand-yellow rounded-button px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-display-md md:text-display-lg uppercase tracking-wide text-brand-dark font-black">
              SEE YOU AT THE MARKET
            </h2>
            <p className="font-body text-body-md text-text-primary mt-1">
              Open Saturdays & Sundays, 9AM–5PM. Free entry, free parking.
            </p>
          </div>
          <Link
            href="/contact-us"
            className="bg-brand-dark text-white px-6 py-4 font-bold text-[13px] rounded-button whitespace-nowrap hover:bg-text-secondary transition-colors duration-500"
          >
            GET DIRECTIONS
          </Link>
        </div>
      </section>

      {/* Related events */}
      <section className="max-w-content mx-auto pb-16">
        <h2 className="font-display text-display-md uppercase tracking-wide font-semibold mb-6 px-6 md:px-20">
          MORE UPCOMING EVENTS
        </h2>
        {relatedEvents.length > 0 ? (
          relatedEvents.map((related, i) => {
            const img = related.featuredImage as { url?: string | null; alt?: string | null } | null
            return (
              <EventRow
                key={related.id}
                name={related.name}
                slug={related.slug}
                startDate={related.startDate}
                endDate={related.endDate}
                description={extractDescription(related.description)}
                location={related.location}
                featuredImage={img}
                highlight={i % 2 === 1}
              />
            )
          })
        ) : (
          <p className="text-text-secondary text-body-md py-12 text-center px-6 md:px-20">
            That was the last one on the calendar — check back soon for more.
          </p>
        )}
      </section>
    </PageLayout>
  )
}
