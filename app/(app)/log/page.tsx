import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActivityForm } from '@/components/log/activity-form'
import { ActivityHistory } from '@/components/log/activity-history'
import type { ActivityWithCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function LogPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [categoriesRes, activitiesRes] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('activities')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(50),
  ])

  return (
    <div className="min-h-screen bg-background/40 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Dynamic Header Structure */}
      <div className="flex flex-col gap-1 border-b pb-5 border-muted/60">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Log Activity
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
          Track and compute your real-time carbon emissions offset to manage your ecological footprint efficiently.
        </p>
      </div>

      {/* Grid Canvas */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 xl:col-span-4 sticky lg:top-8">
          <ActivityForm categories={categoriesRes.data ?? []} />
        </div>
        <div className="lg:col-span-7 xl:col-span-8">
          <ActivityHistory activities={(activitiesRes.data ?? []) as ActivityWithCategory[]} />
        </div>
      </div>
    </div>
  )
}
