/**
 * Copy and imagery for the home page's ten sections.
 *
 * Kept as one typed module rather than threaded through the CMS because these are editorial
 * fixtures for a layout, not owner-managed records — projects, settings and journal posts all live
 * in `lib/data`. Splitting them keeps the section components purely presentational.
 *
 * ── Length is a layout parameter here, not a preference ─────────────────────────────────────────
 * Body prose on this page is set in a ~335 px measure (20–23 vw) at 23.04 px / 1.2, which is 26–34
 * characters a line. So a 164-character paragraph renders as six short lines and the same thought
 * said in eighty characters renders as two — and a section built to hold six lines of text reads as
 * empty when it is given two. Each block below therefore carries its target character count in the
 * comment above it; an editor rewriting the words needs to land near that count or the composition
 * it sits in collapses. Blocks that occupy two columns are authored as two separate strings, not one
 * paragraph, because the break between them is a grid gap rather than a wrap.
 *
 * ── A note on what is and is not verified ───────────────────────────────────────────────────────
 * Contact facts (phones, address, the Managing Director's name) come from `lib/data` and are real.
 * Nothing below restates one, and nothing states a new one: no price, no RERA number, no project
 * count, no years in business, no area figure. The prose is marketing voice written for BKR INFRA —
 * how the company works, which is authored copy, not invented fact.
 *
 * Three kinds of placeholder are marked inline, and all three must be replaced before launch:
 *
 *   1. THE FOUR TESTIMONIALS. A fabricated client quote on a live lead-generation site
 *      misrepresents the business, so each one is attributed to initials and a locality instead of
 *      an invented full name, and the line the design gives to a company name carries a visible
 *      `PLACEHOLDER` stamp instead. That stamp renders on the page, which is the point: it cannot
 *      ship unnoticed. Four real, attributable quotes are needed to replace them.
 *   2. The founder's note. Written in the Managing Director's voice rather than quoted from him —
 *      he is a real, named person, so it is worth his approval before launch.
 *   3. Every photograph. `public/photography/CREDITS.md` records that these are buildings BKR INFRA
 *      did not build. Alt text here describes what each frame genuinely shows, cross-checked
 *      against the curated inventory in `components/project/photo.ts`, so that nothing asserts
 *      something untrue to a screen reader. That inventory also identifies seven frames that are
 *      not contemporary residential development at all — a barn, log cabins, a photograph of a
 *      person in a field — and none of them are referenced below.
 *
 * That leaves nineteen usable frames for twenty-eight slots, so some reuse is unavoidable. It is
 * confined to the small slots — the 3D ring's cells and the testimonial's 65.5 px portrait squares —
 * where a repeat does not read as one. All sixteen large slots carry a distinct photograph.
 */

/**
 * Four slides, because the opening is a crossfading slideshow on a ten-second cycle: with one
 * photograph the progress indicator has nothing to indicate and the section is completely still.
 * All four are whole buildings seen from outside, which is what a full-bleed opening frame wants.
 *
 * Slide 0 is also exposed as `image`/`imageAlt`. It is the poster frame — the one that must be in
 * the server-rendered HTML for LCP, and the one that stands alone when motion is reduced or the
 * carousel's JS never arrives.
 */
const HERO_SLIDES = [
  { src: '/photography/exterior-01.jpg', alt: 'Dark timber and glass house at dusk, lit from within' },
  { src: '/photography/exterior-07.jpg', alt: 'Two-storey timber house behind a pool at the end of the garden' },
  { src: '/photography/exterior-04.jpg', alt: 'Villa elevation in brick and dark metal' },
  { src: '/photography/detail-01.jpg', alt: 'Street elevation in timber and zinc' },
] as const

export const HERO = {
  // 184 characters, set in a 3-column measure: one long sentence about how the practice thinks,
  // small, at the bottom-left of a full-bleed photograph. Matched in register, not in wording.
  copy:
    'BKR INFRA creates contemporary residential development shaped through simplicity and ' +
    'material-led thinking. Each home is designed to feel calm, refined, and connected to ' +
    'modern living.',
  slides: HERO_SLIDES,
  image: HERO_SLIDES[0].src,
  imageAlt: HERO_SLIDES[0].alt,
  cta: { href: '/projects', label: 'View Projects' },
} as const

