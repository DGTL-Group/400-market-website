'use client'

import {
  memo,
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
 * every rentable booth rect carries `data-booth="NNNN"`. A few behaviours
 * are layered on top:
 *
 *   1. **Stable DOM.** The SVG is rendered by a memoized `<StaticSvg>`
 *      child so the parent's hover-state changes never trigger React
 *      to re-evaluate `dangerouslySetInnerHTML` and wipe the SVG DOM.
 *      Without this, useEffect-stamped attributes and the dev-only booth
 *      number labels flickered with every pointermove.
 *   2. **Always-on-top hover highlight.** Rather than a CSS `:hover`
 *      stroke on each rect (which gets painted over by later-drawn
 *      neighbours as the cursor moves), we render ONE overlay rect at
 *      the end of the SVG and update its geometry to match the hovered
 *      target. Being the last element in the SVG, it's always drawn on
 *      top — no flicker, no z-order issues.
 *   3. **Single tooltip state.** Whether the cursor is on a booth or an
 *      amenity (restroom, info desk, concession), the descriptor flows
 *      through one unified state and one tooltip component.
 */

// ──────────────────────────────────────────────────────────────────────────
// StaticSvg — memoized wrapper around dangerouslySetInnerHTML.
// Re-renders ONLY when svgMarkup changes, so the parent's transient state
// (hoveredDescriptor, tooltipPos, svgBounds) never causes the inner DOM to
// be replaced.
// ──────────────────────────────────────────────────────────────────────────
const StaticSvg = memo(function StaticSvg({ svgMarkup }: { svgMarkup: string }) {
  return (
    <div
      className="[&_svg]:block [&_svg]:w-full [&_svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  )
})

export function FloorPlanSVG({ mode, svgMarkup, booths }: Props) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)

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
   * Sync per-rect attributes + dev labels + overlay + dots when state
   * changes. Relies on `StaticSvg` keeping the DOM stable, so
   * useEffect-stamped attributes persist across parent re-renders.
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

    // Multi-booth vendor dots (vendor id → dot on second+ booth).
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

    // Hover highlight overlay — one rect sits at the END of the SVG so
    // it paints on top of every other element. We move it around on
    // pointermove; hide it on pointerleave. It's NEVER removed between
    // renders, so no flicker.
    ensureHoverOverlay(svg)

    // Dev-only: stamp each booth's number over its rect so the layout is
    // easy to eyeball against the CRM. Added as a sibling <text> so it
    // inherits the rect's parent transform (some booths live inside
    // nested <g transform="matrix(…)"> wrappers).
    if (process.env.NODE_ENV === 'development') {
      svg.querySelectorAll('[data-fp-label]').forEach((el) => el.remove())
      rects.forEach((rect) => {
        const number = rect.getAttribute('data-booth') ?? ''
        if (!number) return
        const x = parseFloat(rect.getAttribute('x') ?? '0')
        const y = parseFloat(rect.getAttribute('y') ?? '0')
        const w = parseFloat(rect.getAttribute('width') ?? '0')
        const h = parseFloat(rect.getAttribute('height') ?? '0')
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', String(x + w / 2))
        text.setAttribute('y', String(y + h / 2))
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('dominant-baseline', 'central')
        text.setAttribute('font-size', '9')
        text.setAttribute('font-family', 'DM Sans, sans-serif')
        text.setAttribute('font-weight', '700')
        text.setAttribute('fill', '#2C2C2C')
        text.setAttribute('pointer-events', 'none')
        text.setAttribute('data-fp-label', '1')
        text.textContent = number
        rect.parentNode?.insertBefore(text, rect.nextSibling)
      })
    }
  }, [boothMap, booths, mode, vendorBoothMap])

  /**
   * Walk up from the event target looking for either a booth rect
   * (`data-booth`) or an amenity (`data-amenity`). Returns the
   * SVGElement that owns the attribute so the caller can position
   * the hover overlay on exactly that element.
   */
  const getHoverTarget = useCallback(
    (
      target: EventTarget | null,
    ):
      | { kind: 'booth'; booth: BoothView; el: SVGGraphicsElement }
      | { kind: 'amenity'; amenity: AmenityKind; el: SVGGraphicsElement }
      | null => {
      if (!target || !(target instanceof Element)) return null
      let el: Element | null = target
      while (el && el instanceof SVGElement) {
        const boothNum = el.getAttribute('data-booth')
        if (boothNum) {
          const booth = boothMap.get(boothNum)
          return booth
            ? { kind: 'booth', booth, el: el as SVGGraphicsElement }
            : null
        }
        const amenity = el.getAttribute('data-amenity')
        if (amenity) {
          return {
            kind: 'amenity',
            amenity: amenity as AmenityKind,
            el: el as SVGGraphicsElement,
          }
        }
        el = el.parentElement
      }
      return null
    },
    [boothMap],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const hit = getHoverTarget(e.target)
      const container = containerRef.current
      if (!container) return
      const svg = container.querySelector('svg')
      const rect = container.getBoundingClientRect()

      if (hit && svg) {
        const descriptor =
          hit.kind === 'booth'
            ? describeBooth(hit.booth, mode)
            : describeAmenity(hit.amenity)
        setHoveredDescriptor(descriptor)
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        updateHoverOverlay(svg, hit.el)
      } else {
        setHoveredDescriptor((prev) => (prev ? null : prev))
        setTooltipPos((prev) => (prev ? null : prev))
        if (svg) hideHoverOverlay(svg)
      }

      if (rect.width !== svgBounds.w || rect.height !== svgBounds.h) {
        setSvgBounds({ w: rect.width, h: rect.height })
      }
    },
    [getHoverTarget, mode, svgBounds.h, svgBounds.w],
  )

  const handlePointerLeave = useCallback(() => {
    setHoveredDescriptor(null)
    setTooltipPos(null)
    const svg = containerRef.current?.querySelector('svg')
    if (svg) hideHoverOverlay(svg)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const hit = getHoverTarget(e.target)
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
    [getHoverTarget, mode, router],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      const hit = getHoverTarget(e.target)
      if (!hit || hit.kind !== 'booth') return
      e.preventDefault()
      handleClick(e as unknown as React.MouseEvent<HTMLDivElement>)
    },
    [getHoverTarget, handleClick],
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
        >
          <StaticSvg svgMarkup={svgMarkup} />
        </div>
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
  svg.appendChild(layer)
  return layer
}

