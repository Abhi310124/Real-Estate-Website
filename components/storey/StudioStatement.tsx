import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { STUDIO_STATEMENT } from '@/lib/content/home'

/**
 * Black chapter, `160svh` — the tallest section on the page, and the page's one true display line.
 *
 * The reference sets this at 8vw (115px at 1440) and gives it a whole screen to itself, with the
 * photograph revealed beneath as you continue. The height is what makes it land: at 100svh the
 * statement and the image would share a screen and neither would have weight.
 *
 * The image is positioned with a STATIC offset, not a scroll-scrubbed parallax. Measuring the
 * reference showed its equivalent holds `translate(0px, 20%)` unchanged across a 1800px scroll
 * range — the movement you perceive comes from the section being 160svh tall while the image is
 * pinned inside it, not from any per-frame transform. Reproducing this with a scrubbed parallax
 * would be more code, more jank, and less faithful.
 */
export function StudioStatement() {
  return (
    <section
      data-studio-statement
      className="relative h-[160svh] w-full overflow-hidden bg-secondary text-primary max-sm:h-auto max-sm:py-[18vw]"
    >
      <div className="layout-grid relative z-10 h-[110svh] content-center max-sm:h-auto">
        <h2 className="col-span-12 text-display-xl font-display max-sm:text-display-sm-xl sm:col-span-10">
          {STUDIO_STATEMENT.heading}
        </h2>
        <div className="col-span-12 mt-[3vw] sm:col-span-3 max-sm:mt-[8vw]">
          <Button href={STUDIO_STATEMENT.cta.href} tone="light" className="w-full sm:w-auto">
            {STUDIO_STATEMENT.cta.label}
          </Button>
        </div>
      </div>

      {/* Sticky, so the photograph holds still while the statement scrolls off it. */}
      <div className="sticky bottom-0 h-[50svh] w-full max-sm:relative max-sm:mt-[12vw] max-sm:h-[70svh]">
        <Image
          src={STUDIO_STATEMENT.image}
          alt={STUDIO_STATEMENT.imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </section>
  )
}
