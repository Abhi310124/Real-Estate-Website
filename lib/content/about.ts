/**
 * Copy and imagery for `/about`.
 *
 * Written under the same rules as `lib/content/home.ts`: the headings and sentences follow the
 * reference layout's own wording, and nothing here states a price, a RERA number, a count, a year or
 * an area. Where the reference counts its own history ("founded in 2011", "in the 13 years since"),
 * the sentence keeps its shape without the count, because BKR INFRA's founding year is not on record
 * in this repository. The numbers in the circles are computed from the published portfolio at render
 * time, and the three pillars come from settings.
 *
 * **No history timeline, and that is deliberate.** The layout this page follows runs a row of founding
 * and milestone years. BKR INFRA's history is not in this repository, and a row of invented years is a
 * misrepresentation, not a placeholder — so that row carries the company's three pillars instead
 * (Develop, Design, Deliver: the three words on its business card).
 *
 * **The note is written FOR the Managing Director**, not quoted from him — he is a real, named person,
 * the only one in this repository — and it needs his approval before launch. It follows the shape of
 * the reference's founder's note (the mission, what the company is not "just about", what every
 * investment deserves) in words of its own. There is no photograph of him in the set, and a stock face
 * standing in for a named real person would be a fabrication, so the frame beside the note holds the
 * work instead and its alt text says so.
 */

export const ABOUT_HERO = {
  label: 'About',
  lines: ['Building homes with heart,', 'for you and your loved ones.'],
  image: { src: '/photography/exterior-02.jpg', alt: 'White rendered villa above a pool' },
} as const

export const ABOUT_STATEMENT = {
  /** At the 32px statement step across eight columns. */
  copy:
    "BKR INFRA was founded with the vision of transforming Hyderabad's skyline like never before. In the " +
    "years since our inception, we've done just that, but we're just getting started.",
  labels: ['Hyderabad, Telangana', 'TS RERA registered'],
} as const

export const DIRECTOR_NOTE = {
  before:
    'At BKR INFRA, our mission is to redefine what it means to own land and a home in Hyderabad. ' +
    "We're not just about selling plots and buildings; ",
  accent: "we're creating places that stay livable and valuable for generations.",
  after: ' We believe that every investment deserves not just appreciation, but genuine value that lasts.',
  name: 'B Karthik Reddy',
  role: 'Managing Director, BKR INFRA',
  image: { src: '/photography/interior-03.jpg', alt: 'Living room with tan leather seating against tall glazing' },
} as const

export const ABOUT_JOIN = {
  lines: ['Join us in building', 'Hyderabad together!'],
  copy:
    'Our team is close-knit. The projects we take on are select. Our vision is sacrosanct. Come and meet ' +
    'us — we would love to show you what we are building.',
} as const
