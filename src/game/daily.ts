/**
 * The Daily Duel: one shared board per UTC day.
 *
 * Everyone in the world faces the same seeded serves on the same day, which
 * makes a result comparable, braggable, and worth sharing. Only the first
 * attempt of the day is recorded (replays are practice), Wordle-style.
 */

import type { MatchResult } from './types';

/** Day #1 is 2026-06-12 UTC. */
const DAILY_EPOCH_UTC = Date.UTC(2026, 5, 11);

const DAILY_KEY = 'cp:daily';

export const dailyNumber = (date = new Date()) =>
    Math.floor(
        (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - DAILY_EPOCH_UTC) / 86400000,
    );

/** Knuth multiplicative hash: spreads consecutive day numbers across seeds. */
export const dailySeed = (n: number) => Math.imul(n + 1, 2654435761) >>> 0;

export interface DailyRecord {
    n: number;
    share: number;
    won: boolean;
    draw: boolean;
    /** consecutive days played, ending on day `n` */
    streakDays: number;
}

const readRecord = (): DailyRecord | null => {
    try {
        const raw = localStorage.getItem(DAILY_KEY);
        return raw ? (JSON.parse(raw) as DailyRecord) : null;
    } catch {
        return null;
    }
};

/** The recorded first attempt for day `n`, if any. */
export const getDailyRecord = (n: number): DailyRecord | null => {
    const record = readRecord();
    return record?.n === n ? record : null;
};

/** The most recent daily ever recorded, whatever day it was. */
export const getLatestDailyRecord = (): DailyRecord | null => readRecord();

/** Record the first attempt of the day; later attempts are practice. */
export const saveDailyRecord = (n: number, result: MatchResult): DailyRecord => {
    const previous = readRecord();
    if (previous?.n === n) return previous;
    const record: DailyRecord = {
        n,
        share: result.dayShare,
        won: result.won,
        draw: result.draw,
        // Played yesterday too? The day streak keeps climbing.
        streakDays: previous?.n === n - 1 ? previous.streakDays + 1 : 1,
    };
    try {
        localStorage.setItem(DAILY_KEY, JSON.stringify(record));
    } catch {
        // private mode — the result just won't persist
    }
    return record;
};
