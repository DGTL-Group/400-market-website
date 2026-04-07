'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import NewsCard from '@/components/NewsCard'
import { withViewTransition } from '@/lib/viewTransition'

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

const TAGS = [
  { label: 'All', value: '' },
  { label: 'Filter 1', value: 'filter1' },
  { label: 'Filter 2', value: 'filter2' },
  { label: 'Filter 3', value: 'filter3' },
  { label: 'Filter 4', value: 'filter4' },
  { label: 'Filter 5', value: 'filter5' },
]

const PER_PAGE = 9

export default function NewsListClient({ posts, initialTag, initialPage }: Props) {
  const [tag, setTag] = useState(initialTag)
  const [page, setPage] = useState(initialPage)
  const listTopRef = useRef<HTMLDivElement>(null)
  // Skip the animation on first paint — we only want it firing on user
  // interaction, not on initial mount.
  const isFirstRender = useRef(true)

  // Tag filtering happens entirely client-side. The server hands us every
  // post in one go on initial load, so swapping tags is instant — no
  // server round trip and no grid pop-in.
  const filtered = useMemo<ClientNewsPost[]>(() => {
    if (!tag) return posts
    return posts.filter((p) => p.tags.includes(tag))
  }, [posts, tag])

  // Re-trigger the swap animation every time the filter or page changes.
  // The remove + force reflow + add trick is the standard way to replay a
  // CSS animation — without the reflow, re-adding the same class is a no-op.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const el = listTopRef.current
    if (!el) return
    el.classList.remove('animate-list-swap')
    void el.offsetWidth
    el.classList.add('animate-list-swap')
  }, [tag, page])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  // Clamp the requested page so a stale URL like ?page=99 still renders
  // something sensible after a tag change shrinks the list.
  const safePage = Math.min(Math.max(1, page), totalPages)
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

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
    withViewTransition(() => {
      setTag(nextTag)
      setPage(1)
    })
    syncURL(nextTag, 1)
  }

  function handlePageClick(nextPage: number) {
    if (nextPage === safePage) return
    withViewTransition(() => {
      setPage(nextPage)
    })
    syncURL(tag, nextPage)
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* Tag filter bar */}
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

      <div ref={listTopRef}>
        {pageItems.length === 0 ? (
          <p
            className="text-text-secondary text-body-md py-12 text-center"
            style={{ viewTransitionName: 'news-empty-state' }}
          >
            No posts found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((post) => (
              // Wrapper div carries the view-transition-name so the browser
              // can morph the same card across tag / page changes. Each
              // name must be unique on the page at any moment.
              <div key={post.id} style={{ viewTransitionName: `news-${post.id}` }}>
                <NewsCard
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
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
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
    </>
  )
}
