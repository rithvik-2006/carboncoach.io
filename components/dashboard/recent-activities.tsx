'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import type { ActivityWithCategory } from '@/lib/types'
import { Car, Utensils, Zap, ShoppingBag, Trash2, MoreHorizontal } from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  car: Car,
  utensils: Utensils,
  zap: Zap,
  'shopping-bag': ShoppingBag,
  'trash-2': Trash2,
  'more-horizontal': MoreHorizontal,
}

interface RecentActivitiesProps {
  activities: ActivityWithCategory[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card className="col-span-2 xl:col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Recent Activities</CardTitle>
        <CardDescription>Your last 10 logged entries</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="flex h-40 items-center justify-center px-6 text-sm text-muted-foreground">
            No activities logged yet.
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="flex flex-col divide-y divide-border">
              {activities.map((activity) => {
                const Icon = ICON_MAP[activity.categories?.icon ?? 'more-horizontal'] ?? MoreHorizontal
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${activity.categories?.color}20` }}
                    >
                      <Icon
                        className="size-4"
                        style={{ color: activity.categories?.color }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.logged_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                      {activity.co2_kg.toFixed(2)} kg
                    </Badge>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
