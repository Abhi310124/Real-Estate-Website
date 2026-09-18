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
 * On grained `offwhite` paper rather than as a black or white chapter, for three reasons. It is the
 * treatment `ContactIntake` established for a form on this site — a sheet laid on the page rather than
 * another chapter of it. It means the underline fields keep the light ground they are designed against.
 * And it makes the page's black/white alternation survive this section being absent: a project with no
 * brochure hands `#updates` (white) straight to `#location` (black) either way.
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
    <section
      id="brochure"
      className={cn('paper-grain w-full bg-offwhite py-[8vw] text-secondary max-sm:py-[16vw]', SECTION_SCROLL_MT)}
    >
      <div className="layout-grid">
        <p className="col-span-12 font-mono text-mono uppercase text-muted max-sm:text-mono-sm sm:col-span-3">
          Project Brochure
        </p>

        <div className="col-span-12 sm:col-span-7 sm:col-start-5">
          <h2 className="text-display-lg font-display max-sm:mt-[6vw] max-sm:text-display-sm-lg">
            Get the {projectTitle} brochure
          </h2>
          <p className="mt-[2vw] text-body text-muted max-sm:mt-[6vw] max-sm:text-body-sm">
            Floor plans, specifications and pricing in one PDF. Tell us where to reach you and it
            downloads straight away.
          </p>

          {done ? (
            <p role="status" className="mt-[3vw] text-lead font-display max-sm:mt-[8vw] max-sm:text-lead-sm">
              Thank you — your brochure download has started, and our team will follow up shortly.
            </p>
          ) : !open ? (
            <div className="mt-[3vw] max-sm:mt-[8vw]">
              <Button type="button" tone="dark" onClick={() => setOpen(true)}>
                Download Brochure
              </Button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              aria-label="Brochure request form"
              noValidate
              className="mt-[3vw] max-sm:mt-[8vw]"
            >
              <FormField
                idPrefix="brochure"
                n="01"
                label="Full Name"
                name="name"
                type="text"
                required
                error={errors.name}
              />
              <div className="mt-[3vw] max-sm:mt-[8vw]">
                <FormField
                  idPrefix="brochure"
                  n="02"
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  required
                  error={errors.phone}
                />
              </div>
              <div className="mt-[3vw] max-sm:mt-[8vw]">
                <FormField
                  idPrefix="brochure"
                  n="03"
                  label="Email Address"
                  name="email"
                  type="email"
                  required={false}
                  error={errors.email}
                />
              </div>

              {/* Form-level failures (rate limit, server error, offline) belong here rather than
                  against any one field, since no single control caused them. */}
              {errors.form && (
                <p role="alert" className="mt-[2vw] text-label max-sm:mt-[6vw] max-sm:text-label-sm">
                  {errors.form}
                </p>
              )}

              <div className="mt-[3vw] max-sm:mt-[8vw]">
                {/* Disabled while in flight so a double-click cannot create two leads for one person. */}
                <Button type="submit" tone="dark" disabled={sending} className="max-sm:w-full">
                  {sending ? 'Sending…' : 'Send and download'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
