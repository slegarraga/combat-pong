/**
 * Pure simulation. No React, no canvas, no audio — just state in, state out.
 *
 * The engine advances on a fixed timestep (SIM_STEP) regardless of display
 * refresh rate, and communicates everything noteworthy through `state.events`,
 * which the orchestrator drains once per rendered frame to drive sound and fx.
 *
 * Core rules (the ones that made the game fun in the first place):
 *   - Balls convert enemy tiles on contact and bounce off them.
 *   - Clean paddle returns build a streak; each return adds speed (capped).
 *   - A ball slipping past your paddle just costs the streak and some tempo —
 *     territory is the only score, so a miss never feels like death.
 *   - After 90 seconds, whoever holds more tiles wins.
 */

import {
    BOARD_SIZE, TILE_SIZE, GRID, SIM_STEP, MATCH_DURATION,
    HIT_STOP_MIN, HIT_STOP_SPEED, HIT_STOP_SLAM, RAMP_DURATION, RAMP_FLOOR,
    BALL_RADIUS, BASE_SPEED, MAX_SPEED, AMBIENT_SPEED, STREAK_SPEED_CAP, SPEED_KICK,
    SPEED_KICK_FLAT, ENEMY_DAMPEN, AI_ENEMY_DAMPEN, AI_SPEED_KICK, MISS_SLOWDOWN, JITTER,
    MIN_VY_FRACTION, MIN_VX_FRACTION,
    PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN, PADDLE_SMOOTHING,
    SLICE_FACTOR, SLICE_PADDLE_V_MAX, SLAM_PADDLE_SPEED,
    BOUNCE_ANGLE_MAX, TOTAL_ANGLE_MAX, EDGE_HIT_THRESHOLD,
    POWERUP_INTERVAL, POWERUP_TTL, WIDE_DURATION, WIDE_FACTOR,
    MODES, type ModeId, type PowerUpKind,
} from './constants';
import type { Ball, EngineState, Paddle, Team } from './types';

const DAY = 0;
const NIGHT = 1;

const PLAYER_LINE = BOARD_SIZE - PADDLE_MARGIN - PADDLE_HEIGHT; // paddle top edge
const AI_LINE = PADDLE_MARGIN + PADDLE_HEIGHT; // paddle bottom edge

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

const makePaddle = (): Paddle => ({
    x: BOARD_SIZE / 2,
    targetX: BOARD_SIZE / 2,
    vx: 0,
    width: PADDLE_WIDTH,
    stretch: 0,
});

/** Deterministic RNG for the daily duel; everyone faces the same serves. */
export const mulberry32 = (seed: number) => {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const spawnBall = (team: Team, index: number, speed: number, rng: () => number): Ball => {
    // Both balls open by rising away from the player: your amber ball starts
    // attacking immediately, the night ball detours before its first dive.
    // Wide serve angles put diagonal energy on the board from second one.
    const lane = 0.3 + 0.4 * rng() + index * 0.07;
    const angle = (rng() * 80 - 40) * (Math.PI / 180);
    return {
        team,
        x: BOARD_SIZE * Math.min(lane, 0.72),
        y: team === 'day' ? BOARD_SIZE * 0.7 : BOARD_SIZE * 0.3,
        vx: speed * Math.sin(angle),
        vy: -speed * Math.cos(angle),
        squash: 0,
        squashAngle: 0,
        trail: [],
    };
};

export const createEngine = (mode: ModeId, ambient = false, seed?: number): EngineState => {
    const cfg = MODES[mode];
    const rng = seed === undefined ? Math.random : mulberry32(seed);
    const grid = new Uint8Array(GRID * GRID);
    for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
            grid[row * GRID + col] = row < GRID / 2 ? NIGHT : DAY;
        }
    }
    const speed = BASE_SPEED * cfg.speed * (ambient ? AMBIENT_SPEED : 1);
    const balls: Ball[] = [];
    for (let i = 0; i < cfg.pairs; i++) {
        balls.push(spawnBall('day', i, speed, rng));
        balls.push(spawnBall('night', i, speed, rng));
    }
    return {
        mode,
        grid,
        dayTiles: (GRID * GRID) / 2,
        nightTiles: (GRID * GRID) / 2,
        balls,
        player: makePaddle(),
        ai: makePaddle(),
        timeLeft: MATCH_DURATION,
        status: 'running',
        winner: null,
        streak: 0,
        bestStreak: 0,
        tilesFlipped: 0,
        hitStop: 0,
        acc: 0,
        ramp: 0,
        rng,
        powerUp: null,
        powerUpClock: POWERUP_INTERVAL * (0.6 + rng() * 0.5),
        wideTimer: 0,
        pendingClaims: [],
        events: [],
        ambient,
    };
};

