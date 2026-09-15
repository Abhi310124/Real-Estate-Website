# BKR INFRA — Website Design Spec

**Date:** 2026-09-15
**Status:** Approved for planning
**Client:** BKR INFRA, Hyderabad. B Karthik Reddy, Managing Director.

---

## 1. Context

BKR INFRA is a Hyderabad real estate developer with no web presence. The brand
identity exists (logo, business card, letterhead) but nothing digital. The
business needs a site that does two jobs:

1. **Win trust and generate enquiries** from property buyers who are comparing
   BKR against far larger developers (My Home, Aparna, Rajapushpa).
2. **Stay current without a developer.** The owner must add, edit, hide and
   remove projects himself — no code, no deploy, no phone call to us.

The stated bar is "best looking, best animated real estate website in India."

### What the competitive research found

We inspected the reference site and three national benchmarks:

| Site | Stack | Motion |
|---|---|---|
| **myhomeconstructions.com** (reference) | Next.js + Tailwind | Lenis smooth scroll, GSAP, word-masked heading reveals, Swiper |
| lodhagroup.in | Custom | AOS (basic fade-in), Swiper, video hero |
| oberoirealty.com | Custom | animate.css / wow.js `fadeIn` |
| total-environment.com | Custom | Hand-rolled `animate-height` / `big-counter` |

**The headline finding: the bar is low.** Two of India's three largest luxury
developers animate with libraries from ~2015. The reference site is the most
advanced of the four, and its entire motion vocabulary is: Lenis + GSAP
word-masked reveals + Swiper. Beating it is a matter of execution, not
invention — so the goal is genuinely achievable rather than aspirational.

Confirmed reference implementation details worth reusing:

- Every heading is split per-word into `<span style="overflow:hidden">` with an
  inner span at `transform: translate(0%, 110%)` that animates to `0%`.
- `<html class="lenis lenis-smooth">` — Lenis with default smoothing.
- Sticky in-page scrollspy nav (OVERVIEW · LOCATION · PLANS · GALLERY ·
  SPECIFICATIONS · CONSTRUCTION UPDATES) with an accent underline.
- Floating right-edge action rail (call, chat) plus a sticky "Download
  Brochure" pill.
- Display type runs to `5vw`; sections are separated by dark bands.

### Decisions taken with the client

| Question | Decision |
|---|---|
| Owner content editing | Sanity Studio embedded at `/studio` |
| Page set | Full developer site — Home, Projects, Project detail, About, Contact |
| Real content available | None yet; build with placeholders, owner fills in via CMS |
| Lead destination | Email + WhatsApp + stored in Studio |
| Typography | Architectural sans (not the serif everyone else uses) |
| Palette deployment | Alternating ivory / navy chapters |
| Animation scope | Core motion system **plus all three signature moments** |
| Hosting | Local only for now; deploy decision deferred |

---

## 2. Brand foundation

### 2.1 Colour, extracted from the supplied artwork

Sampled directly from the logo PNGs (pure-Python PNG decode, dominant
non-grey clusters):

| Token | Hex | Source | Use |
|---|---|---|---|
| `navy-900` | `#071628` | logo mark darkest cluster | deepest wells, footer |
| `navy-800` | `#0A1A2F` | business-card reverse | **primary dark canvas** |
| `navy-700` | `#16233A` | logo wordmark | raised surfaces on navy |
| `navy-600` | `#1D2733` | letterhead navy | borders, muted dark |
| `ivory` | `#F7F4EE` | letterhead ground | **primary light canvas** |
| `ivory-warm` | `#FBF9F5` | — | cards on ivory |
| `orange` | `#FF4907` | logo triangle + rules | **brand accent** |
| `orange-600` | `#E63F05` | — | hover / pressed |
| `champagne` | `#C9A227` | letterhead gold curves | hairlines, decorative rules |

### 2.2 Contrast constraints — these are hard rules

Computed WCAG ratios, not estimates:

| Pair | Ratio | Verdict |
|---|---|---|
| `navy-800` on `ivory` | **15.9:1** | body text ✓ |
| `#FFF` on `navy-800` | **17.5:1** | body text ✓ |
| `orange` on `navy-800` | **5.16:1** | body text ✓ AA |
| `orange` on `ivory` | **3.08:1** | ✗ fails AA for body text |
| `champagne` on `navy-800` | **7.2:1** | text ✓ |
| `champagne` on `ivory` | **2.20:1** | ✗ fails all text |

