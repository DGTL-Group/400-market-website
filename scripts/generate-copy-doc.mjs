/**
 * Generate Word documents containing every static customer-facing string
 * from the 400 Market website, for the management team to review + revise.
 *
 * Produces TWO outputs (the client picks whichever fits their workflow):
 *
 *   400-Market-Website-Copy-Review.docx
 *     Clean prose version. Page-by-page, reads like a flyover of the
 *     site. Good for Word's tracked-changes / comments review.
 *
 *   400-Market-Website-Copy-Table.docx
 *     Side-by-side table version. Three columns per row:
 *     Location · Current copy · Suggested revision.
 *     Good for line-by-line copy rewrites.
 *
 * Both docs start with the same cover page and the brand-voice brief so
 * whoever opens them has the reference material up front.
 *
 * Content is declared once in the CONTENT block near the top — both
 * generators consume the same data, so edits flow through both outputs.
 *
 * Usage:  node scripts/generate-copy-doc.mjs
 */

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  LevelFormat,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  PageBreak,
  TabStopType,
  TabStopPosition,
} from 'docx'

// ──────────────────────────────────────────────────────────────────────────
// CONTENT DATA — single source of truth for both generators.
// Each page has an id, title, URL path, purpose blurb, and a list of
// sections. Each section has a name and an array of copy items. Each item
// is { loc, current, todo?, context? } where `todo: true` flags copy we
// don't have yet.
// ──────────────────────────────────────────────────────────────────────────

const BRAND_BRIEF = {
  tagline: 'FOOD, FINDS & FUN. OPEN EVERY WEEK-END.',
  est: '1986',
  weAre: [
    'Bold and direct',
    'Warm and community-first',
    'Energetic and fun',
    'Authentic and established',
    'Clear and unpretentious',
    'Proud of local roots',
  ],
  weAreNot: [
    'Timid or corporate',
    'Cold or transactional',
    'Stuffy or overly formal',
    'Trendy or chasing novelty',
    'Jargon-heavy or complicated',
    'Generic or placeless',
  ],
  voiceConstants: [
    { label: 'Approachable', desc: 'Speak like a friendly vendor, not a corporation.' },
    { label: 'Energetic', desc: 'Short punchy sentences. Active voice. Forward momentum.' },
    { label: 'Welcoming', desc: 'Every visitor — shopper, vendor, first-timer — should feel invited.' },
    { label: 'Direct', desc: 'State the value clearly; don\u2019t bury the lead.' },
    { label: 'Community-proud', desc: 'Reference the market experience, local vendors, the tradition.' },
  ],
  toneFlex: [
    { context: 'Hero / Homepage', tone: 'Bold, inviting, high energy — short punchy lines.' },
    { context: 'Vendor Directory', tone: 'Warm, descriptive, story-forward.' },
    { context: 'Events', tone: 'Exciting, specific, action-oriented.' },
    { context: 'FAQ / Practical Info', tone: 'Clear, plain, helpful — no fluff.' },
    { context: 'Become a Vendor', tone: 'Persuasive, community-focused, encouraging.' },
    { context: 'Legal / Privacy', tone: 'Neutral, clear, CASL-compliant.' },
    { context: 'Error / 404', tone: 'Light, friendly, never frustrating.' },
  ],
  dos: [
    'Use \u201Cwe\u201D and \u201Cour market\u201D — this is a community space.',
    'Lead with the experience: sights, smells, energy of the market.',
    'Name specific things: vendors, categories, weekends, seasons.',
    'Use sentence fragments for punch: \u201CFresh produce. Local crafts. Every weekend.\u201D',
    'Embrace the ampersand (&) — it\u2019s in the tagline for a reason.',
  ],
  donts: [
    'Corporate language: \u201Cleverage\u201D, \u201Csynergy\u201D, \u201Csolutions\u201D.',
    'Vague claims: \u201Cgreat selection\u201D → be specific.',
    'Over-promising: keep claims grounded in real experience.',
    'Passive voice in headlines or CTAs.',
    'Calling vendors \u201Cvendors\u201D in marketing copy — use \u201Cmakers\u201D, \u201Cgrowers\u201D, \u201Cartisans\u201D, or their business names.',
  ],
}

const SITE_META = {
  siteName: 'The 400 Market',
  titleDefault: 'The 400 Market — Food, Finds & Fun',
  titleTemplate: '%s | The 400 Market',
  description:
    "Ontario's favourite indoor market. Over 140 vendors, open every weekend in Innisfil. Shop antiques, clothing, food, crafts, electronics and more.",
  twitterTitle: 'The 400 Market — Food, Finds & Fun',
  twitterDescription:
    "Ontario's favourite indoor market. Over 140 vendors, open every weekend in Innisfil.",
  ogImageAlt: 'The 400 Market',
}

