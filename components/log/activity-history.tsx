'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { deleteActivity } from '@/app/(app)/log/actions'
import { format } from 'date-fns'
import type { ActivityWithCategory } from '@/lib/types'
import { Car, Utensils, Zap, ShoppingBag, Trash2, MoreHorizontal, History } from 'lucide-react'
import { toast } from 'sonner'

const ICON_MAP: Record<string, React.ElementType> = {
  car: Car,
  utensils: Utensils,
  zap: Zap,
  'shopping-bag': ShoppingBag,
  'trash-2': Trash2,
  'more-horizontal': MoreHorizontal,
}

interface ActivityHistoryProps {
  activities: ActivityWithCategory[]
}

export function ActivityHistory({ activities: initialActivities }: ActivityHistoryProps) {
  const [activities, setActivities] = useState(initialActivities)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirmId) return
    setDeletingId(confirmId)
    try {
      await deleteActivity(confirmId)
      setActivities((prev) => prev.filter((a) => a.id !== confirmId))
      toast.success('Activity deleted.')
    } catch {
      toast.error('Failed to delete activity.')
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4" />
            Activity History
          </CardTitle>
          <CardDescription>{activities.length} activities logged</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {activities.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No activities yet. Log your first one!
            </div>
          ) : (
            <ScrollArea className="h-[480px]">
              <div className="flex flex-col divide-y divide-border">
                {activities.map((activity) => {
                  const Icon =
                    ICON_MAP[activity.categories?.icon ?? 'more-horizontal'] ?? MoreHorizontal
                  return (
                    <div
                      key={activity.id}
                      className="group flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${activity.categories?.color}20` }}
                      >
                        <Icon className="size-4" style={{ color: activity.categories?.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.categories?.name} &middot;{' '}
                          {activity.amount} {activity.unit} &middot;{' '}
                          {format(new Date(activity.logged_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {Number(activity.co2_kg).toFixed(3)} kg
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => setConfirmId(activity.id)}
                        >
                          <Trash2 className="size-3.5" />
                          <span className="sr-only">Delete activity</span>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete activity?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The activity will be permanently removed from your log.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={!!deletingId}>
              {deletingId ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
