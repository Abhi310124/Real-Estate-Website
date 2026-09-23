/**
 * The one number the project detail page's anchor navigation depends on, in one place.
 *
 * `SectionNav` pins directly beneath the sticky header, so the band of screen a section's heading
 * would be hidden behind is `header height + nav height`: 94px + the nav's 48px row = 142px at desktop
 * (88 + 48 = 136px on phones). 150px clears both with a little air.
 *
 * Two consumers have to agree on it or anchor jumps and scrollspy disagree about what is in view:
 * every section's own `scroll-mt-*` (without it, a `#plans` jump aligns the section's top edge with
 * the viewport's, landing it underneath the header and the nav), and SectionNav's scrollspy maths.
 *
 * Exported as a literal class string rather than computed, because Tailwind's scanner only ever sees
 * source text; one literal here generates the utility for every importer.
 */
export const SECTION_SCROLL_MT = 'scroll-mt-[150px]'

/** The same measurement in pixels, for SectionNav's scrollspy maths. */
export const OCCLUDED_TOP_PX = 150