/**
 * Restart the slow-motion ease-in. Called when a match begins and whenever
 * play resumes from pause, so nobody ever takes a full-speed ball to the
 * face on their first frame back.
 */
export const softResume = (state: EngineState) => {
    state.ramp = 0;
};

/** Point the player paddle at a board-space x. Call from pointer handlers. */
export const setPlayerTarget = (state: EngineState, x: number) => {
    state.player.targetX = clamp(x, state.player.width / 2, BOARD_SIZE - state.player.width / 2);
};

const pushEvent = (state: EngineState, event: EngineState['events'][number]) => {
    if (state.events.length < 64) state.events.push(event);
};

/** Exponential ease toward a target — frame-rate independent. */
const approach = (current: number, target: number, rate: number, dt: number) =>
    target + (current - target) * Math.exp(-rate * dt);

const updatePaddle = (paddle: Paddle, dt: number) => {
    const prevX = paddle.x;
    paddle.x = approach(paddle.x, paddle.targetX, 1 / PADDLE_SMOOTHING, dt);
    paddle.x = clamp(paddle.x, paddle.width / 2, BOARD_SIZE - paddle.width / 2);
    const instant = (paddle.x - prevX) / dt;
    paddle.vx = paddle.vx * 0.7 + instant * 0.3;
};

/**
 * AI targeting: ease toward the ball that will reach the AI's line soonest,
 * with imperfect prediction so every mode stays beatable.
 */
const updateAITarget = (state: EngineState, paddle: Paddle, line: number, movingUp: boolean, dt: number) => {
    const cfg = MODES[state.mode];
    let best: Ball | null = null;
    let bestT = Infinity;
    for (const ball of state.balls) {
        const vy = movingUp ? -ball.vy : ball.vy;
        if (vy <= 0) continue;
        const distance = movingUp ? ball.y - line : line - ball.y;
        if (distance <= 0) continue;
        const t = distance / vy;
        if (t < bestT) {
            bestT = t;
            best = ball;
        }
    }
    const foresight = clamp(cfg.aiRate / 8, 0.35, 0.7);
    const target = best
        ? clamp(best.x + best.vx * bestT * foresight, paddle.width / 2, BOARD_SIZE - paddle.width / 2)
        : BOARD_SIZE / 2;
    const prevX = paddle.x;
    let next = approach(paddle.x, target, cfg.aiRate, dt);
    const maxStep = cfg.aiMaxSpeed * dt;
    next = clamp(next, paddle.x - maxStep, paddle.x + maxStep);
    paddle.x = clamp(next, paddle.width / 2, BOARD_SIZE - paddle.width / 2);
    const instant = (paddle.x - prevX) / dt;
    paddle.vx = paddle.vx * 0.7 + instant * 0.3;
};

const speedOf = (ball: Ball) => Math.hypot(ball.vx, ball.vy);

const setSpeed = (ball: Ball, speed: number) => {
    const current = speedOf(ball);
    if (current === 0) return;
    const scale = speed / current;
    ball.vx *= scale;
    ball.vy *= scale;
};

const streakCap = (state: EngineState) => {
    const cfg = MODES[state.mode];
    const mult = Math.min(1 + state.streak * 0.05, STREAK_SPEED_CAP);
    return MAX_SPEED * cfg.speed * mult;
};

