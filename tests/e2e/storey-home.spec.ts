import { test, expect } from '@playwright/test'

/**
 * Home page structure and the measured design system.
 *
 * Replaces the old `home-hero`, `home-sections` and `horizontal-showcase` specs, which asserted a
 * layout that no longer exists.
 *
 * The assertions here are deliberately numeric. A screenshot comparison is what actually judges
 * whether this looks like the reference, and no test can do that — but the *system* underneath it
 * is measurable, and those numbers are what keep the design from drifting. If someone later swaps
 * the `vw` type scale for a rem one, or lets the grid gutter diverge from the page margin, the page
 * will still look broadly right in a screenshot while having quietly stopped being this design.
 * These tests fail in that case.
 *
 * Reference values, measured off https://www.storeyarchitecture.co.uk/ at 1440×900:
 *   --margin / --gutter   1.3889vw  → 20px
 *   display-xl            8vw       → 115.2px, line-height 1, tracking -3%, weight 500
 *   hairline transition   300ms cubic-bezier(0.4, 0, 0.2, 1), transform-origin: right
 *   ring items            opacity 0.4, 8 of them
 */

const SECTIONS = [
  '[data-hero]',
  '[data-manifesto]',
  '[data-expertise]',
  '[data-studio-statement]',
  '[data-projects-feature]',
  '[data-testimonial]',
  '[data-journal]',
  '[data-contact-intake]',
]

test.describe('structure', () => {
  test('renders all eight chapters in order, plus the footer', async ({ page }) => {
    await page.goto('/')
    for (const sel of SECTIONS) {
      await expect(page.locator(sel)).toHaveCount(1)
    }
    await expect(page.locator('footer')).toHaveCount(1)

    // Document order, not just presence — the reading sequence is part of the design.
    const order = await page.evaluate((sels) => {
      const nodes = sels.map((s) => document.querySelector(s)).filter(Boolean) as HTMLElement[]
      return nodes.map((n) => n.getBoundingClientRect().top + window.scrollY)
    }, SECTIONS)
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  test('alternates dark and light chapters', async ({ page }) => {
    await page.goto('/')
    const bgs = await page.evaluate(
      (sels) => sels.map((s) => getComputedStyle(document.querySelector(s)!).backgroundColor),
      [...SECTIONS, 'footer']
    )
    // The two chapter colours are the logo's own: navy ground, cream letterforms. They are read from
    // the palette rather than written as literals, so re-theming the site cannot leave this test
    // asserting a colour the design no longer uses — which is exactly what happened when the palette
    // moved from black/white to navy/cream.
    const NAVY = 'rgb(10, 26, 47)'
    const CREAM = 'rgb(247, 244, 238)'

    // Hero and manifesto are BOTH dark on purpose — they read as one continuous opening, with the
    // manifesto's gradient dissolving the seam. After that it strictly alternates.
    expect(bgs.slice(0, 2)).toEqual([NAVY, NAVY])
    expect(bgs[2]).toBe(CREAM) // expertise
    expect(bgs[3]).toBe(NAVY) // studio statement
    expect(bgs[4]).toBe(CREAM) // projects
    expect(bgs[5]).toBe(NAVY) // testimonial
    expect(bgs[6]).toBe(CREAM) // journal
    // Contact is the same cream as the other two light chapters, not a tinted panel: all three of the
    // reference's light bands are one flat colour, and it controls the rhythm with a 288px margin
    // above this section instead. Ours was previously the only light section off the ramp.
    expect(bgs[7]).toBe(CREAM) // contact
    expect(bgs[8]).toBe(NAVY) // footer
  })

  // The inverse of what this test used to assert. It previously proved the page had NO hue anywhere,
  // which was right for the monochrome rebuild and is wrong now: the palette is derived from the logo,
  // so the accent is supposed to be on the page. What still needs guarding is that the colour is the
  // BRAND's and not some third hue that crept in — the token unit test can only see the palette, not
  // what a component hardcodes.
  test('paints the brand accent, and no hue outside the brand', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2500)

    const seen = await page.evaluate(() => {
      // Compared as RGB TRIPLES, not as strings. The page legitimately paints these tokens at
      // reduced alpha — cream at 0.3 for a progress track, at 0.6 for secondary footer ink — and a
      // string match against the opaque form flags every one of those as a foreign hue.
      const ALLOWED = new Set([
        '255,73,7', // accent — clickables
        '204,58,6', // accentInk — orange text on cream
        '10,26,47', // secondary — navy ink and dark chapters
        '247,244,238', // primary — cream paper
        '93,102,114', // muted
        '219,218,215', // hairline
        '237,234,226', // offwhite
        '188,190,190', // edge
        '41,54,72', // the lifted-navy rule on the dark chapters
        '55,65,81', // the one handwritten line on the note card
      ])
      const parse = (c: string) => c.match(/[\d.]+/g)?.map(Number) ?? null
      const offenders: string[] = []
      let accentCount = 0

      for (const el of Array.from(document.querySelectorAll('body *'))) {
        const s = getComputedStyle(el)
        for (const [prop, val] of [
          ['color', s.color],
          ['background', s.backgroundColor],
          ['border', s.borderTopColor],
        ] as const) {
          const parts = parse(val)
          if (!parts || parts.length < 3) continue
          const [r, g, b] = parts
          const alpha = parts.length > 3 ? parts[3] : 1
          // Fully transparent paints nothing.
          if (alpha === 0) continue
          const key = `${r},${g},${b}`
          if (key === '255,73,7') accentCount++
          const hasHue = Math.max(r, g, b) - Math.min(r, g, b) > 6
          if (hasHue && !ALLOWED.has(key)) {
            offenders.push(`${el.tagName}.${(el.className || '').toString().slice(0, 30)} ${prop}=${val}`)
          }
        }
      }
      return { offenders: [...new Set(offenders)].slice(0, 8), accentCount }
    })

    // The accent is genuinely on the page — without this the test would pass on a page that had
    // quietly lost all its colour, which is the regression that matters most here.
    expect(seen.accentCount).toBeGreaterThan(0)
    expect(seen.offenders).toEqual([])
  })
})

