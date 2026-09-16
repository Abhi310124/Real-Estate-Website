import type { SiteSettings } from '@/lib/data/types'
import { whatsappLink } from '@/lib/whatsapp'

type Props = { settings: SiteSettings }

/**
 * Persistent bottom-right call/WhatsApp rail — the two channels the brand brief guarantees
 * always exist (Ruling 8), available from every page regardless of scroll position or
 * mega-menu state. Both affordances use the brand's own navy/orange pair rather than
 * WhatsApp's off-brand green, so this stays consistent with Ruling 4 (colours only ever come
 * from `COLORS`/its generated Tailwind classes, never a hand-typed hex) without inventing a
 * token for a colour the brand palette does not have.
 */
export function FloatingActions({ settings }: Props) {
  const primaryPhone = settings.phones[0]
  const telHref = `tel:${primaryPhone.replace(/\s+/g, '')}`
  const waHref = whatsappLink(settings.whatsappNumber, "Hi BKR INFRA, I'd like to know more.")

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col gap-3">
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with BKR INFRA on WhatsApp"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.1a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.1 8.1 0 1 1 12 20.1Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-1.3-.6-2.2-1.4-3-2.7-.1-.2-.1-.4.1-.6l.5-.6c.1-.2.1-.4 0-.5-.1-.2-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9 1-.9 2.3 0 1.3 1 2.6 1.1 2.8.1.2 1.9 2.9 4.6 4 2.7 1.1 2.7.7 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
        </svg>
      </a>
      <a
        href={telHref}
        aria-label="Call BKR INFRA"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-orange text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.5 2.5.8 3.9.8.6 0 1 .4 1 1v3.7c0 .6-.4 1-1 1C10.6 21.5 2.5 13.4 2.5 3.7c0-.6.4-1 1-1H7.2c.6 0 1 .4 1 1 0 1.4.3 2.7.8 3.9.1.4.1.8-.2 1l-2.2 2.2Z" />
        </svg>
      </a>
    </div>
  )
}
