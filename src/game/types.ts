// Types for PLAYABLE Dynamic Pong Wars

export type Team = 'day' | 'night';

export interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    team: Team;
    speedMultiplier?: number; // Tracks streak-boosted speed
}

export interface Paddle {
    x: number;
    width: number;
    height: number;
}

export interface GameState {
    ownership: Team[]; // Flat array: index = col + row * GRID_WIDTH
    balls: Ball[];
    playerPaddle: Paddle; // Bottom - Player controls
    aiPaddle: Paddle;     // Top - AI controls
    dayScore: number;
    nightScore: number;
    isRunning: boolean;
    dayColor: string;
    nightColor: string;
}
