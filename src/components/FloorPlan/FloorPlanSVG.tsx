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
import { FloorPlanSearch } from './FloorPlanSearch'
import { FloorPlanLegend, type LegendKey } from './FloorPlanLegend'

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

  // ── Filter state ─────────────────────────────────────────────────
  // The search bar and the legend both drive the same "dim everything
  // except the match set" highlight. They're mutually exclusive:
  // typing into the search clears the legend selection, clicking a
  // legend chip clears the search. `filter.kind === 'none'` means no
  // highlight is active and every booth renders at full opacity.
  const [filter, setFilter] = useState<
    | { kind: 'none' }
    | { kind: 'search'; query: string }
    | { kind: 'legend'; legend: LegendKey }
  >({ kind: 'none' })

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
   * Filter outcome — which BOOTH rects to highlight, and whether the
   * filter also wants to highlight amenities. `null` = no active filter.
   */
  const filterMatch = useMemo<
    | null
    | { boothNumbers: Set<string>; amenities: Set<AmenityKind>; foodCourt: boolean }
  >(() => {
    if (filter.kind === 'none') return null

    const boothNumbers = new Set<string>()
    const amenities = new Set<AmenityKind>()
    let foodCourt = false

    if (filter.kind === 'search') {
      const q = filter.query.toLowerCase()
      if (!q) return null
      // Names and categories use a word-boundary match so the
      // query has to land at the START of a word: "Art" matches
      // "Art Place" but not "Mart" / "Walmart" / "Smart". Without
      // this, a 3-letter search would dim almost nothing because
      // it overlapped a letter in too many vendor names.
      // Booth numbers keep substring semantics so "17" still
      // finds "1702".
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const wordBoundaryRe = new RegExp(`\\b${escaped}`, 'i')
      for (const b of booths) {
        if (b.number.toLowerCase().includes(q)) {
          boothNumbers.add(b.number)
          continue
        }
        if (b.vendor?.name && wordBoundaryRe.test(b.vendor.name)) {
          boothNumbers.add(b.number)
          continue
        }
        const cats = b.vendor?.category ?? []
        if (cats.some((c) => wordBoundaryRe.test(c))) {
          boothNumbers.add(b.number)
        }
      }
    } else if (filter.kind === 'legend') {
      switch (filter.legend) {
        case 'rented':
          booths.forEach((b) => b.status === 'rented' && boothNumbers.add(b.number))
          break
        case 'available':
          booths.forEach((b) => b.status === 'available' && boothNumbers.add(b.number))
          break
        case 'reserved':
          booths.forEach((b) => b.status === 'reserved' && boothNumbers.add(b.number))
          break
        case 'atm':
          amenities.add('atm')
          break
        case 'mens-restroom':
          amenities.add('mens-restroom')
          break
        case 'womens-restroom':
          amenities.add('womens-restroom')
          break
        case 'info-desk':
          amenities.add('info-desk')
          break
        case 'food-court':
          foodCourt = true
          booths.forEach(
            (b) =>
              /^17\d{2}$/.test(b.number) && boothNumbers.add(b.number),
          )
          break
      }
    }
    return { boothNumbers, amenities, foodCourt }
  }, [filter, booths])

  /** Reported back to the search bar for its "N matches" live region. */
  const searchMatchCount =
    filter.kind === 'search' && filterMatch
      ? filterMatch.boothNumbers.size
      : null

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

    // (No more multi-booth vendor dots. They used to mark booths owned
    // by the same vendor, but the colour hashing over sequential
    // vendor ids clumped everything into a near-identical green and it
    // just added noise. Adjacent-booth merging replaces the signal.)
    svg.querySelectorAll('[data-fp-dot]').forEach((d) => d.remove())
    const outerG = findOuterScaledGroup(svg)
    const outerCTM = outerG?.getCTM()

    // Clear any previous merged-cluster artefacts before rebuilding.
    svg.querySelectorAll('[data-fp-merged]').forEach((el) => el.remove())
    svg.querySelectorAll<SVGRectElement>('rect[data-booth]').forEach((r) => {
      r.style.visibility = ''
      r.removeAttribute('data-hidden-by-merge')
    })
    // Restore any dev-only labels that were hidden by a previous merge
    // pass — they may or may not get re-hidden depending on the new
    // cluster set.
    svg
      .querySelectorAll<SVGTextElement>('text[data-fp-label]')
      .forEach((lbl) => {
        lbl.style.visibility = ''
      })

    // Adjacency-based merge: booths with the same vendor, rented, and
    // spatially adjacent (within 2 outer-g units on either axis) get
    // rendered as ONE merged shape — a polygon-union <path> that
    // traces the actual perimeter of the cluster, NOT the bbox. This
    // matters for L/T-shaped clusters (3D Distribution, Maximum
    // Darts, etc.): a bbox-spanning rect would cover gaps and steal
    // pointer events from neighbouring booths. The path approach
    // gives one visually-merged shape with no internal borders AND
    // correct hit-testing for any cluster shape.
    //
    // become-a-vendor mode skips merging entirely — visitors there
    // need to see/click each booth as its own cell, and rented
    // booths read as dimmed individual context rather than a fused
    // mass.
    if (outerG && outerCTM && mode !== 'become-a-vendor') {
      const candidates: Array<{
        number: string
        booth: BoothView
        rect: SVGRectElement
        bbox: { x: number; y: number; w: number; h: number; right: number; bottom: number }
      }> = []

      booths.forEach((b) => {
        if (b.status !== 'rented' || !b.vendor) return
        const rect = svg.querySelector<SVGRectElement>(
          `rect[data-booth="${cssEscape(b.number)}"]`,
        )
        if (!rect) return
        const rectCTM = rect.getCTM()
        if (!rectCTM) return
        const x = parseFloat(rect.getAttribute('x') ?? '0')
        const y = parseFloat(rect.getAttribute('y') ?? '0')
        const w = parseFloat(rect.getAttribute('width') ?? '0')
        const h = parseFloat(rect.getAttribute('height') ?? '0')
        const transform = outerCTM.inverse().multiply(rectCTM)
        const tl = svg.createSVGPoint()
        tl.x = x
        tl.y = y
        const br = svg.createSVGPoint()
        br.x = x + w
        br.y = y + h
        const pTL = tl.matrixTransform(transform)
        const pBR = br.matrixTransform(transform)
        candidates.push({
          number: b.number,
          booth: b,
          rect,
          bbox: {
            x: pTL.x,
            y: pTL.y,
            w: pBR.x - pTL.x,
            h: pBR.y - pTL.y,
            right: pBR.x,
            bottom: pBR.y,
          },
        })
      })

      // Group by vendor id, then inside each group find connected
      // components by spatial adjacency.
      const byVendor = new Map<string | number, typeof candidates>()
      for (const c of candidates) {
        const list = byVendor.get(c.booth.vendor!.id) ?? []
        list.push(c)
        byVendor.set(c.booth.vendor!.id, list)
      }

      const TOL = 2
      const clusters: Array<(typeof candidates)[number][]> = []
      for (const group of byVendor.values()) {
        if (group.length < 2) continue
        const n = group.length
        const visited = Array(n).fill(false)
        for (let i = 0; i < n; i++) {
          if (visited[i]) continue
          const queue = [i]
          visited[i] = true
          const component: typeof group = []
          while (queue.length) {
            const k = queue.shift()!
            component.push(group[k])
            for (let j = 0; j < n; j++) {
              if (visited[j]) continue
              if (areAdjacent(group[k].bbox, group[j].bbox, TOL)) {
                visited[j] = true
                queue.push(j)
              }
            }
          }
          if (component.length >= 2) clusters.push(component)
        }
      }

      for (const cluster of clusters) {
        renderMergedCluster({ svg, outerG, cluster, mode })
      }
    }

    // Hover highlight overlay — one rect sits at the END of the SVG so
    // it paints on top of every other element. We move it around on
    // pointermove; hide it on pointerleave. It's NEVER removed between
    // renders, so no flicker.
    ensureHoverOverlay(svg)

    // ── Mode-aware on-rect labels ───────────────────────────────────
    // Each mode shows the audience the thing they came for:
    //   • homepage / vendors → vendor name on every rented booth
    //     (single rects only — clusters already show the name from
    //     renderMergedCluster).
    //   • become-a-vendor → booth number on every available booth.
    // Rented booths in become-a-vendor mode and available booths in
    // public modes deliberately render with NO on-rect label — the
    // hover tooltip carries the full info. This stops the cramped
    // "vendor name + number + range" stack we used to render.
    svg.querySelectorAll('[data-fp-rect-label]').forEach((el) => el.remove())
    const labeledBooths = new Set<string>()
    if (outerG && outerCTM) {
      // Track which booths the cluster pass already absorbed — they get
      // ALL added to labeledBooths so the dev-label fallback below can't
      // stamp a stray booth number on top of the merged rect's centred
      // vendor name. (The bug we just fixed: previously only the merged
      // rect's primary booth went into labeledBooths, so the other
      // cluster members' dev labels showed through.)
      svg.querySelectorAll<SVGRectElement>(
        'rect[data-booth][data-hidden-by-merge]',
      ).forEach((r) => {
        const num = r.getAttribute('data-booth')
        if (num) labeledBooths.add(num)
      })
      svg.querySelectorAll<SVGRectElement>(
        'rect[data-fp-merged][data-booth]',
      ).forEach((r) => {
        const num = r.getAttribute('data-booth')
        if (num) labeledBooths.add(num)
      })

      if (mode === 'homepage' || mode === 'vendors') {
        for (const b of booths) {
          if (b.status !== 'rented' || !b.vendor) continue
          if (labeledBooths.has(b.number)) continue
          const rect = svg.querySelector<SVGRectElement>(
            `rect[data-booth="${cssEscape(b.number)}"]`,
          )
          if (!rect) continue
          addRectLabel({
            svg,
            outerG,
            outerCTM,
            rect,
            text: displayName(b.vendor.name),
            maxFontSize: 11,
            minFontSize: 6,
            weight: 700,
          })
          labeledBooths.add(b.number)
        }
      } else if (mode === 'become-a-vendor') {
        // Number every non-blocked booth on this page. Available
        // booths get a brighter weight so they read as "click me",
        // and rented/reserved get a quieter weight to signal
        // "context, not target" — both still numbered so the
        // visitor can identify any booth on the map by sight.
        for (const b of booths) {
          if (b.status === 'blocked') continue
          const rect = svg.querySelector<SVGRectElement>(
            `rect[data-booth="${cssEscape(b.number)}"]`,
          )
          if (!rect) continue
          const isAvail = b.status === 'available'
          addRectLabel({
            svg,
            outerG,
            outerCTM,
            rect,
            text: b.number,
            maxFontSize: isAvail ? 9 : 7,
            minFontSize: 5,
            weight: isAvail ? 600 : 500,
          })
          labeledBooths.add(b.number)
        }
      }
    }

    // ── Dev-only fallback labels ────────────────────────────────────
    // In development we want booth numbers visible on EVERY booth so
    // the layout can be eyeballed against the CRM, but only on booths
    // that didn't already get a mode-aware label (otherwise we're back
    // to the cramped two-strings-per-rect problem). Append each label
    // to the outermost scaled `<g>` rather than as a sibling of its
    // rect, because some booths live inside nested
    // `<g transform="matrix(1, 0, 0, 0.75, …)">` wrappers that scale
    // the y axis non-uniformly.
    if (process.env.NODE_ENV === 'development') {
      svg.querySelectorAll('[data-fp-label]').forEach((el) => el.remove())
      if (outerG && outerCTM) {
        rects.forEach((rect) => {
          const number = rect.getAttribute('data-booth') ?? ''
          if (!number) return
          if (labeledBooths.has(number)) return
          const x = parseFloat(rect.getAttribute('x') ?? '0')
          const y = parseFloat(rect.getAttribute('y') ?? '0')
          const w = parseFloat(rect.getAttribute('width') ?? '0')
          const h = parseFloat(rect.getAttribute('height') ?? '0')
          const rectCTM = rect.getCTM()
          if (!rectCTM || !outerCTM) return
          const pt = svg.createSVGPoint()
          pt.x = x + w / 2
          pt.y = y + h / 2
          const projected = pt.matrixTransform(outerCTM.inverse().multiply(rectCTM))

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          text.setAttribute('x', String(projected.x))
          text.setAttribute('y', String(projected.y))
          text.setAttribute('text-anchor', 'middle')
          text.setAttribute('dominant-baseline', 'central')
          text.setAttribute('font-size', '7')
          text.setAttribute('font-family', 'DM Sans, sans-serif')
          text.setAttribute('font-weight', '600')
          text.setAttribute('fill', '#2C2C2C')
          text.setAttribute('opacity', '0.55')
          text.setAttribute('pointer-events', 'none')
          text.setAttribute('data-fp-label', '1')
          // Same booth number on the label so the filter effect
          // dims/matches dev labels in step with their booth rect.
          text.setAttribute('data-booth', number)
          text.textContent = number
          outerG.appendChild(text)
        })
      }
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

  /**
   * Apply the filter as a pair of `data-filter` attributes on every
   * selectable rect / amenity. CSS in the SVG paints them accordingly
   * (`match` = highlighted + pulse, `dim` = 25% opacity). Runs in an
   * effect so it doesn't tear the DOM on every keystroke — we just
   * flip attributes.
   */
  useEffect(() => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return

    const rects = svg.querySelectorAll<SVGRectElement>('rect[data-booth]')
    // Single-booth labels (vendor names on un-merged rented booths)
    // and dev booth-number labels both carry data-booth, so a single
    // selector handles them and they dim/match in step with the
    // rects they sit on.
    const labelTexts = svg.querySelectorAll<SVGTextElement>('text[data-booth]')
    const amenityEls = svg.querySelectorAll<SVGGraphicsElement>('[data-amenity]')
    // Merged-cluster shapes (path) and their labels both carry
    // `data-cluster-booths` listing every booth in the cluster, so
    // a single query handles them together. They highlight when ANY
    // of their member booths matches the search.
    const clusterEls = svg.querySelectorAll<SVGElement>(
      '[data-cluster-booths]',
    )
    // The food court's dashed orange border + "FOOD COURT" label.
    // These are decorative and don't have data-booth, so we treat
    // them as a unit: they stay full opacity when the active
    // filter is "food court" itself OR "active vendors / rented"
    // (since the food court is full of rented stalls, dimming it
    // alongside the empty floor would be misleading). For every
    // other filter — restrooms, ATM, an arbitrary search — they
    // dim with everything else.
    const foodCourtFrame = svg.querySelectorAll<SVGElement>(
      '.fp-food-court-zone, .fp-food-court-label',
    )

    if (!filterMatch) {
      rects.forEach((r) => r.removeAttribute('data-filter'))
      labelTexts.forEach((t) => t.removeAttribute('data-filter'))
      amenityEls.forEach((el) => el.removeAttribute('data-filter'))
      clusterEls.forEach((el) => el.removeAttribute('data-filter'))
      foodCourtFrame.forEach((el) => el.removeAttribute('data-filter'))
      return
    }

    const { boothNumbers, amenities } = filterMatch
    const foodCourtRelevant =
      filter.kind === 'legend' &&
      (filter.legend === 'food-court' || filter.legend === 'rented')

    const stampBoothFilter = (el: Element) => {
      const num = el.getAttribute('data-booth') ?? ''
      el.setAttribute('data-filter', boothNumbers.has(num) ? 'match' : 'dim')
    }
    rects.forEach(stampBoothFilter)
    labelTexts.forEach(stampBoothFilter)
    clusterEls.forEach((el) => {
      const list = (el.getAttribute('data-cluster-booths') ?? '').split(',')
      const matches = list.some((n) => boothNumbers.has(n))
      el.setAttribute('data-filter', matches ? 'match' : 'dim')
    })
    amenityEls.forEach((el) => {
      const kind = el.getAttribute('data-amenity') as AmenityKind | null
      el.setAttribute(
        'data-filter',
        kind && amenities.has(kind) ? 'match' : 'dim',
      )
    })
    // Frame is decorative — it should never wear the orange match
    // outline. Either it dims with everything else, or it goes back
    // to its default rendering. No "match" state.
    foodCourtFrame.forEach((el) => {
      if (foodCourtRelevant) {
        el.removeAttribute('data-filter')
      } else {
        el.setAttribute('data-filter', 'dim')
      }
    })
  }, [filterMatch, filter])

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
    <div>
      {/* Breathing room above the search input — the map used to slam
          up against whatever was above it. */}
      <div className="py-6 md:py-8">
        {/* Search bar — typing clears any pinned legend row. */}
        <FloorPlanSearch
          matchCount={searchMatchCount}
          onQueryChange={(q) =>
            setFilter(q ? { kind: 'search', query: q } : { kind: 'none' })
          }
        />
      </div>

      {/* The map itself. The wrapper is `relative` so the hover tooltip
          can position against IT (not the whole component), keeping the
          tooltip glued to the cursor. overflow-hidden lives on an inner
          box so the tooltip can still escape the rounded corners. */}
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

      {/* Legend below the map — clicking a chip clears any active search. */}
      <div className="pt-4">
        <FloorPlanLegend
          active={filter.kind === 'legend' ? filter.legend : null}
          onToggle={(key) =>
            setFilter(key ? { kind: 'legend', legend: key } : { kind: 'none' })
          }
          mode={mode}
        />
      </div>
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
  svg.querySelectorAll('[data-fp-hover]').forEach((el) => {
    ;(el as SVGElement).style.display = 'none'
  })
}

