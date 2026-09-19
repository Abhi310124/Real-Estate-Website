'use client'
import { useRef, useState } from 'react'
import { validateLead } from '@/app/api/lead/validate'
import { DotOrnament } from '@/components/motion/DotOrnament'
import { Parallax } from '@/components/motion/Parallax'
import { SplitLines } from '@/components/motion/SplitLines'
import { Button } from '@/components/ui/Button'
import { CONTACT_INTAKE } from '@/lib/content/home'

/**
 * The enquiry intake: a sheet of paper laid over the section's own heading.
 *
 * This is the reference's most distinctive composition and almost none of it is in the form
 * markup — it is in where the form sits.
 *
 * **1. The card is inset and pulled up 576px over the heading.** Nine columns starting at column
 * four (x = 26%, w = 72.6% = 1045px), `-mt-[40vw]`, in the *same* twelve-column grid as the
 * heading block. Two children claiming columns 1–7 and 4–12 cannot share an implicit row, so the
 * card lands in row two and the negative margin drags it back up into row one. The card is opaque,
 * so it **crops the heading's three longest lines mid-word** — that is the composition, not a bug:
 * the sheet is on top of the page, and a heading that clears it entirely would leave the two
 * blocks merely adjacent. Do not "fix" the clipping by shortening the heading or lowering the card.
 *
 * **2. Its internal grid is NINE columns, not the page's twelve.** Field numbers sit at
 * `col-start-2` (x = 34.3%, w = 6.8%) and the field itself at `col-start-3 col-span-6`
 * (x = 42.5%, w = 47.9%). The 47.9% measure is what makes a rule under an input read as a line on
 * a form rather than as a divider: at the 80.8% our twelve-column version used, an 8-character
 * answer sat on a 1163px rule.
 *
 * **3. The section is white; only the card is paper.** The reference multiplies a paper
 * photograph (1045x1284, `mix-blend-multiply`, opacity 0.45) into a white card, which renders as
 * a flat warm off-white sheet on a pure white page. We have no texture asset, so the card ships as
 * a flat `offwhite` fill — the neutral equivalent of that render, and the exact case
 * `lib/tokens.ts` reserves the token for. The *section* is `bg-primary`: it was the only light
 * band on the page that was not white, and the white/black alternation is load-bearing. The 288px
 * `mt-[20vw]` approach gap replaces the old symmetric `py-[8vw]`; on the reference this section
 * carries zero vertical padding and buys its breathing room at the margin.
 *
 * **4. Numbered `01)`–`07)`, with the project type third.** The reference runs `01)`–`06)` with
 * its project-type group in third place, and the number is the label's companion in its own
 * column rather than a list marker. Ours reaches `07)` because we also ask for a phone number —
 * `validateLead` requires one, since a lead here is phoned back, not emailed. The number is the
 * row's *index*, computed here rather than read from the content, so interleaving the group can
 * never leave a hole in the series.
 *
 * **5. Everything on the sheet is 15.84px, in rgb(61,61,61).** Labels, numbers, options and the
 * rules are all the `label`/`mono` step and all `muted`; the only full-strength ink on the paper is
 * a validation error, and the only colour is the Submit button. Orange means "clickable" across the
 * whole site, so an error cannot borrow it without claiming to be one — it differs in value instead.
 * Labels at body size (23.04px) turn a compact intake sheet into a stack of sentences,
 * which is what ours read as before.
 *
 * **6. The panel title is mono at display size.** 31.68px `font-mono` at -10%, wrapping to two
 * lines in a 22.8vw column, against a 15.84px mono `01`. It is the only mono run above 15.84px on
 * the site, and that single step is where the panel gets its technical register from.
 *
 * Motion: the two supporting paragraphs reveal line by line, and the whole card is scrubbed 143px
 * downward across its scroll range, so the sheet drifts against the heading it covers. The heading
 * itself never animates — `SplitLines` masks exactly the line box, and at `line-height: 1` that
 * clips ascenders and descenders permanently.
 *
 * It posts to the same `/api/lead` route as every other form on the site and validates with the
 * same shared `validateLead`, so the client can never accept something the server would reject.
 * The server still validates independently — this is a courtesy, not a trust boundary.
 */

type IntakeField = (typeof CONTACT_INTAKE.fields)[number]

