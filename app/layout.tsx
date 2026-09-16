import type { Metadata } from 'next'
import { Archivo, Inter } from 'next/font/google'
import './globals.css'
import { LenisProvider } from '@/components/motion/LenisProvider'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FloatingActions } from '@/components/layout/FloatingActions'
import { getSiteSettings } from '@/lib/data'

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'BKR INFRA — Redefining Real Estate Excellence',
  description:
    'Open plots, villas, apartments and independent houses in Hyderabad. BKR INFRA develops, designs and delivers.',
}

// Ruling 6: app/layout.tsx now takes sole ownership of <main id="main"> — it has been
// removed from app/page.tsx and app/motion-lab/page.tsx (their own content is unchanged,
// only their wrapping <main> tag moved here) so there is exactly one <main> per page, not a
// nested pair. Ruling 5: every pre-existing piece of this file (the LenisProvider wrapper,
// the skip link and its z-[130], both font variables, the body classes, the metadata export)
// is unchanged below — Task 7 and Task 8 only ever added new chrome around {children}.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="bg-ivory font-body text-navy-800 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[130] focus:bg-navy-800 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <LenisProvider>
          <AnnouncementBar settings={settings} />
          <Header settings={settings} />
          <main id="main">{children}</main>
          <Footer settings={settings} />
          <FloatingActions settings={settings} />
        </LenisProvider>
      </body>
    </html>
  )
}