const collidePaddle = (
    state: EngineState,
    ball: Ball,
    paddle: Paddle,
    side: 'player' | 'ai',
) => {
    const movingDown = side === 'player';
    if (movingDown && ball.vy <= 0) return;
    if (!movingDown && ball.vy >= 0) return;

    const surface = movingDown ? PLAYER_LINE : AI_LINE;
    const crossed = movingDown
        ? ball.y + BALL_RADIUS >= surface && ball.y - BALL_RADIUS <= surface + PADDLE_HEIGHT
        : ball.y - BALL_RADIUS <= surface && ball.y + BALL_RADIUS >= surface - PADDLE_HEIGHT;
    if (!crossed) return;

    // Generous edge: a ball that grazes the paddle's corner still counts.
    // Saves by inches are the best feeling in the game; never steal them.
    const half = paddle.width / 2;
    if (ball.x < paddle.x - half - BALL_RADIUS * 0.95 || ball.x > paddle.x + half + BALL_RADIUS * 0.95) return;

    // Resolve out of the paddle, then redirect by hit point + slice.
    ball.y = movingDown ? surface - BALL_RADIUS : surface + BALL_RADIUS;
    const u = clamp((ball.x - paddle.x) / half, -1, 1);
    const angle = u * BOUNCE_ANGLE_MAX;
    const edge = Math.abs(u) > EDGE_HIT_THRESHOLD;
    const slam = side === 'player' && Math.abs(paddle.vx) > SLAM_PADDLE_SPEED;

    // Offense and defense in one motion: slamming your own ball sends it off
    // faster; meeting an enemy ball cushions it so it limps back home.
    const ownBall = (side === 'player') === (ball.team === 'day');
    const ambientScale = state.ambient ? AMBIENT_SPEED : 1;
    const floor = BASE_SPEED * MODES[state.mode].speed * 0.82 * ambientScale;
    let speed = speedOf(ball);
    if (side === 'player' && !state.ambient) {
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        speed = ownBall
            ? Math.min(speed * SPEED_KICK * (slam ? 1.07 : 1) + SPEED_KICK_FLAT, streakCap(state))
            : Math.max(speed * ENEMY_DAMPEN * (slam ? 0.95 : 1), floor);
    } else {
        speed = ownBall
            ? Math.min(speed * AI_SPEED_KICK, streakCap(state) * ambientScale)
            : Math.max(speed * AI_ENEMY_DAMPEN, floor);
    }

    // Slice: paddle motion bends the return, clamped so a violent mouse
    // flick can never produce a degenerate near-horizontal ball.
    const slice = clamp(paddle.vx, -SLICE_PADDLE_V_MAX, SLICE_PADDLE_V_MAX) * SLICE_FACTOR;
    const dir = movingDown ? -1 : 1;
    let vx = speed * Math.sin(angle) + slice;
    let vy = speed * Math.cos(angle) * dir;
    const outgoing = Math.atan2(Math.abs(vx), Math.abs(vy));
    if (outgoing > TOTAL_ANGLE_MAX) {
        const total = Math.hypot(vx, vy);
        vx = Math.sign(vx) * total * Math.sin(TOTAL_ANGLE_MAX);
        vy = Math.sign(vy) * total * Math.cos(TOTAL_ANGLE_MAX);
    }
    ball.vx = vx;
    ball.vy = vy;

    // Impact weight scales with how hard the contact was.
    ball.squash = 1;
    ball.squashAngle = 0;
    paddle.stretch = 1;
    if (!state.ambient) {
        const speedWeight = Math.min(speed / 900, 1) * HIT_STOP_SPEED;
        state.hitStop = HIT_STOP_MIN + speedWeight + (slam ? HIT_STOP_SLAM : 0);
    }

    pushEvent(state, {
        type: 'paddle', side, ballTeam: ball.team,
        x: ball.x, y: ball.y, speed, streak: state.streak, slam, edge,
    });
};

/** Squash the ball along a bounce axis: 0 = vertical hit, π/2 = horizontal. */
const squashBall = (ball: Ball, axis: number, amount: number) => {
    if (ball.squash < amount) {
        ball.squash = amount;
        ball.squashAngle = axis;
    }
};

