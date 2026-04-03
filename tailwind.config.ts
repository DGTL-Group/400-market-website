import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F7D117',
          orange: '#F7941D',
          mango: '#E57200',
          dark: '#2C2C2C',
        },
        surface: {
          light: '#EBEBEB',
          placeholder: '#CCCCCC',
        },
        text: {
          primary: '#2C2C2C',
          secondary: '#606060',
          subtle: '#A6A6A6',
        },
        footer: {
          bg: '#2C2C2C',
          bottom: '#707070',
        },
      },
      fontFamily: {
        display: ['var(--font-metafora)', ...defaultTheme.fontFamily.sans],
        body: ['var(--font-dm-sans)', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        // Display / headline scale (METAFORA — always uppercase via component)
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '0.02em' }],
        'display-lg': ['2.75rem', { lineHeight: '1.1', letterSpacing: '0.02em' }],
        'display-md': ['2rem', { lineHeight: '1.15', letterSpacing: '0.015em' }],
        'display-sm': ['1.5rem', { lineHeight: '1.2', letterSpacing: '0.01em' }],
        // Body scale (DM Sans — 16px minimum)
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body-md': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        button: '4px',
      },
      maxWidth: {
        content: '1280px',
      },
      spacing: {
        section: '5rem',
        'section-sm': '3rem',
      },
    },
  },
  plugins: [],
}

export default config
