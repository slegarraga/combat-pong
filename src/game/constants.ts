// Core game constants
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

// Lives
export const STARTING_LIVES = 3;

// Theme colors - SUBTLE & ELEGANT palette
export const COLORS = {
    // Day team - warm cream/gold tones
    day: '#F5E6D3',        // Warm cream
    dayAccent: '#D4A574',  // Soft gold
    dayBall: '#B8860B',    // Dark gold

    // Night team - cool slate/indigo tones  
    night: '#2D3748',      // Slate gray
    nightAccent: '#4A5568', // Medium slate
    nightBall: '#667EEA',  // Soft indigo

    // UI
    paddle: '#FFFFFF',
    background: '#1A1A2E', // Deep navy
    heart: '#E53E3E',      // Soft red for hearts
    heartEmpty: '#4A5568', // Gray for lost hearts
};

// Difficulty modifiers
export const DIFFICULTY = {
    EASY: { ballMultiplier: 1, speedMod: 0.7, aiReaction: 0.03 },
    MEDIUM: { ballMultiplier: 1, speedMod: 1.0, aiReaction: 0.06 },
    HARD: { ballMultiplier: 2, speedMod: 1.2, aiReaction: 0.1 },
    NIGHTMARE: { ballMultiplier: 3, speedMod: 1.5, aiReaction: 0.15 },
};
