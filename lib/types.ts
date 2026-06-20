export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  monthly_goal_kg: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string | null
  created_at: string
}

export interface Activity {
  id: string
  user_id: string
  category_id: string
  description: string
  amount: number
  unit: string
  co2_kg: number
  logged_at: string
  source?: 'manual' | 'receipt_scan' | 'utility_scan' | 'invoice_scan' | 'ai_generated'
  created_at: string
  categories?: Category
}

export interface Upload {
  id: string
  user_id: string
  image_url: string
  document_type: string | null
  processing_status: 'pending' | 'analyzing' | 'extracting' | 'calculating' | 'saving' | 'completed' | 'failed'
  extracted_json: unknown | null
  confidence_score: number | null
  created_at: string
  updated_at: string
}

export interface ActivityWithCategory extends Activity {
  categories: Category
}

// Emission factors (kg CO2e per unit)
export const EMISSION_FACTORS: Record<string, { factor: number; unit: string; label: string }[]> = {
  Transport: [
    { factor: 0.21, unit: 'km', label: 'Car (avg gasoline) per km' },
    { factor: 0.089, unit: 'km', label: 'Car (electric) per km' },
    { factor: 0.255, unit: 'km', label: 'Short-haul flight per km' },
    { factor: 0.195, unit: 'km', label: 'Long-haul flight per km' },
    { factor: 0.041, unit: 'km', label: 'Train per km' },
    { factor: 0.089, unit: 'km', label: 'Bus per km' },
  ],
  Food: [
    { factor: 27.0, unit: 'kg', label: 'Beef per kg' },
    { factor: 12.1, unit: 'kg', label: 'Lamb per kg' },
    { factor: 5.9, unit: 'kg', label: 'Pork per kg' },
    { factor: 6.9, unit: 'kg', label: 'Chicken per kg' },
    { factor: 0.4, unit: 'kg', label: 'Vegetables per kg' },
    { factor: 2.5, unit: 'meal', label: 'Restaurant meal' },
    { factor: 0.8, unit: 'meal', label: 'Vegetarian meal' },
  ],
  Energy: [
    { factor: 0.233, unit: 'kWh', label: 'Electricity (avg grid) per kWh' },
    { factor: 2.04, unit: 'therm', label: 'Natural gas per therm' },
    { factor: 2.68, unit: 'kg', label: 'Coal per kg' },
  ],
  Shopping: [
    { factor: 22.0, unit: 'item', label: 'New smartphone' },
    { factor: 300.0, unit: 'item', label: 'Laptop/computer' },
    { factor: 5.0, unit: 'item', label: 'Clothing item (average)' },
    { factor: 0.5, unit: 'item', label: 'Second-hand clothing' },
  ],
  Waste: [
    { factor: 0.57, unit: 'kg', label: 'Landfill waste per kg' },
    { factor: 0.021, unit: 'kg', label: 'Recycled waste per kg' },
    { factor: 0.0, unit: 'kg', label: 'Composted waste per kg' },
  ],
  Other: [
    { factor: 1.0, unit: 'kg CO2e', label: 'Custom (enter CO2 directly)' },
  ],
}
