/**
 * The BKR INFRA mark, as vector paths rather than an image.
 *
 * These are the same paths as `app/icon.svg`, which is the source of truth for the identity and the
 * origin of the whole palette — navy ground, cream letterforms, one orange wedge. The favicon keeps
 * its navy ground because a favicon is a fixed tile on someone else's chrome. This component does
 * NOT, and that difference is the point.
 *
 * ## Why the ground is dropped and the letterforms inherit `currentColor`
 *
 * The mark has to sit in a header that crosses navy chapters, cream chapters and full-bleed
 * photography, and whose ink is sampled per band. A logo carrying its own navy rectangle would be a
 * navy block on a navy chapter — invisible — and a hard-edged tile over a photograph. So the
 * letterforms are `currentColor`: they become cream over navy and navy over cream, following the
 * header's own decision, and a single instance works on every ground.
 *
 * The orange wedge stays orange in every context, because it is the one element that makes the mark
 * recognisable rather than just a set of initials. It is a graphic, not text, so the bar it has to
 * clear is 3:1 rather than 4.5:1 — it measures 3.08:1 on cream and 5.17:1 on navy, so it holds on
 * both. That is also exactly why it is not used for the letterforms.
 *
 * ## Sizing
 *
 * Sized by WIDTH, never by height, and this is a bug that has already been shipped here once: the
 * previous mark mixed a scalable graphic with fixed-px text, so giving the lockup a height budget
 * let flex-shrink crush the graphic to 8px tall in the header. `w-*` plus `h-auto` on an SVG with a
 * `viewBox` cannot do that — the aspect ratio does the rest. `shrink-0` stops a flex parent from
 * compressing it regardless.
 *
 * The 240x96 viewBox is 2.5:1, so a 9.5vw width gives roughly the 54px cap height the header band
 * was measured at.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 96"
      // Purely decorative here: every call site wraps this in an element carrying the accessible
      // name, so announcing it again would read the brand twice.
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* BKR — the letterforms, following the header's sampled ink. */}
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M8,8 L44,8 C54,8 59,14 59,22 C59,28 55,32 48,34 L41,38 C56,40 62,45 62,52
           C62,60 55,68 44,68 L8,68 Z
           M19,16 L38,16 C43,16 43,20 43,23 C43,26 41,29 36,29 L19,29 Z
           M19,41 L40,41 C47,41 47,46 47,49 C47,54 43,60 36,60 L19,60 Z"
      />
      {/* The wedge. The one element that is always orange. */}
      <path fill="#FF4907" d="M66,8 L96,8 L66,32 Z" />
      <path fill="currentColor" d="M64,24 L82,24 L112,68 L94,68 Z" />
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M100,8 L124,8 C136,8 141,13 141,21 C141,29 136,34 124,34 L114,34 L114,68 L100,68 Z
           M114,15 L124,15 C130,15 132,17 132,21 C132,25 130,27 124,27 L114,27 Z"
      />
      <path fill="currentColor" d="M114,34 L124,34 L146,74 L136,74 Z" />
    </svg>
  )
}
