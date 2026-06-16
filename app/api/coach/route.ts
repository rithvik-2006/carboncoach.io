// import { streamText, convertToModelMessages } from 'ai'
// import { ollama } from 'ai-sdk-ollama'
// import { createClient } from '@/lib/supabase/server'
// import type { UIMessage } from 'ai'
// import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

// export async function POST(req: Request) {
//   const { messages }: { messages: UIMessage[] } = await req.json()

//   // Fetch user context for system prompt
//   const supabase = await createClient()
//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   let contextBlock = ''

//   if (user) {
//     const now = new Date()
//     const monthStart = startOfMonth(now)
//     const monthEnd = endOfMonth(now)
//     const lastMonthStart = startOfMonth(subMonths(now, 1))
//     const lastMonthEnd = endOfMonth(subMonths(now, 1))

//     const [profileRes, thisMonthRes, lastMonthRes, topCatsRes] = await Promise.all([
//       supabase.from('profiles').select('monthly_goal_kg, display_name').eq('id', user.id).single(),
//       supabase
//         .from('activities')
//         .select('co2_kg, categories(name)')
//         .eq('user_id', user.id)
//         .gte('logged_at', monthStart.toISOString())
//         .lte('logged_at', monthEnd.toISOString()),
//       supabase
//         .from('activities')
//         .select('co2_kg')
//         .eq('user_id', user.id)
//         .gte('logged_at', lastMonthStart.toISOString())
//         .lte('logged_at', lastMonthEnd.toISOString()),
//       supabase
//         .from('activities')
//         .select('co2_kg, categories(name)')
//         .eq('user_id', user.id)
//         .gte('logged_at', monthStart.toISOString())
//         .order('co2_kg', { ascending: false })
//         .limit(5),
//     ])

//     const profile = profileRes.data
//     const thisMonthCo2 = (thisMonthRes.data ?? []).reduce((s, a) => s + Number(a.co2_kg), 0)
//     const lastMonthCo2 = (lastMonthRes.data ?? []).reduce((s, a) => s + Number(a.co2_kg), 0)
//     const goal = profile?.monthly_goal_kg ?? 200

//     const catMap = new Map<string, number>()
//     for (const a of thisMonthRes.data ?? []) {
//       const name = (a as unknown as { categories: { name: string } | null }).categories?.name ?? 'Other'
//       catMap.set(name, (catMap.get(name) ?? 0) + Number(a.co2_kg))
//     }
//     const topCategories = [...catMap.entries()]
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 3)
//       .map(([name, kg]) => `${name}: ${kg.toFixed(1)} kg`)
//       .join(', ')

//     contextBlock = `
// USER CONTEXT:
// - Name: ${profile?.display_name ?? 'User'}
// - Monthly CO2 goal: ${goal} kg CO2e
// - This month's emissions: ${thisMonthCo2.toFixed(1)} kg CO2e (${((thisMonthCo2 / goal) * 100).toFixed(0)}% of goal)
// - Last month's emissions: ${lastMonthCo2.toFixed(1)} kg CO2e
// - Top emission categories this month: ${topCategories || 'None logged yet'}
// - Trend: ${thisMonthCo2 < lastMonthCo2 ? 'Improving vs last month' : 'Higher than last month'}
// `
//   }

//   const result = streamText({
//     model: ollama(process.env.OLLAMA_MODEL || 'llama3.2:3b'),
//     system: `You are Carbon Coach, an expert AI sustainability advisor. You help users understand and reduce their personal carbon footprint.

// Your personality:
// - Encouraging and supportive, never judgmental
// - Data-driven: cite specific numbers and actionable percentages
// - Practical: prioritize changes with the highest impact-to-effort ratio
// - Concise: keep responses focused and scannable (use bullet points when helpful)

// ${contextBlock}

