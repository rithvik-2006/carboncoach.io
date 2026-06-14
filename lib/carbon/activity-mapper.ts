import { ActivityWithCarbon } from './carbon-engine'
import { Activity } from '../types'

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
