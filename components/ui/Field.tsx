import { cn } from '@/lib/cn'

type FieldType = 'text' | 'tel' | 'email' | 'textarea'

type Props = {
  label: string
  name: string
  type: FieldType
  required: boolean
  /** Validation message, if any. Task 18 builds this component's markup only — Task 21 wires
   *  up the real form state and decides when `error` is actually populated. */
  error?: string
  placeholder?: string
  className?: string
}

/*
 * A ruled line, not a box. The reference's intake fields are a single 1px bottom border in `muted`
 * with no fill, no outline and no corner radius — the field is a line you write on, which is the
 * same drafting register the rest of the page is in. A bordered, rounded, filled input next to that
 * type reads as a web form dropped into an editorial layout.
 *
 * `min-h-11` (44px) is kept for the touch-target minimum even though the visible line is 1px.
 */
const CONTROL_CLASS =
  'mt-[0.8vw] block min-h-11 w-full rounded-none border-0 border-b border-muted bg-transparent py-[0.6vw] text-body text-secondary placeholder:text-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current max-sm:mt-[3vw] max-sm:py-[2vw] max-sm:text-body-sm'

// autoComplete per field name — `tel`/`email` map straight from `type`; `name` and `message`
// are inferred from the field's own `name` prop since neither is a distinct `type`.
function autoCompleteFor(name: string, type: FieldType): string | undefined {
  if (type === 'tel') return 'tel'
  if (type === 'email') return 'email'
  if (name === 'name') return 'name'
  return undefined
}

/**
 * A genuine `<label for>` (never placeholder-as-label — a placeholder disappears the instant
 * a value is typed, taking the field's only name with it) wired to one control, `aria-invalid`
 * and `aria-describedby` appearing only once `error` is actually set. `inputMode="tel"` brings
 * up a phone keypad on mobile for `type="tel"`; `autoComplete` lets a returning visitor's
 * browser fill every field without retyping.
 *
 * **The invalid state is deliberately not carried by the accent, and that is the constraint worth
 * stating.** There IS one hue in this palette now, and it is spoken for: orange means "clickable"
 * everywhere on the site. Turning an invalid field orange would say the field is a button. So the
 * error signal is value and words instead — the rule thickens to `border-secondary` at full navy and
 * the message states the problem. WCAG 1.4.1 requires that colour never be the ONLY signal anyway,
 * and `required`/`aria-invalid` on the control plus `role="alert"` on the message carry it to
 * assistive tech independently of any visual treatment.
 */
export function Field({ label, name, type, required, error, placeholder, className }: Props) {
  const controlId = `field-${name}`
  const errorId = `${controlId}-error`

  const shared = {
    id: controlId,
    name,
    required,
    placeholder,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: cn(CONTROL_CLASS, error && 'border-secondary'),
  }

  return (
    <div className={className}>
      <label htmlFor={controlId} className="block text-label text-secondary max-sm:text-label-sm">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1">
            *
          </span>
        )}
      </label>

      {type === 'textarea' ? (
        <textarea rows={5} {...shared} />
      ) : (
        <input type={type} inputMode={type === 'tel' ? 'tel' : undefined} autoComplete={autoCompleteFor(name, type)} {...shared} />
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-[0.5vw] flex items-center gap-[0.4vw] text-label text-secondary max-sm:mt-[2vw] max-sm:gap-[1.5vw] max-sm:text-label-sm">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  )
}
