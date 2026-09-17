// GROQ query constants for the Sanity data source (lib/data/sanity.ts).
//
// Three rules apply everywhere in this file:
//  1. Every query that reads `project` documents filters `isPublished == true`, except
//     `allSlugsIncludingDrafts` — an intentionally unfiltered seam for future admin/uniqueness
//     tooling (e.g. a slug-collision check across drafts) that has no caller yet. It is excluded
//     by name from tests/unit/sanity-source.test.ts's "every project query filters isPublished"
//     check for exactly that reason — it is deliberately NOT published-only, not an oversight.
//  2. Every image field is projected as `{ ..., "lqip": asset->metadata.lqip }` — the `...`
//     carries through the raw `asset` reference plus `hotspot`/`crop`/`alt`/`caption` untouched,
//     and the `lqip` addition dereferences the one extra field (blur-placeholder data) that
//     lives on the separate asset document rather than on the image field itself. This gives
//     lib/data/sanity.ts's mapImg() everything @sanity/image-url's urlFor() needs to build a
//     hotspot/crop-aware URL — a pre-resolved `asset->url` string would discard the hotspot the
//     editor picked in the Studio (every image field in sanity/schemas/project.ts sets
//     `options: { hotspot: true }` specifically so that choice exists).
//  3. `overview` and `constructionUpdates` are projected in authored order, matching
//     lib/data/mock.ts's plain-array fixtures — any "newest first" display ordering is the
//     component's job (see components/project/ConstructionTimeline.tsx), not the data layer's,
//     so the two sources stay interchangeable for an editor who adds updates out of
//     chronological order.
//
// Field names below are a direct mirror of sanity/schemas/project.ts, sanity/schemas/amenity.ts
// and sanity/schemas/siteSettings.ts — and the shapes they produce feed lib/data/sanity.ts's
// mapping to the Img / KeyStat / FloorPlan / MasterPlanPlot / Amenity / Project / ProjectSummary
// / SiteSettings interfaces in lib/data/types.ts. Keep all three in step if any of them change.

const rawImage = /* groq */ `{ ..., "lqip": asset->metadata.lqip }`

// Shared by every summary-level query (projectsQuery, featuredProjectsQuery): exactly the fields
// ProjectSummary declares, nothing more.
const projectSummaryProjection = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  tagline,
  category,
  status,
  isPublished,
  featured,
  order,
  location { area, city },
  priceFrom,
  priceUnit,
  priceOnRequest,
  unitTypes,
  heroImage ${rawImage}
`

export const projectsQuery = /* groq */ `
  *[_type == "project" && isPublished == true
    && (!defined($category) || category == $category)
    && (!defined($status)   || status   == $status)
  ] | order(order asc) {
    ${projectSummaryProjection}
  }
`

export const featuredProjectsQuery = /* groq */ `
  *[_type == "project" && isPublished == true && featured == true] | order(order asc) {
    ${projectSummaryProjection}
  }
`

// The full Project shape for a single project page.
export const projectBySlugQuery = /* groq */ `
  *[_type == "project" && isPublished == true && slug.current == $slug][0] {
    ${projectSummaryProjection},
    location { area, city, mapEmbedUrl, lat, lng },
    overview,
    keyStats[] { label, value, suffix },
    gallery[] ${rawImage},
    amenities[]-> { title, icon, category },
    floorPlans[] {
      title, unitType, area, areaUnit,
      image ${rawImage}
    },
    masterPlan {
      image ${rawImage},
      plots[] { label, size, facing, status, polygon }
    },
    specifications[] { category, items },
    constructionUpdates[] {
      date, title, note,
      images[] ${rawImage}
    },
    connectivity[] { place, distance },
    "brochureUrl": brochure.asset->url,
    reraNumber,
    seo {
      metaTitle,
      metaDescription,
      ogImage ${rawImage}
    }
  }
`

// Powers generateStaticParams for /projects/[slug] — published slugs only, so an owner who
// hides a project never leaves a stale static path around.
export const allProjectSlugsQuery = /* groq */ `
  *[_type == "project" && isPublished == true].slug.current
`

// Deliberately unfiltered (see file header) — not called from lib/data/sanity.ts today, kept
// here as a documented, named seam rather than added speculatively elsewhere.
export const allSlugsIncludingDrafts = /* groq */ `
  *[_type == "project"].slug.current
`

// Singleton document — no isPublished concept, so no publish gate applies here.
export const siteSettingsQuery = /* groq */ `
  *[_type == "siteSettings"][0] {
    tagline,
    phones,
    whatsappNumber,
    email,
    address,
    socials[] { platform, url },
    pillars[] { title, description },
    categories[] { label, value },
    stats[] { label, value, suffix },
    footerBlurb,
    reraDisclaimer,
    announcementBar { enabled, text, link }
  }
`