/** Sentinel for the one row that is a checkbox group rather than a single input. */
const PROJECT_TYPE = 'project-type'

type Row = IntakeField | typeof PROJECT_TYPE

// Positional on purpose: the group belongs in third place whatever the content file's field order
// happens to be, and splicing it in here keeps `CONTACT_INTAKE.fields` a flat list of real inputs.
const ROWS: readonly Row[] = [
  ...CONTACT_INTAKE.fields.slice(0, 2),
  PROJECT_TYPE,
  ...CONTACT_INTAKE.fields.slice(2),
]

// One nine-column row of the card. Six below `sm`, where the number slides out to the first column
// and the field takes the other five — the widest a typed answer can be while the numbering still
// reads as its own column.
const ROW = 'grid grid-cols-6 gap-[var(--gutter)] sm:grid-cols-9'
const NUMBER_CELL = 'col-span-1 col-start-1 sm:col-start-2'
const FIELD_CELL = 'col-span-5 sm:col-span-6 sm:col-start-3'
const ROW_GAP = 'mb-[12vw] sm:mb-[6vw]'

const NUMBER = 'font-mono text-mono text-muted max-sm:text-mono-sm'
const LABEL = 'block text-label max-sm:text-label-sm'

// Underline-only, and the rule is `muted` rather than `edge`: on the reference every field rule is
// the same rgb(61,61,61) as the type sitting above it, which is what makes the form read as ruled
// paper. At `edge` (#BCBEBE) on this sheet the rules all but disappear.
//
// The reference sets `focus:outline-none` and shows no focus state at all. A keyboard-only visitor
// filling in six fields with no indication of where they are is not a trade this site makes, so the
// rule darkens to black AND a focus ring is drawn — `focus-visible`, so a pointer user never sees
// either.
const INPUT =
  'w-full rounded-none border-0 bg-transparent font-mono text-label text-muted outline-none ' +
  'transition-colors duration-150 ease-in-out ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary ' +
  'max-sm:text-label-sm'

type Props = {
  /**
   * One verified contact fact for the card's closing stamp row — pass `settings.phones[0]` from
   * `getSiteSettings()`. Optional because this is a client component (the form owns state) and so
   * cannot read the data source itself; the stamp is left out rather than invented when no caller
   * supplies one.
   */
  contact?: string
}

