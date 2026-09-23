# Rebuild BKR INFRA in the PMR Group design language

Reference: <https://www.pmrhousing.in/> (Webflow). Palette: **BKR's own** — navy `#0A1A2F`, orange
`#FF4907`, cream `#F7F4EE` — per the brief ("keep the colour theme same as the current website").
Structure, layout, type system and every animation follow the reference; content, photography,
names and facts are BKR's. Nothing of PMR's is copied: no text, images, logo, project names or figures.

## 1. What the reference is, measured

Captured with Playwright at 1440×900 and 390×844 across `/`, `/about`, `/projects`,
`/project/[slug]`, `/blog`, `/post/[slug]`, `/privacy-policy`. Raw data: `C:/tmp/pmr/**`.
Animation specs are **decoded from the site's own Webflow IX2 config** (43 events, 27 action lists —
`C:/tmp/pmr/IX2-SUMMARY.txt`), plus two inline scripts (SplitType + GSAP, counterUp2). No WebGL, no
canvas, no Lottie, no video player of its own (one Bunny iframe).

### Design system
| | Reference | BKR mapping |
|---|---|---|
| Ink | deep purple `#2C1443` | navy `#0A1A2F` |
| Ground | white | cream `#F7F4EE` |
| Accent | red-orange `#EA3F28` | orange `#FF4907` (fills, rules, large text); `#CC3A06` for small orange text on cream (AA) |
| Tints | lavender `#B7A7D1` `#7865A8` `#DCD5E7` `#ECE9F2` | navy tints (derived, AA-checked) |
| Signature gradient | `#EA3F28 → #F59A42 29% → #FFF 50% → #674587 75% → #2C1443` | `#FF4907 → #FF9A5C → #F7F4EE → #3A5577 → #0A1A2F` |
| Display face | K Uniforma (commercial, trial) 400/500 | **Archivo** wdth 116, 400/500 (closest free match, verified side by side) |
| Body face | Montserrat 400/500 | Montserrat 400/500 (exact) |
| Type scale | H1 64/74, H2 40/44, H3 32/42, stat 108, ghost 99–128, body 16/24, small 14 | same |
| Container | 48px side padding, 1344 content at 1440 | same |
| Radii | cards 8px, contact frame 32px top corners, pills 1600px, blog panel 8–32px | same |

### Components
- **Header** — sticky, solid ground, 94px: logo · Home · About · Projects · Blog · phone · *Enquire Now*.
  Active link in orange. Mobile: filled square hamburger, drop-down panel on a tinted ground.
- **Gradient-ring button** — 1.6px ring of the signature gradient, 8px radius, orange label; hover swings
  the gradient angle 90°→200° over 0.4s `cubic-bezier(0.596,0.013,0.281,0.995)`.
- **Filled pill** — "View all projects ›": ink fill, 1600px radius, 8/24 padding. BKR: orange fill, navy
  label (5.17:1) — the brief requires orange clickables.
- **Footer** — ink ground: logo + divider + tagline; office address; per-project RERA blocks; phones;
  email; socials | Company links | Projects list | © + legal row.

### Motion (exact values from IX2)
| # | What | Trigger | Spec |
|---|---|---|---|
| M1 | **Loader** | page load | ink panel; % counter 0→100 in 1500ms + tagline; 2px line x −100%→0 over 2000ms `inOutExpo`; fade 300ms; panel x 0→100% over 1200ms `inOutExpo`; inner pages: panel-only wipe 1500ms |
| M2 | **Gradient thread** | scroll-scrubbed | 8px window (hero seam, intro) over an 8144px gradient track, y −80%→−65% |
| M3 | Intro statement drift | scroll-scrubbed | h3 y 3rem → −3px across 0–80% progress |
| M4 | **Card hover** | hover | gradient bar under image w 0→100% 800ms `(0.8,0,0.2,1)`; title x 0→2vw; chevron appears; out 500ms |
| M5 | Card image reveal | into view (60%) | tinted block y 0→100%, 300ms `(0.8,0,0.4,1)` |
| M6 | Project image zoom | hover | scale 1→1.1 1000ms `(0.257,0.001,0.392,1.001)`; info ±2rem |
| M7 | Heading rise | into view | y 5px→0, 800ms `(0.8,0,0.2,1)`; second line +250ms |
| M8 | **Counters** | fully visible | count up 1500ms |
| M9 | **Soft triangles** | scroll-scrubbed | rotate 0→180° (stats, values), 0→359° (about); smoothing 80–85 |
| M10 | **Values timeline** | scroll-scrubbed | gradient bar grows 30→40→75→100%; value 2 fades in at 48–56%, value 3 at 63–70% |
| M11 | **Contact doors** | into view (30%) | four panels part: 50%→25% width each, ±25vw, 800ms `(0.8,0,0.2,1)`; form y −25px +100ms |
| M12 | Stats gradient rule | into view | w 0→100%, 2000ms `inOutQuint` |
| M13 | Blog card hover | hover | gradient bar w 0→100% 800ms; arrow appears |
| M14 | Mobile menu | open/close | burger bars ±45° 600ms `inOutQuint`, panel drops |

