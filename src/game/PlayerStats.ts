// Player Stats Service - Tracks wins, games played, and best scores
// Uses localStorage with optional Supabase sync when table is created

import { supabase } from '../supabaseClient';

export interface PlayerStats {
    gamesPlayed: number;
    wins: number;
    losses: number;
    totalTerritoryConquered: number;
    bestScore: number;
    lastUpdated: string;
}

const STATS_KEY = 'combat_pong_stats';

// Get stats from localStorage
export const getLocalStats = (): PlayerStats => {
    try {
        const saved = localStorage.getItem(STATS_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error reading stats:', e);
    }

    return {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        totalTerritoryConquered: 0,
        bestScore: 0,
        lastUpdated: new Date().toISOString()
    };
};

// Save stats to localStorage
const saveLocalStats = (stats: PlayerStats): void => {
    try {
        localStorage.setItem(STATS_KEY, JSON.stringify({
            ...stats,
            lastUpdated: new Date().toISOString()
        }));
    } catch (e) {
        console.error('Error saving stats:', e);
    }
};

// Record a game result
export const recordGame = async (
    result: 'win' | 'loss',
    territoryPercent: number,
    userId?: string
): Promise<PlayerStats> => {
    const stats = getLocalStats();

    // Update local stats
    stats.gamesPlayed += 1;
    if (result === 'win') {
        stats.wins += 1;
    } else {
        stats.losses += 1;
    }
    stats.totalTerritoryConquered += territoryPercent;
    if (territoryPercent > stats.bestScore) {
        stats.bestScore = territoryPercent;
    }

    saveLocalStats(stats);

    // Try to sync with Supabase if user is logged in
    if (userId) {
        try {
            await syncToSupabase(userId, stats);
        } catch (e) {
            console.log('Supabase sync not available yet');
        }
    }

    return stats;
};

// Sync stats to Supabase (will silently fail if table doesn't exist)
const syncToSupabase = async (userId: string, stats: PlayerStats): Promise<void> => {
    const { error } = await supabase
        .from('player_stats')
        .upsert({
            user_id: userId,
            games_played: stats.gamesPlayed,
            wins: stats.wins,
            losses: stats.losses,
            total_territory_conquered: stats.totalTerritoryConquered,
            best_score: stats.bestScore,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        });

    if (error) {
        throw error;
    }
};

// Load stats from Supabase (merge with local)
export const loadFromSupabase = async (userId: string): Promise<PlayerStats | null> => {
    try {
        const { data, error } = await supabase
            .from('player_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return null;
        }

        const cloudStats: PlayerStats = {
            gamesPlayed: data.games_played,
            wins: data.wins,
            losses: data.losses,
            totalTerritoryConquered: data.total_territory_conquered,
            bestScore: data.best_score,
            lastUpdated: data.updated_at
        };

        // Merge: take the higher values
        const localStats = getLocalStats();
        const mergedStats: PlayerStats = {
            gamesPlayed: Math.max(cloudStats.gamesPlayed, localStats.gamesPlayed),
            wins: Math.max(cloudStats.wins, localStats.wins),
            losses: Math.max(cloudStats.losses, localStats.losses),
            totalTerritoryConquered: Math.max(cloudStats.totalTerritoryConquered, localStats.totalTerritoryConquered),
            bestScore: Math.max(cloudStats.bestScore, localStats.bestScore),
            lastUpdated: new Date().toISOString()
        };

        saveLocalStats(mergedStats);
        return mergedStats;
    } catch (e) {
        return null;
    }
};

// Get win rate as percentage
export const getWinRate = (stats: PlayerStats): number => {
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.wins / stats.gamesPlayed) * 100);
};

// Get average territory conquered
export const getAverageTerritory = (stats: PlayerStats): number => {
    if (stats.gamesPlayed === 0) return 0;
    return Math.round(stats.totalTerritoryConquered / stats.gamesPlayed);
};
