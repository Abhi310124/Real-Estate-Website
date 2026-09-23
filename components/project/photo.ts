import type { Img } from '@/lib/data/types'

/**
 * Resolves a fixture's `/placeholder/...` image path onto one of the real architectural photographs
 * in `public/photography/`.
 *
 * Why this exists rather than editing the fixtures: `lib/data/mock.ts` is the data layer and is out
 * of scope for a restyle, and it is also read verbatim by two other things — the placeholder
 * generator script and `tests/e2e/full-journey.spec.ts`'s "every asset referenced by the fixtures is
 * actually served" check, which greps the file for `/placeholder/` paths. Rewriting the paths at
 * render time leaves both intact.
 *
 * Why it has to happen at all: the generated placeholders are abstract navy-and-orange dusk skylines
 * with a caption baked into the pixels. On a page whose entire palette is black, white and three
 * greys, they are the loudest thing on screen and the only source of hue left anywhere on the site.
 *
 * **Plan drawings are deliberately exempt.** The floor plans and the master plan are line drawings —
 * navy on cream with a single orange rule — and they are the one kind of placeholder that is
 * genuinely the right *kind* of asset for its slot. Substituting a photograph of somebody's kitchen
 * for an image whose alt text reads "Floor plan of the 4 BHK Type A villa" would make the page assert
 * something untrue to a screen reader, which is worse than a tinted drawing. They stay, and the
 * components that render them apply `grayscale` so they read as monochrome draughting.
 *
 * The mapping is a pure function of the path, so it is identical on the server and the client (no
 * hydration mismatch) and stable between builds (no gratuitous image churn in a diff).
 */

/*
 * ── The curated set, and why it is not generated from the filenames ───────────────────────────────
 *
 * The obvious implementation is `exterior-01..08` / `interior-01..10` / `detail-01..08` built with a
 * loop, reading the roles out of `public/photography/CREDITS.md`. That was the first version here and
 * it was wrong twice over, in ways only looking at all 26 frames reveals:
 *
 * 1. **The role labels do not match the frames.** `exterior-03` is a living room. `interior-04`,
 *    `interior-05` and `interior-10` are all whole-building exteriors. `detail-01` and `detail-05`
 *    are exteriors too, and `detail-02`, `detail-06` and `detail-08` are full rooms rather than
 *    close-ups. Trusting the filenames put interiors in a hero slot and exteriors in a gallery's
 *    "inside" position.
 *
 * 2. **Seven frames are not contemporary residential development at all**, and the generated mapping
 *    was putting them on the page:
 *      exterior-06  a red corrugated barn on an Icelandic hillside
 *      exterior-08  a New England shingle cottage in autumn colour
 *      interior-06  a farmhouse-boho living room with a longhorn skull on the wall
 *      interior-09  a boho bedroom with orange cushions and a dozen houseplants
 *      interior-10  a Florida craftsman bungalow
 *      detail-04    log cabins in a forest at sunrise
 *      detail-07    a photograph of a person in a wheat field — no building in the frame at all
 *    The last one is the one that matters most: it was rendering as a construction-update thumbnail,
 *    labelled "Clubhouse roofing and paved internal roads at BKR Lakeview Enclave". The red barn was
 *    landing in this page's `#overview`, where it was also the only saturated hue left in the design.
 *
 * So the pools below are grouped by what each frame actually shows and the seven off-register ones
 * are left out. This is placeholder curation, not a permanent asset list — `CREDITS.md` already
 * states that every one of these is a building BKR INFRA did not build, replaced with genuine
 * photography before launch. When that swap happens this file's pools are what needs updating, and
 * the comment above each group says what a replacement has to be a picture of.
 */

/** Whole buildings, seen from outside. What a hero and a site-progress thumbnail want. */
const BUILDING = [
  '/photography/exterior-01.jpg', // dark timber and glass, lit from within, dusk
  '/photography/exterior-02.jpg', // white rendered villa above a pool
  '/photography/exterior-04.jpg', // white villa, deep eaves, planting in the foreground
  '/photography/exterior-05.jpg', // white cubic massing in raking sun — the most monochrome frame
  '/photography/exterior-07.jpg', // two-storey timber house behind a pool
  '/photography/interior-04.jpg', // timber and black box on a corner site (mislabelled)
  '/photography/interior-05.jpg', // black upper storey over timber, mature gum (mislabelled)
  '/photography/detail-01.jpg', //   render, timber and zinc street elevation (mislabelled)
  '/photography/detail-05.jpg', //   stone and white villa above a lap pool (mislabelled)
]

