# BKR INFRA Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Next.js real estate website for BKR INFRA whose motion design exceeds every major Indian developer site, where the owner adds, hides and removes projects himself through an embedded Sanity Studio without touching code.

**Architecture:** Next.js App Router renders all content through a single data-access module that selects between a typed mock dataset and Sanity based on env vars — so the whole site builds and animates before a Sanity account exists. A small set of GSAP + Lenis motion primitives (`SplitWords`, `Reveal`, `ImageReveal`, `Parallax`, `Counter`, `Marquee`) is composed by every page, with one `useReducedMotion` gate guaranteeing content is never trapped behind an animation that will not run.

**Tech Stack:** Next.js (App Router) · TypeScript strict · Tailwind CSS · GSAP 3 + ScrollTrigger (free plugins only) · Lenis · Swiper · Sanity + embedded Studio · Vitest · Playwright · Resend (optional)

**Spec:** `docs/superpowers/specs/2026-09-15-bkr-infra-website-design.md`

---

## Global Constraints

Every task's requirements implicitly include this section. Values are copied verbatim from the spec.

**Brand colour tokens (exact hex — do not approximate):**
`navy-900 #071628` · `navy-800 #0A1A2F` · `navy-700 #16233A` · `navy-600 #1D2733` · `ivory #F7F4EE` · `ivory-warm #FBF9F5` · `orange #FF4907` · `orange-600 #E63F05` · `champagne #C9A227`

**Contrast rules (hard — measured, not estimated):**
- `orange` on `ivory` is **3.08:1** → permitted only for display type ≥ 24px, rules, icons, and filled buttons with white labels. **Never body copy, never small labels.**
- `champagne` on `ivory` is **2.20:1** → decorative hairlines and ornament only. **Never text.**
- `orange` as a background always carries `#FFFFFF` text.
- Safe for body text: `navy-800` on `ivory` (15.9:1), `#FFF` on `navy-800` (17.5:1), `orange` on `navy-800` (5.16:1), `champagne` on `navy-800` (7.2:1).

**Typography:** Display = Archivo variable `wght 800` / `wdth 118`, UPPERCASE, tracking `-0.02em`, leading `0.92`. Eyebrow = Archivo `wght 600` / `wdth 100`, UPPERCASE, 11–12px, tracking `+0.32em`. Body = Inter variable, leading 1.7–1.75. Numerals `tabular-nums`. If the `wdth` axis is unavailable through the font loader, fall back to the separate `Archivo Expanded` family for display only.

**Fluid type scale:**
```
display-xl   clamp(3.25rem, 9vw,   7.5rem)
display-lg   clamp(2.5rem,  6vw,   5.5rem)
display-md   clamp(1.75rem, 3.2vw, 3rem)
body-lg      1.0625rem / 1.75
body         1rem / 1.7
caption      0.8125rem / 1.6
```

**Motion rules:**
- Animate only `transform`, `opacity`, `clip-path`. Apply `will-change` on trigger, remove on completion.
- **No paid GSAP plugins.** ScrollTrigger and Flip only. Word splitting is our own code.
- Every primitive reads `useReducedMotion()`. When reduced: Lenis is not initialised, and every reveal mounts at its final state. **No element may remain at `opacity: 0` when motion is disabled.**
- Pinned horizontal scroll and the custom cursor are disabled on touch devices.

**Performance budgets:** LCP < 2.5 s · CLS < 0.05 · Lighthouse desktop performance ≥ 90 · accessibility ≥ 95.

**Content rule:** `isPublished` defaults to `false` and **every** content query filters on it. This is the owner's show/hide switch.

**Legal:** `reraNumber` displays on every project detail page; `reraDisclaimer` from site settings displays in the footer. Required on Indian property marketing.

**Commit discipline:** commit at the end of every task. Conventional Commits (`feat:`, `test:`, `fix:`, `chore:`, `docs:`).

---

## File Structure

```
app/
  layout.tsx                      root shell: fonts, providers, skip-link
  globals.css                     tokens, base type, utilities
  page.tsx                        Home
  projects/page.tsx               listing + filters
  projects/[slug]/page.tsx        project detail (centrepiece)
  about/page.tsx
  contact/page.tsx
  studio/[[...tool]]/page.tsx     embedded Sanity Studio
  api/lead/route.ts               POST → lead doc + email
  api/revalidate/route.ts         Sanity webhook → revalidateTag
  sitemap.ts  robots.ts  not-found.tsx

lib/
  data/index.ts                   selects mock vs sanity
  data/types.ts                   Project, SiteSettings, Amenity, Lead…
  data/mock.ts                    6 realistic Hyderabad projects
  data/sanity.ts                  real implementation
  cn.ts                           className joiner
  format.ts                       price/area/date formatting
  whatsapp.ts                     deep-link builder

components/
  motion/  useReducedMotion.ts  LenisProvider.tsx  gsap.ts
           SplitWords.tsx  Reveal.tsx  ImageReveal.tsx  Parallax.tsx
           Counter.tsx  Marquee.tsx  PageTransition.tsx  MagneticCursor.tsx
  brand/   Logo.tsx  LogoMark.tsx
  layout/  Header.tsx  MegaMenu.tsx  Footer.tsx  SectionNav.tsx
           FloatingActions.tsx  AnnouncementBar.tsx
  home/    Hero.tsx  PillarsStrip.tsx  HorizontalShowcase.tsx
           CategoryGrid.tsx  StatsBand.tsx  WhyBkr.tsx  CtaBand.tsx
  projects/ FilterBar.tsx  ProjectCard.tsx  ProjectGrid.tsx
  project/ ProjectHero.tsx  Overview.tsx  KeyStats.tsx  Connectivity.tsx
           PlansTabs.tsx  MasterPlan.tsx  GallerySwiper.tsx  Amenities.tsx
           Specifications.tsx  ConstructionTimeline.tsx  BrochureGate.tsx
           EnquiryForm.tsx
  ui/      Button.tsx  Field.tsx  Lightbox.tsx  Pill.tsx  Rule.tsx  Eyebrow.tsx

sanity/
  schemas/index.ts  project.ts  amenity.ts  siteSettings.ts  lead.ts
  lib/client.ts  lib/queries.ts  lib/image.ts
  structure.ts  env.ts
sanity.config.ts

tests/
  unit/*.test.ts                  Vitest
  e2e/*.spec.ts                   Playwright

docs/OWNER-GUIDE.md
public/brand/  public/placeholder/
```

---

# Phase 0 — Foundation

### Task 1: Scaffold project, brand tokens, typography

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `.gitignore`, `.env.example`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Create: `lib/cn.ts`, `lib/tokens.ts`
- Create: `vitest.config.ts`, `tests/unit/tokens.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `lib/tokens.ts` exporting `COLORS: Record<string,string>` and `contrastRatio(hexA: string, hexB: string): number`; `lib/cn.ts` exporting `cn(...classes: Array<string|false|null|undefined>): string`

- [ ] **Step 1: Initialise the repo and install dependencies**

```bash
cd "C:/Users/AbhinavSaiPavanKalya/Karthik-Website"
git init
npm init -y
npm i next react react-dom
npm i -D typescript @types/react @types/react-dom @types/node \
  tailwindcss postcss autoprefixer eslint eslint-config-next \
  vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom
```

- [ ] **Step 2: Write the failing contrast test**

The spec's contrast rules are load-bearing (orange fails AA on ivory). Encode them so a future colour tweak cannot silently break accessibility.

`tests/unit/tokens.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { COLORS, contrastRatio } from '@/lib/tokens'

describe('brand tokens', () => {
  it('exposes the exact hexes from the spec', () => {
    expect(COLORS['navy-900']).toBe('#071628')
    expect(COLORS['navy-800']).toBe('#0A1A2F')
    expect(COLORS['ivory']).toBe('#F7F4EE')
    expect(COLORS['orange']).toBe('#FF4907')
    expect(COLORS['champagne']).toBe('#C9A227')
  })
})

describe('contrast rules from the spec', () => {
  const near = (a: number, b: number) => Math.abs(a - b) < 0.15

  it('navy-800 on ivory is safe for body text', () => {
    expect(near(contrastRatio(COLORS['navy-800'], COLORS['ivory']), 15.9)).toBe(true)
  })

  it('white on navy-800 is safe for body text', () => {
    expect(near(contrastRatio('#FFFFFF', COLORS['navy-800']), 17.5)).toBe(true)
  })

  it('orange on navy-800 passes AA for body text', () => {
    expect(contrastRatio(COLORS['orange'], COLORS['navy-800'])).toBeGreaterThanOrEqual(4.5)
  })

  it('orange on ivory FAILS AA — large text and UI only', () => {
    const r = contrastRatio(COLORS['orange'], COLORS['ivory'])
    expect(r).toBeLessThan(4.5)
    expect(r).toBeGreaterThanOrEqual(3)
  })

  it('champagne on ivory is decorative only — fails even large text', () => {
    expect(contrastRatio(COLORS['champagne'], COLORS['ivory'])).toBeLessThan(3)
  })

  it('champagne on navy-800 is safe for text', () => {
    expect(contrastRatio(COLORS['champagne'], COLORS['navy-800'])).toBeGreaterThanOrEqual(4.5)
  })
})
```

- [ ] **Step 3: Run the test and confirm it fails**

```bash
npx vitest run tests/unit/tokens.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/tokens'`.

- [ ] **Step 4: Implement the tokens module**

`lib/tokens.ts`:

```ts
export const COLORS = {
  'navy-900': '#071628',
  'navy-800': '#0A1A2F',
  'navy-700': '#16233A',
  'navy-600': '#1D2733',
  ivory: '#F7F4EE',
  'ivory-warm': '#FBF9F5',
  orange: '#FF4907',
  'orange-600': '#E63F05',
  champagne: '#C9A227',
} as const

function channel(v: number): number {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA)
  const b = relativeLuminance(hexB)
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}
```

`lib/cn.ts`:

```ts
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
```

- [ ] **Step 5: Run the test and confirm it passes**

```bash
npx vitest run tests/unit/tokens.test.ts
```

Expected: PASS, 7 tests.

- [ ] **Step 6: Wire Tailwind to the tokens and set the type scale**

`tailwind.config.ts` — import `COLORS` so Tailwind and the tests cannot disagree:

```ts
import type { Config } from 'tailwindcss'
import { COLORS } from './lib/tokens'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ...COLORS, brand: { navy: COLORS['navy-800'], orange: COLORS.orange } },
      fontFamily: { display: ['var(--font-archivo)'], body: ['var(--font-inter)'] },
      fontSize: {
        'display-xl': ['clamp(3.25rem, 9vw, 7.5rem)', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 6vw, 5.5rem)', { lineHeight: '0.94', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.75rem, 3.2vw, 3rem)', { lineHeight: '1.02', letterSpacing: '-0.015em' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.75' }],
        body: ['1rem', { lineHeight: '1.7' }],
        caption: ['0.8125rem', { lineHeight: '1.6' }],
        eyebrow: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.32em' }],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 7: Load fonts and build the root layout**

`app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Archivo, Inter } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'BKR INFRA — Redefining Real Estate Excellence',
  description:
    'Open plots, villas, apartments and independent houses in Hyderabad. BKR INFRA develops, designs and delivers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="bg-ivory font-body text-navy-800 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-navy-800 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
```

`app/globals.css` defines the display utility so the `wdth` axis is applied in one place:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root { --wdth-display: 118; }
  .font-display-expanded {
    font-family: var(--font-archivo);
    font-variation-settings: 'wdth' var(--wdth-display), 'wght' 800;
    text-transform: uppercase;
  }
  .eyebrow {
    font-family: var(--font-archivo);
    font-variation-settings: 'wdth' 100, 'wght' 600;
    text-transform: uppercase;
  }
  .tnum { font-variant-numeric: tabular-nums; }
}
```

- [ ] **Step 8: Verify the `wdth` axis actually renders**

Run `npm run dev`, put `<h1 className="font-display-expanded text-display-xl">BKR INFRA</h1>` on the home page, and compare it against `wdth 100` in devtools. If the axis has no visible effect, the loader did not serve it — switch the display face to the separate `Archivo_Expanded` family per Global Constraints and note the change in a comment.

- [ ] **Step 9: Confirm the build is clean and commit**

```bash
npx tsc --noEmit && npx next build && npx vitest run
git add -A
git commit -m "feat: scaffold Next.js app with BKR brand tokens and type scale"
```

---

### Task 2: Typed data layer with mock fallback

