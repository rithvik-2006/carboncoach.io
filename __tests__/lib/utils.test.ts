import { cn } from '@/lib/utils'

describe('utils/cn', () => {
  it('merges tailwind classes correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('handles conditional classes properly', () => {
    expect(cn('bg-red-500', true && 'text-white', false && 'p-4')).toBe('bg-red-500 text-white')
  })

  it('resolves tailwind conflicts using tailwind-merge', () => {
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
  })
})