/**
 * Create the single hover-highlight rect once and stash it at the end
 * of the SVG so it paints on top of every other element. Idempotent.
 */
function ensureHoverOverlay(svg: SVGSVGElement): SVGRectElement {
  let overlay = svg.querySelector<SVGRectElement>('rect[data-fp-hover]')
  if (overlay) {
    // Always move it to the end — it needs to paint last. Appending a
    // node that's already in the tree moves it to the new position.
    svg.appendChild(overlay)
    return overlay
  }
  overlay = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'rect',
  ) as SVGRectElement
  overlay.setAttribute('data-fp-hover', '1')
  overlay.setAttribute('vector-effect', 'non-scaling-stroke')
  overlay.setAttribute('pointer-events', 'none')
  // Inline style beats the SVG's embedded stylesheet rules for `rect`
  // (which would otherwise paint the overlay yellow like every other
  // rect — the stylesheet uses plain `rect` selectors without :not).
  overlay.style.fill = 'none'
  overlay.style.stroke = '#E57200'
  overlay.style.strokeWidth = '3px'
  overlay.style.transition = 'none'
  overlay.style.display = 'none'
  svg.appendChild(overlay)
  return overlay
}

function hideHoverOverlay(svg: SVGSVGElement) {
  const overlay = svg.querySelector<SVGRectElement>('rect[data-fp-hover]')
  if (overlay) overlay.style.display = 'none'
}

/**
 * Position the hover overlay over the given hit element, regardless of
 * whatever nested `<g transform>` wrappers the hit lives inside. We work
 * entirely in viewport pixels (getBoundingClientRect) and project back
 * into the SVG's root coordinate space — the overlay sits at the SVG
 * root, so it uses root coords directly.
 */
function updateHoverOverlay(svg: SVGSVGElement, hit: SVGGraphicsElement) {
  const overlay = ensureHoverOverlay(svg)
  const hitRect = hit.getBoundingClientRect()
  const screenCTM = svg.getScreenCTM()
  if (!screenCTM) return
  const inv = screenCTM.inverse()

  const pt = svg.createSVGPoint()
  pt.x = hitRect.left
  pt.y = hitRect.top
  const topLeft = pt.matrixTransform(inv)
  pt.x = hitRect.right
  pt.y = hitRect.bottom
  const botRight = pt.matrixTransform(inv)

  overlay.setAttribute('x', String(topLeft.x))
  overlay.setAttribute('y', String(topLeft.y))
  overlay.setAttribute('width', String(botRight.x - topLeft.x))
  overlay.setAttribute('height', String(botRight.y - topLeft.y))
  overlay.style.display = 'block'
}

function vendorHue(vendorId: string | number): number {
  const str = String(vendorId)
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}
