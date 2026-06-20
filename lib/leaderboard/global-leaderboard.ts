import { createClient } from '@supabase/supabase-js'
import { subDays } from 'date-fns'
import { unstable_cache } from 'next/cache'

/**
 * Internal helper to fetch and aggregate the global carbon reduction leaderboard.
 * 
 * @param {'weekly' | 'monthly' | 'all'} [timeWindow='all'] - The timeframe window to calculate rankings for.
 * @returns {Promise<any[]>} An array containing sorted leaderboard entries with ranks.
 */
async function fetchGlobalLeaderboard(timeWindow: 'weekly' | 'monthly' | 'all' = 'all') {
  // Use a cookie-free client for globally cached data — no user-specific auth needed
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // We do this by aggregating reductions grouped by user
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')

  if (profError || !profiles) return []

  let query = supabase
    .from('global_carbon_reductions')
    .select('user_id, reduction_amount, created_at')

  if (timeWindow === 'weekly') {
    const oneWeekAgo = subDays(new Date(), 7).toISOString()
    query = query.gte('created_at', oneWeekAgo)
  } else if (timeWindow === 'monthly') {
    const oneMonthAgo = subDays(new Date(), 30).toISOString()
    query = query.gte('created_at', oneMonthAgo)
  }

  const { data: reductions, error: redError } = await query

  if (redError || !reductions) return []

  // Aggregate
  const leaderboardMap = new Map<string, { id: string, name: string, avatar: string, total_saved: number }>()

  profiles.forEach(p => {
    leaderboardMap.set(p.id, { id: p.id, name: p.display_name || 'Anonymous', avatar: p.avatar_url || '', total_saved: 0 })
  })

  reductions.forEach(r => {
    const user = leaderboardMap.get(r.user_id)
    if (user) {
      user.total_saved += Number(r.reduction_amount)
    }
  })

  // Convert to array and sort
  const leaderboard = Array.from(leaderboardMap.values())
    .filter(u => u.total_saved > 0)
    .sort((a, b) => b.total_saved - a.total_saved)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

  return leaderboard
}

/**
 * Cached version of fetchGlobalLeaderboard using Next.js unstable_cache.
 * 
 * @type {Function}
 */
export const getGlobalLeaderboard = unstable_cache(
  async (timeWindow: 'weekly' | 'monthly' | 'all' = 'all') => fetchGlobalLeaderboard(timeWindow),
  ['global-leaderboard'],
  { revalidate: 3600, tags: ['leaderboard'] }
)
