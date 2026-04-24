/**
 * Seed `vendors` + `booths` directly via Postgres from the Excel extract.
 *
 * Direct-SQL path (instead of tsx + Payload SDK) because tsx on Node 24
 * trips over the `payload-storage-cloudinary` package's missing exports —
 * same reason `scripts/seed-featured-vendors.mjs` also goes direct.
 *
 * Idempotent: upserts vendors by `slug` and updates booth rows in place.
 *
 * Pipeline
 *   1. `python scripts/extract-vendors.py` → src/seed/vendors-from-excel.json
 *   2. `node --env-file=.env.local scripts/seed-vendors-from-excel.mjs`
 *
 * Categories default to `['other']` (the Excel doesn't carry category
 * data). Management refines categories per vendor in the CMS later.
 */

import { Client } from 'pg'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// .env.local — load manually so this runs without @next/env.
for (const line of readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const value = trimmed.slice(eq + 1).trim()
  if (!(key in process.env)) process.env[key] = value
}

const DATABASE_URI = process.env.DATABASE_URI
if (!DATABASE_URI) {
  console.error('DATABASE_URI not set in .env.local')
  process.exit(1)
}

// Load extracted vendor JSON + the canonical booth list.
const seed = JSON.parse(
  readFileSync(path.join(ROOT, 'src/seed/vendors-from-excel.json'), 'utf8'),
)
const boothsGenTs = readFileSync(
  path.join(ROOT, 'src/lib/floorPlan/booth-numbers.generated.ts'),
  'utf8',
)
const BOOTH_NUMBERS = [...boothsGenTs.matchAll(/"([^"]+)"/g)].map((m) => m[1])
const SVG_BOOTHS = new Set(BOOTH_NUMBERS)

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

async function ensureBoothRows(client) {
  let created = 0
  let existing = 0
  for (const number of BOOTH_NUMBERS) {
    const r = await client.query('SELECT id FROM booths WHERE booth_number = $1 LIMIT 1', [number])
    if (r.rows.length > 0) {
      existing++
      continue
    }
    await client.query(
      `INSERT INTO booths (booth_number, status, updated_at, created_at)
       VALUES ($1, 'available', NOW(), NOW())`,
      [number],
    )
    created++
  }
  return { created, existing }
}

async function upsertVendor(client, v) {
  const slug = slugify(v.name)
  const primaryBooth = v.booths[0] ?? ''

  const existing = await client.query('SELECT id FROM vendors WHERE slug = $1 LIMIT 1', [slug])

  if (existing.rows.length > 0) {
    const id = existing.rows[0].id
    await client.query(
      `UPDATE vendors
         SET name = $1,
             booth_number = $2,
             email = $3,
             active = $4,
             _status = 'published',
             updated_at = NOW()
       WHERE id = $5`,
      [v.name, primaryBooth, v.email || null, !!v.active, id],
    )
    return { id, action: 'updated' }
  }

  const inserted = await client.query(
    `INSERT INTO vendors
       (name, slug, booth_number, email, active, _status, updated_at, created_at)
     VALUES ($1, $2, $3, $4, $5, 'published', NOW(), NOW())
     RETURNING id`,
    [v.name, slug, primaryBooth, v.email || null, !!v.active],
  )
  return { id: inserted.rows[0].id, action: 'created' }
}

async function setCategories(client, vendorId, categories) {
  await client.query('DELETE FROM vendors_category WHERE parent_id = $1', [vendorId])
  for (let i = 0; i < categories.length; i++) {
    await client.query(
      `INSERT INTO vendors_category ("order", parent_id, value) VALUES ($1, $2, $3)`,
      [i + 1, vendorId, categories[i]],
    )
  }
}

async function linkBooth(client, { boothNumber, vendorId, rented, noteCell, vendorName }) {
  const r = await client.query('SELECT id FROM booths WHERE booth_number = $1 LIMIT 1', [boothNumber])
  if (r.rows.length === 0) return { ok: false, reason: 'booth row missing' }

  if (rented) {
    await client.query(
      `UPDATE booths
         SET status = 'rented',
             vendor_id = $1,
             notes = $2,
             last_synced_at = NOW(),
             updated_at = NOW()
       WHERE id = $3`,
      [vendorId, `Seeded from Excel row: ${noteCell}`, r.rows[0].id],
    )
  } else {
    // Inactive vendor — don't push them onto the map, but keep a trace.
    await client.query(
      `UPDATE booths
         SET status = 'available',
             vendor_id = NULL,
             notes = $1,
             last_synced_at = NOW(),
             updated_at = NOW()
       WHERE id = $2`,
      [`Historical (inactive) occupant: ${vendorName} — ${noteCell}`, r.rows[0].id],
    )
  }
  return { ok: true }
}

async function main() {
  console.log(`Seeding ${seed.vendors.length} vendors from ${seed.sourceFile}...`)
  const client = new Client({ connectionString: DATABASE_URI })
  await client.connect()

  try {
    const { created: bc, existing: be } = await ensureBoothRows(client)
    console.log(`Booths: +${bc} created, ${be} already existed (total ${BOOTH_NUMBERS.length}).`)

    const claimed = new Set()
    let vCreated = 0
    let vUpdated = 0
    let vErrors = 0
    let bLinked = 0
    let bSkipped = 0
    const warnings = []

    for (const v of seed.vendors) {
      try {
        const { id: vendorId, action } = await upsertVendor(client, v)
        await setCategories(client, vendorId, ['other'])
        if (action === 'created') vCreated++
        else vUpdated++

        for (const booth of v.booths) {
          if (!SVG_BOOTHS.has(booth)) {
            bSkipped++
            warnings.push(`[${v.name}] booth ${booth} not in SVG — skipped.`)
            continue
          }
          if (claimed.has(booth)) {
            bSkipped++
            warnings.push(
              `[${v.name}] booth ${booth} already claimed by an earlier vendor — skipped.`,
            )
            continue
          }
          claimed.add(booth)
          const res = await linkBooth(client, {
            boothNumber: booth,
            vendorId,
            rented: !!v.active,
            noteCell: v.originalBoothsCell,
            vendorName: v.name,
          })
          if (res.ok) bLinked++
          else warnings.push(`[${v.name}] booth ${booth}: ${res.reason}`)
        }
      } catch (err) {
        vErrors++
        console.error(`  error on "${v.name}":`, err.message)
      }
    }

    console.log('')
    console.log(
      `Summary:\n` +
        `  Vendors: +${vCreated} created, ${vUpdated} updated, ${vErrors} errored\n` +
        `  Booth links: ${bLinked} set, ${bSkipped} skipped\n` +
        `  Available booths (no vendor): ${BOOTH_NUMBERS.length - claimed.size}`,
    )

    if (warnings.length) {
      console.log(`\n${warnings.length} warnings:`)
      warnings.slice(0, 40).forEach((w) => console.log(`  - ${w}`))
      if (warnings.length > 40) console.log(`  ...and ${warnings.length - 40} more`)
    }
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
