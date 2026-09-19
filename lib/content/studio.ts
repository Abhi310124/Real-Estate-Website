/**
 * Copy and imagery for `/studio`'s eight authored chapters.
 *
 * Sibling of `lib/content/home.ts` and written under the same two constraints, both of which are
 * worth restating because they are the two things an editor will break first.
 *
 * ── Length is a layout parameter, not a preference ───────────────────────────────────────────────
 * Every prose block on this route is set at the 23.04px/1.2 body step in a 23.3vw column (335px at
 * the 1440 the reference was measured at), which is 28–30 characters a line. So a 118-character
 * paragraph renders as four short lines and the same thought said in sixty renders as two — and the
 * chapters below are built to hold a specific number of lines. The Core Principles rows are the
 * clearest case: their measured heights are 411.7 / 384 / 384 / 411.7px, and the ONLY thing that
 * differs between a 411.7 row and a 384 row is that the first has four lines of copy and the second
 * has three. Each block therefore carries its target character count, and an editor who lands a long
 * way from it changes the composition rather than the words.
 *
 * ── What is and is not a verified fact ───────────────────────────────────────────────────────────
 * Nothing below states a price, a RERA number, a project count, a headcount, a tenure, an area or a
 * completion date. The four areas of work are the four residential lines the business already publishes
 * (the same four the enquiry form offers); everything else is marketing voice about how the practice
 * works, which is authored copy.
 *
 * **There is no team roster here, and that is deliberate.** The reference's /studio names six real
 * people at a UK architecture practice. BKR INFRA's only named person anywhere in this repository is
 * B Karthik Reddy, Managing Director, and he is real — so the chapter that sits in the reference's
 * "Team" position is his note and nothing else. Six invented Indian names in his place would be a
 * misrepresentation of a real business to people deciding whether to buy a house from it, not
 * placeholder copy. If the practice wants that chapter, it needs six real people first.
 *
 * ── Photography ─────────────────────────────────────────────────────────────────────────────────
 * Every path below exists in `public/photography/` and every one is drawn from the curated inventory
 * in `components/project/photo.ts` — the seven frames that file identifies as not being contemporary
 * residential development at all (a barn, a shingle cottage, log cabins, a person in a field) are
 * not referenced anywhere here. `CREDITS.md` records that all of them are buildings BKR INFRA did
 * not build, so each `alt` describes what the frame genuinely shows rather than what the chapter
 * above it claims. That distinction matters most in `AREAS_OF_WORK`: there are no photographs of
 * surveyed land or of an apartment building in the set, so the label names the area of work and the
 * alt names the photograph, and neither pretends to be the other.
 *
 * Nineteen usable frames cover twenty-three slots on this route. The one repeat is in the eight-tile
 * Areas of Work mosaic, where the tiles are small enough that it does not read as one.
 */

export const STUDIO_HERO = {
  eyebrow: 'Studio — Hyderabad',
  /** Two lines at the 100.8px display step across seven columns. */
  title: 'Land bought early. Homes drawn carefully. Keys handed over on time.',
  /**
   * 177 characters, six lines in a 23.3vw column. It is the only prose on the black opening and it
   * has the whole 170svh band to itself, so it is the longest block on the route by design.
   */
  copy:
    'Everything on this page happens inside one office. The land is chosen here, the layouts are ' +
    'drawn here, and the site is run by the people who signed for the ground it stands on.',
} as const

export const STUDIO_INTRO = {
  eyebrow: 'How we think',
  heading: 'A home is only as good as the ground it stands on.',
  /**
   * Two columns of 118 and 126 characters, four lines each, in the grid's right half. Authored as
   * two strings rather than one paragraph because the break between them is a grid gap, not a wrap:
   * one 244-character block in a single column is eight lines and reads as a wall.
   */
  copy: [
    'Before an elevation is drawn we walk the site — for access, for water, and for where the light ' +
      'falls in the afternoon.',
    'The land we buy sits ahead of the demand that will reach it, which is why our layouts read as ' +
      'considered rather than squeezed.',
  ],
  /**
   * Five frames. The first is the chapter's plate and carries six columns on its own; the other four
   * are the two rows beneath it. Deliberately a mix of outside and inside — a chapter about walking
   * a site that shows five elevations says nothing about what the walking is for.
   */
  images: [
    {
      src: '/photography/exterior-07.jpg',
      alt: 'Two-storey timber house behind a pool at the end of the garden',
    },
    { src: '/photography/detail-05.jpg', alt: 'Stone and white villa standing above a lap pool' },
    {
      src: '/photography/interior-01.jpg',
      alt: 'Living room with the stair beyond and a pool through the glazing',
    },
    { src: '/photography/interior-08.jpg', alt: 'Living room with a ribbon window in jute and grey' },
    { src: '/photography/exterior-05.jpg', alt: 'White cubic massing in raking afternoon sun' },
  ],
} as const