/** Rooms. What the inside half of a gallery wants. */
const INSIDE = [
  '/photography/exterior-03.jpg', // open-plan living to a deck (mislabelled)
  '/photography/interior-01.jpg', // living room, stair beyond, pool through the glazing
  '/photography/interior-02.jpg', // dining room looking out to the pool deck
  '/photography/interior-03.jpg', // living room, tan leather, tall glazing
  '/photography/interior-07.jpg', // bedroom, charcoal walls, city beyond
  '/photography/interior-08.jpg', // living room, ribbon window, jute and grey
  '/photography/detail-02.jpg', //   grey and black living room (mislabelled)
  '/photography/detail-03.jpg', //   bedroom against a dark panelled wall (mislabelled)
  '/photography/detail-06.jpg', //   marble and black bathroom — the one true close-up
  '/photography/detail-08.jpg', //   dining room, concrete stair wall, timber screen (mislabelled)
]

/**
 * Alternating rather than concatenated, which matters because a caller walking a list takes
 * consecutive indices. Concatenating the two groups meant a four-image gallery seeded anywhere inside
 * the second half came out as four interiors in a row; interleaving makes it read outside, inside,
 * outside, inside — which is what a project gallery actually looks like.
 */
function interleave(a: string[], b: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i] !== undefined) out.push(a[i])
    if (b[i] !== undefined) out.push(b[i])
  }
  return out
}

// Pools are chosen by what the slot is *for*. A hero wants a whole building. A gallery wants a mix of
// outside and inside. A construction update wants the building itself — there are no genuine
// site-progress photographs in the set, and an interior is the wrong answer for "foundation poured",
// so exteriors are the closest honest stand-in.
const HERO_POOL = BUILDING
const GALLERY_POOL = interleave(BUILDING, INSIDE)
const SITE_POOL = BUILDING
const ANY_POOL = interleave(BUILDING, INSIDE)

/** FNV-1a. Small, dependency-free, and deterministic across runtimes. */
function hash(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function poolFor(url: string): string[] {
  if (url.includes('hero')) return HERO_POOL
  if (url.includes('gallery')) return GALLERY_POOL
  if (url.includes('update')) return SITE_POOL
  return ANY_POOL
}

/** True for the fixtures' floor-plan and master-plan artwork — a drawing, not a photograph. */
export function isPlanDrawing(url: string): boolean {
  return /floorplan|masterplan/.test(url)
}

function needsPhoto(url: string): boolean {
  return url.startsWith('/placeholder/') && !isPlanDrawing(url)
}

/**
 * The fixture projects' heroes, assigned by hand rather than by hash.
 *
 * A project's hero is the one photograph that has to be the same everywhere the project appears —
 * its card on the home page, its card on /projects, the top of its own page — and it is also the one
 * that sits beside its siblings in a grid. Hashing five paths into a pool of nine collided twice
 * (Skyline and Landmark both drew the same villa), so two cards in the home page's 2×2 showed the
 * same building under two names. Each is matched to what the project is: water behind the villas at
 * the lake, the flattest cubic block for the apartments, planting for the plots, a single house for
 * the independent homes, a street elevation for the township.
 */
const HERO_BY_PATH: Record<string, string> = {
  '/placeholder/projects/bkr-lakeview-enclave/hero.jpg': '/photography/exterior-07.jpg',
  '/placeholder/projects/bkr-skyline-residences/hero.jpg': '/photography/exterior-05.jpg',
  '/placeholder/projects/bkr-green-meadows/hero.jpg': '/photography/exterior-04.jpg',
  '/placeholder/projects/bkr-sunrise-homes/hero.jpg': '/photography/detail-05.jpg',
  '/placeholder/projects/bkr-landmark-township/hero.jpg': '/photography/detail-01.jpg',
}

/**
 * One image. `offset` shifts the choice within the pool, so a caller rendering several images can
 * guarantee they differ from each other.
 */
export function resolvePhoto(image: Img, offset = 0): Img {
  if (!needsPhoto(image.url)) return image
  const fixed = offset === 0 ? HERO_BY_PATH[image.url] : undefined
  if (fixed) return { ...image, url: fixed }
  const pool = poolFor(image.url)
  return { ...image, url: pool[(hash(image.url) + offset) % pool.length] }
}

/**
 * A list of images, guaranteed distinct within the list: every entry is indexed from one seed derived
 * from the list's first path, plus its own position. `offset` distinguishes sibling lists (the
 * construction timeline calls this once per update and passes a running count).
 *
 * `alt` is always carried through untouched. It is the project's own authored copy, and it is what the
 * a11y suite checks for; the photograph is the stand-in, not the description.
 */
export function resolvePhotos(images: Img[], offset = 0): Img[] {
  if (images.length === 0) return images
  const seed = hash(images[0].url) + offset
  return images.map((image, i) => {
    if (!needsPhoto(image.url)) return image
    const pool = poolFor(image.url)
    return { ...image, url: pool[(seed + i) % pool.length] }
  })
}
