'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import type { BoothView, FloorPlanMode } from '@/lib/floorPlan/types'

/**
 * Shared tooltip for anything the cursor lands on inside the floor plan —
 * a rentable booth, a restroom, the info desk, etc.
 *
 * The component is content-agnostic: it takes a pre-composed
 * `{ eyebrow, title, subtitle?, cta? }` payload and positions itself
 * near the cursor. Callers decide the copy (see `descriptor()` below for
 * the booth & amenity mappings used by the floor plan).
 */
export type TooltipDescriptor = {
  eyebrow: string
  title: string
  subtitle?: string
  cta?: string
}

type Props = {
  descriptor: TooltipDescriptor
  x: number
  y: number
  /** Width of the SVG container in pixels — used to clamp tooltip horizontally. */
  containerWidth: number
  /** Height of the SVG container — used to flip tooltip above/below cursor. */
  containerHeight: number
}

/**
 * Visually matches the logo-boop tooltip pattern (yellow bg, dark text,
 * arrow triangle). Measures its own bounding rect on mount so we can
 * flip below the cursor when the hovered target sits too close to the
 * top of the container, and horizontally clamp so the bubble never
 * escapes the SVG.
 */
export function FloorPlanTooltip({
  descriptor,
  x,
  y,
  containerWidth: _containerWidth,
  containerHeight: _containerHeight,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  useLayoutEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDims({ w: rect.width, h: rect.height })
    }
  }, [descriptor.title, descriptor.subtitle, descriptor.cta])

  const measured = dims !== null

  const ARROW = 6
  const tooltipW = dims?.w ?? 0
  const tooltipH = dims?.h ?? 0

  const placeBelow = y < tooltipH + ARROW + 10
  const top = placeBelow ? y + ARROW : y - tooltipH - ARROW

  // Centre the tooltip on the cursor and DON'T clamp to the floor
  // plan's container — booths near the edges deserve a tooltip too,
  // and the parent card has no overflow-hidden in the tooltip's path
  // so it's fine for the bubble to extend past the card edges.
  const left = x - tooltipW / 2
  const arrowLeft = tooltipW / 2

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute z-40"
      style={{
        left: measured ? left : x,
        top: measured ? top : y,
        opacity: measured ? 1 : 0,
      }}
      role="tooltip"
    >
      {/* No animate-est-fade here: that keyframe bakes in
          `transform: translateX(-50%)` (designed for a tooltip
          positioned at `left: 50%`), which fought our pixel-perfect
          `left = x - tooltipW/2` math and shifted the visible bubble
          a full tooltip-width to the left of the cursor. The outer
          wrapper's `opacity: 0 → 1` after measurement is enough of a
          fade for our purposes. */}
      <div className="bg-brand-yellow text-brand-dark rounded-button px-3 py-2 shadow-lg min-w-[180px] max-w-[260px] relative">
        <div className="font-body text-body-sm leading-snug">
          {descriptor.eyebrow}
        </div>
        <div className="font-body font-bold text-body-sm leading-snug">
          {descriptor.title}
        </div>
        {descriptor.subtitle && (
          <div className="font-body text-caption text-text-secondary leading-snug mt-0.5">
            {descriptor.subtitle}
          </div>
        )}
        {descriptor.cta && (
          <div className="font-body text-caption font-semibold text-brand-mango mt-1">
            {descriptor.cta}
          </div>
        )}
        <div
          className="absolute w-2 h-2 bg-brand-yellow rotate-45"
          style={
            placeBelow
              ? { top: -4, left: arrowLeft - 4 }
              : { bottom: -4, left: arrowLeft - 4 }
          }
        />
      </div>
    </div>
  )
}

// Re-export under the old name for any existing call sites.
export const BoothTooltip = FloorPlanTooltip

/* ---------- descriptor factories ---------- */

// Keep this in sync with the `category` options in src/collections/Vendors.ts.
const CATEGORY_LABEL: Record<string, string> = {
  antiques: 'Antiques',
  collectibles: 'Collectibles',
  clothing: 'Clothing',
  food: 'Food & Beverages',
  'home-decor': 'Home Decor',
  jewelry: 'Jewelry',
  crafts: 'Arts & Crafts',
  electronics: 'Electronics',
  books: 'Books & Media',
  'health-beauty': 'Health & Beauty',
  sports: 'Sports',
  toys: 'Toys & Games',
  retail: 'Retail',
  services: 'Services',
  other: 'Market Vendor',
}

export function describeBooth(
  booth: BoothView,
  mode: FloorPlanMode,
): TooltipDescriptor {
  const eyebrow = `Booth ${booth.number}`
  switch (booth.status) {
    case 'rented': {
      // On the merchant-application page the visitor is shopping for an
      // open booth, so naming the current renter is noise (and slightly
      // off-brand — vendor info isn't the point on this page). Show
      // "Booth Unavailable" instead so the rented mass reads as
      // "context, not target" alongside its dimmed fill.
      if (mode === 'become-a-vendor') {
        return {
          eyebrow,
          title: 'Booth Unavailable',
          subtitle: 'Already rented',
        }
      }
      if (!booth.vendor) return { eyebrow, title: 'Rented' }
      const cats = booth.vendor.category ?? []
      const primary = cats[0] ? CATEGORY_LABEL[cats[0]] ?? cats[0] : undefined
      return {
        eyebrow,
        title: booth.vendor.name,
        subtitle: primary,
        cta:
          mode === 'homepage'
            ? 'View vendor →'
            : mode === 'vendors'
              ? 'Jump to profile →'
              : undefined,
      }
    }
    case 'available':
      return {
        eyebrow,
        title: 'Available',
        subtitle: 'Ready to rent',
        cta: mode === 'become-a-vendor' ? 'Apply now →' : undefined,
      }
    case 'reserved':
      return { eyebrow, title: 'Reserved', subtitle: 'Vendor moving in' }
    case 'blocked':
      return { eyebrow, title: 'Unavailable' }
  }
}

/** Amenity ids emitted by scripts/brand-floor-plan.mjs as `data-amenity`. */
export type AmenityKind =
  | 'mens-restroom'
  | 'womens-restroom'
  | 'info-desk'
  | 'concession'
  | 'atm'

export function describeAmenity(kind: AmenityKind): TooltipDescriptor {
  switch (kind) {
    case 'mens-restroom':
      return { eyebrow: 'Amenity', title: "Men's Restroom" }
    case 'womens-restroom':
      return { eyebrow: 'Amenity', title: "Women's Restroom" }
    case 'info-desk':
      return {
        eyebrow: 'Amenity',
        title: 'Information Desk',
        subtitle: 'Stop by for help finding vendors or events.',
      }
    case 'concession':
      return {
        eyebrow: 'Amenity',
        title: 'Concession',
        subtitle: 'Grab-and-go market snacks.',
      }
    case 'atm':
      return {
        eyebrow: 'Amenity',
        title: 'ATM',
        subtitle: 'Cash machine.',
      }
  }
}
