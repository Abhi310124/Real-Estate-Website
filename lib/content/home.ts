/**
 * Copy and imagery for the home page.
 *
 * Kept as one typed module rather than threaded through the CMS because these are editorial fixtures
 * for a layout, not owner-managed records — projects, settings and posts all live in `lib/data`, and
 * the home page reads those directly wherever it states a fact (the project in focus, the portfolio,
 * the numbers, the values, the contact details).
 *
 * ── Whose words these are ───────────────────────────────────────────────────────────────────────
 * The headings, labels and buttons follow the reference layout's own wording line for line — "Creating
 * spaces for lives well lived", "What we've created", "We've certainly made an impact", "There's so
 * much left to create" — because the owner asked for its text as well as its design. Where one of its
 * sentences states a fact about ITS company (eleven years, "since 2011", a founder, a floor area, a
 * project count), the sentence keeps its shape and the fact is BKR INFRA's or is left out: those
 * figures would be false here, and a false claim in a property advertisement is not a styling choice.
 *
 * ── What is and is not verified ─────────────────────────────────────────────────────────────────
 * Nothing below states a price, a RERA number, a count, a year or an area. The statistics band is
 * computed from the published projects at render time rather than typed here, precisely so that a
 * 108px number can never drift from the portfolio it describes. The prose is marketing voice written
 * for BKR INFRA — how the company works — which is authored copy, not invented fact.
 *
 * Two kinds of placeholder remain, and both must be replaced before launch:
 *
 *   1. THE TESTIMONIALS. None is a real quote from a real buyer. Each is attributed to initials and a
 *      locality rather than an invented name, and carries a visible `PLACEHOLDER` stamp on the page,
 *      so the unverified state cannot ship unnoticed.
 *   2. The story paragraph names the Managing Director, who is a real person, as the founder whose
 *      vision started the company. It describes him rather than quoting him, and needs his approval.
 *
 * Every photograph is one of the curated frames in `components/project/photo.ts`; `CREDITS.md`
 * records that none of them is a building BKR INFRA built. Alt text describes what each frame shows.
 */

export const HERO = {
  /** Two lines at the 64px step, the second word of the first in orange — the reference's own line. */
  lines: [
    { text: 'Creating ', accent: 'spaces' },
    { text: 'for lives well lived', accent: '' },
  ],
  /** Three lines in the 340px lede measure. The reference's "millions across India" is its reach, not ours. */
  lede: 'At BKR INFRA, every project & every vision is powered by our drive to create meaning in the lives of families across Hyderabad.',
  focusLabel: 'In-View',
} as const

export const INTRO = {
  /**
   * Set sentence by sentence, each starting its own line, at the 32px statement step across seven
   * columns — the reference breaks its statement the same way — then the accent line in orange.
   * The reference counts its years here ("It's been eleven years since…"); the sentence keeps its
   * turn without a count, because BKR INFRA's founding year is not on record in this repository.
   */
  statement: [
    "Since the day we started, we've been adding to the skyline of Hyderabad.",
    'Every project since has been about creating spaces meant to hold life, love and laughter within them.',
  ],
  accent: "And we're not stopping any time soon.",
} as const

/**
 * The ten panels of the 3D showcase, alternating outside and inside so the drum never shows two rooms
 * or two elevations side by side. Ten, because the drum's radius is derived from the panel count and
 * ten puts two panels either side of the front one inside a 16:9 frame.
 */
export const SHOWCASE = {
  label: 'BKR INFRA in pictures',
  hint: 'Drag to explore',
  panels: [
    { src: '/photography/exterior-07.jpg', alt: 'Two-storey timber house behind a pool at the end of the garden' },
    { src: '/photography/interior-01.jpg', alt: 'Living room with the stair beyond and a pool through the glazing' },
    { src: '/photography/exterior-05.jpg', alt: 'White cubic massing in raking afternoon sun' },
    { src: '/photography/interior-02.jpg', alt: 'Dining room looking out to the pool deck' },
    { src: '/photography/exterior-04.jpg', alt: 'White villa with deep eaves and planting in the foreground' },
    { src: '/photography/interior-03.jpg', alt: 'Living room with tan leather seating against tall glazing' },
    { src: '/photography/detail-05.jpg', alt: 'Stone and white villa standing above a lap pool' },
    { src: '/photography/exterior-03.jpg', alt: 'Open-plan living space opening onto a deck' },
    { src: '/photography/detail-01.jpg', alt: 'Timber and zinc street elevation' },
    { src: '/photography/interior-08.jpg', alt: 'Living room with a ribbon window in jute and grey' },
  ],
} as const