### Pages
- **Home**: hero (split, headline + intro + "In-View" project + ring button | tall image with gradient
  seam) → intro statement (+ thread) → media frame → "What we've created" 2×2 cards + pill → statistics
  (headline + 4 counters + triangle) → testimonials (3 cards) → "Building stories" ghost heading + story
  + image → "What drives us?" values timeline → contact doors → footer.
- **About**: breadcrumb + H1 + large image over a soft triangle → 3 stat circles + gradient rule →
  founder quote + portrait → timeline row → "Join us" CTA → contact doors.
- **Projects**: breadcrumb + H1 + "View all" → "Our Latest Project" feature → gradient rule → "Our
  Projects" + text filter tabs + 2-col cards → contact doors.
- **Project detail**: full-bleed hero (title 104px, location, scroll-down disc) → about paragraph →
  key figures + image → key features grid → gallery (main + prev/next + thumbnails) → location + map +
  directions → CTA → display image → "Get in touch" form card (query chips + consent) → other projects.
- **Blog**: breadcrumb + "News and Updates" + featured panel + grid. **Post**: "‹ All posts" + H1 +
  collage + rich text + "Get in touch".
- **Legal**: H1 hero + prose.

## 2. The "3D" in the brief

The reference has no real 3D — its 28 `preserve-3d` nodes are Webflow's transform plumbing. The brief
asks for 3D animations explicitly, so they are ADDED, in the reference's own vocabulary and restraint,
all CSS 3D + GSAP (no WebGL — real photography reads as high-end; untextured WebGL geometry would not):

| Where | 3D treatment |
|---|---|
| Hero image | pointer-driven perspective tilt (±5°) with depth-separated layers; 3D unfold on entry |
| Media frame (reference: video) | **3D cylinder carousel** of BKR photography, scroll-scrubbed + draggable |
| Project cards | perspective tilt toward the pointer, on top of M4/M6 |
| Soft triangles | rotate in 3D (Z plus X tilt) instead of flat Z |
| Contact doors | panels **swing open on hinges** (rotateY about outer edges) while sliding — literal doors |

All of it collapses to the static composition under `prefers-reduced-motion`, and none of it is required
to read or operate anything.

## 3. Content rules (integrity)
- No PMR copy, images, names or numbers. BKR copy only, in the site's established register.
- **Statistics are derived from published data** (project count, localities, typologies, RERA-registered
  share) — `settings.stats` holds placeholder figures its own fixture flags as unverified, and a 108px
  number is the last place to show an unverified claim.
- Values = BKR's real pillars (Develop / Design / Deliver, from the business card).
- Testimonials stay the flagged placeholders; the founder note stays authored-in-voice and flagged.
- No invented history years; the About timeline becomes the process (Land → Layout → Build → Handover).

## 4. Routes
Nav mirrors the reference: Home · About · Projects · Blog. `/about` becomes the page (`/studio` →
permanent redirect); `/journal` → `/blog`, `/journal/[slug]` → `/blog/[slug]` (permanent). CMS stays at
`/admin`. `/contact` stays as the standalone form route.

## 5. Execution order
1. Tokens (tints, gradient), fonts (Archivo + Montserrat), type scale, container.
2. Motion primitives M1–M14 + 3D primitives.
3. Chrome: header, footer, loader, route wipe, gradient button, pill, form fields, contact doors.
4. Home → Projects → Project detail → About → Blog/Post → Contact/Legal/404.
5. Route moves + redirects + sitemap/robots.
6. Tests: rewrite the home/motion specs for the new structure; keep a11y, lead, performance,
   project-detail/listing, seo green.
7. Side-by-side screenshot review against `C:/tmp/pmr/**` at 1440 and 390; fix; gates; commit; deploy.
