import Link from 'next/link'
import { NextStudio } from 'next-sanity/studio'

import config from '../../../sanity.config'
import { projectId } from '../../../sanity/env'

export { metadata, viewport } from 'next-sanity/studio'

/*
 * The embedded Sanity Studio — the owner's editing surface — lives at `/admin`.
 *
 * It used to sit at `/studio`, which the redesign reclaims for the public practice page: the
 * reference's nav reads Projects · Studio · Journal, where "Studio" is the page about the practice
 * itself. A visitor clicking "Studio" must land on that page, not on a CMS login, so the CMS moved
 * and the public URL won.
 *
 * Three things have to agree on this path or the Studio breaks in ways that are not obvious:
 * this route's folder, `basePath` in `sanity.config.ts`, and the `Disallow` line in `app/robots.ts`.
 * A mismatch between the first two leaves the Studio loading and then rewriting the URL to a 404.
 *
 * The Studio is a client-rendered SPA behind this one catch-all route — there is nothing for
 * Next.js to server-render per sub-path, so `force-static` avoids Next trying (and failing) to
 * treat /admin/[[...tool]] as a dynamic data-fetching route.
 *
 * ## Why this route is guarded when the others are not
 *
 * Leaving Sanity unconfigured is a fully supported state everywhere else on this site:
 * `activeSource()` falls back to the mock source and every page renders. This route is the one
 * exception, because a Studio cannot be mounted against a project that does not exist — Sanity
 * throws on an empty `projectId`, and `sanity.config.ts` passes `projectId ?? ''` so that importing
 * the config never throws at module scope.
 *
 * Unguarded, that surfaced as a bare 500 on a live deployment. Which is the worst possible answer
 * *here specifically*: `docs/OWNER-GUIDE.md` tells the owner, in its opening lines, to reach their
 * editing area by adding `/admin` to the website address. The first thing they would have seen is a
 * server error with nothing to act on. So when there is no project configured this renders what the
 * situation actually is, and what to do about it, instead.
 */
export const dynamic = 'force-static'

export default function AdminStudioPage() {
  if (!projectId) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[52rem] flex-col justify-center gap-6 p-8 font-sans">
        <p className="font-mono text-sm uppercase tracking-[-0.1em] text-muted">BKR INFRA — CMS</p>
        <h1 className="text-3xl font-medium tracking-[-0.03em]">The editing area is not connected yet</h1>
        <p className="text-base leading-relaxed">
          This site is running on its built-in sample content, so there is nothing to sign in to. The
          public pages all work — only editing is unavailable.
        </p>
        <p className="text-base leading-relaxed">
          To turn editing on, someone with access to the hosting needs to create a Sanity project and
          set <code className="font-mono">NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{' '}
          <code className="font-mono">NEXT_PUBLIC_SANITY_DATASET</code>, then redeploy. The full list
          of settings is in <code className="font-mono">.env.example</code>, and the walkthrough is in{' '}
          <code className="font-mono">docs/OWNER-GUIDE.md</code>.
        </p>
        <p className="text-base leading-relaxed">
          <Link className="underline" href="/">
            Back to the website
          </Link>
        </p>
      </main>
    )
  }

  return <NextStudio config={config} />
}
