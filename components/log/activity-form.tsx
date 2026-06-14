'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { logActivity } from '@/app/(app)/log/actions'
import { EMISSION_FACTORS } from '@/lib/types'
import type { Category } from '@/lib/types'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { PlusCircle, Leaf, Calendar, FileText, Scale } from 'lucide-react'

interface ActivityFormProps {
  categories: Category[]
}

export function ActivityForm({ categories }: ActivityFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedFactor, setSelectedFactor] = useState<{
    factor: number
    unit: string
    label: string
  } | null>(null)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [co2Preview, setCo2Preview] = useState<number | null>(null)
  const [loggedAt, setLoggedAt] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
  const [loading, setLoading] = useState(false)

  const factors = selectedCategory ? EMISSION_FACTORS[selectedCategory.name] ?? [] : []

  useEffect(() => {
    if (selectedFactor && amount) {
      const co2 = Number(amount) * selectedFactor.factor
      setCo2Preview(isNaN(co2) ? null : co2)
    } else {
      setCo2Preview(null)
    }
  }, [selectedFactor, amount])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCategory || !selectedFactor || !description || !amount) return

    setLoading(true)
    try {
      await logActivity({
        categoryId: selectedCategory.id,
        description,
        amount: Number(amount),
        unit: selectedFactor.unit,
        co2Kg: Number(amount) * selectedFactor.factor,
        loggedAt: new Date(loggedAt).toISOString(),
      })
      toast.success('Activity logged successfully!')
      setDescription('')
      setAmount('')
      setCo2Preview(null)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to log activity.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-fit shadow-md border-muted/60 backdrop-blur-sm bg-card/60">
      <CardHeader className="space-y-1.5 pb-6">
        <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <PlusCircle className="size-5" />
          </div>
          Log New Activity
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Select a category and activity type to calculate your emissions.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Input */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </Label>
            <Select
              value={selectedCategory?.id ?? ''}
              onValueChange={(id) => {
                const category = categories.find((c) => String(c.id) === id) ?? null
                setSelectedCategory(category)
                setSelectedFactor(null)
              }}
            >
              <SelectTrigger id="category" className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select a category">
                  {selectedCategory ? (
                    <div className="flex items-center gap-2.5">
                      <div
                        className="size-2.5 rounded-full ring-2 ring-background shadow-sm"
                        style={{ background: selectedCategory.color }}
                      />
                      <span className="font-medium text-sm">{selectedCategory.name}</span>
                    </div>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)} className="cursor-pointer py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="size-2.5 rounded-full"
                        style={{ background: cat.color }}
                      />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Activity Type Selection */}
          {factors.length > 0 && (
            <div className="space-y-2 animate-in fade-in-50 slide-in-from-top-1 duration-200">
              <Label htmlFor="factor" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Activity Type
              </Label>
              <Select
                value={selectedFactor?.label ?? ''}
                onValueChange={(label) => {
                  const f = factors.find((f) => f.label === label) ?? null
                  setSelectedFactor(f)
                }}
              >
                <SelectTrigger id="factor" className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Choose specific activity type" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {factors.map((f) => (
                    <SelectItem key={f.label} value={f.label} className="py-3 cursor-pointer">
                      <div className="flex w-full flex-col gap-1">
                        <span className="font-medium text-sm text-foreground">{f.label}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="rounded-md font-mono text-[10px] bg-muted px-1.5 py-0">
                            {f.factor} kg CO₂e/{f.unit}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">per {f.unit}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dynamic Row for Amount and Date Picker */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {selectedFactor && (
              <div className="space-y-2 animate-in fade-in-50 duration-200">
                <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                  <span>Amount</span>
                  <span className="text-[11px] text-primary/80 lowercase bg-primary/5 px-2 py-0.5 rounded-full font-mono">
                    in {selectedFactor.unit}
                  </span>
                </Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
                  <Input
                    id="amount"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    className="h-11 pl-9 font-medium"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="loggedAt" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date & Time
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
                <Input
                  id="loggedAt"
                  type="datetime-local"
                  className="h-11 pl-9 text-sm text-foreground font-medium scheme-dark-fix"
                  value={loggedAt}
                  onChange={(e) => setLoggedAt(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description / Notes
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
              <Input
                id="description"
                placeholder="e.g., Commute to main office campus"
                className="h-11 pl-9 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Calculated Output Banner */}
          {co2Preview !== null && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Leaf className="size-4 animate-pulse" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Calculated Footprint:</span>
              </div>
              <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                {co2Preview.toFixed(3)} <span className="text-xs font-sans font-medium">kg CO₂e</span>
              </span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 font-medium transition-all active:scale-[0.98]"
            disabled={loading || !selectedCategory || !selectedFactor || !description || !amount}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                <span>Saving Activity...</span>
              </div>
            ) : (
              'Log Activity'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
