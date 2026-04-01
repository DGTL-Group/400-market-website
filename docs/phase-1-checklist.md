# The 400 Market — Phase 1 Content & Account Checklist

> Phase 1 · DGTL Group · April 2026

---

## Account & Integration Checklist

> Legend: [x] = confirmed access / complete · [ ] = action still needed

| # | Service | Purpose | Action Needed | Owner | Done |
|---|---|---|---|---|---|
| 1 | **PostgreSQL** (self-hosted, VPS) | Payload CMS database — replaces Neon | Provision PostgreSQL container on DGTL VPS, create DB + user, set `DATABASE_URI` in env | DGTL | [ ] |
| 2 | **Cloudinary** | Image CDN and asset storage | Confirm free 25 GB tier active, retrieve Cloud Name + API Key + API Secret | DGTL | [ ] |
| 3 | **Stripe** | Online shop payments | Access confirmed ✓ — create 3 Products + Prices (parking pass, $5 gift cert, $10 gift cert), retrieve publishable + secret keys + webhook secret | DGTL | [x] |
| 4 | **AWS SES** | Transactional email | Access confirmed ✓ — verify sending domain is active, confirm out of sandbox mode, retrieve credentials | DGTL | [x] |
| 5 | **SendMails** | Newsletter campaigns | Access confirmed ✓ — retrieve API key or signup embed code, confirm subscriber list is intact | DGTL | [x] |
| 6 | **n8n** (self-hosted, client VPS) | Automation workflows | Will be installed on client VPS — access confirmed ✓. Define workflows: contact form → SES, vendor application → notification, newsletter signup → SendMails | DGTL | [x] |
| 7 | **OpenClaw** (self-hosted, client VPS) | AI live chat widget | Will be installed on client VPS — access confirmed ✓. Configure knowledge base for 400 Market content, retrieve embed script | DGTL | [x] |
| 8 | **Hostinger Business** | Staging/production hosting | DGTL account ✓ — confirm Node.js 20+ slot is available for the Next.js app | DGTL | [x] |
| 9 | **Gitea + GitHub** | Source control (dual remote) | Both repos created and configured ✓ — dual push to git.dgtlgroup.io + github.com/will-dgtl on every commit | DGTL | [x] |
| 10 | **CI/CD** (Gitea Actions → Hostinger) | Auto-deploy on push | Configure Actions runner, create deploy workflow, store env secrets in repo — to be set up in Phase 4 | DGTL | [ ] |
| 11 | **Domain DNS** | Cutover from old site to new | Full DNS control confirmed ✓ — document current records (A, CNAME, MX, TXT), plan cutover timing for Week 14 | DGTL | [x] |
| 12 | **Plausible Analytics** (self-hosted) | Privacy-first analytics — replaces GA4 | Install Plausible on DGTL VPS, create site for `400market.com`, add tracking snippet to Next.js, set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | DGTL | [ ] |
| 13 | **Google Search Console** | SEO continuity during migration | Verify domain ownership via DNS TXT record (DGTL controls DNS ✓), submit new sitemap post-launch, monitor 301 redirect pickup and re-indexing | DGTL | [ ] |
| 14 | **Meta Pixel** | Paid social retargeting | Access confirmed ✓ — retrieve Pixel ID, add to Next.js via `NEXT_PUBLIC_META_PIXEL_ID` | DGTL | [x] |
| 15 | **WordPress** | Existing live site | Fully backed up ✓ — keep live until new site validated in production. Freeze date to be agreed before Phase 4 cutover | DGTL | [x] |

---

## Content Inventory & Migration Checklist

> All copy for the new site is written **fresh from scratch** — the existing site is reference only.
> Copy is collaborative: DGTL drafts, Client reviews and approves.

---

### Pages — New Copy Required

