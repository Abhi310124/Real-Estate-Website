'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { validateLead } from '@/app/api/lead/validate'
import { FormField } from './FormField'
import { cn } from '@/lib/cn'
import type { LeadInput } from '@/lib/data/types'

type Props = {
  source: LeadInput['source']
  projectSlug?: string
  /** Extra copy above the fields, e.g. naming the project being enquired about. */
  intro?: string
  submitLabel?: string
  className?: string
}

/**
 * The enquiry form's behaviour, in the monochrome form treatment: numbered mono ordinals, underline-only
 * controls, one square button. `ContactIntake` on the home page is the reference for this shape, and
 * `./FormField` carries the details — including why `components/ui/Field.tsx` is not used.
 *
 * It validates with the SAME `validateLead` the API route uses, so an invalid phone number produces an
 * inline error with no round trip and no navigation, and the client can never accept something the
 * server would reject. The server still validates independently — the client check is a courtesy, not a
 * trust boundary.
 *
 * Nothing here sets an ink colour. Everything inherits `currentColor` from the section that mounts it,
 * so the same form works on paper or on white without a tone prop — the one exception is the hairline
 * under each control, which cannot be expressed against `currentColor` in Tailwind v3 and is therefore
 * fixed to the light-chapter pairing in `FormField`.
 */
export function EnquiryForm({ source, projectSlug, intro, submitLabel = 'Send Enquiry', className }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return

    const data = new FormData(event.currentTarget)
    const candidate = {
      name: data.get('name'),
      phone: data.get('phone'),
      email: data.get('email'),
      message: data.get('message'),
      source,
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
      const payload: { ok?: boolean; errors?: Record<string, string> } = await response
        .json()
        .catch(() => ({}))

      if (!response.ok || payload.ok !== true) {
        setErrors(payload.errors ?? { form: 'Something went wrong. Please call us instead.' })
        return
      }
      setDone('Thank you — we have your details and will be in touch shortly.')
    } catch {
      // A network failure is the one case where the visitor genuinely has to act again, so it says so
      // rather than claiming success.
      setErrors({ form: 'Could not reach us just now. Please check your connection, or call instead.' })
    } finally {
      setSending(false)
    }
  }

  // role="status" (an implicit aria-live="polite" region) so a screen reader announces the confirmation
  // without the visitor having to go looking for it. Rendered in place of the form once submitted:
  // leaving a filled form on screen next to a success message invites a second identical submission.
  if (done) {
    return (
      <p role="status" className={cn('text-lead font-display max-sm:text-lead-sm', className)}>
        {done}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} aria-label="Enquiry form" noValidate className={className}>
      {intro && <p className="text-body text-muted max-sm:text-body-sm">{intro}</p>}

      <div className={cn(intro && 'mt-[3vw] max-sm:mt-[8vw]')}>
        <FormField idPrefix="enquiry" n="01" label="Full Name" name="name" type="text" required error={errors.name} />
      </div>
      <div className="mt-[3vw] max-sm:mt-[8vw]">
        <FormField idPrefix="enquiry" n="02" label="Phone Number" name="phone" type="tel" required error={errors.phone} />
      </div>
      <div className="mt-[3vw] max-sm:mt-[8vw]">
        <FormField
          idPrefix="enquiry"
          n="03"
          label="Email Address"
          name="email"
          type="email"
          required={false}
          error={errors.email}
        />
      </div>
      <div className="mt-[3vw] max-sm:mt-[8vw]">
        <FormField
          idPrefix="enquiry"
          n="04"
          label="Message"
          name="message"
          type="textarea"
          required={false}
          placeholder="Tell us which project or location you're interested in"
          error={errors.message}
        />
      </div>

      {/* Form-level failures (rate limit, server error, offline) belong here rather than against any one
          field, since no single control caused them. */}
      {errors.form && (
        <p role="alert" className="mt-[2vw] text-label max-sm:mt-[6vw] max-sm:text-label-sm">
          {errors.form}
        </p>
      )}

      {/* Disabled while in flight so a double-click cannot create two leads for one person. */}
      <div className="mt-[3vw] max-sm:mt-[8vw]">
        <Button type="submit" tone="dark" disabled={sending} className="max-sm:w-full">
          {sending ? 'Sending…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