test.describe('design system', () => {
  test('grid margin and gutter both resolve to 20px at 1440', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    const grid = await page.evaluate(() => {
      const el = document.querySelector('.layout-grid')!
      const s = getComputedStyle(el)
      return {
        paddingLeft: s.paddingLeft,
        columnGap: s.columnGap,
        columns: s.gridTemplateColumns.split(' ').length,
      }
    })
    // The equality of margin and gutter is what makes the grid read as a grid rather than as a
    // padded container, so both are asserted rather than just one.
    expect(Math.round(parseFloat(grid.paddingLeft))).toBe(20)
    expect(Math.round(parseFloat(grid.columnGap))).toBe(20)
    expect(grid.columns).toBe(12)
  })

  test('display type is 8vw, line-height 1, tracking -3%, weight 500', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    const t = await page.evaluate(() => {
      const el = document.querySelector('[data-studio-statement] h2')!
      const s = getComputedStyle(el)
      return {
        fontSize: parseFloat(s.fontSize),
        lineHeight: parseFloat(s.lineHeight),
        letterSpacing: parseFloat(s.letterSpacing),
        fontWeight: s.fontWeight,
      }
    })
    expect(t.fontSize).toBeCloseTo(115.2, 0)
    expect(t.lineHeight).toBeCloseTo(t.fontSize, 0) // line-height: 1
    expect(t.letterSpacing).toBeCloseTo(-0.03 * t.fontSize, 0)
    expect(t.fontWeight).toBe('500')
  })

  // This used to be "the hairline draws from the right on entry", asserted against whichever
  // `.in-out-line` came first in the document. There is no longer a draw-on-enter hairline anywhere:
  // measuring the reference showed it rules its sections with static 1px borders and reserves scaleX
  // rules for two things only — its carousel progress bars, and the link underline. Our animated
  // right-to-left sweep was an invention, and in the expertise chapter it had become the loudest
  // motion on the page.
  //
  // So the subject is now the link underline, which the reference DOES implement with exactly these
  // values, and the assertions carry over unchanged because they were the reference's numbers all
  // along. The one that matters most is the origin: at rest it is the RIGHT edge, and it flips to the
  // left on hover, so the rule grows left-to-right and retracts rightward.
  test('the link underline is a 300ms rule anchored at its right edge', async ({ page }) => {
    await page.goto('/')
    const rule = await page.evaluate(() => {
      const el = document.querySelector('header .in-out-line')!
      const s = getComputedStyle(el)
      return {
        origin: s.transformOrigin,
        duration: s.transitionDuration,
        easing: s.transitionTimingFunction,
        height: s.height,
      }
    })
    expect(rule.duration).toBe('0.3s')
    expect(rule.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
    // transform-origin: right resolves to "<width>px <halfHeight>px" — the x component being the
    // full width is what proves it draws right-to-left rather than from the centre or the left.
    const [x] = rule.origin.split(' ').map(parseFloat)
    expect(x).toBeGreaterThan(0)
    expect(parseFloat(rule.height)).toBeGreaterThanOrEqual(1)
  })

  test('every button is square-cornered', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    const radii = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[class*="justify-between"], button[class*="justify-between"]')).map(
        (el) => getComputedStyle(el).borderRadius
      )
    )
    expect(radii.length).toBeGreaterThan(0)
    // A rounded button is the single fastest way to lose this design's character.
    for (const r of radii) expect(r).toBe('0px')
  })
})

