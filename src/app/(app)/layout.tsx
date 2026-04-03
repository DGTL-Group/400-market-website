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
  metadataBase: new URL('https://www.400market.com'),
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'The 400 Market',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${metafora.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
