/**
 * Core type definitions for the game engine.
 *
 * The game has two teams — "day" (player, bottom paddle) and "night" (AI, top paddle).
 * Territory is tracked as a flat array where each index maps to a grid tile.
 */

/** The two competing teams. Day = warm/gold (player), Night = cool/indigo (AI). */
export type Team = 'day' | 'night';

/** A ball that moves across the board and converts tiles it touches. */
export interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    team: Team;
    /** Current speed boost from the streak system (1.0 = normal, 1.25 = 1 hit, etc.) */
    speedMultiplier?: number;
}

/** A horizontal paddle that deflects balls. */
export interface Paddle {
    x: number;
    width: number;
    height: number;
}

/** The complete state of a running game, mutated each frame by the game loop. */
export interface GameState {
    /** Flat array of tile ownership. Index = col + row * GRID_WIDTH. */
    ownership: Team[];
    balls: Ball[];
    playerPaddle: Paddle;
    aiPaddle: Paddle;
    dayScore: number;
    nightScore: number;
    isRunning: boolean;
    dayColor: string;
    nightColor: string;
}
