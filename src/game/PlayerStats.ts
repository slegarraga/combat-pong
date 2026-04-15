/**
 * Local-only player stats for the anonymous duel experience.
 *
 * The goal is simple: preserve the satisfaction of progression without any
 * account system, sync step, or backend dependency. Everything lives in
 * `localStorage`, so the player can dip in, leave, and return with zero setup.
 */

import type { Difficulty } from './types';

export interface PlayerStats {
    gamesPlayed: number;
    wins: number;
    losses: number;
    totalTerritoryConquered: number;
    bestScore: number;
    bestStreak: number;
    bestMargin: number;
    favoriteDifficulty: Difficulty;
    lastRivalAlias: string;
    lastUpdated: string;
}

export interface GameRecordInput {
    result: 'win' | 'loss';
    territoryPercent: number;
    bestStreak: number;
    margin: number;
    difficulty: Difficulty;
    rivalAlias: string;
}

const STATS_KEY = 'combat_pong_stats_v2';

const DEFAULT_STATS: PlayerStats = {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    totalTerritoryConquered: 0,
    bestScore: 0,
    bestStreak: 0,
    bestMargin: 0,
    favoriteDifficulty: 'MEDIUM',
    lastRivalAlias: 'None yet',
    lastUpdated: new Date().toISOString(),
};

const isDifficulty = (value: unknown): value is Difficulty =>
    value === 'EASY' || value === 'MEDIUM' || value === 'HARD' || value === 'NIGHTMARE';

export const getLocalStats = (): PlayerStats => {
    try {
        const saved = localStorage.getItem(STATS_KEY);
        if (!saved) return DEFAULT_STATS;

        const parsed = JSON.parse(saved) as Partial<PlayerStats>;
        return {
            ...DEFAULT_STATS,
            ...parsed,
            favoriteDifficulty: isDifficulty(parsed.favoriteDifficulty) ? parsed.favoriteDifficulty : 'MEDIUM',
            lastRivalAlias: parsed.lastRivalAlias || 'None yet',
        };
    } catch (error) {
        console.error('Error reading local stats:', error);
        return DEFAULT_STATS;
    }
};

const saveLocalStats = (stats: PlayerStats) => {
    try {
        localStorage.setItem(
            STATS_KEY,
            JSON.stringify({
                ...stats,
                lastUpdated: new Date().toISOString(),
            }),
        );
    } catch (error) {
        console.error('Error saving local stats:', error);
    }
};

/**
 * Persists a completed duel and returns the updated stat snapshot.
 *
 * The function is synchronous because there is no backend anymore, which keeps
 * the game-over flow simple and makes the call site easy to reason about.
 */
export const recordGame = (input: GameRecordInput): PlayerStats => {
    const stats = getLocalStats();

    stats.gamesPlayed += 1;
    stats.totalTerritoryConquered += input.territoryPercent;
    stats.bestScore = Math.max(stats.bestScore, input.territoryPercent);
    stats.bestStreak = Math.max(stats.bestStreak, input.bestStreak);
    stats.bestMargin = Math.max(stats.bestMargin, Math.abs(input.margin));
    stats.favoriteDifficulty = input.difficulty;
    stats.lastRivalAlias = input.rivalAlias;

    if (input.result === 'win') {
        stats.wins += 1;
    } else {
        stats.losses += 1;
    }

    saveLocalStats(stats);
    return stats;
};

export const getWinRate = (stats: PlayerStats) => {
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.wins / stats.gamesPlayed) * 100);
};

export const getAverageTerritory = (stats: PlayerStats) => {
    if (stats.gamesPlayed === 0) return 0;
    return Math.round(stats.totalTerritoryConquered / stats.gamesPlayed);
};
