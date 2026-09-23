'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { validateLead } from '@/app/api/lead/validate'
import { getGsap } from '@/components/motion/gsap'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { ENQUIRY } from '@/lib/content/home'

/**
 * The enquiry block that closes every page: a frame with a 32px top radius, ruled by thin vertical
 * lines, whose two central panels open like doors as it arrives — revealing the form behind them.
 *
 * ## The doors
 *
 * The layout draws the frame as two halves, each ruled down its middle. Closed, the lines stand at
 * 25 / 50 / 75%; as the block comes into view (its top at 70% of the viewport) each half narrows to a
 * quarter, over 800ms on the `door` curve, leaving lines at 12.5 / 25 / 75 / 87.5% and the centre open —
 * and the form's contents lift 25px, 100ms behind.
 *
 * Here the halves are also literal doors: as each narrows to its quarter it swings 20° about its OUTER
 * edge, in perspective, so the panels visibly turn away into the page rather than sliding flat. The
 * narrowing is the reference's own geometry, so the lines land exactly where it puts them; the swing
 * is kept to 20° because a plane turned much further foreshortens its own 1px rules into nothing. The
 * panels carry a faint veil of the page colour, so closed they read as surfaces in front of the form.
 *
 * ## What can never happen
 *
 * The doors are decoration. They are `pointer-events-none`, they render OPEN from the server (so no
 * script, a failed chunk and reduced motion all get a usable form), and they only close ahead of an
 * opening that is about to run: if the block is already on screen when script arrives — a restored
 * scroll position, a deep link — it is left open. Tabbing into the form flings them open too. Below
 * 1024px, where the form spans the frame, there are no doors at all, as on the reference.
 *
 * ## The form
 *
 * Name, email, phone, the kind of property, a message. It posts to `/api/lead` and validates with the
 * same shared `validateLead` the server uses, so the client can never accept what the server would
 * reject; the server still validates independently. The chosen property types are folded into the
 * message, because the lead record has no field for them.
 */

/** Degrees each door swings to as it opens. */
const OPEN_DEG = 20

type Props = {
  /** Anchor id for the header's "Enquire Now". One per page. */
  id?: string
  heading?: { text: string; accent: string }
  intro?: string
  className?: string
}

