import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

import { dataset, projectId } from '../env'

// `createImageUrlBuilder`'s own default export is documented as deprecated in favour of this
// named export (confirmed against node_modules/@sanity/image-url/lib/index.d.ts) — use it, not
// the default.
const builder = createImageUrlBuilder({ projectId: projectId ?? '', dataset })

// Wraps @sanity/image-url's fluent builder. `source` should be the raw image field value as
// GROQ returns it (an object carrying `asset: { _ref }`, and — when the editor set one in the
// Studio — `hotspot`/`crop`), not a pre-resolved URL string. Every image field in
// sanity/schemas/project.ts sets `options: { hotspot: true }` for exactly this reason: a caller
// that needs a specific aspect ratio chains `.width(w).height(h).fit('crop')`, and the crop is
// then centred on that hotspot automatically. lib/data/sanity.ts's mapImg() calls this with no
// forced dimensions, since it has no per-call-site aspect ratio to crop to — components decide
// that — but still benefits from `auto('format')` below turning on modern-format negotiation.
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format')
}