**Files:**
- Create: `lib/data/types.ts`, `lib/data/mock.ts`, `lib/data/index.ts`
- Create: `lib/format.ts`, `lib/whatsapp.ts`
- Create: `tests/unit/data.test.ts`, `tests/unit/format.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `lib/data/types.ts`: `Project`, `ProjectSummary`, `Amenity`, `SiteSettings`, `FloorPlan`, `MasterPlanPlot`, `KeyStat`, `ProjectCategory`, `ProjectStatus`, `LeadInput`, `DataSource`
  - `lib/data/index.ts`: `getProjects(filter?: { category?: ProjectCategory; status?: ProjectStatus }): Promise<ProjectSummary[]>`, `getFeaturedProjects(): Promise<ProjectSummary[]>`, `getProject(slug: string): Promise<Project | null>`, `getSiteSettings(): Promise<SiteSettings>`, `getAllProjectSlugs(): Promise<string[]>`, `activeSource(): 'mock' | 'sanity'`
  - `lib/format.ts`: `formatPrice(from: number | null, unit: 'Lakh' | 'Cr', onRequest: boolean): string`, `formatArea(v: number, unit: string): string`
  - `lib/whatsapp.ts`: `whatsappLink(number: string, message: string): string`

- [ ] **Step 1: Write the failing data-layer test**

`tests/unit/data.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getProjects, getFeaturedProjects, getProject, getAllProjectSlugs, activeSource } from '@/lib/data'

describe('data layer with no Sanity env vars', () => {
  it('falls back to mock so the site builds without a Sanity account', () => {
    expect(activeSource()).toBe('mock')
  })

  it('returns only published projects', async () => {
    const all = await getProjects()
    expect(all.length).toBeGreaterThan(0)
    expect(all.every((p) => p.isPublished)).toBe(true)
  })

  it('never leaks an unpublished project through getProject', async () => {
    const hidden = await getProject('unpublished-sample')
    expect(hidden).toBeNull()
  })

  it('filters by category', async () => {
    const villas = await getProjects({ category: 'villas' })
    expect(villas.length).toBeGreaterThan(0)
    expect(villas.every((p) => p.category === 'villas')).toBe(true)
  })

  it('filters by status', async () => {
    const ongoing = await getProjects({ category: undefined, status: 'ongoing' })
    expect(ongoing.every((p) => p.status === 'ongoing')).toBe(true)
  })

  it('returns featured projects sorted by order', async () => {
    const featured = await getFeaturedProjects()
    expect(featured.length).toBeGreaterThanOrEqual(3)
    const orders = featured.map((p) => p.order)
    expect([...orders].sort((a, b) => a - b)).toEqual(orders)
  })

  it('resolves a full project by slug with the fields pages depend on', async () => {
    const slugs = await getAllProjectSlugs()
    const p = await getProject(slugs[0])
    expect(p).not.toBeNull()
    expect(p!.heroImage.alt).toBeTruthy()
    expect(p!.reraNumber).toBeTruthy()
    expect(p!.keyStats.length).toBeGreaterThan(0)
  })

  it('excludes unpublished projects from the slug list', async () => {
    expect(await getAllProjectSlugs()).not.toContain('unpublished-sample')
  })
})
```

`tests/unit/format.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { formatPrice, formatArea } from '@/lib/format'
import { whatsappLink } from '@/lib/whatsapp'

describe('formatPrice', () => {
  it('renders a starting price', () => {
    expect(formatPrice(85, 'Lakh', false)).toBe('₹85 Lakh onwards')
  })
  it('renders crore', () => {
    expect(formatPrice(1.4, 'Cr', false)).toBe('₹1.4 Cr onwards')
  })
  it('honours price-on-request over any number', () => {
    expect(formatPrice(85, 'Lakh', true)).toBe('Price on request')
  })
  it('falls back to on-request when the price is missing', () => {
    expect(formatPrice(null, 'Lakh', false)).toBe('Price on request')
  })
})

describe('formatArea', () => {
  it('groups thousands', () => {
    expect(formatArea(1450, 'sq.ft')).toBe('1,450 sq.ft')
  })
})

describe('whatsappLink', () => {
  it('builds a wa.me link with an encoded message', () => {
    expect(whatsappLink('+91 63019 99971', 'Hi BKR, I am interested')).toBe(
      'https://wa.me/916301999971?text=Hi%20BKR%2C%20I%20am%20interested',
    )
  })
})
```

- [ ] **Step 2: Run both tests and confirm they fail**

```bash
npx vitest run tests/unit/data.test.ts tests/unit/format.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Define the types**

`lib/data/types.ts`:

```ts
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
```

- [ ] **Step 4: Write the mock source**

`lib/data/mock.ts` must export a `DataSource`. Author **six** projects covering all five categories and the statuses `upcoming`, `ongoing`, `completed`, plus **one deliberately unpublished** project with slug `unpublished-sample` so the filtering tests are meaningful. Use real Hyderabad micro-markets — Ghatkesar, Kollur, Tellapur, Shamirpet, ECIL, Adibatla — and plausible pricing so layouts are tested against true-to-life string lengths. Every `Img.url` points at `/placeholder/*.jpg` (populated in Task 26); every `Img.alt` is written properly.

Filtering, publish-gating and ordering live in one place so both sources behave identically:

```ts
import type { DataSource, Project, ProjectSummary } from './types'

export const MOCK_PROJECTS: Project[] = [ /* six projects, per the notes above */ ]

const toSummary = (p: Project): ProjectSummary => ({
  id: p.id, title: p.title, slug: p.slug, tagline: p.tagline,
  category: p.category, status: p.status,
  isPublished: p.isPublished, featured: p.featured, order: p.order,
  location: { area: p.location.area, city: p.location.city },
  priceFrom: p.priceFrom, priceUnit: p.priceUnit, priceOnRequest: p.priceOnRequest,
  unitTypes: p.unitTypes, heroImage: p.heroImage,
})

const published = () => MOCK_PROJECTS.filter((p) => p.isPublished)

export const mockSource: DataSource = {
  async getProjects(filter) {
    return published()
      .filter((p) => (filter?.category ? p.category === filter.category : true))
      .filter((p) => (filter?.status ? p.status === filter.status : true))
      .sort((a, b) => a.order - b.order)
      .map(toSummary)
  },
  async getFeaturedProjects() {
    return published().filter((p) => p.featured).sort((a, b) => a.order - b.order).map(toSummary)
  },
  async getProject(slug) {
    return published().find((p) => p.slug === slug) ?? null
  },
  async getAllProjectSlugs() {
    return published().map((p) => p.slug)
  },
  async getSiteSettings() {
    return MOCK_SETTINGS
  },
}
```

`MOCK_SETTINGS` uses the real brand facts: tagline `Redefining Real Estate Excellence`; phones `['+91 6301999971', '+91 9676669923']`; address `Flat No. 202, Mythri Apartments, Opp. BSNL Office, ECIL, Hyderabad-62`; pillars `DEVELOP` / `DESIGN` / `DELIVER`; the five categories from the letterhead.

- [ ] **Step 5: Write the source selector**

`lib/data/index.ts`:

```ts
import { mockSource } from './mock'
import type { DataSource } from './types'

export * from './types'

export function activeSource(): 'mock' | 'sanity' {
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? 'sanity' : 'mock'
}

// sanitySource is registered in Task 20; until then the selector only knows mock.
async function source(): Promise<DataSource> {
  if (activeSource() === 'sanity') {
    const { sanitySource } = await import('./sanity')
    return sanitySource
  }
  return mockSource
}

export const getProjects: DataSource['getProjects'] = async (f) => (await source()).getProjects(f)
export const getFeaturedProjects: DataSource['getFeaturedProjects'] = async () => (await source()).getFeaturedProjects()
export const getProject: DataSource['getProject'] = async (s) => (await source()).getProject(s)
export const getAllProjectSlugs: DataSource['getAllProjectSlugs'] = async () => (await source()).getAllProjectSlugs()
export const getSiteSettings: DataSource['getSiteSettings'] = async () => (await source()).getSiteSettings()
```

- [ ] **Step 6: Implement the formatters**

`lib/format.ts`:

```ts
export function formatPrice(from: number | null, unit: 'Lakh' | 'Cr', onRequest: boolean): string {
  if (onRequest || from === null) return 'Price on request'
  return `₹${from} ${unit} onwards`
}

export function formatArea(v: number, unit: string): string {
  return `${v.toLocaleString('en-IN')} ${unit}`
}
```

`lib/whatsapp.ts`:

```ts
export function whatsappLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
```

- [ ] **Step 7: Run the tests and confirm they pass**

```bash
npx vitest run tests/unit/data.test.ts tests/unit/format.test.ts
```

Expected: PASS. If the featured-order assertion fails, the mock `order` values are not ascending — fix the fixtures, not the test.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: typed data layer with mock fallback so the site builds without Sanity"
```

---

# Phase 1 — Motion system

### Task 3: Reduced-motion gate, GSAP registration, Lenis provider

**Files:**
- Create: `components/motion/useReducedMotion.ts`, `components/motion/gsap.ts`, `components/motion/LenisProvider.tsx`
- Modify: `app/layout.tsx`
- Create: `tests/e2e/motion-foundation.spec.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `useReducedMotion(): boolean` — client hook, live-updates on media-query change
  - `components/motion/gsap.ts`: `getGsap(): Promise<{ gsap: GSAP; ScrollTrigger: typeof ScrollTrigger }>` — dynamic import, registers ScrollTrigger exactly once
  - `<LenisProvider>{children}</LenisProvider>` — skips Lenis entirely under reduced motion; bridges Lenis to ScrollTrigger

- [ ] **Step 1: Install motion dependencies**

```bash
npm i gsap lenis
npm i -D @playwright/test && npx playwright install chromium
```

- [ ] **Step 2: Write the failing Playwright test**

This is the correctness guarantee from Global Constraints: content must never be trapped behind a disabled animation.

`tests/e2e/motion-foundation.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('smooth scroll', () => {
  test('Lenis is active by default', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/lenis/)
  })
})

test.describe('prefers-reduced-motion: reduce', () => {
  test.use({ reducedMotion: 'reduce' })

  test('Lenis is not initialised', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveClass(/lenis-smooth/)
  })

  test('no element is stranded at opacity 0', async ({ page }) => {
    await page.goto('/')
    const stranded = await page.evaluate(() =>
      [...document.querySelectorAll('h1,h2,h3,p,li,a,button')].filter((el) => {
        const s = getComputedStyle(el)
        return s.opacity === '0' && s.display !== 'none' && s.visibility !== 'hidden'
      }).length,
    )
    expect(stranded).toBe(0)
  })
})
```

Add `playwright.config.ts` with `webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true }` and `use: { baseURL: 'http://localhost:3000' }`.

- [ ] **Step 3: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/motion-foundation.spec.ts
```

Expected: FAIL — `html` has no `lenis` class.

- [ ] **Step 4: Implement the reduced-motion hook**

`components/motion/useReducedMotion.ts`:

```ts
'use client'
import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  // Start true so the very first paint is the safe, fully-visible state.
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}
```

The initial `true` matters: components read this to decide whether to mount hidden. Defaulting to "reduced" means a hydration failure leaves content **visible** rather than invisible.

- [ ] **Step 5: Implement the GSAP singleton**

`components/motion/gsap.ts`:

```ts
'use client'
let cached: Promise<{ gsap: typeof import('gsap').gsap; ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger }> | null = null

export function getGsap() {
  if (!cached) {
    cached = (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      gsap.registerPlugin(ScrollTrigger)
      return { gsap, ScrollTrigger }
    })()
  }
  return cached
}
```

- [ ] **Step 6: Implement the Lenis provider and bridge it to ScrollTrigger**

`components/motion/LenisProvider.tsx`:

```tsx
'use client'
import { useEffect } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    let lenis: import('lenis').default | undefined
    let tick: ((t: number) => void) | undefined
    let cancelled = false

    ;(async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([import('lenis'), getGsap()])
      if (cancelled) return
      lenis = new Lenis({ lerp: 0.09 })
      lenis.on('scroll', ScrollTrigger.update)
      tick = (time: number) => lenis!.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    })()

    return () => {
      cancelled = true
      if (tick) getGsap().then(({ gsap }) => gsap.ticker.remove(tick!))
      lenis?.destroy()
    }
  }, [reduced])

  return <>{children}</>
}
```

Lenis adds `lenis lenis-smooth` to `<html>` itself when constructed, which is exactly what the test asserts — and skipping construction under reduced motion is what makes the negative assertion pass.

- [ ] **Step 7: Mount the provider and confirm the tests pass**

Wrap `{children}` in `app/layout.tsx` with `<LenisProvider>`, then:

```bash
npx playwright test tests/e2e/motion-foundation.spec.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Lenis smooth scroll bridged to ScrollTrigger with a reduced-motion gate"
```

---

### Task 4: SplitWords — the signature heading reveal

**Files:**
- Create: `components/motion/SplitWords.tsx`
- Create: `tests/e2e/split-words.spec.ts`

**Interfaces:**
- Consumes: `useReducedMotion`, `getGsap`
- Produces: `<SplitWords as="h1" className="…" text="A skyline of your own" delay={0} />` — renders `<h1>` containing one masked span per word

This reproduces and then improves on the reference implementation: outer span `overflow:hidden`, inner span `yPercent 110 → 0`, `stagger 0.055`, `expo.out`, `1.1s`, trigger `top 82%`, once.

- [ ] **Step 1: Write the failing test**

`tests/e2e/split-words.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('heading text stays readable as text for a11y and copy-paste', async ({ page }) => {
  await page.goto('/')
  const h1 = page.locator('h1').first()
  await expect(h1).toHaveText(/\S/)
  const words = h1.locator('[data-word]')
  expect(await words.count()).toBeGreaterThan(1)
})

