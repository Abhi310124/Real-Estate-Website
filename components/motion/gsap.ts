'use client'
let cached: Promise<{ gsap: typeof import('gsap').gsap; ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }> | null = null

export function getGsap() {
  if (!cached) {
    cached = (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      gsap.registerPlugin(ScrollTrigger)
      return { gsap, ScrollTrigger }
    })()
  }
  return cached
}
