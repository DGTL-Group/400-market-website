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
const tag = (idPattern, cls, extras = {}) => {
  const re = new RegExp(`<(rect|path) id="${idPattern}"`, 'g')
  svg = svg.replace(re, (_m, el) => {
    const pieces = [`class="${cls}"`]
    if (extras.amenity) pieces.push(`data-amenity="${extras.amenity}"`)
    if (extras.booth) pieces.push(`data-booth="${extras.booth}"`)
    return `<${el} ${pieces.join(' ')} id="${idPattern}"`
  })
}

// Special-named rects that are also ACTUAL booths with a vendor on
// them. These keep the orange-food styling (so they're visually
// distinct from normal booths) but also carry data-booth="NNNN" so the
// CRM can route a vendor to them like any other booth.
tag('Food1', 'fp-food-storage', { booth: '1000' })        // Salty's Diner
tag('Food2', 'fp-food-storage', { booth: '1700' })        // Mundo Café
tag('Concession-Area', 'fp-food-storage', { booth: '3000' }) // Sunrise Kitchen

// Pure amenities — not bookable spaces, shown as tooltips only.
tag('Food', 'fp-food-storage')
tag('Food-Court1', 'fp-food-court-zone')
tag('INFO', 'fp-info', { amenity: 'info-desk' })
tag('Men-s-Restroom', 'fp-restroom', { amenity: 'mens-restroom' })
tag('Men-s-Restroom1', 'fp-restroom', { amenity: 'mens-restroom' })
tag('Women-Restroom', 'fp-restroom', { amenity: 'womens-restroom' })
tag('Women-Restroom1', 'fp-restroom', { amenity: 'womens-restroom' })
tag('Blocked', 'fp-blocked')

// 3b. Inject ATM markers — three small money-green squares the source
//    SVG doesn't have. Positions (in the local pre-3.125 coord space):
//      - just ABOVE the Concession area's top-right corner, sitting
//        outside the concession rect and flush with its top + right edges
//      - two side-by-side HUGGING the east (front) wall of the left-side
//        men's restroom (Men-s-Restroom1 ends at x=148.732), vertically
//        centred on the restroom (y centre = 682.879)
//    Each gets data-amenity="atm" so the tooltip describes it.
// Both restroom ATMs hug the east wall (x = 148.732 = Men-s-Restroom1's
// right edge) and stack vertically, centred on the restroom's midline
// (y centre = 682.879). Two 14-unit squares + 1-unit gap → 29 units
// total, top at 682.879 - 14.5 = 668.379.
const ATM_MARKUP = `
        <rect class="fp-atm" data-amenity="atm" id="ATM-Concession" x="1137" y="514" width="14" height="14"/>
        <rect class="fp-atm" data-amenity="atm" id="ATM-Restroom-L-1" x="148.732" y="668.379" width="14" height="14"/>
        <rect class="fp-atm" data-amenity="atm" id="ATM-Restroom-L-2" x="148.732" y="683.379" width="14" height="14"/>
    `
// Insert right before the closing </g> of the outer scaled group.
svg = svg.replace(/(\s*)<\/g>\s*<\/svg>/, `${ATM_MARKUP}$1</g>\n</svg>`)

// 4. Tag food-court child rects — still rentable (food-court booths), so
//    they ALSO need a data-booth later. Also drop a FOOD COURT text
//    label in the middle of the zone so the area is obvious at a glance.
//    The Food-Court1 container rect is 755.658 × 124.767 starting at
//    (206.984, 372.408), so the centre sits at (584.813, 434.791).
svg = svg.replace(
  /<g id="Food-Court"[^>]*>([\s\S]*?)<\/g>/,
  (_m, inner) => {
    const tagged = inner.replace(
      /<rect id="(_17\d{2})"/g,
      '<rect class="fp-food-court-booth" id="$1"',
    )
    const label = `
        <text class="fp-food-court-label" x="584.813" y="414" font-size="14">FOOD COURT</text>`
    return `<g id="Food-Court">${tagged}${label}</g>`
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
// The three food/concession rects don't have numeric serif:ids — they
// were tagged with booth numbers in step 3 via extras.booth. Track them
// manually so they land in booth-numbers.generated.ts.
collectNumber('1000') // Food1 — Salty's Diner
collectNumber('1700') // Food2 — Mundo Café
collectNumber('3000') // Concession-Area — Sunrise Kitchen

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
    /* Available = white, rented = brand yellow, reserved = orange,
       blocked = gray. Flipped from the old scheme so the "taken"
       booths catch the eye rather than the empty ones. */
    rect {
      fill: #FFFFFF;
      stroke: #2C2C2C;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
      transition: fill 150ms ease, stroke-width 120ms ease;
    }

    /* Interactive states driven by data-status on the rect. */
    rect[data-booth] { cursor: default; }
    rect[data-booth][data-status="rented"]   { fill: #F7D117; stroke: #2C2C2C; }
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

    /* Search + legend filter states. React stamps data-filter="match"
       on hits and data-filter="dim" on everything else. Matches grow
       a mango stroke and gently pulse; dimmed elements fade to 25% so
       the map reads as a dimmed backdrop behind the spotlighted
       results. */
    [data-filter="dim"] {
      opacity: 0.22;
      transition: opacity 200ms ease;
    }
    [data-filter="match"] {
      opacity: 1;
      transition: opacity 200ms ease, stroke-width 200ms ease;
    }
    rect[data-filter="match"],
    path[data-filter="match"] {
      stroke: #E57200;
      stroke-width: 3;
      animation: fp-filter-pulse 1.8s infinite ease-in-out;
    }
    @keyframes fp-filter-pulse {
      0%, 100% { stroke-width: 3; }
      50%      { stroke-width: 5; }
    }
    /* When a filter is active, dim the outer wall + dev labels so the
       contrast between match and miss really pops. */
    [data-fp-label][data-filter="dim"] { opacity: 0.12; }

    /* Amenities (restrooms, info, concession) — hoverable but not
       clickable, so we flag them with a help cursor. */
    [data-amenity] { cursor: help; }

    /* Food-court booths — same status palette as regular booths plus a
       mango stroke so the whole zone reads as one block. */
    .fp-food-court-booth {
      fill: #FFFFFF;
      stroke: #E57200;
      stroke-width: 0.8;
      vector-effect: non-scaling-stroke;
    }
    .fp-food-court-booth[data-status="rented"]   { fill: #F7D117; }
    .fp-food-court-booth[data-status="reserved"] { fill: #F7941D; }

    /* FOOD COURT label — dropped in at step 4 below, positioned over
       the Food-Court1 zone rect. */
    .fp-food-court-label {
      fill: #E57200;
      font-family: 'METAFORA', 'DM Sans', sans-serif;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-anchor: middle;
      dominant-baseline: central;
      pointer-events: none;
    }

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

    /* ATM machines — money-green squares with a dark border. */
    .fp-atm {
      fill: #1F6B3B;
      stroke: #0C3B1E;
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
