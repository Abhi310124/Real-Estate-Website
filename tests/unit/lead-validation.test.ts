import { describe, expect, it } from 'vitest'
import { validateLead } from '@/app/api/lead/validate'

const ok = { name: 'Karthik', phone: '+91 6301999971', source: 'enquiry' }

describe('validateLead', () => {
  it('accepts a valid Indian mobile number', () => {
    expect(validateLead(ok).ok).toBe(true)
  })

  it('accepts a bare 10-digit Indian mobile', () => {
    expect(validateLead({ ...ok, phone: '9676669923' }).ok).toBe(true)
  })

  it('rejects a too-short number', () => {
    const r = validateLead({ ...ok, phone: '12345' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.phone).toBeTruthy()
  })

  it('rejects an Indian mobile starting below 6', () => {
    expect(validateLead({ ...ok, phone: '1234567890' }).ok).toBe(false)
  })

  it('requires a name', () => {
    const r = validateLead({ ...ok, name: '  ' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.name).toBeTruthy()
  })

  it('rejects an unknown source', () => {
    expect(validateLead({ ...ok, source: 'spam' }).ok).toBe(false)
  })

  it('accepts an optional valid email but rejects a malformed one', () => {
    expect(validateLead({ ...ok, email: 'a@b.co' }).ok).toBe(true)
    expect(validateLead({ ...ok, email: 'not-an-email' }).ok).toBe(false)
  })

  it('normalises the phone to digits for storage', () => {
    const r = validateLead(ok)
    if (r.ok) expect(r.value.phone).toBe('916301999971')
  })
})