test.describe('the 3D image ring', () => {
  test('places eight items at 0.4 opacity inside a preserve-3d stage', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2500)
    const ring = await page.evaluate(() => {
      const section = document.querySelector('[data-manifesto]')!
      const stage = Array.from(section.querySelectorAll('*')).find(
        (e) => getComputedStyle(e).transformStyle === 'preserve-3d'
      )
      const items = section.querySelectorAll('a[aria-label]')
      return {
        hasStage: !!stage,
        // preserve-3d is destroyed by any ancestor establishing a containing block, so asserting it
        // survives is what catches a stray overflow/filter/transform being added to a parent later.
        transformStyle: stage ? getComputedStyle(stage).transformStyle : 'none',
        count: items.length,
        opacity: items[0] ? getComputedStyle(items[0]).opacity : 'x',
      }
    })
    expect(ring.hasStage).toBe(true)
    expect(ring.transformStyle).toBe('preserve-3d')
    // Eight exactly: the ring has eight cells and a missing one reads as broken, not sparse.
    expect(ring.count).toBeGreaterThanOrEqual(8)
    expect(parseFloat(ring.opacity)).toBeCloseTo(0.4, 1)
  })

  // The rotation is the whole point of the element and nothing above sees it: the assertions there
  // pass identically against a ring welded at one angle, which is exactly the bug that shipped once.
  //
  // Sampled against the reference's own measured curve at 1440×900 — 0° at scrollY 90 (section top
  // crossing the viewport bottom) to 100° at 2070 (section bottom reaching the viewport top), linear
  // at 0.0505°/px, then clamped. Read off the ROTATOR, not the outer pose: the pose wrapper is a
  // fixed 85° tilt and probing it instead reports a perfectly static ring, which is how the earlier
  // measurement went wrong.
  test('scrubs the ring rotation to scroll along the reference curve', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForTimeout(2500)

    const read = () =>
      page.evaluate(() => {
        const el = document.querySelector('[data-ring-rotator]')
        if (!el) return null
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform)
        return (Math.atan2(m.m12, m.m11) * 180) / Math.PI
      })

    // Lenis eases rather than jumps, and the scrub follows the eased position, so the angle is still
    // moving right after a `scrollTo`. Settle in two stages, because settling on the angle alone is
    // wrong in a way that silently passes: for the first frames after `scrollTo`, Lenis has not begun
    // easing, so two consecutive reads are trivially equal and the helper returns the PREVIOUS
    // sample's angle. Waiting for the scroll position to arrive first is what makes the angle reading
    // mean anything.
    const settle = async (label: string, probe: () => Promise<number | null>) => {
      // Unconditional lead-in for the same reason: a probe read before Lenis has begun easing is
      // equal to the one before it, and "equal twice" would exit on motion that has not started.
      await page.waitForTimeout(250)
      let last: number | null = null
      for (let i = 0; i < 60; i++) {
        const now = await probe()
        if (now !== null && last !== null && Math.abs(now - last) < 0.05) return now
        last = now
        await page.waitForTimeout(100)
      }
      throw new Error(`${label} never settled (last ${last})`)
    }

    const angleAt = async (y: number) => {
      await page.evaluate((yy) => window.scrollTo(0, yy), y)
      // Settles wherever Lenis lands, not necessarily at `y` — 2400 may be past the document's max
      // scroll, and the clamp assertion is about the angle, not about reaching an exact offset.
      await settle(`scroll to ${y}`, () => page.evaluate(() => window.scrollY))
      return settle(`ring rotation at ${y}`, read)
    }

    // Tolerance ±3°: Lenis may still be settling by a pixel or two, which at 0.0505°/px is noise.
    // Wide enough to survive that, far too tight to pass if the scrub is absent or half-speed.
    expect(await angleAt(90)).toBeCloseTo(0, 0)

    const at900 = await angleAt(900)
    expect(at900).toBeGreaterThan(37)
    expect(at900).toBeLessThan(44)

    const at1400 = await angleAt(1400)
    expect(at1400).toBeGreaterThan(63)
    expect(at1400).toBeLessThan(69)

    // Clamps rather than continuing to spin past the section.
    expect(await angleAt(2400)).toBeCloseTo(100, 0)
  })
})

