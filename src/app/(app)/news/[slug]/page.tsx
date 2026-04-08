import type { Metadata } from 'next'
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import PageLayout from '@/components/PageLayout'
import Breadcrumb from '@/components/Breadcrumb'
import NewsCard from '@/components/NewsCard'
import ScrollProgress from '@/components/ScrollProgress'

type Props = {
  params: Promise<{ slug: string }>
}

// ISR: each post is prerendered at build time via generateStaticParams
// below, then refreshed at most once per hour. The News collection's
// afterChange hook also calls revalidatePath() for the specific slug, so
// admin edits show up instantly without waiting.
export const revalidate = 3600

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    limit: 1000,
    select: { slug: true },
  })
  return docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const post = docs[0]
  if (!post) return { title: 'Post Not Found' }

  const image = post.featuredImage as { url?: string } | undefined

  return {
    title: post.title,
    description: post.excerpt || `Read "${post.title}" on The 400 Market blog.`,
    openGraph: {
      images: image?.url ? [{ url: image.url }] : undefined,
    },
  }
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const post = docs[0]
  if (!post) notFound()

  const featuredImage = post.featuredImage as { url?: string; alt?: string } | undefined

  const date = new Date(post.publishDate).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Toronto',
  })

  // Fetch related posts (3 most recent, excluding current)
  const { docs: relatedPosts } = await payload.find({
    collection: 'news',
    where: { slug: { not_equals: slug } },
    sort: '-publishDate',
    limit: 3,
  })

  return (
    <PageLayout showCheckmark>
      <ScrollProgress />
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'News', href: '/news' },
          { label: post.title },
        ]}
      />

      {/* Featured image hero */}
      {featuredImage?.url && (
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
          <img
            src={featuredImage.url}
            alt={featuredImage.alt || post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title area */}
      <section className="max-w-content mx-auto px-6 md:px-20 pt-10 pb-6">
        <p className="text-body-md text-text-secondary mb-2">{date}</p>
        <h1 className="font-display text-display-lg uppercase tracking-wide font-bold">{post.title}</h1>
      </section>

      {/* Post content */}
      <article className="prose mx-auto max-w-content px-6 md:px-20">
        <RichText data={post.content as SerializedEditorState} />
      </article>

      {/* CTA banner — contained box per Figma */}
      <section className="max-w-content mx-auto px-6 md:px-20 py-12">
        <div className="bg-brand-yellow rounded-button px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-display-md md:text-display-lg uppercase tracking-wide text-brand-dark font-black">
              READY TO JOIN THE MARKET?
            </h2>
            <p className="font-body text-body-md text-text-primary mt-1">
              Apply for a booth today and join hundreds of thriving merchants.
            </p>
          </div>
          <Link
            href="/become-a-vendor"
            className="bg-brand-dark text-white px-6 py-4 font-bold text-[13px] rounded-button whitespace-nowrap hover:bg-text-secondary transition-colors duration-500"
          >
            BECOME A MERCHANT
          </Link>
        </div>
      </section>

      {/* Related posts */}
      <section className="max-w-content mx-auto px-6 md:px-20 pb-16">
        <h2 className="font-display text-display-md uppercase tracking-wide font-semibold mb-6">
          MORE FROM THE MARKET
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedPosts.length > 0 ? (
            relatedPosts.map((related) => {
              const img = related.featuredImage as { url?: string; alt?: string } | undefined
              return (
                <NewsCard
                  key={related.id}
                  title={related.title}
                  slug={related.slug}
                  excerpt={related.excerpt || undefined}
                  featuredImage={img ? { url: img.url, alt: img.alt } : undefined}
                  publishDate={related.publishDate}
                />
              )
            })
          ) : (
            <>
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-button border border-surface-light overflow-hidden">
                  <div className="w-full aspect-[16/9] bg-surface-light flex items-center justify-center text-text-subtle text-body-sm">
                    Coming soon
                  </div>
                  <div className="p-4">
                    <div className="h-3 w-20 bg-surface-light rounded mb-2" />
                    <div className="h-4 w-full bg-surface-light rounded mb-2" />
                    <div className="h-4 w-3/4 bg-surface-light rounded mb-3" />
                    <div className="h-3 w-24 bg-surface-light rounded" />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </PageLayout>
  )
}
