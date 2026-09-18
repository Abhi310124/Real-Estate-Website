/**
 * The one number the project detail page's anchor navigation depends on, in one place.
 *
 * `SectionNav` pins itself directly beneath the fixed header, so the band of screen a section's
 * heading would be hidden behind is `header height + nav height`. Measured against the current
 * monochrome header (`layout-grid fixed py-[1.4vw]`, tallest child the Contact button at
 * `py-[0.65vw]` + `text-label`) that is 5.2vw — 75px at 1440 — and below `sm` it is
 * `8vw + 44px` (the `min-h-11` Menu button), which is 75px at 390. The nav's own row is a
 * `min-h-11` touch target, 44px. Both breakpoints therefore land the occluded band's bottom edge
 * at ~119px, and 136px clears it with room to breathe.
 *
 * Two consumers have to agree on it or anchor jumps and scrollspy disagree about what is in view:
 * every section's own `scroll-mt-*` (without it, a `#plans` jump or `scrollIntoView()` aligns the
 * section's top edge with the viewport's, landing it *underneath* the header and this nav), and
 * SectionNav's IntersectionObserver rootMargin.
 *
 * It is exported as a literal class string rather than computed, because Tailwind's scanner only
 * ever sees source text — but it only has to appear literally *somewhere* inside the `content`
 * globs, and this file is inside `./components/**`, so one definition here generates the utility
 * for every importer.
 */
export const SECTION_SCROLL_MT = 'scroll-mt-[136px]'

/** The same measurement in pixels, for SectionNav's scrollspy maths. */
export const OCCLUDED_TOP_PX = 136
