import type { SanityImageSource } from '@sanity/image-url'

import { sanityClient } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import {
  allJournalSlugsQuery,
  allProjectSlugsQuery,
  featuredProjectsQuery,
  projectBySlugQuery,
  journalPostBySlugQuery,
  journalPostsQuery,
  projectsQuery,
  siteSettingsQuery,
} from '@/sanity/lib/queries'

import type {
  DataSource,
  Img,
  JournalPost,
  MasterPlanPlot,
  Project,
  ProjectCategory,
  ProjectStatus,
  ProjectSummary,
  SiteSettings,
} from './types'

// ---------------------------------------------------------------------------------------------
// Raw shapes as GROQ actually returns them (see sanity/lib/queries.ts). These are deliberately
// permissive (every field optional/nullable) because the Studio enforces very little at the data
// layer: a non-technical owner can save a project with most fields blank, and an unset GROQ
// array field projects as `null`, not `[]`. Every map* function below coalesces these into the
// non-optional shapes lib/data/types.ts declares, so a half-filled-in document degrades to empty
// strings/arrays rather than `undefined` leaking into a component that doesn't expect it.
// ---------------------------------------------------------------------------------------------

interface RawImage {
  asset?: { _ref: string; _type: 'reference' }
  hotspot?: { _type?: string; x: number; y: number; height: number; width: number }
  crop?: { _type?: string; top: number; bottom: number; left: number; right: number }
  alt?: string
  caption?: string
  lqip?: string | null
}

interface RawProjectSummary {
  _id: string
  title?: string
  slug?: string | null
  tagline?: string
  category?: ProjectCategory
  status?: ProjectStatus
  isPublished?: boolean
  featured?: boolean
  order?: number
  location?: { area?: string; city?: string; mapEmbedUrl?: string; lat?: number; lng?: number }
  priceFrom?: number | null
  priceUnit?: 'Lakh' | 'Cr'
  priceOnRequest?: boolean
  unitTypes?: string[] | null
  heroImage?: RawImage | null
}

interface RawProject extends RawProjectSummary {
  overview?: string[] | null
  keyStats?: Array<{ label?: string; value?: number; suffix?: string }> | null
  gallery?: RawImage[] | null
  amenities?: Array<{ title?: string; icon?: string; category?: string } | null> | null
  floorPlans?: Array<{
    title?: string
    unitType?: string
    area?: number
    areaUnit?: string
    image?: RawImage | null
  }> | null
  masterPlan?: {
    image?: RawImage | null
    plots?: Array<{ label?: string; size?: string; facing?: string; status?: string; polygon?: string }> | null
  } | null
  specifications?: Array<{ category?: string; items?: string[] | null }> | null
  constructionUpdates?: Array<{
    date?: string
    title?: string
    note?: string
    images?: RawImage[] | null
  }> | null
  connectivity?: Array<{ place?: string; distance?: string }> | null
  brochureUrl?: string | null
  reraNumber?: string
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: RawImage | null } | null
}

interface RawSiteSettings {
  tagline?: string
  phones?: string[] | null
  whatsappNumber?: string
  email?: string | null
  address?: string
  socials?: Array<{ platform?: string; url?: string }> | null
  pillars?: Array<{ title?: string; description?: string }> | null
  categories?: Array<{ label?: string; value?: ProjectCategory }> | null
  stats?: Array<{ label?: string; value?: number; suffix?: string }> | null
  footerBlurb?: string
  reraDisclaimer?: string
  announcementBar?: { enabled?: boolean; text?: string; link?: string } | null
}

// ---------------------------------------------------------------------------------------------
// Mapping: raw GROQ result -> the DataSource contract's types.
// ---------------------------------------------------------------------------------------------

// `raw` already carries everything @sanity/image-url's urlFor() needs — the asset reference plus
// whatever hotspot/crop the editor set in the Studio (every image field in
// sanity/schemas/project.ts turns on `options: { hotspot: true }`) — because sanity/lib/queries.ts
// projects images as `{ ..., "lqip": asset->metadata.lqip }` rather than pre-resolving a URL.
function mapImg(raw: RawImage | null | undefined): Img {
  if (!raw?.asset) return { url: '', alt: raw?.alt ?? '' }
  const img: Img = { url: urlFor(raw as SanityImageSource).url(), alt: raw.alt ?? '' }
  if (raw.lqip) img.lqip = raw.lqip
  if (raw.caption) img.caption = raw.caption
  return img
}

