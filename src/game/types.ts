/**
 * Core type definitions for Combat Pong's anonymous duel mode.
 *
 * The player always controls the bottom paddle ("day"), while the top paddle
 * is driven by a simulated anonymous rival ("night"). The rival is entirely
 * local, but its timing, alias, signal strength, and narration are tuned to
 * feel like a live 1v1 duel.
 */

export type Team = 'day' | 'night';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE';

export type FeedTone = 'neutral' | 'positive' | 'warning';

export interface TrailPoint {
    x: number;
    y: number;
    alpha: number;
}

/** A ball that paints territory for its team and carries its own momentum. */
export interface Ball {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    team: Team;
    /**
     * Persistent speed bonus granted by clean paddle returns.
     * The player can snowball this aggressively with clean streak play.
     */
    speedMultiplier: number;
    /**
     * Extra tile captures awarded by clean returns.
     *
     * This is the core "feels amazing" mechanic: when the player stays in
     * rhythm, each impact can rip through more territory than a normal touch.
     */
    captureCharge: number;
    trail: TrailPoint[];
}

/**
 * Horizontal paddle state.
 *
 * `targetX` lets input stay sticky to the board while `velocity` powers the
 * richer rebound, trail, and impact feel.
 */
export interface Paddle {
    x: number;
    width: number;
    height: number;
    /** Latched destination from the latest input sample. */
    targetX: number;
    velocity: number;
}

/** Short-lived rings used to make hits and tile captures feel physical. */
export interface ImpactRing {
    x: number;
    y: number;
    radius: number;
    alpha: number;
    growth: number;
    color: string;
}

/** Feed entries shown in the HUD to sell the "live anonymous duel" illusion. */
export interface FeedEvent {
    id: number;
    text: string;
    tone: FeedTone;
}

/** Persona data used to make the rival feel distinct from match to match. */
export interface RivalProfile {
    alias: string;
    title: string;
    signature: string;
    pingMs: number;
    reaction: number;
    aggression: number;
    precision: number;
    wobble: number;
    feintWindow: number;
}

export interface ScoreSnapshot {
    day: number;
    night: number;
}

export interface MatchSummary {
    difficulty: Difficulty;
    rivalAlias: string;
    playerWon: boolean;
    dayPercent: number;
    nightPercent: number;
    margin: number;
    bestStreak: number;
}

/** Complete mutable engine state owned by the animation loop. */
export interface GameState {
    ownership: Team[];
    balls: Ball[];
    playerPaddle: Paddle;
    aiPaddle: Paddle;
    dayScore: number;
    nightScore: number;
    isRunning: boolean;
    rival: RivalProfile;
}
