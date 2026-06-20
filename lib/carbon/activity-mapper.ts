import { ActivityWithCarbon } from './carbon-engine'
import { Activity } from '../types'

/**
 * Maps raw client activity data into database-compliant models.
 * Associates activity with user, category ID, and calculates appropriate logged timestamps.
 * 
 * @param {string} userId - The unique identifier of the user logging activities.
 * @param {'receipt_scan' | 'utility_scan' | 'invoice_scan' | 'ai_generated'} sourceType - The source type of activity.
 * @param {ActivityWithCarbon[]} activitiesWithCarbon - The array of carbon-calculated activities.
 * @param {Record<string, string>} categoriesMap - Mapping of Category Name to Category ID.
 * @returns {Partial<Activity>[]} The mapped database-compliant activity records.
 */
export function mapToDatabaseActivities(
  userId: string,
  sourceType: 'receipt_scan' | 'utility_scan' | 'invoice_scan' | 'ai_generated',
  activitiesWithCarbon: ActivityWithCarbon[],
  categoriesMap: Record<string, string> // Map of Category Name to Category ID
): Partial<Activity>[] {
  return activitiesWithCarbon.map(activity => {
    // Default to 'Other' if category not found
    const categoryId = categoriesMap[activity.category] || categoriesMap['Other']

    return {
      user_id: userId,
      category_id: categoryId,
      description: activity.description,
      amount: activity.amount,
      unit: activity.unit,
      co2_kg: activity.co2_kg,
      // Temporarily commented out to avoid PGRST204 error until SQL schema cache catches up / column is added
      // source: sourceType,
      logged_at: new Date().toISOString(),
    }
  })
}
