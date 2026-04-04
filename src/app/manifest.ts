import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The 400 Market',
    short_name: '400 Market',
    description:
      "Ontario's favourite indoor market. Over 140 vendors, open every weekend in Innisfil.",
    start_url: '/',
    display: 'standalone',
    background_color: '#2C2C2C',
    theme_color: '#F7D117',
    icons: [
      {
        src: '/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
