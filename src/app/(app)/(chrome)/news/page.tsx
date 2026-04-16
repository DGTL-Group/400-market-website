import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import NewsListClient, { type ClientNewsPost } from '@/components/NewsListClient'

export const metadata: Metadata = {
  title: 'News',
  description:
    'The latest news, updates, and stories from The 400 Market in Innisfil, Ontario.',
}

// ISR: serve a cached static render and refresh in the background at most
// once per hour. The News collection's afterChange/afterDelete hooks also
// call revalidatePath('/news') for instant updates on edits, so this
// hour-long window is just the safety net.
export const revalidate = 3600

type Props = {
  searchParams: Promise<{ tag?: string; page?: string }>
}

export default async function NewsPage({ searchParams }: Props) {
  const { tag, page } = await searchParams
  const initialTag = tag ?? ''
  const initialPage = Number(page) || 1

  // Fetch ALL posts in one go and let the client component handle filter
  // and pagination locally — no server round-trip when the user clicks a
  // tag. The 1000-doc cap is just a safety net; the dataset is small.
  const payload = await getPayload({ config })
  const { docs: posts } = await payload.find({
    collection: 'news',
    sort: '-publishDate',
    limit: 1000,
  })

  const clientPosts: ClientNewsPost[] = posts.map((post) => {
    const image = post.featuredImage as
      | { url?: string | null; alt?: string | null }
      | null
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? null,
      publishDate: post.publishDate,
      tags: Array.isArray(post.tags) ? (post.tags as string[]) : [],
      featuredImage: image
        ? { url: image.url ?? null, alt: image.alt ?? null }
        : null,
    }
  })

  return (
    <section className="max-w-content mx-auto px-6 md:px-20 py-12">
      <h1 className="font-display text-display-lg md:text-display-xl uppercase tracking-wide mb-8">NEWS</h1>

      <NewsListClient
        posts={clientPosts}
        initialTag={initialTag}
        initialPage={initialPage}
      />
    </section>
  )
}
