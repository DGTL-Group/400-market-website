import type { Metadata } from 'next'
import type { Where } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import PageLayout from '@/components/PageLayout'
import NewsCard from '@/components/NewsCard'
import TagFilter from '@/components/TagFilter'

export const metadata: Metadata = {
  title: 'News',
  description: 'The latest news, updates, and stories from The 400 Market in Innisfil, Ontario.',
}

type Props = {
  searchParams: Promise<{ tag?: string; page?: string }>
}

export default async function NewsPage({ searchParams }: Props) {
  const { tag, page } = await searchParams
  const currentPage = Number(page) || 1
  const perPage = 9

  const payload = await getPayload({ config })

  const where: Where = {}
  if (tag) {
    where.tags = { contains: tag }
  }

  const { docs: posts, totalPages } = await payload.find({
    collection: 'news',
    where,
    sort: '-publishDate',
    limit: perPage,
    page: currentPage,
  })

  return (
    <PageLayout showCheckmark>
      <section className="max-w-content mx-auto px-6 md:px-20 py-12">
        <h1 className="font-display text-display-lg uppercase tracking-wide mb-8">NEWS</h1>

        <div className="mb-8">
          <TagFilter />
        </div>

        {posts.length === 0 ? (
          <p className="text-text-secondary text-body-md py-12 text-center">
            No posts found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const image = post.featuredImage as { url?: string; alt?: string } | undefined
              return (
                <NewsCard
                  key={post.id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt || undefined}
                  featuredImage={image ? { url: image.url, alt: image.alt } : undefined}
                  publishDate={post.publishDate}
                />
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/news?${tag ? `tag=${tag}&` : ''}page=${p}`}
                className={`px-4 py-2 rounded-button text-body-sm font-semibold transition-colors duration-500 ${
                  p === currentPage
                    ? 'bg-brand-yellow text-brand-dark'
                    : 'bg-surface-light text-text-secondary hover:bg-brand-yellow/20'
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  )
}