Therefore:

- **Orange on ivory** is permitted only for display type ≥ 24px, rules, icons,
  and filled buttons with white labels. Never body copy, never small labels.
- **Champagne on ivory** is decorative only — hairlines and ornament. Never text.
- Orange as a *background* always carries `#FFFFFF` text.

### 2.3 Typography

One variable family carries the display voice. `Archivo` ships a width axis
(`wdth`) alongside weight, so the expanded display cut and the normal-width UI
cut come from the same file.

| Role | Family | Treatment |
|---|---|---|
| Display | Archivo variable, `wght 800`, `wdth 118` | UPPERCASE, tracking `-0.02em`, leading `0.92` |
| Eyebrow | Archivo, `wght 600`, `wdth 100` | UPPERCASE, 11–12px, tracking `+0.32em` |
| Body / UI | Inter variable | 400/500/600, leading 1.7–1.75 |
| Numerals | Inter, `tabular-nums` | stats, prices, counters |

If the `wdth` axis proves unavailable through the chosen font loader, fall back
to the separately-published `Archivo Expanded` family for display only.

Fluid scale:

```
display-xl   clamp(3.25rem, 9vw,   7.5rem)   hero h1
display-lg   clamp(2.5rem,  6vw,   5.5rem)   section h2
display-md   clamp(1.75rem, 3.2vw, 3rem)     h3
body-lg      1.0625rem / 1.75                 lead paragraphs
body         1rem / 1.7                       default
caption      0.8125rem / 1.6                  meta, captions
```

### 2.4 Logo handling

The supplied files are raster (JPEG/PNG) on solid backgrounds. We need a
**vector rebuild** because:

- navy-on-ivory and white-on-navy variants are both required,
- the first-load intro animates the mark's outline with `stroke-dashoffset`,
- raster logos look soft on retina and cannot be recoloured.

The wordmark is geometric — chamfered `B`, an angular `K` whose upper counter is
an orange triangle, a straight-legged `R` — so it traces cleanly to paths.

*Risk:* hand-tracing a logo is fiddly and easy to get subtly wrong.
*Mitigation:* if the traced wordmark does not match the artwork convincingly,
ship the supplied PNG for static placements and use a simplified vector
monogram for the intro animation only. Decide by visual diff against the
supplied artwork, not by feel.

---

## 3. Architecture

### 3.1 Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript strict | matches reference; SSG/ISR for SEO; `next/image` |
| Styling | Tailwind CSS + CSS custom properties for brand tokens | reference uses Tailwind; tokens keep colour rules in one place |
| Content | Sanity + embedded Studio at `/studio` | hosted, free tier fits (20 seats, 100 GB assets, 100 GB bandwidth, free Studio hosting), best-in-class image CDN with hotspot/crop |
| Smooth scroll | Lenis | what the reference uses; pairs cleanly with ScrollTrigger |
| Animation | GSAP 3 + ScrollTrigger | free plugins only; no paid Club dependency |
| Carousels | Swiper | reference-proven, accessible, touch-native |
| Email | Resend | simple API; optional so local dev runs without a key |

**No paid GSAP plugins.** Word splitting is ~15 lines of our own code, which
also gives us control over markup and accessibility.

### 3.2 Data access layer — the de-risking decision

Sanity requires an account and a created project before any content exists. To
avoid a blocked build, all reads go through one module:

```
lib/data/index.ts     → getProjects(), getProject(slug), getSiteSettings(), ...
lib/data/sanity.ts    → real implementation
lib/data/mock.ts      → typed fixture data, ~6 sample projects
```

`lib/data/index.ts` selects `sanity.ts` when `NEXT_PUBLIC_SANITY_PROJECT_ID` is
set, otherwise `mock.ts`. Consequences:

- The full site runs and looks finished on first `npm run dev`, before any
  Sanity signup.
- Every page and animation is built and reviewed against realistic data.
- Wiring Sanity later is an env-var change, not a refactor.
- Both implementations satisfy the same TypeScript interface, so drift is a
  compile error.

### 3.3 Route map

