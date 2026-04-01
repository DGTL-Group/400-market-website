import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The 400 Market',
  description: 'Indoor market in Innisfil, Ontario.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
