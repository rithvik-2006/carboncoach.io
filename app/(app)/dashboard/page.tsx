import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KpiCards } from '@/components/dashboard/kpi-cards'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
  format,
  eachDayOfInterval,
} from 'date-fns'
import type { ActivityWithCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))
  const thirtyDaysAgo = subDays(now, 29)

  // Parallel data fetching
  const [profileRes, thisMonthRes, lastMonthRes, recentRes, trendRes, allCountRes] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('activities')
        .select('co2_kg, category_id, categories(id, name, color, icon)')
        .eq('user_id', user.id)
        .gte('logged_at', monthStart.toISOString())
        .lte('logged_at', monthEnd.toISOString()),
      supabase
        .from('activities')
        .select('co2_kg')
        .eq('user_id', user.id)
        .gte('logged_at', lastMonthStart.toISOString())
        .lte('logged_at', lastMonthEnd.toISOString()),
      supabase
        .from('activities')
        .select('*, categories(*)')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(10),
      supabase
        .from('activities')
        .select('co2_kg, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', thirtyDaysAgo.toISOString())
        .order('logged_at', { ascending: true }),
      supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ])

  const profile = profileRes.data
  const monthlyGoalKg = profile?.monthly_goal_kg ?? 200

  // Total CO2 this month
  const totalCo2ThisMonth = (thisMonthRes.data ?? []).reduce(
    (sum, a) => sum + Number(a.co2_kg),
    0,
  )

  // Total CO2 last month
  const totalCo2LastMonth = (lastMonthRes.data ?? []).reduce(
    (sum, a) => sum + Number(a.co2_kg),
    0,
  )

  // Category breakdown
  const categoryMap = new Map<string, { name: string; co2: number; color: string }>()
  for (const activity of thisMonthRes.data ?? []) {
    const cat = (activity as unknown as { categories: { id: string; name: string; color: string; icon: string } | null }).categories
    if (!cat) continue
    const existing = categoryMap.get(cat.id)
    if (existing) {
      existing.co2 += Number(activity.co2_kg)
    } else {
      categoryMap.set(cat.id, { name: cat.name, co2: Number(activity.co2_kg), color: cat.color })
    }
  }
  const categoryData = Array.from(categoryMap.values()).sort((a, b) => b.co2 - a.co2)

  // 30-day trend (fill gaps with 0)
  const dayMap = new Map<string, number>()
  for (const a of trendRes.data ?? []) {
    const day = format(new Date(a.logged_at), 'MMM d')
    dayMap.set(day, (dayMap.get(day) ?? 0) + Number(a.co2_kg))
  }
  const trendData = eachDayOfInterval({ start: thirtyDaysAgo, end: now }).map((d) => {
    const label = format(d, 'MMM d')
    return { date: label, co2: dayMap.get(label) ?? 0 }
  })

  // Streak calculation
  const streakData = (trendRes.data ?? []).map((a) =>
    format(new Date(a.logged_at), 'yyyy-MM-dd'),
  )
  const uniqueDays = [...new Set(streakData)].sort()
  let streak = 0
  let checkDate = format(now, 'yyyy-MM-dd')
  for (let i = uniqueDays.length - 1; i >= 0; i--) {
    if (uniqueDays[i] === checkDate) {
      streak++
      const d = new Date(checkDate)
      d.setDate(d.getDate() - 1)
      checkDate = format(d, 'yyyy-MM-dd')
    } else if (uniqueDays[i] < checkDate) {
      break
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {profile?.display_name ?? user.email?.split('@')[0]}
        </p>
      </div>

      <KpiCards
        totalCo2ThisMonth={totalCo2ThisMonth}
        totalCo2LastMonth={totalCo2LastMonth}
        monthlyGoalKg={monthlyGoalKg}
        streak={streak}
        totalActivities={allCountRes.count ?? 0}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TrendChart data={trendData} />
        <CategoryBreakdown data={categoryData} />
        <RecentActivities activities={(recentRes.data ?? []) as ActivityWithCategory[]} />
      </div>
    </div>
  )
}