const CONTENT = [
  // ─── SITE-WIDE ──────────────────────────────────────────────────
  {
    id: 'site-wide',
    title: 'Site-Wide Elements',
    path: '(applies to every page)',
    purpose:
      'Elements that appear everywhere — header navigation, footer, cookie banner, browser tab titles, social-share preview.',
    sections: [
      {
        name: 'Browser Tab + Social Sharing',
        items: [
          {
            loc: 'Default page title',
            current: SITE_META.titleDefault,
            context: "Shows in the browser tab when no page-specific title is set.",
          },
          {
            loc: 'Page title template',
            current: SITE_META.titleTemplate,
            context: 'How page titles appear in tabs, e.g. \u201CVendors | The 400 Market\u201D.',
          },
          {
            loc: 'Default meta description',
            current: SITE_META.description,
            context:
              'Appears under the site name in Google search results and in social sharing previews.',
          },
          {
            loc: 'Twitter / X share title',
            current: SITE_META.twitterTitle,
          },
          {
            loc: 'Twitter / X share description',
            current: SITE_META.twitterDescription,
          },
        ],
      },
      {
        name: 'Header Navigation',
        items: [
          { loc: 'Left nav link', current: 'VENDORS' },
          { loc: 'Left nav link', current: 'EVENTS' },
          { loc: 'Left nav link', current: 'SHOP' },
          { loc: 'Right nav link', current: 'NEWS' },
          { loc: 'Right nav link', current: 'ABOUT' },
          { loc: 'Right nav link', current: 'CONTACT US' },
          { loc: 'Header CTA button', current: 'BECOME A MERCHANT' },
        ],
      },
      {
        name: 'Footer — Newsletter Banner',
        items: [
          { loc: 'Headline', current: 'STAY IN THE LOOP' },
          {
            loc: 'Subhead',
            current: 'Market news, merchant spotlights, and event updates to your inbox.',
          },
          { loc: 'Email input placeholder', current: 'your@email.com' },
          { loc: 'Subscribe button', current: 'SUBSCRIBE' },
        ],
      },
      {
        name: 'Footer — Brand Block',
        items: [
          {
            loc: 'Tagline (appears on homepage footer only)',
            current: 'FOOD, FINDS & FUN. OPEN EVERY WEEK-END.',
          },
        ],
      },
      {
        name: 'Footer — Link Columns',
        items: [
          { loc: 'Column heading', current: 'EXPLORE' },
          { loc: 'Explore links', current: 'Home · Vendors · Events · Shop · News' },
          { loc: 'Column heading', current: 'MARKET' },
          { loc: 'Market links', current: 'About Us · FAQ · Contact Us' },
          { loc: 'Column heading', current: 'POLICIES' },
          { loc: 'Policies links', current: 'Privacy Policy · Terms of Use' },
          { loc: 'Column heading', current: 'VISIT US' },
          {
            loc: 'Address',
            current:
              'The 400 Market · 2207 Industrial Park Rd · Innisfil, ON L9S 3V9',
          },
          { loc: 'Phone', current: '705-436-1010' },
          { loc: 'Column heading', current: 'HOURS' },
          {
            loc: 'Hours line',
            current: 'Saturday & Sunday\n9:00 AM \u2013 5:00 PM',
          },
          { loc: 'Column heading', current: 'FOLLOW US ON SOCIALS' },
        ],
      },
      {
        name: 'Footer — Bottom Bar',
        items: [
          { loc: 'Copyright', current: '© 2026 The 400 Market. All rights reserved.' },
          {
            loc: 'Attribution',
            current: 'Designed with love by DGTL Group',
            context: 'Not editable — agency credit.',
          },
        ],
      },
      {
        name: 'Open / Closed Badge (appears in footer + about page)',
        items: [
          { loc: 'Open label', current: 'Open Now' },
          { loc: 'Closed label', current: 'Closed' },
          { loc: 'Emergency label', current: 'Emergency Closure' },
        ],
      },
      {
        name: 'Cookie Consent Banner',
        items: [
          {
            loc: 'Banner message',
            current:
              'We use essential cookies for payments and optional cookies for advertising analytics (Meta Pixel). See our Privacy Policy.',
          },
          { loc: 'Decline button', current: 'Decline' },
          { loc: 'Accept button', current: 'Accept' },
        ],
      },
    ],
  },

  // ─── HOME ──────────────────────────────────────────────────────
  {
    id: 'home',
    title: 'Homepage',
    path: '/',
    purpose:
      'The landing page. First impression. Establishes tone, drives visits (Plan Your Visit) and vendor applications (Become a Merchant).',
    sections: [
      {
        name: 'Browser + Search',
        items: [
          { loc: 'Page title', current: 'Home' },
          {
            loc: 'Meta description',
            current:
              "Ontario's #1 indoor weekend market. 105,000 sq ft, hundreds of vendors, open Saturday and Sunday 9AM-5PM in Innisfil, Ontario.",
          },
        ],
      },
      {
        name: 'Hero Section',
        items: [
          { loc: 'Headline', current: 'FOOD, FINDS\n& FUN.' },
          { loc: 'Subhead', current: "Ontario's #1 Indoor Weekend Market" },
          { loc: 'Hours line', current: 'Sat & Sun 9AM\u20135PM' },
          { loc: 'Address line', current: '2207 Industrial Park Rd, Innisfil ON' },
          { loc: 'Primary CTA button', current: 'Plan Your Visit' },
          { loc: 'Secondary CTA button', current: 'Become a Merchant' },
        ],
      },
      {
        name: 'Yellow Info Strip (under hero)',
        items: [
          { loc: 'Stat 1', current: 'SAT\u2013SUN 9AM\u20135PM' },
          { loc: 'Stat 2', current: '2207 Industrial Park Rd, Innisfil ON' },
          { loc: 'Stat 3', current: '105,000 SQ FT OF SHOPPING' },
          { loc: 'Stat 4', current: 'HUNDREDS OF UNIQUE VENDORS' },
        ],
      },
      {
        name: 'Featured Vendors Section',
        items: [
          { loc: 'Section headline', current: 'FEATURED VENDORS' },
          {
            loc: 'Section subhead',
            current: 'Discover the makers, growers, and artisans of 400 Market.',
          },
          { loc: 'Card CTA', current: 'View profile →' },
          {
            loc: 'Empty state — card title',
            current: 'Coming soon',
            context: 'Shown before any vendors are added.',
          },
          {
            loc: 'Empty state — card body',
            current: "Vendor profiles will appear here as they\u2019re added to the directory.",
          },
          { loc: 'Below-section CTA', current: 'View All Vendors' },
        ],
      },
      {
        name: 'Explore the Market Section (floor plan)',
        items: [
          { loc: 'Section headline', current: 'EXPLORE THE MARKET' },
          {
            loc: 'Section subhead',
            current: 'Interactive floor plan \u2014 hover a booth to see the vendor.',
          },
          { loc: 'Below-section CTA', current: 'Browse the Full Directory' },
        ],
      },
      {
        name: 'Upcoming Events Section',
        items: [
          { loc: 'Section headline', current: 'UPCOMING EVENTS' },
          {
            loc: 'Section subhead',
            current: 'Special weekends, seasonal markets, and community days.',
          },
          { loc: 'Card CTA', current: 'Details →' },
          {
            loc: 'Empty state',
            current: 'No upcoming events scheduled yet. Check back soon!',
          },
          { loc: 'Below-section CTA', current: 'View All Events' },
        ],
      },
      {
        name: 'What People Are Saying Section',
        items: [
          { loc: 'Section headline', current: 'WHAT PEOPLE ARE SAYING' },
          {
            loc: 'Section subhead',
            current: 'Real reviews from real visitors \u2014 straight from Google.',
          },
          {
            loc: 'Placeholder review 1',
            current:
              '\u201CAmazing market! So many unique vendors and great food. We come every weekend with the family.\u201D \u2014 Sarah M.',
            context:
              'Placeholder until we wire up Google Places API \u2014 real copy will be pulled from Google reviews automatically.',
          },
          {
            loc: 'Placeholder review 2',
            current:
              '\u201CLove the variety here. Found incredible antiques and handmade crafts. The atmosphere is fantastic.\u201D \u2014 James T.',
            context: 'Placeholder (see above).',
          },
          {
            loc: 'Placeholder review 3',
            current:
              '\u201CBest flea market in Ontario. Huge space, friendly vendors, and always something new to discover.\u201D \u2014 Lisa K.',
            context: 'Placeholder (see above).',
          },
        ],
      },
    ],
  },

  // ─── ABOUT US ──────────────────────────────────────────────────
  {
    id: 'about',
    title: 'About Us',
    path: '/about-us',
    purpose: "The market\u2019s origin story, mission, and practical info for visitors.",
    sections: [
      {
        name: 'Browser + Search',
        items: [
          { loc: 'Page title', current: 'About Us' },
          {
            loc: 'Meta description',
            current:
              "For over [YEARS] years, The 400 Market has been Simcoe County\u2019s home for local vendors, fresh food, and community. Learn our story.",
            context: '[YEARS] is calculated automatically (currently \u201840\u2019).',
          },
        ],
      },
      {
        name: 'Yellow Hero Band',
        items: [
          { loc: 'Headline', current: 'ABOUT US' },
          {
            loc: 'Subhead',
            current:
              'Our story, our mission, and what makes The 400 Market the heart of Simcoe County.',
          },
        ],
      },
      {
        name: 'Our Story Section',
        items: [
          { loc: 'Section headline', current: 'OUR STORY' },
          {
            loc: 'Paragraph 1',
            current:
              "For over [YEARS] years, the 400 Market has been the heart of Simcoe County\u2019s local economy, uniting entrepreneurs, small businesses, and food artisans in one thriving community.",
          },
          {
            loc: 'Paragraph 2',
            current:
              'With hundreds of unique vendor spaces, thousands of weekly visitors, and a dedicated team committed to the market experience, 400 Market is more than a shopping destination \u2014 it\u2019s where community happens.',
          },
          {
            loc: 'Paragraph 3',
            current: 'Today, the market is managed by Scott Saunders, General Manager.',
          },
          {
            loc: 'Section photo',
            current: '[TODO: replace placeholder with market history photo]',
            todo: true,
          },
        ],
      },
      {
        name: 'Our Mission Section (dark band)',
        items: [
          { loc: 'Section headline', current: 'OUR MISSION' },
          {
            loc: 'Mission statement',
            current:
              'To provide a vibrant, accessible, and welcoming marketplace where local vendors thrive and community members discover unique finds, fresh food, and lasting connections \u2014 every single weekend.',
          },
        ],
      },
      {
        name: 'Visit Us Section',
        items: [
          { loc: 'Section headline', current: 'VISIT US' },
          { loc: 'Card 1 title', current: 'Hours' },
          {
            loc: 'Card 1 body',
            current: 'Saturday & Sunday\n9:00 AM \u2013 5:00 PM\nYear-round, rain or shine',
          },
          { loc: 'Card 2 title', current: 'Location' },
          {
            loc: 'Card 2 body',
            current: 'The 400 Market\n2207 Industrial Park Road\nInnisfil, Ontario, L9S 3V9',
          },
          { loc: 'Card 2 CTA', current: 'Get Directions' },
          { loc: 'Card 3 title', current: 'Space' },
          { loc: 'Card 3 body', current: '105,000 SQ FT of shopping\nAccessible spaces available' },
          { loc: 'Card 3 CTA', current: 'Learn More' },
        ],
      },
      {
        name: 'Inside the Market Section (Instagram feed)',
        items: [
          { loc: 'Section headline', current: 'INSIDE THE MARKET' },
          {
            loc: 'Instagram link',
            current: 'Follow @the400market on Instagram →',
          },
          {
            loc: 'Placeholder (before widget is hooked up)',
            current: 'Instagram feed coming soon.',
          },
          { loc: 'Placeholder CTA', current: 'View on Instagram' },
        ],
      },
      {
        name: 'Closing CTA (dark band)',
        items: [
          { loc: 'Headline', current: 'READY TO JOIN THE MARKET?' },
          { loc: 'Button', current: 'Become a Merchant' },
        ],
      },
    ],
  },

  // ─── BECOME A MERCHANT ──────────────────────────────────────────
  {
    id: 'become-a-vendor',
    title: 'Become a Merchant',
    path: '/become-a-vendor',
    purpose:
      'Sell the market to prospective merchants. Lists benefits, pricing, shows available booths, and drives an application.',
    sections: [
      {
        name: 'Browser + Search',
        items: [
          { loc: 'Page title', current: 'Become a Merchant' },
          {
            loc: 'Meta description',
            current:
              "Join Ontario's #1 indoor weekend market. Flexible booth rentals, established foot traffic, and a thriving vendor community at The 400 Market in Innisfil.",
          },
        ],
      },
      {
        name: 'Yellow Hero Band',
        items: [
          { loc: 'Headline', current: 'BECOME A MERCHANT' },
          {
            loc: 'Intro paragraph',
            current:
              "For over [YEARS] years, the 400 Market has been the heart of Simcoe County\u2019s local economy, uniting entrepreneurs, small businesses, and food artisans in one thriving community.",
          },
        ],
      },
      {
        name: 'Why Sell at 400 Market?',
        items: [
          { loc: 'Section headline', current: 'WHY SELL AT 400 MARKET?' },
          { loc: 'Benefit 1 title', current: 'Established Traffic' },
          {
            loc: 'Benefit 1 body',
            current: 'Thousands of shoppers every weekend. No building your own audience.',
          },
          { loc: 'Benefit 2 title', current: 'Flexible Rentals' },
          {
            loc: 'Benefit 2 body',
            current:
              'New merchants enjoy flexible options — one-day, weekend, or monthly rentals. No long-term leases.',
          },
          { loc: 'Benefit 3 title', current: 'Indoor Year-Round' },
          {
            loc: 'Benefit 3 body',
            current:
              'Rain or shine — the market is fully indoors. Never lose a market day to weather.',
          },
          { loc: 'Benefit 4 title', current: 'Low Commitment' },
          {
            loc: 'Benefit 4 body',
            current:
              "Only first and last month\u2019s rent as deposit. 30-day notice to leave \u2014 that\u2019s it.",
          },
        ],
      },
      {
        name: 'Monthly Rates Table',
        items: [
          { loc: 'Section headline', current: 'MONTHLY RATES' },
          { loc: 'Column headers', current: 'Booth Type · Size · Monthly Rate · Taxes' },
          {
            loc: 'Row 1',
            current: 'Outdoor \u2014 Wooden Stall / Parking Lot · \u2014 · $350/month · Included',
          },
          { loc: 'Row 2', current: "Indoor Booth · 8'\u00D78' · $500/month · Included" },
          { loc: 'Row 3', current: "Indoor Booth · 8'\u00D716' · $975/month · Included" },
          { loc: 'Row 4', current: "Indoor Booth · 8'\u00D724' · $1,200/month · Included" },
          { loc: 'Row 5', current: "Indoor Booth · 8'\u00D732' · $1,450/month · Included" },
        ],
      },
      {
        name: 'Daily & Weekend Rates Table',
        items: [
          { loc: 'Section headline', current: 'DAILY & WEEKEND RATES' },
          { loc: 'Column headers', current: 'Booth Type · Saturday · Sunday · Full Weekend' },
          {
            loc: 'Row 1',
            current: 'Outdoor \u2014 Parking Lot (20\u00D720, no tables) · $50 · $50 · $100',
          },
          { loc: 'Row 2', current: 'Outdoor \u2014 Wooden Stall · $50 · $50 · $100' },
          { loc: 'Row 3', current: "Indoor \u2014 8'\u00D78' Booth · $75 · $75 · $150" },
          {
            loc: 'Fine print line 1',
            current: 'Payment is due prior to set up. Set up is between 7:30\u20138:30 AM.',
          },
          {
            loc: 'Fine print line 2',
            current:
              "Permanent merchants: first and last month\u2019s rent as deposit. 30-day notice upon leaving.",
          },
        ],
      },
      {
        name: 'Available Booths Section',
        items: [
          { loc: 'Section headline', current: 'AVAILABLE BOOTHS' },
          {
            loc: 'Section subhead',
            current: 'See where the open spaces are \u2014 contact us to reserve yours.',
          },
          { loc: 'Below-section CTA', current: 'Contact Us to Reserve' },
        ],
      },
      {
        name: 'Apply for a Booth — Form Intro',
        items: [
          { loc: 'Section headline', current: 'APPLY FOR A BOOTH' },
          {
            loc: 'Intro paragraph',
            current: 'Fill out the form and our team will be in touch within 2 business days.',
          },
          {
            loc: 'Form field labels',
            current:
              'First Name · Last Name · Business Name · Email Address · Phone Number · Preferred Booth (optional) · Business Description',
          },
          { loc: 'Preferred Booth placeholder', current: 'e.g. 1804' },
          { loc: 'Submit button', current: 'Submit Application' },
          {
            loc: 'Below-button line',
            current: 'By submitting you agree to our Terms of Use and Privacy Policy.',
          },
          {
            loc: 'Success state — headline',
            current: 'Application received!',
          },
          {
            loc: 'Success state — body',
            current: 'Our team will be in touch within 2 business days.',
          },
          { loc: 'Success state — link', current: 'Submit another application' },
        ],
      },
    ],
  },

  // ─── CONTACT US ────────────────────────────────────────────────
  {
    id: 'contact',
    title: 'Contact Us',
    path: '/contact-us',
    purpose: 'General contact channel. Shows address, phone, email, hours, and a message form.',
    sections: [
      {
        name: 'Browser + Search',
        items: [
          { loc: 'Page title', current: 'Contact Us' },
          {
            loc: 'Meta description',
            current:
              'Get in touch with The 400 Market in Innisfil, Ontario. Questions, merchant inquiries, or just saying hello.',
          },
        ],
      },
      {
        name: 'Yellow Hero Band',
        items: [
          { loc: 'Headline', current: 'CONTACT US' },
          {
            loc: 'Subhead',
            current:
              "We\u2019d love to hear from you. Questions, merchant inquiries, or just saying hello.",
          },
        ],
      },
      {
        name: 'Send Us a Message (form)',
        items: [
          { loc: 'Section headline', current: 'SEND US A MESSAGE' },
          {
            loc: 'Field labels',
            current: 'Your Name · Email Address · Subject · Message',
          },
          { loc: 'Submit button', current: 'Send Message' },
          { loc: 'Success state — headline', current: 'Message sent!' },
          {
            loc: 'Success state — body',
            current: "We\u2019ll get back to you as soon as possible.",
          },
          { loc: 'Success state — link', current: 'Send another message' },
        ],
      },
      {
        name: 'Get in Touch (contact info)',
        items: [
          { loc: 'Section headline', current: 'GET IN TOUCH' },
          { loc: 'Address label', current: 'Address' },
          {
            loc: 'Address',
            current: 'The 400 Market\n2207 Industrial Park Road\nInnisfil, Ontario, L9S 3V9',
          },
          { loc: 'Phone label', current: 'Phone' },
          { loc: 'Phone', current: '705-436-1010' },
          { loc: 'Email label', current: 'Email' },
          { loc: 'Email', current: 'manager@400market.com' },
          { loc: 'Hours label', current: 'Hours' },
          {
            loc: 'Hours body',
            current: 'Sat & Sun  9:00 AM \u2013 5:00 PM\nRain or shine · Year-round',
          },
        ],
      },
    ],
  },

  // ─── VENDORS LIST ──────────────────────────────────────────────
  {
    id: 'vendors-list',
    title: 'Vendors Directory',
    path: '/vendors',
    purpose:
      'Lists every active vendor as cards. Top section has the interactive floor plan; clicking a booth jumps to that vendor on the page.',
    sections: [
      {
        name: 'Browser + Search',
        items: [
          { loc: 'Page title', current: 'Vendors' },
          {
            loc: 'Meta description',
            current:
              'Browse the makers, growers, and artisans of The 400 Market in Innisfil, Ontario. Shop local every Saturday and Sunday 9AM-5PM.',
          },
        ],
      },
      {
        name: 'Yellow Hero Band',
        items: [
          { loc: 'Headline', current: 'OUR VENDORS' },
          {
            loc: 'Subhead',
            current:
              'Hundreds of makers, growers, and artisans under one roof. Click a booth on the map to jump to a vendor, or browse the list below.',
          },
        ],
      },
      {
        name: 'Vendor Grid',
        items: [
          { loc: 'Card CTA', current: 'View profile' },
          {
            loc: 'Empty state',
            current: 'Vendor profiles coming soon. Check back in a few weeks!',
          },
        ],
      },
    ],
  },

  // ─── VENDOR DETAIL ─────────────────────────────────────────────
  {
    id: 'vendor-detail',
    title: 'Vendor Detail Page',
    path: '/vendors/[vendor-slug]',
    purpose:
      'Individual vendor profile. All vendor content (name, description, photo, links) is managed in the admin by each vendor / by 400 Market staff — the template copy below is the scaffolding around it.',
    sections: [
      {
        name: 'Browser + Search',
        items: [
          {
            loc: 'Page title',
            current: '[Vendor Name]',
            context:
              "The vendor\u2019s name. Page title template adds \u201C | The 400 Market\u201D automatically.",
          },
          {
            loc: 'Fallback meta description',
            current:
              'Visit [Vendor Name] at Booth [NNNN], The 400 Market, Innisfil Ontario.',
            context:
              "Used when the vendor hasn\u2019t filled in their own short description.",
          },
        ],
      },
      {
        name: 'Page Template',
        items: [
          { loc: 'Back link', current: '← Back to all vendors' },
          {
            loc: 'Sub-headline under name',
            current: 'Booth [NNNN]',
            context: 'The booth number comes from the CRM.',
          },
          { loc: 'Contact info label 1', current: 'Website:' },
          { loc: 'Contact info label 2', current: 'Phone:' },
          { loc: 'Social links heading', current: 'Follow' },
          { loc: 'CTA button', current: 'View in floor plan' },
        ],
      },
    ],
  },

  // ─── EVENTS LIST ───────────────────────────────────────────────
  {
    id: 'events-list',
    title: 'Events',
    path: '/events',
    purpose:
      'Lists upcoming events with filters (Upcoming / This Month / Past). Event rows pull content from the admin.',
    sections: [
      {
        name: 'Browser + Search',
        items: [
          { loc: 'Page title', current: 'Events' },
          {
            loc: 'Meta description',
            current:
              'Special market days, themed weekends, and seasonal events at The 400 Market in Innisfil, Ontario.',
          },
        ],
      },
      {
        name: 'Yellow Hero Band',
        items: [
          { loc: 'Headline', current: 'EVENTS' },
          {
            loc: 'Subhead',
            current: 'Special market days, themed weekends, and seasonal events at The 400 Market.',
          },
        ],
      },
      {
        name: 'Filter Bar',
        items: [
          { loc: 'Filter label 1', current: 'Upcoming' },
          { loc: 'Filter label 2', current: 'This Month' },
          { loc: 'Filter label 3', current: 'Past' },
          { loc: 'Empty state', current: 'No events found for this view.' },
        ],
      },
      {
        name: 'Closing CTA Banner (yellow)',
        items: [
          { loc: 'Headline', current: 'READY TO JOIN THE MARKET?' },
          { loc: 'Body', current: 'Apply for a booth and join us at our next themed weekend.' },
          { loc: 'Button', current: 'BECOME A MERCHANT' },
        ],
      },
    ],
  },

  // ─── EVENT DETAIL ──────────────────────────────────────────────
  {
    id: 'event-detail',
    title: 'Event Detail Page',
    path: '/events/[event-slug]',
    purpose: 'Individual event page. Most content is entered per-event in the admin.',
    sections: [
      {
        name: 'Info Card Labels',
        items: [
          { loc: 'Date label', current: 'When' },
          { loc: 'Location label', current: 'Where' },
          {
            loc: 'Fallback location',
            current: '2207 Industrial Park Rd, Innisfil ON',
            context: "Shown when the event doesn\u2019t specify a different location.",
          },
          { loc: 'Admission label', current: 'Admission' },
          { loc: 'Admission value', current: 'Free entry · Free parking' },
        ],
      },
      {
        name: 'Closing CTA Banner',
        items: [
          { loc: 'Headline', current: 'SEE YOU AT THE MARKET' },
          {
            loc: 'Body',
            current: 'Open Saturdays & Sundays, 9AM\u20135PM. Free entry, free parking.',
          },
          { loc: 'Button', current: 'GET DIRECTIONS' },
        ],
      },
      {
        name: 'Related Events Section',
        items: [
          { loc: 'Section headline', current: 'MORE UPCOMING EVENTS' },
          {
            loc: 'Empty state',
            current:
              'That was the last one on the calendar \u2014 check back soon for more.',
          },
        ],
      },
    ],
  },

  // ─── NEWS LIST ─────────────────────────────────────────────────
  {
    id: 'news-list',
    title: 'News',
    path: '/news',
    purpose: 'Blog-style list of market news posts. Content is managed in the admin.',
    sections: [
      {
        name: 'Browser + Search',
        items: [
          { loc: 'Page title', current: 'News' },
          {
            loc: 'Meta description',
            current:
              'The latest news, updates, and stories from The 400 Market in Innisfil, Ontario.',
          },
        ],
      },
      {
        name: 'Page Heading',
        items: [
          { loc: 'Page headline', current: 'NEWS' },
          {
            loc: 'Tag filters',
            current: 'All · Filter 1 · Filter 2 · Filter 3 · Filter 4 · Filter 5',
            todo: true,
            context:
              '[TODO: The tag filters are placeholders. Management needs to tell us what tag names to use, e.g. \u201CAnnouncements\u201D, \u201CVendor Spotlights\u201D, \u201CSeasonal\u201D.]',
          },
          { loc: 'Empty state', current: 'No posts found.' },
        ],
      },
    ],
  },

  // ─── NEWS DETAIL ───────────────────────────────────────────────
  {
    id: 'news-detail',
    title: 'News Post Page',
    path: '/news/[post-slug]',
    purpose:
      'Individual blog post. Post content is entered per-post in the admin. The template copy below is the scaffolding around it.',
    sections: [
      {
        name: 'Closing CTA Banner',
        items: [
          { loc: 'Headline', current: 'READY TO JOIN THE MARKET?' },
          {
            loc: 'Body',
            current: 'Apply for a booth today and join hundreds of thriving merchants.',
          },
          { loc: 'Button', current: 'BECOME A MERCHANT' },
        ],
      },
      {
        name: 'Related Posts Section',
        items: [
          { loc: 'Section headline', current: 'MORE FROM THE MARKET' },
        ],
      },
    ],
  },

  // ─── FAQ ───────────────────────────────────────────────────────
  {
    id: 'faq',
    title: 'FAQ',
    path: '/faq',
    purpose:
      'Frequently asked questions, grouped by topic. Each Q&A is managed in the admin \u2014 the template just provides the page scaffolding and category labels.',
    sections: [
      {
        name: 'Browser + Search',
        items: [
          { loc: 'Page title', current: 'FAQ' },
          {
            loc: 'Meta description',
            current:
              'Everything you need to know about visiting and selling at The 400 Market in Innisfil, Ontario.',
          },
        ],
      },
      {
        name: 'Yellow Hero Band',
        items: [
          { loc: 'Headline', current: 'FREQUENTLY ASKED QUESTIONS' },
          {
            loc: 'Subhead',
            current: 'Everything you need to know about visiting and selling at 400 Market.',
          },
        ],
      },
      {
        name: 'Category Labels (used to group Q&As)',
        items: [
          { loc: 'Category', current: 'General' },
          { loc: 'Category', current: 'Hours & Location' },
          { loc: 'Category', current: 'Parking' },
          { loc: 'Category', current: 'Vendors' },
          { loc: 'Category', current: 'Shopping & Buying' },
          { loc: 'Category', current: 'Gift Certificates' },
          { loc: 'Category', current: 'Events' },
          { loc: 'Category', current: 'Merchants & Booths' },
        ],
      },
      {
        name: 'Empty State (before FAQs are added)',
        items: [
          { loc: 'Body', current: 'FAQs are being added \u2014 check back soon.' },
          { loc: 'CTA', current: 'Contact Us' },
        ],
      },
      {
        name: 'Individual Q&A Copy',
        items: [
          {
            loc: 'Every question + answer',
            current: '[TODO: Management to provide the actual Q&A pairs for each category.]',
            todo: true,
          },
        ],
      },
    ],
  },

  // ─── 404 ───────────────────────────────────────────────────────
  {
    id: '404',
    title: '404 / Not Found',
    path: '(any broken URL)',
    purpose:
      'Custom 404 page \u2014 the visitor landed on a broken URL. Light tone, friendly recovery path. Doubles as a mini whack-a-mole game to keep the moment playful.',
    sections: [
      {
        name: 'Intro Screen',
        items: [
          { loc: 'Big number', current: '404' },
          { loc: 'Headline', current: "LOOKS LIKE YOU\u2019RE LOST" },
          {
            loc: 'Body',
            current:
              "The page you\u2019re looking for has wandered off. While you\u2019re here, want to whack some vendors?",
          },
          { loc: 'CTA button', current: 'START GAME' },
          { loc: 'Escape link', current: 'Skip the game and go home' },
        ],
      },
    ],
  },

  // ─── LEGAL PAGES (admin-managed, out of scope) ────────────────
  {
    id: 'legal',
    title: 'Privacy Policy & Terms of Use',
    path: '/privacy-policy, /terms-of-use',
    purpose:
      "These are managed in the admin as rich-text pages. No hard-coded copy to review here \u2014 management (ideally with legal) edits the content directly in the CMS.",
    sections: [
      {
        name: 'Scope',
        items: [
          {
            loc: 'Entire page body',
            current: '[Managed in /admin \u2014 not in this review.]',
            context:
              'Privacy + Terms are stored as rich-text pages in the CMS. Ask us to set up an admin account if you want to edit them before launch.',
          },
        ],
      },
    ],
  },
]

