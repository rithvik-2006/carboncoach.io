'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Target } from 'lucide-react'

export function PersonalRankCard({ rank, totalSaved }: { rank: number | null, totalSaved: number }) {
  return (
    <Card className="border-muted/60 shadow-sm bg-primary/5 border-primary/20 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute -right-4 -top-4 opacity-10 pointer-events-none">
        <Target className="size-32 text-primary" />
      </div>
      <CardContent className="p-6 relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">📈 Your Rank</p>
          <p className="text-4xl font-extrabold text-foreground mt-1">
            {rank ? `#${rank}` : 'Unranked'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">You have saved</p>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            <TrendingUp className="size-5 text-emerald-500" />
            <span className="text-2xl font-bold text-emerald-500">{totalSaved.toFixed(1)}kg CO₂</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
