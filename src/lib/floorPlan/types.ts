/**
 * Type definitions for the interactive floor plan.
 *
 * Approach: the SVG at `public/images/floor-plan.svg` is the geometry +
 * visual layer. Every rentable booth rect inside it carries a
 * `data-booth="NNNN"` attribute (added by `scripts/brand-floor-plan.mjs`).
 * The server inlines the SVG, the client looks those rects up by booth
 * number and drives their status, tooltip, and click behaviour from the
 * `booths` Payload collection — no separate hotspot coordinate table.
 */

export type BoothStatus = 'available' | 'reserved' | 'rented' | 'blocked'

export type FloorPlanMode = 'homepage' | 'vendors' | 'become-a-vendor'

/**
 * Runtime view-model for a booth. The geometry lives in the SVG; this
 * record only carries CRM state + the metadata the tooltip/list need.
 */
export type BoothView = {
  number: string
  status: BoothStatus
  vendor: {
    id: string | number
    slug: string
    name: string
    category?: string[]
    photoUrl?: string | null
  } | null
  reservedUntil: string | null
  /** Optional section label (e.g. "North Wall", "1800") for the mobile list. */
  cluster?: string
}
