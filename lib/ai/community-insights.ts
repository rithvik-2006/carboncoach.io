import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are a sustainability community analyst. 
Analyze the provided community data (reductions, achievements, recent activities).
Generate a short, insightful summary of the community's progress.
Highlight the biggest contributor category, the highest growth area, or recommend a targeted next action.
Keep it strictly under 3 sentences. Tone should be motivating and professional.
Do not use markdown formatting or asterisks.`

export async function generateCommunityInsight(communityId: string) {
  const supabase = await createClient()

  // 1. Fetch community data
  const { data: community } = await supabase.from('communities').select('name').eq('id', communityId).single()
  const { data: reductions } = await supabase.from('carbon_reductions').select('*').eq('community_id', communityId).order('created_at', { ascending: false }).limit(50)
  const { data: achievements } = await supabase.from('community_achievements').select('*').eq('community_id', communityId).order('achieved_at', { ascending: false }).limit(5)

  if (!community) return null

  // Calculate some stats
  const totalSaved = reductions?.reduce((sum, r) => sum + Number(r.reduction_amount), 0) || 0
  const categories = reductions?.reduce((acc: any, r) => {
    acc[r.category] = (acc[r.category] || 0) + Number(r.reduction_amount)
    return acc
  }, {})

  const contextData = {
    communityName: community.name,
    totalSavedThisPeriod: totalSaved,
    recentAchievements: achievements?.map(a => a.badge_name),
    savingsByCategory: categories
  }

  // 2. Call NVIDIA NIM
  if (!process.env.NVIDIA_NIM_API_KEY) {
    throw new Error("NVIDIA_NIM_API_KEY is not configured")
  }

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        temperature: 0.7,
        max_tokens: 150,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: JSON.stringify(contextData)
          }
        ]
      })
    })

    if (!response.ok) {
      console.error("NVIDIA API Error generating insight")
      return null
    }

    const data = await response.json()
    const insightText = data.choices?.[0]?.message?.content?.trim() || ''

    if (insightText) {
      // 3. Store insight
      await supabase.from('community_insights').insert({
        community_id: communityId,
        insight: insightText,
        week_start: new Date().toISOString()
      })
    }

    return insightText

  } catch (error) {
    console.error("Failed to generate insight", error)
    return null
  }
}
