# BKR INFRA

Marketing and lead-generation site for BKR INFRA, a Hyderabad property developer. Next.js App
Router, TypeScript, Tailwind, GSAP + Lenis for motion, Sanity for content.

**Non-technical editing guide:** [`docs/OWNER-GUIDE.md`](docs/OWNER-GUIDE.md).

---

## Getting started

```bash
npm install
npm run dev
```

That is genuinely all. **The site runs, builds and passes its entire test suite with no Sanity
account and no environment variables at all** — see [Content sources](#content-sources).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on `http://localhost:3000` |
| `npm run build` | Production build. Cold builds take ~2.5 min (the embedded Sanity Studio is the bulk of it); warm rebuilds are a few seconds |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `eslint .` — **an independent gate.** Next 16 removed `next lint` and `next build` no longer lints, so a clean build says nothing about lint |
| `npm test` | Vitest unit tests (`tests/unit/`) |
| `npm run test:e2e` | Playwright end-to-end tests (`tests/e2e/`) against a real production build |

`npm test` and `npm run test:e2e` do not overlap: Vitest is scoped to `tests/unit/**` and never
picks up the Playwright specs.

## Content sources

There are two interchangeable data sources behind one interface (`DataSource` in
`lib/data/types.ts`):

- **`lib/data/mock.ts`** — six fully-populated fixture projects. The default.
- **`lib/data/sanity.ts`** — live content from Sanity.

`lib/data/index.ts` picks between them:

```ts
export function activeSource(): 'mock' | 'sanity' {
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? 'sanity' : 'mock'
}
```

**Setting `NEXT_PUBLIC_SANITY_PROJECT_ID` is the entire switch.** With it unset you get the mock
source, which is why the project needs no account to run or test. Every page, every test and the
production build all work identically either way — the point of the split is that Sanity is a
content source, not a dependency the site cannot boot without.

Each of the five query functions in `lib/data/index.ts` is typed as `DataSource['<method>']`, so
if the two sources ever drift apart in signature it is a compile error rather than a runtime
surprise.

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. Nothing is required for local
development against the mock source.

| Variable | Exposed to the browser? | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | **Yes** | Sanity project id. Setting it switches the data source. |
| `NEXT_PUBLIC_SANITY_DATASET` | **Yes** | Usually `production`. |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Canonical origin, used for absolute URLs in metadata, sitemap and JSON-LD. |
| `SANITY_API_WRITE_TOKEN` | **No — server only** | Lets the lead API create `lead` documents. |
| `SANITY_REVALIDATE_SECRET` | **No — server only** | Verifies Sanity's webhook signature. |
| `RESEND_API_KEY` | **No — server only** | Optional. Emails a notification when a lead arrives. |
| `LEAD_NOTIFY_EMAIL` | **No — server only** | Where those notifications go. |

**Only the `NEXT_PUBLIC_`-prefixed variables may ever hold a public value.** That prefix compiles
the value into the client bundle, where anyone can read it out of the JavaScript. Putting a token
behind it would publish a credential that can write to the CMS or send mail on your behalf —
that is a security bug, not a configuration preference. The unprefixed variables are read only
inside route handlers, which never run in the browser.

## Deployment

1. Deploy to any Node host that supports the Next.js App Router.
2. Set the environment variables above.
3. **Register the revalidation webhook in Sanity** so published edits appear immediately:
   - In Sanity: *API → Webhooks → Create webhook*
   - URL: `https://<your-domain>/api/revalidate`
   - Trigger on: create, update, delete
   - Secret: the same value as `SANITY_REVALIDATE_SECRET`

   Without the webhook the site still updates, just on the 30-second revalidation window
   instead of instantly. No code change is needed either way.

`/studio` and `/motion-lab` are disallowed in `robots.txt` and excluded from the sitemap.
`/motion-lab` is a development harness for the motion primitives and is not linked from
anywhere in the site.

## Testing

The end-to-end suite runs against a real `next build && next start`, never the dev server —
hydration and animation timing are exactly where dev-mode double-mounting manufactures flake.

It runs **chromium only** and has **no retries on purpose**: the suite exists largely to catch
animation and hydration timing bugs, and a retry converts precisely that class of failure into a
pass.

**One operational gotcha.** `playwright.config.ts` sets `reuseExistingServer: !process.env.CI`,
so a `next start` left running from an earlier session is silently reused instead of rebuilding.
If `.next` has been deleted since that server started, it returns 500 for every JS and CSS
chunk, which presents as dozens of unrelated test failures and a completely unstyled page. If you
see broad inexplicable failures, check for a stale listener first:

```bash
netstat -ano | grep ":3000"
```

## Known issues

- **`npm audit` reports 15 vulnerabilities (13 moderate, 2 high).** All of them come from
  `sanity` and its dependency tree, and `npm audit fix` can only resolve them by downgrading
  `sanity` across a breaking major version. They are accepted rather than overlooked; revisit
  when Sanity publishes a patched release. No `--force` or `--legacy-peer-deps` is used anywhere
  in this project's install.
- **Placeholder content is still in place.** 43 stand-in images and brochures, and the four home
  page statistics, all need replacing before launch. `docs/OWNER-GUIDE.md` section 9 lists every
  one and where to change it. `scripts/generate-placeholders.mjs` regenerates them if needed.

## Project structure

```
app/                    routes, API handlers, sitemap/robots/OG image
  api/lead/             lead capture: validate.ts is shared with the client form
  api/revalidate/       Sanity webhook receiver
  studio/               embedded Sanity Studio at /studio
components/
  brand/                Logo, LogoMark — size these by WIDTH, never height
  home/                 home page sections
  layout/               header, footer, nav, PageShell
  motion/               motion primitives and the reduced-motion / pointer gates
  project/              project detail sections
  projects/             listing grid, cards, filters
  ui/                   Button, Field, Pill, Lightbox and friends
lib/
  data/                 the two-source data layer and its shared types
sanity/                 schemas, GROQ queries, Studio structure
docs/                   spec, plan, owner guide, brand references
tests/unit/             Vitest
tests/e2e/              Playwright
```

Two conventions worth knowing before editing:

- **Motion is gated, always.** Every animated component reads `useReducedMotion()` (which returns
  `true` on first render by design, so a hydration failure leaves content visible rather than
  invisible) and no element may be left stranded invisible when motion is off.
- **The logo lockup is sized by width.** It mixes a scalable SVG with fixed-size text, so a height
  budget lets flex-shrink crush the monogram — it once rendered 8px tall in the header. There is a
  comment in `components/brand/Logo.tsx` explaining it.
