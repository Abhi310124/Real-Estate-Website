import type { Config } from 'tailwindcss'
import { COLORS } from './lib/tokens'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './sanity/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: { ...COLORS },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      // The whole scale is viewport-relative, which is what makes the reference's proportions
      // hold at any width instead of drifting the way a rem scale does. Measured at 1440:
      // 8vw = 115.2px, 7vw = 100.8px, 2.2vw = 31.68px, 1.6vw = 23.04px, 1.1vw = 15.84px.
      //
      // line-height is 1 on everything except body copy. Tracking is -3%, and -10% on the mono
      // labels. Both are unusually tight and are a large part of why the reference reads as
      // designed rather than defaulted.
      //
      // Each size carries an `sm:`-side floor via the paired `-sm` token rather than clamp():
      // the reference uses breakpoint variants, and at 390px a bare 8vw is 31px — too small for
      // a display line, so the mobile values are deliberately NOT proportional.
      fontSize: {
        'display-xl': ['8vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-lg': ['7vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-sm-xl': ['13vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-sm-lg': ['11vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        lead: ['2.2vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'lead-sm': ['5.5vw', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        body: ['1.6vw', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        'body-sm': ['4vw', { lineHeight: '1.3', letterSpacing: '-0.03em' }],
        label: ['1.1vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'label-sm': ['3.2vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        mono: ['1.1vw', { lineHeight: '1', letterSpacing: '-0.1em' }],
        'mono-sm': ['3.2vw', { lineHeight: '1', letterSpacing: '-0.1em' }],
      },
      // Only the two weights the reference actually ships. Anything else is a tell.
      fontWeight: { normal: '400', display: '500' },
    },
  },
  plugins: [],
} satisfies Config
