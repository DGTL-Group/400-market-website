import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE_URL = 'https://www.400market.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/about-us',
    '/vendors',
    '/events',
    '/shop',
    '/news',
    '/faq',
    '/become-a-vendor',
    '/contact-us',
    '/my-account',
    '/privacy-policy',
    '/terms-of-use',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }))

  // Dynamic routes from Payload collections
  const [vendors, events, news, products] = await Promise.all([
    payload.find({ collection: 'vendors', limit: 1000, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'events', limit: 1000, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'news', limit: 1000, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'products', limit: 1000, select: { slug: true, updatedAt: true } }),
  ])

  const vendorRoutes: MetadataRoute.Sitemap = vendors.docs.map((doc) => ({
    url: `${BASE_URL}/vendors/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const eventRoutes: MetadataRoute.Sitemap = events.docs.map((doc) => ({
    url: `${BASE_URL}/events/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const newsRoutes: MetadataRoute.Sitemap = news.docs.map((doc) => ({
    url: `${BASE_URL}/news/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.docs.map((doc) => ({
    url: `${BASE_URL}/shop/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...vendorRoutes, ...eventRoutes, ...newsRoutes, ...productRoutes]
}
