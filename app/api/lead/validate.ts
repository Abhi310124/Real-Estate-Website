import type { LeadInput } from '@/lib/data/types'

/**
 * Lead validation, deliberately in its own module rather than inside the route handler.
 *
 * Both the client form (`components/project/EnquiryForm.tsx`) and the server route
 * (`app/api/lead/route.ts`) import this same function, so the two can never drift into
 * disagreeing about what a valid phone number is. Client-side validation exists to give an
 * instant inline error without a round trip; server-side validation exists because anything
 * arriving over HTTP is untrusted. Sharing one implementation is what stops those two from
 * becoming two different rulebooks.
 *
 * Hand-rolled rather than pulling in a schema library: the whole rule set is one required
 * name, one Indian mobile number, an optional email, an optional message and a three-value
 * enum. A validation dependency would be more code to audit than the code it replaces.
 */

export type ValidationResult =
  | { ok: true; value: LeadInput }
  | { ok: false; errors: Record<string, string> }

const SOURCES = ['enquiry', 'site-visit', 'brochure'] as const
type Source = (typeof SOURCES)[number]

const NAME_MAX = 120
const MESSAGE_MAX = 2000
const EMAIL_MAX = 254

/**
 * Indian mobile numbers are ten digits beginning 6-9; the 1-5 range is reserved for landline
 * and service prefixes, so `1234567890` is not a mobile even though it is ten digits.
 *
 * Accepts either the bare ten digits or the same ten prefixed with the 91 country code, in any
 * punctuation the visitor happens to type — `+91 63019 99971`, `091-6301999971` and
 * `6301999971` are all the same number and all normalise to the twelve-digit `916301999971`.
 * Storing one canonical form is what lets a repeat enquiry be recognised as the same person
 * rather than filed as a new lead.
 */
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')

  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`
  if (/^91[6-9]\d{9}$/.test(digits)) return digits
  // A leading 0 before the country code or the number itself is common when typed from a
  // saved contact ("091...", "09676...").
  if (/^0[6-9]\d{9}$/.test(digits)) return `91${digits.slice(1)}`
  if (/^091[6-9]\d{9}$/.test(digits)) return digits.slice(1)

  return null
}

// Deliberately permissive: something@something.tld with no whitespace. Email addresses that
// are valid per RFC 5322 but rejected by a clever regex are a real and well-documented class
// of bug, and email is an OPTIONAL field here — the phone number is what the sales team
// actually calls. Rejecting a typo the visitor can see is worth it; rejecting a legitimate
// unusual address to feel rigorous is not.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function validateLead(input: unknown): ValidationResult {
  const errors: Record<string, string> = {}
  const raw = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>

  const name = asString(raw.name).trim().slice(0, NAME_MAX)
  if (name.length === 0) errors.name = 'Please tell us your name.'

  const phoneRaw = asString(raw.phone).trim()
  const phone = normalisePhone(phoneRaw)
  if (phoneRaw.length === 0) {
    errors.phone = 'Please enter a phone number so we can call you back.'
  } else if (phone === null) {
    errors.phone = 'Please enter a valid 10-digit Indian mobile number.'
  }

  // Optional fields: absent is fine, present-but-malformed is not. An empty string counts as
  // absent, because that is what an untouched form control submits.
  const emailRaw = asString(raw.email).trim()
  let email: string | undefined
  if (emailRaw.length > 0) {
    if (emailRaw.length > EMAIL_MAX || !EMAIL_RE.test(emailRaw)) {
      errors.email = 'Please enter a valid email address, or leave it blank.'
    } else {
      email = emailRaw
    }
  }

  const messageRaw = asString(raw.message).trim().slice(0, MESSAGE_MAX)
  const message = messageRaw.length > 0 ? messageRaw : undefined

  const sourceRaw = asString(raw.source)
  if (!(SOURCES as readonly string[]).includes(sourceRaw)) {
    errors.source = 'Unknown enquiry source.'
  }

  const projectSlugRaw = asString(raw.projectSlug).trim()
  const projectSlug = projectSlugRaw.length > 0 ? projectSlugRaw : undefined

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: {
      name,
      phone: phone as string,
      ...(email ? { email } : {}),
      ...(message ? { message } : {}),
      ...(projectSlug ? { projectSlug } : {}),
      source: sourceRaw as Source,
    },
  }
}