test('each word sits inside an overflow-hidden mask', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.locator('h1 [data-word-mask]').first().evaluate((el) => getComputedStyle(el).overflow)
  expect(overflow).toBe('hidden')
})

test('words settle at translateY(0) after the reveal', async ({ page }) => {
  await page.goto('/')
  const inner = page.locator('h1 [data-word]').first()
  await expect
    .poll(async () => inner.evaluate((el) => getComputedStyle(el).transform), { timeout: 4000 })
    .toMatch(/matrix\(1, 0, 0, 1, 0, 0\)|none/)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('words are visible immediately and untransformed', async ({ page }) => {
    await page.goto('/')
    const inner = page.locator('h1 [data-word]').first()
    expect(await inner.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    expect(await inner.evaluate((el) => getComputedStyle(el).transform)).toMatch(/matrix\(1, 0, 0, 1, 0, 0\)|none/)
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/split-words.spec.ts
```

Expected: FAIL — no `[data-word]` elements.

- [ ] **Step 3: Implement SplitWords**

`components/motion/SplitWords.tsx`:

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

type Props = {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  delay?: number
}

export function SplitWords({ text, as: Tag = 'h2', className, delay = 0 }: Props) {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const words = text.split(/\s+/).filter(Boolean)

  useEffect(() => {
    if (reduced || !root.current) return
    const el = root.current
    let kill: (() => void) | undefined

    getGsap().then(({ gsap, ScrollTrigger }) => {
      const inner = el.querySelectorAll<HTMLElement>('[data-word]')
      gsap.set(inner, { yPercent: 110, willChange: 'transform' })
      const tween = gsap.to(inner, {
        yPercent: 0,
        duration: 1.1,
        delay,
        stagger: 0.055,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        onComplete: () => gsap.set(inner, { willChange: 'auto' }),
      })
      kill = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        ScrollTrigger.refresh()
      }
    })

    return () => kill?.()
  }, [reduced, delay, text])

  return (
    <Tag ref={root as never} className={className}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} data-word-mask style={{ display: 'inline-block', overflow: 'hidden', lineHeight: 1.1, verticalAlign: 'bottom' }}>
          <span data-word style={{ display: 'inline-block' }}>{w}</span>
        </span>
      ))}
    </Tag>
  )
}
```

Two deliberate improvements on the reference: the words render as real text nodes with normal spacing (so selection and screen readers work without an `aria-label` duplicate), and `will-change` is cleared on completion instead of left on every heading forever.

Interword spacing: because each mask is `inline-block`, the JSX whitespace between them collapses. Add `{' '}` between spans, or set `word-spacing` on the parent — verify visually and pick whichever renders correct spacing at `display-xl`.

- [ ] **Step 4: Use it on the home page so the test has a target**

Replace the placeholder `<h1>` in `app/page.tsx` with:

```tsx
<SplitWords as="h1" className="font-display-expanded text-display-xl" text="Redefining Real Estate Excellence" />
```

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/split-words.spec.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: SplitWords masked per-word heading reveal"
```

---

### Task 5: Reveal, ImageReveal, Parallax, Counter, Marquee

**Files:**
- Create: `components/motion/Reveal.tsx`, `ImageReveal.tsx`, `Parallax.tsx`, `Counter.tsx`, `Marquee.tsx`
- Create: `tests/e2e/motion-primitives.spec.ts`

**Interfaces:**
- Consumes: `useReducedMotion`, `getGsap`
- Produces:
  - `<Reveal delay?: number; className?: string>{children}</Reveal>` — `y 28 → 0`, `opacity 0 → 1`, `0.9s`, `power3.out`
  - `<ImageReveal src alt sizes priority? className?>` — `clip-path inset(0 0 100% 0) → inset(0 0 0 0)` with inner `scale 1.12 → 1`, `1.4s`, `expo.out`; wraps `next/image`
  - `<Parallax speed={0.15} className?>{children}</Parallax>` — ScrollTrigger `scrub: true` on `yPercent`
  - `<Counter value={90} suffix="Acres" className?>` — count-up on enter, renders with `tabular-nums`
  - `<Marquee speed={40}>{children}</Marquee>` — seamless loop, pauses on hover and when off-screen

- [ ] **Step 1: Write the failing test**

`tests/e2e/motion-primitives.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('counter counts up to its target', async ({ page }) => {
  await page.goto('/motion-lab')
  const c = page.locator('[data-testid="counter"]')
  await c.scrollIntoViewIfNeeded()
  await expect.poll(async () => (await c.textContent())?.trim(), { timeout: 5000 }).toBe('90')
})

test('image reveal ends fully unclipped', async ({ page }) => {
  await page.goto('/motion-lab')
  const wrap = page.locator('[data-testid="image-reveal"]')
  await wrap.scrollIntoViewIfNeeded()
  await expect
    .poll(async () => wrap.evaluate((el) => getComputedStyle(el).clipPath), { timeout: 5000 })
    .toMatch(/inset\(0(px)?( 0(px)?){0,3}\)|none/)
})

test('marquee duplicates its track for a seamless loop', async ({ page }) => {
  await page.goto('/motion-lab')
  expect(await page.locator('[data-testid="marquee"] [data-marquee-track]').count()).toBe(2)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('counter shows its final value with no animation', async ({ page }) => {
    await page.goto('/motion-lab')
    await expect(page.locator('[data-testid="counter"]')).toHaveText('90')
  })

  test('revealed content is visible', async ({ page }) => {
    await page.goto('/motion-lab')
    expect(await page.locator('[data-testid="reveal"]').evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/motion-primitives.spec.ts
```

Expected: FAIL — `/motion-lab` is a 404.

- [ ] **Step 3: Implement Reveal**

`components/motion/Reveal.tsx`:

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !ref.current) return
    const el = ref.current
    let kill: (() => void) | undefined
    getGsap().then(({ gsap }) => {
      gsap.set(el, { opacity: 0, y: 28, willChange: 'transform, opacity' })
      const t = gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, delay, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onComplete: () => gsap.set(el, { willChange: 'auto' }),
      })
      kill = () => { t.scrollTrigger?.kill(); t.kill() }
    })
    return () => kill?.()
  }, [reduced, delay])

  // Renders opaque by default; only JS hides it, and only when motion is allowed.
  return <div ref={ref} className={className}>{children}</div>
}
```

- [ ] **Step 4: Implement ImageReveal, Parallax, Counter, Marquee**

`ImageReveal.tsx` wraps `next/image` in a `clip-path` container and scales an inner wrapper:

```tsx
'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

export function ImageReveal({ src, alt, sizes = '100vw', priority, className }: {
  src: string; alt: string; sizes?: string; priority?: boolean; className?: string
}) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !outer.current || !inner.current) return
    const o = outer.current, i = inner.current
    let kill: (() => void) | undefined
    getGsap().then(({ gsap }) => {
      gsap.set(o, { clipPath: 'inset(0 0 100% 0)' })
      gsap.set(i, { scale: 1.12, willChange: 'transform' })
      const tl = gsap.timeline({ scrollTrigger: { trigger: o, start: 'top 85%', once: true } })
        .to(o, { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'expo.out' })
        .to(i, { scale: 1, duration: 1.4, ease: 'expo.out', onComplete: () => gsap.set(i, { willChange: 'auto' }) }, 0)
      kill = () => { tl.scrollTrigger?.kill(); tl.kill() }
    })
    return () => kill?.()
  }, [reduced])

  return (
    <div ref={outer} data-testid="image-reveal" className={`relative overflow-hidden ${className ?? ''}`}>
      <div ref={inner} className="relative h-full w-full">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    </div>
  )
}
```

`Counter.tsx` — under reduced motion, render the final value directly; otherwise tween a number and write it with `toLocaleString('en-IN')`, on a `tabular-nums` span, triggered once at `top 85%`.

`Parallax.tsx` — `gsap.to(el, { yPercent: -speed * 100, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })`; render children unchanged under reduced motion.

`Marquee.tsx` — render `children` **twice**, each in a `[data-marquee-track]` wrapper, and translate the pair by `-50%` on an infinite `gsap.to` with `ease: 'none'`. Pause with `ScrollTrigger.create({ onToggle })` when off-screen and on `mouseenter`. Under reduced motion, render one static track — so the test's count of 2 applies to the animated path only; assert `toBeGreaterThanOrEqual(1)` there if it proves brittle.

- [ ] **Step 5: Build a motion lab page to exercise them**

Create `app/motion-lab/page.tsx` mounting one of each primitive with the `data-testid`s the test expects (`counter` at `value={90}`, `image-reveal`, `marquee`, `reveal`), each separated by `h-screen` spacers so scroll triggers fire realistically. This page is a **development harness** — Task 23 excludes it from the sitemap and adds `robots: { index: false }`.

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/motion-primitives.spec.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Reveal, ImageReveal, Parallax, Counter and Marquee motion primitives"
```

---

# Phase 2 — Brand and shell

### Task 6: Vector logo

**Files:**
- Create: `components/brand/Logo.tsx`, `components/brand/LogoMark.tsx`
- Create: `public/brand/` (copies of the four supplied artwork files)
- Create: `tests/unit/logo.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<Logo variant="dark" | "light" withTagline?: boolean className?>`, `<LogoMark animated?: boolean className?>` — `LogoMark` exposes `<path data-mark-path>` elements so Task 9 can drive `stroke-dashoffset`

- [ ] **Step 1: Copy the supplied artwork in for reference**

```bash
mkdir -p public/brand docs/brand-refs
cp "C:/Users/AbhinavSaiPavanKalya/Downloads/WhatsApp Unknown 2026-09-15 at 4.31.19 PM/"*.jpeg docs/brand-refs/
```

Name them meaningfully: `business-card.jpeg`, `letterhead.jpeg`, `logo-square.jpeg`, `logo-wide.jpeg`.

- [ ] **Step 2: Write the failing test**

`tests/unit/logo.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Logo } from '@/components/brand/Logo'
import { LogoMark } from '@/components/brand/LogoMark'
import { COLORS } from '@/lib/tokens'

describe('Logo', () => {
  it('is accessible', () => {
    const { getByRole } = render(<Logo variant="dark" />)
    expect(getByRole('img', { name: /BKR INFRA/i })).toBeTruthy()
  })

  it('uses navy wordmark on light backgrounds', () => {
    const { container } = render(<Logo variant="dark" />)
    expect(container.innerHTML).toContain(COLORS['navy-800'])
  })

  it('uses white wordmark on dark backgrounds', () => {
    const { container } = render(<Logo variant="light" />)
    expect(container.innerHTML.toUpperCase()).toContain('#FFFFFF')
  })

  it('keeps the orange triangle accent in both variants', () => {
    for (const v of ['dark', 'light'] as const) {
      const { container } = render(<Logo variant={v} />)
      expect(container.innerHTML.toUpperCase()).toContain(COLORS.orange)
    }
  })
})

describe('LogoMark', () => {
  it('exposes drawable paths for the intro animation', () => {
    const { container } = render(<LogoMark animated />)
    expect(container.querySelectorAll('[data-mark-path]').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 3: Run it and confirm it fails**

```bash
npx vitest run tests/unit/logo.test.tsx
```

Expected: FAIL — modules not found.

- [ ] **Step 4: Trace the wordmark to SVG paths**

Open `docs/brand-refs/logo-wide.jpeg`. Build `LogoMark.tsx` as an inline `<svg viewBox="0 0 240 96">` containing: the chamfered `B`, the angular `K` **with its upper counter as a separate orange triangle path**, and the straight-legged `R`. Give every path `data-mark-path`. Colour comes from props, never hard-coded inside the path elements except the orange triangle.

`Logo.tsx` composes `LogoMark` with the `INFRA` lockup — letter-spaced `INFRA` flanked by two orange rules — and optionally the tagline `REDEFINING REAL ESTATE EXCELLENCE`, where `REDEFINING` is orange and the rest takes the variant colour. Wrap in `role="img"` with `aria-label="BKR INFRA — Redefining Real Estate Excellence"`.

- [ ] **Step 5: Verify the trace against the artwork**

Render the SVG at 320px beside `docs/brand-refs/logo-wide.jpeg` at the same width and compare: the `K` chamfer angle, the triangle's position and size, the `B` bowl geometry, and the `INFRA` letter-spacing.

**Decision gate.** If the trace is not convincingly close, stop refining it: per the spec's risk table, ship `public/brand/logo-wide.png` for static placements and keep the traced `LogoMark` for the intro animation only. Record which path was taken in a comment at the top of `Logo.tsx`.

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx vitest run tests/unit/logo.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: vector BKR logo with light/dark variants and drawable mark"
```

---

### Task 7: Header, mega-menu, announcement bar, floating actions

**Files:**
- Create: `components/layout/Header.tsx`, `MegaMenu.tsx`, `AnnouncementBar.tsx`, `FloatingActions.tsx`
- Create: `components/ui/Button.tsx`, `Pill.tsx`, `Eyebrow.tsx`, `Rule.tsx`
- Modify: `app/layout.tsx`
- Create: `tests/e2e/header.spec.ts`

**Interfaces:**
- Consumes: `getSiteSettings`, `Logo`, `whatsappLink`, `useReducedMotion`
- Produces: `<Header settings={SiteSettings} />`, `<FloatingActions settings={SiteSettings} />`, `<Button variant="solid"|"outline"|"ghost" href?|onClick? >`

- [ ] **Step 1: Write the failing test**

`tests/e2e/header.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('header exposes the primary routes', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /menu/i }).click()
  const nav = page.getByRole('navigation', { name: /main/i })
  for (const label of ['Projects', 'About', 'Contact']) {
    await expect(nav.getByRole('link', { name: new RegExp(label, 'i') })).toBeVisible()
  }
})

test('mega-menu closes on Escape and restores focus to the trigger', async ({ page }) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: /menu/i })
  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('navigation', { name: /main/i })).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('header becomes opaque after scrolling past the hero', async ({ page }) => {
  await page.goto('/')
  const header = page.locator('header')
  const before = await header.evaluate((el) => getComputedStyle(el).backgroundColor)
  await page.mouse.wheel(0, 1200)
  await page.waitForTimeout(900)
  const after = await header.evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(after).not.toBe(before)
})

test('WhatsApp action deep-links to a real BKR number', async ({ page }) => {
  await page.goto('/')
  const wa = page.getByRole('link', { name: /whatsapp/i })
  await expect(wa).toHaveAttribute('href', /wa\.me\/91(6301999971|9676669923)/)
})

test('call action uses a tel: link', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /call/i }).first()).toHaveAttribute('href', /^tel:\+91/)
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/header.spec.ts
```

Expected: FAIL — no menu button.

- [ ] **Step 3: Build the UI atoms**

`Button.tsx` — three variants. `solid` is `bg-orange text-white` (white on orange is mandated by Global Constraints). `outline` is `border-navy-800 text-navy-800` on ivory and `border-white/30 text-white` on navy, chosen by a `tone` prop. All variants: `min-h-11` for touch targets, visible `focus-visible` ring, and a hover that animates `transform`/`opacity` only.

`Eyebrow.tsx` renders the `eyebrow` class with `text-eyebrow`. `Rule.tsx` renders a 3px orange rule (decorative, `aria-hidden`). `Pill.tsx` renders a status pill mapping `ProjectStatus` → label and tone.

- [ ] **Step 4: Build the header**

Fixed, transparent over the hero, transitioning to `bg-navy-800/95 backdrop-blur` once `scrollY > 80`. Layout mirrors the reference: hamburger left, centred logo, contact CTA right. The scroll state is a `useState` driven by a passive `scroll` listener — **not** a ScrollTrigger, so it works identically under reduced motion.

`MegaMenu.tsx` — full-screen navy overlay, `role="navigation" aria-label="Main"`, containing the five categories, primary routes, phone numbers and address. Requirements: focus trap while open, `Escape` closes and returns focus to the trigger, `aria-expanded` on the trigger, `overflow: hidden` on `<body>` while open, and staggered link reveals that collapse to instant under reduced motion.

`AnnouncementBar.tsx` renders only when `settings.announcementBar.enabled`.

`FloatingActions.tsx` — right-edge rail: call (`tel:` to `phones[0]`) and WhatsApp (via `whatsappLink`), both `min-h-11`, with accessible names containing "Call" and "WhatsApp".

- [ ] **Step 5: Mount in the layout**

`app/layout.tsx` becomes an async server component that awaits `getSiteSettings()` and renders `<AnnouncementBar>`, `<Header settings>`, `<main id="main">{children}</main>`, `<FloatingActions settings>`.

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/header.spec.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: header, mega-menu, announcement bar and floating call/WhatsApp actions"
```

---

### Task 8: Footer

**Files:**
- Create: `components/layout/Footer.tsx`
- Modify: `app/layout.tsx`
- Create: `tests/e2e/footer.spec.ts`

**Interfaces:**
- Consumes: `getSiteSettings`, `Logo`
- Produces: `<Footer settings={SiteSettings} />`

- [ ] **Step 1: Write the failing test**

`tests/e2e/footer.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('footer carries the real business details', async ({ page }) => {
  await page.goto('/')
  const f = page.locator('footer')
  await expect(f).toContainText('Mythri')
  await expect(f).toContainText('ECIL')
  await expect(f).toContainText('6301999971')
  await expect(f).toContainText('9676669923')
})

test('footer shows the RERA disclaimer required on Indian property marketing', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('footer')).toContainText(/RERA/i)
})

test('footer lists the three pillars', async ({ page }) => {
  await page.goto('/')
  const f = page.locator('footer')
  for (const p of ['Develop', 'Design', 'Deliver']) {
    await expect(f).toContainText(new RegExp(p, 'i'))
  }
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/footer.spec.ts
```

Expected: FAIL — no `footer`.

- [ ] **Step 3: Implement the footer**

`bg-navy-900`, four columns: light `Logo` plus `footerBlurb`; category links; primary routes; contact block with `tel:` links, `mailto:`, address and socials. Champagne hairline dividers (decorative only — Global Constraints forbid champagne text on light, and this is on navy so champagne text is permitted at 7.2:1). Bottom bar: copyright and `reraDisclaimer`.

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/footer.spec.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: footer with contact details, pillars and RERA disclaimer"
```

---

### Task 9: Page transitions and first-load intro

**Files:**
- Create: `components/motion/PageTransition.tsx`
- Modify: `app/layout.tsx`
- Create: `tests/e2e/page-transition.spec.ts`

**Interfaces:**
- Consumes: `useReducedMotion`, `getGsap`, `LogoMark`
- Produces: `<PageTransition>{children}</PageTransition>`

**Signature moment 2 of 3.** A navy curtain carrying the BKR mark wipes up, the route changes behind it, the curtain wipes away. On first load only, the mark's outline draws itself via `stroke-dashoffset` before the curtain lifts.

- [ ] **Step 1: Write the failing test**

`tests/e2e/page-transition.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('navigation works and lands on the target route', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /menu/i }).click()
  await page.getByRole('link', { name: /projects/i }).first().click()
  await expect(page).toHaveURL(/\/projects/)
  await expect(page.locator('h1')).toBeVisible()
})

test('the curtain clears itself and never traps the page', async ({ page }) => {
  await page.goto('/projects')
  const curtain = page.locator('[data-curtain]')
  await expect
    .poll(async () => curtain.evaluate((el) => getComputedStyle(el).pointerEvents), { timeout: 6000 })
    .toBe('none')
})

test('intro plays once per session, not on every navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-intro]')).toHaveCount(1)
  await page.goto('/about')
  await expect(page.locator('[data-intro]')).toHaveCount(0)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('no intro, no curtain, content immediately visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-intro]')).toHaveCount(0)
    await expect(page.locator('h1')).toBeVisible()
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/page-transition.spec.ts
```

Expected: FAIL — no `[data-curtain]`.

- [ ] **Step 3: Implement PageTransition**

A client component that:

- Renders a fixed full-viewport `[data-curtain]` panel at `z-[90]`, `bg-navy-800`, containing a centred `LogoMark`. It is `pointer-events-none` whenever idle — this is what stops a stuck curtain from bricking the site, and is exactly what the second test asserts.
- Animates on route change: read `usePathname()`; when it changes, play `clipPath` `inset(100% 0 0 0)` → `inset(0)` → `inset(0 0 100% 0)`, ~`0.55s` each, `power3.inOut`.
- Plays the intro only when `sessionStorage.getItem('bkr-intro') === null`: render `[data-intro]`, tween each `[data-mark-path]`'s `strokeDashoffset` from its own `getTotalLength()` to `0` over ~1.4 s, then lift the curtain and set the flag.
- Under reduced motion, renders **nothing at all** — no curtain, no intro.

Navigation itself must not depend on this component: links stay real `<Link>` elements and the curtain is decoration layered on top. If the animation throws, navigation still works.

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/page-transition.spec.ts
```

Expected: PASS, 4 tests. Also re-run `tests/e2e/header.spec.ts` — a full-viewport overlay is the classic cause of "element intercepts pointer events" failures.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: cinematic page transitions with self-drawing logo intro"
```

---

# Phase 3 — Pages

### Task 10: Home hero and pillars strip

**Files:**
- Create: `components/home/Hero.tsx`, `components/home/PillarsStrip.tsx`
- Modify: `app/page.tsx`
- Create: `tests/e2e/home-hero.spec.ts`

**Interfaces:**
- Consumes: `SplitWords`, `Parallax`, `ImageReveal`, `Marquee`, `Button`, `Eyebrow`, `getSiteSettings`
- Produces: `<Hero settings={SiteSettings} />`, `<PillarsStrip settings={SiteSettings} />`

- [ ] **Step 1: Write the failing test**

`tests/e2e/home-hero.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('hero states the brand promise', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText(/Redefining|Excellence|Address/i)
  await expect(page.getByText(/REDEFINING REAL ESTATE EXCELLENCE/i).first()).toBeVisible()
})

test('hero offers both primary actions', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /view projects/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /enquire/i }).first()).toBeVisible()
})

