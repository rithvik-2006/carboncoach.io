import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getGlobalLeaderboard } from '@/lib/leaderboard/global-leaderboard'
import { SustainabilityLeaderboard } from '@/components/leaderboard/sustainability-leaderboard'
import { LiveActivityFeed } from '@/components/leaderboard/live-activity-feed'
import { AchievementsPanel } from '@/components/leaderboard/achievements-panel'
import { PersonalRankCard } from '@/components/leaderboard/personal-rank-card'
import { AISustainabilityInsights } from '@/components/leaderboard/ai-sustainability-insights'

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch initial data for SSR
  const [leaderboardData, feedRes, achievementsRes, insightRes] = await Promise.all([
    getGlobalLeaderboard(),
    supabase
      .from('global_activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('global_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('achieved_at', { ascending: false }),
    supabase
      .from('global_ai_insights')
      .select('insight')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
  ])

  // Extract user rank
  const userRankEntry = leaderboardData.find(u => u.id === user.id)
  const userRank = userRankEntry?.rank || null
  const userTotalSaved = userRankEntry?.total_saved || 0

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Community</h1>
        <p className="text-muted-foreground mt-1">
          Compete with carbon savers around the world. Every kg saved counts towards your global rank!
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: AI & Stats */}
        <div className="xl:col-span-1 flex flex-col gap-6 h-full">
          <PersonalRankCard rank={userRank} totalSaved={userTotalSaved} />
          <AISustainabilityInsights initialInsight={insightRes.data?.insight || null} />
          <AchievementsPanel initialData={achievementsRes.data || []} userId={user.id} />
        </div>

        {/* Middle Column: Leaderboard */}
        <div className="xl:col-span-1 h-[600px]">
          <SustainabilityLeaderboard initialData={leaderboardData} />
        </div>

        {/* Right Column: Live Feed */}
        <div className="xl:col-span-1 h-[600px]">
          <LiveActivityFeed initialData={feedRes.data || []} />
        </div>
      </div>
    </div>
  )
}
