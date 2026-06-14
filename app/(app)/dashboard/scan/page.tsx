'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScanUploader } from '@/components/log/scan-uploader'
import { ProcessingStatus } from '@/components/log/processing-status'
import { ScanReview } from '@/components/log/scan-review'
import { scanDocumentAction } from '@/app/actions/scan-document'
import { confirmScanAction } from '@/app/actions/confirm-scan'
import { ActivityWithCarbon } from '@/lib/carbon/carbon-engine'
import { toast } from 'sonner'
import { Bot, Lightbulb } from 'lucide-react'

type AppState = 'upload' | 'processing' | 'review' | 'success'

export default function ScanPage() {
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>('upload')
  const [processingStatus, setProcessingStatus] = useState<'uploading' | 'analyzing' | 'extracting' | 'calculating' | 'completed' | 'failed'>('uploading')
  const [activities, setActivities] = useState<ActivityWithCarbon[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileSelect = async (file: File) => {
    setAppState('processing')
    setProcessingStatus('uploading')

    try {
      const formData = new FormData()
      formData.append('file', file)

      // In a real scenario we could use Server Sent Events or WebSockets for real-time status
      // Here we simulate the pipeline steps
      const processingInterval = setInterval(() => {
        setProcessingStatus((prev) => {
          if (prev === 'uploading') return 'analyzing'
          if (prev === 'analyzing') return 'extracting'
          if (prev === 'extracting') return 'calculating'
          return prev
        })
      }, 1500)

      const result = await scanDocumentAction(formData)
      
      clearInterval(processingInterval)
      setProcessingStatus('completed')
      
      setTimeout(() => {
        setActivities(result.activities)
        setAppState('review')
      }, 1000)

    } catch (error) {
      console.error(error)
      setProcessingStatus('failed')
      toast.error('Failed to process document. Please try again.')
      setTimeout(() => setAppState('upload'), 3000)
    }
  }

  const handleConfirm = async (confirmedActivities: ActivityWithCarbon[]) => {
    setIsSubmitting(true)
    try {
      const result = await confirmScanAction(confirmedActivities)
      if (result.success) {
        setRecommendations(result.recommendations)
        setAppState('success')
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to save activities')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Receipt Scanner</h1>
        <p className="text-muted-foreground">
          Upload your receipts, utility bills, or invoices and let our AI automatically extract and calculate your carbon footprint.
        </p>
      </div>

      {appState === 'upload' && (
        <div className="mt-8">
          <ScanUploader onFileSelect={handleFileSelect} />
        </div>
      )}

      {appState === 'processing' && (
        <div className="mt-12">
          <ProcessingStatus status={processingStatus} />
        </div>
      )}

      {appState === 'review' && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScanReview 
            initialActivities={activities} 
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {appState === 'success' && (
        <div className="mx-auto w-full max-w-2xl space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Bot className="size-8 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Activities Saved Successfully!</h2>
            <p className="text-muted-foreground">
              Your dashboard has been updated with the new data.
            </p>
          </div>

          {recommendations.length > 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <div className="mb-4 flex items-center gap-2 text-primary">
                <Lightbulb className="size-5" />
                <h3 className="font-semibold">AI Coach Recommendations</h3>
              </div>
              <ul className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <button 
              onClick={() => setAppState('upload')}
              className="text-sm font-medium text-primary hover:underline"
            >
              Scan another document
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
