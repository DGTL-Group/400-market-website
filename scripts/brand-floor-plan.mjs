/**
 * Transform the raw Serif-exported floor plan into a 400 Market–branded SVG.
 *
 * INPUT : public/images/floor-plan-source.svg (each booth is an empty rect
 *         with stroke:black; Serif-style ids)
 * OUTPUT: public/images/floor-plan.svg (same geometry, styled with the
 *         brand palette; CSS classes + `data-booth` attributes on every
 *         rentable booth so the React overlay can drive state/interactivity
 *         without re-touching the SVG)
 *
 * Why a script: 400+ individual rects × multiple stroke widths means inline
 * find/replace in an editor is error-prone. This is idempotent — re-run any
 * time after the source SVG is updated.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SRC = resolve('public/images/floor-plan-source.svg')
const OUT = resolve('public/images/floor-plan.svg')

let svg = readFileSync(SRC, 'utf8')

// 1. Strip every "fill:none;stroke:black;stroke-width:X.Xpx;" inline style.
//    These are applied uniformly across booths, the outer wall, restrooms,
//    doors, etc. — we re-apply via CSS classes below so overrides inherit.
svg = svg.replace(
  /\s+style="fill:none;stroke:black;stroke-width:[\d.]+px;"/g,
  '',
)

// 2. Tag the main perimeter path (the only path with this exact d-prefix).
svg = svg.replace(
  /<path d="M107\.143,1032\.62L107\.143,50\.718[^"]+"/,
  (m) => m.replace('<path ', '<path class="fp-outer-wall" '),
)

// 3. Tag special named rects / paths — these are NOT rentable booths, they
//    stay coloured by class and never receive a data-booth attribute.
//    Some get a `data-amenity` so the React layer can show a tooltip on
//    hover (e.g. "Men's Restroom", "Information Desk").
const tag = (idPattern, cls, amenity = null) => {
  const re = new RegExp(`<(rect|path) id="${idPattern}"`, 'g')
  svg = svg.replace(re, (_m, el) => {
    const amenityAttr = amenity ? ` data-amenity="${amenity}"` : ''
    return `<${el} class="${cls}"${amenityAttr} id="${idPattern}"`
  })
}
tag('Concession-Area', 'fp-concession', 'concession')
tag('Food', 'fp-food-storage')
tag('Food1', 'fp-food-storage')
tag('Food2', 'fp-food-storage')
tag('Food-Court1', 'fp-food-court-zone')
tag('INFO', 'fp-info', 'info-desk')
tag('Men-s-Restroom', 'fp-restroom', 'mens-restroom')
tag('Men-s-Restroom1', 'fp-restroom', 'mens-restroom')
tag('Women-Restroom', 'fp-restroom', 'womens-restroom')
tag('Women-Restroom1', 'fp-restroom', 'womens-restroom')
tag('Blocked', 'fp-blocked')

// 4. Tag food-court child rects — still rentable (food-court booths), so
//    they ALSO need a data-booth later. Just gives them the pale-orange
//    resting fill so they feel part of the food zone.
svg = svg.replace(
  /<g id="Food-Court"[^>]*>([\s\S]*?)<\/g>/,
  (_m, inner) => {
    const tagged = inner.replace(
      /<rect id="(_17\d{2})"/g,
      '<rect class="fp-food-court-booth" id="$1"',
    )
    return `<g id="Food-Court">${tagged}</g>`
  },
)

// 5. Tag door paths. Each <g id="Door-*"> wraps 2 <path> elements.
svg = svg.replace(
  /<g id="Door-[^"]+"[^>]*>[\s\S]*?<\/g>/g,
  (group) => group.replace(/<path /g, '<path class="fp-door" '),
)

// 6. Annotate every rentable booth with `data-booth="NNNN"` so the React
//    layer can attach interactivity and status styling without knowing SVG
//    geometry. The serif:id on each rect (or its wrapping <g>) is the
//    authoritative booth number from the source floor plan.
const trackedNumbers = new Set()
const collectNumber = (num) => {
  trackedNumbers.add(num)
}

// 6a. <rect ... serif:id="NNNN" ... /> — id sits directly on the rect.
svg = svg.replace(
  /<rect((?:(?!\/>)[^>])*?)serif:id="([^"]+)"((?:(?!\/>)[^>])*?)\/>/g,
  (match, before, num, after) => {
    if (match.includes('data-booth=')) return match
    // Skip if this rect was already tagged as a non-booth (class set above).
    if (/class="(fp-concession|fp-food-storage|fp-food-court-zone|fp-info|fp-restroom|fp-blocked)"/.test(match)) {
      return match
    }
    collectNumber(num)
    return `<rect${before}serif:id="${num}" data-booth="${num}"${after}/>`
  },
)

// 6b. <g serif:id="NNNN" transform="..."><rect .../></g> — the id is on the
//     parent group, not the rect. We need the data-booth on the rect so our
//     selector `rect[data-booth]` catches it.
svg = svg.replace(
  /<g([^>]*?)serif:id="(\d+[A-Z]?)"([^>]*)>\s*<rect((?:(?!\/>)[^>])*?)\/>\s*<\/g>/g,
  (match, gBefore, num, gAfter, rectAttrs) => {
    if (rectAttrs.includes('data-booth=')) return match
    collectNumber(num)
    return `<g${gBefore}serif:id="${num}"${gAfter}>
                <rect${rectAttrs} data-booth="${num}"/>
            </g>`
  },
)

// 7. Inject the style block inside the root <svg>.
const styleBlock = `  <style>
    /* Floor/shell */
    .fp-outer-wall {
      fill: #FFF8E7;
      stroke: #2C2C2C;
      stroke-width: 2.5;
      vector-effect: non-scaling-stroke;
    }

    /* Default: every unclassed rect is a rentable booth (available). */
    rect {
      fill: #F7D117;
      stroke: #2C2C2C;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
      transition: fill 150ms ease, stroke-width 120ms ease;
    }

    /* Interactive states driven by data-status on the rect. */
    rect[data-booth] { cursor: default; }
    rect[data-booth][data-status="rented"]   { fill: #FFFBEA; stroke: #2C2C2C; }
    rect[data-booth][data-status="reserved"] { fill: #F7941D; }
    rect[data-booth][data-status="blocked"]  { fill: #CFCFCF; stroke: #9A9A9A; }

    /* Pages that invite a click make available booths pop + pulse. */
    .fp-mode-become-a-vendor rect[data-booth][data-status="available"] {
      cursor: pointer;
    }
    .fp-mode-homepage        rect[data-booth][data-status="rented"],
    .fp-mode-vendors         rect[data-booth][data-status="rented"] {
      cursor: pointer;
    }

    /* Hover + focus styling is NOT applied here — the React layer
       renders a dedicated overlay rect on top of everything so the
       highlight never gets hidden behind neighbouring booths as the
       cursor moves around. Keyboard focus still shows the browser's
       default outline (removed only when we're rendering the overlay). */
    rect[data-booth]:focus-visible,
    [data-amenity]:focus-visible {
      outline: none;
    }

    /* Amenities (restrooms, info, concession) — hoverable but not
       clickable, so we flag them with a help cursor. */
    [data-amenity] { cursor: help; }

    /* Food court booths share the status system but keep their pale base. */
    .fp-food-court-booth {
      fill: #FDE2BF;
      stroke: #E57200;
      stroke-width: 0.8;
      vector-effect: non-scaling-stroke;
    }
    .fp-food-court-booth[data-status="rented"] { fill: #FFFBEA; }
    .fp-food-court-booth[data-status="reserved"] { fill: #F7941D; }

    /* Service/food zones */
    .fp-concession {
      fill: #F7941D;
      stroke: #2C2C2C;
      stroke-width: 1.2;
      vector-effect: non-scaling-stroke;
    }
    .fp-food-storage {
      fill: #E57200;
      stroke: #2C2C2C;
      stroke-width: 1.2;
      vector-effect: non-scaling-stroke;
    }
    .fp-food-court-zone {
      fill: none;
      stroke: #E57200;
      stroke-width: 1.8;
      stroke-dasharray: 4 3;
      vector-effect: non-scaling-stroke;
      pointer-events: none;
    }

    /* Special-purpose booths */
    .fp-info {
      fill: #2C2C2C;
      stroke: #F7D117;
      stroke-width: 1.5;
      vector-effect: non-scaling-stroke;
    }
    .fp-restroom {
      fill: #E6E6E6;
      stroke: #2C2C2C;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .fp-blocked {
      fill: #CFCFCF;
      stroke: #9A9A9A;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }

    /* Door openings */
    .fp-door {
      fill: none;
      stroke: #606060;
      stroke-width: 1.5;
      vector-effect: non-scaling-stroke;
      pointer-events: none;
    }
  </style>
`

svg = svg.replace(/(<svg[^>]*>)/, `$1\n${styleBlock}`)

writeFileSync(OUT, svg, 'utf8')

// Also emit a sibling file with just the booth numbers, for the seed
// script + anywhere else that wants the canonical list without parsing SVG.
const NUMBERS_OUT = resolve('src/lib/floorPlan/booth-numbers.generated.ts')
const sorted = [...trackedNumbers].sort((a, b) => {
  const na = Number(a.replace(/[^\d]/g, ''))
  const nb = Number(b.replace(/[^\d]/g, ''))
  return na - nb
})
const tsBody = `// @ts-nocheck
// AUTO-GENERATED by scripts/brand-floor-plan.mjs — DO NOT EDIT BY HAND.
// Regenerate: node scripts/brand-floor-plan.mjs

export const BOOTH_NUMBERS: readonly string[] = ${JSON.stringify(sorted, null, 2)} as const
`
writeFileSync(NUMBERS_OUT, tsBody, 'utf8')

console.log(
  `Wrote ${OUT} (${svg.length.toLocaleString()} bytes)\n` +
    `Wrote ${NUMBERS_OUT} (${sorted.length} booths)`,
)
