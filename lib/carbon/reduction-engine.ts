import { createClient } from '@/lib/supabase/server'
import { feedEngine } from '../community/feed-engine'
import { achievementEngine } from '../community/achievement-engine'

/**
 * Computes the carbon emissions reduction for a user's activity relative to their baseline.
 * If the reduction is positive, stores the record and updates the community feed and achievements.
 * 
 * @param {string} userId - The unique identifier of the user logging the reduction.
 * @param {string} communityId - The unique identifier of the community leaderboard to update.
 * @param {string} activityId - The unique identifier of the source activity.
 * @param {string} category - The activity category name (e.g., 'Transport').
 * @param {number} currentCo2 - The carbon output of the current activity.
 * @param {string} description - The description details.
 * @returns {Promise<any | null>} The created reduction record, or null if no savings occur.
 */
export async function calculateAndStoreReduction(
  userId: string,
  communityId: string,
  activityId: string,
  category: string,
  currentCo2: number,
  description: string
) {
  const supabase = await createClient()

  // 1. Fetch historical activities of the same category for this user
  const { data: pastActivities } = await supabase
    .from('activities')
    .select('co2_kg')
    .eq('user_id', userId)
    // We would ideally filter by category_id, but we'll use a text search on description or join categories
    // For simplicity, let's assume we can query by category name via join
    .neq('id', activityId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!pastActivities || pastActivities.length === 0) {
    // No baseline, so we can't calculate a reduction
    return null
  }

  // 2. Calculate previous average emissions
  const totalPastCo2 = pastActivities.reduce((sum, act) => sum + Number(act.co2_kg), 0)
  const averagePastCo2 = totalPastCo2 / pastActivities.length

  // 3. Compare current activity emission
  const reductionAmount = averagePastCo2 - currentCo2

  // 4. Compute difference & only store positive reductions
  if (reductionAmount > 0) {
    // Insert record
    const { data: reductionRecord, error } = await supabase
      .from('carbon_reductions')
      .insert({
        user_id: userId,
        community_id: communityId,
        activity_id: activityId,
        category: category,
        reduction_amount: reductionAmount
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to insert carbon reduction", error)
      return null
    }

    // Trigger community engines (Feed and Achievements)
    await feedEngine.generateReductionFeed(userId, communityId, reductionAmount, description)
    await achievementEngine.checkAndUnlockAchievements(communityId)

    return reductionRecord
  }

  return null
}
