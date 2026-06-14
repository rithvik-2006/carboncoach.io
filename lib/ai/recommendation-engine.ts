import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { ActivityWithCarbon } from '../carbon/carbon-engine'

const nimProvider = createOpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_NIM_API_KEY || '',
})

export async function generateRecommendations(activities: ActivityWithCarbon[]): Promise<string[]> {
  if (!process.env.NVIDIA_NIM_API_KEY || activities.length === 0) {
    return [
      "Keep track of your carbon footprint by scanning more receipts.",
      "Consider replacing high-emission purchases with sustainable alternatives."
    ]
  }

  const activitiesText = activities.map(a => 
    `- ${a.description}: ${a.amount} ${a.unit} (${a.co2_kg} kg CO2)`
  ).join('\n')

  try {
    const { text } = await generateText({
      model: nimProvider('meta/llama3-70b-instruct'), // use standard text model for reasoning
      system: `You are a sustainability expert analyzing user activities.
Given the following recent scanned activities, generate exactly 3 short, actionable, and personalized recommendations to reduce their carbon footprint.
Return each recommendation on a new line. Do not use numbers or bullet points in the output. Focus on the most impactful changes based on the provided data.
Keep each recommendation under 100 characters.`,
      prompt: `Recent activities:\n${activitiesText}`
    })

    const recommendations = text.split('\n').map(r => r.trim()).filter(r => r.length > 0)
    return recommendations.slice(0, 3)
  } catch (error) {
    console.error("Failed to generate recommendations:", error)
    return [
      "Small changes make a big difference over time.",
      "Consider reducing meat consumption for a lower footprint.",
      "Try walking or biking for short trips instead of driving."
    ]
  }
}