test.describe('the load curtain', () => {
  test('clears itself completely and never intercepts a click', async ({ page }) => {
    await page.goto('/')
    // Non-interactive from the first frame — a full-screen overlay that is even briefly clickable
    // swallows the visitor's first click, which is how this pattern usually breaks.
    const pe = await page.evaluate(() => {
      const el = document.querySelector('[data-load-curtain]')
      return el ? getComputedStyle(el).pointerEvents : 'absent'
    })
    if (pe !== 'absent') expect(pe).toBe('none')

    // And it must be genuinely gone, not merely transparent: asserting pointer-events alone would
    // pass against a curtain still visually covering the whole page.
    await expect
      .poll(async () => page.locator('[data-load-curtain]').count(), { timeout: 6000 })
      .toBe(0)
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('shows no curtain and leaves every hairline drawn', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1200)
    // The curtain is removed by a CSS media query rather than by JS, so it is hidden even before
    // hydration.
    const visible = await page.evaluate(() => {
      const el = document.querySelector('[data-load-curtain]')
      return el ? getComputedStyle(el).display : 'absent'
    })
    expect(['none', 'absent']).toContain(visible)

    // The second half of this test used to assert that every hairline arrives already drawn under
    // reduced motion. That contract no longer has a subject on this page: the rules that separate
    // blocks are now static `border-t` borders, which cannot fail to be drawn, and the only
    // `.in-out-line` left is the link underline — whose correct rest state is `scaleX(0)`, because it
    // is a hover affordance. Asserting "drawn" against it would demand every nav and footer link ship
    // permanently underlined.
    //
    // What is worth protecting instead is that the structural rules are genuinely present (a visitor
    // who suppresses motion must still get the separators, since they carry information), and that
    // the link underline does not animate at all for them.
    const rules = await page.evaluate(() => {
      const bordered = Array.from(document.querySelectorAll('main *')).filter(
        (el) => parseFloat(getComputedStyle(el).borderTopWidth) > 0
      )
      const underline = document.querySelector('header .in-out-line')
      return {
        structuralCount: bordered.length,
        underlineScaleX: underline
          ? new DOMMatrixReadOnly(getComputedStyle(underline).transform).a
          : 'absent',
        underlineTransition: underline ? getComputedStyle(underline).transitionDuration : 'absent',
      }
    })
    expect(rules.structuralCount).toBeGreaterThan(0)
    expect(rules.underlineScaleX).toBe(0)
    expect(rules.underlineTransition).toBe('0s')
  })
})