export const CORE_PRINCIPLES = {
  eyebrow: 'Core principles',
  heading: 'Four things we will not trade away',
  /**
   * Copy runs 122 / 89 / 96 / 126 characters — four, three, three and four lines. That sequence is
   * the chapter's geometry: the rows measure 411.7 / 384 / 384 / 411.7px and the 27.7px difference
   * between a long row and a short one is exactly one line of body copy. Level the four blocks to
   * the same length and the chapter becomes a table.
   */
  items: [
    {
      n: '1',
      title: 'Clarity',
      copy:
        'A plan should be understood from the doorway: where the light comes from, where the noise ' +
        'goes, and what each room is for.',
    },
    {
      n: '2',
      title: 'Material Honesty',
      copy: 'Brick, stone and timber read as themselves here. Nothing is dressed up as something else.',
    },
    {
      n: '3',
      title: 'Connection to Place',
      copy: 'Each layout answers its own site — the slope, the trees already standing, and the road it meets.',
    },
    {
      n: '4',
      title: 'Long-Term Living',
      copy:
        'A house has to survive a family changing shape, so the plan stays open, the services stay ' +
        'reachable, and nothing is sealed in.',
    },
  ],
} as const

export const STUDIO_SHOWCASE = {
  eyebrow: 'Explore',
  heading: 'See it standing up',
  /** 122 characters, four lines at the right of the heading row. */
  intro:
    'Two of ours, finished and occupied. The best argument we have is a house you can walk through ' +
    'and a neighbour you can ask.',
  /**
   * The two plates come from real published projects — `getFeaturedProjects()` — so their titles,
   * locations and links are CMS facts rather than copy. This third frame is the one authored image
   * in the chapter, closing the row under them.
   */
  closingImage: {
    src: '/photography/interior-03.jpg',
    alt: 'Living room with tan leather seating against tall glazing',
  },
} as const

export const STUDIO_PROCESS = {
  eyebrow: 'Our process',
  heading: 'Five stages, in this order, every time',
  /** 142 characters, five lines. */
  intro:
    'None of these is a stage invented to fill a page. Each one is a decision that costs real money ' +
    'to get wrong, which is why it has its own step.',
  /**
   * Five steps, copy at 94 / 90 / 89 / 93 / 88 characters — three lines each in the 23.3vw step
   * measure. Five is what fills the pinned column's 4,500px of scroll: at four the pin outlasts its
   * own content and the reader watches a still frame, at six the steps arrive faster than the pin
   * releases.
   */
  steps: [
    {
      n: '01',
      title: 'Walk the land',
      copy: 'Before anything is signed we walk it in the afternoon, when the heat and the light are honest.',
    },
    {
      n: '02',
      title: 'Clear the title',
      copy: 'Documents before drawings. If the paperwork will not hold, no amount of design rescues it.',
    },
    {
      n: '03',
      title: 'Set out on the ground',
      copy: 'The layout is pegged out on the site and walked through before a single elevation is drawn.',
    },
    {
      n: '04',
      title: 'Build to the specification',
      copy: 'Checked weekly against what was approved, so the material that arrives is the material named.',
    },
    {
      n: '05',
      title: 'Hand over, then answer',
      copy: 'Keys on the date first given, and the same phone number afterwards as the one before it.',
    },
  ],
  /**
   * What stays fixed while the five steps travel past it. A caption and one plate, because the point
   * of a pin is that the reader can keep looking at one thing — put a second idea in the column and
   * the pin is holding a list still instead of holding an image still.
   */
  pinned: {
    caption: 'The site is the first drawing',
    /** 97 characters, three lines under the plate. */
    copy: 'Every stage on the left answers something the ground said first. This is the order it says it in.',
    image: {
      src: '/photography/exterior-04.jpg',
      alt: 'White villa with deep eaves and planting in the foreground',
    },
  },
} as const