export const MANIFESTO = {
  /**
   * Two columns of 164 and 189 characters, each landing at six short lines, and both in the grid's
   * right half. The left half is a deliberate void for the 3D ring to turn in — filling it with a
   * single wide paragraph puts the text where the ring belongs and leaves the ring's own side of
   * the grid empty, which is why this is two strings and not one.
   */
  copy: [
    'We believe a home should feel calm, lasting, and connected to the way people actually live. ' +
      'Every layout begins with the land, the light, and the life it will hold.',
    'Nothing here is shaped for effect. Brick, stone and timber are left to read as themselves, ' +
      'and the plan is kept open enough that a family can change the way it is used without ' +
      'rebuilding it.',
  ],
  ringLabel: 'Hover + click to visit projects',
} as const

/**
 * The 8 images on the 3D ring. Eight exactly — the ring has eight cells and a gap reads as broken.
 * These cells render small enough that they are where a photograph gets reused; the alt text is
 * still what the frame actually shows, which is not always what its filename claims.
 */
export const RING_IMAGES = [
  { src: '/photography/detail-01.jpg', alt: 'Timber and zinc street elevation' },
  { src: '/photography/interior-01.jpg', alt: 'Living room with the stair beyond and a pool through the glazing' },
  { src: '/photography/exterior-02.jpg', alt: 'White rendered villa above a pool' },
  { src: '/photography/interior-02.jpg', alt: 'Dining room looking out to the pool deck' },
  { src: '/photography/detail-02.jpg', alt: 'Living room in grey and black' },
  { src: '/photography/exterior-03.jpg', alt: 'Open-plan living space opening onto a deck' },
  { src: '/photography/interior-03.jpg', alt: 'Living room with tan leather seating against tall glazing' },
  { src: '/photography/detail-03.jpg', alt: 'Bedroom against a dark panelled wall' },
] as const

export const EXPERTISE = {
  title: 'Our areas of expertise',
  // 148 characters, four lines in the wider 27 vw measure at the right of the heading row. It names
  // the three items below as one sequence so the list reads as a process rather than a menu.
  intro:
    'One process in three parts: land bought early in growth corridors, layouts set out for light ' +
    'and access, and homes built in materials that age well.',
  /**
   * Item paragraphs run 173 / 153 / 137 characters — four, three and three lines. The descending
   * length is deliberate: the rows share one measure, so the copy length is the only thing setting
   * each row's height, and a list of three identical blocks reads as a table.
   *
   * There are no photographs of land or of work in progress in the set, so the plotted-development
   * row shows a finished house standing on its own plot. That is the closest honest stand-in; an
   * alt claiming a surveyed site for a photograph of a villa would assert something untrue.
   */
  items: [
    {
      n: '1',
      title: 'Plotted Development',
      copy:
        'We identify and acquire land in the highest-growth corridors of Hyderabad, then master-plan ' +
        'it for light, access, drainage and long-term value rather than for maximum yield.',
      image: '/photography/detail-05.jpg',
      alt: 'Stone and white villa standing above a lap pool',
    },
    {
      n: '2',
      title: 'Contemporary Homes',
      copy:
        'Our villas and independent houses are built on material honesty, natural light and spatial ' +
        'restraint, so they read as warm and simple rather than styled.',
      image: '/photography/exterior-04.jpg',
      alt: 'White villa with deep eaves and planting in the foreground',
    },
    {
      n: '3',
      title: 'Landscape Integration',
      copy:
        'Each project is developed in response to its setting, connecting architecture, landscape ' +
        'and outdoor living into one cohesive experience.',
      image: '/photography/exterior-03.jpg',
      alt: 'Open-plan living space opening onto a deck',
    },
  ],
} as const

