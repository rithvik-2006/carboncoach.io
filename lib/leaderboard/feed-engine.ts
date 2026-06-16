import { createClient } from '@/lib/supabase/server'

export const feedEngine = {
  async generateReductionFeed(userId: string, reductionAmount: number, description: string) {
    const supabase = await createClient()

    // 1. Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()

    const name = profile?.display_name || 'A user'
    const formattedAmount = reductionAmount.toFixed(1)

    // 2. Generate feed message
    const message = `${name} saved ${formattedAmount}kg CO₂ by ${description.toLowerCase()}`

    // 3. Insert feed event
    await supabase
      .from('global_activity_feed')
      .insert({
        user_id: userId,
        event_type: 'reduction',
        message: message,
        metadata: { reductionAmount }
      })
  },

  async generateAchievementFeed(userId: string, badgeName: string) {
    const supabase = await createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()

    const name = profile?.display_name || 'A user'

    const message = `🏆 ${name} unlocked a new achievement: ${badgeName}!`

    await supabase
      .from('global_activity_feed')
      .insert({
        user_id: userId,
        event_type: 'achievement',
        message: message,
        metadata: { badgeName }
      })
  }
}
