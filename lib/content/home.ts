/**
 * Copy and imagery for the home page's ten sections.
 *
 * Kept as one typed module rather than threaded through the CMS because these are editorial
 * fixtures for a layout, not owner-managed records — projects, settings and journal posts all live
 * in `lib/data`. Splitting them keeps the section components purely presentational.
 *
 * ── A note on what is and is not verified ──────────────────────────────────────────────────────
 * Contact facts (phones, address, the Managing Director's name) come from `lib/data` and are real.
 * The prose below is marketing voice, written for BKR INFRA — that is authored copy, not invented
 * fact. But two items ARE placeholders standing in for things only the client can supply, and are
 * marked inline: the testimonial, and the founder's note signature block. A fabricated client
 * quote on a live lead-generation site is a misrepresentation, so the testimonial is attributed to
 * initials and flagged for replacement rather than given a plausible full name.
 */

export const HERO = {
  // Storey's hero copy is one long sentence about how the practice thinks, set small at the
  // bottom-left against a full-bleed photograph. Matched in register, not in wording.
  copy:
    'BKR INFRA creates contemporary residential development shaped through simplicity and ' +
    'material-led thinking. Each home is designed to feel calm, refined, and connected to ' +
    'modern living.',
  image: '/photography/exterior-01.jpg',
  imageAlt: 'Contemporary two-storey residence at dusk, timber and glass, lit from within',
  cta: { href: '/projects', label: 'View Projects' },
} as const

export const MANIFESTO = {
  copy:
    'We believe a home should feel calm, lasting, and deeply connected to the way people ' +
    'actually live. Every plot we develop begins with the land, the light, and the life it will hold.',
  ringLabel: 'Hover + click to visit projects',
} as const

/** The 8 images on the 3D ring. Eight exactly — the ring has eight cells and a gap reads as broken. */
export const RING_IMAGES = [
  { src: '/photography/detail-01.jpg', alt: 'Cantilevered upper storey in dark timber cladding' },
  { src: '/photography/interior-01.jpg', alt: 'Open-plan living space with full-height glazing' },
  { src: '/photography/exterior-02.jpg', alt: 'Low-slung residence behind a mature garden' },
  { src: '/photography/interior-02.jpg', alt: 'Kitchen island in stone with timber joinery' },
  { src: '/photography/detail-02.jpg', alt: 'Brick and timber junction detail in raking light' },
  { src: '/photography/exterior-03.jpg', alt: 'Courtyard elevation with deep reveals' },
  { src: '/photography/interior-03.jpg', alt: 'Stair volume lit from a roof light above' },
  { src: '/photography/detail-03.jpg', alt: 'Vertical timber screen filtering afternoon sun' },
] as const

export const EXPERTISE = {
  title: 'Our areas of expertise',
  items: [
    {
      n: '1',
      title: 'Plotted Development',
      copy:
        'We identify and acquire land in the highest-growth corridors of Hyderabad, then master-plan ' +
        'it for light, access and long-term value rather than for maximum yield.',
      image: '/photography/detail-04.jpg',
      alt: 'Surveyed plotted development with new access roads',
    },
    {
      n: '2',
      title: 'Contemporary Homes',
      copy:
        'Our villas and independent houses focus on material honesty, natural light and spatial ' +
        'restraint, balancing warmth and simplicity to create considered living environments.',
      image: '/photography/exterior-04.jpg',
      alt: 'Contemporary villa elevation in brick and dark metal',
    },
    {
      n: '3',
      title: 'Landscape Integration',
      copy:
        'Each project is developed in response to its setting, connecting architecture, landscape ' +
        'and outdoor living into one cohesive experience.',
      image: '/photography/detail-05.jpg',
      alt: 'Planted courtyard between two building volumes',
    },
  ],
} as const

export const STUDIO_STATEMENT = {
  heading: 'We shape space into purpose',
  cta: { href: '/studio', label: 'Explore studio' },
  image: '/photography/exterior-05.jpg',
  imageAlt: 'Residence at blue hour with warm interior light across the glazing',
} as const

export const PROJECTS_FEATURE = {
  pair: [
    {
      src: '/photography/exterior-06.jpg',
      alt: 'Detached residence with deep eaves and a stone base',
      href: '/projects',
      label: 'Explore Project',
    },
    {
      src: '/photography/interior-04.jpg',
      alt: 'Double-height living volume with a suspended stair',
      href: '/projects',
      label: 'Explore Project',
    },
  ],
  note: {
    eyebrow: 'A note from BKR INFRA',
    // Authored marketing voice in the Managing Director's name — he is a real, named person
    // (see lib/data settings), so this is copy written for him rather than a quote attributed
    // to him. Worth him approving before launch.
    body:
      'We build the way we would want to be built for: clear titles, honest materials, and a ' +
      'handover date that means what it says. Calm homes, lasting design.',
    signature: 'B Karthik Reddy — Managing Director',
    monoLabels: ['ST / BKR', 'Thank you', 'BKRINFRA.CO.IN'],
  },
} as const

export const TESTIMONIAL = {
  // PLACEHOLDER. This must be replaced with a real, attributable client quote before launch —
  // a fabricated testimonial on a lead-generation site misrepresents the business. Attributed to
  // initials rather than an invented full name so it cannot be mistaken for a verified reference.
  quote:
    'Every stage was collaborative and thoughtful, resulting in a home that feels effortless to ' +
    'live in and completely our own.',
  attribution: 'Homeowner, Kokapet — placeholder pending a real client quote',
  image: '/photography/interior-05.jpg',
  imageAlt: 'Living room opening onto a terrace through sliding glazing',
} as const

export const JOURNAL_PREVIEW = {
  title: 'Spaces Shaped Through Intention',
  cta: { href: '/journal', label: 'View Posts' },
} as const

export const CONTACT_INTAKE = {
  heading: 'Start a conversation about your project, vision or future space.',
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
