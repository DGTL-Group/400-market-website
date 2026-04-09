/**
 * Direct-Postgres vendor seed script for The 400 Market.
 *
 * Usage: node scripts/seed-featured-vendors.mjs
 *
 * Seeds the first batch of profile-level vendors directly into the
 * Postgres tables Payload built for the `vendors` collection. This
 * sidesteps the Node 24 / Payload ESM loader bugs that currently block
 * `npx tsx src/seed/featured-vendors.ts` (see pre-launch-todo.md in
 * memory). When Payload is upgraded and those bugs are resolved, the
 * idiomatic `src/seed/featured-vendors.ts` version can take over.
 *
 * Idempotent: matches existing rows by `name` and does an UPSERT.
 * Photos are left NULL and will be uploaded via the Payload admin later.
 */

import { Client } from 'pg'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// Load .env.local without pulling in @next/env or payload internals.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
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
  console.error('❌ DATABASE_URI not set in .env.local')
  process.exit(1)
}

/** @typedef {{platform:'facebook'|'instagram'|'tiktok'|'twitter'|'other',url:string}} SocialLink */
/**
 * @typedef {{
 *   name: string,
 *   slug: string,
 *   boothNumber: string,
 *   category: string[],
 *   shortDescription: string,
 *   email?: string,
 *   phone?: string,
 *   website?: string,
 *   socialLinks?: SocialLink[],
 * }} FeaturedVendor
 */

/** @type {FeaturedVendor[]} */
const featuredVendors = [
  {
    name: 'Tropi-Tacos',
    slug: 'tropi-tacos',
    boothNumber: '1719',
    category: ['food'],
    shortDescription:
      'Bold, authentic Mexican flavours made fresh with tacos, house-made sauces, and refreshing drinks like Jamaica and Horchata.',
    email: 'info.tropitacos@gmail.com',
    phone: '647-562-3648',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/tropi.tacos' },
    ],
  },
  {
    name: 'Mucho Loco Latin Products',
    slug: 'mucho-loco-latin-products',
    boothNumber: '2403-04',
    category: ['retail'],
    shortDescription:
      'Authentic products from Mexico and across Latin America bringing culture and tradition closer to home.',
    email: 'info.mucholoco@gmail.com',
    phone: '705-905-6048',
    website: 'https://mucholoco.ca',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/mucholoco.ca' },
    ],
  },
  {
    name: 'Georgian Bay Liquidation',
    slug: 'georgian-bay-liquidation',
    boothNumber: '2501-03 / 1801-02',
    category: ['retail'],
    shortDescription:
      'Quality brand-name products at affordable prices including overstock, closeouts, and surplus inventory.',
    email: 'info@gofrecreation.com',
    phone: '705-627-8208',
    website: 'https://georgianbayliquidation.ca',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/gbliquidation' },
    ],
  },
  {
    name: 'Heat n Eat',
    slug: 'heat-n-eat',
    boothNumber: '1707',
    category: ['food'],
    shortDescription:
      'Homestyle soups, stews, and pastas served hot or available frozen for take-home convenience.',
    email: 'heateatenjoy@gmail.com',
    phone: '905-320-3408',
    website: 'https://heateat.ca',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/heatandeatbarrie' },
    ],
  },
  {
    name: 'Profiles Digital Media Inc.',
    slug: 'profiles-digital-media',
    boothNumber: '1403-04-05-06',
    category: ['health-beauty'],
    shortDescription:
      'A digital media brand offering curated beauty experiences and products through its Lip Lady Canada division.',
    email: 'info@pro-files.ca',
    phone: '705-817-8737',
    website: 'https://lipladycanada.com',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/lipladycanada' },
    ],
  },
]

async function upsertVendor(client, vendor) {
  const existing = await client.query('SELECT id FROM vendors WHERE name = $1 LIMIT 1', [vendor.name])

  let vendorId
  let action
  if (existing.rows.length > 0) {
    vendorId = existing.rows[0].id
    await client.query(
      `UPDATE vendors
         SET slug = $1,
             booth_number = $2,
             short_description = $3,
             email = $4,
             phone = $5,
             website = $6,
             active = TRUE,
             _status = 'published',
             updated_at = NOW()
       WHERE id = $7`,
      [
        vendor.slug,
        vendor.boothNumber,
        vendor.shortDescription,
        vendor.email ?? null,
        vendor.phone ?? null,
        vendor.website ?? null,
        vendorId,
      ],
    )
    action = 'updated'
  } else {
    const inserted = await client.query(
      `INSERT INTO vendors
         (name, slug, booth_number, short_description, email, phone, website,
          active, _status, updated_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, 'published', NOW(), NOW())
       RETURNING id`,
      [
        vendor.name,
        vendor.slug,
        vendor.boothNumber,
        vendor.shortDescription,
        vendor.email ?? null,
        vendor.phone ?? null,
        vendor.website ?? null,
      ],
    )
    vendorId = inserted.rows[0].id
    action = 'created'
  }

  // Replace the category rows for this vendor (simplest idempotent path).
  await client.query('DELETE FROM vendors_category WHERE parent_id = $1', [vendorId])
  for (let i = 0; i < vendor.category.length; i++) {
    await client.query(
      `INSERT INTO vendors_category ("order", parent_id, value)
       VALUES ($1, $2, $3)`,
      [i + 1, vendorId, vendor.category[i]],
    )
  }

  // Same for social links.
  await client.query('DELETE FROM vendors_social_links WHERE _parent_id = $1', [vendorId])
  if (vendor.socialLinks && vendor.socialLinks.length > 0) {
    for (let i = 0; i < vendor.socialLinks.length; i++) {
      const link = vendor.socialLinks[i]
      // `id` in this table is a text field Payload uses for row identity
      // inside arrays; any unique string works.
      const rowId = `${vendor.slug}-${link.platform}-${i + 1}`
      await client.query(
        `INSERT INTO vendors_social_links (_order, _parent_id, id, platform, url)
         VALUES ($1, $2, $3, $4, $5)`,
        [i + 1, vendorId, rowId, link.platform, link.url],
      )
    }
  }

  return { vendorId, action }
}

async function main() {
  console.log('Seeding featured vendor profiles via Postgres...')
  const client = new Client({ connectionString: DATABASE_URI })
  await client.connect()

  let created = 0
  let updated = 0
  for (const vendor of featuredVendors) {
    try {
      const { vendorId, action } = await upsertVendor(client, vendor)
      const icon = action === 'created' ? '+' : '~'
      console.log(`  ${icon} ${action.padEnd(7)} #${vendorId}  ${vendor.name}  (booth ${vendor.boothNumber})`)
      if (action === 'created') created++
      else updated++
    } catch (err) {
      console.error(`  ! error on ${vendor.name}:`, err.message)
    }
  }

  await client.end()

  console.log('')
  console.log(`Done. Created: ${created}, Updated: ${updated}, Total: ${featuredVendors.length}`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
