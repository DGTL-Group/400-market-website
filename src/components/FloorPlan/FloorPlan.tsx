import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { BoothView, FloorPlanMode } from '@/lib/floorPlan/types'
import { BOOTH_NUMBERS } from '@/lib/floorPlan/booth-numbers.generated'
import { FloorPlanSVG } from './FloorPlanSVG'
import { FloorPlanMobileList } from './FloorPlanMobileList'

type Props = {
  mode: FloorPlanMode
}

/**
 * Read the branded floor-plan SVG off disk. Cached per-process in
 * production (the file only changes when we redeploy), but re-read
 * every request in development so `node scripts/brand-floor-plan.mjs`
 * + refresh lands immediately without a dev-server bounce.
 */
let cachedSvg: string | null = null
function loadFloorPlanSvg(): string {
  if (cachedSvg && process.env.NODE_ENV === 'production') return cachedSvg
  const path = join(process.cwd(), 'public', 'images', 'floor-plan.svg')
  cachedSvg = readFileSync(path, 'utf8')
  return cachedSvg
}

/**
 * Server wrapper for the interactive floor plan.
 *
 * Reads the branded SVG (the single source of truth for geometry) and
 * joins it with live booth state from the Payload `booths` collection.
 * Booths not yet in the DB default to `available` — the floor plan is
 * usable the moment the collection is empty.
 *
 * Fetches are tagged with `'booths'` so the CRM sync webhook can call
 * `revalidateTag('booths')` for cheap targeted busting.
 */
export async function FloorPlan({ mode }: Props) {
  const svgMarkup = loadFloorPlanSvg()

  let dbRecords = new Map<
    string,
    {
      status: BoothView['status']
      vendor: BoothView['vendor']
      reservedUntil: string | null
    }
  >()
  let errored = false

  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'booths',
      limit: 1000,
      depth: 1,
      pagination: false,
    })

    for (const booth of docs) {
      const vendor =
        booth.vendor && typeof booth.vendor === 'object'
          ? {
              id: booth.vendor.id,
              slug: (booth.vendor as { slug?: string }).slug ?? '',
              name: (booth.vendor as { name?: string }).name ?? '',
              category: (booth.vendor as { category?: string[] }).category ?? [],
              photoUrl:
                typeof (booth.vendor as { photo?: unknown }).photo === 'object' &&
                (booth.vendor as { photo?: { url?: string | null } }).photo
                  ? ((booth.vendor as { photo?: { url?: string | null } }).photo
                      ?.url ?? null)
                  : null,
            }
          : null
      dbRecords.set(booth.boothNumber, {
        status: booth.status as BoothView['status'],
        vendor,
        reservedUntil: (booth.reservedUntil as string | null) ?? null,
      })
    }

    if (process.env.NODE_ENV !== 'production') {
      const svgNumbers = new Set(BOOTH_NUMBERS)
      for (const num of dbRecords.keys()) {
        if (!svgNumbers.has(num)) {
          // eslint-disable-next-line no-console
          console.warn(
            `[FloorPlan] DB booth "${num}" has no matching rect in floor-plan.svg — not rendered.`,
          )
        }
      }
    }
  } catch (err) {
    errored = true
    // eslint-disable-next-line no-console
    console.error('[FloorPlan] Failed to fetch booth DB records:', err)
  }

  // One entry per booth in the SVG, overlaid with any DB state. Sections
  // (from BOOTH_NUMBERS ordering) become the mobile-list cluster tag.
  const boothViews: BoothView[] = BOOTH_NUMBERS.map((number) => {
    const rec = dbRecords.get(number)
    return {
      number,
      status: rec?.status ?? 'available',
      vendor: rec?.vendor ?? null,
      reservedUntil: rec?.reservedUntil ?? null,
      cluster: clusterFor(number),
    }
  })

  return (
    <div className="bg-white rounded-button border border-surface-light">
      {errored && (
        <div className="bg-brand-orange/10 border-b border-brand-orange/40 px-4 py-2 text-center">
          <p className="font-body text-caption text-brand-dark">
            Live booth status temporarily unavailable — showing default layout.
          </p>
        </div>
      )}
      <div className="hidden md:block">
        <FloorPlanSVG mode={mode} svgMarkup={svgMarkup} booths={boothViews} />
      </div>
      <div className="md:hidden">
        <FloorPlanMobileList mode={mode} booths={boothViews} />
      </div>
    </div>
  )
}

/**
 * Group booth numbers into human-friendly sections for the mobile list.
 * Best-effort: we match the numbering scheme used by the source floor
 * plan (hundreds block = a section, with named overrides for wall runs).
 */
function clusterFor(number: string): string {
  // A few special ranges that don't follow the hundreds convention.
  const n = Number(number.replace(/[^\d]/g, ''))
  if (!Number.isFinite(n)) return 'other'
  if (n >= 116 && n <= 150) return 'South Wall'
  if (n >= 151 && n <= 165) return 'West Wall'
  if (n >= 201 && n <= 235) return 'South Inner'
  if (n >= 236 && n <= 260) return 'East Wall'
  if (n >= 1700 && n <= 1725) return 'Food Court'
  if (n >= 2100 && n <= 2112) return 'Centre 2100'
  if (n >= 2200 && n <= 2208) return 'Centre 2200'
  if (n >= 2500 && n <= 2539) return 'North Wall'
  // Default: the hundreds block ("1800", "3700", …)
  const hundred = Math.floor(n / 100) * 100
  return `Section ${hundred}`
}
