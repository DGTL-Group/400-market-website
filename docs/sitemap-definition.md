# The 400 Market — Sitemap Definition
**Project:** The 400 Market Website Rebuild
**Stack:** Next.js (App Router) + Payload CMS v3
**Prepared by:** DGTL Group
**Date:** April 2026

---

## Table of Contents

1. [Full Route Tree](#1-full-route-tree)
2. [Static Pages](#2-static-pages)
3. [Dynamic Routes](#3-dynamic-routes)
4. [System & Utility Routes](#4-system--utility-routes)
5. [API Routes](#5-api-routes)
6. [New Pages (Not on WordPress)](#6-new-pages-not-on-wordpress)
7. [Removed Pages & Redirects Summary](#7-removed-pages--redirects-summary)

---

## 1. Full Route Tree

```
app/
│
├── page.tsx                                   → /
├── layout.tsx                                 (root layout — nav, footer, chat widget)
├── not-found.tsx                              → /404
│
├── about-us/
│   └── page.tsx                               → /about-us/
│
├── vendors/
│   ├── page.tsx                               → /vendors/
│   └── [slug]/
│       └── page.tsx                           → /vendors/[slug]/
│
├── events/                                    ★ NEW
│   ├── page.tsx                               → /events/
│   └── [slug]/
│       └── page.tsx                           → /events/[slug]/
│
├── shop/
│   ├── page.tsx                               → /shop/
│   ├── [slug]/
│   │   └── page.tsx                           → /shop/[slug]/
│   └── order-confirmation/                    ★ NEW
│       └── page.tsx                           → /shop/order-confirmation/
│
├── news/
│   ├── page.tsx                               → /news/
│   └── [slug]/
│       └── page.tsx                           → /news/[slug]/
│
├── faq/
│   └── page.tsx                               → /faq/
│
├── become-a-vendor/
│   └── page.tsx                               → /become-a-vendor/
│
├── contact-us/
│   └── page.tsx                               → /contact-us/
│
├── privacy-policy/
│   └── page.tsx                               → /privacy-policy/
│
├── terms-of-use/                              ★ NEW
│   └── page.tsx                               → /terms-of-use/
│
├── sitemap.xml/
│   └── route.ts                               → /sitemap.xml
│
├── robots.txt/
│   └── route.ts                               → /robots.txt
│
└── api/
    ├── contact/
    │   └── route.ts                           → /api/contact
    ├── vendor-application/
    │   └── route.ts                           → /api/vendor-application
    ├── newsletter/
    │   └── route.ts                           → /api/newsletter
    ├── stripe/
    │   └── webhook/
    │       └── route.ts                       → /api/stripe/webhook
    └── revalidate/
        └── route.ts                           → /api/revalidate
```

---

## 2. Static Pages

### Homepage

| Field | Value |
|---|---|
| **Route** | `/` |
| **File** | `app/page.tsx` |
| **Page Title** | The 400 Market — Innisfil's Indoor Flea Market |
| **Content Type** | CMS-managed (hero, sections via Pages collection) |
| **Payload Collection** | Pages, Events (upcoming event preview), Vendors (featured vendors) |
| **WordPress Equivalent** | `/` |
| **Notes** | Hero block, market hours/location strip, featured vendors section, upcoming events preview, news/blog teaser, newsletter signup CTA |

---

### About Us

| Field | Value |
|---|---|
| **Route** | `/about-us/` |
| **File** | `app/about-us/page.tsx` |
| **Page Title** | About The 400 Market |
| **Content Type** | CMS-managed |
| **Payload Collection** | Pages |
| **WordPress Equivalent** | `/about-us/` |
| **Notes** | Story, history, ownership, market hours, amenities, photo gallery |

---

### Vendors Directory

| Field | Value |
|---|---|
| **Route** | `/vendors/` |
| **File** | `app/vendors/page.tsx` |
| **Page Title** | Vendors — The 400 Market |
| **Content Type** | Dynamic (server-rendered from CMS) |
| **Payload Collection** | Vendors |
| **WordPress Equivalent** | `/vendors/` |
| **Notes** | Filterable/searchable grid of all active vendors; interactive floor map integration; category filters (antiques, collectibles, clothing, etc.) |

---

### Events

| Field | Value |
|---|---|
| **Route** | `/events/` |
| **File** | `app/events/page.tsx` |
| **Page Title** | Events — The 400 Market |
| **Content Type** | Dynamic (server-rendered from CMS) |
| **Payload Collection** | Events |
| **WordPress Equivalent** | None |
| **Notes** | ★ NEW. List of upcoming market events, special sales, themed weekends; past events archive; iCal/Google Calendar export link |

---

### Shop

| Field | Value |
|---|---|
| **Route** | `/shop/` |
| **File** | `app/shop/page.tsx` |
| **Page Title** | Shop — The 400 Market |
| **Content Type** | Dynamic (server-rendered from CMS + Stripe) |
| **Payload Collection** | Products |
| **WordPress Equivalent** | `/shop/` (WooCommerce → replaced by Stripe) |
| **Notes** | Grid of purchasable items (parking pass, gift certificates); Stripe Checkout integration; replaces WooCommerce entirely |

---

### Shop — Order Confirmation

| Field | Value |
|---|---|
| **Route** | `/shop/order-confirmation/` |
| **File** | `app/shop/order-confirmation/page.tsx` |
| **Page Title** | Order Confirmed — The 400 Market |
| **Content Type** | Static (client-side Stripe session validation) |
| **Payload Collection** | None |
| **WordPress Equivalent** | None |
| **Notes** | ★ NEW. Stripe redirects here after successful payment; reads `?session_id=` param to display order summary; triggers AWS SES confirmation email via n8n |

---

### News Archive

| Field | Value |
|---|---|
| **Route** | `/news/` |
| **File** | `app/news/page.tsx` |
| **Page Title** | News — The 400 Market |
| **Content Type** | Dynamic (server-rendered from CMS) |
| **Payload Collection** | News |
| **WordPress Equivalent** | `/news/` |
| **Notes** | Paginated list of posts; category/tag filtering if needed; migrates 2 existing WordPress posts |

---

### FAQ

| Field | Value |
|---|---|
| **Route** | `/faq/` |
| **File** | `app/faq/page.tsx` |
| **Page Title** | Frequently Asked Questions — The 400 Market |
| **Content Type** | CMS-managed |
| **Payload Collection** | FAQs |
| **WordPress Equivalent** | `/faq/` |
| **Notes** | Accordion-style Q&A; questions managed via Payload FAQs collection; grouped by category (Hours, Parking, Vendors, Buying, etc.) |

---

### Become a Vendor

| Field | Value |
|---|---|
| **Route** | `/become-a-vendor/` |
| **File** | `app/become-a-vendor/page.tsx` |
| **Page Title** | Become a Vendor — The 400 Market |
| **Content Type** | CMS-managed |
| **Payload Collection** | Pages |
| **WordPress Equivalent** | `/become-a-vendor/` |
| **Notes** | Rental info, rates, availability, benefits; vendor application form (submits to `/api/vendor-application` → n8n → AWS SES notification) |

---

### Contact Us

| Field | Value |
|---|---|
| **Route** | `/contact-us/` |
| **File** | `app/contact-us/page.tsx` |
| **Page Title** | Contact Us — The 400 Market |
| **Content Type** | CMS-managed |
| **Payload Collection** | Pages |
| **WordPress Equivalent** | `/contact-us/` |
| **Notes** | Contact form (submits to `/api/contact`), phone, email, Google Maps embed, address, hours; also serves as destination for `/locations.kml` redirect |

---

### Privacy Policy

| Field | Value |
|---|---|
| **Route** | `/privacy-policy/` |
| **File** | `app/privacy-policy/page.tsx` |
| **Page Title** | Privacy Policy — The 400 Market |
| **Content Type** | CMS-managed |
| **Payload Collection** | Pages |
| **WordPress Equivalent** | `/privacy-policy/` |
| **Notes** | Covers Stripe payment data, cookie usage, newsletter opt-in, OpenClaw chat data |

---

### Terms of Use

| Field | Value |
|---|---|
| **Route** | `/terms-of-use/` |
| **File** | `app/terms-of-use/page.tsx` |
| **Page Title** | Terms of Use — The 400 Market |
| **Content Type** | CMS-managed |
| **Payload Collection** | Pages |
| **WordPress Equivalent** | None |
| **Notes** | ★ NEW. Required companion to privacy policy; covers gift certificate terms, parking pass conditions, general site use |

---

### 404 Not Found

| Field | Value |
|---|---|
| **Route** | `/404` (Next.js `not-found.tsx`) |
| **File** | `app/not-found.tsx` |
| **Page Title** | Page Not Found — The 400 Market |
| **Content Type** | Static |
| **Payload Collection** | None |
| **Notes** | Branded 404 with navigation links back to key sections; catches all unmatched routes including old WordPress paths not covered by explicit 301s |

---

## 3. Dynamic Routes

### Vendor Profile Page

| Field | Value |
|---|---|
| **Route** | `/vendors/[slug]/` |
| **File** | `app/vendors/[slug]/page.tsx` |
| **Page Title** | `{Vendor Name}` — The 400 Market |
| **Content Type** | Dynamic (SSG with `generateStaticParams` + ISR) |
| **Payload Collection** | Vendors |
| **WordPress Equivalent** | None |
| **Notes** | ★ NEW. Individual vendor profile: name, description, photo, booth number/location on floor map, product categories, social links; statically generated at build time; revalidated on CMS publish via `/api/revalidate` |

---

### Event Detail Page

| Field | Value |
|---|---|
| **Route** | `/events/[slug]/` |
| **File** | `app/events/[slug]/page.tsx` |
| **Page Title** | `{Event Name}` — The 400 Market |
| **Content Type** | Dynamic (SSG + ISR) |
| **Payload Collection** | Events |
| **WordPress Equivalent** | None |
| **Notes** | ★ NEW. Full event description, date/time, featured image, any related vendors; iCal download link per event |

---

### Shop Product Detail Page

| Field | Value |
|---|---|
| **Route** | `/shop/[slug]/` |
| **File** | `app/shop/[slug]/page.tsx` |
| **Page Title** | `{Product Name}` — The 400 Market Shop |
| **Content Type** | Dynamic (SSG + ISR) |
| **Payload Collection** | Products (metadata) + Stripe (pricing/checkout) |
| **WordPress Equivalent** | `/product/[slug]/` (WooCommerce) |
| **Notes** | Product description, price pulled from Stripe; "Buy Now" triggers Stripe Checkout session; known slugs: `parking-pass`, `gift-certificate-5`, `gift-certificate-10` |

**Known product slugs (pre-defined):**

| Slug | Page Title | Old WordPress URL |
|---|---|---|
| `/shop/parking-pass/` | Parking Pass — The 400 Market Shop | `/product/400-market-parking-pass/` |
| `/shop/gift-certificate-5/` | $5 Gift Certificate — The 400 Market Shop | `/product/5-400-market-gift-certificate/` |
| `/shop/gift-certificate-10/` | $10 Gift Certificate — The 400 Market Shop | `/product/10-400-market-gift-certificate/` |

---

### News Post Page

| Field | Value |
|---|---|
| **Route** | `/news/[slug]/` |
| **File** | `app/news/[slug]/page.tsx` |
| **Page Title** | `{Post Title}` — The 400 Market |
| **Content Type** | Dynamic (SSG + ISR) |
| **Payload Collection** | News |
| **WordPress Equivalent** | `/[post-slug]/` (WordPress posts were at root — 301 redirects in place) |
| **Notes** | Full post content with featured image, author, publish date, related posts; 2 existing posts migrated from WordPress |

**Known migrated post slugs:**

| Slug | Old WordPress URL |
|---|---|
| `/news/from-basement-to-bustle-why-you-should-set-up-shop-at-the-400-market/` | `/from-basement-to-bustle-why-you-should-set-up-shop-at-the-400-market/` |
| `/news/the-400-market-chronicles-why-selling-grandmas-stuff-is-the-ultimate-tribute/` | `/the-400-market-chronicles-why-selling-grandmas-stuff-is-the-ultimate-tribute/` |

---

## 4. System & Utility Routes

### XML Sitemap

| Field | Value |
|---|---|
| **Route** | `/sitemap.xml` |
| **File** | `app/sitemap.xml/route.ts` |
| **Content Type** | Auto-generated (Next.js `sitemap.ts` convention) |
| **Notes** | Dynamically generated at request time; includes all static pages, all published vendor slugs, event slugs, news slugs, and product slugs; excludes `/api/*`, `/admin`, `/shop/order-confirmation/` |

---

### Robots.txt

| Field | Value |
|---|---|
| **Route** | `/robots.txt` |
| **File** | `app/robots.txt/route.ts` |
| **Content Type** | Auto-generated (Next.js `robots.ts` convention) |
| **Notes** | Disallows `/admin`, `/api/*`, `/shop/order-confirmation/`; allows all other routes; references `/sitemap.xml` |

---

### Payload CMS Admin

| Field | Value |
|---|---|
| **Route** | `/admin` and `/admin/*` |
| **File** | Handled by Payload CMS (mounted at `/admin` in `payload.config.ts`) |
| **Content Type** | CMS Admin UI |
| **Notes** | Not a Next.js page; served by Payload; access restricted to authenticated admin users; old `/wp-admin/*` paths redirect here via 301 |

---

## 5. API Routes

All API routes live under `app/api/` and are Next.js Route Handlers (`route.ts`).

| Route | File | Method | Purpose |
|---|---|---|---|
| `/api/contact` | `app/api/contact/route.ts` | POST | Receives contact form submissions; forwards via n8n → AWS SES to market inbox |
| `/api/vendor-application` | `app/api/vendor-application/route.ts` | POST | Receives vendor application form; forwards via n8n → AWS SES notification to management |
| `/api/newsletter` | `app/api/newsletter/route.ts` | POST | Subscribes email address to SendMails newsletter list |
| `/api/stripe/webhook` | `app/api/stripe/webhook/route.ts` | POST | Receives Stripe webhook events (payment confirmed, etc.); triggers order confirmation email via n8n → AWS SES |
| `/api/revalidate` | `app/api/revalidate/route.ts` | POST | On-demand ISR revalidation; called by Payload CMS hooks on content publish/update; secured with a secret token |

---

## 6. New Pages (Not on WordPress)

The following routes have no WordPress equivalent and are net-new additions for the rebuilt site:

| Route | Rationale |
|---|---|
| `/events/` | The 400 Market runs recurring market days and themed weekends; a dedicated events section was absent from the old site and is a significant UX improvement for visitors planning a trip |
| `/events/[slug]/` | Individual event detail pages for SEO and calendar integration |
| `/vendors/[slug]/` | Individual vendor profiles enable vendor SEO, boost merchant buy-in, and support the floor map feature |
| `/shop/order-confirmation/` | Required Stripe post-checkout landing page; WooCommerce handled this natively, Stripe requires an explicit return URL |
| `/terms-of-use/` | Required legal page for e-commerce (gift certificates, parking pass); complements the existing privacy policy |

---

## 7. Removed Pages & Redirects Summary

The following WordPress URLs are removed from the new site. All are handled by 301 redirects (defined in full in `docs/301-redirect-map.csv`).

| Old WordPress URL | Redirects To | Reason |
|---|---|---|
| `/cart/` | `/shop/` | WooCommerce removed; Stripe has no standalone cart page |
| `/checkout/` | `/shop/` | WooCommerce removed; Stripe Checkout is modal/hosted |
| `/my-account/` | `/` | No customer account portal in new stack |
| `/monthly-giveaway-100-gift-certificate/` | `/shop/` | One-off campaign page; no equivalent |
| `/product/400-market-parking-pass/` | `/shop/parking-pass/` | WooCommerce `/product/` slug structure replaced |
| `/product/5-400-market-gift-certificate/` | `/shop/gift-certificate-5/` | WooCommerce `/product/` slug structure replaced |
| `/product/10-400-market-gift-certificate/` | `/shop/gift-certificate-10/` | WooCommerce `/product/` slug structure replaced |
| `/[post-slug]/` (posts at root) | `/news/[post-slug]/` | WordPress posts lived at root; moved under `/news/` |
| `/wp-admin/*` | `/admin` | Payload CMS admin replaces WordPress admin |
| `/*?add-to-cart=*` | `/shop/` | WooCommerce query string pattern; caught via Next.js middleware |
| `/locations.kml` | `/contact-us/` | Static KML file removed; location info lives on contact page |

---

## Appendix — Payload CMS Collections Referenced

| Collection | Used By Routes |
|---|---|
| **Pages** | `/`, `/about-us/`, `/become-a-vendor/`, `/contact-us/`, `/privacy-policy/`, `/terms-of-use/` |
| **Vendors** | `/vendors/`, `/vendors/[slug]/` |
| **Events** | `/events/`, `/events/[slug]/`, `/` (preview) |
| **News** | `/news/`, `/news/[slug]/`, `/` (preview) |
| **Products** | `/shop/`, `/shop/[slug]/` |
| **FAQs** | `/faq/` |

---

*DGTL Group — Confidential Client Project*
