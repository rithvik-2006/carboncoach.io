import { z } from 'zod'

export const ExtractedActivitySchema = z.object({
  category: z.enum(['Transport', 'Food', 'Energy', 'Shopping', 'Waste', 'Other']).catch('Other'),
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  unit: z.string(),
  metadata: z.record(z.any()).optional().default({}),
})

export const ExtractionResponseSchema = z.object({
  document_type: z.enum(['receipt', 'utility_bill', 'fuel_receipt', 'transport_invoice', 'unknown']).catch('unknown'),
  activities: z.array(ExtractedActivitySchema).default([]),
})

export type ExtractedActivity = z.infer<typeof ExtractedActivitySchema>
export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>

export function validateExtraction(data: unknown): ExtractionResponse {
  try {
    return ExtractionResponseSchema.parse(data)
  } catch (error) {
    console.error("Validation failed:", error)
    // Return a safe default instead of throwing to prevent complete failure
    return {
      document_type: 'unknown',
      activities: []
    }
  }
}
