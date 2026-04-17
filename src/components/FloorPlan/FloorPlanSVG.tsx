'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import type { BoothStatus, BoothView, FloorPlanMode } from '@/lib/floorPlan/types'
import {
  FloorPlanTooltip,
  describeAmenity,
  describeBooth,
  type AmenityKind,
  type TooltipDescriptor,
} from './BoothTooltip'

type Props = {
  mode: FloorPlanMode
  /** Inline SVG string — read server-side from public/images/floor-plan.svg. */
  svgMarkup: string
  booths: BoothView[]
}

/**
 * Interactive floor plan.
 *
 * The SVG itself (public/images/floor-plan.svg) is the visual layer —
 * every rentable booth rect carries `data-booth="NNNN"` (added by
 * scripts/brand-floor-plan.mjs). After it mounts we do three things:
 *
 *   1. Stamp `data-status` on every booth rect so the embedded CSS can
 *      fill it correctly for `available` / `rented` / `reserved`.
 *   2. Delegate pointer + click events on the wrapper div — saving 400+
 *      individual React listeners while still giving us per-booth behavior.
 *   3. Render a DOM tooltip outside the SVG so it isn't clipped by the
 *      container's rounded-button overflow-hidden.
 */
export function FloorPlanSVG({ mode, svgMarkup, booths }: Props) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)

  /** What the cursor is currently over — either a booth, an amenity,
   *  or nothing. Unified into one state so only one tooltip renders. */
  const [hoveredDescriptor, setHoveredDescriptor] =
    useState<TooltipDescriptor | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [svgBounds, setSvgBounds] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  /** booth number → view */
  const boothMap = useMemo(() => {
    const m = new Map<string, BoothView>()
    for (const b of booths) m.set(b.number, b)
    return m
  }, [booths])

  /** vendor id → booth numbers the vendor occupies (for the multi-booth dot) */
  const vendorBoothMap = useMemo(() => {
    const m = new Map<string | number, string[]>()
    for (const b of booths) {
      if (b.vendor) {
        const list = m.get(b.vendor.id) ?? []
        list.push(b.number)
        m.set(b.vendor.id, list)
      }
    }
    return m
  }, [booths])

  /**
   * Sync per-rect attributes after mount and whenever state changes.
   * - `data-status` drives fill via the embedded stylesheet.
   * - `tabindex` makes rentable booths focusable for keyboard users.
   * - `aria-label` gives screen readers a useful description.
   * - `.fp-mode-*` on the root SVG switches cursor behaviour by page.
   */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const svg = container.querySelector('svg')
    if (!svg) return

    svg.classList.remove('fp-mode-homepage', 'fp-mode-vendors', 'fp-mode-become-a-vendor')
    svg.classList.add(`fp-mode-${mode}`)

    const rects = svg.querySelectorAll<SVGRectElement>('rect[data-booth]')
    rects.forEach((rect) => {
      const number = rect.getAttribute('data-booth') ?? ''
      const booth = boothMap.get(number)
      const status: BoothStatus = booth?.status ?? 'available'
      rect.setAttribute('data-status', status)

      const clickable = isClickable(status, mode)
      rect.setAttribute('tabindex', clickable ? '0' : '-1')
      rect.setAttribute('aria-label', ariaLabelFor(number, booth, mode))
      rect.setAttribute('role', clickable ? 'button' : 'img')
    })

    // Draw the multi-booth vendor dots (same concept as the prior overlay).
    // Scrub any previous dots first so re-renders don't stack.
    svg.querySelectorAll('[data-fp-dot]').forEach((d) => d.remove())
    const dotLayer = ensureDotLayer(svg)

    booths.forEach((b) => {
      if (!b.vendor || b.status !== 'rented') return
      const sibCount = vendorBoothMap.get(b.vendor.id)?.length ?? 0
      if (sibCount < 2) return
      const rect = svg.querySelector<SVGRectElement>(`rect[data-booth="${b.number}"]`)
      if (!rect) return
      const bbox = rect.getBBox()
      const cx = bbox.x + bbox.width - 4
      const cy = bbox.y + 4
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      dot.setAttribute('cx', String(cx))
      dot.setAttribute('cy', String(cy))
      dot.setAttribute('r', '3.5')
      dot.setAttribute('fill', `hsl(${vendorHue(b.vendor.id)} 60% 45%)`)
      dot.setAttribute('stroke', 'white')
      dot.setAttribute('stroke-width', '0.8')
      dot.setAttribute('pointer-events', 'none')
      dot.setAttribute('data-fp-dot', '1')
      dotLayer.appendChild(dot)
    })
  }, [boothMap, booths, mode, vendorBoothMap])

  /**
   * Walk up from the event target looking for either a booth rect
   * (`data-booth`) or an amenity (`data-amenity`). Walking the parent
   * chain matters for the restrooms: Women-Restroom is a <path> inside
   * a <g> — if the cursor lands on something nested the hit target
   * might be the child, not the amenity-bearing element.
   */
  const getHoverTargetFromEvent = useCallback(
    (
      target: EventTarget | null,
    ):
      | { kind: 'booth'; booth: BoothView }
      | { kind: 'amenity'; amenity: AmenityKind }
      | null => {
      if (!target || !(target instanceof Element)) return null
      let el: Element | null = target
      while (el && el instanceof SVGElement) {
        const boothNum = el.getAttribute('data-booth')
        if (boothNum) {
          const booth = boothMap.get(boothNum)
          return booth ? { kind: 'booth', booth } : null
        }
        const amenity = el.getAttribute('data-amenity')
        if (amenity) {
          return { kind: 'amenity', amenity: amenity as AmenityKind }
        }
        el = el.parentElement
      }
      return null
    },
    [boothMap],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const hit = getHoverTargetFromEvent(e.target)
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()

      if (hit) {
        const descriptor =
          hit.kind === 'booth'
            ? describeBooth(hit.booth, mode)
            : describeAmenity(hit.amenity)
        setHoveredDescriptor(descriptor)
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      } else {
        // Cursor is on floor / wall / non-target — dismiss any open tooltip.
        setHoveredDescriptor((prev) => (prev ? null : prev))
        setTooltipPos((prev) => (prev ? null : prev))
      }

      if (rect.width !== svgBounds.w || rect.height !== svgBounds.h) {
        setSvgBounds({ w: rect.width, h: rect.height })
      }
    },
    [getHoverTargetFromEvent, mode, svgBounds.h, svgBounds.w],
  )

  const handlePointerLeave = useCallback(() => {
    setHoveredDescriptor(null)
    setTooltipPos(null)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const hit = getHoverTargetFromEvent(e.target)
      // Amenities aren't clickable — they're decorative hover targets.
      if (!hit || hit.kind !== 'booth') return
      const { booth } = hit
      if (booth.status === 'reserved' || booth.status === 'blocked') return

      if (mode === 'homepage' && booth.status === 'rented' && booth.vendor) {
        router.push(`/vendors/${booth.vendor.slug}`)
        return
      }
      if (mode === 'vendors' && booth.status === 'rented' && booth.vendor) {
        const el = document.getElementById(booth.vendor.slug)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (mode === 'become-a-vendor' && booth.status === 'available') {
        const url = new URL(window.location.href)
        url.searchParams.set('booth', booth.number)
        window.history.replaceState({}, '', url.toString())
        const form = document.getElementById('merchant-application-form')
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' })
        window.dispatchEvent(
          new CustomEvent('floorPlan:boothSelected', {
            detail: { number: booth.number },
          }),
        )
      }
    },
    [getHoverTargetFromEvent, mode, router],
  )

  // Keyboard enter/space activates the focused booth — mirrors click.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      const hit = getHoverTargetFromEvent(e.target)
      if (!hit || hit.kind !== 'booth') return
      e.preventDefault()
      handleClick(e as unknown as React.MouseEvent<HTMLDivElement>)
    },
    [getHoverTargetFromEvent, handleClick],
  )

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-button">
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="[&_svg]:block [&_svg]:w-full [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      </div>

      {hoveredDescriptor && tooltipPos && (
        <FloorPlanTooltip
          descriptor={hoveredDescriptor}
          x={tooltipPos.x}
          y={tooltipPos.y}
          containerWidth={svgBounds.w}
          containerHeight={svgBounds.h}
        />
      )}
    </div>
  )
}

