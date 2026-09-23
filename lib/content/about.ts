/**
 * Copy and imagery for `/about`.
 *
 * Written under the same rules as `lib/content/home.ts`: nothing here states a price, a RERA number, a
 * count, a year or an area. The numbers in the circles are computed from the published portfolio at
 * render time, and the three pillars come from settings. Everything else is marketing voice about how
 * the business works — authored copy, not invented fact.
 *
 * **No history timeline, and that is deliberate.** The layout this page follows runs a row of founding
 * and milestone years. BKR INFRA's history is not in this repository, and a row of invented years is a
 * misrepresentation, not a placeholder — so that row carries the company's three pillars instead
 * (Develop, Design, Deliver: the three words on its business card).
 *
 * **The note is written FOR the Managing Director**, not quoted from him — he is a real, named person,
 * the only one in this repository — and it needs his approval before launch. There is no photograph of
 * him in the set, and a stock face standing in for a named real person would be a fabrication, so the
 * frame beside the note holds the work instead and its alt text says so.
 */

export const ABOUT_HERO = {
  crumb: 'About',
  lines: ['Land bought early, homes built', 'carefully, keys handed over on time.'],
  image: { src: '/photography/exterior-02.jpg', alt: 'White rendered villa above a pool' },
} as const

export const ABOUT_STATEMENT = {
  /** At the 32px statement step across eight columns. */
  copy:
    'Everything we do happens inside one office. The land is chosen here, the layouts are drawn here, ' +
    'and every site is run by the people who signed for the ground it stands on. Before an elevation is ' +
    'drawn we walk the land — for access, for water, and for where the light falls in the afternoon.',
  labels: ['Hyderabad, Telangana', 'TS RERA registered'],
} as const

export const DIRECTOR_NOTE = {
  before: 'Every project carries our name on it and our own office address behind it. ',
  accent: 'If something is not right, you know exactly which door to knock on.',
  after: ' We would far rather hear it from you while we can still fix it than hear about it later from somebody else.',
  name: 'B Karthik Reddy',
  role: 'Managing Director, BKR INFRA',
  image: { src: '/photography/interior-03.jpg', alt: 'Living room with tan leather seating against tall glazing' },
} as const

export const ABOUT_JOIN = {
  lines: ["Let's build what", 'Hyderabad grows into'],
  copy:
    'Visit us at the office in ECIL, or call. The people who answer are the people who build, and they ' +
    'will tell you what we have, what it costs and when it can be yours.',
} as const