/**
 * Render the orange highlight by CLONING the hit element (preserves
 * its shape — rect, path, or anything else), stripping its identity
 * attributes, swapping its fill/stroke for highlight styling, and
 * appending the clone to the SVG root with a `transform` attribute
 * that places it at the same screen position the original occupies.
 *
 * Why a clone instead of a positioned rect overlay:
 *
 *   - For rectangular booths, a rect overlay was fine.
 *   - For merged clusters that are now rendered as polygon paths
 *     (L/T/U-shapes), a rect overlay would highlight the bbox and
 *     bleed into neighbouring booths. Cloning the path gives us
 *     the exact perimeter for free.
 *
 * The transform we apply is `hit.getCTM()` — the chain of ancestor
 * transforms that maps hit's local coords into SVG root coords.
 * The clone lives at the SVG root with no other transforms, so
 * applying that CTM puts it at the same place hit currently
 * renders, regardless of how deeply nested hit was.
 */
function updateHoverOverlay(svg: SVGSVGElement, hit: SVGGraphicsElement) {
  // Always rebuild — the overlay shape needs to match whatever was
  // just hovered, and the perf cost of a clone+attribute strip is
  // negligible at pointermove rate.
  svg.querySelectorAll('[data-fp-hover]').forEach((el) => el.remove())

  const overlay = hit.cloneNode(false) as SVGGraphicsElement
  ;[
    'data-booth',
    'data-status',
    'data-fp-merged',
    'data-hidden-by-merge',
    'data-amenity',
    'data-filter',
    'aria-label',
    'role',
    'tabindex',
    'class',
    'id',
  ].forEach((a) => overlay.removeAttribute(a))
  overlay.setAttribute('data-fp-hover', '1')
  overlay.setAttribute('pointer-events', 'none')
  overlay.setAttribute('vector-effect', 'non-scaling-stroke')
  // Wipe any inline styles inherited from the source (e.g. the merged
  // path may have transition rules that would lag the highlight).
  overlay.style.cssText = ''
  overlay.style.fill = 'none'
  overlay.style.stroke = '#E57200'
  overlay.style.strokeWidth = '3px'
  overlay.style.transition = 'none'
  overlay.style.opacity = '1'
  overlay.style.visibility = 'visible'
  overlay.style.display = 'block'

  // We want overlay (a child of <svg>) to render at the same screen
  // position as `hit`. Both elements live inside the same SVG, so:
  //   overlay.screenCTM = svg.screenCTM × overlayAttrTransform
  //   we want overlay.screenCTM = hit.screenCTM
  // → overlayAttrTransform = svg.screenCTM⁻¹ × hit.screenCTM
  // Using getCTM() instead of getScreenCTM() doesn't work here:
  // some browsers return a screen-space CTM for direct svg
  // descendants which then double-applies the viewBox scale when
  // we re-attach the overlay under the SVG root.
  const hitScreen = hit.getScreenCTM()
  const svgScreen = svg.getScreenCTM()
  if (hitScreen && svgScreen) {
    const t = svgScreen.inverse().multiply(hitScreen)
    overlay.setAttribute(
      'transform',
      `matrix(${t.a} ${t.b} ${t.c} ${t.d} ${t.e} ${t.f})`,
    )
  } else {
    overlay.removeAttribute('transform')
  }

  svg.appendChild(overlay)
}

