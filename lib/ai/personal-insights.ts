import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are a personal sustainability analyst. 
Analyze the provided user data (reductions, achievements, recent activities, and rank).
Generate a short, insightful summary of their progress.
Highlight their biggest contributor category, their rank, or recommend a targeted next action to improve their rank.
Keep it strictly under 3 sentences. Tone should be motivating and professional.
Do not use markdown formatting or asterisks.`

export async function generatePersonalInsight(userId: string) {
  const supabase = await createClient()

  // 1. Fetch user data
  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', userId).single()
  const { data: reductions } = await supabase.from('global_carbon_reductions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
  const { data: achievements } = await supabase.from('global_achievements').select('*').eq('user_id', userId).order('achieved_at', { ascending: false }).limit(5)

  if (!profile) return null

  // Calculate some stats
  const totalSaved = reductions?.reduce((sum, r) => sum + Number(r.reduction_amount), 0) || 0
  const categories = reductions?.reduce((acc: any, r) => {
    acc[r.category] = (acc[r.category] || 0) + Number(r.reduction_amount)
    return acc
  }, {})

  const contextData = {
    userName: profile.display_name,
    totalSavedThisPeriod: totalSaved,
    recentAchievements: achievements?.map(a => a.badge_name),
    savingsByCategory: categories,
    // Note: To pass true rank we would query the leaderboard logic here, 
    // but we can omit for simplicity or let the AI make a general encouraging statement based on their totals.
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
      console.error("NVIDIA API Error generating personal insight")
      return null
    }

    const data = await response.json()
    const insightText = data.choices?.[0]?.message?.content?.trim() || ''

    if (insightText) {
      // 3. Store insight
      await supabase.from('global_ai_insights').insert({
        user_id: userId,
        insight: insightText
      })
    }

    return insightText

  } catch (error) {
    console.error("Failed to generate personal insight", error)
    return null
  }
}