// ──────────────────────────────────────────────────────────────────────────
// SHARED STYLING
// ──────────────────────────────────────────────────────────────────────────

const PAGE = {
  width: 12240, // 8.5"
  height: 15840, // 11"
  margin: 1440, // 1"
}
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2 // 9360

const COLORS = {
  brandDark: '2C2C2C',
  brandYellow: 'F7D117',
  brandMango: 'E57200',
  granite: '606060',
  lightBg: 'FFF8E7',
  grayBg: 'F4F4F4',
  border: 'D6D6D6',
}

const BASE_STYLES = {
  default: {
    document: { run: { font: 'Calibri', size: 22 } }, // 11pt
  },
  paragraphStyles: [
    {
      id: 'Heading1',
      name: 'Heading 1',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: { size: 44, bold: true, font: 'Calibri', color: COLORS.brandDark },
      paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
    },
    {
      id: 'Heading2',
      name: 'Heading 2',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: { size: 32, bold: true, font: 'Calibri', color: COLORS.brandDark },
      paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 },
    },
    {
      id: 'Heading3',
      name: 'Heading 3',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: { size: 26, bold: true, font: 'Calibri', color: COLORS.brandDark },
      paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
    },
    {
      id: 'Heading4',
      name: 'Heading 4',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: { size: 22, bold: true, font: 'Calibri', color: COLORS.brandMango },
      paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 3 },
    },
    {
      id: 'Caption',
      name: 'Caption',
      basedOn: 'Normal',
      next: 'Normal',
      run: { size: 18, italics: true, color: COLORS.granite },
      paragraph: { spacing: { after: 120 } },
    },
  ],
}

