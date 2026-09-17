import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

// Sanity's project-level webhook (configured in the Sanity manage console — not part of this
// repo, and not something this task can create without a real Sanity project existing) POSTs
// here whenever a document is created, published, or deleted. SANITY_REVALIDATE_SECRET
// (server-only — see .env.example) is the shared secret Sanity signs each request with;
// parseBody() verifies that signature before this route trusts the payload's `_type` at all.
// With no secret configured (the default, tested state — see Ruling 3), isValidSignature comes
// back `null` rather than `true`, so this route always answers 401 rather than silently trusting
// an unsigned request.
//
// revalidateTag() takes a mandatory second `profile` argument on this Next.js version — confirmed
// directly against node_modules/next/dist/server/web/spec-extension/revalidate.d.ts, which
// declares `profile: string | CacheLifeConfig` with no `?`. This route's whole purpose is
// "content changed, make the site catch up now," so 'max' (Next's own built-in maximally-eager
// cache-life profile) is the correct choice — the plan's literal single-argument
// `revalidateTag('project')` no longer typechecks and was never a stylistic option to keep.
export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    )

    if (!isValidSignature) {
      return NextResponse.json({ revalidated: false, message: 'Invalid or missing signature' }, { status: 401 })
    }

    const type = body?._type
    if (!type) {
      return NextResponse.json({ revalidated: false, message: 'Missing _type in payload' }, { status: 400 })
    }

    // `amenity` changes need the same tag as `project`: amenities are only ever rendered
    // dereferenced onto a project page (sanity/lib/queries.ts's `amenities[]-> {...}`), so an
    // amenity rename has to invalidate those pages too, and there is no cheap way from this
    // payload alone to know which projects reference the one that changed. `lead` deliberately
    // revalidates nothing — no public page reads lead data (Ruling 7).
    const tags: Array<'project' | 'settings'> = []
    if (type === 'project' || type === 'amenity') tags.push('project')
    if (type === 'siteSettings') tags.push('settings')

    for (const tag of tags) revalidateTag(tag, 'max')

    return NextResponse.json({ revalidated: tags.length > 0, type, tags, now: Date.now() })
  } catch (err) {
    console.error('[api/revalidate] Failed to process Sanity webhook:', err)
    return NextResponse.json({ revalidated: false, message: 'Error processing webhook' }, { status: 500 })
  }
}
