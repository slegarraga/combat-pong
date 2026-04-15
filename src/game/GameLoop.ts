/**
 * Anonymous duel engine.
 *
 * This hook owns the entire match lifecycle and keeps the imperative canvas
 * work isolated from the React UI layer. The engine is deliberately split into
 * small helpers so the feel can be tuned without threading side effects through
 * one giant update function.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    BALL_RADIUS,
    BASE_ACCELERATION,
    CANVAS_SIZE,
    COLORS,
    DIFFICULTY,
    GRID_HEIGHT,
    GRID_WIDTH,
    MAX_CAPTURE_CHARGE,
    MATCH_DURATION,
    MAX_SPEED,
    MIN_SPEED,
    OPENING_LAUNCH_SPEED,
    PADDLE_HEIGHT,
    PADDLE_OFFSET,
    PADDLE_WIDTH,
    PLAYER_RETURN_BOOST,
    PLAYER_SPIN_FACTOR,
    RIVAL_RETURN_BOOST,
    RIVAL_SPIN_FACTOR,
    STREAK_SPEED_STEP,
    TILE_SIZE,
    TRAIL_LENGTH,
} from './constants';
import { playFinishSound, playMissSound, playPaddleImpactSound, playTileBreakSound } from './audio';
import { createRivalProfile, fluctuatePing, getRivalFeedLine } from './rivals';
import type {
    Ball,
    Difficulty,
    FeedEvent,
    GameState,
    ImpactRing,
    Paddle,
    RivalProfile,
    ScoreSnapshot,
    Team,
} from './types';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

interface FloatingText {
    x: number;
    y: number;
    life: number;
    text: string;
    color: string;
    size: number;
}

const PLAYER_PADDLE_Y = CANVAS_SIZE - PADDLE_OFFSET - PADDLE_HEIGHT;
const AI_PADDLE_Y = PADDLE_OFFSET;

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

const maybeRoundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
};

const nextFeedId = (() => {
    let value = 0;
    return () => {
        value += 1;
        return value;
    };
})();

export const useGameLoop = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    difficulty: Difficulty = 'MEDIUM',
) => {
    const requestRef = useRef<number | null>(null);
    const updateRef = useRef<(currentTime: number) => void>(() => {});
    const stateRef = useRef<GameState | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const ringsRef = useRef<ImpactRing[]>([]);
    const floatingTextsRef = useRef<FloatingText[]>([]);
    const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });
    const gameOverRef = useRef(false);
    const startTimeRef = useRef(0);
    const lastFrameRef = useRef(0);
    const pauseTimeRef = useRef(0);
    const lastNarrationRef = useRef(0);
    const lastPingShiftRef = useRef(0);
    const bestStreakRef = useRef(0);
    const streakRef = useRef(0);
    const scoreCacheRef = useRef<ScoreSnapshot>({ day: 0, night: 0 });
    const timeCacheRef = useRef(MATCH_DURATION);
    const phaseRef = useRef<'OPENING' | 'MIDGAME' | 'CLUTCH'>('OPENING');
    const momentumRef = useRef(12);
    const leadStateRef = useRef<'neutral' | 'player' | 'rival'>('neutral');
    const feedRef = useRef<FeedEvent[]>([]);
    const difficultyConfig = DIFFICULTY[difficulty];

    const [score, setScore] = useState<ScoreSnapshot>({ day: 0, night: 0 });
    const [timeRemaining, setTimeRemaining] = useState(MATCH_DURATION);
    const [isPaused, setIsPaused] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [rival, setRival] = useState<RivalProfile>(() => createRivalProfile(difficulty));
    const [feed, setFeed] = useState<FeedEvent[]>([]);
    const [momentum, setMomentum] = useState(12);
    const [phase, setPhase] = useState<'OPENING' | 'MIDGAME' | 'CLUTCH'>('OPENING');
    const [pingMs, setPingMs] = useState(rival.pingMs);

    const syncScore = (nextScore: ScoreSnapshot) => {
        if (
            nextScore.day !== scoreCacheRef.current.day ||
            nextScore.night !== scoreCacheRef.current.night
        ) {
            scoreCacheRef.current = nextScore;
            setScore(nextScore);
        }
    };

    const syncTime = (nextTime: number) => {
        if (nextTime !== timeCacheRef.current) {
            timeCacheRef.current = nextTime;
            setTimeRemaining(nextTime);
        }
    };

    const pushFeed = useCallback((text: string, tone: FeedEvent['tone'] = 'neutral') => {
        const nextFeed = [{ id: nextFeedId(), text, tone }, ...feedRef.current].slice(0, 4);
        feedRef.current = nextFeed;
        setFeed(nextFeed);
    }, []);

    const updateFeedRef = useRef(pushFeed);
    updateFeedRef.current = pushFeed;

    const narrate = (text: string, tone: FeedEvent['tone'] = 'neutral', minGap = 900) => {
        const now = performance.now();
        if (now - lastNarrationRef.current < minGap) return;
        lastNarrationRef.current = now;
        updateFeedRef.current(text, tone);
    };

    const emitParticles = (x: number, y: number, color: string, count = 8) => {
        for (let index = 0; index < count; index += 1) {
            const angle = (Math.PI * 2 * index) / count + Math.random() * 0.45;
            const speed = 1.8 + Math.random() * 3.8;
            particlesRef.current.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color,
                size: 2 + Math.random() * 4,
            });
        }
    };

    const emitRing = (x: number, y: number, color: string, growth = 3.8) => {
        ringsRef.current.push({
            x,
            y,
            radius: 6,
            alpha: 0.72,
            growth,
            color,
        });
    };

    const triggerShake = (intensity = 4) => {
        shakeRef.current.intensity = Math.max(shakeRef.current.intensity, intensity);
    };

    const emitFloatingText = (text: string, x: number, y: number, color: string, size = 16) => {
        floatingTextsRef.current.push({
            x,
            y,
            life: 1,
            text,
            color,
            size,
        });
    };

    const initOwnership = (): Team[] => {
        const ownership: Team[] = [];
        for (let index = 0; index < GRID_WIDTH * GRID_HEIGHT; index += 1) {
            const row = Math.floor(index / GRID_WIDTH);
            ownership.push(row < GRID_HEIGHT / 2 ? 'night' : 'day');
        }
        return ownership;
    };

    const createBall = useCallback((team: Team, pairIndex: number): Ball => {
        const speed = OPENING_LAUNCH_SPEED * difficultyConfig.speedMod;
        return {
            id: `${team}-${pairIndex}-${Math.random().toString(36).slice(2, 8)}`,
            x: CANVAS_SIZE * (0.28 + Math.random() * 0.44),
            y: team === 'day'
                ? CANVAS_SIZE * 0.75 + (Math.random() - 0.5) * 38
                : CANVAS_SIZE * 0.25 + (Math.random() - 0.5) * 38,
            vx: speed * (Math.random() > 0.5 ? 1 : -1),
            vy: team === 'day' ? -speed : speed,
            team,
            speedMultiplier: 1,
            captureCharge: 0,
            trail: [],
        };
    }, [difficultyConfig.speedMod]);

    const createBalls = useCallback(() => {
        const balls: Ball[] = [];
        for (let pairIndex = 0; pairIndex < difficultyConfig.ballPairs; pairIndex += 1) {
            balls.push(createBall('day', pairIndex));
            balls.push(createBall('night', pairIndex));
        }
        return balls;
    }, [createBall, difficultyConfig.ballPairs]);

    const predictLandingX = (ball: Ball, targetY: number) => {
        const distance = Math.abs(targetY - ball.y);
        const travelFrames = distance / Math.max(Math.abs(ball.vy), 0.001);
        let projected = ball.x + ball.vx * travelFrames;

        while (projected < 0 || projected > CANVAS_SIZE) {
            if (projected < 0) projected = Math.abs(projected);
            if (projected > CANVAS_SIZE) projected = CANVAS_SIZE - (projected - CANVAS_SIZE);
        }

        return projected;
    };

    const updateParticles = (delta: number) => {
        for (let index = particlesRef.current.length - 1; index >= 0; index -= 1) {
            const particle = particlesRef.current[index];
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            particle.life -= 0.04 * delta;
            particle.size *= 0.97;
            particle.vy += 0.08 * delta;

            if (particle.life <= 0) {
                particlesRef.current.splice(index, 1);
            }
        }

        for (let index = ringsRef.current.length - 1; index >= 0; index -= 1) {
            const ring = ringsRef.current[index];
            ring.radius += ring.growth * delta;
            ring.alpha -= 0.06 * delta;

            if (ring.alpha <= 0) {
                ringsRef.current.splice(index, 1);
            }
        }

        for (let index = floatingTextsRef.current.length - 1; index >= 0; index -= 1) {
            const text = floatingTextsRef.current[index];
            text.y -= 0.75 * delta;
            text.life -= 0.03 * delta;

            if (text.life <= 0) {
                floatingTextsRef.current.splice(index, 1);
            }
        }
    };

    const updateShake = () => {
        if (shakeRef.current.intensity <= 0.08) {
            shakeRef.current = { x: 0, y: 0, intensity: 0 };
            return;
        }

        shakeRef.current.x = (Math.random() - 0.5) * shakeRef.current.intensity;
        shakeRef.current.y = (Math.random() - 0.5) * shakeRef.current.intensity;
        shakeRef.current.intensity *= 0.87;
    };

    const updateMomentum = (state: GameState, remaining: number, currentTime: number) => {
        const lead = state.dayScore - state.nightScore;
        const nextPhase = remaining > 60 ? 'OPENING' : remaining > 24 ? 'MIDGAME' : 'CLUTCH';

        if (nextPhase !== phaseRef.current) {
            phaseRef.current = nextPhase;
            setPhase(nextPhase);
            if (nextPhase === 'CLUTCH') {
                narrate(getRivalFeedLine(state.rival, 'clutch'), 'warning', 0);
            }
        }

        const nextMomentum = clamp(
            Math.round(18 + Math.abs(lead) / 6 + streakRef.current * 10 + (nextPhase === 'CLUTCH' ? 14 : 0)),
            0,
            100,
        );

        if (nextMomentum !== momentumRef.current) {
            momentumRef.current = nextMomentum;
            setMomentum(nextMomentum);
        }

        if (lead > 34 && leadStateRef.current !== 'player') {
            leadStateRef.current = 'player';
            narrate(getRivalFeedLine(state.rival, 'playerLead'), 'positive', 0);
        } else if (lead < -34 && leadStateRef.current !== 'rival') {
            leadStateRef.current = 'rival';
            narrate(getRivalFeedLine(state.rival, 'rivalLead'), 'warning', 0);
        } else if (Math.abs(lead) < 10 && leadStateRef.current !== 'neutral') {
            leadStateRef.current = 'neutral';
            narrate(getRivalFeedLine(state.rival, 'pressure'), 'neutral', 1100);
        }

        if (currentTime - lastPingShiftRef.current > 2500) {
            lastPingShiftRef.current = currentTime;
            state.rival.pingMs = fluctuatePing(state.rival, difficulty);
            setPingMs(state.rival.pingMs);
        }
    };

    const recomputeScore = (ownership: Team[]) => {
        let day = 0;
        let night = 0;

        for (const team of ownership) {
            if (team === 'day') day += 1;
            else night += 1;
        }

        return { day, night };
    };

    const updateBallTrail = (ball: Ball) => {
        ball.trail.unshift({ x: ball.x, y: ball.y, alpha: 1 });
        if (ball.trail.length > TRAIL_LENGTH) {
            ball.trail.length = TRAIL_LENGTH;
        }

        ball.trail.forEach((point, index) => {
            point.alpha = 1 - index / TRAIL_LENGTH;
        });
    };

    const awardPlayerStreak = (state: GameState, ball: Ball) => {
        streakRef.current += 1;
        bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
        setStreak(streakRef.current);
        setBestStreak(bestStreakRef.current);

        ball.speedMultiplier = clamp(1 + streakRef.current * STREAK_SPEED_STEP, 1, 3.2);
        ball.captureCharge = clamp(Math.floor(streakRef.current / 2), 0, MAX_CAPTURE_CHARGE);

        if (streakRef.current % 2 === 0 && ball.captureCharge > 0) {
            emitFloatingText(`Charge +${ball.captureCharge}`, ball.x, ball.y - 18, COLORS.dayBall, 16 + ball.captureCharge);
        }

        if (streakRef.current === 2) {
            narrate('Clean returns are charging the board.', 'positive', 0);
        }

        if ([4, 7, 10].includes(streakRef.current)) {
            narrate(getRivalFeedLine(state.rival, 'pressure'), 'positive', 0);
        }
    };

    const resetPlayerStreak = (state: GameState) => {
        if (streakRef.current === 0) return;
        streakRef.current = 0;
        setStreak(0);
        narrate(getRivalFeedLine(state.rival, 'reset'), 'warning', 0);
    };

    const applyPaddleReturn = (
        state: GameState,
        ball: Ball,
        paddle: Paddle,
        bounceDirection: number,
        owner: 'player' | 'rival',
    ) => {
        const hitOffset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        const impactPower = clamp(Math.abs(paddle.velocity) / (owner === 'player' ? 20 : 24), 0, 1.35);
        const paddleInfluence = paddle.velocity * (0.08 + impactPower * 0.035);
        const spin = hitOffset * (owner === 'player' ? PLAYER_SPIN_FACTOR : RIVAL_SPIN_FACTOR) + paddleInfluence;
        const currentSpeed = Math.hypot(ball.vx, ball.vy);

        if (owner === 'player') {
            awardPlayerStreak(state, ball);
            if (impactPower > 0.82) {
                ball.captureCharge = clamp(ball.captureCharge + 1, 0, MAX_CAPTURE_CHARGE);
                emitFloatingText(
                    impactPower > 1.08 ? 'Heavy hit' : 'Fast hit',
                    ball.x,
                    ball.y - 32,
                    COLORS.dayBall,
                    14 + impactPower * 4,
                );
            }
        } else {
            ball.speedMultiplier = clamp(ball.speedMultiplier * (1 + state.rival.aggression * 0.03), 1, 2.2);
            ball.captureCharge = clamp(Math.round(state.rival.aggression * 1.6) - 1, 0, 2);
        }

        const speedBoost = owner === 'player'
            ? PLAYER_RETURN_BOOST + Math.abs(hitOffset) * 0.54 + ball.captureCharge * 0.16 + impactPower * 1.08
            : RIVAL_RETURN_BOOST + state.rival.aggression * 0.12 + impactPower * 0.34;

        const targetSpeed = clamp(
            currentSpeed + speedBoost,
            MIN_SPEED * difficultyConfig.speedMod,
            MAX_SPEED * difficultyConfig.speedMod * ball.speedMultiplier,
        );

        ball.vx = ball.vx * 0.32 + spin;
        ball.vy = bounceDirection * targetSpeed;
        const normalized = Math.hypot(ball.vx, ball.vy) || 1;
        const ratio = targetSpeed / normalized;
        ball.vx *= ratio;
        ball.vy *= ratio;

        const effectColor = ball.team === 'day' ? COLORS.dayAccent : COLORS.nightAccent;
        const impactBurst = Math.round(impactPower * 6);
        triggerShake(owner === 'player' ? 7 + Math.min(streakRef.current, 6) + impactPower * 6 : 4 + impactPower * 2.5);
        emitParticles(ball.x, ball.y, effectColor, owner === 'player' ? 10 + streakRef.current + ball.captureCharge * 2 + impactBurst : 7 + impactBurst);
        emitRing(ball.x, ball.y, effectColor, owner === 'player' ? 4.8 + ball.captureCharge * 0.4 + impactPower * 1.3 : 3.8 + impactPower * 0.6);
        playPaddleImpactSound({
            owner,
            streak: streakRef.current,
            charge: ball.captureCharge,
            impactPower,
            speed: targetSpeed,
        });
    };

    const checkPaddleCollision = (
        state: GameState,
        ball: Ball,
        paddle: Paddle,
        paddleY: number,
        bounceDirection: number,
        owner: 'player' | 'rival',
    ) => {
        const ballTop = ball.y - BALL_RADIUS;
        const ballBottom = ball.y + BALL_RADIUS;
        const ballLeft = ball.x - BALL_RADIUS;
        const ballRight = ball.x + BALL_RADIUS;

        const hit =
            ballRight > paddle.x &&
            ballLeft < paddle.x + paddle.width &&
            ballBottom > paddleY &&
            ballTop < paddleY + paddle.height;

        if (!hit) return false;

        ball.y = owner === 'player'
            ? paddleY - BALL_RADIUS - 1
            : paddleY + paddle.height + BALL_RADIUS + 1;

        applyPaddleReturn(state, ball, paddle, bounceDirection, owner);
        return true;
    };

    /**
     * Charged balls can rip through multiple nearby enemy tiles at once.
     *
     * This is the main satisfaction lever in the game: clean returns do not
     * only make the rally faster, they also make each successful invasion feel
     * dramatically more valuable.
     */
    const detectTileCollision = (ball: Ball, ownership: Team[]) => {
        const enemyTeam: Team = ball.team === 'day' ? 'night' : 'day';
        const centerCol = clamp(Math.floor(ball.x / TILE_SIZE), 0, GRID_WIDTH - 1);
        const centerRow = clamp(Math.floor(ball.y / TILE_SIZE), 0, GRID_HEIGHT - 1);
        const searchRadius = 1 + Math.min(ball.captureCharge, 2);
        const maxDistance = TILE_SIZE * (1.2 + ball.captureCharge * 0.72);
        const candidates: Array<{ col: number; row: number; index: number; distance: number }> = [];

        for (let row = centerRow - searchRadius; row <= centerRow + searchRadius; row += 1) {
            if (row < 0 || row >= GRID_HEIGHT) continue;
            for (let col = centerCol - searchRadius; col <= centerCol + searchRadius; col += 1) {
                if (col < 0 || col >= GRID_WIDTH) continue;

                const index = col + row * GRID_WIDTH;
                if (ownership[index] !== enemyTeam) continue;

                const tileCenterX = col * TILE_SIZE + TILE_SIZE / 2;
                const tileCenterY = row * TILE_SIZE + TILE_SIZE / 2;
                const distance = Math.hypot(ball.x - tileCenterX, ball.y - tileCenterY);

                if (distance <= maxDistance) {
                    candidates.push({ col, row, index, distance });
                }
            }
        }

        if (candidates.length === 0) {
            return;
        }

        candidates.sort((left, right) => left.distance - right.distance);
        const captureCount = Math.min(candidates.length, 1 + ball.captureCharge);
        const primary = candidates[0];
        const effectColor = ball.team === 'day' ? COLORS.dayAccent : COLORS.nightAccent;

        for (let index = 0; index < captureCount; index += 1) {
            const target = candidates[index];
            ownership[target.index] = ball.team;

            const tileCenterX = target.col * TILE_SIZE + TILE_SIZE / 2;
            const tileCenterY = target.row * TILE_SIZE + TILE_SIZE / 2;
            emitParticles(
                tileCenterX,
                tileCenterY,
                effectColor,
                index === 0 ? 5 + Math.round(ball.speedMultiplier * 2) : 3 + ball.captureCharge,
            );
            emitRing(tileCenterX, tileCenterY, effectColor, index === 0 ? 3.2 : 2.4);
        }

        if (captureCount > 1) {
            triggerShake(3 + captureCount * 0.85);
            emitFloatingText(`${captureCount}-tile break`, ball.x, ball.y - 14, effectColor, 15 + captureCount);
        }

        playTileBreakSound(captureCount, ball.team);
        ball.captureCharge = Math.max(0, ball.captureCharge - 1);

        const primaryTileCenterX = primary.col * TILE_SIZE + TILE_SIZE / 2;
        const primaryTileCenterY = primary.row * TILE_SIZE + TILE_SIZE / 2;
        const dx = ball.x - primaryTileCenterX;
        const dy = ball.y - primaryTileCenterY;

        if (Math.abs(dx) > Math.abs(dy)) {
            ball.vx *= -1;
        } else {
            ball.vy *= -1;
        }
    };

    const handleBoundaryMiss = (state: GameState, ball: Ball, owner: 'player' | 'rival') => {
        ball.speedMultiplier = 1;
        ball.captureCharge = 0;
        ball.vx *= 0.86;
        ball.vy *= 0.86;

        if (owner === 'player') {
            resetPlayerStreak(state);
            triggerShake(9);
            emitParticles(ball.x, ball.y, COLORS.danger, 9);
            emitFloatingText('Reset', ball.x, ball.y - 14, COLORS.danger, 15);
        } else {
            triggerShake(5);
            emitParticles(ball.x, ball.y, COLORS.nightAccent, 7);
            emitFloatingText('Break', ball.x, ball.y - 14, COLORS.dayBall, 14);
            narrate(`${state.rival.alias} lost a clean read.`, 'positive', 0);
        }
        emitRing(ball.x, ball.y, owner === 'player' ? COLORS.danger : COLORS.nightAccent, 4.4);
        playMissSound(owner);
    };

    const checkBoundaries = (state: GameState, ball: Ball) => {
        if (ball.x <= BALL_RADIUS || ball.x >= CANVAS_SIZE - BALL_RADIUS) {
            ball.vx *= -1;
            ball.x = clamp(ball.x, BALL_RADIUS, CANVAS_SIZE - BALL_RADIUS);
            triggerShake(2.4);
        }

        if (ball.y <= BALL_RADIUS) {
            if (ball.team === 'night') {
                handleBoundaryMiss(state, ball, 'rival');
            }
            ball.vy = Math.abs(ball.vy);
            ball.y = BALL_RADIUS + 3;
        }

        if (ball.y >= CANVAS_SIZE - BALL_RADIUS) {
            if (ball.team === 'day') {
                handleBoundaryMiss(state, ball, 'player');
            }
            ball.vy = -Math.abs(ball.vy);
            ball.y = CANVAS_SIZE - BALL_RADIUS - 3;
        }
    };

    const updateBallPhysics = (ball: Ball, delta: number) => {
        const acceleration = BASE_ACCELERATION * difficultyConfig.speedMod;
        ball.vx += (Math.random() - 0.5) * acceleration * delta;
        ball.vy += (Math.random() - 0.5) * acceleration * 0.55 * delta;

        const speed = Math.hypot(ball.vx, ball.vy) || 1;
        const maxSpeed = MAX_SPEED * difficultyConfig.speedMod * ball.speedMultiplier;
        const minSpeed = MIN_SPEED * difficultyConfig.speedMod;

        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            ball.vx *= scale;
            ball.vy *= scale;
        } else if (speed < minSpeed) {
            const scale = minSpeed / speed;
            ball.vx *= scale;
            ball.vy *= scale;
        }

        ball.x += ball.vx * delta;
        ball.y += ball.vy * delta;
        updateBallTrail(ball);
    };

    const updateAI = (state: GameState, delta: number, currentTime: number) => {
        const aiPaddle = state.aiPaddle;
        const incomingDayBalls = state.balls
            .filter((ball) => ball.team === 'day' && ball.vy < 0)
            .sort((left, right) => left.y - right.y);

        let targetX = CANVAS_SIZE / 2 - aiPaddle.width / 2;
        if (incomingDayBalls[0]) {
            const threat = incomingDayBalls[0];
            const projected = predictLandingX(threat, AI_PADDLE_Y + PADDLE_HEIGHT);
            const aggressionBias = (state.rival.aggression - 0.5) * 26 * Math.sign(threat.vx || 1);
            const wobble =
                Math.sin(currentTime / (150 + state.rival.feintWindow * 4)) * state.rival.wobble +
                (Math.random() - 0.5) * (1 - state.rival.precision) * 16;

            targetX = projected - aiPaddle.width / 2 + aggressionBias + wobble;
        }

        const reactionBoost = phaseRef.current === 'CLUTCH' ? 1.15 : 1;
        const desiredX = clamp(targetX, 0, CANVAS_SIZE - aiPaddle.width);
        const previousX = aiPaddle.x;
        aiPaddle.x += (desiredX - aiPaddle.x) * state.rival.reaction * reactionBoost * delta;
        aiPaddle.x = clamp(aiPaddle.x, 0, CANVAS_SIZE - aiPaddle.width);
        aiPaddle.velocity = aiPaddle.x - previousX;
    };

    const render = () => {
        const canvas = canvasRef.current;
        const state = stateRef.current;
        if (!canvas || !state) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.save();
        ctx.translate(shakeRef.current.x, shakeRef.current.y);

        const boardFill = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
        boardFill.addColorStop(0, COLORS.backgroundElevated);
        boardFill.addColorStop(1, COLORS.background);
        ctx.fillStyle = boardFill;
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 1;
        for (let column = 0; column <= GRID_WIDTH; column += 1) {
            const x = column * TILE_SIZE;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_SIZE);
            ctx.stroke();
        }
        for (let row = 0; row <= GRID_HEIGHT; row += 1) {
            const y = row * TILE_SIZE;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_SIZE, y);
            ctx.stroke();
        }

        ctx.strokeStyle = COLORS.centerLine;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_SIZE / 2);
        ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2);
        ctx.stroke();

        for (let row = 0; row < GRID_HEIGHT; row += 1) {
            for (let column = 0; column < GRID_WIDTH; column += 1) {
                const index = column + row * GRID_WIDTH;
                const owner = state.ownership[index];
                ctx.fillStyle = owner === 'day' ? COLORS.day : COLORS.night;
                ctx.globalAlpha = owner === 'day' ? 0.92 : 0.94;
                ctx.fillRect(column * TILE_SIZE + 1, row * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            }
        }
        ctx.globalAlpha = 1;

        const pulseGradient = ctx.createRadialGradient(
            CANVAS_SIZE / 2,
            CANVAS_SIZE / 2,
            CANVAS_SIZE * 0.08,
            CANVAS_SIZE / 2,
            CANVAS_SIZE / 2,
            CANVAS_SIZE * 0.64,
        );
        pulseGradient.addColorStop(0, 'rgba(255,255,255,0.10)');
        pulseGradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = 0.03 + momentumRef.current * 0.001 + (phaseRef.current === 'CLUTCH' ? 0.04 : 0);
        ctx.fillStyle = pulseGradient;
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.globalAlpha = 1;

        for (const ring of ringsRef.current) {
            ctx.strokeStyle = ring.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = ring.alpha;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        for (const particle of particlesRef.current) {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const floatingText of floatingTextsRef.current) {
            ctx.globalAlpha = floatingText.life;
            ctx.fillStyle = floatingText.color;
            ctx.shadowBlur = 18;
            ctx.shadowColor = floatingText.color;
            ctx.font = `700 ${floatingText.size}px "Bricolage Grotesque", sans-serif`;
            ctx.fillText(floatingText.text, floatingText.x, floatingText.y);
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        ctx.shadowBlur = 20;
        ctx.shadowColor = COLORS.dayAccent;
        ctx.fillStyle = COLORS.paddle;
        maybeRoundRect(ctx, state.playerPaddle.x, PLAYER_PADDLE_Y, state.playerPaddle.width, state.playerPaddle.height, 8);
        ctx.fill();

        ctx.shadowColor = COLORS.nightAccent;
        maybeRoundRect(ctx, state.aiPaddle.x, AI_PADDLE_Y, state.aiPaddle.width, state.aiPaddle.height, 8);
        ctx.fill();
        ctx.shadowBlur = 0;

        for (const ball of state.balls) {
            const ballColor = ball.team === 'day' ? COLORS.dayBall : COLORS.nightBall;
            const chargeGlow = ball.captureCharge * 10;
            ctx.shadowBlur = 24 + chargeGlow;
            ctx.shadowColor = ballColor;

            ball.trail.forEach((point, index) => {
                ctx.globalAlpha = point.alpha * (0.32 + ball.captureCharge * 0.04);
                ctx.fillStyle = ballColor;
                ctx.beginPath();
                ctx.arc(point.x, point.y, BALL_RADIUS * (1 - index * 0.08), 0, Math.PI * 2);
                ctx.fill();
            });

            if (ball.captureCharge > 0) {
                ctx.globalAlpha = 0.14 + ball.captureCharge * 0.04;
                ctx.fillStyle = ballColor;
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, BALL_RADIUS * (1.55 + ball.captureCharge * 0.12), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            ctx.fillStyle = ballColor;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    };

    const finishMatch = (state: GameState) => {
        gameOverRef.current = true;
        state.isRunning = false;
        setGameOver(true);
        triggerShake(10);
        playFinishSound(state.dayScore >= state.nightScore);

        const winnerColor = state.dayScore >= state.nightScore ? COLORS.dayAccent : COLORS.nightAccent;
        for (let burst = 0; burst < 6; burst += 1) {
            emitParticles(
                CANVAS_SIZE * Math.random(),
                CANVAS_SIZE * Math.random(),
                winnerColor,
                14,
            );
        }
        narrate(
            state.dayScore >= state.nightScore
                ? `${state.rival.alias} could not hold the arena.`
                : `${state.rival.alias} closed the duel hard.`,
            state.dayScore >= state.nightScore ? 'positive' : 'warning',
            0,
        );
    };

    const update = (currentTime: number) => {
        const state = stateRef.current;
        if (!state || !state.isRunning || gameOverRef.current) return;

        const delta = clamp((currentTime - lastFrameRef.current) / 16.6667, 0.65, 1.45);
        lastFrameRef.current = currentTime;

        const elapsed = (currentTime - startTimeRef.current) / 1000;
        const remaining = Math.max(0, MATCH_DURATION - elapsed);
        syncTime(Math.ceil(remaining));

        if (remaining <= 0) {
            finishMatch(state);
            render();
            return;
        }

        updateAI(state, delta, currentTime);
        updateParticles(delta);
        updateShake();

        for (const ball of state.balls) {
            if (ball.vy > 0) {
                checkPaddleCollision(state, ball, state.playerPaddle, PLAYER_PADDLE_Y, -1, 'player');
            }
            if (ball.vy < 0) {
                checkPaddleCollision(state, ball, state.aiPaddle, AI_PADDLE_Y, 1, 'rival');
            }

            detectTileCollision(ball, state.ownership);
            checkBoundaries(state, ball);
            updateBallPhysics(ball, delta);
        }

        const nextScore = recomputeScore(state.ownership);
        state.dayScore = nextScore.day;
        state.nightScore = nextScore.night;
        syncScore(nextScore);
        updateMomentum(state, remaining, currentTime);
        render();
        requestRef.current = requestAnimationFrame((nextTime) => updateRef.current(nextTime));
    };
    updateRef.current = update;

    const initGame = useCallback(() => {
        const nextRival = createRivalProfile(difficulty);
        const initialScore = { day: (GRID_WIDTH * GRID_HEIGHT) / 2, night: (GRID_WIDTH * GRID_HEIGHT) / 2 };

        stateRef.current = {
            ownership: initOwnership(),
            balls: createBalls(),
            playerPaddle: {
                x: CANVAS_SIZE / 2 - PADDLE_WIDTH / 2,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                velocity: 0,
            },
            aiPaddle: {
                x: CANVAS_SIZE / 2 - PADDLE_WIDTH / 2,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                velocity: 0,
            },
            dayScore: initialScore.day,
            nightScore: initialScore.night,
            isRunning: true,
            rival: nextRival,
        };

        particlesRef.current = [];
        ringsRef.current = [];
        floatingTextsRef.current = [];
        shakeRef.current = { x: 0, y: 0, intensity: 0 };
        gameOverRef.current = false;
        lastNarrationRef.current = 0;
        lastPingShiftRef.current = performance.now();
        bestStreakRef.current = 0;
        streakRef.current = 0;
        leadStateRef.current = 'neutral';
        phaseRef.current = 'OPENING';
        momentumRef.current = 12;
        scoreCacheRef.current = initialScore;
        timeCacheRef.current = MATCH_DURATION;

        startTimeRef.current = performance.now();
        lastFrameRef.current = performance.now();
        setRival(nextRival);
        setPingMs(nextRival.pingMs);
        feedRef.current = [];
        setFeed([]);
        setStreak(0);
        setBestStreak(0);
        setGameOver(false);
        setIsPaused(false);
        setMomentum(12);
        setPhase('OPENING');
        syncScore(initialScore);
        syncTime(MATCH_DURATION);

        updateFeedRef.current('Clean returns overcharge your next board hits.', 'positive');
        updateFeedRef.current('Hold more than half the arena when the horn lands.', 'neutral');
        updateFeedRef.current(`${nextRival.alias} entered as ${nextRival.title}.`, 'neutral');
    }, [createBalls, difficulty]);

    const scheduleNextFrame = useCallback(() => {
        requestRef.current = requestAnimationFrame((nextTime) => updateRef.current(nextTime));
    }, []);

    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !stateRef.current || gameOverRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_SIZE / rect.width;
        const targetX = (event.clientX - rect.left) * scaleX - PADDLE_WIDTH / 2;
        const nextX = clamp(targetX, 0, CANVAS_SIZE - PADDLE_WIDTH);
        const playerPaddle = stateRef.current.playerPaddle;

        playerPaddle.velocity = nextX - playerPaddle.x;
        playerPaddle.x = nextX;
    }, [canvasRef]);

    const handleTouchMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !stateRef.current || gameOverRef.current) return;

        event.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_SIZE / rect.width;
        const targetX = (event.touches[0].clientX - rect.left) * scaleX - PADDLE_WIDTH / 2;
        const nextX = clamp(targetX, 0, CANVAS_SIZE - PADDLE_WIDTH);
        const playerPaddle = stateRef.current.playerPaddle;

        playerPaddle.velocity = nextX - playerPaddle.x;
        playerPaddle.x = nextX;
    }, [canvasRef]);

    const handlePointerDelta = useCallback((deltaX: number) => {
        if (!stateRef.current || gameOverRef.current) return;

        const playerPaddle = stateRef.current.playerPaddle;
        const nextX = clamp(playerPaddle.x + deltaX, 0, CANVAS_SIZE - PADDLE_WIDTH);
        playerPaddle.velocity = nextX - playerPaddle.x;
        playerPaddle.x = nextX;
    }, []);

    const restart = useCallback(() => {
        if (requestRef.current !== null) {
            cancelAnimationFrame(requestRef.current);
        }
        initGame();
        scheduleNextFrame();
    }, [initGame, scheduleNextFrame]);

    const togglePause = useCallback(() => {
        const state = stateRef.current;
        if (!state || gameOverRef.current) return;

        if (state.isRunning) {
            pauseTimeRef.current = performance.now();
            state.isRunning = false;
            setIsPaused(true);
            return;
        }

        const pauseDuration = performance.now() - pauseTimeRef.current;
        startTimeRef.current += pauseDuration;
        lastFrameRef.current = performance.now();
        state.isRunning = true;
        setIsPaused(false);
        scheduleNextFrame();
    }, [scheduleNextFrame]);

    useEffect(() => {
        initGame();
        scheduleNextFrame();

        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [difficulty, initGame, scheduleNextFrame]);

    return {
        score,
        timeRemaining,
        streak,
        bestStreak,
        restart,
        togglePause,
        handleMouseMove,
        handlePointerDelta,
        handleTouchMove,
        isPaused,
        gameOver,
        rival,
        feed,
        momentum,
        phase,
        pingMs,
    };
};
