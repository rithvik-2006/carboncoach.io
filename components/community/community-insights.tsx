'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CommunityInsights({ initialInsight, communityId }: { initialInsight: string | null, communityId: string }) {
  const [insight, setInsight] = useState<string | null>(initialInsight)
  const [loading, setLoading] = useState(false)

  async function handleRefresh() {
    if (!communityId) return
    setLoading(true)
    try {
      const res = await fetch('/api/community/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId })
      })
      const data = await res.json()
      if (data.insight) {
        setInsight(data.insight)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-emerald-500/20 shadow-sm bg-emerald-500/5 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="size-24 text-emerald-500" />
      </div>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-emerald-500" />
          <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400">Weekly AI Insight</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading} className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10">
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {insight ? (
          <p className="text-sm font-medium leading-relaxed text-foreground/80 relative z-10">
            {insight}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground relative z-10">
            No insights available yet. Click refresh to generate one.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
