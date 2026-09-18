import Image from 'next/image'
import { RuleDraw } from '@/components/motion/RuleDraw'
import type { JournalPost } from '@/lib/data/types'

/**
 * The post's opening screen: full-bleed cover photograph at `110svh` with the title bottom-left.
 *
 * Built on `components/storey/Hero.tsx` rather than beside it, so the two full-bleed openings on
 * the site behave identically:
 *
 * - `110svh`, not `100svh`. The photograph is always taller than the viewport, so the body copy is
 *   already encroaching as the reader starts to scroll and the page feels continuous rather than
 *   paged. `svh` so mobile browser chrome cannot crop it.
 * - A bottom-weighted gradient rather than a flat wash — the title only needs protecting at the
 *   bottom, and a flat overlay would mute the whole photograph, which is most of what it is for.
 * - The copy block is anchored in `svh` (`bottom-[12svh]`) because the section is sized in `svh`;
 *   a `vw` offset here clips off the bottom edge at wide-but-short viewports.
 *
 * `next/image` with `priority` rather than `ImageReveal`: this is unambiguously the LCP element, and
 * fading in the largest paint is the one place the reveal actively hurts. Every other image on the
 * route is revealed.
 *
 * The header already knows to render light ink here — `/journal/[slug]` is matched by
 * `isFullBleedRoute` in `components/layout/SiteHeader.tsx`, so this section must stay dark-topped.
 * There is no dateline over the photograph: it lives beside the body in `PostBody`, where the left
 * columns are free, and stamping it in both places just duplicates a `<time>` element.
 */
export function PostCover({ post }: { post: JournalPost }) {
  return (
    <section data-journal-cover className="relative h-[110svh] w-full bg-secondary">
      <div className="absolute inset-0">
        <Image
          src={post.coverImage.url}
          alt={post.coverImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-secondary/10 to-secondary/25"
        />
      </div>

      <div className="layout-grid absolute inset-x-0 bottom-[12svh] text-primary max-sm:bottom-[16svh]">
        <div className="col-span-12 sm:col-span-9">
          <RuleDraw className="mb-[2vw] text-primary max-sm:mb-[6vw]" />
          <h1 className="text-display-lg font-display max-sm:text-display-sm-lg">{post.title}</h1>
        </div>
      </div>
    </section>
  )
}