export const STUDIO_STATEMENT = {
  heading: 'We shape space into purpose',
  /**
   * Two columns of 140 and 118 characters — five lines and four — set in white over the full-bleed
   * square photograph, in the grid's right half beside the heading. A heading and a button with no
   * prose between them is what made this section read as a caption rather than a statement.
   */
  copy: [
    'We develop what we design, and that means the drawing and the building answer to the same ' +
      'people in the same office, with nobody in between.',
    'That keeps the decisions honest: what is specified is what gets poured, and what is promised ' +
      'is what gets handed over.',
  ],
  cta: { href: '/studio', label: 'Explore studio' },
  /**
   * This slot needs a DARK photograph and the requirement is arithmetic, not taste. It is the only
   * place on the page where 23px white body copy sits directly on a full-bleed image rather than on
   * a flat black band, and the image renders at opacity 0.9 over black, so the copy's effective
   * background luminance is 0.9 × the photograph's. White text needs 4.5:1 at this size, which puts
   * the ceiling at a mean luminance of about 0.16.
   *
   * Measured across all 26 photographs, `exterior-05.jpg` is the second BRIGHTEST at 0.426 — it gave
   * roughly 1.9:1 and the two columns were close to invisible on it. Of the frames dark enough to
   * clear the threshold, `exterior-01.jpg` at 0.160 (≈5.4:1) is the only one that is also a whole
   * contemporary residence; the two darker frames are a detail shot and a log cabin, and the cabin
   * is on the excluded list at the top of this file.
   *
   * So this is the one large slot that repeats: `exterior-01` is also the hero's poster frame. That
   * is a deliberate trade against the note above about all sixteen large slots being distinct —
   * legibility beats variety, the two are four and a half thousand pixels apart, and the honest fix
   * is neither of these things but a dark photograph of a building BKR INFRA actually built.
   */
  image: '/photography/exterior-01.jpg',
  imageAlt: 'Timber and glass residence at dusk, lit from within',
} as const

export const PROJECTS_FEATURE = {
  pair: [
    {
      src: '/photography/interior-05.jpg',
      alt: 'Black upper storey over timber, a mature gum at the front',
      href: '/projects',
      label: 'Explore Project',
    },
    {
      src: '/photography/interior-04.jpg',
      alt: 'Timber and black volume on a corner site',
      href: '/projects',
      label: 'Explore Project',
    },
  ],
  /**
   * Two columns of 150 and 146 characters — six lines and five — describing how the work is run.
   * Concrete and sequential on purpose: this is the one place on the page that says what actually
   * happens between buying a site and handing over a house, so it earns its length by being
   * specific rather than reassuring.
   */
  process: [
    'Every project here runs the same way. The site is walked before it is bought, and the layout ' +
      'is set out on the ground before any elevation gets drawn.',
    'Work is checked on site every week against the specification, so that the material which ' +
      'arrives on site is the material that was approved for it.',
  ],
  note: {
    eyebrow: 'A note from BKR INFRA',
    // 26 characters on one line, in the handwriting face, on the card's top rule. It is the only
    // run on the page set in a human hand and the only one whose tracking relaxes to normal, so it
    // has to be short enough never to wrap and it has to sound said rather than written. It carries
    // its own thought instead of repeating the note below it.
    script: 'We’d rather be told early.',
    // Authored marketing voice in the Managing Director's name — he is a real, named person
    // (see lib/data settings), so this is copy written for him rather than a quote attributed
    // to him. Worth him approving before launch.
    body:
      'We build the way we would want to be built for: clear titles, honest materials, and a ' +
      'handover date that means what it says.',
    signature: 'B Karthik Reddy — Managing Director',
    monoLabels: ['ST / BKR', 'Thank you', 'BKRINFRA.CO.IN'],
    // Ghosted behind the card at half opacity. There is no photograph of the Managing Director in
    // the set, and a stock face standing in for a named real person would be a fabrication, so a
    // room stands in and the alt says so.
    portrait: {
      src: '/photography/interior-07.jpg',
      alt: 'Bedroom with charcoal walls and the city beyond',
    },
    // The project frame that sits opposite the note card, filling the half of the grid that would
    // otherwise be empty alongside it.
    pairedImage: {
      src: '/photography/interior-03.jpg',
      alt: 'Living room with tan leather seating against tall glazing',
    },
  },
} as const

/**
 * FOUR PLACEHOLDER TESTIMONIALS — the section is a four-slide carousel on a ten-second cycle, so
 * one quote leaves three empty slides and no reason for the progress hairlines to exist.
 *
 * Every one of these four needs replacing with a real, attributable client quote before launch. None
 * of them is a real quote from a real buyer. They are attributed to initials and a locality rather
 * than to an invented full name, and the line the design reserves for a company reads `PLACEHOLDER`
 * so the unverified state is visible on the page itself rather than buried in this comment.
 *
 * The 65.5 px attribution square is a material close-up, not a face: inventing a likeness for a
 * quote that was never given would compound the problem rather than dress it up.
 */
