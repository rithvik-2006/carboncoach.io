import { createClient } from '@/lib/supabase/server'

export async function getCommunityLeaderboard() {
  const supabase = await createClient()

  // We do this by aggregating reductions grouped by community
  const { data: communities, error: comError } = await supabase
    .from('communities')
    .select('id, name')

  if (comError || !communities) return []

  const { data: reductions, error: redError } = await supabase
    .from('carbon_reductions')
    .select('community_id, reduction_amount')

  if (redError || !reductions) return []

  // Aggregate
  const leaderboardMap = new Map<string, { id: string, name: string, total_saved: number }>()

  communities.forEach(c => {
    leaderboardMap.set(c.id, { id: c.id, name: c.name, total_saved: 0 })
  })

  reductions.forEach(r => {
    const community = leaderboardMap.get(r.community_id)
    if (community) {
      community.total_saved += Number(r.reduction_amount)
    }
  })

  // Convert to array and sort
  const leaderboard = Array.from(leaderboardMap.values())
    .sort((a, b) => b.total_saved - a.total_saved)

  return leaderboard
}
