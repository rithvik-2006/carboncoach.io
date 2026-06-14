import { ExtractedActivity } from '../ai/validate-extraction'

export interface ActivityWithCarbon extends ExtractedActivity {
  co2_kg: number
}

// Simple deterministic fallback emissions engine based on user requirements.
// For a production system this would query a complex emission factor DB.
export function calculateCarbonImpact(activities: ExtractedActivity[]): ActivityWithCarbon[] {
  return activities.map(activity => {
    let co2_kg = 0
    const desc = activity.description.toLowerCase()

    if (activity.category === 'Transport') {
      if (desc.includes('car')) co2_kg = activity.amount * 0.21
      else if (desc.includes('bus')) co2_kg = activity.amount * 0.08
      else if (desc.includes('train')) co2_kg = activity.amount * 0.04
      else co2_kg = activity.amount * 0.21 // Default transport
    } 
    else if (activity.category === 'Food') {
      if (desc.includes('beef')) co2_kg = activity.amount * 27
      else if (desc.includes('chicken')) co2_kg = activity.amount * 6.9
      else if (desc.includes('vegan')) co2_kg = activity.amount * 1.5
      else if (desc.includes('vegetarian') || desc.includes('veg')) co2_kg = activity.amount * 2.5
      else co2_kg = activity.amount * 2.5 // Default food
    }
    else if (activity.category === 'Energy') {
      if (desc.includes('electricity') || activity.unit.toLowerCase() === 'kwh') {
        co2_kg = activity.amount * 0.4
      } else {
        co2_kg = activity.amount * 0.4 // Default energy
      }
    }
    else if (activity.category === 'Shopping') {
      co2_kg = activity.amount * 0.5
    }
    else if (activity.category === 'Waste') {
      co2_kg = activity.amount * 0.2
    }

    // Ensure it's never negative and round to 2 decimal places
    co2_kg = Math.max(0, Math.round(co2_kg * 100) / 100)

    return {
      ...activity,
      co2_kg
    }
  })
}
