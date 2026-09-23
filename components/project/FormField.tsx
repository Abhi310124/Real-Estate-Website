import { cn } from '@/lib/cn'

/**
 * One field of the project page's forms (the enquiry card and the brochure gate), in the layout's
 * form style: an underline-only control on a hairline, with its label sitting in the field until the
 * field is focused or filled, then lifting above it. The label is a real `<label for>` throughout — it
 * only looks like a placeholder — so the accessible name never depends on the control being empty.
 *
 * The message field keeps a fixed label above it instead: a textarea's first line is where a visitor
 * starts typing, and a label parked on it would be in the way.
 */

export type FormFieldType = 'text' | 'tel' | 'email' | 'textarea'

type Props = {
  label: string
  name: string
  type: FormFieldType
  required: boolean
  /** Set only once validation has actually failed. */
  error?: string
  /** Distinguishes the two forms' control ids — both can be in one page's DOM. */
  idPrefix: string
}

const CONTROL =
  'block w-full rounded-none border-0 border-b border-navyLine bg-transparent px-2 text-body text-secondary outline-none ' +
  'transition-[border-color,box-shadow] duration-300 focus:border-secondary focus:shadow-[inset_0_-1px_0_theme(colors.secondary)]'

// `autoComplete` lets a returning visitor's browser fill the whole form without retyping.
function autoCompleteFor(name: string, type: FormFieldType): string | undefined {
  if (type === 'tel') return 'tel'
  if (type === 'email') return 'email'
  if (name === 'name') return 'name'
  return undefined
}

export function FormField({ label, name, type, required, error, idPrefix }: Props) {
  const controlId = `${idPrefix}-${name}`
  const errorId = `${controlId}-error`
  const described = {
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? errorId : undefined,
  }
  const mark = required && (
    <span aria-hidden="true" className="ml-1 text-accentInk">
      *
    </span>
  )

  return (
    <div>
      {type === 'textarea' ? (
        <>
          <label htmlFor={controlId} className="block px-2 text-body text-muted">
            {label}
            {mark}
          </label>
          <textarea id={controlId} name={name} required={required} rows={3} {...described} className={cn(CONTROL, 'mt-1 resize-y py-2', error && 'border-secondary')} />
        </>
      ) : (
        <div className="relative">
          <input
            id={controlId}
            name={name}
            type={type}
            required={required}
            placeholder=" "
            inputMode={type === 'tel' ? 'tel' : undefined}
            autoComplete={autoCompleteFor(name, type)}
            {...described}
            className={cn(CONTROL, 'peer pb-2 pt-6', error && 'border-secondary')}
          />
          <label
            htmlFor={controlId}
            className="pointer-events-none absolute left-2 top-6 text-body text-muted transition-all duration-300 ease-door peer-focus:top-0 peer-focus:text-caption peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-caption"
          >
            {label}
            {mark}
          </label>
        </div>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-2 px-2 text-small text-secondary">
          {error}
        </p>
      )}
    </div>
  )
}