test('hero image is a priority LCP candidate', async ({ page }) => {
  await page.goto('/')
  const img = page.locator('section[data-hero] img').first()
  await expect(img).toBeVisible()
  expect(await img.getAttribute('loading')).not.toBe('lazy')
})

test('pillars strip names all three', async ({ page }) => {
  await page.goto('/')
  const strip = page.locator('[data-pillars]')
  await strip.scrollIntoViewIfNeeded()
  for (const p of ['Develop', 'Design', 'Deliver']) {
    await expect(strip).toContainText(new RegExp(p, 'i'))
  }
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/home-hero.spec.ts
```

Expected: FAIL.

- [ ] **Step 3: Build the hero**

`<section data-hero>` at `min-h-[100svh]` (`svh`, not `vh`, so mobile browser chrome does not clip it):

- Background image via `next/image` with `priority` and `fill`, animated with a 20 s ken-burns `scale 1 → 1.08` that is skipped under reduced motion.
- Navy scrim: `bg-gradient-to-t from-navy-900/85 via-navy-900/40 to-navy-900/20` so white text clears 4.5:1 over any photo.
- `<Eyebrow>REDEFINING REAL ESTATE EXCELLENCE</Eyebrow>`, `<SplitWords as="h1" className="font-display-expanded text-display-xl text-white">`, a `<Rule>`, a lead paragraph, and two `<Button>`s ("View Projects" → `/projects`, "Enquire Now" → `/contact`).
- Foreground copy in `<Parallax speed={0.12}>` and the image in `<Parallax speed={0.28}>` for depth.
- A scroll cue at the bottom, `aria-hidden`.

- [ ] **Step 4: Build the pillars strip**

`<section data-pillars>` on `bg-navy-800`: three columns (DEVELOP / DESIGN / DELIVER) each with an orange circle line-icon, title and description from `settings.pillars`, staggered via `Reveal`. Below them a `<Marquee>` of the five category labels in champagne — permitted at 7.2:1 on navy.

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/home-hero.spec.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: home hero with parallax and ken-burns, plus pillars strip"
```

---

### Task 11: Pinned horizontal project showcase

**Files:**
- Create: `components/home/HorizontalShowcase.tsx`
- Modify: `app/page.tsx`
- Create: `tests/e2e/horizontal-showcase.spec.ts`

**Interfaces:**
- Consumes: `getFeaturedProjects`, `useReducedMotion`, `getGsap`, `formatPrice`
- Produces: `<HorizontalShowcase projects={ProjectSummary[]} />`

**Signature moment 1 of 3.** The section pins and translates an x-track as the user scrolls down.

- [ ] **Step 1: Write the failing test**

`tests/e2e/horizontal-showcase.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('showcase renders every featured project as a reachable link', async ({ page }) => {
  await page.goto('/')
  const cards = page.locator('[data-showcase] [data-showcase-card]')
  expect(await cards.count()).toBeGreaterThanOrEqual(3)
  await expect(cards.first().getByRole('link')).toHaveAttribute('href', /\/projects\//)
})

test('track translates horizontally as the page scrolls', async ({ page }) => {
  await page.goto('/')
  const track = page.locator('[data-showcase-track]')
  await page.locator('[data-showcase]').scrollIntoViewIfNeeded()
  const x = () => track.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)
  const before = await x()
  await page.mouse.wheel(0, 1500)
  await page.waitForTimeout(1200)
  expect(await x()).toBeLessThan(before)
})

test.describe('touch viewport', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  test('falls back to native scroll-snap without pinning', async ({ page }) => {
    await page.goto('/')
    const track = page.locator('[data-showcase-track]')
    const overflowX = await track.evaluate((el) => getComputedStyle(el).overflowX)
    expect(['auto', 'scroll']).toContain(overflowX)
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('cards remain visible and scrollable without pinning', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-showcase-card]').first()).toBeVisible()
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/horizontal-showcase.spec.ts
```

Expected: FAIL — no `[data-showcase]`.

- [ ] **Step 3: Implement the showcase**

Structure: `<section data-showcase>` wrapping a `h-[100svh]` sticky viewport containing `<div data-showcase-track className="flex">` of cards.

Pinned path (pointer devices, motion allowed):

```ts
const total = track.scrollWidth - window.innerWidth
gsap.to(track, {
  x: -total,
  ease: 'none',
  scrollTrigger: {
    trigger: section, start: 'top top', end: () => `+=${total}`,
    pin: true, scrub: 1, invalidateOnRefresh: true,
  },
})
```

Cards additionally ease `scale` and a small `rotateY` as they cross centre, via a per-card ScrollTrigger with `containerAnimation` set to the track tween.

Fallback path (touch, or reduced motion): no pin, no GSAP. The track becomes `overflow-x-auto snap-x snap-mandatory` with `snap-center` cards — which is what the mobile test asserts. Branch on `matchMedia('(pointer: coarse)')` **and** `useReducedMotion()`, and use `invalidateOnRefresh` so a resize across the breakpoint recalculates rather than stranding a half-pinned section.

Each card: `ImageReveal`, project title in display type, `location.area`, status `Pill`, `formatPrice(...)`, and a `<Link href={/projects/${slug}}>` covering the card.

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/horizontal-showcase.spec.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: pinned horizontal featured-project showcase with touch fallback"
```

---

### Task 12: Categories, stats, why-BKR, CTA band

**Files:**
- Create: `components/home/CategoryGrid.tsx`, `StatsBand.tsx`, `WhyBkr.tsx`, `CtaBand.tsx`
- Modify: `app/page.tsx`
- Create: `tests/e2e/home-sections.spec.ts`

**Interfaces:**
- Consumes: `ImageReveal`, `Counter`, `SplitWords`, `Reveal`, `Button`, `getSiteSettings`
- Produces: `<CategoryGrid categories={SiteSettings['categories']} />`, `<StatsBand />`, `<WhyBkr />`, `<CtaBand settings={SiteSettings} />`

- [ ] **Step 1: Write the failing test**

`tests/e2e/home-sections.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('all five categories link into filtered listings', async ({ page }) => {
  await page.goto('/')
  const grid = page.locator('[data-categories]')
  await grid.scrollIntoViewIfNeeded()
  const links = grid.getByRole('link')
  expect(await links.count()).toBe(5)
  await expect(links.first()).toHaveAttribute('href', /\/projects\?category=/)
})

test('stats counters reach non-zero values', async ({ page }) => {
  await page.goto('/')
  const stats = page.locator('[data-stats]')
  await stats.scrollIntoViewIfNeeded()
  await expect
    .poll(async () => Number((await stats.locator('[data-counter]').first().textContent())?.replace(/\D/g, '')), { timeout: 5000 })
    .toBeGreaterThan(0)
})

test('alternating chapters put navy against ivory', async ({ page }) => {
  await page.goto('/')
  const bg = (sel: string) => page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(await bg('[data-stats]')).not.toBe(await bg('[data-categories]'))
})

test('CTA band invites an enquiry', async ({ page }) => {
  await page.goto('/')
  const cta = page.locator('[data-cta]')
  await cta.scrollIntoViewIfNeeded()
  await expect(cta.getByRole('link', { name: /enquire|contact|talk/i }).first()).toBeVisible()
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/home-sections.spec.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement the four sections, honouring the chapter rhythm**

Per the approved palette, sections alternate: hero (navy) → pillars (navy) → showcase (ivory) → `[data-categories]` (ivory) → `[data-stats]` (navy) → `[data-cta]` (navy) → footer (navy-900).

- `CategoryGrid` — five cards, each `<Link href={/projects?category=${value}}>`, `ImageReveal` thumbnail, display-type label, orange rule that draws on hover via `transform: scaleX`.
- `StatsBand` — `bg-navy-800`, four `Counter`s marked `data-counter` (projects delivered, sq.ft developed, families served, years). Values come from `settings`; use plausible mock figures and flag them for the owner in the guide.
- `WhyBkr` — ivory, editorial two-column with `SplitWords` heading, champagne hairlines, three differentiators.
- `CtaBand` — `bg-navy-800`, big statement plus buttons to `/contact` and WhatsApp.

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/home-sections.spec.ts
```

Expected: PASS, 4 tests. Then run the whole E2E suite — the home page now has every section, so this is the first honest check of the chapter rhythm and of scroll performance.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: category grid, stats counters, why-BKR and CTA band"
```

---

### Task 13: Projects listing with URL-synced filters

**Files:**
- Create: `app/projects/page.tsx`, `components/projects/FilterBar.tsx`, `ProjectCard.tsx`, `ProjectGrid.tsx`
- Create: `tests/e2e/projects-listing.spec.ts`

**Interfaces:**
- Consumes: `getProjects`, `ImageReveal`, `Pill`, `formatPrice`, `getGsap` (Flip)
- Produces: `<ProjectCard project={ProjectSummary} />`, `<ProjectGrid projects={ProjectSummary[]} />`, `<FilterBar active={{category?, status?}} />`

- [ ] **Step 1: Write the failing test**

`tests/e2e/projects-listing.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('listing shows published projects', async ({ page }) => {
  await page.goto('/projects')
  expect(await page.locator('[data-project-card]').count()).toBeGreaterThan(0)
})

test('never shows an unpublished project', async ({ page }) => {
  await page.goto('/projects')
  await expect(page.locator('body')).not.toContainText('Unpublished Sample')
})

test('category filter narrows results and writes to the URL', async ({ page }) => {
  await page.goto('/projects')
  await page.getByRole('link', { name: /^villas$/i }).click()
  await expect(page).toHaveURL(/category=villas/)
  const cards = page.locator('[data-project-card]')
  expect(await cards.count()).toBeGreaterThan(0)
  for (const c of await cards.all()) {
    await expect(c).toHaveAttribute('data-category', 'villas')
  }
})

test('a deep-linked filter is honoured on first load', async ({ page }) => {
  await page.goto('/projects?category=apartments')
  await expect(page.getByRole('link', { name: /^apartments$/i })).toHaveAttribute('aria-current', 'true')
})

test('status filter composes with category', async ({ page }) => {
  await page.goto('/projects?category=villas&status=ongoing')
  for (const c of await page.locator('[data-project-card]').all()) {
    await expect(c).toHaveAttribute('data-status', 'ongoing')
  }
})

test('an empty combination explains itself instead of showing a blank grid', async ({ page }) => {
  await page.goto('/projects?category=developers&status=sold-out')
  const cards = await page.locator('[data-project-card]').count()
  if (cards === 0) await expect(page.getByText(/no projects/i)).toBeVisible()
})

test('cards link to their detail page', async ({ page }) => {
  await page.goto('/projects')
  await expect(page.locator('[data-project-card] a').first()).toHaveAttribute('href', /\/projects\/[a-z0-9-]+/)
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/projects-listing.spec.ts
```

Expected: FAIL — `/projects` is a 404.

- [ ] **Step 3: Implement the listing as a server component**

`app/projects/page.tsx` reads `searchParams`, validates `category` and `status` against the union types (an unknown value is ignored, not crashed on), calls `getProjects({ category, status })`, and renders `FilterBar` plus `ProjectGrid`. Filtering server-side keeps results indexable and makes deep links real pages rather than client state.

`FilterBar` renders filters as **`<Link>`s**, not buttons — so they are crawlable, middle-clickable, and work without JS. The active one carries `aria-current="true"`.

`ProjectCard` carries `data-project-card`, `data-category={category}` and `data-status={status}` for the assertions above, plus `ImageReveal`, title, `location.area`, `Pill`, `formatPrice(...)`, `unitTypes`, and one wrapping `<Link>`.

Empty state: an ivory panel reading "No projects match this combination yet" with a link back to all projects.

- [ ] **Step 4: Add the Flip layout animation**

On the client, wrap the grid so that when the route's `searchParams` change, GSAP Flip animates surviving cards to their new positions while entering cards fade and rise. Register Flip alongside ScrollTrigger in `components/motion/gsap.ts` (Flip is free). Skip entirely under reduced motion — the grid just re-renders.

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/projects-listing.spec.ts
```

Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: projects listing with crawlable URL-synced filters and Flip transitions"
```

---

### Task 14: Project detail — hero, scrollspy nav, overview, connectivity

**Files:**
- Create: `app/projects/[slug]/page.tsx`
- Create: `components/project/ProjectHero.tsx`, `Overview.tsx`, `KeyStats.tsx`, `Connectivity.tsx`
- Create: `components/layout/SectionNav.tsx`
- Create: `tests/e2e/project-detail.spec.ts`

**Interfaces:**
- Consumes: `getProject`, `getAllProjectSlugs`, `SplitWords`, `ImageReveal`, `Counter`, `Reveal`, `Pill`, `formatPrice`
- Produces: `<SectionNav sections={Array<{ id: string; label: string }>} />` — sticky, highlights the section in view

- [ ] **Step 1: Write the failing test**

`tests/e2e/project-detail.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

const SLUG = 'bkr-lakeview-enclave'   // must match a published mock project

test('detail page states name, location and price', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('[data-project-hero]')).toContainText(/Hyderabad|Ghatkesar|Kollur|Tellapur|Shamirpet|Adibatla|ECIL/)
  await expect(page.locator('[data-project-hero]')).toContainText(/₹|Price on request/)
})

test('RERA number is displayed as legally required', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  await expect(page.getByText(/RERA/i).first()).toBeVisible()
})

test('an unpublished project 404s rather than leaking', async ({ page }) => {
  const res = await page.goto('/projects/unpublished-sample')
  expect(res?.status()).toBe(404)
})

test('an unknown slug 404s', async ({ page }) => {
  const res = await page.goto('/projects/does-not-exist')
  expect(res?.status()).toBe(404)
})

test('section nav appears after the hero and jumps to sections', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  await page.mouse.wheel(0, 1200)
  const nav = page.locator('[data-section-nav]')
  await expect(nav).toBeVisible()
  await nav.getByRole('link', { name: /plans/i }).click()
  await expect.poll(async () => page.evaluate(() => window.scrollY), { timeout: 4000 }).toBeGreaterThan(1200)
})

test('section nav marks the section in view', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  await page.locator('#amenities').scrollIntoViewIfNeeded()
  await expect
    .poll(async () => page.locator('[data-section-nav] [aria-current="true"]').textContent(), { timeout: 4000 })
    .toMatch(/amenities/i)
})

test('key stats count up', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  await page.locator('[data-key-stats]').scrollIntoViewIfNeeded()
  await expect
    .poll(async () => Number((await page.locator('[data-key-stats] [data-counter]').first().textContent())?.replace(/\D/g, '')), { timeout: 5000 })
    .toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/project-detail.spec.ts
```

Expected: FAIL — route missing. Confirm `SLUG` matches a real published mock project and fix the constant if not.

- [ ] **Step 3: Implement the route**

`app/projects/[slug]/page.tsx`: `generateStaticParams()` from `getAllProjectSlugs()`; `generateMetadata()` from `project.seo` with sensible fallbacks; `notFound()` when `getProject` returns `null` — which covers unpublished projects for free, because `getProject` already filters on `isPublished`.

- [ ] **Step 4: Build hero, overview, key stats and connectivity**

- `ProjectHero` (`data-project-hero`) — full-bleed `heroImage` with navy scrim, status `Pill`, `SplitWords` h1, `location.area, city`, `formatPrice(...)`, `unitTypes`, RERA number, and a scroll cue.
- `Overview` (`#overview`, ivory) — `SplitWords` display heading, a rotated champagne vertical side label (decorative, `aria-hidden`, permitted since it is ornament), `ImageReveal`, and `overview` paragraphs through `Reveal`.
- `KeyStats` (`data-key-stats`) — `Counter`s marked `data-counter` from `project.keyStats`, `tabular-nums`.
- `Connectivity` (`#location`, navy) — the map via a lazy `<iframe title="Map of {title}">` that only loads when scrolled near, plus a staggered `place → distance` list.

- [ ] **Step 5: Build SectionNav**

Sticky below the header, appearing once the hero leaves the viewport. Renders anchor `<Link href="#id">`s — so it works without JS. Active tracking uses **`IntersectionObserver`, not ScrollTrigger**, so scrollspy still works under reduced motion; the active item gets `aria-current="true"` and an orange underline. Horizontally scrollable on mobile with hidden scrollbars, matching the reference.

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/project-detail.spec.ts
```

Expected: PASS, 7 tests. The `#amenities` and `plans` assertions depend on Task 15 — either land Task 15 first or temporarily stub empty `<section id>` anchors and re-run at the end of Task 15.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: project detail hero, overview, key stats, connectivity and scrollspy nav"
```

---

### Task 15: Project detail — plans, gallery, amenities, specifications, timeline

**Files:**
- Create: `components/project/PlansTabs.tsx`, `GallerySwiper.tsx`, `Amenities.tsx`, `Specifications.tsx`, `ConstructionTimeline.tsx`
- Create: `components/ui/Lightbox.tsx`
- Modify: `app/projects/[slug]/page.tsx`
- Create: `tests/e2e/project-sections.spec.ts`

**Interfaces:**
- Consumes: `Project`, `ImageReveal`, `Reveal`, `formatArea`
- Produces: `<Lightbox images={Img[]} index={number} onClose={() => void} />` — focus-trapped dialog with arrow-key navigation and zoom

- [ ] **Step 1: Install Swiper and write the failing test**

```bash
npm i swiper
```

`tests/e2e/project-sections.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

const SLUG = 'bkr-lakeview-enclave'

test('plans are tabbed by unit type', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#plans`)
  const tabs = page.locator('[data-plans] [role="tab"]')
  expect(await tabs.count()).toBeGreaterThan(1)
  await tabs.nth(1).click()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
})

test('a floor plan opens in a focus-trapped lightbox and Escape closes it', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#plans`)
  await page.locator('[data-plans] [data-zoom]').first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('gallery advances', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#gallery`)
  const g = page.locator('[data-gallery]')
  await g.scrollIntoViewIfNeeded()
  const first = await g.locator('.swiper-slide-active').getAttribute('data-slide')
  await g.getByRole('button', { name: /next/i }).click()
  await page.waitForTimeout(700)
  expect(await g.locator('.swiper-slide-active').getAttribute('data-slide')).not.toBe(first)
})

test('amenities are listed with accessible names', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#amenities`)
  const items = page.locator('[data-amenities] li')
  expect(await items.count()).toBeGreaterThan(3)
  await expect(items.first()).toHaveText(/\S/)
})

test('specifications accordion expands', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#specifications`)
  const first = page.locator('[data-specs] button[aria-expanded]').first()
  await first.click()
  await expect(first).toHaveAttribute('aria-expanded', 'true')
})

test('construction updates are dated newest first', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#updates`)
  const dates = await page.locator('[data-updates] time').evaluateAll((els) =>
    els.map((e) => new Date(e.getAttribute('datetime')!).getTime()),
  )
  expect(dates).toEqual([...dates].sort((a, b) => b - a))
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/project-sections.spec.ts
```

Expected: FAIL.

- [ ] **Step 3: Build the Lightbox first, since two sections depend on it**

`components/ui/Lightbox.tsx`: `role="dialog" aria-modal="true"`, focus trapped and restored to the trigger on close, `Escape` closes, `←`/`→` navigate, click-outside closes, `overflow: hidden` on `<body>` while open, and pinch/wheel zoom on the image. Mount via a portal at `z-[95]` — below the transition curtain's `z-[90]`… **and note the conflict:** the curtain must sit *above* nothing that needs interaction, so give the lightbox `z-[110]` and keep the curtain at `z-[90]`.

- [ ] **Step 4: Build the five sections**

- `PlansTabs` (`#plans`, `data-plans`, ivory) — proper `role="tablist"`/`role="tab"`/`role="tabpanel"` with arrow-key movement between tabs. Each plan shows `formatArea(area, areaUnit)` and a `[data-zoom]` trigger opening the `Lightbox`.
- `GallerySwiper` (`#gallery`, `data-gallery`, navy) — Swiper with `parallax`, `keyboard`, `a11y`, labelled prev/next buttons, `data-slide` on each slide, and click-to-open `Lightbox`.
- `Amenities` (`#amenities`, `data-amenities`, navy) — a real `<ul>` of orange line-icons plus titles, staggered by `Reveal`. Icons are `aria-hidden`; the text carries the meaning.
- `Specifications` (`#specifications`, `data-specs`, ivory) — accordion using `<button aria-expanded aria-controls>`; open the first by default.
- `ConstructionTimeline` (`#updates`, `data-updates`, ivory) — `<time datetime>` per entry, **sorted newest first**, with thumbnails opening the `Lightbox`.

- [ ] **Step 5: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/project-sections.spec.ts tests/e2e/project-detail.spec.ts
```

Expected: PASS across both files — Task 14's `#amenities` and `plans` assertions now have real targets.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: plans tabs, gallery, amenities, specifications and construction timeline"
```

---

### Task 16: Interactive masterplan

**Files:**
- Create: `components/project/MasterPlan.tsx`
- Modify: `app/projects/[slug]/page.tsx`
- Create: `tests/e2e/masterplan.spec.ts`

**Interfaces:**
- Consumes: `Project['masterPlan']`
- Produces: `<MasterPlan plan={NonNullable<Project['masterPlan']>} />`

**Signature moment 3a of 3.**

- [ ] **Step 1: Write the failing test**

`tests/e2e/masterplan.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

const SLUG = 'bkr-lakeview-enclave'   // a mock project that HAS a masterPlan

test('plots are rendered as keyboard-reachable hotspots', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#masterplan`)
  const plots = page.locator('[data-plot]')
  expect(await plots.count()).toBeGreaterThan(2)
  await expect(plots.first()).toHaveAttribute('tabindex', '0')
})

test('selecting a plot reveals its size and availability', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#masterplan`)
  await page.locator('[data-plot]').first().click()
  const panel = page.locator('[data-plot-detail]')
  await expect(panel).toBeVisible()
  await expect(panel).toContainText(/available|blocked|sold/i)
})

