import { createClient } from '@/lib/supabase/server'

export const feedEngine = {
  async generateReductionFeed(userId: string, communityId: string, reductionAmount: number, description: string) {
    const supabase = await createClient()

    // 1. Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()

    const name = profile?.display_name || 'A community member'
    const formattedAmount = reductionAmount.toFixed(1)

    // 2. Generate feed message
    const message = `${name} saved ${formattedAmount}kg CO₂ by ${description.toLowerCase()}`

    // 3. Insert feed event
    await supabase
      .from('community_feed')
      .insert({
        community_id: communityId,
        user_id: userId,
        event_type: 'reduction',
        message: message,
        metadata: { reductionAmount }
      })
  },

  async generateAchievementFeed(communityId: string, badgeName: string) {
    const supabase = await createClient()

    const { data: community } = await supabase
      .from('communities')
      .select('name')
      .eq('id', communityId)
      .single()

    const name = community?.name || 'A community'

    const message = `🏆 ${name} unlocked a new achievement: ${badgeName}!`

    await supabase
      .from('community_feed')
      .insert({
        community_id: communityId,
        event_type: 'achievement',
        message: message,
        metadata: { badgeName }
      })
  }
}