/**
 * The chapter in the reference's "Team" position. One real, named person — see the note at the top
 * of this file about why there is no roster.
 *
 * The note is written FOR the Managing Director rather than quoted from him, exactly as the home
 * page's own note is, and it is worth his approval before launch. The two facts it leans on are the
 * company name and the office address, both verified and both already published in the footer.
 */
export const DIRECTOR_NOTE = {
  eyebrow: 'A note from the Managing Director',
  /**
   * Two columns of 141 and 106 characters — five lines and four — at the body step, NOT at `lead`.
   * The step is forced by the reveal: `SplitLines` masks exactly the line box, so on any
   * line-height-1.0 token it clips ascenders and descenders permanently, and `lead` is one of those.
   * A note that is the only unanimated block on a route carried by masked line reveals reads as an
   * oversight, so the note moved to the step the effect can run on rather than the effect being
   * dropped. Set as two strings for the same reason as the intro: the break is a grid gap.
   */
  copy: [
    'Every project carries our name on it and our own office address behind it. If something is not ' +
      'right, you know exactly which door to knock on.',
    'We would far rather hear it from you while we can still fix it than hear about it later from ' +
      'somebody else.',
  ],
  name: 'B Karthik Reddy',
  role: 'Managing Director, BKR INFRA',
  /**
   * Two frames rather than a portrait. There is no photograph of the Managing Director in the set,
   * and a stock face standing in for a named real person is a fabrication — so the two cells beside
   * the note hold the work instead, and the alt text says what they actually are.
   */
  images: [
    { src: '/photography/interior-07.jpg', alt: 'Bedroom with charcoal walls and the city beyond' },
    { src: '/photography/detail-03.jpg', alt: 'Bedroom against a dark panelled wall' },
  ],
} as const

export const AREAS_OF_WORK = {
  eyebrow: 'Areas of work',
  heading: 'What we actually build',
  /** 124 characters, four lines. */
  intro:
    'Four lines of work, and no fifth one we are quietly trying out on you. Each of them is run by ' +
    'the same office as the others.',
  /**
   * The four residential lines the business already publishes — exactly the four the enquiry form
   * offers (`CONTACT_INTAKE.projectTypes`), and four of the five `SiteSettings.categories` entries;
   * "Developers" is the fifth and is a counterparty rather than something a visitor buys, so it is not
   * one of these. Copy at 83 / 83 / 81 / 82 characters, three lines under a label in a 23.3vw column.
   *
   * Two frames each, and the label is NOT a caption on them: there is no photograph of surveyed land
   * or of an apartment block in the inventory, so the tiles show finished residential work and each
   * alt describes the frame rather than the category above it. Substituting a picture of a villa for
   * a picture of a plot and then describing it as a plot would assert something untrue to a screen
   * reader, which is worse than a photograph that is merely adjacent to its heading.
   */
  areas: [
    {
      n: '01',
      label: 'Open Plots',
      copy: 'Surveyed, titled and set out, with the roads and the drains in before a plot sells.',
      images: [
        { src: '/photography/detail-01.jpg', alt: 'Timber and zinc street elevation' },
        { src: '/photography/exterior-01.jpg', alt: 'Dark timber and glass house at dusk, lit from within' },
      ],
    },
    {
      n: '02',
      label: 'Villas',
      copy: 'Independent houses standing on their own plots, inside a gated layout we also built.',
      images: [
        { src: '/photography/interior-05.jpg', alt: 'Black upper storey over timber, a mature gum at the front' },
        { src: '/photography/interior-04.jpg', alt: 'Timber and black volume on a corner site' },
      ],
    },
    {
      n: '03',
      label: 'Apartments',
      copy: 'Fewer and larger homes per floor, so the plan is not a corridor with doors on it.',
      images: [
        { src: '/photography/interior-02.jpg', alt: 'Dining room looking out to the pool deck' },
        { src: '/photography/detail-02.jpg', alt: 'Living room in grey and black' },
      ],
    },
    {
      n: '04',
      label: 'Independent Houses',
      copy: 'One house, one client, one site, and a plan drawn from the ground it will stand on.',
      images: [
        { src: '/photography/exterior-03.jpg', alt: 'Open-plan living space opening onto a deck' },
        // The one repeat on the route. Small tile, four thousand pixels from its other use.
        { src: '/photography/exterior-07.jpg', alt: 'Two-storey timber house behind a pool' },
      ],
    },
  ],
} as const
