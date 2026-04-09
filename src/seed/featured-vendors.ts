/**
 * Featured vendor seed script for The 400 Market.
 *
 * Usage: npx tsx src/seed/featured-vendors.ts
 *
 * Seeds the first batch of profile-level vendors from the PDF vendor
 * profiles doc. Unlike `src/seed/index.ts` (which creates stub rows from
 * the master spreadsheet), this script writes full public-ready profiles
 * with description, socials, category, and `active: true` so they show
 * up on the homepage's Featured Vendors rail immediately.
 *
 * Idempotent: matches existing rows by `name` and updates in place, so
 * rerunning the script is safe. Photos are left blank and will be
 * uploaded via the Payload admin later.
 *
 * Prerequisites:
 * - DATABASE_URI and PAYLOAD_SECRET set in .env.local
 * - `retail` category added to Vendors.ts (already done)
 */

// Load .env.local manually BEFORE importing payload — Payload's own
// loadEnv.js currently crashes on Node 24 because of an ESM/CJS interop
// change in @next/env (see memory: pre-launch-todo.md). Calling
// loadEnvConfig ourselves sidesteps that entirely.
import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { getPayload } from 'payload'
import config from '@payload-config'

type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'other'

interface FeaturedVendor {
  name: string
  slug: string
  boothNumber: string
  category: string[]
  shortDescription: string
  email?: string
  phone?: string
  website?: string
  socialLinks?: { platform: SocialPlatform; url: string }[]
}

const featuredVendors: FeaturedVendor[] = [
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

async function seed() {
  console.log('🌱 Seeding featured vendor profiles...\n')

  const payload = await getPayload({ config })

  let created = 0
  let updated = 0
  let errors = 0

  for (const vendor of featuredVendors) {
    try {
      const existing = await payload.find({
        collection: 'vendors',
        where: { name: { equals: vendor.name } },
        limit: 1,
      })

      const data = {
        name: vendor.name,
        slug: vendor.slug,
        boothNumber: vendor.boothNumber,
        category: vendor.category as (
          | 'antiques'
          | 'collectibles'
          | 'clothing'
          | 'food'
          | 'home-decor'
          | 'jewelry'
          | 'crafts'
          | 'electronics'
          | 'books'
          | 'health-beauty'
          | 'sports'
          | 'toys'
          | 'retail'
          | 'services'
          | 'other'
        )[],
        shortDescription: vendor.shortDescription,
        email: vendor.email,
        phone: vendor.phone,
        website: vendor.website,
        socialLinks: vendor.socialLinks,
        active: true,
        _status: 'published' as const,
      }

      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'vendors',
          id: existing.docs[0].id,
          data,
        })
        console.log(`  🔁 Updated: ${vendor.name} (Booth: ${vendor.boothNumber})`)
        updated++
      } else {
        await payload.create({
          collection: 'vendors',
          data,
        })
        console.log(`  ✅ Created: ${vendor.name} (Booth: ${vendor.boothNumber})`)
        created++
      }
    } catch (err) {
      console.error(
        `  ❌ Error on ${vendor.name}:`,
        err instanceof Error ? err.message : err,
      )
      errors++
    }
  }

  console.log(`\n🌱 Seed complete!`)
  console.log(`   Created: ${created}`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Errors:  ${errors}`)
  console.log(`   Total:   ${featuredVendors.length}`)

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
