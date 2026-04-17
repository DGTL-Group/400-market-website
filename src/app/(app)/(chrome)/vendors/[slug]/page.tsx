import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

type Props = { params: Promise<{ slug: string }> }

// Keep in sync with src/collections/Vendors.ts.
const CATEGORY_LABEL: Record<string, string> = {
  antiques: 'Antiques',
  collectibles: 'Collectibles',
  clothing: 'Clothing & Accessories',
  food: 'Food & Beverages',
  'home-decor': 'Home Decor',
  jewelry: 'Jewelry',
  crafts: 'Arts & Crafts',
  electronics: 'Electronics',
  books: 'Books & Media',
  'health-beauty': 'Health & Beauty',
  sports: 'Sports & Outdoors',
  toys: 'Toys & Games',
  retail: 'Retail',
  services: 'Services',
  other: 'Market',
}

const SOCIAL_LABEL: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'X / Twitter',
  other: 'Website',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'vendors',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const vendor = docs[0]
  if (!vendor) return { title: 'Vendor' }
  return {
    title: vendor.name,
    description:
      vendor.shortDescription ??
      `Visit ${vendor.name} at Booth ${vendor.boothNumber}, The 400 Market, Innisfil Ontario.`,
  }
}

export const revalidate = 3600

export default async function VendorDetailPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'vendors',
    where: { slug: { equals: slug }, active: { equals: true } },
    limit: 1,
    depth: 1,
  })

  const vendor = docs[0]
  if (!vendor) notFound()

  const photo = vendor.photo as
    | { url?: string | null; alt?: string | null }
    | null
  const categories = Array.isArray(vendor.category) ? (vendor.category as string[]) : []
  const socialLinks = Array.isArray(vendor.socialLinks)
    ? (vendor.socialLinks as Array<{ platform: string; url: string }>)
    : []

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="bg-brand-yellow px-6 md:px-20 py-6 md:py-8">
        <div className="max-w-content mx-auto">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1.5 font-body text-body-sm text-brand-dark/80 hover:text-brand-dark mb-3"
          >
            <span aria-hidden>←</span> Back to all vendors
          </Link>
          <h1 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide text-brand-dark font-black mb-2">
            {vendor.name}
          </h1>
          <p className="font-body text-body-md text-brand-dark/80">
            Booth {vendor.boothNumber}
          </p>
        </div>
      </section>

      {/* ─── DETAIL ─── */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Photo */}
          <div className="bg-surface-light rounded-button aspect-[4/3] overflow-hidden">
            {photo?.url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photo.url}
                alt={photo.alt || vendor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-subtle font-body text-body-sm uppercase tracking-wider">
                {vendor.name}
              </div>
            )}
          </div>

          {/* Body */}
          <div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {categories.map((c) => (
                  <span key={c} className="badge">
                    {CATEGORY_LABEL[c] ?? c}
                  </span>
                ))}
              </div>
            )}

            {vendor.shortDescription && (
              <p className="font-body text-body-lg text-text-primary leading-relaxed mb-6">
                {vendor.shortDescription}
              </p>
            )}

            {/* Contact + links */}
            <dl className="space-y-2 mb-8">
              {vendor.website && (
                <div className="flex gap-2">
                  <dt className="font-body text-body-sm font-semibold text-text-primary min-w-[80px]">
                    Website:
                  </dt>
                  <dd>
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-body-sm text-brand-mango hover:text-brand-orange underline"
                    >
                      {vendor.website}
                    </a>
                  </dd>
                </div>
              )}
              {vendor.phone && (
                <div className="flex gap-2">
                  <dt className="font-body text-body-sm font-semibold text-text-primary min-w-[80px]">
                    Phone:
                  </dt>
                  <dd className="font-body text-body-sm text-text-secondary">
                    {vendor.phone}
                  </dd>
                </div>
              )}
            </dl>

            {socialLinks.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display text-caption uppercase tracking-wider text-text-secondary mb-3">
                  Follow
                </h3>
                <ul className="flex flex-wrap gap-3">
                  {socialLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-body-sm text-brand-dark border border-surface-light hover:border-brand-mango rounded-button px-3 py-1.5 transition-colors duration-200"
                      >
                        {SOCIAL_LABEL[link.platform] ?? link.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              href={`/vendors#${vendor.slug}`}
              className="btn-outline inline-flex items-center gap-1.5"
            >
              View in floor plan
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
