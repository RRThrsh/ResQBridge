import { normalizeEmail } from '@/lib/admin'

describe('normalizeEmail', () => {
  it('trims whitespace and lowercases', () => {
    expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com')
  })

  it('handles already normalized email', () => {
    expect(normalizeEmail('a@b.co')).toBe('a@b.co')
  })
})
