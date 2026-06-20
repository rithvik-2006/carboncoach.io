'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { Trophy } from 'lucide-react'

type LeaderboardEntry = { id: string, name: string, total_saved: number }

export function CommunityLeaderboard({ initialData }: { initialData: LeaderboardEntry[] }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialData)
  const supabase = createClient()

  useEffect(() => {
    // 1. Subscribe to carbon_reductions
    const channel = supabase.channel('leaderboard-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'carbon_reductions' }, async (_payload) => {
        // When a new reduction arrives, fetch the entire leaderboard again to rank properly
        // In a hyper-optimized app we'd incrementally update the local state
        const { data: communities } = await supabase.from('communities').select('id, name')
        const { data: reductions } = await supabase.from('carbon_reductions').select('community_id, reduction_amount')
        
        if (communities && reductions) {
          const map = new Map<string, LeaderboardEntry>()
          communities.forEach(c => map.set(c.id, { id: c.id, name: c.name, total_saved: 0 }))
          reductions.forEach(r => {
            const entry = map.get(r.community_id)
            if (entry) entry.total_saved += Number(r.reduction_amount)
          })
          const newBoard = Array.from(map.values()).sort((a, b) => b.total_saved - a.total_saved)
          setLeaderboard(newBoard)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const maxSaved = leaderboard.length > 0 ? leaderboard[0].total_saved : 1

  return (
    <Card className="h-full border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center gap-2">
        <Trophy className="size-5 text-amber-500" />
        <CardTitle className="text-lg">Campus Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {leaderboard.map((entry, index) => (
          <div key={entry.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-muted-foreground w-4">{index + 1}</span>
                <span className="font-medium">{entry.name}</span>
              </div>
              <span className="font-bold text-emerald-500">{entry.total_saved.toFixed(1)} kg</span>
            </div>
            <Progress value={(entry.total_saved / maxSaved) * 100} className="h-2" indicatorColor={index === 0 ? "bg-amber-500" : "bg-emerald-500"} />
          </div>
        ))}
        {leaderboard.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">No data yet.</div>
        )}
      </CardContent>
    </Card>
  )
}
