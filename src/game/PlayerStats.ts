/**
 * Local career stats — no accounts, no backend. Quiet progression that lives
 * in localStorage so returning players see their history without any setup.
 */

import type { MatchResult } from './types';

export interface PlayerStats {
    games: number;
    wins: number;
    draws: number;
    bestShare: number; // best territory % in a single match
    bestStreak: number;
    tilesFlipped: number; // lifetime
}

const STATS_KEY = 'cp:stats';

const DEFAULT_STATS: PlayerStats = {
    games: 0,
    wins: 0,
    draws: 0,
    bestShare: 0,
    bestStreak: 0,
    tilesFlipped: 0,
};

export const getStats = (): PlayerStats => {
    try {
        const raw = localStorage.getItem(STATS_KEY);
        if (!raw) return { ...DEFAULT_STATS };
        const parsed = JSON.parse(raw) as Partial<PlayerStats>;
        return {
            games: Number(parsed.games) || 0,
            wins: Number(parsed.wins) || 0,
            draws: Number(parsed.draws) || 0,
            bestShare: Number(parsed.bestShare) || 0,
            bestStreak: Number(parsed.bestStreak) || 0,
            tilesFlipped: Number(parsed.tilesFlipped) || 0,
        };
    } catch {
        return { ...DEFAULT_STATS };
    }
};

export const recordMatch = (result: MatchResult): PlayerStats => {
    const stats = getStats();
    stats.games += 1;
    if (result.won) stats.wins += 1;
    if (result.draw) stats.draws += 1;
    stats.bestShare = Math.max(stats.bestShare, result.dayShare);
    stats.bestStreak = Math.max(stats.bestStreak, result.bestStreak);
    stats.tilesFlipped += result.tilesFlipped;
    try {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
        // private mode — stats just won't persist
    }
    return stats;
};
