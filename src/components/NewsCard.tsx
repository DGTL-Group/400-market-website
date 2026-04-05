import Link from 'next/link'

type NewsCardProps = {
  title: string
  slug: string
  excerpt?: string
  featuredImage?: {
    url?: string
    alt?: string
  }
  publishDate: string
}

export default function NewsCard({ title, slug, excerpt, featuredImage, publishDate }: NewsCardProps) {
  const date = new Date(publishDate).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Toronto',
  })

  return (
    <Link
      href={`/news/${slug}`}
      className="group block bg-white rounded-button overflow-hidden border border-surface-light hover:border-brand-yellow transition-colors duration-500"
    >
      <div className="relative w-full aspect-[16/9] bg-surface-light overflow-hidden">
        {featuredImage?.url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={featuredImage.url}
            alt={featuredImage.alt || title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-text-subtle text-body-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-caption text-text-secondary mb-1">{date}</p>
        <h3 className="font-body font-bold text-body-md text-text-primary mb-2 group-hover:text-brand-mango transition-colors duration-500">
          {title}
        </h3>
        {excerpt && (
          <p className="text-body-sm text-text-secondary line-clamp-2 mb-3">{excerpt}</p>
        )}
        <span className="text-body-sm font-semibold text-brand-mango group-hover:text-brand-orange transition-colors duration-500 inline-flex items-center gap-1">
          Read more <span className="inline-block group-hover:translate-x-1.5 transition-transform duration-500">&rarr;</span>
        </span>
      </div>
    </Link>
  )
}
