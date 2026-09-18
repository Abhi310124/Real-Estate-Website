'use client'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { validateLead } from '@/app/api/lead/validate'

type Props = {
  projectSlug: string
  projectTitle: string
}

/**
 * Trades the project brochure for a contact detail.
 *
 * The PDF's URL is never rendered into this page's markup — not in an `href`, not hidden, not
 * parked in a `data-` attribute. It is resolved server-side by `POST /api/lead` and returned
 * only in a successful response, then used once to start the download. Any of those shortcuts
 * would defeat the gate entirely, because the URL would be sitting in the HTML for anyone to
 * read out of view-source, and the whole point is that the brochure is exchanged rather than
 * merely linked.
 *
 * The download is triggered by a programmatically created anchor rather than a navigation so
 * the visitor stays on the page with their place in it intact.
 */
export function BrochureGate({ projectSlug, projectTitle }: Props) {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

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
    <section id="brochure" ref={triggerRef} className="scroll-mt-[180px] bg-navy-800 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow className="text-champagne">Project Brochure</Eyebrow>
        <h2 className="mt-3 font-display-expanded text-display-md text-white">
          Get the {projectTitle} brochure
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body text-white/80">
          Floor plans, specifications and pricing in one PDF. Tell us where to reach you and it
          downloads straight away.
        </p>

        {done ? (
          <p role="status" className="mt-8 text-body text-white">
            Thank you — your brochure download has started, and our team will follow up shortly.
          </p>
        ) : !open ? (
          <div className="mt-8">
            <Button type="button" onClick={() => setOpen(true)}>
              Download Brochure
            </Button>
          </div>
        ) : (
          // The fields sit on an ivory card so `Field`'s navy labels and error text keep their
          // contrast — they are designed against a light control background, and dropping them
          // straight onto navy would make both unreadable.
          <form
            onSubmit={onSubmit}
            aria-label="Brochure request form"
            noValidate
            className="mx-auto mt-8 max-w-md space-y-5 rounded-sm bg-ivory p-6 text-left"
          >
            <Field label="Full Name" name="name" type="text" required error={errors.name} />
            <Field label="Phone Number" name="phone" type="tel" required error={errors.phone} />
            <Field label="Email Address" name="email" type="email" required={false} error={errors.email} />

            {errors.form && (
              <p role="alert" className="text-sm text-navy-800">
                {errors.form}
              </p>
            )}

            <Button type="submit" disabled={sending} className="w-full">
              {sending ? 'Sending…' : 'Send and download'}
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
