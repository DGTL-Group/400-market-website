/**
 * Vendor seed script for The 400 Market.
 *
 * Usage: npx tsx src/seed/index.ts
 *
 * This script connects to the Payload CMS instance and creates vendor
 * records from the spreadsheet data. It is idempotent — running it
 * multiple times will skip vendors that already exist (matched by name).
 *
 * Prerequisites:
 * - DATABASE_URI and PAYLOAD_SECRET set in .env.local
 * - Database migrations have been run (npx payload migrate)
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { vendorSeedData } from './vendor-data'

async function seed() {
  console.log('🌱 Starting vendor seed...\n')

  const payload = await getPayload({ config })

  let created = 0
  let skipped = 0
  let errors = 0

  for (const vendor of vendorSeedData) {
    try {
      // Check if vendor already exists by name
      const existing = await payload.find({
        collection: 'vendors',
        where: { name: { equals: vendor.name } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        console.log(`  ⏭  Skipped (exists): ${vendor.name}`)
        skipped++
        continue
      }

      // Generate slug from name
      const slug = vendor.name
        .toLowerCase()
        .trim()
        .replace(/['']/g, '')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      await payload.create({
        collection: 'vendors',
        data: {
          name: vendor.name,
          slug,
          boothNumber: vendor.boothNumber,
          email: vendor.email || undefined,
          category: ['other'], // placeholder — management to update
          active: vendor.active,
          _status: 'published',
        },
      })

      console.log(`  ✅ Created: ${vendor.name} (Booth: ${vendor.boothNumber})`)
      created++
    } catch (err) {
      console.error(`  ❌ Error creating ${vendor.name}:`, err instanceof Error ? err.message : err)
      errors++
    }
  }

  console.log(`\n🌱 Seed complete!`)
  console.log(`   Created: ${created}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Errors:  ${errors}`)
  console.log(`   Total:   ${vendorSeedData.length}`)

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
