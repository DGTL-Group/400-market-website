import { NextRequest, NextResponse } from 'next/server'

// Exact path redirects (old WordPress URL → new URL)
const exactRedirects: Record<string, string> = {
  '/monthly-giveaway-100-gift-certificate/': '/shop/',
  '/monthly-giveaway-100-gift-certificate': '/shop/',
  '/cart/': '/shop/',
  '/cart': '/shop/',
  '/checkout/': '/shop/',
  '/checkout': '/shop/',
  '/product/400-market-parking-pass/': '/shop/parking-pass/',
  '/product/400-market-parking-pass': '/shop/parking-pass/',
  '/product/5-400-market-gift-certificate/': '/shop/gift-certificate-5/',
  '/product/5-400-market-gift-certificate': '/shop/gift-certificate-5/',
  '/product/10-400-market-gift-certificate/': '/shop/gift-certificate-10/',
  '/product/10-400-market-gift-certificate': '/shop/gift-certificate-10/',
  '/locations.kml': '/contact-us/',
}

// WordPress blog posts that moved from root to /news/
const blogPostSlugs = [
  'from-basement-to-bustle-why-you-should-set-up-shop-at-the-400-market',
  'the-400-market-chronicles-why-selling-grandmas-stuff-is-the-ultimate-tribute',
]

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // WooCommerce ?add-to-cart= query string
  if (searchParams.has('add-to-cart')) {
    return NextResponse.redirect(new URL('/shop/', request.url), 301)
  }

  // Exact path redirects
  const exactTarget = exactRedirects[pathname]
  if (exactTarget) {
    return NextResponse.redirect(new URL(exactTarget, request.url), 301)
  }

  // /wp-admin/* → /admin
  if (pathname.startsWith('/wp-admin')) {
    return NextResponse.redirect(new URL('/admin', request.url), 301)
  }

  // Root-level blog posts → /news/[slug]
  const cleanPath = pathname.replace(/^\/|\/$/g, '')
  if (blogPostSlugs.includes(cleanPath)) {
    return NextResponse.redirect(new URL(`/news/${cleanPath}/`, request.url), 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/monthly-giveaway-100-gift-certificate/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/product/:path*',
    '/wp-admin/:path*',
    '/locations.kml',
    '/from-basement-to-bustle-why-you-should-set-up-shop-at-the-400-market/:path*',
    '/the-400-market-chronicles-why-selling-grandmas-stuff-is-the-ultimate-tribute/:path*',
  ],
}
