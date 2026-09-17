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

const CONTROL_CLASS =
  'mt-2 block min-h-11 w-full rounded-sm border border-navy-800/15 bg-white px-4 py-2.5 text-body text-navy-800 placeholder:text-navy-700/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange'

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
 * The error text, its marker glyph and the required-field asterisk all render in `navy-800`,
 * not orange: orange-600 on white is ~4.14:1, short of the 4.5:1 the contrast law requires for
 * this size of text, and a bare `*`/`!` character set in the surrounding text size reads as
 * text rather than as an icon, so this treats it as text rather than leaning on the contrast
 * law's icon carve-out for a borderline case. Colour is never the only signal regardless —
 * `required`/`aria-invalid` on the control and `role="alert"` on the message already say
 * "this field is required" / "this field failed" independently of hue; the invalid border
 * (`border-orange-600`, a non-text UI indicator, needs only 3:1 and clears it easily) is what
 * actually carries the orange accent.
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
    className: cn(CONTROL_CLASS, error && 'border-orange-600'),
  }

  return (
    <div className={className}>
      <label htmlFor={controlId} className="text-sm font-medium text-navy-800">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-navy-800">
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
        <p id={errorId} role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-navy-800">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  )
}
