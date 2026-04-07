import type {
  CollectionConfig,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'
import { isAuthenticated } from './access'

const CLOUDINARY_ENABLED = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
)

const BACKUP_DIR = path.join(process.cwd(), 'cloudinary-backup')

/**
 * Mirror every Cloudinary upload into a local cloudinary-backup/ folder.
 * Lets us re-upload everything to a different Cloudinary account when we
 * later swap from Will's account to the market owner's, without depending
 * on the old account staying alive.
 */
const backupAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation }) => {
  if (!CLOUDINARY_ENABLED) return doc
  if (!doc?.url || !doc?.filename) return doc
  // Skip updates that don't change the file (e.g. just editing alt text)
  if (operation === 'update' && previousDoc?.url === doc.url) return doc

  try {
    await mkdir(BACKUP_DIR, { recursive: true })
    const res = await fetch(doc.url as string)
    if (!res.ok) {
      console.warn(`[media backup] Failed to fetch ${doc.url}: ${res.status}`)
      return doc
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    await writeFile(path.join(BACKUP_DIR, doc.filename as string), buffer)
    console.log(`[media backup] Saved ${doc.filename}`)
  } catch (err) {
    console.error(`[media backup] Error backing up ${doc.filename}:`, err)
  }
  return doc
}

const backupAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  if (!CLOUDINARY_ENABLED) return
  if (!doc?.filename) return
  try {
    await unlink(path.join(BACKUP_DIR, doc.filename as string))
    console.log(`[media backup] Removed ${doc.filename}`)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`[media backup] Error deleting backup ${doc.filename}:`, err)
    }
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'filename', 'updatedAt'],
  },
  access: {
    read: () => true, // public — images served via Cloudinary CDN
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  hooks: {
    afterChange: [backupAfterChange],
    afterDelete: [backupAfterDelete],
  },
  upload: {
    // Disable local storage when Cloudinary creds are present — files go to the CDN instead.
    // Without creds (local dev fallback), files land in the project's media/ folder.
    disableLocalStorage: CLOUDINARY_ENABLED,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
    // No `imageSizes` here on purpose: Cloudinary handles resizing on-the-fly
    // via URL transformations (e.g. /w_400,h_300,c_fill/) so generating sharp
    // derivatives and uploading each as a separate Cloudinary asset would just
    // create duplicates. Use Cloudinary URL params at render time instead.
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
      admin: {
        description: 'Describe the image for screen readers and SEO.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      admin: {
        description: 'Optional caption displayed below the image.',
      },
    },
  ],
}
