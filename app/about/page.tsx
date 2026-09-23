import type { Metadata } from 'next'
import { SoftTriangle } from '@/components/decor/SoftTriangle'
import { Counter } from '@/components/motion/Counter'
import { GradientRule } from '@/components/motion/GradientRule'
import { RevealImage } from '@/components/motion/RevealImage'
import { Rise } from '@/components/motion/Rise'
import { ScrollRotate } from '@/components/motion/ScrollRotate'
import { Tilt3D } from '@/components/motion/Tilt3D'
import { EnquiryDoors } from '@/components/site/EnquiryDoors'
import { PageIntro } from '@/components/site/PageIntro'
import { LineButton } from '@/components/ui/Button'
import { ABOUT_HERO, ABOUT_JOIN, ABOUT_STATEMENT, DIRECTOR_NOTE } from '@/lib/content/about'
import { getProjects, getSiteSettings } from '@/lib/data'
import { groupPhone, telHref } from '@/lib/format'

/**
 * `/about` — the company page, in the order of the layout it follows:
 *
 *   intro          breadcrumb and H1 over a soft triangle that turns a full circle with the scroll
 *   plate          one large photograph, nine columns wide
 *   statement      how the business works, with two small facts beneath it
 *   circles        three numbers, computed from the published portfolio, under a gradient rule
 *   note           the Managing Director's note beside a photograph
 *   pillars        Develop · Design · Deliver, where the layout runs its history years
 *   join           a closing invitation with the phone number
 *   enquiry        the doors
 *
 * `/studio` (this page's previous name) permanently redirects here.
 */
export const revalidate = 30

export const metadata: Metadata = {
  title: 'About | BKR INFRA',
  description:
    'BKR INFRA buys land early in Hyderabad’s growth corridors, lays it out with care and hands homes over on time, with clear titles and RERA-registered projects.',
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export default async function AboutPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()])

  const registered = projects.filter((p) => p.reraNumber.trim()).length
  const circles = [
    { value: projects.length, suffix: '', label: 'Projects across Hyderabad' },
    { value: projects.filter((p) => p.status === 'ongoing' || p.status === 'upcoming').length, suffix: '', label: 'Under way or launching' },
    { value: projects.length ? Math.round((registered / projects.length) * 100) : 0, suffix: '%', label: 'RERA-registered' },
  ].filter((c) => c.value > 0)
  const phone = settings.phones[0]

  return (
    <>
      <div className="relative overflow-x-clip bg-gradient-to-b from-primary via-tint to-primary">
        <ScrollRotate turn={359} tilt={18} className="absolute right-[-14%] top-[-4%] h-[1150px] w-[1050px] max-lg:right-[-50%] max-lg:h-[600px] max-lg:w-[560px]">
          <SoftTriangle className="h-full w-full" />
        </ScrollRotate>

        <PageIntro crumb={ABOUT_HERO.crumb} lines={ABOUT_HERO.lines} className="relative" />

        <div className="layout-grid relative mt-32 max-lg:mt-12">
          <Tilt3D className="col-span-12 lg:col-span-9" max={3}>
            <RevealImage
              src={ABOUT_HERO.image.src}
              alt={ABOUT_HERO.image.alt}
              sizes="(max-width: 1023px) 100vw, 73vw"
              preload
              className="aspect-[1044/695] rounded-card"
            />
          </Tilt3D>
        </div>

        <section className="layout-grid relative mt-24 max-lg:mt-16" aria-label="How we work">
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            <p className="font-heading text-h3 text-secondary max-sm:text-h3-sm">{ABOUT_STATEMENT.copy}</p>
            <ul className="mt-20 flex flex-wrap gap-x-24 gap-y-4 text-body uppercase tracking-[0.02em] text-navySoft max-lg:mt-10">
              {ABOUT_STATEMENT.labels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>
        </section>

        {circles.length > 0 && (
          <section className="relative mt-40 max-lg:mt-24" aria-label="At a glance">
            <div className="container-page flex justify-center">
              <GradientRule className="max-w-[510px]" />
            </div>
            <ul className="layout-grid mt-10 gap-y-8">
              {circles.map((c) => (
                <li key={c.label} className="col-span-12 flex justify-center md:col-span-4">
                  <div className="flex aspect-square w-full max-w-[426px] flex-col items-center justify-center rounded-full border border-navyLine text-center">
                    <p className="font-heading text-h1 text-navySoft max-sm:text-[48px]">
                      <Counter value={c.value} suffix={c.suffix} duration={1.5} start="bottom bottom" data-testid="about-counter" />
                    </p>
                    <p className="mt-2 font-heading text-h4 text-navySoft max-sm:text-h4-sm">{c.label}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="layout-grid relative mt-40 items-center gap-y-12 max-lg:mt-24" aria-label="A note from the Managing Director">
          <Tilt3D className="col-span-12 md:col-span-8 lg:col-span-5" max={4}>
            <RevealImage
              src={DIRECTOR_NOTE.image.src}
              alt={DIRECTOR_NOTE.image.alt}
              sizes="(max-width: 1023px) 70vw, 38vw"
              className="aspect-[546/500] rounded-card"
            />
          </Tilt3D>
          <figure className="col-span-12 lg:col-span-6 lg:col-start-7">
            <blockquote className="font-heading text-h3 text-secondary max-sm:text-h3-sm">
              <p>
                “{DIRECTOR_NOTE.before}
                <span className="text-accentInk">{DIRECTOR_NOTE.accent}</span>
                {DIRECTOR_NOTE.after}”
              </p>
            </blockquote>
            <figcaption className="mt-20 max-lg:mt-10">
              <span className="block text-body text-secondary">{DIRECTOR_NOTE.name}</span>
              <span className="mt-1 block text-small text-muted">{DIRECTOR_NOTE.role}</span>
            </figcaption>
          </figure>
        </section>

        {settings.pillars.length > 0 && (
          <section className="relative mt-40 max-lg:mt-24" aria-labelledby="pillars-heading">
            <h2 id="pillars-heading" className="sr-only">
              What we do
            </h2>
            <ul className="layout-grid gap-y-10">
              {settings.pillars.map((p) => (
                <li key={p.title} className="col-span-12 md:col-span-4">
                  <Rise as="h3" className="font-heading text-[88px] leading-none text-secondary max-lg:text-[56px] max-sm:text-[44px]">
                    {titleCase(p.title)}
                  </Rise>
                </li>
              ))}
            </ul>
            <div className="container-page mt-10">
              <GradientRule />
            </div>
            <ul className="layout-grid mt-8 gap-y-6">
              {settings.pillars.map((p) => (
                <li key={p.title} className="col-span-12 text-body text-secondary md:col-span-4 lg:pr-12">
                  {p.description}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="layout-grid relative pb-40 pt-48 max-lg:pb-24 max-lg:pt-28" aria-labelledby="join-heading">
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <Rise as="h2" id="join-heading" className="font-heading text-h1 text-secondary max-sm:text-h1-sm">
              {ABOUT_JOIN.lines.map((line) => (
                <span key={line} data-line className="block">
                  {line}
                </span>
              ))}
            </Rise>
            <p className="mt-10 max-w-[560px] text-body text-secondary">{ABOUT_JOIN.copy}</p>
            {phone && (
              <LineButton href={telHref(phone)} icon="phone" className="mt-14">
                Call {groupPhone(phone)}
              </LineButton>
            )}
          </div>
        </section>
      </div>

      <EnquiryDoors />
    </>
  )
}
