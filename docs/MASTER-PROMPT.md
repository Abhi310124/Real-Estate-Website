# BKR INFRA Website — Master Prompt

**Status:** authoritative. Every implementation task is executed under this document.
**Read alongside:** `docs/superpowers/specs/2026-09-15-bkr-infra-website-design.md` (the why) and `docs/superpowers/plans/2026-09-15-bkr-infra-website.md` (the how, task by task).

Paste this whole file at the top of any implementation session or subagent brief. When this document and your instinct disagree, this document wins. When this document and the plan's task text disagree, stop and say so rather than choosing.

---

## 1. What you are building

A marketing website for **BKR INFRA**, a Hyderabad real estate developer. Managing Director: **B Karthik Reddy**. Tagline: **Redefining Real Estate Excellence**. Pillars: **DEVELOP · DESIGN · DELIVER**. Five verticals: open plots, villas, apartments, independent houses, developers.

Real contact details — use these everywhere, never invent placeholders:

```
Flat No. 202, Mythri Apartments, Opp. BSNL Office, ECIL, Hyderabad-62
+91 6301999971 · +91 9676669923
```

Five public routes — Home, Projects listing, Project detail, About, Contact — plus a CMS at `/studio`.

## 2. The three non-negotiables

These came directly from the client. Failing any one of them fails the project, no matter how good the rest is.

**(1) The owner manages projects himself, without touching code.** He adds a project, uploads photos, and it appears. He flips one switch, and it disappears. He never opens a terminal, never edits a file, never redeploys. Concretely: `isPublished` defaults to `false`, **every** content query filters on `isPublished == true`, and hiding a project deletes nothing so it can come back. If you write a query without that filter, you have built the wrong thing.

**(2) The motion has to be better than every major Indian developer site.** This is a measured claim, not marketing. Lodha uses AOS. Oberoi uses animate.css and wow.js. Total Environment hand-rolls fades. The reference — myhomeconstructions.com — is the only one with a modern stack (Lenis + GSAP + word-masked reveals). Beating this field is a matter of execution, not invention: land the motion system cleanly, at 60fps, and the bar is cleared.

**(3) Replicate the reference's interaction and motion language — not its visual design.** The client was explicit: "not as per design as per the UI/UX and the animations." So: take the word-masked heading reveals, the scroll choreography, the sticky section nav, the gallery behaviour, the pacing. Do not take the colours, the typography, or the layout. Visually, this site is BKR's — navy, ivory, orange, architectural sans. If someone can tell which site you copied by looking at a screenshot, you went too far.

## 3. Brand law

### Colour

```
navy-900   #071628     navy-800  #0A1A2F   ← primary dark canvas
navy-700   #16233A     navy-600  #1D2733
ivory      #F7F4EE  ← primary light canvas    ivory-warm #FBF9F5
orange     #FF4907  ← brand accent            orange-600 #E63F05
champagne  #C9A227
```

These hexes are sampled from the client's own artwork. Do not adjust them for taste.

### The contrast law

Measured ratios, not estimates. Two of them constrain the design in ways that are easy to get wrong:

| Pair | Ratio | Verdict |
|---|---|---|
| navy-800 on ivory | 15.9:1 | body text ✓ |
| #FFFFFF on navy-800 | 17.5:1 | body text ✓ |
| orange on navy-800 | 5.16:1 | body text ✓ (AA) |
| champagne on navy-800 | 7.2:1 | body text ✓ |
| **orange on ivory** | **3.08:1** | **fails AA — display ≥24px, rules, icons, and filled buttons with white labels only. Never body copy. Never small labels.** |
| **champagne on ivory** | **2.20:1** | **fails everything — decorative hairlines and ornament only. Never text.** |

Orange as a background always carries `#FFFFFF` text. Text over photography always sits on a navy scrim heavy enough to clear 4.5:1 at the worst pixel, not the average one.

When the axe audit flags orange-on-ivory, that is a true positive. Recolour it or enlarge it. Never suppress the rule.

