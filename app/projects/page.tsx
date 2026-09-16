// Ruling 1: minimal placeholder — Task 13 replaces this with the real projects listing.
// No <main> here: app/layout.tsx owns the single <main id="main"> for every route.
export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <h1 className="font-display-expanded text-display-lg text-navy-800">Projects</h1>
      <p className="mt-4 text-body text-navy-700">
        Our full portfolio of open plots, villas, apartments and independent houses is being
        prepared for this page.
      </p>
    </div>
  )
}
