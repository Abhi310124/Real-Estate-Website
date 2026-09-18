export type ProjectCategory =
  | 'open-plots' | 'villas' | 'apartments' | 'independent-houses' | 'developers'
export type ProjectStatus = 'upcoming' | 'ongoing' | 'completed' | 'sold-out'

export interface Img { url: string; alt: string; lqip?: string; caption?: string }
export interface KeyStat { label: string; value: number; suffix?: string }
export interface FloorPlan { title: string; unitType: string; area: number; areaUnit: string; image: Img }
export interface MasterPlanPlot {
  label: string; size: string; facing?: string
  status: 'available' | 'blocked' | 'sold'
  polygon: string   // SVG points, viewBox-relative
}
export interface Amenity { title: string; icon: string; category?: string }

export interface ProjectSummary {
  id: string; title: string; slug: string; tagline: string
  category: ProjectCategory; status: ProjectStatus
  isPublished: boolean; featured: boolean; order: number
  location: { area: string; city: string }
  priceFrom: number | null; priceUnit: 'Lakh' | 'Cr'; priceOnRequest: boolean
  unitTypes: string[]; heroImage: Img
}

export interface Project extends ProjectSummary {
  location: { area: string; city: string; mapEmbedUrl?: string; lat?: number; lng?: number }
  overview: string[]
  keyStats: KeyStat[]
  gallery: Img[]
  amenities: Amenity[]
  floorPlans: FloorPlan[]
  masterPlan?: { image: Img; plots: MasterPlanPlot[] }
  specifications: Array<{ category: string; items: string[] }>
  constructionUpdates: Array<{ date: string; title: string; images: Img[]; note?: string }>
  connectivity: Array<{ place: string; distance: string }>
  brochureUrl?: string
  reraNumber: string
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: Img }
}

export interface SiteSettings {
  tagline: string
  phones: string[]
  whatsappNumber: string
  // Optional by ruling: no official inbox is a verified fact for BKR INFRA, and a `mailto:` to a
  // mailbox that does not exist swallows the enquiry while looking like it worked. Render the
  // email link only when this is set. The phones, WhatsApp and the enquiry form are the channels
  // that always exist. The Sanity schema must not mark this field required.
  email?: string
  address: string
  socials: Array<{ platform: string; url: string }>
  pillars: Array<{ title: string; description: string }>
  categories: Array<{ label: string; value: ProjectCategory }>
  // Task 12's StatsBand. Owner-editable by design — these are the kind of figures a business
  // updates every year, not fixed schema like ProjectStatus. The Sanity schema (Task 19) must
  // expose this as an editable array, and the owner guide (Task 22) must flag that the mock
  // figures are placeholders needing the client's real numbers before launch (see the comment
  // beside MOCK_SETTINGS.stats in mock.ts).
  stats: Array<{ label: string; value: number; suffix?: string }>
  footerBlurb: string
  reraDisclaimer: string
  announcementBar: { enabled: boolean; text: string; link?: string }
}

/**
 * A journal post. Added for the Journal section and `/journal` routes.
 *
 * `isPublished` mirrors `Project`'s own switch deliberately — it is the owner's show/hide control,
 * and every query must gate on it so flipping one toggle removes a post from the listing, the home
 * page preview and the sitemap at once. `tests/unit/sanity-source.test.ts` enforces that gating
 * across every project-and-post query, so a new query that forgets it fails a test rather than
 * silently leaking a draft.
 */
export interface JournalPost {
  id: string
  title: string
  slug: string
  excerpt: string
  /** Paragraphs. Portable Text from Sanity is flattened to this shape by the Sanity source. */
  body: string[]
  coverImage: Img
  publishedAt: string
  isPublished: boolean
}

export interface LeadInput {
  name: string; phone: string; email?: string; message?: string
  projectSlug?: string
  source: 'enquiry' | 'site-visit' | 'brochure'
}

export interface DataSource {
  getProjects(filter?: { category?: ProjectCategory; status?: ProjectStatus }): Promise<ProjectSummary[]>
  getFeaturedProjects(): Promise<ProjectSummary[]>
  getProject(slug: string): Promise<Project | null>
  getAllProjectSlugs(): Promise<string[]>
  getSiteSettings(): Promise<SiteSettings>
  /** Newest first. Published only. */
  getJournalPosts(): Promise<JournalPost[]>
  getJournalPost(slug: string): Promise<JournalPost | null>
  getAllJournalSlugs(): Promise<string[]>
}
