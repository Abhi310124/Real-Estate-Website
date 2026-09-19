import type { RingItem } from '@/components/motion/ImageRing3D'
import { RING_IMAGES } from '@/lib/content/home'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * The eight tiles for an `<ImageRing3D>`, built once and used by both of this route's rings.
 *
 * The frames come from `lib/content/home.ts` rather than from a second list of eight: the reference
 * mounts the SAME ring on /studio that it mounts on its home page, twice on this route, and it is one
 * composition — eight photographs chosen to read as a receding constellation at 13.2vw, not an index
 * of the work. Duplicating the list would let the two pages drift apart for no reason, and duplicating
 * the six lines of derivation below in two components would be worse.
 *
 * The destinations are real: each tile links to a published project, cycling if there are fewer than
 * eight, and falls back to the listing when there are none at all. So the photography is authored and
 * the link is a fact, which is the only combination that does not mislabel a frame.
 */
export function ringItems(projects: ProjectSummary[]): RingItem[] {
  return RING_IMAGES.map((img, i) => {
    const project = projects[i % Math.max(projects.length, 1)]
    return {
      src: img.src,
      alt: img.alt,
      href: project ? `/projects/${project.slug}` : '/projects',
      label: project ? `View ${project.title}` : 'View projects',
    }
  })
}
