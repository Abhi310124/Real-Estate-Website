/**
 * The frame shapes a run of journal cards cycles through, and the reason they are written as one
 * family rather than as four unrelated ratios.
 *
 * Measured off the listing at 1440: the four cover photographs render 828x532, 828x591, 828x769 and
 * 828x828 inside 690px columns. Every image on the page is drawn at a uniform 1.2x (see
 * `components/motion/ImageReveal.tsx`), so the frames behind them are 690x443.3, 690x492.5,
 * 690x640.8 and 690x690 — and each of those resolves exactly against a numerator of 14: 14/9,
 * 14/10, 14/13, 14/14. Four denominators on one numerator is authored proportion, not coincidence,
 * and writing them that way is what makes the series legible as a series at a glance. `14/14` is
 * deliberately not `1/1` for the same reason.
 *
 * **The shapes are what produce the stagger, so they are positional.** Both cards in a row are
 * `col-span-6` with no vertical offset and a shared top edge; all of the diagonal comes from the
 * frames standing 443, 493, 641 and 690px tall. That makes the sequence a property of the slot, not
 * of the post — a post moving from slot 1 to slot 2 should change shape, and an editor publishing a
 * piece should not be asked to re-plan the grid. Hence a fixed list here rather than a field on
 * `JournalPost`.
 *
 * They are written out in full rather than composed from a template literal, because Tailwind's
 * scanner only ever sees source text: an interpolated class name produces no CSS at all.
 */
export const CARD_FRAME_ASPECTS = [
  'aspect-[14/9]',
  'aspect-[14/10]',
  'aspect-[14/13]',
  'aspect-[14/14]',
] as const

/**
 * The shape for slot `i`, cycling so any number of published posts is covered. Goes straight into
 * `JournalCard`'s `frameClassName`, which replaces the card's own fallback ratio.
 */
export function cardFrameAspect(i: number): string {
  return CARD_FRAME_ASPECTS[i % CARD_FRAME_ASPECTS.length]
}
