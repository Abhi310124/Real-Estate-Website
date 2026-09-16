import { SplitWords } from '@/components/motion/SplitWords'
import { Button } from '@/components/ui/Button'
import type { SiteSettings } from '@/lib/data/types'
import { whatsappLink } from '@/lib/whatsapp'

type Props = { settings: SiteSettings }

/** Chapter 7, the home page's final chapter before the footer (navy-800, matching StatsBand so
 *  the two navy chapters bracket WhyBkr's ivory) — one big statement plus a way to act on it
 *  immediately, either the enquiry form or a prefilled WhatsApp chat. */
export function CtaBand({ settings }: Props) {
  return (
    <section data-cta className="bg-navy-800 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <SplitWords
          as="h2"
          className="font-display-expanded text-display-md text-white"
          text="Let's build your next address"
        />
        <p className="mx-auto mt-6 max-w-xl text-body-lg text-white/80">
          Speak with our team about open plots, villas, apartments and independent houses across
          Hyderabad&apos;s fastest-growing corridors — no pressure, just clear answers.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button href="/contact">Enquire Now</Button>
          <Button
            href={whatsappLink(
              settings.whatsappNumber,
              "Hi BKR INFRA, I'd like to know more about your projects.",
            )}
            variant="outline"
            tone="white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp
          </Button>
        </div>
      </div>
    </section>
  )
}