```
app/
  layout.tsx                    fonts, Lenis + transition providers, skip-link
  page.tsx                      Home
  projects/page.tsx             listing, filters synced to URL
  projects/[slug]/page.tsx      project detail — the centrepiece
  about/page.tsx
  contact/page.tsx
  studio/[[...tool]]/page.tsx   embedded Sanity Studio
  api/lead/route.ts             POST → Sanity lead doc + email
  api/revalidate/route.ts       Sanity webhook → revalidateTag
  sitemap.ts  robots.ts  not-found.tsx
```

### 3.4 Component boundaries

Each folder has one reason to exist; motion primitives never import page code.

```
components/
  motion/    LenisProvider, SplitWords, Reveal, ImageReveal, Parallax,
             Counter, Marquee, PageTransition, MagneticCursor, useReducedMotion
  layout/    Header, MegaMenu, Footer, SectionNav, FloatingActions, AnnouncementBar
  brand/     Logo (inline SVG, animatable), LogoMark
  home/      Hero, PillarsStrip, HorizontalShowcase, CategoryGrid, StatsBand, CtaBand
  project/   ProjectHero, Overview, KeyStats, Connectivity, PlansTabs, MasterPlan,
             GallerySwiper, Amenities, Specifications, ConstructionTimeline,
             BrochureGate, EnquiryForm
  projects/  FilterBar, ProjectCard, ProjectGrid
  ui/        Button, Field, Lightbox, Pill, Rule, Eyebrow
sanity/
  schemas/  lib/client.ts  lib/queries.ts  lib/image.ts  structure.ts  env.ts
```

---

## 4. Content model

`isPublished` is the owner's show/hide switch — the mechanism behind "remove a
site without touching code." Every query filters on it.

### `project`

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `slug` | slug | auto from title |
| `category` | string | `open-plots` \| `villas` \| `apartments` \| `independent-houses` \| `developers` |
| `status` | string | `upcoming` \| `ongoing` \| `completed` \| `sold-out` |
| `isPublished` | boolean | **default false** — the show/hide switch |
| `featured` | boolean | pins into the homepage horizontal showcase |
| `order` | number | manual sort |
| `tagline` | string | hero line, e.g. "A skyline of your own" |
| `location` | object | `area`, `city`, `mapEmbedUrl`, `lat`, `lng` |
| `priceFrom` / `priceUnit` / `priceOnRequest` | number / string / boolean | Lakh or Cr |
| `unitTypes` | string[] | "2 BHK", "200 sq.yd" |
| `keyStats` | array | `{ label, value, suffix }` → animated counters |
| `overview` | portable text | rich body copy |
| `heroImage` | image (hotspot) | required, with `alt` |
| `heroVideo` | url | optional, upgrade path from stills |
| `gallery` | array of image | `alt`, `caption` |
| `amenities` | array | reference to `amenity` |
| `floorPlans` | array | `{ title, unitType, area, areaUnit, image }` |
| `masterPlan` | object | `image` + `plots[] { label, size, facing, status, polygon }` |
| `specifications` | array | `{ category, items[] }` |
| `constructionUpdates` | array | `{ date, title, images[], note }` |
| `brochure` | file | PDF, gated behind a short form |
| `reraNumber` | string | legally required on Indian property marketing |
| `seo` | object | `metaTitle`, `metaDescription`, `ogImage` |

### `amenity`
`title`, `icon` (key into our line-icon set), `category`.

### `siteSettings` (singleton)
`logo`, `logoLight`, `tagline`, `phones[]`, `whatsappNumber`, `email`,
`address`, `socials[]`, `pillars[]` (DEVELOP / DESIGN / DELIVER),
`footerBlurb`, `announcementBar { enabled, text, link }`, `reraDisclaimer`.

### `lead`
`name`, `phone`, `email`, `message`, `project` (ref), `source`
(`enquiry` \| `site-visit` \| `brochure`), `status` (`new` \| `contacted` \|
`closed`), `createdAt`. Written server-side with a write token; never exposed
to the browser.

---

## 5. Motion system

### 5.1 Foundation

- **Lenis** `lerp: 0.09`, mounted in a client provider. Bridged to ScrollTrigger
  by `lenis.on('scroll', ScrollTrigger.update)` and driving `lenis.raf` from
  `gsap.ticker`.
