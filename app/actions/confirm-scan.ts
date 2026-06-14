'use server'

import { createClient } from '@/lib/supabase/server'
import { ActivityWithCarbon } from '@/lib/carbon/carbon-engine'
import { mapToDatabaseActivities } from '@/lib/carbon/activity-mapper'
import { generateRecommendations } from '@/lib/ai/recommendation-engine'

export async function confirmScanAction(activitiesWithCarbon: ActivityWithCarbon[]) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  if (!activitiesWithCarbon || activitiesWithCarbon.length === 0) {
    throw new Error('No activities provided')
  }

  // 1. Fetch categories
  const { data: categories, error: catError } = await supabase.from('categories').select('id, name')
  if (catError) {
    throw new Error('Failed to fetch categories')
  }

  const categoriesMap: Record<string, string> = {}
  categories.forEach(c => {
    categoriesMap[c.name] = c.id
  })

  // 2. Map to database format
  const dbActivities = mapToDatabaseActivities(
    user.id,
    'receipt_scan', // or derive from the frontend
    activitiesWithCarbon,
    categoriesMap
  )

  // 3. Insert into database
  const { error: insertError } = await supabase.from('activities').insert(dbActivities)

  if (insertError) {
    console.error("Failed to insert activities:", insertError)
    throw new Error('Failed to save activities')
  }

  // 4. Generate recommendations
  const recommendations = await generateRecommendations(activitiesWithCarbon)

  return { success: true, recommendations }
}
