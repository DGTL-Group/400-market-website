import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'

type Block = {
  blockType: string
  id?: string
  [key: string]: unknown
}

export default function RenderBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case 'richContent':
            return (
              <section key={block.id || i} className="prose mx-auto max-w-content px-6 md:px-20 py-12">
                <RichText data={block.content as never} />
              </section>
            )

          case 'hero':
            return (
              <section
                key={block.id || i}
                className="bg-brand-dark text-white px-6 md:px-20 py-16 text-center"
              >
                <h1 className="font-display text-display-xl uppercase tracking-wide mb-4">
                  {block.heading as string}
                </h1>
                {typeof block.subheading === 'string' && (
                  <p className="font-body text-body-lg text-text-subtle max-w-2xl mx-auto">
                    {block.subheading}
                  </p>
                )}
                {block.ctaLabel && block.ctaLink && (
                  <Link href={block.ctaLink as string} className="btn-primary mt-8 inline-flex">
                    {block.ctaLabel as string}
                  </Link>
                )}
              </section>
            )

          case 'callToAction':
            return (
              <section
                key={block.id || i}
                className={`px-6 md:px-20 py-16 text-center ${
                  (block.style as string) === 'secondary'
                    ? 'bg-brand-dark text-white'
                    : 'bg-brand-yellow text-brand-dark'
                }`}
              >
                <h2 className="font-display text-display-md uppercase tracking-wide mb-4">
                  {block.heading as string}
                </h2>
                {typeof block.body === 'string' && (
                  <p className="font-body text-body-md max-w-2xl mx-auto mb-8">
                    {block.body}
                  </p>
                )}
                <Link
                  href={block.buttonLink as string}
                  className={
                    (block.style as string) === 'secondary' ? 'btn-primary' : 'btn-dark'
                  }
                >
                  {block.buttonLabel as string}
                </Link>
              </section>
            )

          default:
            return null
        }
      })}
    </>
  )
}
