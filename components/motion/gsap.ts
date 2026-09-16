'use client'
// Task 13 / Ruling 2: Flip registers alongside ScrollTrigger in this same singleton — still
// exactly one GSAP entry point and one `registerPlugin` call. Flip is bundled with the free
// `gsap` package (unlike, say, SplitText or MorphSVG), so this adds no new paid dependency.
// The cached promise's resolved type widens with an extra `Flip` key; every existing call site
// destructures only the keys it needs (`{ gsap }` or `{ gsap, ScrollTrigger }`), and adding a
// key to an object nobody destructures exhaustively cannot break those call sites.
let cached: Promise<{
  gsap: typeof import('gsap').gsap
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
  Flip: typeof import('gsap/Flip').Flip
}> | null = null

export function getGsap() {
  if (!cached) {
    cached = (async () => {
      const [{ gsap }, { ScrollTrigger }, { Flip }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/Flip'),
      ])
      gsap.registerPlugin(ScrollTrigger, Flip)
      return { gsap, ScrollTrigger, Flip }
    })()
  }
  return cached
}
