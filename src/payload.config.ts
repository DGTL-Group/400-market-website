import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudinaryStorage } from 'payload-storage-cloudinary'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users, Media, Vendors, Events, News, Products, FAQs, Pages } from '@/collections'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    suppressHydrationWarning: true, // TODO: remove before production — workaround for browser extension hydration mismatch
    theme: 'dark',
  },
  collections: [Users, Media, Vendors, Events, News, Products, FAQs, Pages],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      max: 20,
      idleTimeoutMillis: 30000,
    },
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  plugins: [
    // Cloudinary storage — only enabled when all 3 env vars are present.
    // Local fallback applies otherwise (useful during dev before creds are added).
    ...(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
      ? [
          cloudinaryStorage({
            cloudConfig: {
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET,
            },
            collections: {
              media: true,
            },
          }),
        ]
      : []),
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    disable: true,
  },
})
