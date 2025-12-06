import { createBrowserClient } from '@supabase/ssr'

export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time or when env vars are missing, return a mock client
    if (typeof window === 'undefined') {
      // Server-side: return null, components should handle this
      return null as any
    }
    // Client-side: throw error for user to see
    throw new Error('Supabase configuration missing. Please check your environment variables.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
