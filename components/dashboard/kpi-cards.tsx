'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingDown, TrendingUp, Leaf, Target, Flame, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardsProps {
  totalCo2ThisMonth: number
  totalCo2LastMonth: number
  monthlyGoalKg: number
  streak: number
  totalActivities: number
}

export function KpiCards({
  totalCo2ThisMonth,
  totalCo2LastMonth,
  monthlyGoalKg,
  streak,
  totalActivities,
}: KpiCardsProps) {
  const percentChange =
    totalCo2LastMonth > 0
      ? ((totalCo2ThisMonth - totalCo2LastMonth) / totalCo2LastMonth) * 100
      : 0
  const isImproving = totalCo2ThisMonth <= totalCo2LastMonth
  const goalProgress = Math.min((totalCo2ThisMonth / monthlyGoalKg) * 100, 100)
  const goalStatus = totalCo2ThisMonth <= monthlyGoalKg ? 'on-track' : 'over'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total CO2 this month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Leaf className="size-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">
              {totalCo2ThisMonth.toFixed(1)}
            </span>
            <span className="mb-1 text-sm text-muted-foreground">kg CO₂e</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            {isImproving ? (
              <TrendingDown className="size-3.5 text-emerald-500" />
            ) : (
              <TrendingUp className="size-3.5 text-destructive" />
            )}
            <span
              className={cn(
                'text-xs font-medium',
                isImproving ? 'text-emerald-500' : 'text-destructive',
              )}
            >
              {Math.abs(percentChange).toFixed(1)}% vs last month
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Goal progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Goal</CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Target className="size-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{goalProgress.toFixed(0)}%</span>
            <span className="mb-1 text-sm text-muted-foreground">of {monthlyGoalKg} kg</span>
          </div>
          <div className="mt-2 space-y-1">
            <Progress value={goalProgress} className="h-1.5" />
            <Badge
              variant={goalStatus === 'on-track' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {goalStatus === 'on-track' ? 'On track' : 'Over budget'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Logging Streak</CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Flame className="size-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{streak}</span>
            <span className="mb-1 text-sm text-muted-foreground">
              {streak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {streak >= 7 ? 'Amazing consistency!' : streak >= 3 ? 'Keep it up!' : 'Start logging daily'}
          </p>
        </CardContent>
      </Card>

      {/* Total activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Activities Logged
          </CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="size-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{totalActivities}</span>
            <span className="mb-1 text-sm text-muted-foreground">total</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>
    </div>
  )
}