export function ContactIntake({ contact }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [types, setTypes] = useState<string[]>([])

  // The untransformed grid child, handed to `Parallax` as its trigger. The card inside it carries
  // the scrub transform, and measuring the scroll range against a box the tween is moving is
  // circular.
  const anchor = useRef<HTMLDivElement>(null)

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

  return (
    <section data-contact-intake className="mt-[20vw] w-full bg-primary text-secondary">
      <div className="layout-grid">
        {/* Seven columns = a 56.1vw measure, which wraps this 64-character line to five lines.
            At the nine it had before, the same string at the same size made three wide banners. */}
        <div className="col-span-12 sm:col-span-7">
          <h2 className="text-display-lg font-display max-sm:text-display-sm-lg">
            {CONTACT_INTAKE.heading}
          </h2>

          {/* A seven-track grid inside a seven-column block reproduces the page's own column
              rhythm exactly, so this paragraph's 23.3vw measure lands on real column edges.
              Left visible below `sm` where the reference hides it: what happens after you send
              the form matters most to the visitor least able to see the whole page. */}
          <div className="grid grid-cols-7 gap-[var(--gutter)]">
            <div className="col-span-7 mt-[10vw] sm:col-span-3">
              <SplitLines
                text={CONTACT_INTAKE.intro}
                className="text-body max-sm:text-body-sm"
              />
              {/* Second paragraph, not a second block: it answers the objection the first one
                  raises, so it sits a line apart rather than at another 144px. */}
              <SplitLines
                text={CONTACT_INTAKE.support}
                className="mt-[1.6vw] text-body max-sm:mt-[5vw] max-sm:text-body-sm"
              />
            </div>
          </div>
        </div>

        {/* `sm:` rather than `max-sm:` for the pull-up, because a negative and a positive margin
            on the same property should not depend on Tailwind's variant ordering to resolve. The
            overlap is a desktop composition: 40vw at 390px would drop the sheet straight onto the
            paragraph above it. */}
        {/* 16.6vw = the 239px the reference leaves between the card's resting bottom edge and the
            section's, which is the clearance the downward scrub below travels into. Without it the
            sheet slides 143px into the black footer, which reads as a bug rather than a
            composition. */}
        <div
          ref={anchor}
          className="col-span-12 mt-[14vw] mb-[16.6vw] sm:col-span-9 sm:col-start-4 sm:-mt-[40vw]"
        >
          {/* 0.112 of the card's own height = 143.8px on the measured 1284px card, drifting
              downward over the span of scroll during which the card can be on screen.
              `relative` is for the paper-texture layer this sheet is still missing: the reference
              covers the whole card with a `mix-blend-multiply` paper photograph at opacity 0.45,
              and it wants `absolute inset-0` inside this box. */}
          <Parallax
            speed={0.112}
            trigger={anchor}
            className="relative bg-offwhite px-[var(--margin)] pb-[10vw] pt-[12vw] text-muted sm:px-0 sm:pb-[2.5vw] sm:pt-[5vw]"
          >
            <div className={`${ROW} mb-[15vw] sm:mb-[7vw]`}>
              <div className={NUMBER_CELL}>
                <span aria-hidden="true" className={NUMBER}>
                  01
                </span>
              </div>

              <div className="col-span-5 sm:col-span-3 sm:col-start-3">
                <h3 className="font-mono text-mono-lg max-sm:text-lead-sm">
                  {CONTACT_INTAKE.formTitle}
                </h3>
              </div>

              {/* The wordmark, weight 400: the reference has no visible 500 at this size, and an
                  emboldened 31.68px is the fastest way to lose the palette's composure. */}
              <div className="col-span-6 mt-[6vw] flex items-center justify-end gap-[2vw] sm:col-span-3 sm:col-start-8 sm:mt-0 sm:justify-start sm:gap-[1vw]">
                <span className="text-lead max-sm:text-lead-sm">BKR</span>
                <DotOrnament size="md" />
              </div>
            </div>

            {done ? (
              <div className={`${ROW} ${ROW_GAP}`}>
                <p role="status" className={`${FIELD_CELL} text-lead max-sm:text-lead-sm`}>
                  Thank you — we have your details and will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} aria-label="Project enquiry" noValidate>
                {ROWS.map((row, index) => {
                  const n = String(index + 1).padStart(2, '0')

                  if (row === PROJECT_TYPE) {
                    return (
                      <fieldset key={row} className={`${ROW} ${ROW_GAP}`}>
                        <legend className="sr-only">Project type</legend>
                        <div className={NUMBER_CELL}>
                          <span aria-hidden="true" className={NUMBER}>
                            {n})
                          </span>
                        </div>
                        <div className={FIELD_CELL}>
                          <span aria-hidden="true" className={LABEL}>
                            Project type
                          </span>
                          {/* Two options per row, each in three of the field cell's six tracks,
                              so the pairs align with the column edges the rules sit on. */}
                          <div className="mt-[4vw] grid grid-cols-2 gap-[var(--gutter)] sm:mt-[1vw] sm:grid-cols-6">
                            {CONTACT_INTAKE.projectTypes.map((type) => (
                              <label
                                key={type}
                                className="col-span-1 flex cursor-pointer items-center gap-[4vw] text-label max-sm:text-label-sm sm:col-span-3 sm:gap-[2.5vw]"
                              >
                                <input
                                  type="checkbox"
                                  name="projectType"
                                  value={type}
                                  checked={types.includes(type)}
                                  onChange={(e) =>
                                    setTypes((prev) =>
                                      e.target.checked ? [...prev, type] : prev.filter((t) => t !== type)
                                    )
                                  }
                                  // `appearance-none` is what keeps this monochrome — a native
                                  // checkbox paints the OS accent colour and there is no CSS to
                                  // override it. The reference draws its boxes filled grey at
                                  // rest; an outline that fills solid says checked/unchecked
                                  // without relying on a value judgement about two greys.
                                  className="size-[1vw] shrink-0 appearance-none rounded-none border border-muted bg-transparent checked:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary max-sm:size-[4vw]"
                                />
                                {type}
                              </label>
                            ))}
                          </div>
                        </div>
                      </fieldset>
                    )
                  }

                  const errorId = `intake-${row.name}-error`

                  return (
                    <div key={row.name} className={`${ROW} ${ROW_GAP}`}>
                      <div className={NUMBER_CELL}>
                        <span aria-hidden="true" className={NUMBER}>
                          {n})
                        </span>
                      </div>

                      <div className={FIELD_CELL}>
                        <label htmlFor={`intake-${row.name}`} className={LABEL}>
                          {row.label}
                        </label>

                        {row.type === 'textarea' ? (
                          // Three ruled lines rather than one: the reference sets the textarea's
                          // leading to the rule pitch (2.5vw = 36px) and lays an absolutely
                          // positioned stack of three bordered rows behind it, so the answer is
                          // written ON the paper's ruling. `block` is load-bearing — a textarea
                          // is inline by default and its baseline gap would put every rule a few
                          // pixels out of register with the text.
                          <div className="relative mt-[2vw] sm:mt-[0.5vw]">
                            <textarea
                              id={`intake-${row.name}`}
                              name={row.name}
                              rows={3}
                              aria-invalid={errors[row.name] ? true : undefined}
                              aria-describedby={errors[row.name] ? errorId : undefined}
                              className={`${INPUT} relative z-10 block resize-none leading-[8vw] sm:leading-[2.5vw]`}
                            />
                            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0">
                              <div className="h-[8vw] border-b border-muted sm:h-[2.5vw]" />
                              <div className="h-[8vw] border-b border-muted sm:h-[2.5vw]" />
                              <div className="h-[8vw] border-b border-muted sm:h-[2.5vw]" />
                            </div>
                          </div>
                        ) : (
                          <input
                            id={`intake-${row.name}`}
                            name={row.name}
                            type={row.type}
                            inputMode={row.type === 'tel' ? 'tel' : undefined}
                            autoComplete={
                              row.type === 'tel'
                                ? 'tel'
                                : row.type === 'email'
                                  ? 'email'
                                  : row.name === 'name'
                                    ? 'name'
                                    : undefined
                            }
                            aria-invalid={errors[row.name] ? true : undefined}
                            aria-describedby={errors[row.name] ? errorId : undefined}
                            // Leading is set past the `label` step's own 1.0: the measured input
                            // box is 20px, and on a line box narrower than the ink an input clips
                            // its own descenders against the rule underneath them.
                            className={`${INPUT} mt-[2vw] border-b border-muted pb-[1vw] leading-[4.5vw] focus:border-secondary sm:mt-[0.5vw] sm:pb-[0.25vw] sm:leading-[1.4vw]`}
                          />
                        )}

                        {errors[row.name] && (
                          // Full-strength navy against the sheet's muted ink, rather than the
                          // accent: orange is reserved for clickables, so an error painted in it
                          // would read as a button.
                          <p
                            id={errorId}
                            role="alert"
                            className="mt-[3vw] text-label text-secondary max-sm:text-label-sm sm:mt-[0.8vw]"
                          >
                            {errors[row.name]}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}

                <div className={`${ROW} mb-[8vw] sm:mb-[2vw]`}>
                  <div className="col-span-5 col-start-2 sm:col-span-6 sm:col-start-3">
                    {errors.form && (
                      <p role="alert" className="mb-[5vw] text-label text-secondary max-sm:text-label-sm sm:mb-[1.6vw]">
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

            {/* Closing stamps, ruled off across the full width of the sheet. Outside the form on
                purpose: they belong to the paper, so they survive the form being replaced by its
                confirmation. Each sits centred in its own cell, which is what puts the three at
                31.2% / 59.6% / 79.8% of the viewport. */}
            <div className={`${ROW} mb-[4vw] border-t border-muted pt-[6vw] sm:mb-[1vw] sm:pt-[2vw]`}>
              <div className="col-span-2 flex justify-center">
                <span className="font-mono text-mono max-sm:text-mono-sm">BKR INFRA</span>
              </div>
              <div className="col-span-2 flex justify-center sm:col-span-3 sm:col-start-4">
                <span className="font-mono text-mono max-sm:text-mono-sm">THANK YOU</span>
              </div>
              <div className="col-span-5 ml-[3vw] flex justify-start sm:col-span-3 sm:col-start-7 sm:ml-0 sm:justify-center">
                {contact && <span className="font-mono text-mono max-sm:text-mono-sm">{contact}</span>}
              </div>
            </div>
          </Parallax>
        </div>
      </div>
    </section>
  )
}