/**
 * The source SVG wraps every booth inside a single `<g transform="matrix(
 * 3.125, 0, 0, 3.125, 0, 0)">` scaled group. We use it as the insertion
 * target for dev-only booth-number labels so they land above everything
 * inside but outside any nested booth-specific transforms. (The root
 * SVG's first element is actually `<style>` — the scaled group is the
 * first `<g>` child.)
 */
function findOuterScaledGroup(svg: SVGSVGElement): SVGGElement | null {
  return svg.querySelector<SVGGElement>(':scope > g')
}

/** querySelector values inside selectors need CSS-escaping for safe use. */
function cssEscape(s: string): string {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s)
  return s.replace(/[^\w-]/g, '\\$&')
}

type MergedBBox = {
  x: number
  y: number
  w: number
  h: number
  right: number
  bottom: number
}

/**
 * Discretise a cluster of axis-aligned rects into a uniform grid
 * whose cell boundaries fall at every booth edge. Returns the grid
 * (`filled[r][c]` = is cell (r, c) covered by some booth) plus the
 * sorted x and y boundary coordinates. This grid is the shared
 * foundation for both the perimeter trace AND the largest-
 * inscribed-rect search — every booth aligns to the grid by
 * construction, so the only question for any cell is "filled or
 * empty?".
 */