const collideWalls = (state: EngineState, ball: Ball) => {
    if (ball.x - BALL_RADIUS < 0 && ball.vx < 0) {
        ball.x = BALL_RADIUS;
        ball.vx = -ball.vx;
        squashBall(ball, Math.PI / 2, 0.4);
        pushEvent(state, { type: 'wall', x: ball.x, y: ball.y });
    } else if (ball.x + BALL_RADIUS > BOARD_SIZE && ball.vx > 0) {
        ball.x = BOARD_SIZE - BALL_RADIUS;
        ball.vx = -ball.vx;
        squashBall(ball, Math.PI / 2, 0.4);
        pushEvent(state, { type: 'wall', x: ball.x, y: ball.y });
    }

    if (ball.y + BALL_RADIUS > BOARD_SIZE && ball.vy > 0) {
        // Slipped past the player: bounce on, lose the streak and some tempo.
        ball.y = BOARD_SIZE - BALL_RADIUS;
        ball.vy = -ball.vy;
        setSpeed(ball, speedOf(ball) * MISS_SLOWDOWN);
        squashBall(ball, 0, 0.5);
        if (!state.ambient) {
            state.streak = 0;
            pushEvent(state, { type: 'miss', side: 'player', x: ball.x });
        }
    } else if (ball.y - BALL_RADIUS < 0 && ball.vy < 0) {
        ball.y = BALL_RADIUS;
        ball.vy = -ball.vy;
        setSpeed(ball, speedOf(ball) * MISS_SLOWDOWN);
        squashBall(ball, 0, 0.5);
        if (!state.ambient) pushEvent(state, { type: 'miss', side: 'ai', x: ball.x });
    }
};

/** Flip a single night tile to day, keeping every counter honest. */
const claimTile = (state: EngineState, col: number, row: number) => {
    const idx = row * GRID + col;
    if (state.grid[idx] !== NIGHT) return false;
    state.grid[idx] = DAY;
    state.dayTiles += 1;
    state.nightTiles -= 1;
    if (!state.ambient) state.tilesFlipped += 1;
    pushEvent(state, {
        type: 'capture', team: 'day', col, row,
        x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2,
    });
    return true;
};

/**
 * A gift was claimed: deliver it, theatrically. Burst blooms outward in two
 * beats; wave races from the claim point to both edges, tile by tile, its
 * chimes sweeping the stereo field with it (capture pitch and pan are both
 * functions of the tile, so the spectacle composes itself). A brief
 * hit-stop marks the moment the world notices.
 */
const applyPowerUp = (state: EngineState, kind: PowerUpKind, col: number, row: number) => {
    if (kind === 'burst') {
        for (let r = Math.max(0, row - 1); r <= Math.min(GRID - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(GRID - 1, col + 1); c++) {
                if (c === col && r === row) continue; // the ball took this one
                state.pendingClaims.push({ col: c, row: r, delay: 0.07 });
            }
        }
    } else if (kind === 'wide') {
        state.wideTimer = WIDE_DURATION;
    } else {
        for (let c = 0; c < GRID; c++) {
            if (c === col) continue;
            state.pendingClaims.push({ col: c, row, delay: 0.06 + Math.abs(c - col) * 0.022 });
        }
    }
    state.hitStop = Math.max(state.hitStop, 0.07);
    pushEvent(state, {
        type: 'powerup', kind,
        x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2,
    });
};

/**
 * Gifts appear ON the frontier tile of a random column. Balls bounce off
 * every tile they capture, so anything deeper would take several passes to
 * carve out; the frontier tile is exactly one well-aimed return away.
 * One at a time, and player-only by construction, since night tiles can
 * only ever be flipped by the amber ball.
 */
const updatePowerUps = (state: EngineState, dt: number) => {
    if (state.powerUp) {
        state.powerUp.age += dt;
        if (state.powerUp.age >= POWERUP_TTL) state.powerUp = null;
        return;
    }
    state.powerUpClock -= dt;
    if (state.powerUpClock > 0) return;
    for (let attempt = 0; attempt < 20; attempt++) {
        const col = 1 + Math.floor(state.rng() * (GRID - 2));
        // The night tile closest to the player in this column is the frontier.
        let frontier = -1;
        for (let r = GRID - 1; r >= 0; r--) {
            if (state.grid[r * GRID + col] === NIGHT) {
                frontier = r;
                break;
            }
        }
        if (frontier < 1) continue; // the night is gone from this column
        const row = frontier;
        const roll = state.rng();
        const kind: PowerUpKind = roll < 0.45 ? 'burst' : roll < 0.8 ? 'wide' : 'wave';
        state.powerUp = { kind, col, row, age: 0 };
        pushEvent(state, {
            type: 'powerup-spawn', kind,
            x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2,
        });
        break;
    }
    state.powerUpClock = POWERUP_INTERVAL * (0.7 + state.rng() * 0.6);
};

/**
 * Flip at most one enemy tile per step and bounce off it. One tile per step
 * keeps the frontier crisp; the tiny angle jitter keeps rallies from looping.
 */
