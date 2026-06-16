import { NextResponse } from 'next/server'
import { generateCommunityInsight } from '@/lib/ai/community-insights'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { communityId } = body

    if (!communityId) {
      return NextResponse.json({ error: 'communityId is required' }, { status: 400 })
    }

    const insight = await generateCommunityInsight(communityId)

    return NextResponse.json({ insight })
  } catch (error) {
    console.error("API Error generating insight", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