const BASE_NUMBERING = {
  config: [
    {
      reference: 'bullets',
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        },
      ],
    },
    {
      reference: 'dos',
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: '\u2713',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 720, hanging: 360 } },
            run: { color: '1F7A3A' },
          },
        },
      ],
    },
    {
      reference: 'donts',
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: '\u2717',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 720, hanging: 360 } },
            run: { color: 'A63232' },
          },
        },
      ],
    },
  ],
}

const THIN_BORDER = { style: BorderStyle.SINGLE, size: 4, color: COLORS.border }
const CELL_BORDERS = {
  top: THIN_BORDER,
  bottom: THIN_BORDER,
  left: THIN_BORDER,
  right: THIN_BORDER,
}
const CELL_MARGINS = { top: 120, bottom: 120, left: 160, right: 160 }

// ──────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...(opts.run ?? {}) })],
    ...(opts.spacing ? { spacing: opts.spacing } : {}),
    ...(opts.alignment ? { alignment: opts.alignment } : {}),
  })
}

function heading(text, level) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] })
}

function bullet(text, reference = 'bullets') {
  return new Paragraph({
    numbering: { reference, level: 0 },
    children: [new TextRun(text)],
  })
}

function blankLine() {
  return new Paragraph({ children: [new TextRun('')] })
}