function buildClusterGrid(
  cluster: Array<{ bbox: MergedBBox }>,
  tol: number,
): { filled: boolean[][]; xs: number[]; ys: number[] } | null {
  if (cluster.length === 0) return null
  const xSet = new Set<number>()
  const ySet = new Set<number>()
  for (const c of cluster) {
    xSet.add(c.bbox.x)
    xSet.add(c.bbox.right)
    ySet.add(c.bbox.y)
    ySet.add(c.bbox.bottom)
  }
  const xs = [...xSet].sort((a, b) => a - b)
  const ys = [...ySet].sort((a, b) => a - b)
  const xN = xs.length - 1
  const yN = ys.length - 1
  if (xN <= 0 || yN <= 0) return null

  const filled: boolean[][] = []
  for (let r = 0; r < yN; r++) {
    const row: boolean[] = []
    for (let c = 0; c < xN; c++) {
      const cx = (xs[c] + xs[c + 1]) / 2
      const cy = (ys[r] + ys[r + 1]) / 2
      let inside = false
      for (const cl of cluster) {
        if (
          cx >= cl.bbox.x - tol &&
          cx <= cl.bbox.right + tol &&
          cy >= cl.bbox.y - tol &&
          cy <= cl.bbox.bottom + tol
        ) {
          inside = true
          break
        }
      }
      row.push(inside)
    }
    filled.push(row)
  }
  return { filled, xs, ys }
}

