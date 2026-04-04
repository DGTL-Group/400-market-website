import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const source = resolve(root, 'public/logo-source.png')

const sizes = [16, 32, 48, 96, 192, 512]

for (const size of sizes) {
  const png = await sharp(source)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  if (size === 32) {
    writeFileSync(resolve(root, 'src/app/favicon.ico'), png)
    console.log(`favicon.ico (${size}x${size})`)
  }

  writeFileSync(resolve(root, `public/favicon-${size}x${size}.png`), png)
  console.log(`favicon-${size}x${size}.png`)
}

// Next.js App Router icon (used automatically)
const icon = await sharp(source)
  .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()
writeFileSync(resolve(root, 'src/app/icon.png'), icon)
console.log('src/app/icon.png (32x32)')

// Apple touch icon (Next.js auto-detects in app dir)
const apple = await sharp(source)
  .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()
writeFileSync(resolve(root, 'src/app/apple-icon.png'), apple)
console.log('src/app/apple-icon.png (180x180)')

// OG image / large icon
const og = await sharp(source)
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()
writeFileSync(resolve(root, 'public/og-icon.png'), og)
console.log('public/og-icon.png (512x512)')

console.log('Done!')
