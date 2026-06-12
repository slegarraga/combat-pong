/**
 * Core engine types. The player owns Day (bottom half, warm cream);
 * the AI owns Night (top half, soft ink). The engine is pure TypeScript —
 * no React, no canvas — so it can run headless for the home-page ambient
 * board and for balance testing.
 */

import type { ModeId } from './constants';

export type Team = 'day' | 'night';

export interface Ball {
    team: Team;
    x: number;
    y: number;
    vx: number; // px/s
    vy: number; // px/s
    /** 0..1 impact deformation, decays in the engine */
    squash: number;
    /** travel direction at impact, for squash orientation */
    squashAngle: number;
    /** recent positions, newest last, for trail rendering */
    trail: { x: number; y: number }[];
}

export interface Paddle {
    /** center x */
    x: number;
    /** pointer target the paddle eases toward */
    targetX: number;
    /** measured velocity (px/s) — adds slice to returns */
    vx: number;
    width: number;
    /** 0..1 impact stretch, decays in the engine */
    stretch: number;
}

export type EngineEvent =
    | { type: 'capture'; team: Team; col: number; row: number; x: number; y: number }
    | {
          type: 'paddle';
          side: 'player' | 'ai';
          ballTeam: Team;
          x: number;
          y: number;
          speed: number;
          streak: number;
          /** paddle was moving fast at contact: extra weight everywhere */
          slam: boolean;
          /** contact on the outer edge of the paddle: a save by inches */
          edge: boolean;
      }
    | { type: 'miss'; side: 'player' | 'ai'; x: number }
    | { type: 'wall'; x: number; y: number }
    | { type: 'over'; winner: Team | 'draw' };

export type EngineStatus = 'running' | 'over';

export interface EngineState {
    mode: ModeId;
    /** tile ownership, row-major; values are 'day' | 'night' encoded as 0 | 1 */
    grid: Uint8Array;
    dayTiles: number;
    nightTiles: number;
    balls: Ball[];
    player: Paddle;
    ai: Paddle;
    timeLeft: number;
    status: EngineStatus;
    winner: Team | 'draw' | null;
    streak: number;
    bestStreak: number;
    /** tiles the player's balls converted this match */
    tilesFlipped: number;
    /** seconds of impact freeze remaining */
    hitStop: number;
    /** fixed-timestep accumulator, carried across frames */
    acc: number;
    /** seconds since the last (re)start, drives the slow-motion ease-in */
    ramp: number;
    /** randomness source: Math.random normally, seeded for the daily duel */
    rng: () => number;
    /** drained by the orchestrator every frame for sound + fx */
    events: EngineEvent[];
    /** true while the board idles on the home page (two AI paddles, no timer) */
    ambient: boolean;
}

export interface MatchResult {
    won: boolean;
    draw: boolean;
    dayShare: number; // 0..100
    bestStreak: number;
    tilesFlipped: number;
    mode: ModeId;
    grid: Uint8Array;
    /** set when this was a Daily Duel: the day number */
    daily?: number;
}
