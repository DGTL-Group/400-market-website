import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { FloorPlan } from '@/components/FloorPlan/FloorPlan'

export const metadata: Metadata = {
  title: 'Vendors',
  description:
    "Browse the makers, growers, and artisans of The 400 Market in Innisfil, Ontario. Shop local every Saturday and Sunday 9AM-5PM.",
}

// ISR: same 1-hour window as other listings. Vendor edits and booth
// webhooks both revalidate more aggressively:
//   - Vendors afterChange hook → revalidatePath('/vendors')
//   - Booth webhook             → revalidateTag('booths') (affects the map)
// so this is just the belt-and-braces safety net.
export const revalidate = 3600

// Keep in sync with src/collections/Vendors.ts category options.
const CATEGORY_LABEL: Record<string, string> = {
  antiques: 'ANTIQUES',
  collectibles: 'COLLECTIBLES',
  clothing: 'CLOTHING',
  food: 'FOOD & BEVERAGES',
  'home-decor': 'HOME DECOR',
  jewelry: 'JEWELRY',
  crafts: 'ARTS & CRAFTS',
  electronics: 'ELECTRONICS',
  books: 'BOOKS & MEDIA',
  'health-beauty': 'HEALTH & BEAUTY',
  sports: 'SPORTS',
  toys: 'TOYS & GAMES',
  retail: 'RETAIL',
  services: 'SERVICES',
  other: 'MARKET',
}

export default async function VendorsPage() {
  const payload = await getPayload({ config })

  const { docs: vendors } = await payload.find({
    collection: 'vendors',
    where: { active: { equals: true } },
    sort: 'name',
    limit: 500,
    pagination: false,
    depth: 1,
  })

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="bg-brand-yellow px-6 md:px-20 py-6 md:py-8">
        <div className="max-w-content mx-auto">
          <h1 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-2">
            OUR VENDORS
          </h1>
          <p className="font-body text-body-md text-brand-dark/80 max-w-2xl">
            Hundreds of makers, growers, and artisans under one roof. Click a
            booth on the map to jump to a vendor, or browse the list below.
          </p>
        </div>
      </section>

      {/* ─── FLOOR PLAN ─── */}
      <section className="bg-surface-light py-12 md:py-16">
        <div className="max-w-content mx-auto px-6 md:px-20">
          <FloorPlan mode="vendors" />
        </div>
      </section>

      {/* ─── VENDOR GRID ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-16 md:py-20">
        {vendors.length === 0 ? (
          <div className="text-center py-16 bg-surface-light/40 rounded-button">
            <p className="font-body text-body-md text-text-secondary">
              Vendor profiles coming soon. Check back in a few weeks!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {vendors.map((vendor) => {
              const photo = vendor.photo as
                | { url?: string | null; alt?: string | null }
                | null
              const categories = Array.isArray(vendor.category)
                ? (vendor.category as string[])
                : []
              const primary = categories[0] ?? 'other'
              const badgeLabel = CATEGORY_LABEL[primary] ?? primary.toUpperCase()

              return (
                // `id` = vendor.slug so floor plan clicks in `/vendors` mode
                // can scrollIntoView via `document.getElementById(slug)`.
                <Link
                  key={vendor.id}
                  id={vendor.slug}
                  href={`/vendors/${vendor.slug}`}
                  className="group flex flex-col bg-white border border-surface-light rounded-button overflow-hidden hover:border-brand-mango transition-colors duration-200"
                >
                  <div className="aspect-[4/3] bg-surface-light overflow-hidden">
                    {photo?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={photo.url}
                        alt={photo.alt || vendor.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-subtle font-body text-body-sm uppercase tracking-wider">
                        {vendor.name}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="inline-block self-start bg-brand-yellow text-brand-dark font-display text-caption uppercase tracking-wider px-2.5 py-1 rounded-button mb-3">
                      {badgeLabel}
                    </span>
                    <h3 className="font-body font-bold text-display-sm text-text-primary normal-case tracking-normal mb-1">
                      {vendor.name}
                    </h3>
                    <p className="font-body text-caption text-text-subtle mb-2">
                      Booth {vendor.boothNumber}
                    </p>
                    {vendor.shortDescription && (
                      <p className="font-body text-body-sm text-text-secondary line-clamp-3 mb-4">
                        {vendor.shortDescription}
                      </p>
                    )}
                    <span className="mt-auto font-body text-body-sm text-brand-mango font-semibold group-hover:text-brand-orange transition-colors duration-500 inline-flex items-center gap-1.5">
                      View profile
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 10h12M12 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