/**
 * Compute the perimeter of a cluster of axis-aligned rects as an
 * SVG path "d" string. Handles ANY shape — rectangle, L, T, U, ring
 * with hole, even disjoint islands — because we work from a cell
 * grid, not from edge cancellation. For each filled cell we emit a
 * directed edge (clockwise) on every side whose neighbour is empty
 * or off-grid. Those edges are the perimeter. We then chain them
 * into one or more closed loops (`M…Z` per loop) — multiple loops
 * naturally fall out for shapes with holes.
 *
 * The previous implementation used edge cancellation that only
 * fired on EXACT mirror edges. For Nicky's 3 for 10 — a wide
 * top-row booth meeting a narrow right-column booth — the bottom
 * edge of the top-row (122 wide) only partially overlapped the top
 * edge of the right-column (44 wide), so neither cancelled and the
 * resulting `d` contained an interior crossing line. The grid
 * approach sidesteps that whole class of bug.
 */
function computeClusterPath(
  cluster: Array<{ bbox: MergedBBox }>,
  tol: number,
): string | null {
  const grid = buildClusterGrid(cluster, tol)
  if (!grid) return null
  const { filled, xs, ys } = grid
  const yN = filled.length
  const xN = filled[0].length

  type Edge = { x1: number; y1: number; x2: number; y2: number }
  const edges: Edge[] = []
  for (let r = 0; r < yN; r++) {
    for (let c = 0; c < xN; c++) {
      if (!filled[r][c]) continue
      const x1 = xs[c],
        x2 = xs[c + 1]
      const y1 = ys[r],
        y2 = ys[r + 1]
      if (r === 0 || !filled[r - 1][c]) {
        edges.push({ x1, y1, x2, y2: y1 }) // top →
      }
      if (c === xN - 1 || !filled[r][c + 1]) {
        edges.push({ x1: x2, y1, x2, y2 }) // right ↓
      }
      if (r === yN - 1 || !filled[r + 1][c]) {
        edges.push({ x1: x2, y1: y2, x2: x1, y2 }) // bottom ←
      }
      if (c === 0 || !filled[r][c - 1]) {
        edges.push({ x1, y1: y2, x2: x1, y2: y1 }) // left ↑
      }
    }
  }
  if (edges.length === 0) return null

  // Chain edges into closed loops. A cluster with a hole produces
  // two loops (outer + inner); disjoint islands produce one loop
  // each.
  const close = (a: number, b: number) => Math.abs(a - b) < tol
  const used = new Array<boolean>(edges.length).fill(false)
  const parts: string[] = []
  for (let start = 0; start < edges.length; start++) {
    if (used[start]) continue
    const loop: Edge[] = [edges[start]]
    used[start] = true
    while (true) {
      const last = loop[loop.length - 1]
      let next = -1
      for (let i = 0; i < edges.length; i++) {
        if (used[i]) continue
        if (
          close(edges[i].x1, last.x2) &&
          close(edges[i].y1, last.y2)
        ) {
          next = i
          break
        }
      }
      if (next === -1) break
      loop.push(edges[next])
      used[next] = true
    }
    parts.push(`M ${loop[0].x1} ${loop[0].y1}`)
    for (const e of loop) parts.push(`L ${e.x2} ${e.y2}`)
    parts.push('Z')
  }
  return parts.length ? parts.join(' ') : null
}

/**
 * Find the BEST axis-aligned rectangle inscribed in the cluster's
 * union for label placement. "Best" = a width-biased score that
 * prefers landscape rectangles over portrait — the label is
 * horizontal so a 60×25 row reads better than a 25×50 column even
 * though the column has slightly less raw area.
 *
 * Score: `area × aspectFactor`, where aspectFactor = 1 for
 * landscape (w ≥ h) and `0.4 + 0.6 × (w/h)` for portrait. So a
 * square gets 1.0, a 1:2 portrait gets 0.7, a 1:4 portrait gets
 * 0.55. This nudges the picker toward the wider arm of an L/T
 * cluster without disqualifying portrait when it's the only option
 * (e.g. Camp Hill, a single narrow column).
 *
 * Brute-force O(N⁴) over grid cells, but our N is small (≤ ~10
 * unique booth edges per cluster) so this runs in microseconds.
 */
type InscribedRect = { x1: number; y1: number; x2: number; y2: number }
function findLargestInscribedRect(
  cluster: Array<{ bbox: MergedBBox }>,
  tol: number,
): InscribedRect | null {
  const grid = buildClusterGrid(cluster, tol)
  if (!grid) return null
  const { filled, xs, ys } = grid
  const yN = filled.length
  const xN = filled[0].length

  let bestScore = 0
  let best: InscribedRect | null = null
  for (let r1 = 0; r1 < yN; r1++) {
    for (let r2 = r1; r2 < yN; r2++) {
      for (let c1 = 0; c1 < xN; c1++) {
        // Walk c2 from c1 forward; the moment any cell in the
        // current column is empty, no larger c2 can possibly form
        // a covered rect with this c1, so break.
        for (let c2 = c1; c2 < xN; c2++) {
          let columnFilled = true
          for (let i = r1; i <= r2; i++) {
            if (!filled[i][c2]) {
              columnFilled = false
              break
            }
          }
          if (!columnFilled) break
          const w = xs[c2 + 1] - xs[c1]
          const h = ys[r2 + 1] - ys[r1]
          const aspectFactor =
            w >= h ? 1 : 0.4 + 0.6 * (w / h)
          const score = w * h * aspectFactor
          if (score > bestScore) {
            bestScore = score
            best = {
              x1: xs[c1],
              y1: ys[r1],
              x2: xs[c2 + 1],
              y2: ys[r2 + 1],
            }
          }
        }
      }
    }
  }
  return best
}

