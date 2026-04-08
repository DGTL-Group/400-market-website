import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import RenderBlocks from '@/components/RenderBlocks'
import ScrollProgress from '@/components/ScrollProgress'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'privacy-policy' } },
    limit: 1,
  })

  const page = docs[0]
  if (!page) return { title: 'Privacy Policy' }

  return {
    title: page.meta?.metaTitle || 'Privacy Policy',
    description: page.meta?.metaDescription || 'Privacy policy for The 400 Market website.',
  }
}

export default async function PrivacyPolicyPage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'privacy-policy' } },
    limit: 1,
  })

  const page = docs[0]
  if (!page) notFound()

  return (
    <>
      <ScrollProgress />
      <RenderBlocks blocks={page.layout as never[]} />
    </>
  )
}