const collideTiles = (state: EngineState, ball: Ball) => {
    const enemy = ball.team === 'day' ? NIGHT : DAY;
    const minCol = Math.max(0, Math.floor((ball.x - BALL_RADIUS) / TILE_SIZE));
    const maxCol = Math.min(GRID - 1, Math.floor((ball.x + BALL_RADIUS) / TILE_SIZE));
    const minRow = Math.max(0, Math.floor((ball.y - BALL_RADIUS) / TILE_SIZE));
    const maxRow = Math.min(GRID - 1, Math.floor((ball.y + BALL_RADIUS) / TILE_SIZE));

    let hitCol = -1;
    let hitRow = -1;
    let bestDist = Infinity;
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            if (state.grid[row * GRID + col] !== enemy) continue;
            const nx = clamp(ball.x, col * TILE_SIZE, (col + 1) * TILE_SIZE);
            const ny = clamp(ball.y, row * TILE_SIZE, (row + 1) * TILE_SIZE);
            const dist = (ball.x - nx) ** 2 + (ball.y - ny) ** 2;
            if (dist < BALL_RADIUS * BALL_RADIUS && dist < bestDist) {
                bestDist = dist;
                hitCol = col;
                hitRow = row;
            }
        }
    }
    if (hitCol < 0) return;

    state.grid[hitRow * GRID + hitCol] = ball.team === 'day' ? DAY : NIGHT;
    if (ball.team === 'day') {
        state.dayTiles += 1;
        state.nightTiles -= 1;
        if (!state.ambient) state.tilesFlipped += 1;
        // Claimed a gift? Deliver it on the spot.
        if (state.powerUp && state.powerUp.col === hitCol && state.powerUp.row === hitRow) {
            const { kind } = state.powerUp;
            state.powerUp = null;
            applyPowerUp(state, kind, hitCol, hitRow);
        }
    } else {
        state.dayTiles -= 1;
        state.nightTiles += 1;
    }

    // Reflect off the captured tile along the axis of deepest penetration,
    // with a touch of squash so every chomp reads as contact.
    const cx = hitCol * TILE_SIZE + TILE_SIZE / 2;
    const cy = hitRow * TILE_SIZE + TILE_SIZE / 2;
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    if (Math.abs(dx) > Math.abs(dy)) {
        ball.vx = Math.sign(dx || 1) * Math.abs(ball.vx);
        squashBall(ball, Math.PI / 2, 0.35);
    } else {
        ball.vy = Math.sign(dy || 1) * Math.abs(ball.vy);
        squashBall(ball, 0, 0.35);
    }
    // Organic micro-rotation so the frontier never settles into a loop.
    const jitter = (state.rng() - 0.5) * 0.06;
    const cos = Math.cos(jitter);
    const sin = Math.sin(jitter);
    const vx = ball.vx * cos - ball.vy * sin;
    const vy = ball.vx * sin + ball.vy * cos;
    ball.vx = vx;
    ball.vy = vy;

    pushEvent(state, { type: 'capture', team: ball.team, col: hitCol, row: hitRow, x: cx, y: cy });
};

/** Keep speed inside the mode envelope and the direction alive (no stalls). */
const regulate = (state: EngineState, ball: Ball, dt: number) => {
    const cfg = MODES[state.mode];
    const ambientScale = state.ambient ? AMBIENT_SPEED : 1;
    const max = streakCap(state) * ambientScale;
    const min = BASE_SPEED * cfg.speed * 0.82 * ambientScale;
    const speed = speedOf(ball);

    if (speed > max) setSpeed(ball, approach(speed, max, 2.2, dt));
    else if (speed < min) setSpeed(ball, approach(speed, min, 1.6, dt));

    // Anti-stall: guarantee a vertical and horizontal share of motion.
    const s = speedOf(ball);
    const minVy = s * MIN_VY_FRACTION;
    if (Math.abs(ball.vy) < minVy) {
        const sign = ball.vy === 0 ? (state.rng() > 0.5 ? 1 : -1) : Math.sign(ball.vy);
        ball.vy = sign * (Math.abs(ball.vy) + (minVy - Math.abs(ball.vy)) * Math.min(1, 6 * dt));
    }
    const minVx = s * MIN_VX_FRACTION;
    if (Math.abs(ball.vx) < minVx) {
        const sign = ball.vx === 0 ? (state.rng() > 0.5 ? 1 : -1) : Math.sign(ball.vx);
        ball.vx = sign * (Math.abs(ball.vx) + (minVx - Math.abs(ball.vx)) * Math.min(1, 6 * dt));
    }

    // Gentle drift keeps long rallies organic.
    ball.vx += (state.rng() - 0.5) * JITTER * dt;
    ball.vy += (state.rng() - 0.5) * JITTER * dt * 0.5;
};

