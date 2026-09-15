import type { Config } from 'tailwindcss'
import { COLORS } from './lib/tokens'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ...COLORS, brand: { navy: COLORS['navy-800'], orange: COLORS.orange } },
      fontFamily: { display: ['var(--font-archivo)'], body: ['var(--font-inter)'] },
      fontSize: {
        'display-xl': ['clamp(3.25rem, 9vw, 7.5rem)', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 6vw, 5.5rem)', { lineHeight: '0.94', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.75rem, 3.2vw, 3rem)', { lineHeight: '1.02', letterSpacing: '-0.015em' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.75' }],
        body: ['1rem', { lineHeight: '1.7' }],
        caption: ['0.8125rem', { lineHeight: '1.6' }],
        eyebrow: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.32em' }],
      },
    },
  },
  plugins: [],
} satisfies Config
