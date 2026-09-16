import { Reveal } from '@/components/motion/Reveal'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { Counter } from '@/components/motion/Counter'
import { Marquee } from '@/components/motion/Marquee'
import { Parallax } from '@/components/motion/Parallax'
import { SplitWords } from '@/components/motion/SplitWords'

// Development harness for the Task 5 motion primitives. Each primitive is separated by
// an h-screen spacer so its ScrollTrigger fires at a realistic scroll distance rather
// than all firing at once on load. Not linked from any real page — Task 23 excludes it
// from the sitemap and marks it noindex.
export default function MotionLabPage() {
  return (
    <main id="main" className="bg-ivory text-navy-800">
      <section className="flex h-screen items-center justify-center">
        <h1 className="font-display-expanded text-display-xl">Motion Lab</h1>
      </section>

      <div className="h-screen" aria-hidden="true" />

      <section className="mx-auto max-w-2xl px-6">
        <Reveal data-testid="reveal">
          <p className="text-lg">
            This paragraph reveals on scroll: it fades in and lifts from 28px below to its resting
            position over 0.9s.
          </p>
        </Reveal>
      </section>

      <div className="h-screen" aria-hidden="true" />

      <section className="mx-auto max-w-3xl px-6">
        <ImageReveal
          src="/placeholder/hero.png"
          alt="Placeholder development photography"
          className="h-[70vh] w-full"
        />
      </section>

      <div className="h-screen" aria-hidden="true" />

      <section className="flex h-screen flex-col items-center justify-center gap-2">
        <Counter value={90} suffix="Acres" className="font-display-expanded text-display-xl" />
        <p>under active development</p>
      </section>

      <div className="h-screen" aria-hidden="true" />

      <section className="py-12">
        <Marquee speed={40} className="text-2xl font-display-expanded">
          <span className="mx-6">Open Plots</span>
          <span className="mx-6">Villas</span>
          <span className="mx-6">Apartments</span>
          <span className="mx-6">Independent Houses</span>
        </Marquee>
      </section>

      <div className="h-screen" aria-hidden="true" />

      {/* Ruling 8: a tall (not just h-screen) section gives the scrub tween generous
          room on both sides of "just visible", so a modest test scroll lands well
          inside its start/end range rather than risking scrollIntoViewIfNeeded already
          snapping it to the edge of that range. */}
      <section className="flex h-[150vh] items-center justify-center px-6">
        <Parallax data-testid="parallax" speed={0.2} className="max-w-xl text-2xl">
          <p>This block drifts upward at a different rate than the page scrolls beneath it.</p>
        </Parallax>
      </section>

      <div className="h-screen" aria-hidden="true" />

      {/* Ruling 9: deliberately below the fold (several viewports down) so its
          ScrollTrigger (start: 'top 82%', once: true) cannot have fired yet on initial
          load — Task 4's own h1 is above the fold and races that same trigger, which is
          exactly why this regression test lives here instead of in split-words.spec.ts. */}
      <section className="flex h-screen items-center justify-center px-6">
        <SplitWords
          as="h2"
          data-testid="split-words-below-fold"
          className="text-center font-display-expanded text-display-xl"
          text="Motion Confirmed Below The Fold"
        />
      </section>

      <div className="h-screen" aria-hidden="true" />
    </main>
  )
}
