import { z } from 'zod'

export const activitySchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  co2_kg: z.number().min(0, 'CO2 emission cannot be negative'),
  logged_at: z.string().datetime().optional()
})

export type ActivityInput = z.infer<typeof activitySchema>
