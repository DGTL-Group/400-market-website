'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  /** Called (debounced) with the trimmed search string. Empty string = no filter. */
  onQueryChange: (q: string) => void
  /** How many booths currently match. null = no active filter. */
  matchCount: number | null
}

/**
 * Lightweight search input above the floor plan. Matches vendor name,
 * category name, or booth number (all case-insensitive substring).
 *
 * Debounced at 150ms so typing doesn't fire a render storm — the
 * floor-plan highlight recomputes in-place without ever re-injecting
 * the SVG markup.
 */
export function FloorPlanSearch({ onQueryChange, matchCount }: Props) {
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onQueryChange(value.trim()), 150)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, onQueryChange])

  return (
    <div className="relative w-full max-w-md mx-auto mb-4">
      <label htmlFor="fp-search" className="sr-only">
        Search vendors, categories, or booth numbers
      </label>
      <div className="relative flex items-center">
        <svg
          className="absolute left-3 w-4 h-4 text-text-subtle pointer-events-none"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M14 14l4 4" strokeLinecap="round" />
        </svg>
        <input
          id="fp-search"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search a vendor, category, or booth number…"
          className="w-full pl-9 pr-24 py-2.5 rounded-button border border-surface-light bg-white text-body-sm font-body text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-colors"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            className="absolute right-3 text-caption font-body font-semibold text-text-secondary hover:text-brand-mango transition-colors"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>
      {/* Live region — polite so it doesn't interrupt typing */}
      <div
        className="mt-1 text-caption text-text-subtle h-4"
        aria-live="polite"
      >
        {matchCount !== null &&
          (matchCount === 0
            ? 'No matches.'
            : `${matchCount} match${matchCount === 1 ? '' : 'es'}`)}
      </div>
    </div>
  )
}
