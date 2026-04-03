import localFont from 'next/font/local'
import { DM_Sans } from 'next/font/google'

/**
 * METAFORA — Display / headline font by Dirtyline Studio.
 * Full family loaded so we can experiment with weights during dev.
 * Trim unused weights before production launch.
 */
export const metafora = localFont({
  src: [
    { path: './Metafora-Thin.woff2', weight: '100', style: 'normal' },
    { path: './Metafora-ThinOblique.woff2', weight: '100', style: 'oblique' },
    { path: './Metafora-ExtraLight.woff2', weight: '200', style: 'normal' },
    { path: './Metafora-ExtraLightOblique.woff2', weight: '200', style: 'oblique' },
    { path: './Metafora-Light.woff2', weight: '300', style: 'normal' },
    { path: './Metafora-LightOblique.woff2', weight: '300', style: 'oblique' },
    { path: './Metafora-Regular.woff2', weight: '400', style: 'normal' },
    { path: './Metafora-Oblique.woff2', weight: '400', style: 'oblique' },
    { path: './Metafora-Medium.woff2', weight: '500', style: 'normal' },
    { path: './Metafora-MediumOblique.woff2', weight: '500', style: 'oblique' },
    { path: './Metafora-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: './Metafora-SemiBoldOblique.woff2', weight: '600', style: 'oblique' },
    { path: './Metafora-Bold.woff2', weight: '700', style: 'normal' },
    { path: './Metafora-BoldOblique.woff2', weight: '700', style: 'oblique' },
    { path: './Metafora-ExtraBold.woff2', weight: '800', style: 'normal' },
    { path: './Metafora-ExtraBoldOblique.woff2', weight: '800', style: 'oblique' },
    { path: './Metafora-Black.woff2', weight: '900', style: 'normal' },
    { path: './Metafora-BlackOblique.woff2', weight: '900', style: 'oblique' },
  ],
  variable: '--font-metafora',
  display: 'swap',
})

/**
 * DM Sans — Body / UI font from Google Fonts.
 * Loaded automatically via next/font/google.
 */
export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})
