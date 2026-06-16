import { createClient } from '@/lib/supabase/server'
import { feedEngine } from './feed-engine'

const THRESHOLDS = [
  { amount: 100, name: 'First 100kg Saved', description: 'Your community has saved 100kg of CO₂!' },
  { amount: 250, name: 'First 250kg Saved', description: 'Your community has saved 250kg of CO₂!' },
  { amount: 500, name: 'First 500kg Saved', description: 'Your community has saved 500kg of CO₂!' },
  { amount: 1000, name: 'First 1000kg Saved', description: 'Your community has saved 1000kg of CO₂!' },
  { amount: 2500, name: 'First 2500kg Saved', description: 'Your community has saved 2500kg of CO₂!' },
  { amount: 5000, name: 'First 5000kg Saved', description: 'Your community has saved 5000kg of CO₂!' },
]

export const achievementEngine = {
  async checkAndUnlockAchievements(communityId: string) {
    const supabase = await createClient()

    // 1. Calculate total savings for this community
    const { data: reductions, error: redError } = await supabase
      .from('carbon_reductions')
      .select('reduction_amount')
      .eq('community_id', communityId)

    if (redError || !reductions) return

    const totalSaved = reductions.reduce((sum, r) => sum + Number(r.reduction_amount), 0)

    // 2. Fetch existing achievements
    const { data: existingAchievements } = await supabase
      .from('community_achievements')
      .select('badge_name')
      .eq('community_id', communityId)

    const existingNames = new Set(existingAchievements?.map(a => a.badge_name) || [])

    // 3. Check against thresholds
    for (const threshold of THRESHOLDS) {
      if (totalSaved >= threshold.amount && !existingNames.has(threshold.name)) {
        // Unlock achievement
        await supabase
          .from('community_achievements')
          .insert({
            community_id: communityId,
            badge_name: threshold.name,
            badge_description: threshold.description
          })

        // Broadcast to feed
        await feedEngine.generateAchievementFeed(communityId, threshold.name)
      }
    }
  }
}
