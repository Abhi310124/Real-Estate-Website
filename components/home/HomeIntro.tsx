import { Drift } from '@/components/motion/Drift'
import { Thread } from '@/components/motion/Thread'
import { INTRO } from '@/lib/content/home'

/**
 * The introduction: one statement at the 32px step across eight columns, its last sentence in orange,
 * drifting up into place as it crosses the screen — and the gradient thread dropping through the band
 * at the eleventh column, from the foot of the hero photograph down into the frame of the showcase
 * below (it deliberately overruns the section's bottom edge by the showcase's top padding).
 */
export function HomeIntro() {
  return (
    <section className="relative flex min-h-[720px] items-center py-24 max-lg:min-h-0 max-lg:py-20">
      <div aria-hidden="true" className="layout-grid pointer-events-none absolute inset-0">
        <div className="relative col-span-1 col-start-11 max-lg:col-start-12">
          <Thread className="absolute left-0 top-0 h-[calc(100%+64px)] max-lg:left-auto max-lg:right-0" />
        </div>
      </div>

      <div className="layout-grid w-full">
        <Drift className="col-span-12 lg:col-span-8">
          <p className="font-heading text-h3 text-secondary max-sm:text-h3-sm max-lg:pr-6">
            {INTRO.statement.map((sentence) => (
              <span key={sentence} className="block">
                {sentence}
              </span>
            ))}
            <span className="block text-accentInk">{INTRO.accent}</span>
          </p>
        </Drift>
      </div>
    </section>
  )
}