test('a plot is selectable by keyboard alone', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#masterplan`)
  await page.locator('[data-plot]').first().focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-plot-detail]')).toBeVisible()
})

test('zoom controls change the plan scale', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#masterplan`)
  const stage = page.locator('[data-plan-stage]')
  const scale = () => stage.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)
  const before = await scale()
  await page.getByRole('button', { name: /zoom in/i }).click()
  await page.waitForTimeout(500)
  expect(await scale()).toBeGreaterThan(before)
})

test('the section is skipped when a project has no masterplan', async ({ page }) => {
  await page.goto('/projects/bkr-skyline-residences')   // a mock project WITHOUT a masterPlan
  await expect(page.locator('[data-plan-stage]')).toHaveCount(0)
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/masterplan.spec.ts
```

Expected: FAIL. Confirm the two mock slugs are right — one with a `masterPlan`, one without — and fix the constants if not.

- [ ] **Step 3: Implement the masterplan**

`<section id="masterplan">` containing `[data-plan-stage]`, a transform-driven stage holding the plan image with an absolutely-positioned `<svg>` overlay. For each plot render `<polygon data-plot tabindex="0" role="button" aria-label="Plot {label}, {size}, {status}" points={polygon}>` filled `transparent`, stroked champagne, filling `orange/35` on hover, focus and selection.

Interaction: wheel zooms toward the cursor, drag pans, pinch zooms on touch, and explicit **"Zoom in" / "Zoom out" / "Reset"** buttons exist so the feature is not mouse-only. Clamp scale to `[1, 4]` and clamp panning to the stage bounds. Selecting a plot opens `[data-plot-detail]` with label, size, facing and a status chip; `Escape` clears the selection.

Accessibility is not optional here: hotspots are focusable with `Enter`/`Space` activation, and the plan image has real `alt` text.

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/masterplan.spec.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: interactive zoomable masterplan with keyboard-accessible plot hotspots"
```

---

### Task 17: Magnetic custom cursor

**Files:**
- Create: `components/motion/MagneticCursor.tsx`
- Modify: `app/layout.tsx`
- Create: `tests/e2e/cursor.spec.ts`

**Interfaces:**
- Consumes: `useReducedMotion`, `getGsap`
- Produces: `<MagneticCursor />` — reads `data-cursor="view" | "drag" | "zoom"` from hovered elements

**Signature moment 3b of 3.**

- [ ] **Step 1: Write the failing test**

`tests/e2e/cursor.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('cursor mounts on pointer devices', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-cursor-root]')).toHaveCount(1)
})

test('cursor never intercepts clicks', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('[data-cursor-root]').evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none')
})

test('cursor adopts the label of the element under it', async ({ page }) => {
  await page.goto('/projects')
  await page.locator('[data-project-card]').first().hover()
  await expect.poll(async () => page.locator('[data-cursor-label]').textContent(), { timeout: 2000 }).toMatch(/view/i)
})

test.describe('touch', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })
  test('no custom cursor on touch devices', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-cursor-root]')).toHaveCount(0)
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('no custom cursor', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-cursor-root]')).toHaveCount(0)
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/cursor.spec.ts
```

Expected: FAIL — no `[data-cursor-root]`.

- [ ] **Step 3: Implement the cursor**

Render nothing unless `matchMedia('(pointer: fine)').matches` **and** `!useReducedMotion()`. When active, a fixed `[data-cursor-root]` at `z-[120]` with `pointer-events: none` holds a small orange dot and a larger ring; both lerp toward the pointer via `gsap.quickTo`. On `pointerover`, walk up from `event.target` for the nearest `[data-cursor]` ancestor and, if found, scale the ring up and write its value into `[data-cursor-label]`.

Add `data-cursor="view"` to `ProjectCard`, `data-cursor="drag"` to the gallery and showcase tracks, `data-cursor="zoom"` to plan and masterplan triggers. **The native cursor is never hidden** — hiding it is what makes these features feel broken when the custom layer fails.

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/cursor.spec.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: magnetic contextual cursor for pointer devices"
```

---

### Task 18: About and Contact pages

**Files:**
- Create: `app/about/page.tsx`, `app/contact/page.tsx`
- Create: `components/ui/Field.tsx`
- Create: `tests/e2e/about-contact.spec.ts`

**Interfaces:**
- Consumes: `getSiteSettings`, `SplitWords`, `Reveal`, `Counter`, `whatsappLink`
- Produces: `<Field label name type required error?>` — labelled input with `aria-describedby` error wiring

- [ ] **Step 1: Write the failing test**

`tests/e2e/about-contact.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('about page introduces the Managing Director', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByText(/B Karthik Reddy/i)).toBeVisible()
  await expect(page.getByText(/Managing Director/i)).toBeVisible()
})