/**
 * Two rectangles are adjacent if one of their edges touches the other's
 * (within `tol` outer-g units) AND the perpendicular ranges overlap —
 * i.e. they share an actual side, not just a corner.
 */
function areAdjacent(a: MergedBBox, b: MergedBBox, tol: number): boolean {
  const yOverlap = Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > tol
  const xOverlap = Math.min(a.right, b.right) - Math.max(a.x, b.x) > tol
  const xClose =
    Math.abs(a.right - b.x) < tol || Math.abs(b.right - a.x) < tol
  const yClose =
    Math.abs(a.bottom - b.y) < tol || Math.abs(b.bottom - a.y) < tol
  return (xClose && yOverlap) || (yClose && xOverlap)
}

/** Compact an unsorted booth-number list into hyphenated runs. */
function formatBoothRange(numbers: string[]): string {
  const withParsed = numbers.map((n) => ({ n, num: parseInt(n, 10) }))
  withParsed.sort((a, b) => a.num - b.num)
  const sorted = withParsed.map((x) => x.n)
  const runs: string[] = []
  let runStart = sorted[0]
  let prev = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]
    const prevNum = parseInt(prev, 10)
    const curNum = parseInt(cur, 10)
    if (curNum !== prevNum + 1 || cur.length !== prev.length) {
      runs.push(runStart === prev ? runStart : `${runStart}\u2013${prev}`)
      runStart = cur
    }
    prev = cur
  }
  runs.push(runStart === prev ? runStart : `${runStart}\u2013${prev}`)
  return runs.join(', ')
}

/**
 * Shrink a text element's font-size until its bounding box fits
 * `maxWidth` OR hits `minSize`. If still overflowing at minSize,
 * truncate with a trailing ellipsis.
 *
 * Width measurement is robust: prefer `getComputedTextLength` (the
 * SVG-native method), fall back to `getBBox().width`, and if both
 * return 0 \u2014 which happens when the SVG hasn't been laid out yet
 * (text inside a not-yet-rendered region, fonts still warming up,
 * etc.) \u2014 fall back to a char-count \u00d7 font-size estimate. Without
 * the estimate, we'd accept a 0-width measurement as "fits", and
 * the label would render at full length AT runtime, protruding
 * past its booth.
 */
function fitTextWidth(
  text: SVGTextElement,
  maxWidth: number,
  maxSize: number,
  minSize: number,
) {
  // DM Sans bold (weight 700) average glyph advance is ~0.58 \u00d7 size.
  // We use the LARGER of the real-measured width and this estimate
  // so we still truncate correctly when:
  //   - getBBox / getComputedTextLength returns 0 (SVG not yet
  //     laid out \u2014 happens for offscreen/large SVGs)
  //   - DM Sans hasn't loaded yet and the browser measures with a
  //     narrower fallback font (the dev console actually reports
  //     `document.fonts.status === "loaded"` but the SVG text
  //     element gets stale measurements until next paint)
  // Over-truncating slightly when the real font happens to be narrow
  // is a much better failure mode than under-truncating and having
  // labels protrude into neighbouring booths.
  const charRatio = 0.58

  const widthAt = (): number => {
    const content = text.textContent ?? ''
    const size =
      parseFloat(text.getAttribute('font-size') ?? String(maxSize)) ||
      maxSize
    const charEst = content.length * size * charRatio
    let measured = 0
    try {
      measured = text.getComputedTextLength()
    } catch {
      /* not yet attached / no layout */
    }
    if (!measured) {
      try {
        measured = text.getBBox().width
      } catch {
        /* same */
      }
    }
    return Math.max(measured, charEst)
  }

  let size = maxSize
  text.setAttribute('font-size', String(size))
  while (size > minSize && widthAt() > maxWidth) {
    size -= 1
    text.setAttribute('font-size', String(size))
  }
  if (widthAt() > maxWidth) {
    const original = text.textContent ?? ''
    let trimmed = original
    while (trimmed.length > 3 && widthAt() > maxWidth) {
      trimmed = trimmed.slice(0, -1)
      text.textContent = trimmed.replace(/\s+$/, '') + '\u2026'
    }
  }
}

/**
 * For a cluster of rented booths owned by one vendor, build ONE
 * merged shape (an SVG <path> tracing the cluster's actual perimeter
 * — handles L/T/U-shapes correctly, no internal borders) and hide
 * the individual booth rects underneath. The vendor name label is
 * added only on public modes (homepage / vendors); become-a-vendor
 * skips merging upstream so this function is never called there.
 *
 * The label is positioned at the cluster's area-weighted centroid,
 * not the bbox centre — for an L-shape the bbox centre lands in the
 * empty corner, but the centroid stays inside the actual cluster.
 */
