import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading activity log...</p>
    </div>
  )
}
