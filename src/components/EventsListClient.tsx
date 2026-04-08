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
  // ISO string. The server captures `now` once and passes it down so SSR
  // and the first client render agree on which events count as upcoming.
  serverNow: string
}

/**
 * Frozen snapshot of everything the row+pagination renderer needs. We
 * keep two of these in state — one for what's currently shown, one for
 * what's currently fading out — so the OUT and IN keyframes can run
 * simultaneously on different DOM trees.
 */
type ListSnapshot = {
  key: string
  items: ClientEvent[]
  view: string
  safePage: number
  totalPages: number
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

/**
 * Pure projection from a snapshot to the rows + pagination JSX. Lives
 * outside the component so we can render the same shape twice — once for
 * the current frame and once for the exiting overlay — without
 * duplicating any markup. Each call closes over the snapshot's frozen
 * data, so the exiting overlay keeps showing the OLD list while the new
 * one fades in underneath.
 */
function renderEventRows(snapshot: ListSnapshot, handlePageClick: (p: number) => void) {
  return (
    <>
      {snapshot.items.length === 0 ? (
        <p className="text-text-secondary text-body-md py-20 text-center">
          No events found for this view.
        </p>
      ) : (
        snapshot.items.map((event, i) => (
          <EventRow
            key={event.id}
            name={event.name}
            slug={event.slug}
            startDate={event.startDate}
            endDate={event.endDate}
            description={event.description}
            location={event.location}
            featuredImage={event.featuredImage}
            featured={snapshot.view !== 'past' && i === 0 && snapshot.safePage === 1}
            highlight={i % 2 === 1}
          />
        ))
      )}

      {snapshot.totalPages > 1 && (
        <div className="flex justify-center gap-2 py-12">
          {Array.from({ length: snapshot.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePageClick(p)}
              className={`px-4 py-2 rounded-button text-body-sm font-semibold transition-colors duration-500 ${
                p === snapshot.safePage
                  ? 'bg-brand-yellow text-brand-dark'
                  : 'bg-surface-light text-text-secondary hover:bg-brand-yellow/20'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </>
  )
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

  // Sequenced transition state. `shown` is the snapshot mounted while
  // the IN keyframe plays; `exiting` is the snapshot mounted while the
  // OUT keyframe plays. The render logic renders only ONE at a time
  // (ternary, not both siblings) so the old list fades out completely
  // before the new list starts fading in — no visual overlap. When the
  // live view/page combination produces a new key, we capture the
  // current `shown` into `exiting` and replace `shown` with a fresh
  // snapshot of the new state via the standard React derived-state
  // pattern (the `if` guard prevents looping).
  const currentKey = `${view}-${safePage}`
  const [shown, setShown] = useState<ListSnapshot>({
    key: currentKey,
    items: pageItems,
    view,
    safePage,
    totalPages,
  })
  const [exiting, setExiting] = useState<ListSnapshot | null>(null)

  if (shown.key !== currentKey) {
    setExiting(shown)
    setShown({ key: currentKey, items: pageItems, view, safePage, totalPages })
  }

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
      {/* Filter tab bar — buttons reflect the LIVE `view` so the active
          highlight flips immediately on click, even while the row area
          is still mid-transition. */}
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
          - The ternary sequences the transition: while `exiting` is set
            we render ONLY the outgoing snapshot running the OUT keyframe;
            when `onAnimationEnd` clears it we render ONLY the new
            snapshot with the IN keyframe. One frame at a time, no
            overlap, no double-exposure ghosting. */}
      <section ref={listTopRef} className="max-w-content mx-auto">
        {exiting ? (
          <div
            key={`exit-${exiting.key}`}
            className="animate-list-swap-out"
            onAnimationEnd={(e) => {
              // animationend bubbles. Any child row with its own CSS
              // animation (e.g. image fade-in on mount) would otherwise
              // fire animationend on frame 0 and prematurely clear
              // `exiting`, skipping the list OUT animation entirely.
              // Only react to this wrapper's own animation.
              if (e.target !== e.currentTarget) return
              if (e.animationName !== 'list-swap-out') return
              setExiting(null)
            }}
          >
            {renderEventRows(exiting, handlePageClick)}
          </div>
        ) : (
          <div key={`enter-${shown.key}`} className="animate-list-swap">
            {renderEventRows(shown, handlePageClick)}
          </div>
        )}
      </section>
    </>
  )
}
