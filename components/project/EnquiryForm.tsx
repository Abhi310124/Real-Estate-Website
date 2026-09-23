'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { validateLead } from '@/app/api/lead/validate'
import { FormField } from './FormField'
import { cn } from '@/lib/cn'
import type { LeadInput } from '@/lib/data/types'

type Props = {
  /** The lead's source when the visitor does not choose one (or no choice is offered). */
  source: LeadInput['source']
  projectSlug?: string
  /** Offer the layout's "Type of query" chips — property enquiry, site visit, bookings. */
  queryTypes?: boolean
  submitLabel?: string
  className?: string
}

/** Each chip maps onto the lead's `source`; a booking is an enquiry that says so in its message. */
const QUERY_TYPES = [
  { value: 'enquiry', label: 'Property enquiry' },
  { value: 'site-visit', label: 'Site visit' },
  { value: 'booking', label: 'Bookings' },
] as const

/**
 * The project page's "Get in touch" card, as the layout sets it: a bordered 8px card holding name,
 * phone and email on underlines, the type of query as a row of chips, a message field, one line of
 * consent, and a full-width Submit.
 *
 * It posts to `/api/lead` and validates with the same shared `validateLead` the server uses, so the
 * client can never accept what the server would reject. `projectSlug` travels with the lead so the
 * follow-up call knows which development prompted it. On success the form is replaced by a
 * `role="status"` confirmation — leaving a filled form beside a success message invites a second
 * identical submission.
 */
export function EnquiryForm({ source, projectSlug, queryTypes = false, submitLabel = 'Submit', className }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return

    const data = new FormData(event.currentTarget)
    const query = String(data.get('queryType') ?? '')
    const message = [query === 'booking' ? 'Booking enquiry' : null, data.get('message')].filter(Boolean).join('\n')
    const candidate = {
      name: data.get('name'),
      phone: data.get('phone'),
      email: data.get('email'),
      message,
      source: query === 'site-visit' ? 'site-visit' : query ? 'enquiry' : source,
      ...(projectSlug ? { projectSlug } : {}),
    }

    const local = validateLead(candidate)
    if (!local.ok) {
      setErrors(local.errors)
      return
    }

    setErrors({})
    setSending(true)
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(local.value),
      })
      const payload: { ok?: boolean; errors?: Record<string, string> } = await response.json().catch(() => ({}))

      if (!response.ok || payload.ok !== true) {
        setErrors(payload.errors ?? { form: 'Something went wrong. Please call us instead.' })
        return
      }
      setDone('Thank you — we have your details and will be in touch shortly.')
    } catch {
      // A network failure is the one case where the visitor genuinely has to act again, so it says so.
      setErrors({ form: 'Could not reach us just now. Please check your connection, or call instead.' })
    } finally {
      setSending(false)
    }
  }

  const card = 'rounded-card border border-navyLine/60 bg-primary p-8 shadow-[0_32px_64px_-40px_rgba(10,26,47,0.45)] max-sm:p-5'

  if (done) {
    return (
      <p role="status" className={cn(card, 'font-heading text-h4 text-secondary max-sm:text-h4-sm', className)}>
        {done}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} aria-label="Enquiry form" noValidate className={cn(card, 'space-y-7', className)}>
      <FormField idPrefix="enquiry" label="Name" name="name" type="text" required error={errors.name} />
      <FormField idPrefix="enquiry" label="Phone number" name="phone" type="tel" required error={errors.phone} />
      <FormField idPrefix="enquiry" label="Email" name="email" type="email" required={false} error={errors.email} />

      {queryTypes && (
        <fieldset>
          <legend className="px-2 text-body text-muted">Type of query</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {QUERY_TYPES.map((q) => (
              <label
                key={q.value}
                className="cursor-pointer rounded-card border border-navyLine px-3 py-1.5 text-small text-muted transition-colors duration-300 hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-secondary has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-secondary"
              >
                <input type="radio" name="queryType" value={q.value} className="sr-only" />
                {q.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <FormField idPrefix="enquiry" label="Message" name="message" type="textarea" required={false} error={errors.message} />

      <p className="px-2 text-caption text-muted">
        By submitting, you agree that BKR INFRA may call, message or email you about this enquiry.
      </p>

      {/* Form-level failures (rate limit, server error, offline) belong here, not against a field. */}
      {errors.form && (
        <p role="alert" className="px-2 text-small text-secondary">
          {errors.form}
        </p>
      )}

      {/* Disabled while in flight so a double-click cannot create two leads for one person. */}
      <Button type="submit" shape="block" disabled={sending}>
        {sending ? 'Sending…' : submitLabel}
      </Button>
    </form>
  )
}
