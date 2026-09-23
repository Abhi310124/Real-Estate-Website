/**
 * Copy and imagery for the home page.
 *
 * Kept as one typed module rather than threaded through the CMS because these are editorial fixtures
 * for a layout, not owner-managed records — projects, settings and posts all live in `lib/data`, and
 * the home page reads those directly wherever it states a fact (the project in focus, the portfolio,
 * the numbers, the values, the contact details).
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
 *   2. The story paragraph names the Managing Director, who is a real person; it describes the
 *      company's approach rather than quoting him, and is still worth his approval.
 *
 * Every photograph is one of the curated frames in `components/project/photo.ts`; `CREDITS.md`
 * records that none of them is a building BKR INFRA built. Alt text describes what each frame shows.
 */

export const HERO = {
  /** Two lines at the 64px step, 17 characters each — the measure the split hero's left half holds. */
  lines: [
    { text: 'Land chosen ', accent: 'well,' },
    { text: 'homes built right', accent: '' },
  ],
  /** 118 characters, three lines in the 340px lede measure under the headline. */
  lede: 'At BKR INFRA, every project begins with the land — chosen early, laid out with care and handed over with clear titles.',
  focusLabel: 'In focus',
} as const

export const INTRO = {
  /**
   * Set sentence by sentence, each starting its own line, at the 32px statement step across seven
   * columns — the reference breaks its statement the same way — then the accent line in orange.
   */
  statement: [
    'Hyderabad is growing in every direction at once.',
    'Our work is to be there first — to choose the land, lay it out properly and build homes that ' +
      'still make sense when the city arrives around them.',
  ],
  accent: 'That is what we mean by value.',
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
  /** "Building", not "built": most of the portfolio is ongoing or upcoming, and the heading says so. */
  title: "What we're building",
  /** Must keep the words "view projects" together — the full-journey test finds this link by them. */
  cta: { href: '/projects', label: 'View projects' },
} as const

export const STATISTICS = {
  lines: [
    { text: 'Growing across', accent: '' },
    { text: '', accent: 'Hyderabad' },
  ],
  testimonialsTitle: 'Hear it from our buyers',
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
  /** Ghosted, 99px, uppercase — the second line sets flush right under the first. */
  ghost: ['Building value', 'Plot by plot'],
  story: {
    before: 'BKR INFRA is led by ',
    accent: 'B Karthik Reddy',
    after:
      ', and it works from one conviction: a neighbourhood is decided long before anyone builds in it — ' +
      'by who chooses the land, how it is laid out, and whether its titles are clean. We exist to get ' +
      'those three things right.',
  },
  image: { src: '/photography/exterior-01.jpg', alt: 'Dark timber and glass house at dusk, lit from within' },
  /** The paragraph that opens the values timeline, beside the gradient bar. */
  since:
    'Every project since has followed the same order: the land first, the layout second, the building ' +
    'third — and the paperwork alongside all three, so that what a buyer is shown is what a buyer receives.',
  valuesTitle: 'What drives us',
} as const

export const ENQUIRY = {
  heading: { text: "Let's find your", accent: 'next address' },
  /** Two lines under the heading in the doors' centre panel. */
  intro: "Tell us what you're looking for and where. We'll come back with what fits, what it costs and when it can be yours.",
  queryTypes: ['Open Plots', 'Villas', 'Apartments', 'Independent Houses', 'Other'],
} as const