export const CREATED = {
  title: "What we've created",
  /** The home and full-journey tests find this link by its name. */
  cta: { href: '/projects', label: 'View all projects' },
} as const

export const STATISTICS = {
  lines: [
    { text: "We've certainly", accent: '' },
    { text: 'made an ', accent: 'impact' },
  ],
  testimonialsTitle: 'Hear it from our customers',
} as const

/**
 * THREE PLACEHOLDER TESTIMONIALS. Replace every one with a real, attributable quote before launch.
 * The portrait circle is a material close-up, not a face: inventing a likeness for a quote that was
 * never given would compound the problem rather than dress it up.
 */
export const TESTIMONIALS = [
  {
    quote:
      'The site visits were straightforward and nothing was glossed over. We were shown the layout on ' +
      'the ground before we paid anything, and the handover came through on the date we were first given.',
    attribution: 'A. R. — Villa owner',
    stamp: 'PLACEHOLDER — KOKAPET',
    portrait: '/photography/detail-06.jpg',
  },
  {
    quote:
      'Questions about the title and the approvals were answered with documents rather than reassurance. ' +
      'The plot we bought is the plot we walked that morning, and that is why we went ahead.',
    attribution: 'S. K. — Plot owner',
    stamp: 'PLACEHOLDER — TELLAPUR',
    portrait: '/photography/detail-02.jpg',
  },
  {
    quote:
      'The finishes are plain in the best way. Nothing has needed replacing, the house is quieter inside ' +
      'than we expected, and the same people answer the phone now as before we moved in.',
    attribution: 'N. T. — Homeowner',
    stamp: 'PLACEHOLDER — ADIBATLA',
    portrait: '/photography/detail-03.jpg',
  },
] as const

export const STORIES = {
  /**
   * Ghosted, 99px, uppercase — the second line sets flush right under the first. The reference's
   * second line is its founding year ("since 2011"); BKR INFRA's is not on record, so it names the
   * city instead of guessing one.
   */
  ghost: ['Building stories', 'across Hyderabad'],
  /**
   * The founder's story, the reference's paragraph in shape: the vision on a line of its own, then the
   * person in orange, then the first step. "Founder" rests on the company carrying his initials; the
   * paragraph describes him and is written for his approval before launch.
   */
  story: {
    opening: "It began with our founder's vision.",
    accent: 'B Karthik Reddy',
    after:
      ' saw a Hyderabad where families lived in beautiful homes on land they could trust — homes that went ' +
      'beyond the functional, built as places for the relationships that matter most. He took the first ' +
      'step towards creating that city, and BKR INFRA came into existence.',
  },
  image: { src: '/photography/exterior-01.jpg', alt: 'Dark timber and glass house at dusk, lit from within' },
  /** The paragraph that opens the values timeline, beside the gradient bar. */
  since:
    "Ever since, we've created projects that answer real human needs within the city — needs that range " +
    'from the practical, like clear titles, good roads and water, to the less tangible, like a connection ' +
    'to nature and to a larger community. We build projects that are venues for life to flourish. Just how ' +
    'it should be.',
  valuesTitle: 'What Drives Us?',
} as const

export const ENQUIRY = {
  /** Broken where the reference's centre column breaks it: "There's so much left" / "to create". */
  heading: [
    { text: "There's so much left", accent: '' },
    { text: 'to ', accent: 'create' },
  ],
  /** Two lines under the heading in the doors' centre panel. */
  intro: 'Enquire now and let us help you uncover the endless possibilities for your next venture.',
  queryTypes: ['Open Plots', 'Villas', 'Apartments', 'Independent Houses', 'Other'],
} as const