- **One reduced-motion gate.** `useReducedMotion()` is read by every primitive.
  When set: Lenis is not initialised (native scroll), and every reveal mounts at
  its final state. Content is *never* hidden behind an animation that will not
  run — this is a correctness requirement, not a nicety.

### 5.2 Primitives

| Primitive | Behaviour |
|---|---|
| `SplitWords` | per-word `<span overflow:hidden>` + inner `yPercent 110 → 0`, `stagger 0.055`, `expo.out`, `1.1s`, trigger `top 82%`, once. Text stays in the DOM as text for screen readers and copy-paste. |
| `Reveal` | `y 28 → 0`, `opacity 0 → 1`, `0.9s`, `power3.out` |
| `ImageReveal` | `clip-path inset(0 0 100% 0) → inset(0 0 0 0)` with inner `scale 1.12 → 1`, `1.4s`, `expo.out` |
| `Parallax` | ScrollTrigger `scrub` on `yPercent`, configurable speed |
| `Counter` | count-up on enter, `tabular-nums` so digits do not jitter |
| `Marquee` | seamless infinite ticker, pauses on hover and when off-screen |

### 5.3 Signature moments

**Pinned horizontal showcase (home).** Featured projects pin to the viewport
and translate an x-track as the user scrolls down. Cards ease in scale and
rotation as they cross centre. Mobile falls back to native scroll-snap with no
pin — pinning on touch devices fights the browser and feels broken.

**Cinematic page transitions.** A transition provider intercepts internal
navigation: a navy curtain wipes up carrying the BKR mark, the route changes
behind it, the curtain wipes away. On first load only (guarded by
`sessionStorage`), the logo outline draws itself via `stroke-dashoffset` before
the curtain lifts. Navigation must remain usable if JS fails — links are real
`<Link>` elements and the curtain is progressive enhancement.

**Interactive masterplan + magnetic cursor.** The masterplan image sits in a
zoom/pan container (wheel, drag, pinch) with SVG polygon hotspots from
`masterPlan.plots[]`; hover tints a plot orange, click opens a detail panel with
size, facing and availability. Alongside it, a custom cursor — a lerping dot and
ring that morphs into a contextual label (`VIEW`, `DRAG`, `ZOOM`) driven by a
`data-cursor` attribute. Both are disabled on touch devices and under
reduced-motion.

### 5.4 Performance guardrails

Animation that makes the site slow is a net loss, so these are budgets, not aims:

- Animate only `transform`, `opacity`, `clip-path`. `will-change` is applied on
  trigger and removed on completion.
- GSAP, Lenis and Swiper load only inside client components, dynamically.
- All imagery through `next/image` with Sanity CDN transforms, correct `sizes`,
  and LQIP blur placeholders.
- `content-visibility: auto` on heavy below-fold sections.
- **Targets: LCP < 2.5 s, CLS < 0.05, Lighthouse performance ≥ 90 on desktop.**

---

## 6. Page designs

### Home
1. **Hero** — full-bleed image, 20 s ken-burns, navy scrim, eyebrow
   "REDEFINING REAL ESTATE EXCELLENCE", word-masked h1, orange rule, dual CTA,
   scroll cue; foreground and background parallax at different speeds.
2. **Pillars** (navy) — DEVELOP / DESIGN / DELIVER with orange circle icons,
   plus a marquee of the five categories.
3. **Featured projects** — pinned horizontal showcase.
4. **Categories** (ivory) — five cards with image clip reveals.
5. **Stats** (navy) — animated counters.
6. **Why BKR** (ivory) — editorial two-column with champagne hairlines.
7. **CTA** (navy) — enquiry invitation.
8. **Footer** (navy-900) — address, both phone numbers, socials, RERA note.

### Projects listing
Ivory throughout. Filter bar for category and status, with GSAP Flip animating
the grid between filter states. Filters write to the URL (`?category=villas`)
so results are shareable and indexable. Cards reveal by clip; hover scales the
image and draws an orange rule.

### Project detail — the centrepiece
Mirrors the reference's section rhythm, alternating ivory and navy:

