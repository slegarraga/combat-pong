/**
 * Tuning surface — every value that shapes how the game looks and feels.
 *
 * The board is a 600x600 logical canvas split into a 24x24 grid of 25px tiles.
 * The bottom half belongs to Day (the player), the top half to Night (the AI).
 * All speeds are in px/second against that logical canvas; the simulation runs
 * on a fixed timestep so the feel is identical on any refresh rate.
 */

// Board
export const BOARD_SIZE = 600;
export const TILE_SIZE = 25;
export const GRID = BOARD_SIZE / TILE_SIZE; // 24
export const TILE_COUNT = GRID * GRID; // 576

// Simulation
export const SIM_STEP = 1 / 240; // fixed physics step (seconds)
export const MATCH_DURATION = 90; // seconds
export const HIT_STOP_MIN = 0.016; // impact freeze at low speed (tactile weight)
export const HIT_STOP_SPEED = 0.014; // extra freeze earned by ball speed
export const HIT_STOP_SLAM = 0.012; // extra freeze on a slammed return
export const RAMP_DURATION = 0.7; // slow-motion ease into every (re)start
export const RAMP_FLOOR = 0.35; // timescale at the very first frame

// Ball
export const BALL_RADIUS = 11;
export const BASE_SPEED = 340; // px/s at streak 0, classic mode
export const MAX_SPEED = 580; // base ceiling before streak bonus
export const STREAK_SPEED_CAP = 1.55; // ceiling multiplier earned by streaks
export const SPEED_KICK = 1.06; // multiplier when returning your own ball
export const SPEED_KICK_FLAT = 16; // px/s added when returning your own ball
export const ENEMY_DAMPEN = 0.87; // returning an enemy ball cushions it (defense)
export const AI_ENEMY_DAMPEN = 0.97; // the AI cushions less effectively than you
export const AI_SPEED_KICK = 1.02; // AI slams its own balls far more gently
export const MISS_SLOWDOWN = 0.86; // ball slows when it slips past a paddle
export const JITTER = 14; // px/s² of organic drift so rallies never loop
export const MIN_VY_FRACTION = 0.42; // anti-stall: vertical share of speed
export const MIN_VX_FRACTION = 0.08; // anti-stall: horizontal share of speed

// Paddles
export const PADDLE_WIDTH = 110;
export const PADDLE_HEIGHT = 13;
export const PADDLE_MARGIN = 30; // gap between paddle and its wall
export const PADDLE_SMOOTHING = 0.022; // pointer-follow time constant (s); lower = snappier
export const POINTER_LOCK_SENSITIVITY = 1.05; // relative mouse gain while locked
export const SLICE_FACTOR = 0.22; // how much paddle velocity bends the ball
export const SLICE_PADDLE_V_MAX = 1100; // paddle px/s that still counts as slice
export const SLAM_PADDLE_SPEED = 480; // paddle px/s at contact that reads as a slam
export const BOUNCE_ANGLE_MAX = (55 * Math.PI) / 180; // edge-hit deflection
export const TOTAL_ANGLE_MAX = (68 * Math.PI) / 180; // hard ceiling after slice
export const EDGE_HIT_THRESHOLD = 0.88; // |hit point| that reads as an edge save

// Modes — pairs of balls (1 day + 1 night each), global speed, AI strength
export type ModeId = 'calm' | 'classic' | 'quick' | 'chaos';

export interface ModeConfig {
    id: ModeId;
    label: string;
    pairs: number;
    speed: number; // multiplies BASE_SPEED / MAX_SPEED
    aiRate: number; // exponential tracking rate (1/s)
    aiMaxSpeed: number; // px/s
}

export const MODES: Record<ModeId, ModeConfig> = {
    calm: { id: 'calm', label: 'Calm', pairs: 1, speed: 0.78, aiRate: 2.6, aiMaxSpeed: 420 },
    classic: { id: 'classic', label: 'Classic', pairs: 1, speed: 1.0, aiRate: 3.6, aiMaxSpeed: 560 },
    quick: { id: 'quick', label: 'Quick', pairs: 2, speed: 1.12, aiRate: 4.6, aiMaxSpeed: 700 },
    chaos: { id: 'chaos', label: 'Chaos', pairs: 3, speed: 1.24, aiRate: 5.6, aiMaxSpeed: 860 },
};

export const MODE_ORDER: ModeId[] = ['calm', 'classic', 'quick', 'chaos'];

// Palette — day glows warm, night stays soft. No grid lines, ever.
export const COLORS = {
    page: '#0E1014',
    day: '#EFE2CC',
    dayDeep: '#E7D5B5', // subtle radial shading at board edges
    night: '#1B202B',
    nightDeep: '#161A23',
    dayBall: '#E5A13C',
    dayBallCore: '#FFD795',
    nightBall: '#8B96F8',
    nightBallCore: '#C9CFFF',
    playerPaddle: '#FAF6ED',
    aiPaddle: '#717CAB',
    dayText: '#E9C988',
    nightText: '#9BA5E8',
};