/**
 * Multi-line text → array of paragraphs. Each \n becomes its own paragraph
 * (docx-js doesn't honour literal line breaks inside a TextRun well).
 */
function multilinePara(text, opts = {}) {
  const lines = String(text).split('\n')
  return lines.map((line, i) =>
    new Paragraph({
      children: [new TextRun({ text: line, ...(opts.run ?? {}) })],
      spacing: i === lines.length - 1 ? opts.spacing : { after: 0 },
    }),
  )
}

// ──────────────────────────────────────────────────────────────────────────
// SHARED BLOCKS — cover + brand brief (same in both docs)
// ──────────────────────────────────────────────────────────────────────────

function coverBlock(subtitle) {
  return [
    blankLine(),
    blankLine(),
    blankLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'The 400 Market',
          size: 72,
          bold: true,
          color: COLORS.brandDark,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'Website Copy Review',
          size: 40,
          color: COLORS.brandMango,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({ text: subtitle, size: 24, italics: true, color: COLORS.granite }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Prepared ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          size: 22,
          color: COLORS.granite,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'by DGTL Group', size: 22, color: COLORS.granite }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ]
}

function howToUseBlock(mode) {
  const paras = [
    heading('How to use this document', HeadingLevel.HEADING_1),
    para(
      'This document contains every piece of customer-facing text on the new 400 Market website that we write (as opposed to text that you type into the CMS yourself — vendor bios, event descriptions, news posts, etc.). Everything you see here is what a visitor will read on the live site.',
      { spacing: { after: 200 } },
    ),
    para(
      'Your job: read it through, then suggest changes wherever the copy feels off-brand, wrong, or could simply be sharper. You don\u2019t need to rewrite anything that already works — only flag what you\u2019d change.',
      { spacing: { after: 200 } },
    ),
  ]

  if (mode === 'prose') {
    paras.push(
      heading('How to mark it up', HeadingLevel.HEADING_2),
      bullet('Use Word\u2019s Review \u2192 Track Changes to edit directly in the document.'),
      bullet('Or use Review \u2192 New Comment to leave suggestions alongside the current copy.'),
      bullet(
        'Anywhere you see [TODO: ...] means we\u2019re missing copy from you. Please fill those in.',
      ),
    )
  } else {
    paras.push(
      heading('How to mark it up', HeadingLevel.HEADING_2),
      bullet('The middle column is the copy currently on the site.'),
      bullet(
        'The right column is blank on purpose \u2014 write your suggested revision there. If the current copy is fine, leave it blank.',
      ),
      bullet(
        "Anywhere you see [TODO: ...] means we\u2019re missing copy from you. Please fill it in.",
      ),
    )
  }

  paras.push(
    blankLine(),
    para(
      'A brand-voice brief follows on the next page as a reference \u2014 feel free to ignore it if you already know your brand inside-out.',
      { run: { italics: true, color: COLORS.granite } },
    ),
    new Paragraph({ children: [new PageBreak()] }),
  )

  return paras
}

