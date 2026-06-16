import { createClient } from '@/lib/supabase/server'
import { feedEngine } from './feed-engine'

const THRESHOLDS = [
  { amount: 10, name: 'First 10kg Saved', description: 'You have saved 10kg of CO₂!' },
  { amount: 50, name: 'First 50kg Saved', description: 'You have saved 50kg of CO₂!' },
  { amount: 100, name: 'First 100kg Saved', description: 'You have saved 100kg of CO₂!' },
  { amount: 250, name: 'First 250kg Saved', description: 'You have saved 250kg of CO₂!' },
  { amount: 500, name: 'First 500kg Saved', description: 'You have saved 500kg of CO₂!' },
  { amount: 1000, name: 'Sustainability Champion', description: 'You have saved 1000kg of CO₂!' },
]

export const achievementEngine = {
  async checkAndUnlockAchievements(userId: string) {
    const supabase = await createClient()

    // 1. Calculate total savings for this user
    const { data: reductions, error: redError } = await supabase
      .from('global_carbon_reductions')
      .select('reduction_amount')
      .eq('user_id', userId)

    if (redError || !reductions) return

    const totalSaved = reductions.reduce((sum, r) => sum + Number(r.reduction_amount), 0)

    // 2. Fetch existing achievements
    const { data: existingAchievements } = await supabase
      .from('global_achievements')
      .select('badge_name')
      .eq('user_id', userId)

    const existingNames = new Set(existingAchievements?.map(a => a.badge_name) || [])

    // 3. Check against thresholds
    for (const threshold of THRESHOLDS) {
      if (totalSaved >= threshold.amount && !existingNames.has(threshold.name)) {
        // Unlock achievement
        await supabase
          .from('global_achievements')
          .insert({
            user_id: userId,
            badge_name: threshold.name,
            badge_description: threshold.description
          })

        // Broadcast to feed
        await feedEngine.generateAchievementFeed(userId, threshold.name)
      }
    }
  }
}
