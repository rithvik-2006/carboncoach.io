'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { calculateAndStoreGlobalReduction } from '@/lib/carbon/global-reduction-engine'

interface LogActivityInput {
  categoryId: number | string
  description: string
  amount: number
  unit: string
  co2Kg: number
  loggedAt: string
}

export async function logActivity(payload: LogActivityInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthenticated operational request blocked.')

  const result = await supabase
    .from('activities')
    .insert({
      user_id: user.id,
      category_id: payload.categoryId,
      description: payload.description,
      amount: payload.amount,
      unit: payload.unit,
      co2_kg: payload.co2Kg,
      logged_at: payload.loggedAt,
    })
    .select()

  if (result.data && result.data[0]) {
    const activity = result.data[0]
    const { data: categoryData } = await supabase
      .from('categories')
      .select('name')
      .eq('id', payload.categoryId)
      .single()
    const categoryName = categoryData?.name || 'Other'

    await calculateAndStoreGlobalReduction(
      user.id,
      activity.id,
      categoryName,
      Number(activity.co2_kg),
      activity.description
    )
  }

  revalidatePath('/dashboard')
  revalidatePath('/log')

  return result
}

export async function deleteActivity(activityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/log')
}
