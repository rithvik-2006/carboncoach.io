'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Activity } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

type FeedEvent = { id: string, message: string, created_at: string, event_type: string }

export function CommunityFeed({ initialData }: { initialData: FeedEvent[] }) {
  const [feed, setFeed] = useState<FeedEvent[]>(initialData)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('feed-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_feed' }, (payload) => {
        const newEvent = payload.new as FeedEvent
        setFeed(prev => [newEvent, ...prev].slice(0, 50)) // Keep top 50
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <Card className="h-full border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center gap-2">
        <Activity className="size-5 text-emerald-500" />
        <CardTitle className="text-lg">Live Feed</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-[300px] w-full px-6 pb-4">
          <div className="space-y-4 pr-4">
            {feed.map((event) => (
              <div key={event.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="mt-1 size-2 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium leading-tight">{event.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {feed.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">Waiting for activity...</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
