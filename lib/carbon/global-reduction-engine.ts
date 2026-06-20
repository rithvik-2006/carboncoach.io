import { createClient } from '@/lib/supabase/server'
import { feedEngine } from '../leaderboard/feed-engine'
import { achievementEngine } from '../leaderboard/achievement-engine'

/**
 * Calculates carbon reduction amount relative to past activities and stores it globally.
 * Triggers achievement and feed update engines if a reduction occurs.
 * 
 * @param {string} userId - The unique identifier of the user.
 * @param {string | null} activityId - The unique identifier of the source activity, if applicable.
 * @param {string} category - The category of the activity (e.g., 'Transport', 'Food').
 * @param {number} currentCo2 - The carbon emission of the current activity in kg.
 * @param {string} description - The description of the activity.
 * @returns {Promise<any | null>} The created carbon reduction database record, or null if no reduction occurs or an error is encountered.
 */
export async function calculateAndStoreGlobalReduction(
  userId: string,
  activityId: string | null,
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
      .from('global_carbon_reductions')
      .insert({
        user_id: userId,
        activity_id: activityId,
        category: category,
        reduction_amount: reductionAmount
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to insert global carbon reduction", error)
      return null
    }

    // Trigger leaderboard engines (Feed and Achievements)
    await feedEngine.generateReductionFeed(userId, reductionAmount, description)
    await achievementEngine.checkAndUnlockAchievements(userId)

    return reductionRecord
  }

  return null
}
