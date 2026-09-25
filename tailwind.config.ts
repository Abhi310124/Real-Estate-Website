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
        // Montserrat for everything that is read; Archivo (at 116% width, see `.font-heading` in
        // globals.css) for everything that is looked at. Two faces, two roles, no third voice.
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        // `mono` and `script` are retired voices from the previous design. They are aliased onto the
        // two live faces rather than deleted so that any component still carrying the class renders in
        // the current system instead of falling back to a browser default.
        mono: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        script: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
      },
      /*
       * A px scale with breakpoint steps — the system this layout was built in — replacing the
       * viewport-relative scale of the previous design. Desktop values are measured at 1440; the
       * `-sm` values are the measured 390px sizes and are applied with `max-sm:`.
       *
       * Display lines sit a touch open (0.0025em) the way the reference's display face is set; body
       * copy is untracked. Line-heights are the measured ratios: 1.16 on the hero line, 1.1 on section
       * headings, 1.3 on the large statement copy, 1.5 on body.
       *
       * The OLD token names at the bottom are remapped onto this scale rather than removed. Several
       * project-detail internals still use them, and remapping means they inherit the new proportions
       * immediately instead of rendering at a 2024 viewport-relative size inside a 2026 layout.
       */
      fontSize: {
        // ── current scale ──────────────────────────────────────────────────────────────────────────
        'hero': ['104px', { lineHeight: '1.1', letterSpacing: '0.0025em' }],
        'hero-sm': ['44px', { lineHeight: '1.1', letterSpacing: '0.0025em' }],
        'h1': ['64px', { lineHeight: '1.16', letterSpacing: '0.0025em' }],
        'h1-sm': ['30px', { lineHeight: '1.16', letterSpacing: '0.0025em' }],
        'h2-xl': ['67px', { lineHeight: '1.2', letterSpacing: '0.0025em' }],
        'h2-xl-sm': ['38px', { lineHeight: '1.17', letterSpacing: '0.0025em' }],
        'h2': ['40px', { lineHeight: '1.1', letterSpacing: '0.0025em' }],
        'h2-sm': ['30px', { lineHeight: '1.2', letterSpacing: '0.0025em' }],
        'h3': ['32px', { lineHeight: '1.3', letterSpacing: '0' }],
        'h3-sm': ['20px', { lineHeight: '1.3', letterSpacing: '0' }],
        'h4': ['24px', { lineHeight: '1.3', letterSpacing: '0' }],
        'h4-sm': ['19px', { lineHeight: '1.3', letterSpacing: '0' }],
        'stat': ['108px', { lineHeight: '1.05', letterSpacing: '0' }],
        'stat-sm': ['56px', { lineHeight: '1.05', letterSpacing: '0' }],
        // The ghosted display line ("BUILDING VALUE"). Named `mega`, not `ghost`: `ghost` is also a colour,
        // and a class that is both a font size and a colour sets both wherever it is used.
        'mega': ['99px', { lineHeight: '1.45', letterSpacing: '0' }],
        'mega-sm': ['46px', { lineHeight: '1.2', letterSpacing: '0' }],
        'numeral': ['128px', { lineHeight: '1', letterSpacing: '0' }],
        'numeral-sm': ['64px', { lineHeight: '1', letterSpacing: '0' }],
        'lede': ['26px', { lineHeight: '1.4', letterSpacing: '0' }],
        'lede-sm': ['19px', { lineHeight: '1.4', letterSpacing: '0' }],
        // The reference's "text-size-large": the label under each 108px statistic, and its jump links.
        'large': ['20px', { lineHeight: '1.5', letterSpacing: '0' }],
        'body': ['16px', { lineHeight: '1.5', letterSpacing: '0' }],
        'body-sm': ['15px', { lineHeight: '1.5', letterSpacing: '0' }],
        'small': ['14px', { lineHeight: '1.5', letterSpacing: '0' }],
        'caption': ['12px', { lineHeight: '1.5', letterSpacing: '0' }],
        'nav': ['16px', { lineHeight: '1.5', letterSpacing: '0' }],

        // ── remapped legacy names (see note above) ─────────────────────────────────────────────────
        'display-xl': ['64px', { lineHeight: '1.16', letterSpacing: '0.0025em' }],
        'display-lg': ['40px', { lineHeight: '1.1', letterSpacing: '0.0025em' }],
        'display-sm-xl': ['30px', { lineHeight: '1.16', letterSpacing: '0.0025em' }],
        'display-sm-lg': ['28px', { lineHeight: '1.2', letterSpacing: '0.0025em' }],
        lead: ['24px', { lineHeight: '1.3', letterSpacing: '0' }],
        'lead-sm': ['20px', { lineHeight: '1.3', letterSpacing: '0' }],
        label: ['14px', { lineHeight: '1.5', letterSpacing: '0' }],
        'label-flow': ['14px', { lineHeight: '1.6', letterSpacing: '0' }],
        'label-flow-sm': ['14px', { lineHeight: '1.6', letterSpacing: '0' }],
        'label-md': ['13px', { lineHeight: '1.4', letterSpacing: '0' }],
        'label-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0' }],
        mono: ['13px', { lineHeight: '1.4', letterSpacing: '0.04em' }],
        'mono-lg': ['24px', { lineHeight: '1.2', letterSpacing: '0' }],
        'mono-note': ['13px', { lineHeight: '1.4', letterSpacing: '0.04em' }],
        'mono-xs': ['12px', { lineHeight: '1.4', letterSpacing: '0.04em' }],
        'mono-sm': ['13px', { lineHeight: '1.4', letterSpacing: '0.04em' }],
        script: ['22px', { lineHeight: '1.2', letterSpacing: '0' }],
      },
      /*
       * Headings are set at 400 — the display face's regular. 500 is the ghosted "building stories"
       * heading only. `display` stays as a name because existing components use `font-display` to mean
       * 500; new work uses `font-medium`.
       */
      fontWeight: { normal: '400', medium: '500', display: '500' },
      maxWidth: { container: '1344px' },
      borderRadius: { card: '8px', frame: '32px' },
      transitionTimingFunction: {
        // The two curves the reference's interactions are built on, named for what they do.
        'door': 'cubic-bezier(0.8, 0, 0.2, 1)',
        'ring': 'cubic-bezier(0.596, 0.013, 0.281, 0.995)',
        'zoom': 'cubic-bezier(0.257, 0.001, 0.392, 1.001)',
        'reveal': 'cubic-bezier(0.8, 0, 0.4, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
