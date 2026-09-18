import { NextResponse } from 'next/server'
import { validateLead } from './validate'
import { activeSource, getProject } from '@/lib/data'
import type { LeadInput } from '@/lib/data/types'

/**
 * POST /api/lead — the only write path in the site.
 *
 * Returns `{ ok: true }` (plus `brochureUrl` for a brochure request) or, on invalid input,
 * `400` with `{ ok: false, errors }` keyed by field name so the form can render each message
 * against the control it belongs to.
 *
 * SECURITY: every credential here is read from an unprefixed env var and only inside this
 * handler, which never runs in the browser. `SANITY_API_WRITE_TOKEN` can create documents in
 * the dataset; a `NEXT_PUBLIC_` prefix on it would compile it into the client bundle where
 * anyone could read it out and write to the CMS. The same applies to `RESEND_API_KEY`. Only
 * `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are deliberately public.
 */

// Very small in-memory limiter. LIMITATIONS, stated plainly because they matter at deploy
// time: this Map lives in one server process, so it resets on restart and does not coordinate
// across instances — on a multi-instance or serverless deployment each instance keeps its own
// count and the effective limit multiplies. It is a speed bump against a single script
// hammering the form, not real abuse prevention; a shared store or an edge rule is what would
// give that. It is here because the alternative — no limit at all — makes it trivial to fill
// the owner's lead inbox with junk.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5
const hits = new Map<string, { count: number; resetAt: number }>()

function rateLimited(ip: string, now: number): boolean {
  const entry = hits.get(ip)
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > MAX_PER_WINDOW
}

// Bounded so a long-running process cannot accumulate an entry per unique IP forever.
function pruneHits(now: number): void {
  if (hits.size < 5000) return
  for (const [ip, entry] of hits) if (now > entry.resetAt) hits.delete(ip)
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

async function storeLead(lead: LeadInput): Promise<void> {
  // Deliberate, documented branch — not an error path that happens to succeed. With no Sanity
  // project configured there is nowhere to write, and a lead-capture form that 500s in local
  // development would be untestable. Logging keeps the submission visible to whoever is
  // running the server, which is the useful behaviour here.
  if (activeSource() === 'mock') {
    console.info('[lead] captured (mock source — no Sanity configured):', lead)
    return
  }

  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!token) {
    console.warn('[lead] SANITY_API_WRITE_TOKEN is not set — lead logged rather than stored:', lead)
    return
  }

  const { createClient } = await import('next-sanity')
  const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
    apiVersion: '2026-01-01',
    useCdn: false,
    token,
  })

  await writeClient.create({
    _type: 'lead',
    ...lead,
    status: 'new',
    receivedAt: new Date().toISOString(),
  })
}

async function notify(lead: LeadInput): Promise<void> {
  const key = process.env.RESEND_API_KEY
  const to = process.env.LEAD_NOTIFY_EMAIL
  if (!key || !to) {
    console.warn('[lead] email notification skipped — RESEND_API_KEY or LEAD_NOTIFY_EMAIL not set')
    return
  }

  const lines = [
    `Name: ${lead.name}`,
    `Phone: +${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.projectSlug ? `Project: ${lead.projectSlug}` : null,
    `Source: ${lead.source}`,
    lead.message ? `\nMessage:\n${lead.message}` : null,
  ].filter(Boolean)

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'BKR INFRA Website <onboarding@resend.dev>',
      to: [to],
      subject: `New ${lead.source} enquiry — ${lead.name}`,
      text: lines.join('\n'),
    }),
  })
}

export async function POST(request: Request) {
  const now = Date.now()
  pruneHits(now)
  if (rateLimited(clientIp(request), now)) {
    return NextResponse.json(
      { ok: false, errors: { form: 'Too many enquiries from this connection. Please try again in a minute.' } },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, errors: { form: 'Could not read the submitted form.' } }, { status: 400 })
  }

  const result = validateLead(body)
  if (!result.ok) return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 })

  const lead = result.value

  // Store first, notify second, and never let a notification failure surface as a failed
  // submission. Someone who typed their phone number in has done their part; an outage at the
  // mail provider is not their problem and must not prompt them to submit again.
  try {
    await storeLead(lead)
  } catch (error) {
    console.error('[lead] failed to store lead — the submission is only in this log:', error, lead)
    return NextResponse.json(
      { ok: false, errors: { form: 'Something went wrong saving your enquiry. Please call us instead.' } },
      { status: 500 },
    )
  }

  try {
    await notify(lead)
  } catch (error) {
    console.error('[lead] notification failed (lead is stored, returning success):', error)
  }

  // The brochure URL is resolved server-side and returned only in this response — it is never
  // rendered into the page markup, which is what makes the download an exchange for a contact
  // detail rather than a link anyone can copy out of the HTML.
  if (lead.source === 'brochure' && lead.projectSlug) {
    const project = await getProject(lead.projectSlug)
    if (project?.brochureUrl) return NextResponse.json({ ok: true, brochureUrl: project.brochureUrl })
  }

  return NextResponse.json({ ok: true })
}
