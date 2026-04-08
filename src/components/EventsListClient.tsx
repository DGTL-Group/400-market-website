'use client'

import { useMemo, useRef, useState } from 'react'
import EventRow from '@/components/EventRow'

/**
 * Serialized shape the server hands us. We deliberately keep this narrow
 * (no Payload internals, no Date objects) so the props payload stays small
 * and the boundary is easy to reason about.
 */
export type ClientEvent = {
  id: number | string
  name: string
  slug: string
  startDate: string
  endDate: string | null
  description: string
  location: string | null
  featuredImage: { url: string | null; alt: string | null } | null
}

type Props = {
  events: ClientEvent[]
  initialView: string
  initialPage: number
  /**
   * ISO timestamp captured by the server at request time. We use this for
   * "now" instead of `new Date()` so the SSR pass and the first client
   * render produce identical filtered output (no hydration mismatch).
   */
  serverNow: string
}

const FILTERS = [
  { label: 'Upcoming', value: '' },
  { label: 'This Month', value: 'month' },
  { label: 'Past', value: 'past' },
]

const PER_PAGE = 8

/**
 * First instant of the month AFTER the given date, in America/Toronto,
 * returned as a UTC Date so direct comparisons against ISO event dates
 * work correctly. Used as the exclusive upper bound for "This Month".
 */
function endOfTorontoMonth(d: Date): Date {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
  })
  const parts = fmt.formatToParts(d)
  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  return new Date(Date.UTC(year, month, 1, 5, 0, 0))
}

export default function EventsListClient({
  events,
  initialView,
  initialPage,
  serverNow,
}: Props) {
  const [view, setView] = useState(initialView)
  const [page, setPage] = useState(initialPage)
  const listTopRef = useRef<HTMLElement>(null)

  // `now` must be stable across renders to avoid hydration mismatches and
  // to keep the filter results deterministic during a single session.
  const now = useMemo(() => new Date(serverNow), [serverNow])

  // All filtering happens here in JS — no network round-trip on filter
  // change. The full event list is in memory because the server hands it
  // to us once on initial load.
  //
  // Design rule: past events ONLY appear under the "Past" filter. Every
  // other view hides them, so "Upcoming" and "This Month" never mix old
  // events into the list.
  const filtered = useMemo<ClientEvent[]>(() => {
    if (view === 'past') {
      return [...events]
        .filter((e) => new Date(e.startDate) < now)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    }
    if (view === 'month') {
      // Future events whose start falls before the first instant of next
      // month — i.e. the rest of this month, starting from right now.
      const end = endOfTorontoMonth(now)
      return events
        .filter((e) => {
          const d = new Date(e.startDate)
          return d >= now && d < end
        })
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    }
    // Default: upcoming (everything from now onwards, ascending)
    return events
      .filter((e) => new Date(e.startDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }, [events, view, now])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  // Clamp the requested page so a stale URL like ?page=99 still renders
  // something sensible after a filter change shrinks the list.
  const safePage = Math.min(Math.max(1, page), totalPages)
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  /**
   * Update the URL in-place (without triggering a Next.js navigation) so
   * the page is shareable / refreshable but the server doesn't re-render.
   * `replaceState` keeps the back button history clean — filter clicks
   * don't pollute browser history with intermediate states.
   */
  function syncURL(nextView: string, nextPage: number) {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (nextView) url.searchParams.set('view', nextView)
    else url.searchParams.delete('view')
    if (nextPage > 1) url.searchParams.set('page', String(nextPage))
    else url.searchParams.delete('page')
    window.history.replaceState(null, '', url.toString())
  }

  function handleFilterClick(nextView: string) {
    if (nextView === view) return
    setView(nextView)
    setPage(1)
    syncURL(nextView, 1)
  }

  function handlePageClick(nextPage: number) {
    if (nextPage === safePage) return
    setPage(nextPage)
    syncURL(view, nextPage)
    // Scroll back up to the first row so the player doesn't have to hunt
    // for the new content. `start` aligns the top of the list with the
    // top of the viewport.
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* Filter tab bar */}
      <div className="bg-surface-light/60">
        <div className="max-w-content mx-auto px-6 md:px-20 py-4 flex flex-wrap items-center gap-3">
          {FILTERS.map((f) => (
            <button
              key={f.value || 'upcoming'}
              type="button"
              onClick={() => handleFilterClick(f.value)}
              className={`px-5 py-2.5 rounded-button text-[13px] font-bold uppercase tracking-wide transition-colors duration-500 ${
                view === f.value
                  ? 'bg-brand-yellow text-brand-dark'
                  : 'bg-white text-text-secondary hover:bg-brand-yellow/30 hover:text-brand-dark'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event rows.
          - The OUTER <section> stays mounted for stable scrollIntoView().
          - The INNER div is keyed by view+page so React unmounts it and
            mounts a fresh node on every filter / page change. Because the
            new node enters the DOM with `animate-list-swap` already on it,
            the keyframe runs from frame 1 — no useEffect timing games. */}
      <section ref={listTopRef} className="max-w-content mx-auto">
        <div key={`${view}-${safePage}`} className="animate-list-swap">
          {pageItems.length === 0 ? (
            <p className="text-text-secondary text-body-md py-20 text-center">
              No events found for this view.
            </p>
          ) : (
            pageItems.map((event, i) => (
              <EventRow
                key={event.id}
                name={event.name}
                slug={event.slug}
                startDate={event.startDate}
                endDate={event.endDate}
                description={event.description}
                location={event.location}
                featuredImage={event.featuredImage}
                featured={view !== 'past' && i === 0 && safePage === 1}
                highlight={i % 2 === 1}
              />
            ))
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 py-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageClick(p)}
                  className={`px-4 py-2 rounded-button text-body-sm font-semibold transition-colors duration-500 ${
                    p === safePage
                      ? 'bg-brand-yellow text-brand-dark'
                      : 'bg-surface-light text-text-secondary hover:bg-brand-yellow/20'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
