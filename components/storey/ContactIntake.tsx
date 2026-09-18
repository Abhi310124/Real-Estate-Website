'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { validateLead } from '@/app/api/lead/validate'
import { CONTACT_INTAKE } from '@/lib/content/home'

/**
 * The intake form, on cream paper — the reference's most distinctive page.
 *
 * Four details carry it, and each is the opposite of a conventional form:
 *
 * 1. **Numbered fields.** `01)` … `06)` in mono, in their own grid column to the left of the input.
 *    The number is the label's companion, not a list marker.
 * 2. **Underline-only inputs.** No box, no fill, no radius — a rule under a transparent input, so
 *    the form reads as a filled-in document rather than a web form.
 * 3. **Square checkboxes.** `appearance-none` with a border, filling solid when checked. A native
 *    checkbox would import the OS's rounded blue accent and break the monochrome immediately.
 * 4. **Paper, not white.** `offwhite` (#F2F2F2) against the site's pure white, plus a `paper-grain`
 *    speckle, so the form reads as a sheet laid on the page rather than as another section. At the
 *    #FEFEFE originally measured off the reference's DOM it was indistinguishable from the page.
 *
 * It posts to the same `/api/lead` route as every other form on the site and validates with the
 * same shared `validateLead`, so the client can never accept something the server would reject.
 * The server still validates independently — this is a courtesy, not a trust boundary.
 */
export function ContactIntake() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [types, setTypes] = useState<string[]>([])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return

    const data = new FormData(event.currentTarget)
    // Project types and the free-text answers are folded into `message`, because LeadInput has no
    // field for them and inventing one would put shape in the type that the CMS cannot store.
    const extras = [
      types.length ? `Project type: ${types.join(', ')}` : null,
      data.get('location') ? `Location: ${data.get('location')}` : null,
      data.get('timeline') ? `Timeline: ${data.get('timeline')}` : null,
      data.get('message'),
    ]
      .filter(Boolean)
      .join('\n')

    const local = validateLead({
      name: data.get('name'),
      phone: data.get('phone'),
      email: data.get('email'),
      message: extras,
      source: 'enquiry',
    })
    if (!local.ok) {
      setErrors(local.errors)
      return
    }

    setErrors({})
    setSending(true)
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(local.value),
      })
      const payload: { ok?: boolean; errors?: Record<string, string> } = await res.json().catch(() => ({}))
      if (!res.ok || payload.ok !== true) {
        setErrors(payload.errors ?? { form: 'Something went wrong. Please call us instead.' })
        return
      }
      setDone(true)
    } catch {
      setErrors({ form: 'Could not reach us just now. Please check your connection, or call instead.' })
    } finally {
      setSending(false)
    }
  }

  const INPUT =
    'w-full rounded-none border-0 border-b bg-transparent pb-[0.6vw] text-body text-secondary ' +
    'border-edge outline-none transition-colors duration-150 ease-in-out ' +
    'focus:border-secondary focus-visible:outline-none placeholder:text-muted/40 ' +
    'max-sm:pb-[2vw] max-sm:text-body-sm'

  return (
    <section data-contact-intake className="paper-grain w-full bg-offwhite py-[8vw] text-secondary max-sm:py-[16vw]">
      <div className="layout-grid">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-9">
          {CONTACT_INTAKE.heading}
        </h2>
      </div>

      {done ? (
        <div className="layout-grid mt-[6vw]">
          <p role="status" className="col-span-12 text-lead sm:col-span-8 max-sm:text-lead-sm">
            Thank you — we have your details and will be in touch shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} aria-label="Project enquiry" noValidate className="mt-[6vw] max-sm:mt-[14vw]">
          {/* Project type: square checkboxes, two columns, matching the reference. */}
          <fieldset className="layout-grid">
            <legend className="sr-only">Project type</legend>
            <span aria-hidden="true" className="col-span-2 font-mono text-mono text-muted max-sm:col-span-3 max-sm:text-mono-sm">
              00)
            </span>
            <span className="col-span-10 text-body max-sm:col-span-9 max-sm:text-body-sm">Project type</span>
            <div className="col-span-10 col-start-3 mt-[1.6vw] grid grid-cols-2 gap-y-[0.8vw] max-sm:col-span-9 max-sm:col-start-4 max-sm:mt-[4vw] max-sm:grid-cols-1 max-sm:gap-y-[3vw]">
              {CONTACT_INTAKE.projectTypes.map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-[0.8vw] text-body max-sm:gap-[3vw] max-sm:text-body-sm">
                  <input
                    type="checkbox"
                    name="projectType"
                    value={type}
                    checked={types.includes(type)}
                    onChange={(e) =>
                      setTypes((prev) => (e.target.checked ? [...prev, type] : prev.filter((t) => t !== type)))
                    }
                    // appearance-none is what keeps this monochrome — a native checkbox paints the
                    // OS accent colour and there is no CSS to override it.
                    className="size-[1vw] shrink-0 appearance-none rounded-none border border-secondary bg-transparent checked:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary max-sm:size-[4vw]"
                  />
                  {type}
                </label>
              ))}
            </div>
          </fieldset>

          {CONTACT_INTAKE.fields.map((field) => (
            <div key={field.name} className="layout-grid mt-[5vw] max-sm:mt-[10vw]">
              <span
                aria-hidden="true"
                className="col-span-2 font-mono text-mono text-muted max-sm:col-span-3 max-sm:text-mono-sm"
              >
                {field.n})
              </span>
              <div className="col-span-10 max-sm:col-span-9">
                <label htmlFor={`intake-${field.name}`} className="block text-body max-sm:text-body-sm">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={`intake-${field.name}`}
                    name={field.name}
                    rows={3}
                    aria-invalid={errors[field.name] ? true : undefined}
                    aria-describedby={errors[field.name] ? `intake-${field.name}-error` : undefined}
                    className={`${INPUT} mt-[1.2vw] resize-none max-sm:mt-[4vw]`}
                  />
                ) : (
                  <input
                    id={`intake-${field.name}`}
                    name={field.name}
                    type={field.type}
                    inputMode={field.type === 'tel' ? 'tel' : undefined}
                    autoComplete={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : field.name === 'name' ? 'name' : undefined}
                    aria-invalid={errors[field.name] ? true : undefined}
                    aria-describedby={errors[field.name] ? `intake-${field.name}-error` : undefined}
                    className={`${INPUT} mt-[1.2vw] max-sm:mt-[4vw]`}
                  />
                )}
                {errors[field.name] && (
                  <p id={`intake-${field.name}-error`} role="alert" className="mt-[0.8vw] text-label max-sm:mt-[3vw] max-sm:text-label-sm">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="layout-grid mt-[5vw] max-sm:mt-[10vw]">
            <div className="col-span-10 col-start-3 max-sm:col-span-9 max-sm:col-start-4">
              {errors.form && (
                <p role="alert" className="mb-[1.6vw] text-label max-sm:mb-[5vw] max-sm:text-label-sm">
                  {errors.form}
                </p>
              )}
              <Button type="submit" disabled={sending} tone="dark">
                {sending ? 'Sending…' : 'Submit'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </section>
  )
}