function mapImgs(raws: Array<RawImage | null | undefined> | null | undefined): Img[] {
  return (raws ?? []).map(mapImg)
}

function mapSummary(raw: RawProjectSummary): ProjectSummary {
  return {
    id: raw._id,
    title: raw.title ?? '',
    slug: raw.slug ?? '',
    tagline: raw.tagline ?? '',
    category: (raw.category ?? 'open-plots') as ProjectCategory,
    status: (raw.status ?? 'upcoming') as ProjectStatus,
    isPublished: raw.isPublished ?? false,
    featured: raw.featured ?? false,
    order: raw.order ?? 0,
    location: { area: raw.location?.area ?? '', city: raw.location?.city ?? '' },
    priceFrom: raw.priceFrom ?? null,
    priceUnit: raw.priceUnit ?? 'Lakh',
    priceOnRequest: raw.priceOnRequest ?? false,
    unitTypes: raw.unitTypes ?? [],
    heroImage: mapImg(raw.heroImage),
  }
}

function mapProject(raw: RawProject): Project {
  return {
    ...mapSummary(raw),
    location: {
      area: raw.location?.area ?? '',
      city: raw.location?.city ?? '',
      mapEmbedUrl: raw.location?.mapEmbedUrl ?? undefined,
      lat: raw.location?.lat ?? undefined,
      lng: raw.location?.lng ?? undefined,
    },
    overview: raw.overview ?? [],
    keyStats: (raw.keyStats ?? []).map((s) => ({
      label: s.label ?? '',
      value: s.value ?? 0,
      suffix: s.suffix ?? undefined,
    })),
    gallery: mapImgs(raw.gallery),
    amenities: (raw.amenities ?? [])
      // A dangling reference (the referenced amenity document was deleted) dereferences to
      // `null` in the array slot rather than being omitted — drop those rather than surface a
      // half-empty amenity card.
      .filter((a): a is { title?: string; icon?: string; category?: string } => a != null)
      .map((a) => ({ title: a.title ?? '', icon: a.icon ?? '', category: a.category ?? undefined })),
    floorPlans: (raw.floorPlans ?? []).map((f) => ({
      title: f.title ?? '',
      unitType: f.unitType ?? '',
      area: f.area ?? 0,
      areaUnit: f.areaUnit ?? '',
      image: mapImg(f.image),
    })),
    // Optional in the schema (Rule 6's "leave empty for projects with no plotted layout") — GROQ
    // returns a `masterPlan` object with all-undefined sub-fields rather than omitting the key
    // when nothing was ever entered, so check for a real image before treating it as present.
    masterPlan: raw.masterPlan?.image?.asset
      ? {
          image: mapImg(raw.masterPlan.image),
          plots: (raw.masterPlan.plots ?? []).map((p) => ({
            label: p.label ?? '',
            size: p.size ?? '',
            facing: p.facing ?? undefined,
            status: (p.status ?? 'available') as MasterPlanPlot['status'],
            polygon: p.polygon ?? '',
          })),
        }
      : undefined,
    specifications: (raw.specifications ?? []).map((s) => ({ category: s.category ?? '', items: s.items ?? [] })),
    constructionUpdates: (raw.constructionUpdates ?? []).map((c) => ({
      date: c.date ?? '',
      title: c.title ?? '',
      images: mapImgs(c.images),
      note: c.note ?? undefined,
    })),
    connectivity: (raw.connectivity ?? []).map((c) => ({ place: c.place ?? '', distance: c.distance ?? '' })),
    brochureUrl: raw.brochureUrl ?? undefined,
    reraNumber: raw.reraNumber ?? '',
    seo: raw.seo
      ? {
          metaTitle: raw.seo.metaTitle ?? undefined,
          metaDescription: raw.seo.metaDescription ?? undefined,
          ogImage: raw.seo.ogImage?.asset ? mapImg(raw.seo.ogImage) : undefined,
        }
      : undefined,
  }
}