test('about page expands the three pillars', async ({ page }) => {
  await page.goto('/about')
  for (const p of ['Develop', 'Design', 'Deliver']) {
    await expect(page.getByText(new RegExp(p, 'i')).first()).toBeVisible()
  }
})

test('contact page shows the real office address and both numbers', async ({ page }) => {
  await page.goto('/contact')
  await expect(page.getByText(/Mythri Apartment/i)).toBeVisible()
  await expect(page.getByText(/ECIL/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /6301999971/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /9676669923/ })).toBeVisible()
})

test('every contact field has a real label', async ({ page }) => {
  await page.goto('/contact')
  for (const n of ['name', 'phone']) {
    await expect(page.locator(`[name="${n}"]`)).toHaveAccessibleName(/.+/)
  }
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/about-contact.spec.ts
```

Expected: FAIL — routes missing.

- [ ] **Step 3: Build both pages**

`/about` — alternating chapters: story with `SplitWords`, the three pillars expanded, a signed note from **B Karthik Reddy, Managing Director**, values, and delivery `Counter`s.

`/contact` — the enquiry form (wired in Task 21), a lazily-loaded map iframe with a real `title`, the address `Flat No. 202, Mythri Apartments, Opp. BSNL Office, ECIL, Hyderabad-62`, both numbers as `tel:` links, the email as `mailto:`, and a WhatsApp button.

`Field.tsx` — a genuine `<label for>` (never placeholder-as-label), `aria-invalid` and `aria-describedby` on error, `inputMode="tel"` and `autoComplete="tel"` for phone.

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/about-contact.spec.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: about and contact pages with accessible form fields"
```

---

# Phase 4 — Content management and leads

### Task 19: Sanity schemas and embedded Studio

**Files:**
- Create: `sanity.config.ts`, `sanity/env.ts`, `sanity/structure.ts`
- Create: `sanity/schemas/index.ts`, `project.ts`, `amenity.ts`, `siteSettings.ts`, `lead.ts`
- Create: `app/studio/[[...tool]]/page.tsx`
- Modify: `.env.example`, `next.config.ts`
- Create: `tests/unit/schemas.test.ts`

**Interfaces:**
- Consumes: `lib/data/types.ts` — schema field names must match the TypeScript interfaces exactly
- Produces: schema `name`s `project`, `amenity`, `siteSettings`, `lead`; Studio mounted at `/studio`

- [ ] **Step 1: Install Sanity**

```bash
npm i sanity next-sanity @sanity/image-url @sanity/vision styled-components
```

- [ ] **Step 2: Write the failing schema test**

Field-name drift between the schema and `lib/data/types.ts` is the likeliest silent bug in this whole build, so assert it.

`tests/unit/schemas.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { schemaTypes } from '@/sanity/schemas'

const byName = (n: string) => schemaTypes.find((s: { name: string }) => s.name === n)
const fields = (n: string) =>
  (byName(n) as { fields: Array<{ name: string }> }).fields.map((f) => f.name)

describe('project schema', () => {
  it('exists', () => expect(byName('project')).toBeTruthy())

  it('declares every field the site reads', () => {
    const f = fields('project')
    for (const name of [
      'title', 'slug', 'category', 'status', 'isPublished', 'featured', 'order',
      'tagline', 'location', 'priceFrom', 'priceUnit', 'priceOnRequest', 'unitTypes',
      'keyStats', 'overview', 'heroImage', 'gallery', 'amenities', 'floorPlans',
      'masterPlan', 'specifications', 'constructionUpdates', 'connectivity',
      'brochure', 'reraNumber', 'seo',
    ]) {
      expect(f, `missing field: ${name}`).toContain(name)
    }
  })

  it('defaults isPublished to false so nothing goes live by accident', () => {
    const f = (byName('project') as { fields: Array<{ name: string; initialValue?: unknown }> }).fields
    expect(f.find((x) => x.name === 'isPublished')?.initialValue).toBe(false)
  })

  it('offers exactly the five brand categories', () => {
    const f = (byName('project') as { fields: Array<{ name: string; options?: { list?: Array<{ value: string }> } }> }).fields
    const list = f.find((x) => x.name === 'category')?.options?.list ?? []
    expect(list.map((o) => o.value).sort()).toEqual(
      ['apartments', 'developers', 'independent-houses', 'open-plots', 'villas'],
    )
  })
})

describe('other documents', () => {
  it('defines amenity, siteSettings and lead', () => {
    for (const n of ['amenity', 'siteSettings', 'lead']) expect(byName(n)).toBeTruthy()
  })
})
```

- [ ] **Step 3: Run it and confirm it fails**

```bash
npx vitest run tests/unit/schemas.test.ts
```

Expected: FAIL — `@/sanity/schemas` not found.

- [ ] **Step 4: Write the schemas**

`project.ts` mirrors the spec's content model exactly, with these editor-experience requirements — they are what make the CMS usable by a non-technical owner:

- `isPublished` has `initialValue: false`, a description reading "Turn this on to show the project on the website. Turn it off to remove it — the project is hidden immediately, nothing is deleted.", and appears in a **Publishing** fieldset at the top.
- Every `image` field has `options: { hotspot: true }` and a **required** `alt` field, so accessibility cannot be skipped.
- `slug` auto-generates from `title` with `maxLength: 96`.
- `title`, `category`, `status`, `heroImage` and `reraNumber` are `validation: (r) => r.required()`.
- `preview` shows `title`, the media thumbnail, and a subtitle combining category, status and — critically — whether it is published.
- Fields are grouped into fieldsets: Publishing · Basics · Pricing · Media · Plans · Content · SEO. A flat list of 26 fields is unusable.

`lead.ts` is `readOnly` in the Studio apart from `status` — the owner triages leads but must not be able to corrupt captured submissions.

`siteSettings.ts` is a singleton with `__experimental_actions` limited to update/publish.

`structure.ts` builds a deliberate desk: **Projects** (grouped by published state) · **Leads** (newest first) · **Amenities** · **Site Settings**.

- [ ] **Step 5: Mount the Studio**

`sanity.config.ts` with `basePath: '/studio'`, `schemaTypes`, `structureTool({ structure })` and `visionTool()`. `app/studio/[[...tool]]/page.tsx` exports `dynamic = 'force-static'` and renders `<NextStudio config={config} />`. Add Sanity's CDN host to `next.config.ts` `images.remotePatterns`. Document every variable in `.env.example`.

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx vitest run tests/unit/schemas.test.ts && npx next build
```

Expected: PASS, 6 tests, and a clean build with the Studio route present.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Sanity schemas and embedded Studio at /studio"
```

---

### Task 20: Sanity data source and revalidation

**Files:**
- Create: `sanity/lib/client.ts`, `queries.ts`, `image.ts`
- Create: `lib/data/sanity.ts`
- Create: `app/api/revalidate/route.ts`
- Create: `tests/unit/sanity-source.test.ts`

**Interfaces:**
- Consumes: `DataSource` from `lib/data/types.ts`
- Produces: `sanitySource: DataSource`; `urlFor(source): ImageUrlBuilder`; `POST /api/revalidate`

- [ ] **Step 1: Write the failing conformance test**

The contract that matters is that both sources are interchangeable — assert it structurally, with the Sanity client mocked so no network or account is needed.

`tests/unit/sanity-source.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/sanity/lib/client', () => ({
  sanityClient: { fetch: vi.fn(async () => []) },
}))

describe('sanity source conforms to the DataSource contract', () => {
  it('implements every method the mock source does', async () => {
    const { sanitySource } = await import('@/lib/data/sanity')
    const { mockSource } = await import('@/lib/data/mock')
    for (const k of Object.keys(mockSource)) {
      expect(typeof (sanitySource as Record<string, unknown>)[k], `missing: ${k}`).toBe('function')
    }
  })

  it('every project query filters on isPublished', async () => {
    const q = await import('@/sanity/lib/queries')
    const projectQueries = Object.entries(q).filter(
      ([name, v]) => typeof v === 'string' && /_type\s*==\s*["']project["']/.test(v as string) && name !== 'allSlugsIncludingDrafts',
    )
    expect(projectQueries.length).toBeGreaterThan(0)
    for (const [name, query] of projectQueries) {
      expect(query as string, `${name} must filter isPublished`).toMatch(/isPublished\s*==\s*true/)
    }
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx vitest run tests/unit/sanity-source.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Write the client, queries and image helper**

`client.ts` — `createClient({ projectId, dataset, apiVersion: '2026-01-01', useCdn: true })` reading from `sanity/env.ts`.

`queries.ts` — GROQ constants. Every project query includes `&& isPublished == true`, and every image projection includes `"lqip": asset->metadata.lqip` so blur placeholders are real rather than generated. Example:

```ts
export const projectsQuery = /* groq */ `
  *[_type == "project" && isPublished == true
    && (!defined($category) || category == $category)
    && (!defined($status)   || status   == $status)
  ] | order(order asc) {
    _id, title, "slug": slug.current, tagline, category, status,
    isPublished, featured, order,
    location { area, city },
    priceFrom, priceUnit, priceOnRequest, unitTypes,
    heroImage { "url": asset->url, alt, "lqip": asset->metadata.lqip }
  }
`
```

`image.ts` — `urlFor()` via `@sanity/image-url`, honouring hotspot and crop.

- [ ] **Step 4: Implement the source and map documents to the shared types**

`lib/data/sanity.ts` exports `sanitySource: DataSource`, mapping `_id → id` and Portable Text `overview` to `string[]` so both sources return the same shape. Wrap each call in a `try/catch` that logs and returns an empty result — a Sanity outage should degrade the page, not crash the site.

- [ ] **Step 5: Implement revalidation**

`app/api/revalidate/route.ts` — verify Sanity's signature with `parseBody` from `next-sanity/webhook` and `SANITY_REVALIDATE_SECRET`, then `revalidateTag('project')` and `revalidateTag('settings')`. Tag the fetches in `sanity.ts` accordingly.

Then apply the spec's local-only caveat: set `export const revalidate = 30` on `/`, `/projects` and `/projects/[slug]`, so edits surface within ~30 s locally where no webhook can reach us. Deploying later needs only the webhook URL registered in Sanity — no code change.

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx vitest run tests/unit/sanity-source.test.ts && npx vitest run && npx next build
```

Expected: PASS. The whole unit suite must still pass — `activeSource()` returns `mock` with no env vars, so every earlier test is unaffected.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Sanity data source with publish-gated queries and tag revalidation"
```

---

### Task 21: Lead capture — forms, API, email, WhatsApp

**Files:**
- Create: `app/api/lead/route.ts`
- Create: `components/project/EnquiryForm.tsx`, `BrochureGate.tsx`
- Modify: `app/contact/page.tsx`, `app/projects/[slug]/page.tsx`
- Create: `tests/unit/lead-validation.test.ts`, `tests/e2e/lead.spec.ts`

**Interfaces:**
- Consumes: `LeadInput`, `whatsappLink`, `Field`, `Button`
- Produces: `POST /api/lead` accepting `LeadInput`, returning `{ ok: true }` or `{ ok: false, errors: Record<string,string> }`; `validateLead(input: unknown): { ok: true; value: LeadInput } | { ok: false; errors: Record<string,string> }`

- [ ] **Step 1: Write the failing validation test**

`tests/unit/lead-validation.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { validateLead } from '@/app/api/lead/validate'

const ok = { name: 'Karthik', phone: '+91 6301999971', source: 'enquiry' }

describe('validateLead', () => {
  it('accepts a valid Indian mobile number', () => {
    expect(validateLead(ok).ok).toBe(true)
  })

  it('accepts a bare 10-digit Indian mobile', () => {
    expect(validateLead({ ...ok, phone: '9676669923' }).ok).toBe(true)
  })

  it('rejects a too-short number', () => {
    const r = validateLead({ ...ok, phone: '12345' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.phone).toBeTruthy()
  })

  it('rejects an Indian mobile starting below 6', () => {
    expect(validateLead({ ...ok, phone: '1234567890' }).ok).toBe(false)
  })

  it('requires a name', () => {
    const r = validateLead({ ...ok, name: '  ' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.name).toBeTruthy()
  })

  it('rejects an unknown source', () => {
    expect(validateLead({ ...ok, source: 'spam' }).ok).toBe(false)
  })

  it('accepts an optional valid email but rejects a malformed one', () => {
    expect(validateLead({ ...ok, email: 'a@b.co' }).ok).toBe(true)
    expect(validateLead({ ...ok, email: 'not-an-email' }).ok).toBe(false)
  })

  it('normalises the phone to digits for storage', () => {
    const r = validateLead(ok)
    if (r.ok) expect(r.value.phone).toBe('916301999971')
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx vitest run tests/unit/lead-validation.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement validation as its own module**

`app/api/lead/validate.ts` — hand-rolled, no schema library needed. Indian mobile rule: strip non-digits; accept 10 digits starting `[6-9]`, or 12 digits starting `91` followed by `[6-9]`; normalise to the 12-digit form. Trim and length-cap `name` and `message`. `source` must be one of the three literals.

- [ ] **Step 4: Write the failing E2E test**

`tests/e2e/lead.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('rejects a bad phone number inline without navigating', async ({ page }) => {
  await page.goto('/contact')
  await page.locator('[name="name"]').fill('Karthik')
  await page.locator('[name="phone"]').fill('123')
  await page.getByRole('button', { name: /send|submit|enquire/i }).click()
  await expect(page.getByText(/valid.*(phone|mobile)/i)).toBeVisible()
  await expect(page).toHaveURL(/\/contact/)
})

test('accepts a valid enquiry and confirms it', async ({ page }) => {
  await page.route('**/api/lead', (r) => r.fulfill({ status: 200, json: { ok: true } }))
  await page.goto('/contact')
  await page.locator('[name="name"]').fill('Karthik')
  await page.locator('[name="phone"]').fill('6301999971')
  await page.getByRole('button', { name: /send|submit|enquire/i }).click()
  await expect(page.getByRole('status')).toContainText(/thank|received|touch/i)
})

test('brochure download is gated behind the form', async ({ page }) => {
  await page.goto('/projects/bkr-lakeview-enclave#brochure')
  await expect(page.getByRole('button', { name: /brochure/i })).toBeVisible()
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0)
})
```

- [ ] **Step 5: Implement the route and the forms**

`app/api/lead/route.ts` — `POST` only: validate; on failure return `400` with field errors; on success write a `lead` document with a **server-side** `SANITY_API_WRITE_TOKEN` (never `NEXT_PUBLIC_`) and, if `RESEND_API_KEY` is set, email `LEAD_NOTIFY_EMAIL`. **Email is optional** — a missing key logs a warning and still returns `{ ok: true }`, so local development works and a mail outage never loses a lead. Add simple in-memory rate limiting keyed by IP.

If `activeSource() === 'mock'` there is no Sanity to write to: log the lead to the server console and return `{ ok: true }`, so the form is fully testable before Sanity exists.

`EnquiryForm.tsx` — client component, validates with the same `validateLead` before POSTing, renders errors through `Field`, announces success in an `aria-live` `role="status"` region, disables the submit button while in flight, and offers a WhatsApp button prefilled with the project name.

`BrochureGate.tsx` — the PDF URL is **never** in the markup; it arrives in the successful response and only then triggers the download.

- [ ] **Step 6: Run the tests and confirm they pass**

```bash
npx vitest run tests/unit/lead-validation.test.ts && npx playwright test tests/e2e/lead.spec.ts
```

Expected: PASS, 8 unit + 3 E2E.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: lead capture with validated forms, Sanity storage, optional email and WhatsApp"
```

---

### Task 22: Owner guide

**Files:**
- Create: `docs/OWNER-GUIDE.md`
- Create: `README.md`

- [ ] **Step 1: Write the owner guide for someone who has never used a CMS**

`docs/OWNER-GUIDE.md`, in plain language, no jargon, with the exact button names as they appear in the Studio:

1. **Signing in** — go to `/studio`, sign in.
2. **Adding a project** — Projects → Create → walk the fieldsets in order (Publishing, Basics, Pricing, Media, Plans, Content, SEO) → drag photos in → **turn Published on** → Publish.
3. **Removing a project from the website** — open it, **turn Published off**, Publish. State plainly: it disappears from the site immediately and nothing is deleted, so it can be brought back at any time.
4. **Reordering featured projects** — the `Order` number; lower shows first.
5. **Reading enquiries** — Leads, newest first; mark each `contacted` or `closed`.
6. **Changing phone numbers, address or the announcement bar** — Site Settings.
7. **How long changes take** — seconds when deployed; up to about 30 seconds locally. Explain why, in one sentence.
8. **Photo guidance** — landscape, at least 2000px wide, under 1MB where possible; always fill in the "Alt text" box and what it is for.
9. **Replacing the placeholders** — an explicit list of every placeholder image and dummy statistic shipped in the site, and where to change each.

- [ ] **Step 2: Write the developer README**

Setup, `.env.local` variables, `npm run dev` / `build` / `test` / `test:e2e`, the mock-vs-Sanity switch and how to flip it, and how to deploy later (including registering the revalidate webhook).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: owner guide for CMS editing and developer README"
```

---

# Phase 5 — Polish and verification

### Task 23: SEO, metadata, structured data

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx`, `app/opengraph-image.tsx`
- Modify: `app/layout.tsx`, `app/projects/[slug]/page.tsx`
- Create: `tests/e2e/seo.spec.ts`

- [ ] **Step 1: Write the failing test**

`tests/e2e/seo.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('every route has a unique, non-empty title', async ({ page }) => {
  const titles: string[] = []
  for (const r of ['/', '/projects', '/about', '/contact', '/projects/bkr-lakeview-enclave']) {
    await page.goto(r)
    const t = await page.title()
    expect(t.length).toBeGreaterThan(10)
    titles.push(t)
  }
  expect(new Set(titles).size).toBe(titles.length)
})

test('project pages emit valid Residence/Place structured data', async ({ page }) => {
  await page.goto('/projects/bkr-lakeview-enclave')
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent()
  const json = JSON.parse(raw!)
  expect(json['@context']).toBe('https://schema.org')
  expect(json.name).toBeTruthy()
})

test('sitemap lists published projects only', async ({ page }) => {
  const xml = await (await page.request.get('/sitemap.xml')).text()
  expect(xml).toContain('/projects/bkr-lakeview-enclave')
  expect(xml).not.toContain('unpublished-sample')
  expect(xml).not.toContain('/motion-lab')
})

test('robots.txt keeps the Studio and motion lab out of the index', async ({ page }) => {
  const txt = await (await page.request.get('/robots.txt')).text()
  expect(txt).toMatch(/Disallow: \/studio/)
  expect(txt).toMatch(/Disallow: \/motion-lab/)
})

test('404 page offers a way back', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByRole('link', { name: /home|projects/i }).first()).toBeVisible()
})
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx playwright test tests/e2e/seo.spec.ts
```

Expected: FAIL — no sitemap.

- [ ] **Step 3: Implement**

`sitemap.ts` from `getAllProjectSlugs()` plus the static routes — unpublished projects are excluded for free, since the helper already filters. `robots.ts` disallows `/studio` and `/motion-lab`. `generateMetadata` on project pages uses `seo` with title/description/OG fallbacks. Add a `RealEstateListing`/`Residence` JSON-LD block per project and `Organization` + `LocalBusiness` on the home page, carrying the real address and both phone numbers. A branded `opengraph-image.tsx` renders the logo lockup on navy.

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
npx playwright test tests/e2e/seo.spec.ts
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: metadata, sitemap, robots, JSON-LD and branded OG image"
```

---

### Task 24: Accessibility audit

**Files:**
- Create: `tests/e2e/a11y.spec.ts`
- Modify: whichever components the audit implicates

- [ ] **Step 1: Install axe and write the failing test**

```bash
npm i -D @axe-core/playwright
```

`tests/e2e/a11y.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'

const ROUTES = ['/', '/projects', '/projects/bkr-lakeview-enclave', '/about', '/contact']

for (const route of ROUTES) {
  test(`${route} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(route)
    await page.waitForTimeout(2500)   // let reveals finish so nothing is measured mid-animation
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(bad.map((v) => `${v.id} @ ${v.nodes[0]?.target}`)).toEqual([])
  })
}

test('keyboard alone can reach the menu, a project and the enquiry form', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')   // skip link first
  await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused()
})

test('images carry alt text', async ({ page }) => {
  await page.goto('/projects/bkr-lakeview-enclave')
  const missing = await page.locator('img:not([alt])').count()
  expect(missing).toBe(0)
})
```

- [ ] **Step 2: Run it and fix what it reports**

```bash
npx playwright test tests/e2e/a11y.spec.ts
```

Expect real failures on the first run. The likely ones, and their fixes:

- **Contrast** — orange text on ivory below 24px. Per Global Constraints this is a genuine violation: recolour to `navy-800`, or enlarge it. Do not silence the rule.
- The lightbox, mega-menu and masterplan panel missing `aria-modal`, labels, or focus restoration.
- The `iframe` map missing `title`.
- Swiper's generated controls missing accessible names.

- [ ] **Step 3: Re-run until clean, then commit**

```bash
npx playwright test tests/e2e/a11y.spec.ts
git add -A
git commit -m "fix: resolve serious and critical accessibility violations across all routes"
```

---

### Task 25: Performance pass

**Files:**
- Modify: image-heavy and motion-heavy components
- Create: `tests/e2e/performance.spec.ts`

- [ ] **Step 1: Write the failing budget test**

`tests/e2e/performance.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('home page LCP stays under 2.5s', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' })
  const lcp = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        new PerformanceObserver((l) => {
          const e = l.getEntries()
          resolve(e[e.length - 1].startTime)
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        setTimeout(() => resolve(99999), 6000)
      }),
  )
  expect(lcp).toBeLessThan(2500)
})

