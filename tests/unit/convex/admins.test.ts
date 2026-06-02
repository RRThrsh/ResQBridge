import { DEFAULT_ADMIN, normalizeEmail } from '../../../convex/lib/admins'

describe('convex/lib/admins', () => {
  it('normalizeEmail matches client helper behavior', () => {
    expect(normalizeEmail('  Admin@Site.COM ')).toBe('admin@site.com')
  })

  it('DEFAULT_ADMIN has required fields', () => {
    expect(DEFAULT_ADMIN).toMatchObject({
      email: expect.stringMatching(/@/),
      firstName: expect.any(String),
      lastName: expect.any(String),
    })
  })
})
