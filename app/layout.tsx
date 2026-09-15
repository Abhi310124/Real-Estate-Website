import type { Metadata } from 'next'
import { Archivo, Inter } from 'next/font/google'
import './globals.css'
import { LenisProvider } from '@/components/motion/LenisProvider'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="bg-ivory font-body text-navy-800 antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[130] focus:bg-navy-800 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
