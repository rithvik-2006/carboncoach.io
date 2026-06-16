import { NextResponse } from 'next/server'
import { generatePersonalInsight } from '@/lib/ai/personal-insights'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const insight = await generatePersonalInsight(user.id)

    return NextResponse.json({ insight })
  } catch (error) {
    console.error("API Error generating insight", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
