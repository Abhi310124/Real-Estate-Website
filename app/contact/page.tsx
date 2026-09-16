import { PageShell } from '@/components/layout/PageShell'
// Ruling 1: minimal placeholder — Task 21 wires this up as the real contact page.
// No <main> here: app/layout.tsx owns the single <main id="main"> for every route.
export default function ContactPage() {
  return (
    <PageShell>
      <h1 className="font-display-expanded text-display-lg text-navy-800">Contact Us</h1>
      <p className="mt-4 text-body text-navy-700">
        A way to reach BKR INFRA directly is being prepared for this page.
      </p>
    </PageShell>
  )
}
