import Image from 'next/image'
import { SoftTriangle } from '@/components/decor/SoftTriangle'
import { Counter } from '@/components/motion/Counter'
import { Rise } from '@/components/motion/Rise'
import { ScrollRotate } from '@/components/motion/ScrollRotate'
import { STATISTICS, TESTIMONIALS } from '@/lib/content/home'
import { COLORS } from '@/lib/tokens'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * The statistics band and the testimonials it carries: one long gradient section, cream at the top
 * washing into the tint at the foot, with a soft triangle turning in 3D down its left side.
 *
 * **Every number here is computed, not typed.** A 108px figure is the most prominent claim a page can
 * make, and `settings.stats` holds placeholder figures its own fixture flags as unverified. So the four
 * numbers are derived from the published projects at render time — how many there are, how many are
 * under way, how many localities they cover, and what share carry a RERA registration — and they move
 * the moment the owner publishes, hides or edits a project. They cannot overstate the portfolio,
 * because they ARE the portfolio.
 *
 * Counting follows the layout's own rule: 1.5s, starting only once a number is entirely on screen.
 */

function deriveStats(projects: ProjectSummary[]) {
  const localities = new Set(projects.map((p) => p.location.area.trim()).filter(Boolean)).size
  const active = projects.filter((p) => p.status === 'ongoing' || p.status === 'upcoming').length
  const registered = projects.filter((p) => p.reraNumber.trim()).length
  const share = projects.length ? Math.round((registered / projects.length) * 100) : 0
  return [
    { value: projects.length, suffix: '', label: 'Projects across Hyderabad' },
    { value: active, suffix: '', label: 'Under way or launching now' },
    { value: localities, suffix: '', label: 'Growth corridors we build in' },
    { value: share, suffix: '%', label: 'Of our projects RERA-registered' },
  ].filter((s) => s.value > 0)
}

function QuoteMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 52" className="h-12 w-[60px]">
      <path
        d="M4 48V26C4 14 10 6 22 4l2 5c-7 2-10 7-10 13h10v26Z"
        fill="none"
        stroke={COLORS.accent}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M36 48V26c0-12 6-20 18-22l2 5c-7 2-10 7-10 13h10v26Z"
        fill="none"
        stroke={COLORS.secondary}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function HomeStatistics({ projects }: { projects: ProjectSummary[] }) {
  const stats = deriveStats(projects)

  return (
    <section className="relative overflow-x-clip bg-gradient-to-t from-tint to-primary pb-28 pt-44 max-lg:pb-20 max-lg:pt-24">
      <ScrollRotate className="absolute left-[-6%] top-[30%] h-[980px] w-[900px] max-lg:left-[-30%] max-lg:top-[18%] max-lg:h-[520px] max-lg:w-[480px]">
        <SoftTriangle className="h-full w-full" />
      </ScrollRotate>

      <div className="layout-grid relative">
        <Rise as="h2" className="col-span-12 font-heading text-h2-xl text-navySoft max-sm:text-h2-xl-sm lg:col-span-6">
          {STATISTICS.lines.map((line) => (
            <span key={line.text + line.accent} data-line className="block">
              {line.text}
              {line.accent && <span className="text-accentInk">{line.accent}</span>}
            </span>
          ))}
        </Rise>

        <dl className="col-span-12 mt-2 flex flex-col gap-24 max-lg:mt-16 max-lg:gap-14 lg:col-span-5 lg:col-start-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="mt-8 font-heading text-h4-sm text-secondary max-sm:mt-4 max-sm:text-body">{stat.label}</dt>
              <dd className="font-heading text-stat text-secondary max-sm:text-stat-sm">
                <Counter value={stat.value} suffix={stat.suffix} duration={1.5} start="bottom bottom" data-testid="stat-counter" />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative mt-40 max-lg:mt-24">
        <Rise as="h2" className="container-page text-center font-heading text-h2 text-secondary max-sm:text-h2-sm">
          {STATISTICS.testimonialsTitle}
        </Rise>
        <ul className="layout-grid mt-20 gap-y-8 max-lg:mt-10">
          {TESTIMONIALS.map((t) => (
            <li key={t.attribution} className="col-span-12 md:col-span-6 lg:col-span-4">
              <figure className="flex h-full flex-col rounded-card bg-primary p-12 shadow-[0_24px_48px_-32px_rgba(10,26,47,0.35)] max-sm:p-7">
                <QuoteMark />
                <blockquote className="mt-6 text-body text-secondary">{t.quote}</blockquote>
                <figcaption className="mt-auto flex items-center gap-4 pt-10">
                  <span className="relative h-16 w-16 shrink-0 overflow-clip rounded-full">
                    <Image src={t.portrait} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block text-body text-navySoft">{t.attribution}</span>
                    <span className="mt-0.5 block text-caption tracking-[0.06em] text-accentInk">{t.stamp}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
