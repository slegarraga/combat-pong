/**
 * Supabase client singleton.
 *
 * Used for:
 *   - Google OAuth authentication
 *   - Realtime channels (multiplayer game state + matchmaking presence)
 *   - Storage (share card image uploads)
 *   - Database (player_stats table, when available)
 *
 * Configured via environment variables — see `.env.example`.
 * The game works without Supabase (single-player only, stats in localStorage).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Whether Supabase is configured (env vars present). When false, auth and multiplayer are unavailable. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
    console.warn('Missing Supabase environment variables — auth and multiplayer disabled.')
}

// Use a placeholder URL when env vars are missing so createClient doesn't throw.
// API calls will fail gracefully instead of crashing the app on startup.
export const supabase: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
)
