import { cn } from '@/lib/cn'

/**
 * A field in the monochrome form treatment, shared by `BrochureGate` and `EnquiryForm`.
 *
 * This deliberately does not use `components/ui/Field.tsx`. Field is a boxed control — a filled
 * white input with a border and a rounded corner, labelled in `text-sm font-medium` — which is a
 * different design language from the one the finished home page settled on. `ContactIntake.tsx` is
 * the reference for a form here, and its fields are:
 *
 *   1. **Numbered.** `01)` … in mono at -10% tracking, in its own narrow column to the left of the
 *      control. The number is the label's companion, not a list marker, so it is `aria-hidden` —
 *      a screen reader announcing "zero one" before every label adds nothing.
 *   2. **Underline-only.** A transparent input over a single hairline. No box, no fill, no radius,
 *      so the form reads as a document being filled in rather than as a web form.
 *
 * Colours are the light-chapter pairing (`border-edge` at rest, `border-secondary` on focus) rather
 * than `currentColor`, matching ContactIntake — Tailwind v3 cannot apply an opacity modifier to
 * `currentColor`, so a tone-agnostic hairline is not expressible. Both forms that use this sit on
 * `offwhite` paper, which is what makes that safe.
 *
 * Error text carries no colour of its own. With no accent left in the palette, hue cannot signal
 * "invalid" — `aria-invalid` on the control and `role="alert"` on the message do that, and they
 * work for everyone rather than only for sighted users with normal colour vision.
 */

export type FormFieldType = 'text' | 'tel' | 'email' | 'textarea'

type Props = {
  /** Two-digit ordinal shown in mono beside the field, e.g. `01`. Decorative. */
  n: string
  label: string
  name: string
  type: FormFieldType
  required: boolean
  /** Set only once validation has actually failed. */
  error?: string
  placeholder?: string
  /** Distinguishes the two forms' control ids — both can be in one page's DOM. */
  idPrefix: string
}

const CONTROL =
  'mt-[1.2vw] block min-h-11 w-full rounded-none border-0 border-b border-edge bg-transparent ' +
  'pb-[0.6vw] text-body text-secondary outline-none transition-colors duration-150 ease-in-out ' +
  'placeholder:text-muted/40 focus:border-secondary focus-visible:outline-none ' +
  'max-sm:mt-[4vw] max-sm:pb-[2vw] max-sm:text-body-sm'

// `autoComplete` lets a returning visitor's browser fill the whole form without retyping. `tel`
// and `email` map straight off `type`; `name` is inferred from the field's own name, since it is
// not a distinct input type.
function autoCompleteFor(name: string, type: FormFieldType): string | undefined {
  if (type === 'tel') return 'tel'
  if (type === 'email') return 'email'
  if (name === 'name') return 'name'
  return undefined
}

export function FormField({ n, label, name, type, required, error, placeholder, idPrefix }: Props) {
  const controlId = `${idPrefix}-${name}`
  const errorId = `${controlId}-error`

  const shared = {
    id: controlId,
    name,
    required,
    placeholder,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: cn(CONTROL, error && 'border-secondary'),
  }

  return (
    <div className="flex gap-[1.2vw] max-sm:gap-[4vw]">
      <span
        aria-hidden="true"
        className="w-[2.4vw] shrink-0 pt-[0.2vw] font-mono text-mono text-muted max-sm:w-[8vw] max-sm:text-mono-sm"
      >
        {n})
      </span>

      <div className="min-w-0 flex-1">
        <label htmlFor={controlId} className="block text-body max-sm:text-body-sm">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-[0.3vw] max-sm:ml-[1vw]">
              *
            </span>
          )}
        </label>

        {type === 'textarea' ? (
          <textarea rows={3} {...shared} className={cn(shared.className, 'resize-none')} />
        ) : (
          <input
            type={type}
            inputMode={type === 'tel' ? 'tel' : undefined}
            autoComplete={autoCompleteFor(name, type)}
            {...shared}
          />
        )}

        {error && (
          <p id={errorId} role="alert" className="mt-[0.8vw] text-label max-sm:mt-[3vw] max-sm:text-label-sm">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
