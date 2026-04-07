import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import RenderBlocks from '@/components/RenderBlocks'
import ScrollProgress from '@/components/ScrollProgress'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'terms-of-use' } },
    limit: 1,
  })

  const page = docs[0]
  if (!page) return { title: 'Terms of Use' }

  return {
    title: page.meta?.metaTitle || 'Terms of Use',
    description: page.meta?.metaDescription || 'Terms of use for The 400 Market website.',
  }
}

export default async function TermsOfUsePage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'terms-of-use' } },
    limit: 1,
  })

  const page = docs[0]
  if (!page) notFound()

  return (
    <PageLayout>
      <ScrollProgress />
      <RenderBlocks blocks={page.layout as never[]} />
    </PageLayout>
  )
}
