import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional classes', () => {
    const hidden = false
    expect(cn('base', hidden ? 'hidden' : undefined, 'visible')).toBe('base visible')
  })
})