function mapSettings(raw: RawSiteSettings): SiteSettings {
  return {
    tagline: raw.tagline ?? '',
    phones: raw.phones ?? [],
    whatsappNumber: raw.whatsappNumber ?? '',
    email: raw.email ?? undefined,
    address: raw.address ?? '',
    socials: (raw.socials ?? []).map((s) => ({ platform: s.platform ?? '', url: s.url ?? '' })),
    pillars: (raw.pillars ?? []).map((p) => ({ title: p.title ?? '', description: p.description ?? '' })),
    categories: (raw.categories ?? []).map((c) => ({
      label: c.label ?? '',
      value: (c.value ?? 'open-plots') as ProjectCategory,
    })),
    stats: (raw.stats ?? []).map((s) => ({ label: s.label ?? '', value: s.value ?? 0, suffix: s.suffix ?? undefined })),
    footerBlurb: raw.footerBlurb ?? '',
    reraDisclaimer: raw.reraDisclaimer ?? '',
    announcementBar: {
      enabled: raw.announcementBar?.enabled ?? false,
      text: raw.announcementBar?.text ?? '',
      link: raw.announcementBar?.link ?? undefined,
    },
  }
}

// A Sanity outage (or a not-yet-created dataset) must degrade the page, not crash the site — see
// the try/catch in every sanitySource method below. There is no sensible "empty" SiteSettings
// (unlike the list/array-returning methods, which degrade to `[]`), so this is what
// getSiteSettings() falls back to: every consumer (Header, Footer, About, Contact) already
// renders conditionally around blank strings and empty arrays today, for mock projects that
// leave optional fields unset.
const FALLBACK_SETTINGS: SiteSettings = {
  tagline: '',
  phones: [],
  whatsappNumber: '',
  email: undefined,
  address: '',
  socials: [],
  pillars: [],
  categories: [],
  stats: [],
  footerBlurb: '',
  reraDisclaimer: '',
  announcementBar: { enabled: false, text: '', link: undefined },
}

// ---------------------------------------------------------------------------------------------
// The DataSource implementation. Every method is wrapped in try/catch: a Sanity outage,
// misconfigured dataset, or malformed document must not crash the page that calls it.
// Every fetch is tagged for on-demand revalidation — see app/api/revalidate/route.ts, which
// calls revalidateTag('project', 'max') / revalidateTag('settings', 'max') from Sanity's webhook.
// ---------------------------------------------------------------------------------------------


// Journal post as GROQ returns it. `coverImage` is pre-resolved to a URL string here rather than
// left as a raw asset reference, because a journal cover is displayed at one fixed crop and has no
// hotspot to honour — unlike project imagery, which goes through urlFor() for exactly that reason.
interface RawJournalPost {
  _id?: string
  title?: string
  slug?: string
  excerpt?: string
  publishedAt?: string
  isPublished?: boolean
  body?: unknown
  coverImage?: { url?: string; alt?: string; lqip?: string } | null
}

/**
 * Flattens Sanity's Portable Text `body` into the `string[]` of paragraphs that JournalPost
 * declares, so the mock and Sanity sources return the same shape.
 *
 * Deliberately lossy: it keeps the text of each block and discards marks, links and embedded
 * objects. That is the right trade here because the journal renders as plain paragraphs — carrying
 * full Portable Text through would mean the two sources no longer share a type, which is the one
 * property that makes them interchangeable.
 */
function mapPortableTextToParagraphs(body: unknown): string[] {
  if (!Array.isArray(body)) return typeof body === 'string' ? [body] : []
  return body
    .map((block) => {
      if (typeof block === 'string') return block
      const b = block as { _type?: string; children?: Array<{ text?: string }> }
      if (b._type !== 'block' || !Array.isArray(b.children)) return ''
      return b.children.map((c) => c.text ?? '').join('')
    })
    .map((t) => t.trim())
    .filter(Boolean)
}

