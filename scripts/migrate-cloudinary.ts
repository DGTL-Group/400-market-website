/**
 * Cloudinary account migration script.
 *
 * Use this when swapping Cloudinary accounts (e.g. from Will's account to the
 * market owner's account). It re-uploads every file from the local
 * `cloudinary-backup/` folder into the NEW Cloudinary account, then updates
 * each media doc's `url` (and image-size URLs) in Postgres so the site keeps
 * working without re-pointing anything by hand.
 *
 * --- HOW TO USE ---
 *
 * 1. Make sure `cloudinary-backup/` contains every file currently in the OLD
 *    Cloudinary account. The Media collection's afterChange hook keeps this
 *    in sync automatically — but if you suspect drift, run a quick dev upload
 *    of any missing items first.
 *
 * 2. Add the NEW Cloudinary credentials to `.env.local` (TEMPORARILY) under
 *    different variable names — leave the old ones in place so the running
 *    site still works:
 *
 *      NEW_CLOUDINARY_CLOUD_NAME=...
 *      NEW_CLOUDINARY_API_KEY=...
 *      NEW_CLOUDINARY_API_SECRET=...
 *
 * 3. Run: `npx tsx scripts/migrate-cloudinary.ts`
 *
 * 4. When the script finishes successfully:
 *      a) Replace the OLD CLOUDINARY_* vars with the NEW ones in `.env.local`.
 *      b) Remove the temporary NEW_CLOUDINARY_* vars.
 *      c) Do the same swap on Hostinger's environment variables panel.
 *      d) Restart the dev server and the production app.
 *
 * 5. Verify a handful of images load on the site, then you can safely delete
 *    the assets from the old Cloudinary account.
 *
 * --- WHAT IT DOES ---
 *
 * - Reads every doc from the `media` collection via Payload's local API.
 * - For each doc, reads the file bytes from `cloudinary-backup/{filename}`.
 *   If the local backup is missing, falls back to fetching from the doc's
 *   current `url` (which still points at the OLD account).
 * - Uploads the file to the NEW Cloudinary account using the cloudinary v2 SDK.
 * - Updates the media doc's `url` field to the new Cloudinary URL.
 * - Logs progress per file and a final summary.
 *
 * Image-size derivatives (thumbnail/card/hero) are regenerated automatically
 * by Cloudinary's on-the-fly transformations the next time they're requested,
 * so we only need to migrate the original.
 */

import { readFile } from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'
import { v2 as cloudinary } from 'cloudinary'
import config from '@payload-config'

const BACKUP_DIR = path.join(process.cwd(), 'cloudinary-backup')

async function main() {
  const newCloudName = process.env.NEW_CLOUDINARY_CLOUD_NAME
  const newApiKey = process.env.NEW_CLOUDINARY_API_KEY
  const newApiSecret = process.env.NEW_CLOUDINARY_API_SECRET

  if (!newCloudName || !newApiKey || !newApiSecret) {
    console.error(
      '[migrate-cloudinary] Missing NEW_CLOUDINARY_* env vars. See the comment block at the top of this file.',
    )
    process.exit(1)
  }

  cloudinary.config({
    cloud_name: newCloudName,
    api_key: newApiKey,
    api_secret: newApiSecret,
    secure: true,
  })

  const payload = await getPayload({ config })
  const { docs: mediaDocs } = await payload.find({
    collection: 'media',
    limit: 1000,
    depth: 0,
  })

  console.log(`[migrate-cloudinary] Found ${mediaDocs.length} media docs to migrate.`)

  let uploaded = 0
  let updated = 0
  let failed = 0

  for (const doc of mediaDocs) {
    const filename = doc.filename
    if (!filename) {
      console.warn(`[migrate-cloudinary] Skipping doc ${doc.id} — no filename.`)
      failed += 1
      continue
    }

    try {
      // 1. Get the file bytes — prefer local backup, fall back to current URL.
      let buffer: Buffer
      const backupPath = path.join(BACKUP_DIR, filename)
      try {
        buffer = await readFile(backupPath)
      } catch {
        if (!doc.url) throw new Error(`No backup file at ${backupPath} and no doc.url to fall back to.`)
        console.log(`[migrate-cloudinary] No local backup for ${filename}, fetching from ${doc.url}`)
        const res = await fetch(doc.url)
        if (!res.ok) throw new Error(`Fetch failed for ${doc.url}: ${res.status}`)
        buffer = Buffer.from(await res.arrayBuffer())
      }

      // 2. Upload to the NEW Cloudinary account.
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              public_id: path.parse(filename).name,
              resource_type: 'image',
              overwrite: true,
            },
            (err, result) => {
              if (err) return reject(err)
              if (!result) return reject(new Error('Empty Cloudinary upload result'))
              resolve(result as { secure_url: string })
            },
          )
          .end(buffer)
      })
      uploaded += 1
      console.log(`[migrate-cloudinary] Uploaded ${filename} → ${uploadResult.secure_url}`)

      // 3. Update the media doc's url to point at the new account.
      await payload.update({
        collection: 'media',
        id: doc.id,
        data: { url: uploadResult.secure_url },
      })
      updated += 1
    } catch (err) {
      failed += 1
      console.error(`[migrate-cloudinary] Failed for ${filename}:`, err)
    }
  }

  console.log('\n[migrate-cloudinary] DONE')
  console.log(`  uploaded: ${uploaded}`)
  console.log(`  doc urls updated: ${updated}`)
  console.log(`  failed: ${failed}`)

  if (failed > 0) {
    console.warn('\nSome files failed — review the errors above before swapping env vars.')
    process.exit(1)
  }

  console.log('\nNext steps:')
  console.log('  1. Replace CLOUDINARY_* in .env.local with the new account values')
  console.log('  2. Remove the temporary NEW_CLOUDINARY_* vars')
  console.log('  3. Do the same swap on Hostinger')
  console.log('  4. Restart dev + production servers')
  console.log('  5. Spot-check a few images on the live site')
  process.exit(0)
}

main().catch((err) => {
  console.error('[migrate-cloudinary] Fatal:', err)
  process.exit(1)
})
