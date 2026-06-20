import { activitySchema } from '@/lib/validations/activity'

describe('activitySchema validation tests', () => {
  it('should accept valid inputs', () => {
    const validData = {
      category: 'Transport',
      description: 'Drove an EV to work',
      co2_kg: 5.5,
      logged_at: new Date().toISOString(),
    }
    const result = activitySchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject negative co2_kg values', () => {
    const invalidData = {
      category: 'Transport',
      description: 'Drove an EV',
      co2_kg: -1.2,
    }
    const result = activitySchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('CO2 emission cannot be negative')
    }
  })

  it('should reject empty category strings', () => {
    const invalidData = {
      category: '',
      description: 'Some description',
      co2_kg: 10,
    }
    const result = activitySchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Category is required')
    }
  })

  it('should reject description shorter than 3 characters', () => {
    const invalidData = {
      category: 'Food',
      description: 'Hi',
      co2_kg: 2,
    }
    const result = activitySchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Description must be at least 3 characters')
    }
  })

  it('should reject invalid datetime values for logged_at', () => {
    const invalidData = {
      category: 'Energy',
      description: 'Turned off lights',
      co2_kg: 0.5,
      logged_at: 'not-a-datetime',
    }
    const result = activitySchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
