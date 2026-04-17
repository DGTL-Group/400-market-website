'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BoothView, FloorPlanMode } from '@/lib/floorPlan/types'

type Props = {
  mode: FloorPlanMode
  booths: BoothView[]
}

/**
 * Mobile fallback for the floor plan.
 *
 * Rationale: a 400-booth SVG on a 375px-wide screen produces ~8×8px touch
 * targets — unusable. Pinch-zoom works but is awkward on Safari for large
 * SVGs. Instead, mobile users see a list of sections (grouped by cluster
 * ID) showing how many booths are in each status. Tapping a section
 * expands it into individual booth buttons.
 *
 * Doubles as the accessibility path — SVG with <title>s is still a
 * second-class screen-reader experience; a proper DOM list isn't.
 */
export function FloorPlanMobileList({ mode, booths }: Props) {
  const router = useRouter()
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null)

  // Group booths by cluster ID. Render order preserves the order in which
  // booths appeared in the source data — usually a reasonable traversal
  // (perimeter clockwise, interior by number).
  const grouped = useMemo(() => {
    const map = new Map<string, BoothView[]>()
    for (const b of booths) {
      if (b.status === 'blocked') continue
      const existing = map.get((b.cluster ?? 'other')) ?? []
      existing.push(b)
      map.set((b.cluster ?? 'other'), existing)
    }
    return map
  }, [booths])

  if (booths.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="font-body text-body-md text-text-secondary">
          Floor plan coming soon.
        </p>
      </div>
    )
  }

  const handleClickBooth = (b: BoothView) => {
    if (b.status === 'rented' && b.vendor) {
      if (mode === 'homepage') {
        router.push(`/vendors/${b.vendor.slug}`)
      } else if (mode === 'vendors') {
        const el = document.getElementById(b.vendor.slug)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }
    if (b.status === 'available' && mode === 'become-a-vendor') {
      const url = new URL(window.location.href)
      url.searchParams.set('booth', b.number)
      window.history.replaceState({}, '', url.toString())
      const form = document.getElementById('merchant-application-form')
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.dispatchEvent(
        new CustomEvent('floorPlan:boothSelected', { detail: { number: b.number } }),
      )
    }
  }

  return (
    <div className="divide-y divide-surface-light">
      {Array.from(grouped.entries()).map(([clusterId, clusterBooths]) => {
        const available = clusterBooths.filter((b) => b.status === 'available').length
        const rented = clusterBooths.filter((b) => b.status === 'rented').length
        const reserved = clusterBooths.filter((b) => b.status === 'reserved').length
        const isOpen = expandedCluster === clusterId

        // Human-friendly cluster title: strip 'cluster-' prefix if present.
        const title = clusterId.replace(/^cluster-/, '').toUpperCase()

        return (
          <div key={clusterId}>
            <button
              type="button"
              onClick={() => setExpandedCluster(isOpen ? null : clusterId)}
              className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-surface-light/60 transition-colors duration-200"
              aria-expanded={isOpen}
            >
              <div>
                <div className="font-display text-body-md uppercase tracking-wider text-brand-dark">
                  Section {title}
                </div>
                <div className="font-body text-caption text-text-secondary mt-0.5">
                  {available > 0 && (
                    <span className="text-brand-mango font-semibold">{available} available</span>
                  )}
                  {available > 0 && (rented > 0 || reserved > 0) && <span> · </span>}
                  {rented > 0 && <span>{rented} rented</span>}
                  {rented > 0 && reserved > 0 && <span> · </span>}
                  {reserved > 0 && <span>{reserved} reserved</span>}
                </div>
              </div>
              <span
                className={`text-text-secondary transition-transform duration-200 ${
                  isOpen ? 'rotate-90' : ''
                }`}
                aria-hidden
              >
                ›
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {clusterBooths.map((b) => (
                  <button
                    type="button"
                    key={b.number}
                    onClick={() => handleClickBooth(b)}
                    disabled={b.status === 'reserved'}
                    className={`
                      py-2 px-2 rounded-button border text-center transition-colors duration-200
                      ${boothButtonClasses(b, mode)}
                    `}
                  >
                    <div className="font-display text-caption uppercase tracking-wider leading-none">
                      {b.number}
                    </div>
                    <div className="font-body text-[10px] text-text-secondary leading-none mt-1">
                      {b.status === 'rented'
                        ? b.vendor?.name ?? 'Rented'
                        : b.status === 'available'
                        ? 'Open'
                        : 'Reserved'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function boothButtonClasses(b: BoothView, mode: FloorPlanMode): string {
  if (b.status === 'available') {
    return mode === 'become-a-vendor'
      ? 'bg-brand-yellow border-brand-dark text-brand-dark hover:bg-brand-orange'
      : 'bg-brand-yellow/40 border-surface-light text-brand-dark'
  }
  if (b.status === 'rented') {
    return 'bg-white border-surface-light text-brand-dark hover:border-brand-mango'
  }
  // reserved
  return 'bg-brand-orange/30 border-brand-orange/60 text-brand-dark cursor-not-allowed opacity-70'
}
