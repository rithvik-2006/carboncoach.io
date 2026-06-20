import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/components/coach/chat-interface'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { startOfMonth, endOfMonth } from 'date-fns'
import { Lightbulb, TrendingDown, Zap, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CoachPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const now = new Date()
  const [profileRes, thisMonthRes] = await Promise.all([
    supabase.from('profiles').select('monthly_goal_kg, display_name').eq('id', user.id).single(),
    supabase
      .from('activities')
      .select('co2_kg, categories(name)')
      .eq('user_id', user.id)
      .gte('logged_at', startOfMonth(now).toISOString())
      .lte('logged_at', endOfMonth(now).toISOString()),
  ])

  const profile = profileRes.data
  const thisMonthCo2 = (thisMonthRes.data ?? []).reduce((s, a) => s + Number(a.co2_kg), 0)
  const goal = profile?.monthly_goal_kg ?? 200
  const pct = Math.min(Math.round((thisMonthCo2 / goal) * 100), 999)
  const onTrack = thisMonthCo2 <= goal

  const catMap = new Map<string, number>()
  for (const a of thisMonthRes.data ?? []) {
    const name = (a as unknown as { categories: { name: string } | null }).categories?.name ?? 'Other'
    catMap.set(name, (catMap.get(name) ?? 0) + Number(a.co2_kg))
  }
  const topCategory = [...catMap.entries()].sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 min-h-screen bg-background/30">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-muted/60 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl flex items-center gap-2.5">
            AI Carbon Coach
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Personalized, data-driven climate advice parsed directly from your real-time activities.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <Sparkles className="size-3.5 animate-pulse" />
          Active Optimization
        </div>
      </div>

      {/* Aesthetic Highlight Statistics Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1 */}
        <Card className="relative overflow-hidden shadow-sm border-muted/70 backdrop-blur-sm bg-card/50 transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Budget Used</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Zap className="size-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold tracking-tight text-foreground">{pct}%</div>
            <Badge 
              variant={onTrack ? 'secondary' : 'destructive'} 
              className={`text-[11px] px-2 py-0 rounded-md font-medium ${onTrack ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/10' : ''}`}
            >
              {onTrack ? '✔ Under Limit Goal' : '⚠ Exceeded Cap'}
            </Badge>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/20 via-primary to-primary/40" />
        </Card>

        {/* Card 2 */}
        <Card className="relative overflow-hidden shadow-sm border-muted/70 backdrop-blur-sm bg-card/50 transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Output Core</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <TrendingDown className="size-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight truncate text-foreground">
              {topCategory ? topCategory[0] : 'None Clean'}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {topCategory ? `${topCategory[1].toFixed(1)} kg CO₂e accumulated` : 'Excellent zero metric run'}
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/40" />
        </Card>

        {/* Card 3 */}
        <Card className="relative overflow-hidden shadow-sm border-muted/70 backdrop-blur-sm bg-card/50 transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Mass Accumulation</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Lightbulb className="size-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold tracking-tight text-foreground">{thisMonthCo2.toFixed(1)} <span className="text-sm font-medium text-muted-foreground">kg</span></div>
            <p className="text-xs text-muted-foreground font-medium">
              Absolute current footprint out of {goal} kg ceiling
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-emerald-500/40" />
        </Card>
      </div>

      {/* Main Chat Core Block */}
      <ChatInterface />
    </div>
  )
}
