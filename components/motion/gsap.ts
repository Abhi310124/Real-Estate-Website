'use client'
// Task 13 / Ruling 2: Flip registers alongside ScrollTrigger in this same singleton — still
// exactly one GSAP entry point and one `registerPlugin` call. Flip is bundled with the free
// `gsap` package (unlike, say, SplitText or MorphSVG), so this adds no new paid dependency.
// The cached promise's resolved type widens with an extra `Flip` key; every existing call site
// destructures only the keys it needs (`{ gsap }` or `{ gsap, ScrollTrigger }`), and adding a
// key to an object nobody destructures exhaustively cannot break those call sites.
//
// CustomEase joins them for the same reason, and because the layout this site follows is built on
// four specific cubic-béziers that no named GSAP ease reproduces. They are registered once, here, by
// name — the same names Tailwind gives the CSS versions in `tailwind.config.ts` — so a CSS transition
// and a GSAP tween that are meant to feel identical are literally the same curve:
//
//   door    cubic-bezier(0.8, 0, 0.2, 1)              headings rising, doors parting, hover bars
//   ring    cubic-bezier(0.596, 0.013, 0.281, 0.995)  the gradient ring's sweep
//   zoom    cubic-bezier(0.257, 0.001, 0.392, 1.001)  the slow photograph push on hover
//   reveal  cubic-bezier(0.8, 0, 0.4, 1)              the tinted block dropping off an image
let cached: Promise<{
  gsap: typeof import('gsap').gsap
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
  Flip: typeof import('gsap/Flip').Flip
}> | null = null

export const EASES = {
  door: '0.8,0,0.2,1',
  ring: '0.596,0.013,0.281,0.995',
  zoom: '0.257,0.001,0.392,1.001',
  reveal: '0.8,0,0.4,1',
} as const

export function getGsap() {
  if (!cached) {
    cached = (async () => {
      const [{ gsap }, { ScrollTrigger }, { Flip }, { CustomEase }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/Flip'),
        import('gsap/CustomEase'),
      ])
      gsap.registerPlugin(ScrollTrigger, Flip, CustomEase)
      for (const [name, curve] of Object.entries(EASES)) CustomEase.create(name, curve)
      return { gsap, ScrollTrigger, Flip }
    })()
  }
  return cached
}