// When giving advice:
// 1. Reference the user's actual data when available
// 2. Focus on the highest-impact categories first
// 3. Suggest 2-3 concrete, achievable actions
// 4. Celebrate wins and progress
// 5. Use kg CO2e as the unit for all emissions

// Never make up data about the user. If no context is available, give general evidence-based carbon reduction advice.`,
//     messages: await convertToModelMessages(messages),
//     maxOutputTokens: 1024,
//   })

//   return result.toUIMessageStreamResponse()
// }
import { streamText, convertToModelMessages } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createClient } from '@/lib/supabase/server'
import type { UIMessage } from 'ai'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

const nvidia = createOpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY,
})

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Fetch user context for system prompt
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let contextBlock = ''

  if (user) {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    const [profileRes, thisMonthRes, lastMonthRes, topCatsRes] = await Promise.all([
      supabase.from('profiles').select('monthly_goal_kg, display_name').eq('id', user.id).single(),
      supabase
        .from('activities')
        .select('co2_kg, categories(name)')
        .eq('user_id', user.id)
        .gte('logged_at', monthStart.toISOString())
        .lte('logged_at', monthEnd.toISOString()),
      supabase
        .from('activities')
        .select('co2_kg')
        .eq('user_id', user.id)
        .gte('logged_at', lastMonthStart.toISOString())
        .lte('logged_at', lastMonthEnd.toISOString()),
      supabase
        .from('activities')
        .select('co2_kg, categories(name)')
        .eq('user_id', user.id)
        .gte('logged_at', monthStart.toISOString())
        .order('co2_kg', { ascending: false })
        .limit(5),
    ])

    const profile = profileRes.data
    const thisMonthCo2 = (thisMonthRes.data ?? []).reduce((s, a) => s + Number(a.co2_kg), 0)
    const lastMonthCo2 = (lastMonthRes.data ?? []).reduce((s, a) => s + Number(a.co2_kg), 0)
    const goal = profile?.monthly_goal_kg ?? 200

    const catMap = new Map<string, number>()
    for (const a of thisMonthRes.data ?? []) {
      const name = (a as unknown as { categories: { name: string } | null }).categories?.name ?? 'Other'
      catMap.set(name, (catMap.get(name) ?? 0) + Number(a.co2_kg))
    }
    const topCategories = [...catMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, kg]) => `${name}: ${kg.toFixed(1)} kg`)
      .join(', ')

    contextBlock = `
USER CONTEXT:
- Name: ${profile?.display_name ?? 'User'}
- Monthly CO2 goal: ${goal} kg CO2e
- This month's emissions: ${thisMonthCo2.toFixed(1)} kg CO2e (${((thisMonthCo2 / goal) * 100).toFixed(0)}% of goal)
- Last month's emissions: ${lastMonthCo2.toFixed(1)} kg CO2e
- Top emission categories this month: ${topCategories || 'None logged yet'}
- Trend: ${thisMonthCo2 < lastMonthCo2 ? 'Improving vs last month' : 'Higher than last month'}
`
  }

  const result = streamText({
    model: nvidia('openai/gpt-oss-20b'),
    system: `You are Carbon Coach, an expert AI sustainability advisor. You help users understand and reduce their personal carbon footprint.

Your personality:
- Encouraging and supportive, never judgmental
- Data-driven: cite specific numbers and actionable percentages
- Practical: prioritize changes with the highest impact-to-effort ratio
- Concise: keep responses focused and scannable (use markdown headings and bullet points cleanly)

${contextBlock}

When giving advice:
1. Reference the user's actual data when available
2. Focus on the highest-impact categories first
3. Suggest 2-3 concrete, achievable actions using clear structural lists
4. Celebrate wins and progress
5. Use kg CO2e as the unit for all emissions

Never make up data about the user. If no context is available, give general evidence-based carbon reduction advice.`,
    messages: await convertToModelMessages(messages),
    maxTokens: 1024,
  })

  return result.toUIMessageStreamResponse()
}