function brandBriefBlock() {
  const lines = []

  lines.push(heading('Brand Voice Brief', HeadingLevel.HEADING_1))
  lines.push(
    para(
      'Quick reference for the voice and tone the copy is trying to hit. Not prescriptive \u2014 edit the copy in whatever direction feels right, this is just here for context.',
      { run: { italics: true, color: COLORS.granite }, spacing: { after: 240 } },
    ),
  )

  lines.push(heading('Tagline', HeadingLevel.HEADING_2))
  lines.push(
    para(BRAND_BRIEF.tagline, { run: { bold: true }, spacing: { after: 60 } }),
  )
  lines.push(
    para(`Established ${BRAND_BRIEF.est}.`, {
      run: { color: COLORS.granite },
      spacing: { after: 240 },
    }),
  )

  lines.push(heading('Personality', HeadingLevel.HEADING_2))
  lines.push(heading('We are', HeadingLevel.HEADING_4))
  BRAND_BRIEF.weAre.forEach((t) => lines.push(bullet(t, 'dos')))
  lines.push(heading('We are not', HeadingLevel.HEADING_4))
  BRAND_BRIEF.weAreNot.forEach((t) => lines.push(bullet(t, 'donts')))
  lines.push(blankLine())

  lines.push(heading('Voice constants (apply always)', HeadingLevel.HEADING_2))
  BRAND_BRIEF.voiceConstants.forEach((c) => {
    lines.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${c.label}. `, bold: true }),
          new TextRun({ text: c.desc }),
        ],
        spacing: { after: 60 },
      }),
    )
  })
  lines.push(blankLine())

  lines.push(heading('Tone — flex by context', HeadingLevel.HEADING_2))
  // Simple two-column table for tone flex
  const toneRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          width: { size: 2700, type: WidthType.DXA },
          shading: { fill: COLORS.brandYellow, type: ShadingType.CLEAR },
          children: [
            new Paragraph({ children: [new TextRun({ text: 'Context', bold: true })] }),
          ],
        }),
        new TableCell({
          borders: CELL_BORDERS,
          margins: CELL_MARGINS,
          width: { size: CONTENT_WIDTH - 2700, type: WidthType.DXA },
          shading: { fill: COLORS.brandYellow, type: ShadingType.CLEAR },
          children: [
            new Paragraph({ children: [new TextRun({ text: 'Tone', bold: true })] }),
          ],
        }),
      ],
    }),
  ]
  BRAND_BRIEF.toneFlex.forEach((r) => {
    toneRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: CELL_BORDERS,
            margins: CELL_MARGINS,
            width: { size: 2700, type: WidthType.DXA },
            children: [para(r.context, { run: { bold: true } })],
          }),
          new TableCell({
            borders: CELL_BORDERS,
            margins: CELL_MARGINS,
            width: { size: CONTENT_WIDTH - 2700, type: WidthType.DXA },
            children: [para(r.tone)],
          }),
        ],
      }),
    )
  })
  lines.push(
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [2700, CONTENT_WIDTH - 2700],
      rows: toneRows,
    }),
  )
  lines.push(blankLine())

  lines.push(heading('Language', HeadingLevel.HEADING_2))
  lines.push(heading('Do', HeadingLevel.HEADING_4))
  BRAND_BRIEF.dos.forEach((t) => lines.push(bullet(t, 'dos')))
  lines.push(heading("Don\u2019t", HeadingLevel.HEADING_4))
  BRAND_BRIEF.donts.forEach((t) => lines.push(bullet(t, 'donts')))

  lines.push(new Paragraph({ children: [new PageBreak()] }))

  return lines
}

// ──────────────────────────────────────────────────────────────────────────
// PROSE (Review-mode) DOC
// ──────────────────────────────────────────────────────────────────────────

function buildProseDoc() {
  const body = []
  body.push(...coverBlock('Tracked-changes edition \u2014 edit in Word\u2019s Review tab'))
  body.push(...howToUseBlock('prose'))
  body.push(...brandBriefBlock())

  // Page-by-page prose render
  body.push(heading('The Copy, Page by Page', HeadingLevel.HEADING_1))
  body.push(
    para(
      'Each page below reads roughly top to bottom, as a visitor would see the site. Section names describe the part of the page the copy lives in.',
      { run: { italics: true, color: COLORS.granite }, spacing: { after: 240 } },
    ),
  )

  CONTENT.forEach((page, pageIdx) => {
    if (pageIdx > 0) body.push(new Paragraph({ children: [new PageBreak()] }))

    body.push(heading(page.title, HeadingLevel.HEADING_1))
    body.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: 'URL: ', bold: true, color: COLORS.granite }),
          new TextRun({ text: page.path, color: COLORS.granite, font: 'Consolas' }),
        ],
      }),
    )
    body.push(
      para(page.purpose, {
        run: { italics: true, color: COLORS.granite },
        spacing: { after: 240 },
      }),
    )

    page.sections.forEach((section) => {
      body.push(heading(section.name, HeadingLevel.HEADING_3))
      section.items.forEach((item) => {
        body.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `${item.loc}: `, bold: true }),
            ],
          }),
        )
        // Render each line of the current copy as its own paragraph. Multi-
        // line strings become indented block-quotes so they read as the
        // actual visible copy, visually distinct from the label above.
        const lines = String(item.current).split('\n')
        lines.forEach((line, i) => {
          const isTodo = item.todo === true
          body.push(
            new Paragraph({
              indent: { left: 360 },
              spacing: { after: i === lines.length - 1 ? 120 : 0 },
              children: [
                new TextRun({
                  text: line,
                  italics: isTodo,
                  color: isTodo ? 'A63232' : COLORS.brandDark,
                }),
              ],
            }),
          )
        })
        if (item.context) {
          body.push(
            new Paragraph({
              indent: { left: 360 },
              spacing: { after: 160 },
              children: [
                new TextRun({
                  text: `Note: ${item.context}`,
                  size: 18,
                  italics: true,
                  color: COLORS.granite,
                }),
              ],
            }),
          )
        }
      })
    })
  })

  return new Document({
    creator: 'DGTL Group',
    title: 'The 400 Market \u2014 Website Copy Review (Prose)',
    description: 'All static customer-facing copy on the 400 Market website for management review.',
    styles: BASE_STYLES,
    numbering: BASE_NUMBERING,
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: {
              top: PAGE.margin,
              right: PAGE.margin,
              bottom: PAGE.margin,
              left: PAGE.margin,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                  new TextRun({
                    text: 'The 400 Market \u2014 Website Copy Review',
                    color: COLORS.granite,
                    size: 18,
                  }),
                  new TextRun({ text: '\t', color: COLORS.granite, size: 18 }),
                  new TextRun({
                    text: 'Prose edition',
                    italics: true,
                    color: COLORS.granite,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', color: COLORS.granite, size: 18 }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    color: COLORS.granite,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        children: body,
      },
    ],
  })
}

// ──────────────────────────────────────────────────────────────────────────
// TABLE (side-by-side) DOC
// ──────────────────────────────────────────────────────────────────────────

const TABLE_COLS = [2200, 3880, 3280] // Location · Current · Suggested

function tableHeaderRow() {
  const cell = (text, width) =>
    new TableCell({
      borders: CELL_BORDERS,
      margins: CELL_MARGINS,
      width: { size: width, type: WidthType.DXA },
      shading: { fill: COLORS.brandYellow, type: ShadingType.CLEAR },
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold: true, color: COLORS.brandDark })],
        }),
      ],
    })

  return new TableRow({
    tableHeader: true,
    children: [
      cell('Location', TABLE_COLS[0]),
      cell('Current copy', TABLE_COLS[1]),
      cell('Suggested revision', TABLE_COLS[2]),
    ],
  })
}

function tableBodyRow(item) {
  const isTodo = item.todo === true

  const locCell = new TableCell({
    borders: CELL_BORDERS,
    margins: CELL_MARGINS,
    width: { size: TABLE_COLS[0], type: WidthType.DXA },
    shading: { fill: COLORS.grayBg, type: ShadingType.CLEAR },
    children: [
      para(item.loc, { run: { bold: true, size: 20 } }),
      ...(item.context
        ? [
            new Paragraph({
              spacing: { before: 60 },
              children: [
                new TextRun({
                  text: item.context,
                  size: 16,
                  italics: true,
                  color: COLORS.granite,
                }),
              ],
            }),
          ]
        : []),
    ],
  })

  const currentLines = String(item.current).split('\n')
  const currentCell = new TableCell({
    borders: CELL_BORDERS,
    margins: CELL_MARGINS,
    width: { size: TABLE_COLS[1], type: WidthType.DXA },
    children: currentLines.map(
      (line, i) =>
        new Paragraph({
          spacing: { after: i === currentLines.length - 1 ? 0 : 0 },
          children: [
            new TextRun({
              text: line,
              italics: isTodo,
              color: isTodo ? 'A63232' : undefined,
            }),
          ],
        }),
    ),
  })

  const suggestedCell = new TableCell({
    borders: CELL_BORDERS,
    margins: CELL_MARGINS,
    width: { size: TABLE_COLS[2], type: WidthType.DXA },
    children: [
      new Paragraph({
        children: [new TextRun({ text: '', color: COLORS.granite })],
      }),
    ],
  })

  return new TableRow({
    children: [locCell, currentCell, suggestedCell],
  })
}

function buildTableDoc() {
  const body = []
  body.push(...coverBlock('Side-by-side edition \u2014 write your revisions in the right column'))
  body.push(...howToUseBlock('table'))
  body.push(...brandBriefBlock())

  body.push(heading('The Copy, Page by Page', HeadingLevel.HEADING_1))
  body.push(
    para(
      'One table per page. Left column = where the copy lives on the page. Middle = what\u2019s there now. Right = where you put your suggested revision (leave blank if the current copy is fine).',
      { run: { italics: true, color: COLORS.granite }, spacing: { after: 240 } },
    ),
  )

  CONTENT.forEach((page, pageIdx) => {
    if (pageIdx > 0) body.push(new Paragraph({ children: [new PageBreak()] }))

    body.push(heading(page.title, HeadingLevel.HEADING_1))
    body.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: 'URL: ', bold: true, color: COLORS.granite }),
          new TextRun({ text: page.path, color: COLORS.granite, font: 'Consolas' }),
        ],
      }),
    )
    body.push(
      para(page.purpose, {
        run: { italics: true, color: COLORS.granite },
        spacing: { after: 240 },
      }),
    )

    page.sections.forEach((section) => {
      body.push(heading(section.name, HeadingLevel.HEADING_3))
      const rows = [tableHeaderRow()]
      section.items.forEach((item) => rows.push(tableBodyRow(item)))
      body.push(
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: TABLE_COLS,
          rows,
        }),
      )
      body.push(blankLine())
    })
  })

  return new Document({
    creator: 'DGTL Group',
    title: 'The 400 Market \u2014 Website Copy Review (Table)',
    description:
      'Side-by-side copy review table for the 400 Market website: location, current copy, and a blank column for suggested revisions.',
    styles: BASE_STYLES,
    numbering: BASE_NUMBERING,
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: {
              top: PAGE.margin,
              right: PAGE.margin,
              bottom: PAGE.margin,
              left: PAGE.margin,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                  new TextRun({
                    text: 'The 400 Market \u2014 Website Copy Review',
                    color: COLORS.granite,
                    size: 18,
                  }),
                  new TextRun({ text: '\t', color: COLORS.granite, size: 18 }),
                  new TextRun({
                    text: 'Side-by-side edition',
                    italics: true,
                    color: COLORS.granite,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', color: COLORS.granite, size: 18 }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    color: COLORS.granite,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        children: body,
      },
    ],
  })
}

// ──────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────

const OUT_PROSE = resolve('400-Market-Website-Copy-Review.docx')
const OUT_TABLE = resolve('400-Market-Website-Copy-Table.docx')

const proseDoc = buildProseDoc()
const tableDoc = buildTableDoc()

const [proseBuf, tableBuf] = await Promise.all([
  Packer.toBuffer(proseDoc),
  Packer.toBuffer(tableDoc),
])

writeFileSync(OUT_PROSE, proseBuf)
writeFileSync(OUT_TABLE, tableBuf)

console.log(`Wrote ${OUT_PROSE} (${proseBuf.length.toLocaleString()} bytes)`)
console.log(`Wrote ${OUT_TABLE} (${tableBuf.length.toLocaleString()} bytes)`)
