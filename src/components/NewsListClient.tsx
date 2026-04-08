'use client'

import { useMemo, useRef, useState } from 'react'
import NewsCard from '@/components/NewsCard'

/**
 * Serialized news post shape sent from the server. Kept narrow on purpose
 * — Payload-internal fields, draft state, etc. don't belong on the wire.
 */
export type ClientNewsPost = {
  id: number | string
  title: string
  slug: string
  excerpt: string | null
  publishDate: string
  tags: string[]
  featuredImage: { url: string | null; alt: string | null } | null
}

type Props = {
  posts: ClientNewsPost[]
  initialTag: string
  initialPage: number
}

/**
 * Frozen snapshot of everything the grid+pagination renderer needs. We
 * keep two of these in state — one for the currently shown grid and one
 * for the grid that's currently fading out — so the OUT and IN keyframes
 * can run simultaneously on different DOM trees.
 */
type GridSnapshot = {
  key: string
  items: ClientNewsPost[]
  safePage: number
  totalPages: number
}

const TAGS = [
  { label: 'All', value: '' },
  { label: 'Filter 1', value: 'filter1' },
  { label: 'Filter 2', value: 'filter2' },
  { label: 'Filter 3', value: 'filter3' },
  { label: 'Filter 4', value: 'filter4' },
  { label: 'Filter 5', value: 'filter5' },
]

const PER_PAGE = 9

/**
 * Pure projection from a snapshot to the grid + pagination JSX. Lives
 * outside the component so we can render the same shape twice — once for
 * the current frame and once for the exiting overlay — without
 * duplicating any markup.
 */
function renderNewsGrid(snapshot: GridSnapshot, handlePageClick: (p: number) => void) {
  return (
    <>
      {snapshot.items.length === 0 ? (
        <p className="text-text-secondary text-body-md py-12 text-center">
          No posts found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {snapshot.items.map((post) => (
            <NewsCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt ?? undefined}
              featuredImage={
                post.featuredImage
                  ? {
                      url: post.featuredImage.url ?? undefined,
                      alt: post.featuredImage.alt ?? undefined,
                    }
                  : undefined
              }
              publishDate={post.publishDate}
            />
          ))}
        </div>
      )}

      {snapshot.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
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

export default function NewsListClient({ posts, initialTag, initialPage }: Props) {
  const [tag, setTag] = useState(initialTag)
  const [page, setPage] = useState(initialPage)
  const listTopRef = useRef<HTMLDivElement>(null)

  // Tag filtering happens entirely client-side. The server hands us every
  // post in one go on initial load, so swapping tags is instant — no
  // server round trip and no grid pop-in.
  const filtered = useMemo<ClientNewsPost[]>(() => {
    if (!tag) return posts
    return posts.filter((p) => p.tags.includes(tag))
  }, [posts, tag])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  // Clamp the requested page so a stale URL like ?page=99 still renders
  // something sensible after a tag change shrinks the list.
  const safePage = Math.min(Math.max(1, page), totalPages)
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  // Sequenced transition state. `shown` is the snapshot mounted while
  // the IN keyframe plays; `exiting` is the snapshot mounted while the
  // OUT keyframe plays. The render logic renders only ONE at a time
  // (ternary, not both siblings) so the old grid fades out completely
  // before the new grid starts fading in — no visual overlap. The
  // derived-state `if` block captures the previous frame the moment the
  // user changes tags or pages.
  const currentKey = `${tag}-${safePage}`
  const [shown, setShown] = useState<GridSnapshot>({
    key: currentKey,
    items: pageItems,
    safePage,
    totalPages,
  })
  const [exiting, setExiting] = useState<GridSnapshot | null>(null)

  if (shown.key !== currentKey) {
    setExiting(shown)
    setShown({ key: currentKey, items: pageItems, safePage, totalPages })
  }

  /**
   * Update the URL in-place (without triggering a Next.js navigation) so
   * the page is shareable / refreshable but the server doesn't re-render.
   */
  function syncURL(nextTag: string, nextPage: number) {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (nextTag) url.searchParams.set('tag', nextTag)
    else url.searchParams.delete('tag')
    if (nextPage > 1) url.searchParams.set('page', String(nextPage))
    else url.searchParams.delete('page')
    window.history.replaceState(null, '', url.toString())
  }

  function handleTagClick(nextTag: string) {
    if (nextTag === tag) return
    setTag(nextTag)
    setPage(1)
    syncURL(nextTag, 1)
  }

  function handlePageClick(nextPage: number) {
    if (nextPage === safePage) return
    setPage(nextPage)
    syncURL(tag, nextPage)
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* Tag filter bar — buttons track the LIVE tag so the active
          highlight flips immediately on click, even while the grid
          below is still mid-transition. */}
      <div className="mb-8 flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <button
            key={t.value || 'all'}
            type="button"
            onClick={() => handleTagClick(t.value)}
            className={`px-4 py-2 rounded-button text-body-sm font-semibold transition-colors duration-500 ${
              tag === t.value
                ? 'bg-brand-yellow text-brand-dark'
                : 'bg-surface-light text-text-secondary hover:bg-brand-yellow/20 hover:text-brand-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Outer ref div stays mounted for stable scrollIntoView. The
          ternary sequences the transition: while `exiting` is set we
          render ONLY the outgoing snapshot running the OUT keyframe;
          when `onAnimationEnd` clears it we render ONLY the new snapshot
          with the IN keyframe. One frame at a time, no overlap. */}
      <div ref={listTopRef}>
        {exiting ? (
          <div
            key={`exit-${exiting.key}`}
            className="animate-list-swap-out"
            onAnimationEnd={(e) => {
              // animationend bubbles. Any child card with its own CSS
              // animation (e.g. image fade-in on mount) would otherwise
              // fire animationend on frame 0 and prematurely clear
              // `exiting`, skipping the grid OUT animation entirely.
              // Only react to this wrapper's own animation.
              if (e.target !== e.currentTarget) return
              if (e.animationName !== 'list-swap-out') return
              setExiting(null)
            }}
          >
            {renderNewsGrid(exiting, handlePageClick)}
          </div>
        ) : (
          <div key={`enter-${shown.key}`} className="animate-list-swap">
            {renderNewsGrid(shown, handlePageClick)}
          </div>
        )}
      </div>
    </>
  )
}