function renderMergedCluster({
  svg: _svg,
  outerG,
  cluster,
  mode,
}: {
  svg: SVGSVGElement
  outerG: SVGGElement
  cluster: Array<{
    number: string
    booth: BoothView
    rect: SVGRectElement
    bbox: MergedBBox
  }>
  mode: FloorPlanMode
}) {
  const d = computeClusterPath(cluster, 2)
  if (!d) return

  // Hide the individual booths so pointer events reach the merged
  // path. visibility:hidden blocks pointers; display:none would
  // remove backup tooltip targets, so we use the former.
  cluster.forEach((c) => {
    c.rect.style.visibility = 'hidden'
    c.rect.setAttribute('data-hidden-by-merge', '1')
  })

  const primary = cluster[0]
  const booth = primary.booth
  // List of every booth number in this cluster, joined for use as
  // a single attribute. The filter effect uses this to decide
  // whether the merged path / its label should highlight: a search
  // for booth "1702" should light up the merged path even if the
  // primary's number is "1700".
  const clusterBooths = cluster.map((c) => c.number).join(',')

  const merged = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path',
  ) as SVGPathElement
  merged.setAttribute('d', d)
  merged.setAttribute('data-fp-merged', '1')
  merged.setAttribute('data-booth', primary.number)
  merged.setAttribute('data-cluster-booths', clusterBooths)
  merged.setAttribute('data-status', 'rented')
  merged.setAttribute(
    'aria-label',
    `${booth.vendor?.name ?? 'Vendor'} — booths ${formatBoothRange(
      cluster.map((c) => c.number),
    )}`,
  )
  merged.setAttribute('role', 'button')
  merged.setAttribute('tabindex', '0')
  outerG.appendChild(merged)

  if (mode === 'homepage' || mode === 'vendors') {
    // Place the label at the centre of the LARGEST INSCRIBED
    // RECTANGLE — the biggest axis-aligned sub-rect that lies
    // entirely inside the cluster's union shape.
    //
    // Why not just bbox centre? For a rectangular cluster these
    // ARE the same answer. For an L/T/U cluster the bbox centre
    // can land in the empty arm OR in a narrow part of the
    // cluster where the label width has nowhere to expand without
    // bleeding into empty space. The LIR centre always sits inside
    // the cluster AND has at least LIR.width room for the label,
    // so the dead-centre intent is preserved when the cluster is
    // a simple rectangle, and a sensible fallback kicks in when
    // it isn't. No per-cluster tuning required — the layout can
    // change at any time and the rule still gives a clean result.
    const lir =
      findLargestInscribedRect(cluster, 2) ??
      // Defensive fallback (shouldn't normally trigger): use the
      // overall bbox so SOMETHING renders.
      (() => {
        const mnx = Math.min(...cluster.map((c) => c.bbox.x))
        const mxx = Math.max(...cluster.map((c) => c.bbox.right))
        const mny = Math.min(...cluster.map((c) => c.bbox.y))
        const mxy = Math.max(...cluster.map((c) => c.bbox.bottom))
        return { x1: mnx, y1: mny, x2: mxx, y2: mxy }
      })()
    const cx = (lir.x1 + lir.x2) / 2
    const cy = (lir.y1 + lir.y2) / 2
    const localW = lir.x2 - lir.x1
    const localH = lir.y2 - lir.y1

    addClusterNameLabel({
      outerG,
      x: cx,
      y: cy,
      width: localW,
      height: localH,
      text: displayName(booth.vendor?.name ?? ''),
      clusterBooths,
    })
  }
}

/**
 * Strip parenthetical descriptors from a vendor name for on-rect
 * labelling. The hover tooltip carries the full string, so the rect
 * itself only needs the headline name. Without this, names like
 * "Sea Lux Inc (Seven Sea's Lavender Yellow)" force the fitter all
 * the way down to font-size 6 to fit the parenthetical, leaving the
 * actual business name unreadable.
 *
 * If stripping leaves an empty string (the whole name was wrapped
 * in parens, somehow) we fall back to the original.
 */
function displayName(name: string): string {
  const stripped = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim()
  return stripped || name.trim()
}

/** Clamp `v` to the inclusive range [lo, hi]. */
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

/**
 * Greedy word-wrap fitter. Finds the LARGEST font-size at which the
 * text wraps to fit on word boundaries inside a (maxWidth × maxHeight)
 * box. Three-pass strategy:
 *
 *   1. Pure word-wrap, no truncation — try sizes from max down to
 *      min, return the first size whose wrapped layout fits.
 *   2. Word-wrap with last-word truncation — if a single word
 *      (e.g. "Jewellers") is too wide for the cluster at every size,
 *      truncate THAT word with an ellipsis on its own line instead
 *      of bailing entirely. Preserves the other words intact.
 *   3. Final fallback — single line truncated to fit at minSize.
 *
 * Char-width measurement is the deterministic 0.58 × size estimate
 * (same factor used elsewhere) so the fitter is reproducible across
 * font-loading states.
 */
function fitMultilineText({
  text,
  maxWidth,
  maxHeight,
  maxSize,
  minSize,
}: {
  text: string
  maxWidth: number
  maxHeight: number
  maxSize: number
  minSize: number
}): { lines: string[]; size: number } {
  const charRatio = 0.58
  const lineHeight = 1.15
  const trimmed = text.trim()
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length === 0) return { lines: [''], size: minSize }

  const wrap = (
    size: number,
    allowTruncate: boolean,
  ): string[] | null => {
    const lines: string[] = []
    let line = ''
    for (let i = 0; i < words.length; i++) {
      const w = words[i]
      const candidate = line ? line + ' ' + w : w
      if (candidate.length * size * charRatio <= maxWidth) {
        line = candidate
        continue
      }
      if (line) lines.push(line)
      if (w.length * size * charRatio > maxWidth) {
        if (!allowTruncate) return null
        // Truncate the offending word and stop — any remaining
        // words after a truncated one would just clutter the label.
        let trunc = w
        while (
          trunc.length > 1 &&
          (trunc.length + 1) * size * charRatio > maxWidth
        ) {
          trunc = trunc.slice(0, -1)
        }
        lines.push(trunc.replace(/\s+$/, '') + '…')
        line = ''
        break
      }
      line = w
    }
    if (line) lines.push(line)
    if (lines.length === 0) return null
    if (lines.length * size * lineHeight > maxHeight) return null
    return lines
  }

  // Pass 1: pure word-wrap, no truncation.
  for (let size = Math.floor(maxSize); size >= minSize; size--) {
    const lines = wrap(size, false)
    if (lines) return { lines, size }
  }
  // Pass 2: allow last-word truncation.
  for (let size = Math.floor(maxSize); size >= minSize; size--) {
    const lines = wrap(size, true)
    if (lines) return { lines, size }
  }
  // Pass 3: degrade to a single truncated line at minSize.
  let s = trimmed
  while (
    s.length > 1 &&
    (s.length + 1) * minSize * charRatio > maxWidth
  ) {
    s = s.slice(0, -1)
  }
  return {
    lines: [s.replace(/\s+$/, '') + '…'],
    size: minSize,
  }
}