export function EnquiryDoors({ id = 'enquire', heading = ENQUIRY.heading, intro = ENQUIRY.intro, className }: Props) {
  const frame = useRef<HTMLDivElement>(null)
  const left = useRef<HTMLDivElement>(null)
  const right = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !frame.current || !left.current || !right.current || !content.current) return
    if (!window.matchMedia('(min-width: 1024px)').matches) return
    const el = frame.current
    const doors = [left.current, right.current]
    const inner = Array.from(content.current.children) as HTMLElement[]
    // Already past the trigger line: never close doors the visitor is looking at.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.7) return

    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        gsap.set(doors, { width: '50%', rotationY: 0 })
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 70%', once: true } })
        tl.to(left.current, { width: '25%', rotationY: OPEN_DEG, duration: 0.8, ease: 'door' }, 0)
          .to(right.current, { width: '25%', rotationY: -OPEN_DEG, duration: 0.8, ease: 'door' }, 0)
          .fromTo(inner, { y: 0 }, { y: -25, duration: 0.8, ease: 'door' }, 0.1)
        // A keyboard visitor who reaches the form before the doors have opened gets them open at once.
        const onFocus = () => tl.progress(1)
        el.addEventListener('focusin', onFocus)
        kill = () => {
          el.removeEventListener('focusin', onFocus)
          tl.scrollTrigger?.kill()
          tl.kill()
          gsap.set(doors, { clearProps: 'transform,width' })
          gsap.set(inner, { clearProps: 'transform' })
        }
      })
      .catch((err) => console.error('[EnquiryDoors] doors unavailable; the form renders open', err))

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced])

  const line = 'absolute inset-y-0 w-px bg-navyLine'

  return (
    <section id={id} className={cn('scroll-mt-[calc(var(--header-h)+24px)] pb-24 pt-10 max-lg:pb-16', className)}>
      <div className="container-page">
        <div ref={frame} className="relative">
          {/* Decoration layer: the frame's outline and the two doors, fading out toward the foot. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-clip rounded-t-frame [mask-image:linear-gradient(to_bottom,#000_72%,transparent)] [perspective:1600px]"
          >
            <div className="absolute inset-0 rounded-t-frame border border-b-0 border-navyLine" />
            <div
              ref={left}
              className="absolute inset-y-0 left-0 border-r border-navyLine bg-primary/60 max-lg:hidden"
              style={{ width: '25%', transformOrigin: '0% 50%', transform: `rotateY(${OPEN_DEG}deg)` }}
            >
              <span className={cn(line, 'left-1/2')} />
            </div>
            <div
              ref={right}
              className="absolute inset-y-0 right-0 border-l border-navyLine bg-primary/60 max-lg:hidden"
              style={{ width: '25%', transformOrigin: '100% 50%', transform: `rotateY(${-OPEN_DEG}deg)` }}
            >
              <span className={cn(line, 'left-1/2')} />
            </div>
          </div>

          <div ref={content} className="relative mx-auto max-w-[426px] px-5 pb-40 pt-28 max-lg:pb-24 max-lg:pt-16">
            <h2 className="text-center font-heading text-h2 text-secondary max-sm:text-h2-sm">
              <span className="block">{heading.text}</span>
              <span className="block text-accentInk">{heading.accent}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-[370px] text-center text-body text-secondary">{intro}</p>
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  name,
  label,
  type = 'text',
  error,
  autoComplete,
  inputMode,
}: {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel'
  error?: string
  autoComplete?: string
  inputMode?: 'tel' | 'email'
}) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        placeholder=" "
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="peer block w-full rounded-none border-0 border-b border-navyLine bg-transparent px-2 pb-2 pt-6 text-body text-secondary outline-none transition-[border-color,box-shadow] duration-300 focus:border-secondary focus:shadow-[inset_0_-1px_0_theme(colors.secondary)]"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-2 top-6 origin-left text-body text-muted transition-all duration-300 ease-door peer-focus:top-0 peer-focus:text-caption peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-caption"
      >
        {label}
      </label>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-left text-small text-secondary">
          {error}
        </p>
      )}
    </div>
  )
}

function EnquiryForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const messageId = useId()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return
    const data = new FormData(event.currentTarget)
    const types = data.getAll('queryType').map(String)
    const message = [types.length ? `Interested in: ${types.join(', ')}` : null, data.get('message')]
      .filter(Boolean)
      .join('\n')

    const local = validateLead({
      name: data.get('name'),
      phone: data.get('phone'),
      email: data.get('email'),
      message,
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

  if (done) {
    return (
      <p role="status" className="mt-16 text-center font-heading text-h4 text-secondary max-sm:text-h4-sm">
        Thank you — we have your details and will be in touch shortly.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Enquiry" className="mt-16 space-y-6 text-left max-lg:mt-10">
      <Field name="name" label="Name" autoComplete="name" error={errors.name} />
      <Field name="email" label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email} />
      <Field name="phone" label="Phone number" type="tel" autoComplete="tel" inputMode="tel" error={errors.phone} />

      <fieldset className="pt-2">
        <legend className="px-2 text-body text-muted">Type of property</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {ENQUIRY.queryTypes.map((type) => (
            <label
              key={type}
              className="cursor-pointer rounded-card border border-navyLine px-3 py-1.5 text-small text-muted transition-colors duration-300 hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-secondary has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-secondary"
            >
              <input type="checkbox" name="queryType" value={type} className="sr-only" />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="relative pt-2">
        <label htmlFor={messageId} className="block px-2 text-body text-muted">
          Message
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={3}
          className="mt-1 block w-full resize-y rounded-none border-0 border-b border-navyLine bg-transparent px-2 py-2 text-body text-secondary outline-none transition-[border-color,box-shadow] duration-300 focus:border-secondary focus:shadow-[inset_0_-1px_0_theme(colors.secondary)]"
        />
      </div>

      {errors.form && (
        <p role="alert" className="text-small text-secondary">
          {errors.form}
        </p>
      )}

      <div className="pt-4">
        <Button type="submit" shape="block" disabled={sending}>
          {sending ? 'Sending…' : 'Submit'}
        </Button>
      </div>
    </form>
  )
}
