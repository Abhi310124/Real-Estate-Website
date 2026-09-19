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
        // Third voice, used once — the handwritten line on the note card. See app/layout.tsx.
        script: ['var(--font-script)', 'cursive'],
      },
      // The whole scale is viewport-relative, which is what makes the reference's proportions
      // hold at any width instead of drifting the way a rem scale does. Measured at 1440:
      // 15vw = 216px, 8vw = 115.2px, 7vw = 100.8px, 2.2vw = 31.68px, 1.6vw = 23.04px,
      // 1.5vw = 21.6px, 1.1vw = 15.84px, 1vw = 14.4px, 0.8vw = 11.52px.
      //
      // The scale is small on purpose: six sans steps, four mono steps, one script step, nothing
      // else. The mono steps matter more than their count suggests — they run from a 216px numeral
      // through a 31.68px panel title down to two stamp sizes BELOW the 15.84px sans label. A
      // single `mono` token cannot express that, and a page with only one mono size reads as
      // sans-with-captions rather than as two coequal voices, which is most of the technical
      // register the reference gets from its labels.
      //
      // Why `numeral` is a mono step and not a sans one: monospace is fixed-advance, so "1", "2"
      // and "3" occupy an identical box (0.5em each in JetBrains Mono) and stack in a true column.
      // Set in the proportional sans the same three glyphs differ in width by more than 33px, and
      // a numbered series stops reading as a series.
      //
      // line-height is 1 on every step except `body` and `label-flow`. `label` is 1.0 because on
      // the reference no 15.84px run ever wraps — its widest is 250.9px on one line — so the
      // leading never shows. `label-flow` is the same size at 1.4 for the runs that genuinely do
      // wrap (legal copy, a long address): 15.84px text on 15.84px leading over three lines
      // leaves literally zero space between descender and ascender. It is the one small step that
      // needs its own `-sm` pair rather than borrowing `label-sm`, since a narrow screen is where
      // that text wraps hardest and `label-sm` would put the zero leading straight back.
      //
      // Tracking is -3% on sans, -10% on mono, and exactly 0 on `script` — the handwritten line is
      // the one run on the reference that is not tracked in at all, and tightening a script face
      // closes its loops and collapses the very thing it is there to provide.
      //
      // Each size carries an `sm:`-side floor via the paired `-sm` token rather than clamp():
      // the reference uses breakpoint variants, and at 390px a bare 8vw is 31px — too small for
      // a display line, so the mobile values are deliberately NOT proportional.
      //
      // The mobile values are the reference's own measured six-step clamp at 390x844, and the
      // load-bearing fact about them is the floor: **nothing on the reference renders below
      // 16.77px (4.3vw)**, and at that width it collapses body, label and mono onto that one step.
      // `label-sm`/`mono-sm` were previously 3.2vw = 12.48px, which showed on footer links, the
      // mono eyebrow and the menu trigger — visibly under the floor, and the sort of value that
      // looks fine scaled down on a desktop monitor and is unreadable in a hand.
      // `lead-sm` is 8vw (31.2px) at weight 400, not 5.5vw at 500: the reference puts weight 500 on
      // its top two mobile steps only, exactly as it does at desktop.
      fontSize: {
        'display-xl': ['8vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-lg': ['7vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-sm-xl': ['15vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-sm-lg': ['12vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        lead: ['2.2vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'lead-sm': ['8vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        body: ['1.6vw', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        'body-sm': ['4.3vw', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        label: ['1.1vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'label-flow': ['1.1vw', { lineHeight: '1.4', letterSpacing: '-0.03em' }],
        'label-flow-sm': ['4.3vw', { lineHeight: '1.4', letterSpacing: '-0.03em' }],
        'label-md': ['1vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'label-sm': ['4.3vw', { lineHeight: '1', letterSpacing: '-0.03em' }],
        mono: ['1.1vw', { lineHeight: '1', letterSpacing: '-0.1em' }],
        'mono-lg': ['2.2vw', { lineHeight: '1', letterSpacing: '-0.1em' }],
        'mono-note': ['1vw', { lineHeight: '1', letterSpacing: '-0.1em' }],
        'mono-xs': ['0.8vw', { lineHeight: '1', letterSpacing: '-0.1em' }],
        'mono-sm': ['4.3vw', { lineHeight: '1', letterSpacing: '-0.1em' }],
        numeral: ['15vw', { lineHeight: '1', letterSpacing: '-0.1em' }],
        script: ['1.5vw', { lineHeight: '1', letterSpacing: '0' }],
      },
      // Only the two weights the reference actually ships. Anything else is a tell.
      //
      // `font-display` (500) belongs on `text-display-xl` and `text-display-lg` ONLY. The
      // reference's weight system is binary and the split sits exactly at its two display steps
      // (115.2px and 100.8px): everything below them is 400, including all fifteen instances of
      // the 31.68px `lead` step — section titles, the header wordmark, card titles, footer column
      // heads. It has no visible 500 at 31.68px anywhere. So `text-lead font-display` is one
      // weight too heavy by definition, not by taste: at that size a 500 reads as a heading that
      // has been emboldened rather than one that has been sized, which is the single most common
      // way this palette-free design loses its composure.
      //
      // The one exception on the reference is the 14.4px note-card wordmark, which is 500 — pair
      // `text-label-md` with `font-display` there and nowhere else small.
      fontWeight: { normal: '400', display: '500' },
    },
  },
  plugins: [],
} satisfies Config
