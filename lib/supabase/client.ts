import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | undefined

/**
 * Retrieves or initializes the singleton Supabase client instance for client-side operations.
 * 
 * @returns {SupabaseClient} The browser-side Supabase client singleton.
 */
export function createClient() {
  if (supabase) return supabase

  supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return supabase
}