function mapJournalPost(raw: RawJournalPost): JournalPost {
  return {
    id: raw._id ?? '',
    title: raw.title ?? '',
    slug: raw.slug ?? '',
    excerpt: raw.excerpt ?? '',
    body: mapPortableTextToParagraphs(raw.body),
    coverImage: {
      url: raw.coverImage?.url ?? '',
      alt: raw.coverImage?.alt ?? '',
      ...(raw.coverImage?.lqip ? { lqip: raw.coverImage.lqip } : {}),
    },
    publishedAt: raw.publishedAt ?? '',
    isPublished: raw.isPublished ?? false,
  }
}

export const sanitySource: DataSource = {
  async getProjects(filter) {
    try {
      const raw = (await sanityClient.fetch(
        projectsQuery,
        { category: filter?.category ?? null, status: filter?.status ?? null },
        { next: { tags: ['project'] } },
      )) as RawProjectSummary[]
      return raw.map(mapSummary)
    } catch (err) {
      console.error('[sanitySource.getProjects] Sanity fetch failed, returning an empty list:', err)
      return []
    }
  },

  async getFeaturedProjects() {
    try {
      const raw = (await sanityClient.fetch(featuredProjectsQuery, {}, {
        next: { tags: ['project'] },
      })) as RawProjectSummary[]
      return raw.map(mapSummary)
    } catch (err) {
      console.error('[sanitySource.getFeaturedProjects] Sanity fetch failed, returning an empty list:', err)
      return []
    }
  },

  async getProject(slug) {
    try {
      const raw = (await sanityClient.fetch(projectBySlugQuery, { slug }, {
        next: { tags: ['project'] },
      })) as RawProject | null
      return raw ? mapProject(raw) : null
    } catch (err) {
      console.error(`[sanitySource.getProject] Sanity fetch failed for slug "${slug}", returning null:`, err)
      return null
    }
  },

  async getAllProjectSlugs() {
    try {
      const raw = (await sanityClient.fetch(allProjectSlugsQuery, {}, {
        next: { tags: ['project'] },
      })) as Array<string | null>
      return raw.filter((s): s is string => Boolean(s))
    } catch (err) {
      console.error('[sanitySource.getAllProjectSlugs] Sanity fetch failed, returning an empty list:', err)
      return []
    }
  },

  async getSiteSettings() {
    try {
      const raw = (await sanityClient.fetch(siteSettingsQuery, {}, {
        next: { tags: ['settings'] },
      })) as RawSiteSettings | null
      return raw ? mapSettings(raw) : FALLBACK_SETTINGS
    } catch (err) {
      console.error('[sanitySource.getSiteSettings] Sanity fetch failed, returning fallback settings:', err)
      return FALLBACK_SETTINGS
    }
  },
  // Journal. Same shape as the project methods: gate on isPublished in the query itself (never in
  // JS after the fetch), tag the fetch so the revalidate webhook can invalidate it, and degrade to
  // an empty result rather than throwing — a Sanity outage should cost the journal listing, not the
  // whole page.
  async getJournalPosts() {
    try {
      const raw = (await sanityClient.fetch(journalPostsQuery, {}, {
        next: { tags: ['journal'] },
      })) as RawJournalPost[] | null
      return (raw ?? []).map(mapJournalPost)
    } catch (err) {
      console.error('[sanitySource.getJournalPosts] Sanity fetch failed, returning []:', err)
      return []
    }
  },

  async getJournalPost(slug) {
    try {
      const raw = (await sanityClient.fetch(journalPostBySlugQuery, { slug }, {
        next: { tags: ['journal'] },
      })) as RawJournalPost | null
      return raw ? mapJournalPost(raw) : null
    } catch (err) {
      console.error('[sanitySource.getJournalPost] Sanity fetch failed, returning null:', err)
      return null
    }
  },

  async getAllJournalSlugs() {
    try {
      const raw = (await sanityClient.fetch(allJournalSlugsQuery, {}, {
        next: { tags: ['journal'] },
      })) as Array<{ slug: string }> | null
      return (raw ?? []).map((r) => r.slug).filter(Boolean)
    } catch (err) {
      console.error('[sanitySource.getAllJournalSlugs] Sanity fetch failed, returning []:', err)
      return []
    }
  },
}
