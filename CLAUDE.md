# 400 Market Website Rebuild

## Project
Full WordPress → Next.js + Payload CMS v3 migration for The 400 Market (indoor market in Innisfil, Ontario). Built by DGTL Group (Will).

## Tech Stack
- Next.js 15 + React 19 (SSR)
- Payload CMS v3 (monorepo, same app)
- PostgreSQL (provider TBD)
- Tailwind CSS (configured with brand design system)
- Cloudinary (media CDN)
- Stripe (payments)
- Hosting: Hostinger Business (deploys from GitHub)

## Git
- Dual remote push: Gitea (primary) + GitHub (mirror)
- Default branch: main
- NEVER add Co-Authored-By or AI attribution to commit messages

## Dev
- Run dev server: `npm run dev` (from this directory on local drive)
- Node.js v24+ required
- Payload admin: /admin (needs DATABASE_URI in .env.local)

## Brand
- Fonts: METAFORA (headlines, always ALL CAPS) + DM Sans (body, 16px min)
- Colors: #F7D117 (yellow), #F7941D (orange), #E57200 (mango), #2C2C2C (dark), #606060 (gray), #EBEBEB (light)
- Brand guidelines: .claude/brand-voice-guidelines.md

## Figma
- File key: AXktZZeKZ1OIJybs60B2Yr
- 13 pages, wireframe sent for client approval

## Collections (Payload CMS)
Users, Media, Vendors, Events, News, Products, FAQs, Pages — all built in src/collections/