- [ ] **Home** — Hero headline + subheadline, intro paragraph, featured vendors blurb, events teaser blurb, CTAs (Visit Us, Become a Vendor, Shop Online)
- [ ] **About Us** — Market history and origin story, mission/values, description of the space, ownership/management bio(s)
- [ ] **Vendors** — Directory intro paragraph, "Become a Vendor" CTA blurb, individual vendor profiles (see Data section below)
- [ ] **Events** — Events landing intro, individual event descriptions (recurring + one-off)
- [ ] **Shop** — Shop intro copy, product descriptions for all 3 items, post-purchase confirmation message
- [ ] **Become a Vendor** — Value proposition, booth/space options and pricing, application process, form field copy
- [ ] **Contact Us** — Intro copy, form labels, response time expectation, alternate contact details
- [ ] **FAQ** — Question and answer pairs (Client provides raw questions — DGTL writes final copy)
- [ ] **Privacy Policy** — CASL-compliant (DGTL drafts, Client/lawyer approves)
- [ ] **Terms of Use** — E-commerce purchase terms (DGTL drafts, Client/lawyer approves)
- [ ] **404 Page** — Friendly error message copy and navigation recovery links

### Global / UI Copy

- [ ] **Navigation labels** — All primary + secondary nav items confirmed with Client
- [ ] **Footer** — Tagline, address block, hours summary, social links, newsletter signup label, copyright
- [ ] **SEO meta titles + descriptions** — For every page (DGTL writes, Client reviews)
- [ ] **Open Graph copy** — OG titles, descriptions, and image alt text for all pages

---

### Media Assets — Required from Client

**Brand**
- [ ] Logo — full colour (SVG + PNG, transparent background)
- [ ] Logo — white/reversed version (SVG + PNG)
- [ ] Logo — icon/mark only (for favicon + app icon)
- [ ] Any existing brand guidelines document

**Market Photography**
- [ ] Exterior / entrance photos (min. 3–5, high resolution)
- [ ] Interior wide-angle shots of market floor (min. 5–10)
- [ ] Atmosphere/lifestyle shots — shoppers, busy market day
- [ ] Parking area photos
- [ ] Seasonal photos if available (holiday market, summer events, etc.)

**Vendor Photography**
- [ ] Individual vendor booth photos (ideally 1 per vendor)
- [ ] Vendor headshots / portraits (optional but preferred)
- [ ] Product close-up shots representing vendor categories

**Video** *(if available)*
- [ ] Market walkthrough or promo video (for hero or About section)

---

### Data to Collect from Client

**Vendor Directory**
- [ ] Complete vendor list: Business name, Booth number, Category, Short description (1–3 sentences), Website/social URL (optional), Photo (optional)
- [ ] Confirm total number of vendor listings to publish at launch
- [ ] Confirm which vendors have opted in to public listing

**Events**
- [ ] Recurring events: name, frequency, description, typical date/time
- [ ] Upcoming one-off events (next 3–6 months): name, date, time, description
- [ ] Post-launch event update process (who submits, how often)

**Hours & Location**
- [ ] Confirmed hours of operation (including seasonal variations)
- [ ] Holiday hours / closure dates
- [ ] Full civic address, parking details, entrance notes

**Shop / Stripe Products**
- [ ] Final pricing confirmed: parking pass, $5 gift cert, $10 gift cert
- [ ] Purchase limits, expiry dates, or terms for gift certificates
- [ ] Redemption process for gift certificates (in-person at market?)
- [ ] Redemption process for parking passes

**Contact & Business Info**
- [ ] Primary public contact email
- [ ] Public phone number
- [ ] All active social media URLs (Facebook, Instagram, TikTok, etc.)
- [ ] Legal business registration name (for Privacy Policy + Terms)

**FAQ Source Material**
- [ ] Most common questions received from visitors and vendors (raw notes accepted)

---

### WordPress — Pre-Cutover Archive Tasks

- [x] Full WordPress backup complete (confirmed by client)
- [ ] Screenshot or PDF archive of all existing pages (copy reference)
- [ ] Record all existing .htaccess redirect rules (compare against `docs/301-redirect-map.csv`)
- [ ] Agree on content **freeze date** — no new content added to WordPress after this point
- [ ] Keep WordPress live until new site is fully validated in production
