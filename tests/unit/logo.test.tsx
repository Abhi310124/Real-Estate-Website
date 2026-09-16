import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Logo } from '@/components/brand/Logo'
import { LogoMark } from '@/components/brand/LogoMark'
import { COLORS } from '@/lib/tokens'

describe('Logo', () => {
  it('is accessible', () => {
    const { getByRole } = render(<Logo variant="dark" />)
    expect(getByRole('img', { name: /BKR INFRA/i })).toBeTruthy()
  })

  it('uses navy wordmark on light backgrounds', () => {
    const { container } = render(<Logo variant="dark" />)
    expect(container.innerHTML).toContain(COLORS['navy-800'])
  })

  it('uses white wordmark on dark backgrounds', () => {
    const { container } = render(<Logo variant="light" />)
    expect(container.innerHTML.toUpperCase()).toContain('#FFFFFF')
  })

  it('keeps the orange triangle accent in both variants', () => {
    for (const v of ['dark', 'light'] as const) {
      const { container } = render(<Logo variant={v} />)
      expect(container.innerHTML.toUpperCase()).toContain(COLORS.orange)
    }
  })
})

describe('LogoMark', () => {
  it('exposes drawable paths for the intro animation', () => {
    const { container } = render(<LogoMark animated />)
    expect(container.querySelectorAll('[data-mark-path]').length).toBeGreaterThan(0)
  })
})