const step = (state: EngineState, dt: number) => {
    if (state.ambient) {
        updateAITarget(state, state.ai, AI_LINE, true, dt);
        updateAITarget(state, state.player, PLAYER_LINE, false, dt);
    } else {
        updatePaddle(state.player, dt);
        updateAITarget(state, state.ai, AI_LINE, true, dt);
        updatePowerUps(state, dt);

        // Scheduled gift captures ripple outward as their delays expire.
        if (state.pendingClaims.length > 0) {
            for (let i = state.pendingClaims.length - 1; i >= 0; i--) {
                const claim = state.pendingClaims[i];
                claim.delay -= dt;
                if (claim.delay <= 0) {
                    claimTile(state, claim.col, claim.row);
                    state.pendingClaims.splice(i, 1);
                }
            }
        }

        // The wide gift eases in and out instead of snapping.
        if (state.wideTimer > 0) state.wideTimer -= dt;
        const targetWidth = PADDLE_WIDTH * (state.wideTimer > 0 ? WIDE_FACTOR : 1);
        state.player.width = approach(state.player.width, targetWidth, 6, dt);
    }

    for (const ball of state.balls) {
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        collidePaddle(state, ball, state.player, 'player');
        collidePaddle(state, ball, state.ai, 'ai');
        collideTiles(state, ball);
        collideWalls(state, ball);
        regulate(state, ball, dt);

        // Distance-based trail: a clean comet at any speed, never a clump.
        const last = ball.trail[ball.trail.length - 1];
        if (!last || Math.hypot(ball.x - last.x, ball.y - last.y) > 7) {
            ball.trail.push({ x: ball.x, y: ball.y });
            if (ball.trail.length > 12) ball.trail.shift();
        }
    }

    if (!state.ambient) {
        state.timeLeft -= dt;
        if (state.timeLeft <= 0) {
            state.timeLeft = 0;
            state.status = 'over';
            state.winner =
                state.dayTiles > state.nightTiles ? 'day' : state.nightTiles > state.dayTiles ? 'night' : 'draw';
            pushEvent(state, { type: 'over', winner: state.winner });
        }
    }
};

/**
 * Advance the simulation by real elapsed seconds.
 *
 * Time flows through three gates before reaching the physics:
 *   1. Hit-stop freezes the world for a few milliseconds of impact weight.
 *   2. The start/resume ramp eases play in from slow motion (RAMP_FLOOR → 1).
 *   3. A persistent accumulator converts what remains into fixed SIM_STEPs,
 *      carrying the remainder across frames so the game runs at exactly the
 *      same pace on a 60 Hz laptop and a 144 Hz monitor.
 * Visual decays (squash, stretch) ride on real time, even during hit-stop.
 */
export const advance = (state: EngineState, elapsed: number) => {
    if (state.status === 'over') return;

    const decay = Math.exp(-elapsed / 0.09);
    state.player.stretch *= decay;
    state.ai.stretch *= decay;
    for (const ball of state.balls) ball.squash *= decay;

    let budget = Math.min(elapsed, 0.05);
    if (state.hitStop > 0) {
        const frozen = Math.min(state.hitStop, budget);
        state.hitStop -= frozen;
        budget -= frozen;
    }

    const rampProgress = Math.min(state.ramp / RAMP_DURATION, 1);
    const timescale = RAMP_FLOOR + (1 - RAMP_FLOOR) * rampProgress;
    state.ramp += elapsed;

    state.acc += budget * timescale;
    while (state.acc >= SIM_STEP) {
        step(state, SIM_STEP);
        state.acc -= SIM_STEP;
        if (state.winner !== null) break;
    }
};

export const dayShare = (state: EngineState) =>
    Math.round((state.dayTiles / (state.dayTiles + state.nightTiles)) * 100);
