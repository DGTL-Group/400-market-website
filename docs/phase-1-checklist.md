# The 400 Market — Phase 1 Content & Account Checklist

> Phase 1 · DGTL Group · April 2026

---

## Account & Integration Checklist

| # | Service | Purpose | Action Needed | Owner | Done |
|---|---|---|---|---|---|
| 1 | **Neon PostgreSQL** | Payload CMS database | Create project, retrieve `DATABASE_URI` connection string, add to env vars | DGTL | [ ] |
| 2 | **Cloudinary** | Image CDN and asset storage | Confirm free 25 GB tier active, retrieve Cloud Name + API Key + API Secret | DGTL | [ ] |
| 3 | **Stripe** | Online shop payments | Confirm account active, create 3 Products + Prices (parking pass, $5 gift cert, $10 gift cert), retrieve publishable + secret keys + webhook secret | DGTL | [ ] |
| 4 | **AWS SES** | Transactional email (order confirmations, contact forms) | Confirm existing account access, verify sending domain, retrieve SMTP/SDK credentials, confirm out of sandbox mode | DGTL | [ ] |
| 5 | **SendMails** | Newsletter campaigns | Confirm existing account access, retrieve API key or signup form embed code, validate subscriber list is intact | Client + DGTL | [ ] |
| 6 | **n8n** | Automation workflows (form submissions, vendor sync, notifications) | Confirm self-hosted instance is running, define required workflows, retrieve webhook URLs | DGTL | [ ] |
| 7 | **OpenClaw** | Self-hosted AI live chat widget | Confirm instance is running, configure knowledge base for 400 Market content, retrieve embed script / API endpoint | DGTL | [ ] |
| 8 | **Hostinger Business (Node.js)** | Production hosting | Confirm Node.js plan active, confirm SSH access, confirm Node.js 18+ support, confirm env variable configuration method | DGTL | [ ] |
| 9 | **Gitea (git.dgtlgroup.io)** | Source control | Repo exists ✓ — add all team members with correct permissions, configure CI/CD webhook | DGTL | [ ] |
| 10 | **Gitea Actions / CI/CD** | Auto-deploy to Hostinger on push | Configure Actions runner, create deploy workflow (build → SSH → Hostinger), store secrets (HOST, SSH key, env vars) | DGTL | [ ] |
| 11 | **Domain DNS** | Cutover from WordPress to new site | Identify registrar + login credentials, document current DNS records (A, CNAME, MX, TXT), plan cutover timing | Client + DGTL | [ ] |
| 12 | **Google Analytics 4** | Traffic analytics | Confirm GA4 property exists (or create), retrieve Measurement ID (`G-XXXXXXX`), confirm Client has Admin access | Client + DGTL | [ ] |
| 13 | **Google Search Console** | SEO continuity and sitemap submission | Confirm domain property is verified, add DGTL as owner during build, plan sitemap re-submission post-launch | Client + DGTL | [ ] |
| 14 | **Meta Pixel** | Paid social retargeting | Confirm if Meta Ads are active — if yes, retrieve Pixel ID from Meta Business Manager | Client | [ ] |
| 15 | **WordPress (current site)** | Existing live site — to be replaced | Confirm WP admin credentials, perform full export + database + file backup before cutover | Client | [ ] |

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

- [ ] Export full WordPress XML (Posts, Pages, Media) via Tools → Export
- [ ] Full database backup (phpMyAdmin or hosting panel)
- [ ] Full `/wp-content/` file backup (themes, plugins, uploads)
- [ ] Document all currently installed plugins (feature reference)
- [ ] Screenshot or PDF archive of all existing pages (copy reference)
- [ ] Export any contact form submissions / lead data
- [ ] Record all existing .htaccess redirect rules
- [ ] Confirm WordPress admin credentials and hosting panel access are documented
- [ ] Agree on content **freeze date** — no new content added to WordPress after this point
- [ ] Keep WordPress live until new site is fully validated in production
