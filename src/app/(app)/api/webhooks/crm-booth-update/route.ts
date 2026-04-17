import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * CRM → website webhook for booth state changes.
 *
 * n8n (or any CRM integration) POSTs here whenever a booth moves between
 * states (available → reserved → rented → available …).
 *
 * Auth: bearer token via the `Authorization: Bearer <token>` header,
 * compared against `process.env.CRM_WEBHOOK_TOKEN` using a constant-time
 * compare. In non-production environments, setting
 * `CRM_WEBHOOK_DEV_BYPASS=true` skips the check entirely (useful for
 * local curl testing). The bypass is HARD-WIRED off in production — if
 * the env var is accidentally left on a production deploy, we still
 * require the real token.
 *
 * Payload shape (all lowercase keys, JSON body):
 *   {
 *     boothNumber?: string,        // one of boothNumber / crmId required
 *     crmId?:       string,
 *     status:       'available' | 'reserved' | 'rented' | 'blocked',
 *     vendorSlug?:  string,         // required when status = 'rented'
 *     reservationGroup?: string,
 *     reservedUntil?:    string,    // ISO 8601
 *     notes?:            string,
 *   }
 *
 * Responses:
 *   200 { ok: true,  boothNumber, status }       — booth updated
 *   200 { ok: true,  warning: 'booth not found', boothNumber }
 *                                                 — no matching booth, logged
 *                                                   to sync-errors for review
 *   400 { error: '...' }                         — bad payload shape
 *   401 { error: 'unauthorized' }                — missing / wrong token
 *
 * On success we `revalidateTag('booths')` — a cheap, targeted cache bust
 * that only invalidates fetches tagged with `'booths'`. Using
 * `revalidatePath` per webhook would nuke whole-page caches on every
 * booth flip.
 */

// Type-safe union of valid statuses. Kept in lockstep with
// src/collections/Booths.ts status options.
const VALID_STATUSES = ['available', 'reserved', 'rented', 'blocked'] as const
type BoothStatus = (typeof VALID_STATUSES)[number]

type WebhookBody = {
  boothNumber?: string
  crmId?: string
  status?: string
  vendorSlug?: string
  reservationGroup?: string
  reservedUntil?: string
  notes?: string
}

export async function POST(req: Request) {
  // ── 1. Authentication ────────────────────────────────────────────────
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // ── 2. Parse + validate body ────────────────────────────────────────
  let body: WebhookBody
  try {
    body = (await req.json()) as WebhookBody
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const { boothNumber, crmId, status, vendorSlug, reservationGroup, reservedUntil, notes } = body

  if (!boothNumber && !crmId) {
    return NextResponse.json(
      { error: 'one of boothNumber or crmId is required' },
      { status: 400 },
    )
  }

  if (!status || !VALID_STATUSES.includes(status as BoothStatus)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    )
  }

  // Consistency: rented must come with a vendor.
  if (status === 'rented' && !vendorSlug) {
    return NextResponse.json(
      { error: 'vendorSlug is required when status is "rented"' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })

  // ── 3. Find the booth (crmId first, then boothNumber fallback) ───────
  let boothId: string | number | null = null

  if (crmId) {
    const byCrmId = await payload.find({
      collection: 'booths',
      where: { crmId: { equals: crmId } },
      limit: 1,
      depth: 0,
    })
    if (byCrmId.docs[0]) boothId = byCrmId.docs[0].id
  }

  if (!boothId && boothNumber) {
    const byNumber = await payload.find({
      collection: 'booths',
      where: { boothNumber: { equals: boothNumber } },
      limit: 1,
      depth: 0,
    })
    if (byNumber.docs[0]) boothId = byNumber.docs[0].id
  }

  // ── 4. No match? Log + return warning (do NOT auto-create). ─────────
  if (!boothId) {
    const reason = crmId
      ? `No booth found for crmId "${crmId}"` +
        (boothNumber ? ` or boothNumber "${boothNumber}"` : '')
      : `No booth found for boothNumber "${boothNumber}"`

    try {
      await payload.create({
        collection: 'sync-errors',
        data: {
          timestamp: new Date().toISOString(),
          source: 'webhook',
          reason,
          payload: body,
          resolved: false,
        },
      })
    } catch (err) {
      // Don't fail the webhook because the error log failed. Just note it.
      // eslint-disable-next-line no-console
      console.error('[crm-booth-update] Failed to log sync error:', err)
    }

    return NextResponse.json(
      { ok: true, warning: 'booth not found', boothNumber, crmId },
      { status: 200 },
    )
  }

  // ── 5. Resolve vendor (if provided) ─────────────────────────────────
  let vendorId: string | number | null = null
  if (vendorSlug) {
    const { docs: vendors } = await payload.find({
      collection: 'vendors',
      where: { slug: { equals: vendorSlug } },
      limit: 1,
      depth: 0,
    })
    const vendor = vendors[0]
    if (!vendor) {
      // Log, and fall through — we still update the booth's status, but
      // clear the vendor. CRM should notice the warning and fix the slug.
      try {
        await payload.create({
          collection: 'sync-errors',
          data: {
            timestamp: new Date().toISOString(),
            source: 'webhook',
            reason: `Vendor slug "${vendorSlug}" not found; booth will have no vendor relation`,
            payload: body,
            resolved: false,
          },
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[crm-booth-update] Failed to log vendor-miss:', err)
      }
    } else {
      vendorId = vendor.id
    }
  }

  // ── 6. Update the booth. ────────────────────────────────────────────
  //
  // Payload's postgres adapter writes each `update` as a single atomic
  // row update. A transaction only matters if we were doing read-then-
  // write across multiple rows, which we aren't — the find above is
  // only for resolving IDs. Two concurrent webhook calls for the same
  // booth serialize at the DB level; the second write wins, which is
  // fine because the CRM is the source of truth.
  try {
    await payload.update({
      collection: 'booths',
      id: boothId,
      data: {
        status: status as BoothStatus,
        vendor: status === 'rented' || status === 'reserved' ? vendorId : null,
        reservationGroup:
          status === 'reserved' && !vendorId ? reservationGroup ?? null : null,
        reservedUntil: reservedUntil ?? null,
        notes: notes ?? null,
        lastSyncedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[crm-booth-update] Booth update failed:', err)
    return NextResponse.json({ error: 'update failed' }, { status: 500 })
  }

  // ── 7. Bust the floor-plan cache. ───────────────────────────────────
  revalidateTag('booths')

  return NextResponse.json({
    ok: true,
    boothNumber,
    status,
  })
}

/* ---------------------------------------------------------------------
 *  Helpers
 * ------------------------------------------------------------------- */

function isAuthorized(req: Request): boolean {
  const expected = process.env.CRM_WEBHOOK_TOKEN

  // Dev bypass — only honored outside production. If you forget to unset
  // it, NODE_ENV will prevent accidental bypass on real deploys.
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.CRM_WEBHOOK_DEV_BYPASS === 'true'
  ) {
    return true
  }

  if (!expected) {
    // No token configured — reject everything. Safer than "allow all".
    // eslint-disable-next-line no-console
    console.error(
      '[crm-booth-update] CRM_WEBHOOK_TOKEN is not set; rejecting request.',
    )
    return false
  }

  const header = req.headers.get('authorization') ?? ''
  const prefix = 'Bearer '
  if (!header.startsWith(prefix)) return false
  const provided = header.slice(prefix.length).trim()

  return timingSafeEqual(provided, expected)
}

/** Constant-time string compare. Short-circuits only on length mismatch. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}
