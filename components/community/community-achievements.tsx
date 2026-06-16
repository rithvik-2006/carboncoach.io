'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Medal } from 'lucide-react'

type Achievement = { id: string, badge_name: string, badge_description: string, achieved_at: string }

export function CommunityAchievements({ initialData, communityId }: { initialData: Achievement[], communityId: string }) {
  const [achievements, setAchievements] = useState<Achievement[]>(initialData)
  const supabase = createClient()

  useEffect(() => {
    if (!communityId) return

    const channel = supabase.channel('achievements-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_achievements', filter: `community_id=eq.${communityId}` }, (payload) => {
        const newAchievement = payload.new as Achievement
        setAchievements(prev => [newAchievement, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, communityId])

  return (
    <Card className="border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center gap-2">
        <Medal className="size-5 text-indigo-500" />
        <CardTitle className="text-lg">Unlocked Badges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex flex-col items-center justify-center p-3 rounded-xl border border-muted bg-background/50 text-center space-y-1.5 animate-in zoom-in-95 duration-300">
              <span className="text-2xl">🌱</span>
              <p className="text-xs font-semibold">{achievement.badge_name}</p>
            </div>
          ))}
          {achievements.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground py-2">No badges unlocked yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
