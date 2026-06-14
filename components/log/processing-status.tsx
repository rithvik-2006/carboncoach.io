'use client'

import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface ProcessingStatusProps {
  status: 'uploading' | 'analyzing' | 'extracting' | 'calculating' | 'completed' | 'failed'
}

const steps = [
  { id: 'uploading', label: 'Uploading image' },
  { id: 'analyzing', label: 'Analyzing document' },
  { id: 'extracting', label: 'Extracting activities' },
  { id: 'calculating', label: 'Calculating carbon impact' },
]

export function ProcessingStatus({ status }: ProcessingStatusProps) {
  let activeIndex = steps.findIndex(s => s.id === status)
  if (status === 'completed') activeIndex = steps.length
  if (status === 'failed') activeIndex = -1

  const progress = status === 'completed' ? 100 : status === 'failed' ? 0 : ((activeIndex + 1) / steps.length) * 100

  return (
    <div className="mx-auto w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {status === 'failed' ? 'Processing Failed' : status === 'completed' ? 'Processing Complete' : 'AI Processing...'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {status === 'failed' 
            ? 'There was an error analyzing your document.' 
            : 'Please wait while our AI extracts your activities.'}
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = status === 'completed' || index < activeIndex
          const isActive = index === activeIndex && status !== 'failed' && status !== 'completed'
          const isPending = index > activeIndex && status !== 'completed'

          return (
            <div key={step.id} className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="size-5 text-primary" />
              ) : isActive ? (
                <Loader2 className="size-5 animate-spin text-primary" />
              ) : (
                <div className="size-5 rounded-full border-2 border-muted" />
              )}
              <span className={`text-sm font-medium ${isPending ? 'text-muted-foreground' : 'text-foreground'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
