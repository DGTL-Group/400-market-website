# The 400 Market — Website Rebuild

> Built by [DGTL Group](https://dgtlgroup.io) · April 2026

A full migration from WordPress to a modern **Next.js + Payload CMS v3** monorepo.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + React (SSR) |
| CMS | Payload CMS v3 (same monorepo) |
| Database | PostgreSQL (self-hosted on VPS) |
| Styling | Tailwind CSS |
| Media CDN | Cloudinary |
| Payments | Stripe |
| Email — Transactional | AWS SES |
| Email — Newsletter | SendMails |
| Automation | n8n |
| Live Chat | OpenClaw (self-hosted AI) |
| Hosting | Hostinger Business (Node.js) |
| Analytics | Plausible (self-hosted) + Google Search Console |
| CI/CD | Gitea Actions → Hostinger auto-deploy |

---

## Project Timeline

| Phase | Weeks | Description |
|---|---|---|
| 01 — Audit & Alignment | W1–2 | Sitemap, content architecture, account setup |
| 02 — Design | W3–7 | Figma design system, all page mockups |
| 03 — CMS & Content | W6–9 | Payload scaffold, Neon DB, fresh copywriting |
| 04 — Development | W8–12 | React build, integrations (n8n, OpenClaw, Stripe) |
| 05 — QA & Testing | W12–13 | Cross-browser, performance, SEO, accessibility |
| 06 — Launch | W14 | DNS cutover, 301 redirects, go-live |

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the Payload admin panel is at `/admin`.

---

## Environment Variables

See `.env.example` for required keys:
- `DATABASE_URI` — PostgreSQL connection string (self-hosted on VPS)
- `PAYLOAD_SECRET` — Payload CMS secret
- `CLOUDINARY_*` — Cloudinary credentials
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `AWS_SES_*` — AWS SES credentials

---

## CMS Collections

- **Vendors** — merchant directory with floor map data
- **Events** — upcoming market events
- **News** — blog / news posts
- **Products** — online shop items
- **Pages** — managed static pages
- **FAQs** — frequently asked questions

---

*DGTL Group · Confidential Client Project*
