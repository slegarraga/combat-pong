/**
 * Game constants — all tunable values that control the game's physics, visuals, and difficulty.
 *
 * The game board is a 600x600px canvas divided into a 24x24 grid of 25px tiles.
 * Each tile is "owned" by either the Day (player) or Night (AI) team.
 */

// Canvas and grid dimensions
export const CANVAS_SIZE = 600;
export const TILE_SIZE = 25;
export const GRID_WIDTH = CANVAS_SIZE / TILE_SIZE; // 24
export const GRID_HEIGHT = CANVAS_SIZE / TILE_SIZE; // 24

// Paddle settings
export const PADDLE_WIDTH = 100;
export const PADDLE_HEIGHT = 12;
export const PADDLE_OFFSET = 15;

// Ball physics
export const MAX_SPEED = 12;
export const MIN_SPEED = 6;
export const BASE_ACCELERATION = 0.08;
export const BALL_RADIUS = TILE_SIZE / 2;

// Theme colors
export const COLORS = {
    // Day team (player) - warm cream/gold tones
    day: '#F5E6D3',
    dayAccent: '#D4A574',
    dayBall: '#B8860B',

    // Night team (AI) - cool slate/indigo tones
    night: '#2D3748',
    nightAccent: '#4A5568',
    nightBall: '#667EEA',

    // UI
    paddle: '#FFFFFF',
    background: '#1A1A2E',
};

/**
 * Difficulty presets — each level controls how many ball pairs spawn,
 * the overall speed multiplier, and how quickly the AI reacts.
 *
 * `ballMultiplier` — number of ball *pairs* (1 day + 1 night per pair)
 * `speedMod`       — multiplied against base ball speed and physics constants
 * `aiReaction`     — lerp factor per frame for AI paddle tracking (higher = faster)
 */
export const DIFFICULTY = {
    EASY: { ballMultiplier: 1, speedMod: 0.7, aiReaction: 0.03 },
    MEDIUM: { ballMultiplier: 1, speedMod: 1.0, aiReaction: 0.06 },
    HARD: { ballMultiplier: 2, speedMod: 1.2, aiReaction: 0.1 },
    NIGHTMARE: { ballMultiplier: 3, speedMod: 1.5, aiReaction: 0.15 },
};
