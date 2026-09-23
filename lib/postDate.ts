/**
 * `publishedAt` → the stamped mono dateline ("14 Aug 2026").
 *
 * Parsed out of the ISO string with a regex rather than via `new Date(...).toLocaleDateString()`,
 * and that choice is load-bearing rather than fussy. `publishedAt` is a date-only string
 * (`YYYY-MM-DD`), which `Date` interprets as UTC midnight; formatting it in any negative-offset
 * timezone renders the previous day. Since these pages are prerendered on a server whose timezone
 * is not the reader's, the same post would carry two different dates depending on where it was
 * built. String slicing has no timezone to get wrong.
 *
 * The raw ISO value still goes on `<time dateTime>` at every call site, so machines read the
 * unambiguous form and only the human-facing text is reformatted.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatPostDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  // Unrecognised shape falls back to the raw value rather than to an empty string or "Invalid
  // Date" — a dateline is metadata, and showing something true-but-ugly beats showing nothing.
  if (!match) return iso

  const [, year, month, day] = match
  const name = MONTHS[Number(month) - 1]
  if (!name) return iso

  return `${Number(day)} ${name} ${year}`
}

/** "3 min read", at 200 words a minute across the excerpt and body; never less than one minute. */
export function readingTime(paragraphs: string[]): string {
  const words = paragraphs.join(' ').split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}