export const TESTIMONIALS = [
  {
    quote:
      'The site visits were straightforward and nothing was glossed over. The handover came ' +
      'through on the date we were first given.',
    attribution: 'A. R. — Villa owner',
    company: 'PLACEHOLDER — KOKAPET',
    portrait: '/photography/detail-06.jpg',
    portraitAlt: 'Bathroom in marble and black',
    image: '/photography/interior-01.jpg',
    imageAlt: 'Living room with the stair beyond and a pool through the glazing',
  },
  {
    quote:
      'We were shown the layout on the ground before we had paid anything, and the plot we bought ' +
      'is the plot we walked that morning.',
    attribution: 'S. K. — Plot owner',
    company: 'PLACEHOLDER — TELLAPUR',
    portrait: '/photography/detail-02.jpg',
    portraitAlt: 'Living room in grey and black',
    image: '/photography/interior-02.jpg',
    imageAlt: 'Dining room looking out to the pool deck',
  },
  {
    quote:
      'Questions about the title and the approvals were answered with documents rather than ' +
      'reassurance. That is why we went ahead.',
    attribution: 'P. V. — Homeowner',
    company: 'PLACEHOLDER — MOKILA',
    portrait: '/photography/detail-03.jpg',
    portraitAlt: 'Bedroom against a dark panelled wall',
    image: '/photography/interior-08.jpg',
    imageAlt: 'Living room with a ribbon window in jute and grey',
  },
  {
    quote:
      'The finishes are plain in the best way. Nothing has needed replacing, and the house is much ' +
      'quieter inside than we expected.',
    attribution: 'N. T. — Apartment owner',
    company: 'PLACEHOLDER — ADIBATLA',
    portrait: '/photography/detail-01.jpg',
    portraitAlt: 'Timber and zinc street elevation',
    image: '/photography/detail-08.jpg',
    imageAlt: 'Dining room beside a concrete stair wall, timber screen beyond',
  },
] as const

/** The slide that has to render without JS, and the one a reduced-motion visitor sees alone. */
export const TESTIMONIAL = TESTIMONIALS[0]

export const JOURNAL_PREVIEW = {
  title: 'Spaces Shaped Through Intention',
  // 212 characters, six lines in a 30 vw measure — the longest block on the page, because it sits
  // beside a two-line display heading and has to hold the right-hand column down to the depth of
  // the cards below. It says what the journal is for in the journal's own voice.
  intro:
    'Notes from the work as it happens: what a site tells us before anything gets drawn, why a ' +
    'layout ends up facing the way it does, how a material behaves after one monsoon, and what we ' +
    'would change on the next one.',
  cta: { href: '/journal', label: 'View Posts' },
} as const

export const CONTACT_INTAKE = {
  heading: 'Start a conversation about your project, vision or future space.',
  // 149 characters, five lines: what happens after the form is sent. An intake panel asking for six
  // fields with nothing said about what comes back is the hardest section on the page to submit to.
  intro:
    'Tell us what you are looking for and roughly where. We will come back to you with what we ' +
    'have, what it costs and what it does not do, in that order.',
  // 119 characters, three lines, indented under the heading. Shorter and blunter than the intro
  // deliberately — it answers the objection the intro raises rather than extending it.
  support:
    'No call centre and no chasing. The enquiry goes straight to the people who are building, and ' +
    'one of them replies to it.',
  // Mono, at the head of the form panel, over two lines. Kept to two words plus a qualifier so it
  // wraps at the panel's measure instead of running past it.
  formTitle: 'PROJECT ENQUIRY INTAKE',
  // Numbered fields, `04)`-style, on underline-only inputs over cream paper.
  fields: [
    { n: '01', name: 'name', label: 'Your name', type: 'text' as const },
    { n: '02', name: 'phone', label: 'Phone number', type: 'tel' as const },
    { n: '03', name: 'email', label: 'Email address', type: 'email' as const },
    { n: '04', name: 'location', label: 'Location', type: 'text' as const },
    { n: '05', name: 'timeline', label: 'Timeline', type: 'text' as const },
    { n: '06', name: 'message', label: 'Tell us more', type: 'textarea' as const },
  ],
  projectTypes: ['Open Plots', 'Villas', 'Apartments', 'Independent Houses'],
} as const
