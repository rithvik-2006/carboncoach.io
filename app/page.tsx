import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Leaf, BarChart2, Bot, Target } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
          <Leaf className="size-8 text-primary" />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Track your carbon footprint with AI
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Log activities, visualise your emissions, and get personalised advice from your AI
            coach — all in one place.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: BarChart2,
              title: 'Emissions Dashboard',
              desc: 'Visual trends and KPI cards at a glance',
            },
            {
              icon: Target,
              title: 'Monthly Goals',
              desc: 'Set targets and track progress over time',
            },
            {
              icon: Bot,
              title: 'AI Coach',
              desc: 'Personalised advice based on your data',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-4 py-5"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <Button size="lg" render={<Link href="/auth/sign-up" />}>
            Get started free
          </Button>
          <Button variant="outline" size="lg" render={<Link href="/auth/login" />}>
            Sign in
          </Button>
        </div>
      </div>
    </main>
  )
}
