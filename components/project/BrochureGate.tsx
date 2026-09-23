'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { validateLead } from '@/app/api/lead/validate'
import { FormField } from './FormField'
import { SECTION_SCROLL_MT } from './section-anchor'
import { cn } from '@/lib/cn'

type Props = {
  projectSlug: string
  projectTitle: string
}

/**
 * `#brochure` — trades the project brochure for a contact detail.
 *
 * The PDF's URL is never rendered into this page's markup — not in an `href`, not hidden, not parked in
 * a `data-` attribute. It is resolved server-side by `POST /api/lead` and returned only in a successful
 * response, then used once to start the download. Any of those shortcuts would defeat the gate
 * entirely, because the URL would be sitting in the HTML for anyone to read out of view-source, and the
 * whole point is that the brochure is exchanged rather than merely unlinked.
 *
 * The download is triggered by a programmatically created anchor rather than a navigation, so the
 * visitor keeps their place on the page.
 *
 * Set as the layout's tinted panel — copy on the left, the action on the right — with the form, once
 * opened, on a cream card inside it, so the underline fields keep the light ground they are drawn for.
 */
export function BrochureGate({ projectSlug, projectTitle }: Props) {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return

    const data = new FormData(event.currentTarget)
    const local = validateLead({
      name: data.get('name'),
      phone: data.get('phone'),
      email: data.get('email'),
      source: 'brochure',
      projectSlug,
    })
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
      const payload: { ok?: boolean; errors?: Record<string, string>; brochureUrl?: string } =
        await response.json().catch(() => ({}))

      if (!response.ok || payload.ok !== true) {
        setErrors(payload.errors ?? { form: 'Something went wrong. Please call us instead.' })
        return
      }

      setDone(true)

      if (payload.brochureUrl) {
        const link = document.createElement('a')
        link.href = payload.brochureUrl
        link.download = `${projectSlug}-brochure.pdf`
        link.rel = 'noopener'
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
    } catch {
      setErrors({ form: 'Could not reach us just now. Please check your connection, or call instead.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="brochure" className={cn('container-page pb-32 max-lg:pb-20', SECTION_SCROLL_MT)}>
      <div className="grid grid-cols-12 items-center gap-x-[var(--gutter)] gap-y-8 rounded-card bg-tint p-12 max-md:p-6">
        <div className="col-span-12 lg:col-span-6">
          <p className="text-small text-navySoft">Project brochure</p>
          <h2 className="mt-3 font-heading text-h2 text-secondary max-sm:text-h2-sm">Get the {projectTitle} brochure</h2>
          <p className="mt-5 max-w-[520px] text-body text-secondary">
            Floor plans, specifications and pricing in one PDF. Tell us where to reach you and it downloads straight away.
          </p>
        </div>

        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          {done ? (
            <p role="status" className="rounded-card bg-primary p-8 font-heading text-h4 text-secondary max-sm:text-h4-sm">
              Thank you — your brochure download has started, and our team will follow up shortly.
            </p>
          ) : !open ? (
            <Button type="button" onClick={() => setOpen(true)}>
              Download Brochure
            </Button>
          ) : (
            <form onSubmit={onSubmit} aria-label="Brochure request form" noValidate className="space-y-7 rounded-card bg-primary p-8 max-sm:p-5">
              <FormField idPrefix="brochure" label="Name" name="name" type="text" required error={errors.name} />
              <FormField idPrefix="brochure" label="Phone number" name="phone" type="tel" required error={errors.phone} />
              <FormField idPrefix="brochure" label="Email" name="email" type="email" required={false} error={errors.email} />

              {/* Form-level failures (rate limit, server error, offline) belong here, not against a field. */}
              {errors.form && (
                <p role="alert" className="px-2 text-small text-secondary">
                  {errors.form}
                </p>
              )}

              {/* Disabled while in flight so a double-click cannot create two leads for one person. */}
              <Button type="submit" shape="block" disabled={sending}>
                {sending ? 'Sending…' : 'Send and download'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
