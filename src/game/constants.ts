/**
 * Shared constants for the anonymous duel experience.
 *
 * These values are intentionally grouped here so designers and engineers can
 * retune feel, visuals, and difficulty without hunting through the game loop.
 */

import type { Difficulty } from './types';

export const CANVAS_SIZE = 600;
export const TILE_SIZE = 25;
export const GRID_WIDTH = CANVAS_SIZE / TILE_SIZE;
export const GRID_HEIGHT = CANVAS_SIZE / TILE_SIZE;

export const MATCH_DURATION = 90;

export const PADDLE_WIDTH = 112;
export const PADDLE_HEIGHT = 14;
export const PADDLE_OFFSET = 18;
/**
 * Paddle feel tuning.
 *
 * The player paddle follows a latched target rather than snapping directly to
 * the pointer. Edge-hit values tune how sharply expert contacts peel away from
 * the paddle once the player clips the outer lanes.
 */
export const PADDLE_TARGET_RESPONSE = 0.28;
export const PADDLE_TARGET_BLEND = 0.42;
export const PADDLE_MAX_TRAVEL_SPEED = 42;
export const PADDLE_DAMPING = 0.86;
export const PADDLE_POINTER_GAIN = 1.08;
export const PADDLE_IMPACT_REFERENCE_SPEED = 24;
export const PADDLE_EDGE_WINDOW_START = 0.52;
export const PADDLE_EDGE_WINDOW_RANGE = 0.4;
export const PADDLE_EDGE_SPIN_BONUS = 3.2;
export const PADDLE_EDGE_SPEED_BONUS = 0.82;
export const PADDLE_EDGE_IMPACT_BONUS = 0.24;
export const PADDLE_EDGE_CUT_CHARGE = 0.92;
export const BALL_CUT_CHARGE_MAX = 1.6;
export const BALL_CUT_LANE_RANGE = TILE_SIZE * 2.35;
export const BALL_CUT_LANE_WIDTH = TILE_SIZE * 0.92;
export const BALL_CUT_LANE_MAX_BONUS_CAPTURES = 2;

/**
 * Core feel tuning.
 *
 * These values intentionally bias toward quick reads, fast escalation, and
 * rewarding player streaks rather than slow attrition.
 */
export const OPENING_LAUNCH_SPEED = 6.3;
export const MAX_SPEED = 14.4;
export const MIN_SPEED = 5.1;
export const BASE_ACCELERATION = 0.1;
export const PLAYER_RETURN_BOOST = 0.72;
export const RIVAL_RETURN_BOOST = 0.34;
export const PLAYER_SPIN_FACTOR = 7.8;
export const RIVAL_SPIN_FACTOR = 6.1;
export const STREAK_SPEED_STEP = 0.18;
export const MAX_CAPTURE_CHARGE = 4;
export const BALL_RADIUS = TILE_SIZE / 2;
export const TRAIL_LENGTH = 7;

export const COLORS = {
    background: '#050b14',
    backgroundElevated: '#0a1522',
    surface: 'rgba(10, 18, 28, 0.78)',
    surfaceStrong: 'rgba(8, 13, 20, 0.9)',
    boardFrame: '#12273d',
    gridLine: 'rgba(119, 161, 196, 0.12)',
    centerLine: 'rgba(255, 255, 255, 0.08)',
    text: '#edf4ff',
    textMuted: '#8fa6bd',
    textDim: '#60748a',
    success: '#7effb3',
    warning: '#ffbe6b',
    danger: '#ff7d7d',
    day: '#ffb86d',
    dayAccent: '#ff6f3c',
    dayBall: '#ffe6c2',
    night: '#173b52',
    nightAccent: '#4fdcff',
    nightBall: '#d2f7ff',
    paddle: '#f6fbff',
} as const;

export const DIFFICULTY: Record<
    Difficulty,
    {
        label: string;
        subtitle: string;
        ballPairs: number;
        speedMod: number;
        aiReaction: number;
        aiAggression: number;
        aiPrecision: number;
        wobble: number;
        pingRange: [number, number];
    }
> = {
    EASY: {
        label: 'Warmup',
        subtitle: 'Room to learn the board and ride clean streaks.',
        ballPairs: 1,
        speedMod: 0.84,
        aiReaction: 0.05,
        aiAggression: 0.28,
        aiPrecision: 0.76,
        wobble: 16,
        pingRange: [52, 74],
    },
    MEDIUM: {
        label: 'Crowd Favorite',
        subtitle: 'The best balance of readable chaos and swingy endings.',
        ballPairs: 1,
        speedMod: 1.02,
        aiReaction: 0.072,
        aiAggression: 0.46,
        aiPrecision: 0.84,
        wobble: 12,
        pingRange: [38, 58],
    },
    HARD: {
        label: 'Pressure Test',
        subtitle: 'Faster rival reads, tighter angles, uglier mistakes.',
        ballPairs: 2,
        speedMod: 1.18,
        aiReaction: 0.096,
        aiAggression: 0.6,
        aiPrecision: 0.9,
        wobble: 8,
        pingRange: [24, 44],
    },
    NIGHTMARE: {
        label: 'Blackout',
        subtitle: 'A savage anonymous rival that punishes every lazy return.',
        ballPairs: 3,
        speedMod: 1.34,
        aiReaction: 0.128,
        aiAggression: 0.76,
        aiPrecision: 0.95,
        wobble: 5,
        pingRange: [14, 32],
    },
};
