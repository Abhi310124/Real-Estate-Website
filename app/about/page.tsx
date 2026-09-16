// Ruling 1: minimal placeholder — Task 18 replaces this with the real about page.
// No <main> here: app/layout.tsx owns the single <main id="main"> for every route.
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <h1 className="font-display-expanded text-display-lg text-navy-800">About BKR INFRA</h1>
      <p className="mt-4 text-body text-navy-700">
        Our story of developing, designing and delivering across Hyderabad is being prepared for
        this page.
      </p>
    </div>
  )
}
