import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type RichContentBlock = {
  blockType: 'richContent'
  id?: string
  content: SerializedEditorState
}

type HeroBlock = {
  blockType: 'hero'
  id?: string
  heading: string
  subheading?: string
  ctaLabel?: string
  ctaLink?: string
}

type CallToActionBlock = {
  blockType: 'callToAction'
  id?: string
  heading: string
  body?: string
  buttonLabel: string
  buttonLink: string
  style?: 'primary' | 'secondary'
}

type Block = RichContentBlock | HeroBlock | CallToActionBlock | { blockType: string; id?: string }

export default function RenderBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        const key = ('id' in block && block.id) || i

        switch (block.blockType) {
          case 'richContent': {
            const b = block as RichContentBlock
            return (
              <section key={key} className="prose mx-auto max-w-content px-6 md:px-20 py-12">
                <RichText data={b.content} />
              </section>
            )
          }

          case 'hero': {
            const b = block as HeroBlock
            return (
              <section key={key} className="bg-brand-dark text-white px-6 md:px-20 py-16 text-center">
                <h1 className="font-display text-display-xl uppercase tracking-wide mb-4">
                  {b.heading}
                </h1>
                {b.subheading && (
                  <p className="font-body text-body-lg text-text-subtle max-w-2xl mx-auto">
                    {b.subheading}
                  </p>
                )}
                {b.ctaLabel && b.ctaLink && (
                  <Link href={b.ctaLink} className="btn-primary mt-8 inline-flex">
                    {b.ctaLabel}
                  </Link>
                )}
              </section>
            )
          }

          case 'callToAction': {
            const b = block as CallToActionBlock
            return (
              <section
                key={key}
                className={`px-6 md:px-20 py-16 text-center ${
                  b.style === 'secondary' ? 'bg-brand-dark text-white' : 'bg-brand-yellow text-brand-dark'
                }`}
              >
                <h2 className="font-display text-display-md uppercase tracking-wide mb-4">
                  {b.heading}
                </h2>
                {b.body && (
                  <p className="font-body text-body-md max-w-2xl mx-auto mb-8">
                    {b.body}
                  </p>
                )}
                <Link
                  href={b.buttonLink}
                  className={b.style === 'secondary' ? 'btn-primary' : 'btn-dark'}
                >
                  {b.buttonLabel}
                </Link>
              </section>
            )
          }

          default:
            return null
        }
      })}
    </>
  )
}
