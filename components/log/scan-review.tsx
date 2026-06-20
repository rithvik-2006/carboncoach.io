'use client'

import { useState } from 'react'
import { ActivityWithCarbon } from '@/lib/carbon/carbon-engine'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Leaf } from 'lucide-react'

interface ScanReviewProps {
  initialActivities: ActivityWithCarbon[]
  onConfirm: (activities: ActivityWithCarbon[]) => void
  isSubmitting: boolean
}

export function ScanReview({ initialActivities, onConfirm, isSubmitting }: ScanReviewProps) {
  const [activities, setActivities] = useState<ActivityWithCarbon[]>(initialActivities)

  const handleUpdate = <K extends keyof ActivityWithCarbon>(index: number, field: K, value: ActivityWithCarbon[K]) => {
    const updated = [...activities]
    updated[index] = { ...updated[index], [field]: value }
    setActivities(updated)
  }

  const handleDelete = (index: number) => {
    const updated = [...activities]
    updated.splice(index, 1)
    setActivities(updated)
  }

  const handleAdd = () => {
    setActivities([...activities, {
      category: 'Other',
      description: 'New Activity',
      amount: 1,
      unit: 'item',
      co2_kg: 0,
      metadata: {}
    }])
  }

  const totalCO2 = activities.reduce((sum, a) => sum + (Number(a.co2_kg) || 0), 0)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Review Extracted Activities</h2>
          <p className="text-sm text-muted-foreground">
            Please verify the activities extracted by the AI before saving them.
          </p>
        </div>
        <div className="flex flex-col items-end rounded-lg bg-primary/10 px-4 py-2 text-primary">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Impact</span>
          <div className="flex items-center gap-1.5 font-bold">
            <Leaf className="size-4" />
            <span>{totalCO2.toFixed(2)} kg CO₂</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
            <div className="flex-1 space-y-2">
              <Input
                value={activity.description}
                onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                placeholder="Description (e.g. Beef Steak)"
                className="font-medium"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={activity.amount}
                  onChange={(e) => handleUpdate(index, 'amount', Number(e.target.value))}
                  placeholder="Amount"
                  className="w-24"
                />
                <Input
                  value={activity.unit}
                  onChange={(e) => handleUpdate(index, 'unit', e.target.value)}
                  placeholder="Unit"
                  className="w-24"
                />
                <select
                  value={activity.category}
                  onChange={(e) => handleUpdate(index, 'category', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Energy">Energy</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Waste">Waste</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2">
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Carbon Impact</span>
                <span className="font-semibold">{Number(activity.co2_kg).toFixed(2)} kg</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(index)}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No activities extracted. Try adding one manually.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button variant="outline" onClick={handleAdd} className="gap-2">
          <Plus className="size-4" />
          Add Activity
        </Button>
        <Button 
          onClick={() => onConfirm(activities)} 
          disabled={activities.length === 0 || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? 'Saving...' : 'Confirm & Save'}
        </Button>
      </div>
    </div>
  )
}
