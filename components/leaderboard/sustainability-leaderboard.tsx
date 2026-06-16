'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { Trophy, User as AvatarIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LeaderboardPodium } from './leaderboard-podium'
import { subDays } from 'date-fns'
import { cn } from '@/lib/utils'

type LeaderboardEntry = { id: string, name: string, avatar: string, total_saved: number, rank: number }

export function SustainabilityLeaderboard({ initialData }: { initialData: LeaderboardEntry[] }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialData)
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all'>('all')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchLeaderboard = useCallback(async (window: 'weekly' | 'monthly' | 'all') => {
    setLoading(true)
    try {
      const { data: profiles } = await supabase.from('profiles').select('id, display_name, avatar_url')
      let query = supabase.from('global_carbon_reductions').select('user_id, reduction_amount, created_at')
      
      if (window === 'weekly') {
        query = query.gte('created_at', subDays(new Date(), 7).toISOString())
      } else if (window === 'monthly') {
        query = query.gte('created_at', subDays(new Date(), 30).toISOString())
      }
      
      const { data: reductions } = await query
      
      if (profiles && reductions) {
        const map = new Map<string, LeaderboardEntry>()
        profiles.forEach(p => {
          map.set(p.id, { id: p.id, name: p.display_name || 'Anonymous', avatar: p.avatar_url || '', total_saved: 0, rank: 0 })
        })
        reductions.forEach(r => {
          const entry = map.get(r.user_id)
          if (entry) entry.total_saved += Number(r.reduction_amount)
        })
        const newBoard = Array.from(map.values())
          .filter(u => u.total_saved > 0)
          .sort((a, b) => b.total_saved - a.total_saved)
          .map((entry, index) => ({ ...entry, rank: index + 1 }))
          
        setLeaderboard(newBoard)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Refetch when timeframe tab is clicked
  useEffect(() => {
    fetchLeaderboard(timeframe)
  }, [timeframe, fetchLeaderboard])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel('global-leaderboard-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_carbon_reductions' }, async () => {
        // Fetch new leaderboard matching active timeframe
        fetchLeaderboard(timeframe)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, timeframe, fetchLeaderboard])

  const topThree = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)
  const maxSaved = leaderboard.length > 0 ? leaderboard[0].total_saved : 1

  return (
    <Card className="h-full border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-500" />
          <CardTitle className="text-lg">Top Carbon Savers</CardTitle>
        </div>
        {loading && <span className="text-[10px] text-muted-foreground animate-pulse">Syncing...</span>}
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col min-h-0">
        {/* Timeframe Selectors */}
        <div className="flex bg-muted/40 p-1 rounded-xl gap-1 text-xs font-semibold border border-muted/40">
          {(['all', 'monthly', 'weekly'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setTimeframe(w)}
              className={cn(
                "flex-1 py-1.5 rounded-lg capitalize transition-all cursor-pointer",
                timeframe === w
                  ? "bg-card text-foreground shadow-sm border border-muted/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {w === 'all' ? 'All-Time' : w}
            </button>
          ))}
        </div>

        {/* Podium section for top 3 */}
        {topThree.length > 0 ? (
          <LeaderboardPodium topThree={topThree} />
        ) : (
          !loading && (
            <div className="text-sm text-muted-foreground text-center py-8 flex-1 flex items-center justify-center">
              No top savers yet. Log an activity to claim #1!
            </div>
          )
        )}

        {/* Scrollable list for positions 4+ */}
        {rest.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {rest.map((entry) => (
              <div key={entry.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-muted-foreground w-5 text-xs">#{entry.rank}</span>
                    <Avatar className="size-6 border">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback className="text-[10px]"><AvatarIcon className="size-3.5"/></AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-xs text-foreground/90">{entry.name}</span>
                  </div>
                  <span className="font-bold text-emerald-500 text-xs">{entry.total_saved.toFixed(1)}kg</span>
                </div>
                <Progress value={(entry.total_saved / maxSaved) * 100}>
                  <ProgressTrack className="h-1 w-full bg-muted/40">
                    <ProgressIndicator className="bg-emerald-500" />
                  </ProgressTrack>
                </Progress>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
