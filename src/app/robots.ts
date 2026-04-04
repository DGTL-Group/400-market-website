import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/staff/'],
    },
    sitemap: 'https://www.400market.com/sitemap.xml',
  }
}
