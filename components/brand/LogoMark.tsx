import { cn } from '@/lib/cn'

/**
 * The BKR INFRA mark — the real artwork, painted through two alpha masks so it adapts to its ground.
 *
 * ## Where the assets come from
 *
 * The four PNGs in `public/brand/` were extracted from the supplied logo files, not redrawn. The
 * source was a JPEG of the lockup on a flat near-white ground, so every pixel is ink laid over that
 * ground at some coverage; recovering the coverage by projecting `(ground − pixel)` onto
 * `(ground − ink)` un-composites it exactly across the flat interiors and degrades gracefully on the
 * anti-aliased edges, which is what yields a clean alpha channel rather than a hard-thresholded,
 * jagged one. The same pass splits the result by which ink each pixel belongs to, giving one mask for
 * the letterforms and one for the orange wedge and rules.
 *
 * `app/icon.svg` used to hold a hand-traced approximation, and it was crude — wrong letterforms, and
 * the ligature between B, K and R missing entirely. It did get the colours right: sampling the real
 * artwork put navy at #04162E against the token's #0A1A2F, and orange at #FD4A0B against #FF4907,
 * both inside JPEG compression error. So the palette needed no change; only the drawing did.
 *
 * ## Why masks rather than two coloured images
 *
 * The header decides its ink at runtime — it samples what is actually painted behind the band and
 * toggles `text-primary` / `text-secondary` — and a raster cannot follow `currentColor`.
 *
 * The obvious workaround is to ship a navy image and a cream one and hide whichever does not apply.
 * That was the first attempt here and it was broken: keying the choice off an ancestor's ink class
 * (`[.text-secondary_&]:opacity-0`) also matches `<body>`, which carries `text-secondary` for the
 * whole document, so on a light-ink band BOTH variants were hidden and the logo vanished. A
 * descendant selector cannot express "the nearest ink decision" — that is not something CSS can ask
 * about.
 *
 * Masking sidesteps the question entirely. The letterform layer is a block of `currentColor` clipped
 * to the letterform alpha, so it inherits whatever the band decided, exactly like the SVG did, and
 * cross-fades on the band's own `transition-colors`. The accent layer is a block of the brand orange
 * clipped to the wedge-and-rules alpha, so the wedge stays orange on every ground. One source of
 * truth, no variants, and nothing to keep in sync.
 *
 * If a true SVG of the mark ever arrives, replace the two layers with its paths, give the letterforms
 * `currentColor`, keep the orange literal, and delete these four PNGs.
 */

/** Intrinsic pixel size of the extracted crops, used to hold the aspect box before paint. */
const GEOMETRY = {
  mark: { w: 856, h: 336, letters: '/brand/bkr-logo-letters.png', accent: '/brand/bkr-logo-accent.png' },
  lockup: { w: 856, h: 396, letters: '/brand/bkr-lockup-letters.png', accent: '/brand/bkr-lockup-accent.png' },
} as const

/** `mask` needs the `-webkit-` prefix for Safari, which still ships the prefixed property only. */
function maskStyle(url: string): React.CSSProperties {
  return {
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
  }
}

export function LogoMark({
  variant = 'mark',
  className,
}: {
  /** `mark` is BKR over INFRA; `lockup` adds the "REDEFINING REAL ESTATE EXCELLENCE" line. */
  variant?: keyof typeof GEOMETRY
  className?: string
}) {
  const g = GEOMETRY[variant]

  return (
    <span
      aria-hidden="true"
      // The caller sets width; the aspect box comes from the asset's own dimensions so the layout is
      // correct before either mask has loaded and nothing reflows. Never give this a height — a flex
      // parent then compresses it, which is how a previous header shipped an 8px-tall logo.
      className={cn('relative block shrink-0', className)}
      style={{ aspectRatio: `${g.w} / ${g.h}` }}
    >
      {/* Letterforms: `currentColor`, so they follow the band's sampled ink. */}
      <span className="absolute inset-0 bg-current" style={maskStyle(g.letters)} />
      {/* Wedge and rules: always the brand orange, on every ground. */}
      <span className="absolute inset-0 bg-accent" style={maskStyle(g.accent)} />
    </span>
  )
}
