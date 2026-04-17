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
  containerWidth,
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

  const PAD = 10
  const ARROW = 6
  const tooltipW = dims?.w ?? 0
  const tooltipH = dims?.h ?? 0

  const placeBelow = y < tooltipH + ARROW + PAD
  const top = placeBelow ? y + ARROW : y - tooltipH - ARROW

  let left = x - tooltipW / 2
  if (containerWidth > 0) {
    left = Math.max(PAD, Math.min(left, containerWidth - tooltipW - PAD))
  }
  const arrowLeft = Math.max(8, Math.min(x - left, tooltipW - 8))

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
      <div className="animate-est-fade bg-brand-yellow text-brand-dark rounded-button px-3 py-2 shadow-lg min-w-[180px] max-w-[260px] relative">
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
  }
}