### Type

Architectural sans, deliberately against the category — every competitor reaches for a serif. Justified by the logo's chamfered geometric letterforms.

- **Display:** Archivo variable, `wght 800` / `wdth 118`, UPPERCASE, tracking `-0.02em`, leading `0.92`. Those two values anchor `display-xl`; leading and tracking open up deliberately at smaller display sizes (`display-lg` leading `0.94`; `display-md` leading `1.02`, tracking `-0.015em`), because leading that reads as tight and confident at 7.5rem reads as collided at 1.75rem. This graduation is intentional — do not "correct" it back to a uniform `0.92`.
- **Eyebrow:** Archivo `wght 600` / `wdth 100`, UPPERCASE, 11–12px, tracking `+0.32em`.
- **Body:** Inter variable, leading 1.7–1.75.
- **Numerals:** `tabular-nums` always, so counters do not jitter while animating.

```
display-xl   clamp(3.25rem, 9vw,   7.5rem)
display-lg   clamp(2.5rem,  6vw,   5.5rem)
display-md   clamp(1.75rem, 3.2vw, 3rem)
body-lg      1.0625rem / 1.75
body         1rem / 1.7
caption      0.8125rem / 1.6
```

If the `wdth` axis does not render through the font loader, switch the display face to the separately-published Archivo Expanded and say so in a comment. Do not silently ship `wdth 100` display type — the whole typographic idea is the expansion.

### Rhythm

Sections alternate ivory and navy as chapters, so scrolling feels like turning pages rather than sliding down one surface. Home reads: navy hero → navy pillars → ivory showcase → ivory categories → navy stats → navy CTA → navy-900 footer.

## 4. Motion law

**Only** `transform`, `opacity`, `clip-path`. Anything that triggers layout is a bug. `will-change` goes on at trigger and comes off at completion — leaving it on every heading is how a site that looks fast becomes a site that stutters.

**Only free GSAP plugins:** ScrollTrigger and Flip. There is no Club licence. The word splitter is our own code, not SplitText.

**Reduced motion is a correctness requirement, not a courtesy.** One `useReducedMotion()` hook gates everything. When it returns `true`: Lenis is never constructed, the page-transition curtain and intro render nothing at all, the custom cursor renders nothing, counters render their final value, and every reveal mounts at its final state.

The hook returns `true` on first render **by design**. Components hide themselves only after JS confirms motion is allowed. That way a hydration failure leaves content visible instead of invisible. The rule this protects:

> **No element may ever be stranded at `opacity: 0`.** A Playwright test asserts this. If it fails, the site is broken for real users, not just failing a check.

The primitives, with their exact values:

| Primitive | Behaviour |
|---|---|
| `SplitWords` | per-word masks; inner `yPercent 110 → 0`, stagger `0.055`, `expo.out`, `1.1s`, trigger `top 82%`, once |
| `Reveal` | `y 28 → 0`, `opacity 0 → 1`, `0.9s`, `power3.out`, trigger `top 88%`, once |
| `ImageReveal` | `clip-path inset(0 0 100% 0) → inset(0)` with inner `scale 1.12 → 1`, `1.4s`, `expo.out` |
| `Parallax` | `yPercent` on `scrub: true` |
| `Counter` | count-up on enter, `tabular-nums`, `en-IN` grouping |
| `Marquee` | duplicated track, `-50%` infinite, `ease: 'none'`, pauses on hover and off-screen |

Lenis runs at `lerp: 0.09`, bridged with `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add(t => lenis.raf(t * 1000))` plus `lagSmoothing(0)`. All three lines stay, but they are not equally load-bearing, and an earlier version of this document overstated the first — corrected here after measuring it:

