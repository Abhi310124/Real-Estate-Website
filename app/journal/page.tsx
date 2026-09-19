import type { Metadata } from 'next'
import { FeaturedRead } from '@/components/journal/FeaturedRead'
import { JournalRows } from '@/components/journal/JournalRows'
import { ProjectsCrossLink } from '@/components/journal/ProjectsCrossLink'
import { PageShell } from '@/components/layout/PageShell'
import { SplitLines } from '@/components/motion/SplitLines'
import { ContactIntake } from '@/components/storey/ContactIntake'
import { getFeaturedProjects, getJournalPosts, getSiteSettings } from '@/lib/data'

// Its own unique title, over 10 characters, distinct from every other route's and from the site
// default in app/layout.tsx. The description summarises the posts that actually exist — material in
// a warm climate, plans that open and close, reading a site before drawing on it — rather than
// claiming a publishing cadence or a body of work that is not there.
export const metadata: Metadata = {
  title: 'Journal — Notes on Material, Site and Long-Term Living',
  description:
    'Short pieces from BKR INFRA on designing homes for their second decade: materials that age well in a warm climate, plans that open and close, and reading a site before drawing on it.',
}

// Matches every other route: 30s background revalidation is what lets an owner see a published edit
// appear, since a Sanity webhook has no route to localhost in development.
export const revalidate = 30

/**
 * 191 characters — six lines in the 31.5vw measure of columns 9–12, at 23.04px on 27.648px leading.
 *
 * The length is a layout parameter, not a preference. This block is the counterweight to a display
 * heading three lines tall; said in eighty characters it renders as two lines, and the top of the page
 * then reads as a title with a stray caption beside it. It also has to say something the metadata
 * description above does not, or the first thing on the route is a restatement.
 */
const INTRO =
  'Short pieces written while projects are drawn and built: climate before plan, plan before ' +
  'material, and an honest account of what we would do differently if the same site came up again ' +
  'tomorrow.'

/**
 * The journal listing, as the reference builds it: a title block, one featured post, the remainder in
 * flush two-up rows with a sheet of notepaper dropped between them, a cross-link into the projects,
 * two project plates, and the enquiry intake.
 *
 * ## Why the page is eight blocks and not two
 *
 * It was a title block and one uniform list, and that is the shape of a blog index rather than of this
 * design. Four things were missing and each was doing a different job. Without a featured row every
 * post is equally important, so nothing is. Without the notepaper prop between the rows the run of
 * cards has nothing interrupting it and a listing reads as a contact sheet. Without the cross-link and
 * the plates the page ends on a card and the writing never argues for the work. And without the intake
 * the route has no way to convert at all — the intake closes all three interior routes on the
 * reference, at the same `mt-[20vw]` approach gap, which is why it is mounted here rather than left to
 * the standalone `/contact` page.
 *
 * ## `PageShell flush` and nothing else
 *
 * This route used to pass `!max-w-none !px-0` to shout down a centred 1280px container. That container
 * is gone from `PageShell`, whose clearance is now the reference's own `pt-[20vw]` title inset, so the
 * wrapper is used plain. `flush` is the one thing still asked for: it drops the wrapper's closing
 * `pb-[10vw]`, because the block that ends this page is the intake and the intake owns the gap above
 * itself with `mt-[20vw]`. Left in, the wrapper's own bottom padding would open a gap between the
 * intake and the footer that the reference does not have.
 *
 * `col-span-7` on the `h1` is measured. Our heading is 40 characters where the reference's is 31, so it
 * takes three lines at 100.8px rather than two and the title block stands ~100px taller than the
 * measured 489.6px — which pushes everything below it down by the same amount. That is the honest
 * trade: the alternative is cutting a third of the heading to hit a number, and the gap this page was
 * filed for is 4,096px, not 100.
 *
 * There is no rule under the title block. One used to be drawn in there on scroll; the reference has no
 * hairline on this route at all, and an animated one was the loudest gesture on a page carried by its
 * photography.
 */
export default async function JournalPage() {
  // Three independent reads, so they overlap rather than queue. The projects are for the closing
  // showcase and the phone number is the one verified fact the intake's stamp row carries — it comes
  // from `getSiteSettings()` rather than from anywhere in this file.
  const [posts, projects, settings] = await Promise.all([
    getJournalPosts(),
    getFeaturedProjects(),
    getSiteSettings(),
  ])

  return (
    <PageShell flush>
      <div className="layout-grid items-start">
        <h1 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-7">
          Notes on material, site and the long term
        </h1>

        {/* 2vw (28.8px) rather than a shared top edge: the paragraph drops clear of the heading's cap
            line, which is what stops the two columns reading as a two-part title. Four columns is
            load-bearing — the same 191 characters across seven would mask three wide lines instead of
            six short ones, and `SplitLines` faithfully animates whatever the measure produces, so the
            split and the measure only read right as a pair. */}
        <SplitLines
          text={INTRO}
          className="col-span-12 mt-[10vw] text-body text-muted max-sm:text-body-sm sm:col-span-4 sm:col-start-9 sm:mt-[2vw]"
        />
      </div>

      {/* getJournalPosts() returns published posts only, newest first, so an owner hiding a post
          removes it here with no filtering of our own. The newest takes the featured row and the rest
          fall into two-up rows — both blocks are built for however many there are, so nothing here
          assumes a count. An empty result is a real state (nothing published yet), and a page that
          renders a heading over blank space looks broken rather than empty, so say so in one line
          instead — and still close on the projects and the intake, which do not depend on anything
          having been written. */}
      {posts.length > 0 ? (
        <>
          <FeaturedRead post={posts[0]} />
          <JournalRows posts={posts.slice(1)} />
        </>
      ) : (
        <div className="layout-grid mt-[20vw]">
          <p className="col-span-12 text-body text-muted max-sm:text-body-sm sm:col-span-4">
            No posts have been published yet.
          </p>
        </div>
      )}

      <ProjectsCrossLink projects={projects} />

      {/* Inside the wrapper, which is what `flush` is for: the intake supplies its own 288px approach
          gap and butts straight into the footer, exactly as it does on the reference's three interior
          routes. The phone number is the one verified fact on the sheet. */}
      <ContactIntake contact={settings.phones[0]} />
    </PageShell>
  )
}