test('layout shift stays under 0.05', async ({ page }) => {
  await page.goto('/')
  await page.mouse.wheel(0, 3000)
  await page.waitForTimeout(2500)
  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
            if (!e.hadRecentInput) total += e.value
          }
        }).observe({ type: 'layout-shift', buffered: true })
        setTimeout(() => resolve(total), 1200)
      }),
  )
  expect(cls).toBeLessThan(0.05)
})

test('no console errors on any route', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  for (const r of ['/', '/projects', '/projects/bkr-lakeview-enclave', '/about', '/contact']) {
    await page.goto(r)
    await page.waitForTimeout(1500)
  }
  expect(errors).toEqual([])
})
```

- [ ] **Step 2: Run against a production build, not dev**

Dev-mode numbers are meaningless here.

```bash
npx next build && npx next start &
npx playwright test tests/e2e/performance.spec.ts
```

- [ ] **Step 3: Fix what misses budget**

In order of likely impact: give every `next/image` a correct `sizes` (a wrong `sizes` is the usual LCP culprit); `priority` on the hero image only; reserve aspect ratios on every image container so reveals cannot shift layout; `content-visibility: auto` with `contain-intrinsic-size` on below-fold sections; confirm GSAP, Lenis and Swiper are absent from the initial JS via `ANALYZE=true`; drop the ken-burns to `transform` only.

- [ ] **Step 4: Run Lighthouse and record the numbers**

```bash
npx lighthouse http://localhost:3000 --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lighthouse-home.json
```

Performance ≥ 90 and accessibility ≥ 95 per Global Constraints. If performance falls short, the honest lever is fewer simultaneous scroll-linked animations per viewport — reduce them rather than reporting a miss as a pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "perf: meet LCP, CLS and Lighthouse budgets"
```