/**
 * Render a centred multi-line text label inside a cluster's largest
 * inscribed rectangle. The label gets a small INSET on each side so
 * it never visually touches the cluster's boundary stroke. Lines
 * are emitted as `<tspan>` children of one `<text>` so all share
 * the same font attributes; their `dy` values shift each line down
 * by `size × lineHeight` from the previous, with the first line
 * bumped UP by half the total block height so the block as a whole
 * is centred on (x, y).
 */
function addClusterNameLabel({
  outerG,
  x,
  y,
  width,
  height,
  text: content,
  clusterBooths,
}: {
  outerG: SVGGElement
  x: number
  y: number
  width: number
  height: number
  text: string
  /** Comma-joined cluster booth numbers, used by the filter effect
   *  to dim/match this label in lockstep with its merged path. */
  clusterBooths: string
}) {
  // Adaptive padding: scales with the LIR so big clusters get
  // generous breathing room while tiny clusters don't sacrifice all
  // their writable area to insets. Vertical inset is a touch larger
  // (multi-line labels need top/bottom space to read clearly).
  const INSET_X = clamp(width * 0.10, 2.5, 6)
  const INSET_Y = clamp(height * 0.12, 3, 6)
  const lineHeight = 1.15
  const fit = fitMultilineText({
    text: content,
    maxWidth: Math.max(8, width - INSET_X * 2),
    maxHeight: Math.max(8, height - INSET_Y * 2),
    maxSize: 14,
    minSize: 5,
  })
  const blockHeight = (fit.lines.length - 1) * fit.size * lineHeight
  const firstDy = -blockHeight / 2
  const stepDy = fit.size * lineHeight

  const textEl = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'text',
  ) as SVGTextElement
  textEl.setAttribute('data-fp-merged', '1')
  textEl.setAttribute('data-merged-label', 'name')
  textEl.setAttribute('data-cluster-booths', clusterBooths)
  textEl.setAttribute('x', String(x))
  textEl.setAttribute('y', String(y))
  textEl.setAttribute('text-anchor', 'middle')
  textEl.setAttribute('dominant-baseline', 'central')
  textEl.setAttribute('font-family', 'DM Sans, sans-serif')
  textEl.setAttribute('font-weight', '700')
  textEl.setAttribute('font-size', String(fit.size))
  textEl.setAttribute('fill', '#2C2C2C')
  textEl.setAttribute('pointer-events', 'none')

  for (let i = 0; i < fit.lines.length; i++) {
    const tspan = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'tspan',
    ) as SVGTSpanElement
    tspan.setAttribute('x', String(x))
    tspan.setAttribute('dy', String(i === 0 ? firstDy : stepDy))
    tspan.textContent = fit.lines[i]
    textEl.appendChild(tspan)
  }
  outerG.appendChild(textEl)
}

/**
 * Drop a centred text label inside a single booth rect, projected out
 * of any nested transforms into the outer scaled-group's coord space.
 * Auto-shrinks to fit; ellipses if it still overflows at minFontSize.
 */
function addRectLabel({
  svg,
  outerG,
  outerCTM,
  rect,
  text: content,
  maxFontSize,
  minFontSize,
  weight,
}: {
  svg: SVGSVGElement
  outerG: SVGGElement
  outerCTM: DOMMatrix
  rect: SVGRectElement
  text: string
  maxFontSize: number
  minFontSize: number
  weight: number
}) {
  const x = parseFloat(rect.getAttribute('x') ?? '0')
  const y = parseFloat(rect.getAttribute('y') ?? '0')
  const w = parseFloat(rect.getAttribute('width') ?? '0')
  const h = parseFloat(rect.getAttribute('height') ?? '0')
  const rectCTM = rect.getCTM()
  if (!rectCTM) return

  const transform = outerCTM.inverse().multiply(rectCTM)
  const tl = svg.createSVGPoint()
  tl.x = x
  tl.y = y
  const br = svg.createSVGPoint()
  br.x = x + w
  br.y = y + h
  const pTL = tl.matrixTransform(transform)
  const pBR = br.matrixTransform(transform)
  const projW = pBR.x - pTL.x
  const projH = pBR.y - pTL.y
  const cx = (pTL.x + pBR.x) / 2
  const cy = (pTL.y + pBR.y) / 2

  const text = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'text',
  ) as SVGTextElement
  text.setAttribute('x', String(cx))
  text.setAttribute('y', String(cy))
  text.setAttribute('text-anchor', 'middle')
  text.setAttribute('dominant-baseline', 'central')
  text.setAttribute('font-family', 'DM Sans, sans-serif')
  text.setAttribute('font-weight', String(weight))
  text.setAttribute('fill', '#2C2C2C')
  text.setAttribute('pointer-events', 'none')
  text.setAttribute('data-fp-rect-label', '1')
  // Mirror the rect's data-booth onto the label so the filter
  // effect can dim/match this text alongside its booth. Without
  // this, single-booth vendor labels (Olivia, Golden, Vekalat)
  // stayed at full opacity while their booth dimmed around them.
  const boothNum = rect.getAttribute('data-booth')
  if (boothNum) text.setAttribute('data-booth', boothNum)
  text.textContent = content.trim()
  outerG.appendChild(text)
  fitTextWidth(
    text,
    projW * 0.85,
    Math.min(maxFontSize, projH * 0.55),
    minFontSize,
  )
}

