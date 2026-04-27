'use client'

import type { FloorPlanMode } from '@/lib/floorPlan/types'

export type LegendKey =
  | 'rented'
  | 'available'
  | 'reserved'
  | 'atm'
  | 'mens-restroom'
  | 'womens-restroom'
  | 'info-desk'
  | 'food-court'

type Props = {
  /** Currently-pinned legend row (highlight matching elements). null = none. */
  active: LegendKey | null
  /** Click handler — pass the same key to clear. */
  onToggle: (key: LegendKey | null) => void
  /**
   * The page mode — drives the legend's rented/available swatch colours.
   * On become-a-vendor the map flips (available = yellow, rented = white)
   * so the legend has to flip with it or the swatches lie.
   */
  mode: FloorPlanMode
}

type Item = {
  key: LegendKey
  label: string
  swatch: 'yellow' | 'white' | 'orange' | 'gray-restroom' | 'dark' | 'green' | 'food-zone'
}

const PUBLIC_ITEMS: Item[] = [
  { key: 'rented', label: 'Rented booth', swatch: 'yellow' },
  { key: 'available', label: 'Available booth', swatch: 'white' },
  { key: 'reserved', label: 'Reserved', swatch: 'orange' },
  { key: 'food-court', label: 'Food court', swatch: 'food-zone' },
  { key: 'mens-restroom', label: "Men's restroom", swatch: 'gray-restroom' },
  { key: 'womens-restroom', label: "Women's restroom", swatch: 'gray-restroom' },
  { key: 'info-desk', label: 'Information desk', swatch: 'dark' },
  { key: 'atm', label: 'ATM', swatch: 'green' },
]

// Become-a-vendor flips rented + available so the swatch matches what's
// on the map. "Available" leads the list because that's what the visitor
// is hunting for.
const BECOME_A_VENDOR_ITEMS: Item[] = [
  { key: 'available', label: 'Available booth', swatch: 'yellow' },
  { key: 'rented', label: 'Rented booth', swatch: 'white' },
  { key: 'reserved', label: 'Reserved', swatch: 'orange' },
  { key: 'food-court', label: 'Food court', swatch: 'food-zone' },
  { key: 'mens-restroom', label: "Men's restroom", swatch: 'gray-restroom' },
  { key: 'womens-restroom', label: "Women's restroom", swatch: 'gray-restroom' },
  { key: 'info-desk', label: 'Information desk', swatch: 'dark' },
  { key: 'atm', label: 'ATM', swatch: 'green' },
]

const SWATCH_STYLE: Record<Item['swatch'], string> = {
  yellow: 'bg-brand-yellow border-brand-dark',
  white: 'bg-white border-brand-dark',
  orange: 'bg-brand-orange border-brand-dark',
  'gray-restroom': 'bg-[#E6E6E6] border-brand-dark',
  dark: 'bg-brand-dark border-brand-yellow',
  green: 'bg-[#1F6B3B] border-[#0C3B1E]',
  'food-zone': 'bg-white border-brand-mango border-dashed',
}

/**
 * Map key / legend sidebar. Each row is a clickable pill that pins
 * the matching elements on the floor plan: booths turn bright and
 * everything else dims. Click the same row again (or anywhere blank)
 * to clear the highlight. Search and legend are mutually exclusive —
 * triggering one clears the other.
 */
export function FloorPlanLegend({ active, onToggle, mode }: Props) {
  const items =
    mode === 'become-a-vendor' ? BECOME_A_VENDOR_ITEMS : PUBLIC_ITEMS
  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
      {items.map((item) => {
        const isActive = active === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle(isActive ? null : item.key)}
            aria-pressed={isActive}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-button border text-caption font-body font-semibold transition-colors duration-200 ${
              isActive
                ? 'bg-brand-dark text-white border-brand-dark'
                : 'bg-white text-text-secondary border-surface-light hover:border-brand-mango hover:text-brand-dark'
            }`}
          >
            <span
              aria-hidden
              className={`inline-block w-4 h-4 rounded-sm border ${SWATCH_STYLE[item.swatch]}`}
            />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