---

### Task 26: Placeholder imagery and final review

**Files:**
- Create: `public/placeholder/*.jpg`, `public/placeholder/CREDITS.md`
- Modify: `lib/data/mock.ts`
- Create: `tests/e2e/full-journey.spec.ts`

- [ ] **Step 1: Curate placeholder photography**

Download roughly 20 architecture, interior, plot and amenity photographs from Unsplash — whose licence permits commercial use — into `public/placeholder/`, sized to about 2400px wide and compressed under ~400KB each. Record every source URL and photographer in `public/placeholder/CREDITS.md`. Committing them means the site renders identically offline afterwards. Verify each filename referenced by `lib/data/mock.ts` exists.

- [ ] **Step 2: Write the full-journey test**

`tests/e2e/full-journey.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('a buyer can go from the home page to an enquiry', async ({ page }) => {
  await page.route('**/api/lead', (r) => r.fulfill({ status: 200, json: { ok: true } }))

  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()

  await page.getByRole('link', { name: /view projects/i }).click()
  await expect(page).toHaveURL(/\/projects/)

  await page.locator('[data-project-card] a').first().click()
  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+/)
  await expect(page.getByText(/RERA/i).first()).toBeVisible()

  await page.locator('[name="name"]').first().fill('Test Buyer')
  await page.locator('[name="phone"]').first().fill('6301999971')
  await page.getByRole('button', { name: /send|submit|enquire/i }).first().click()
  await expect(page.getByRole('status')).toContainText(/thank|received|touch/i)
})

test('no placeholder image 404s', async ({ page }) => {
  const failed: string[] = []
  page.on('response', (r) => { if (r.status() === 404 && /\.(jpg|jpeg|png|webp|avif)/i.test(r.url())) failed.push(r.url()) })
  for (const r of ['/', '/projects', '/projects/bkr-lakeview-enclave', '/about']) {
    await page.goto(r)
    await page.mouse.wheel(0, 4000)
    await page.waitForTimeout(1500)
  }
  expect(failed).toEqual([])
})
```

- [ ] **Step 3: Run the entire suite**

```bash
npx tsc --noEmit && npx vitest run && npx next build && npx playwright test
```

Everything must pass. A failure here is a real regression from an earlier task — fix the code, not the test.

- [ ] **Step 4: Review at every breakpoint**

Walk all five routes at 375px, 768px, 1440px and 1920px. Check specifically: the hero fills the screen without clipping on mobile, the horizontal showcase falls back to snap-scroll on touch, the section nav scrolls horizontally rather than wrapping, the display type does not overflow at 375px, and no section boundary breaks the ivory/navy alternation.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: curated placeholder imagery and end-to-end journey coverage"
```

---

## Self-Review

**Spec coverage.** Each spec section maps to tasks: §2.1–2.2 colour and contrast → Task 1; §2.3 typography → Task 1; §2.4 logo → Task 6; §3.1 stack → Tasks 1, 3, 19; §3.2 mock fallback → Task 2; §3.3 routes → Tasks 10–21, 23; §3.4 boundaries → File Structure; §4 content model → Tasks 2, 19; §5.1–5.2 motion foundation and primitives → Tasks 3–5; §5.3 signature moments → Tasks 9, 11, 16, 17; §5.4 performance → Task 25; §6 page designs → Tasks 10–18; §7 owner workflow → Tasks 19–22; §8 placeholders → Task 26; §9 verification → Tasks 24–26; §10 risks → mitigations carried in Tasks 2, 6, 11, 17, 25.

**Placeholder scan.** No "TBD" or "handle edge cases" steps. Two steps are deliberate judgement gates rather than mechanical instructions — Task 1 Step 8 (does the `wdth` axis render?) and Task 6 Step 5 (is the logo trace faithful?) — and each states its decision criterion and its fallback, as the spec's risk table requires.

**Type consistency.** `DataSource` method names in Task 2 are reused verbatim in Tasks 13–20. `validateLead` has one signature, shared by Task 21's route and its forms. Schema field names are asserted against `lib/data/types.ts` in Task 19 Step 2, which is what stops drift. `getGsap()` is the single GSAP entry point in Tasks 3–5, 9, 11, 13, 17. Test slug constants (`bkr-lakeview-enclave`, `bkr-skyline-residences`, `unpublished-sample`) must exist in `lib/data/mock.ts` from Task 2 — Task 14 Step 2 and Task 16 Step 2 both say to verify and fix them.

**Known cross-task couplings**, called out so they are not surprises:
- Task 14's `#amenities` and `plans` assertions need Task 15's sections; Task 14 Step 6 says to stub the anchors or land Task 15 first.
- Task 15's `Lightbox` at `z-[110]` must sit above Task 9's curtain at `z-[90]` and below Task 17's cursor at `z-[120]`.
- Task 20 must not break Tasks 2–18: with no Sanity env vars, `activeSource()` stays `mock`.