- **`gsap.ticker.add(t => lenis.raf(t * 1000))` is load-bearing.** Lenis's `autoRaf` defaults to `false`, so this is the only thing driving its loop. Remove it and scroll freezes completely.
- **`lenis.on('scroll', ScrollTrigger.update)` is a latency and robustness improvement, not a correctness requirement in this configuration.** Verified by experiment: with the line fully commented out, the bridge e2e test still passes and scrub-linked triggers still track scroll. Lenis runs on the default `window` wrapper, so it calls real `window.scrollTo()` each frame, firing a native `scroll` event that ScrollTrigger's own fallback listener already catches (`ScrollTrigger.js` registers `wheel`/`scroll` at plugin init, commented "mostly for 3rd party smooth scrolling libraries"). Keep the line — it is the documented integration and saves a frame of lag — but do not claim a black-box scroll test guards it. It becomes genuinely load-bearing only under a custom `wrapper` or a `scrollerProxy`, where no native scroll event fires; **if a later task introduces either, this line stops being optional.**
- Its presence is guarded structurally instead, by the `LenisProvider` unit test that asserts each wire is attached and that cleanup removes the same ticker callback reference before destroying Lenis.

**The three signature moments** (all three are in scope; the client explicitly upgraded to all three):

1. **Pinned horizontal showcase** — featured projects on an x-track as the page scrolls. Falls back to native `snap-x` scroll on touch and under reduced motion. Never pin on a phone.
2. **Cinematic page transitions** — a navy curtain carrying the mark, plus a first-load `stroke-dashoffset` logo draw, once per session via `sessionStorage`. The curtain is `pointer-events: none` whenever idle, so a stuck animation can never brick the site. Navigation must work if the animation throws.
3. **Interactive masterplan + magnetic cursor** — SVG plot hotspots with zoom and pan; a contextual cursor on pointer devices. Both off on touch and under reduced motion. Hotspots are keyboard-focusable with `Enter`/`Space`, and explicit zoom buttons exist so the feature is not mouse-only. **Never hide the native cursor** — that is what makes a broken custom cursor unusable rather than merely disappointing.

**Budgets:** LCP < 2.5s · CLS < 0.05 · Lighthouse desktop performance ≥ 90 · accessibility ≥ 95. Measured against `next build && next start`, never dev mode. If performance misses, cut simultaneous scroll-linked animations per viewport. Do not report a miss as a pass.

## 5. Architecture law

Next.js App Router · TypeScript strict · Tailwind · Sanity with Studio embedded at `/studio` · Vitest for logic · Playwright for behaviour.

**One data access layer, two interchangeable sources.** `lib/data/index.ts` exposes `getProjects`, `getFeaturedProjects`, `getProject`, `getAllProjectSlugs`, `getSiteSettings`. It selects `mock.ts` or `sanity.ts` on `NEXT_PUBLIC_SANITY_PROJECT_ID`. Both implement one `DataSource` interface, so drift is a compile error rather than a production surprise. Consequences to respect:

- No page, no component ever imports the Sanity client directly.
- The entire site builds, animates and is reviewable before a Sanity account exists.
- Adding Sanity later must not change a single page component.
- Publish-gating lives in the source implementations, in one place each, so both sources behave identically.

**Server-first.** Pages are server components; only motion, forms and interactive widgets are `'use client'`. Filters are real `<Link>`s writing to `searchParams` and resolving server-side, so `?category=villas` is a crawlable page rather than client state.

**Hosting is local-only for now.** Sanity therefore cannot reach a webhook, so content routes also carry `export const revalidate = 30` and edits surface within ~30s. `/api/revalidate` is still built and tested by direct invocation, so a future deploy needs only the webhook registered — no code change.

**Secrets:** the Sanity write token is server-side only. `NEXT_PUBLIC_` on a write token is a security bug, not a config choice.

## 6. Code standards