/* ---------- helpers ---------- */

function isClickable(status: BoothStatus, mode: FloorPlanMode): boolean {
  if (status === 'rented') return mode === 'homepage' || mode === 'vendors'
  if (status === 'available') return mode === 'become-a-vendor'
  return false
}

function ariaLabelFor(
  number: string,
  booth: BoothView | undefined,
  mode: FloorPlanMode,
): string {
  const status = booth?.status ?? 'available'
  if (status === 'rented' && booth?.vendor) {
    const base = `Booth ${number}: ${booth.vendor.name}`
    return mode === 'homepage' ? `${base}. View vendor.` : base
  }
  if (status === 'available') {
    return mode === 'become-a-vendor'
      ? `Booth ${number}: available to rent. Apply now.`
      : `Booth ${number}: available`
  }
  if (status === 'reserved') return `Booth ${number}: reserved`
  if (status === 'blocked') return `Booth ${number}: unavailable`
  return `Booth ${number}`
}

function ensureDotLayer(svg: SVGSVGElement): SVGGElement {
  let layer = svg.querySelector<SVGGElement>('g[data-fp-dot-layer="1"]')
  if (layer) return layer
  layer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  layer.setAttribute('data-fp-dot-layer', '1')
  layer.setAttribute('pointer-events', 'none')
  // Append so dots sit on top of everything else in the SVG.
  svg.appendChild(layer)
  return layer
}

function vendorHue(vendorId: string | number): number {
  const str = String(vendorId)
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}