1. Hero — full-bleed, name, location, status pill, price
2. Overview (ivory) — display heading, rotated champagne side label, key-stat counters
3. Connectivity (navy) — map plus staggered distance list
4. Plans & Layouts (ivory) — tabs per unit type, zoomable lightbox
5. Master plan (ivory) — interactive hotspots
6. Gallery (navy) — Swiper with parallax and lightbox
7. Amenities (navy) — orange line icons, staggered grid
8. Specifications (ivory) — accordion
9. Construction updates (ivory) — dated timeline
10. Brochure (navy) — form-gated PDF download
11. Enquiry (navy-900) — form plus WhatsApp

Sticky scrollspy nav appears once the hero leaves the viewport. Sticky bottom
bar: Call · WhatsApp · Request Site Visit.

### About
Company story, the three pillars expanded, a note from B Karthik Reddy
(Managing Director), values, delivery stats.

### Contact
Form, embedded map, and the real details: Flat No. 202, Mythri Apartments,
Opp. BSNL Office, ECIL, Hyderabad-62 · +91 6301999971 · +91 9676669923.

---

## 7. Owner workflow

This is the requirement the client cares most about, so it is specified as an
outcome, not an implementation note.

1. Owner opens `/studio` and signs in.
2. **Projects → Create**, fills the form, drag-drops photos, toggles
   **Published** on.
3. The site reflects it within seconds.

   *How freshness works, and the local-only caveat:* in a deployed environment a
   Sanity webhook calls `/api/revalidate`, which calls `revalidateTag` — edits go
   live in seconds. **Running locally there is no public URL for Sanity to call,**
   so the webhook cannot fire. Locally we therefore also set a short
   revalidation window (`revalidate = 30`) on content routes, so edits appear
   within about half a minute without any tunnel. `/api/revalidate` is still
   built and tested now (by calling it directly) so that deploying later requires
   only registering the webhook URL in Sanity — no code change.
4. **To remove a project:** toggle **Published** off. It disappears from
   listings, the homepage showcase and search. No deploy, no code.
5. Reordering featured projects means editing `order`.
6. **Leads** lists every enquiry with phone numbers and a status field.
7. **Site Settings** holds phone numbers, address, WhatsApp number and the
   announcement bar.

A plain-language `docs/OWNER-GUIDE.md` will accompany this, written for someone
who has never used a CMS.

---

## 8. Placeholder content

No real photography exists yet. We will commit a curated set of
architecture/interior photographs from Unsplash (whose licence permits
commercial use) to `public/placeholder/`, so the site renders identically
offline after the initial fetch. Every placeholder is listed in
`docs/OWNER-GUIDE.md` as "replace me", and the mock dataset uses realistic
Hyderabad locations and plausible pricing so layouts are stress-tested against
true-to-life content lengths rather than lorem ipsum.

---

## 9. Verification

Automated:

- `npm run build` clean; `tsc --noEmit` clean; ESLint clean.
- Playwright: every route renders; header and mega-menu navigate; enquiry form
  validates and rejects bad phone numbers; listing filters update both grid and
  URL; project detail scrollspy tracks sections; no console errors on any route.
- Playwright with `prefers-reduced-motion: reduce`: **all copy is visible** and
  no element is stuck at `opacity: 0`.
- Axe accessibility scan on each route; keyboard-only traversal of header,
  filters, lightbox and forms.
- Lighthouse desktop ≥ 90 performance, ≥ 95 accessibility.

Manual, end-to-end:

- In `/studio`, create a project, publish it, confirm it appears on the site;
  unpublish it, confirm it disappears.
- Submit an enquiry; confirm a `lead` document is created and the WhatsApp
  deep-link opens the correct number.
- Review at 375 px, 768 px, 1440 px and 1920 px.

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Sanity account not yet created blocks the build | Mock data layer (§3.2) — full site runs without Sanity |
| Hand-traced logo SVG looks subtly wrong | Visual diff against supplied artwork; fall back to PNG for static use plus a simplified vector monogram for the intro |
| Heavy animation hurts Core Web Vitals | Explicit budgets in §5.4, enforced by Lighthouse in verification |
| Placeholder imagery makes the site feel generic | Realistic Hyderabad-specific mock copy; imagery flagged for replacement in the owner guide |
| Custom cursor and pinned scroll break on touch | Both explicitly disabled on touch; documented mobile fallbacks |
| Orange misused as body text on ivory (3.08:1) | Hard rule in §2.2; enforced by token naming and reviewed in the a11y pass |