- Filenames: components `PascalCase.tsx`, modules `camelCase.ts`. Named exports; no default exports outside Next.js route files.
- Every image is `next/image` with a correct `sizes`. A wrong `sizes` is the usual cause of a missed LCP. `priority` on the hero image only.
- Every image container reserves its aspect ratio, so a reveal cannot shift layout.
- Every image has real `alt` text. Decorative ornament gets `aria-hidden`, not empty-alt body content.
- Labels are `<label for>`. A placeholder is not a label.
- Interactive elements: `min-h-11`, visible `focus-visible` ring, accessible name.
- Overlays: `role="dialog"`, `aria-modal`, focus trapped, `Escape` closes, focus restored to the trigger, `<body>` scroll locked.
- Z-index budget, fixed: header `80`, transition curtain `90`, lightbox `110`, cursor `120`, skip link `130`. Do not invent new layers. The skip link sits on top deliberately — it is the keyboard user's escape hatch, and a decorative cursor or a stuck curtain painting over it turns a working affordance into a dead one.
- Errors degrade, they do not crash. A Sanity outage empties a section; it does not white-screen the site. A missing mail key logs a warning and still returns `{ ok: true }` so a lead is never lost.
- Indian formatting throughout: `toLocaleString('en-IN')`, `₹85 Lakh onwards`, `₹1.4 Cr onwards`, `Price on request` when unset.
- RERA number on every project page; RERA disclaimer in the footer. Legally required for property marketing in India.

## 7. How to work

Per task, in this order, no shortcuts:

1. Read the task's **Files** and **Interfaces** blocks. The Interfaces block is how you learn the exact names neighbouring tasks expect — matching it is not optional.
2. Write the failing test **first**.
3. Run it. Watch it fail for the stated reason. A test that passes before implementation is testing nothing.
4. Write the minimum code that passes.
5. Run it. Watch it pass.
6. Commit, Conventional Commits.

Rules that hold across every task:

- **Never weaken a test to make it pass.** If a test is wrong, say so out loud and explain why before changing it. Deleting an assertion to get green is the one unforgivable move here.
- **Never fake completion.** If a step is blocked, finish everything else in the task and state plainly what is outstanding and why.
- Two steps are judgement calls, not mechanical instructions — Task 1 Step 8 (does the `wdth` axis render?) and Task 6 Step 5 (is the logo trace faithful?). Each states its criterion and its fallback. Make the call, then record which way you went in a comment.
- Test slug constants (`bkr-lakeview-enclave`, `bkr-skyline-residences`, `unpublished-sample`) must match `lib/data/mock.ts`. Verify before assuming a test is broken.
- After Phase 3, run the whole suite before each commit — pinned scroll, overlays and fixed layers break each other in ways only the full suite catches.

## 8. Definition of done

A task is done when its tests pass, `npx tsc --noEmit` is clean, and it is committed. The project is done when all of this is true:

- `npx tsc --noEmit && npx vitest run && npx next build && npx playwright test` — all green.
- Every route passes axe with zero serious or critical violations.
- Under `prefers-reduced-motion: reduce`, all five routes are fully readable and **nothing** sits at `opacity: 0`.
- On a 390px touch viewport, no section pins, the showcase snap-scrolls, and display type does not overflow.
- Lighthouse desktop: performance ≥ 90, accessibility ≥ 95.
- No image 404s on any route after a full scroll.
- No console errors on any route.
- In the Studio: creating a project makes it appear, flipping `Published` off makes it vanish, flipping it back restores it — round-trip verified by hand, not assumed.
- A submitted enquiry is validated, stored, and confirmed to the user in an `aria-live` region.
- `docs/OWNER-GUIDE.md` explains adding, hiding and reordering projects in language that needs no developer present.

## 9. What "best in India" actually means here

Not more animation. The reference site is already close to the ceiling for scroll choreography in this category — the win is in the places those sites are careless:

- Reveals that fire once, at the right scroll position, and then get out of the way.
- Typography that holds at 375px and at 1920px without a single overflow.
- A masterplan a keyboard user can actually operate.
- Reduced motion that produces a beautiful static site, not a broken one.
- An LCP under 2.5s **with** all of the above still running.

Any one animation is easy. All of them together, at 60fps, accessible, on a phone, is the deliverable.
