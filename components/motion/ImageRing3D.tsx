'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * The tilted 3D ring of project images — the reference's signature moment, sitting behind the
 * "HOVER + CLICK TO VISIT PROJECTS" label.
 *
 * Geometry, measured off the live reference rather than eyeballed:
 *
 *   stage   114.4vw square, `perspective: 132vw`
 *   ring    `transform: rotate3d(0.27, -1.005, 1.5, 85deg)` with `transform-style: preserve-3d`
 *   cells   8 full-size layers, each `rotate(45deg × i)` for i = 0…7
 *   items   13.2vw × 11.12vw, `left-1/2 -translate-x-1/2`, `bottom: calc(50% + 44vw)`
 *   rest    `opacity: 0.4`, brightening on hover
 *
 * How it works: each cell is a full-size square rotated flat by a multiple of 45°, and each holds
 * one image pushed 44vw out from the centre along its own vertical axis. Rotating the *cell*
 * rather than positioning each image by trigonometry is what distributes them evenly around the
 * circle — and it means the ring's radius is one number in one place.
 *
 * The 85° tilt about that deliberately off-axis vector is what stops it reading as a flat clock
 * face. Note it is NOT animated: verified static across five scroll offsets and 1.6s of wall
 * time on the reference. The sense of movement comes from the sticky parent drifting as you
 * scroll past, not from the ring turning. Building it as a spinning carousel would be louder and
 * wrong.
 *
 * Fragility worth knowing: `preserve-3d` is destroyed by any ancestor that establishes a new
 * containing block — an `overflow: hidden`, a `filter`, or its own `transform`. If the ring ever
 * renders flat, that is the cause, and it will be a parent, not this file.
 */

const RING_RADIUS = '44vw'
const STAGE = '114.4vw'
const PERSPECTIVE = '132vw'
const ITEM_W = '13.2vw'
const ITEM_H = '11.12vw'
const CELL_COUNT = 8

export type RingItem = { href: string; src: string; alt: string; label: string }

export function ImageRing3D({ items, className }: { items: RingItem[]; className?: string }) {
  const [active, setActive] = useState<number | null>(null)

  // Always render exactly 8 cells so the ring is never lopsided; if fewer images are supplied
  // they repeat around it. A ring with a visible gap looks broken rather than sparse.
  const cells = Array.from({ length: CELL_COUNT }, (_, i) => items[i % items.length])

  return (
    <div className={cn('relative', className)} style={{ width: STAGE, height: STAGE, perspective: PERSPECTIVE }}>
      <div
        className="size-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotate3d(0.27, -1.005, 1.5, 85deg)',
        }}
      >
        {cells.map((item, i) => (
          <div
            key={i}
            // pointer-events-none on the cell, auto on the item: the cell is a full 114vw square,
            // so leaving it interactive would blanket the whole section in an invisible hit area
            // and steal every click meant for the copy underneath.
            className="pointer-events-none absolute inset-0"
            style={{ transform: `rotate(${(360 / CELL_COUNT) * i}deg)` }}
          >
            <Link
              href={item.href}
              aria-label={item.label}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={cn(
                'pointer-events-auto absolute left-1/2 block -translate-x-1/2 overflow-hidden',
                'transition-opacity duration-300 ease-in-out motion-reduce:transition-none',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'
              )}
              style={{
                width: ITEM_W,
                height: ITEM_H,
                bottom: `calc(50% + ${RING_RADIUS})`,
                opacity: active === i ? 1 : 0.4,
              }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                // Small on screen (13.2vw) — a wide `sizes` here would download a 2400px file for
                // a ~190px box eight times over and dominate the page's transfer budget.
                sizes="15vw"
                className="object-cover"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
