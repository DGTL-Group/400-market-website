import type { Metadata } from 'next'
import { metafora, dmSans } from '@/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'The 400 Market — Food, Finds & Fun',
    template: '%s | The 400 Market',
  },
  description:
    'Ontario\'s favourite indoor market. Over 140 vendors, open every weekend in Innisfil. Shop antiques, clothing, food, crafts, electronics and more.',
  keywords: [
    '400 Market', 'Innisfil market', 'indoor flea market', 'Ontario flea market',
    'antiques', 'collectibles', 'vendors', 'weekend market', 'Innisfil Ontario',
  ],
  metadataBase: new URL('https://www.400market.com'),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'The 400 Market',
    images: [
      {
        url: '/og-icon.png',
        width: 512,
        height: 512,
        alt: 'The 400 Market',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The 400 Market — Food, Finds & Fun',
    description:
      'Ontario\'s favourite indoor market. Over 140 vendors, open every weekend in Innisfil.',
    images: ['/og-icon.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${metafora.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
