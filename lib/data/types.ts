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
  email: string
  address: string
  socials: Array<{ platform: string; url: string }>
  pillars: Array<{ title: string; description: string }>
  categories: Array<{ label: string; value: ProjectCategory }>
  footerBlurb: string
  reraDisclaimer: string
  announcementBar: { enabled: boolean; text: string; link?: string }
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
}
