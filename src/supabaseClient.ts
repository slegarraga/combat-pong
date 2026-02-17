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

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables! Auth and multiplayer will not work.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
