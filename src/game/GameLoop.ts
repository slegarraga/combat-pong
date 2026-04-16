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
    BALL_CUT_CHARGE_MAX,
    BALL_CUT_LANE_MAX_BONUS_CAPTURES,
    BALL_CUT_LANE_RANGE,
    BALL_CUT_LANE_WIDTH,
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
    PADDLE_DAMPING,
    PADDLE_EDGE_IMPACT_BONUS,
    PADDLE_EDGE_SPEED_BONUS,
    PADDLE_EDGE_SPIN_BONUS,
    PADDLE_EDGE_CUT_CHARGE,
    PADDLE_EDGE_WINDOW_RANGE,
    PADDLE_EDGE_WINDOW_START,
    PADDLE_HEIGHT,
    PADDLE_IMPACT_REFERENCE_SPEED,
    PADDLE_OFFSET,
    PADDLE_MAX_TRAVEL_SPEED,
    PADDLE_POINTER_GAIN,
    PADDLE_TARGET_BLEND,
    PADDLE_TARGET_RESPONSE,
    PADDLE_WIDTH,
    PLAYER_RETURN_BOOST,
    PLAYER_DESTRUCTION_MAX_BONUS,
    PLAYER_DESTRUCTION_RANGE_STEP,
    PLAYER_DESTRUCTION_SPEED_STEP,
    PLAYER_DESTRUCTION_SPEED_THRESHOLD,
    PLAYER_SPIN_FACTOR,
    RIVAL_RETURN_BOOST,
    RIVAL_SPIN_FACTOR,
    STREAK_SPEED_STEP,
    STREAK_OVERDRIVE_CAPTURE_STEP,
    STREAK_OVERDRIVE_IMPACT_STEP,
    STREAK_OVERDRIVE_SPEED_STEP,
    STREAK_OVERDRIVE_START,
    TILE_SIZE,
    TRAIL_LENGTH,
} from './constants';
import { playClutchEnterSound, playClutchPulseSound, playFinishSound, playMissSound, playPaddleImpactSound, playTileBreakSound } from './audio';
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

interface BoardPulse {
    x: number;
    y: number;
    radius: number;
    life: number;
    color: string;
    intensity: number;
}

interface BoardSlash {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    life: number;
    color: string;
    intensity: number;
}

interface ImpactFlash {
    x: number;
    y: number;
    angle: number;
    length: number;
    width: number;
    life: number;
    color: string;
    intensity: number;
}

interface PaddleImpactState {
    life: number;
    intensity: number;
    edgeBias: number;
}

interface BallImpactState {
    life: number;
    intensity: number;
    angle: number;
}

const PLAYER_PADDLE_Y = CANVAS_SIZE - PADDLE_OFFSET - PADDLE_HEIGHT;
const AI_PADDLE_Y = PADDLE_OFFSET;

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const safeHex = normalized.length === 3
        ? normalized.split('').map((char) => `${char}${char}`).join('')
        : normalized;
    const value = Number.parseInt(safeHex, 16);
    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const getStreakOverdrive = (streak: number) =>
    Math.max(0, streak - STREAK_OVERDRIVE_START + 1);

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
    const boardPulsesRef = useRef<BoardPulse[]>([]);
    const boardSlashesRef = useRef<BoardSlash[]>([]);
    const impactFlashesRef = useRef<ImpactFlash[]>([]);
    const paddleImpactRef = useRef<Record<'player' | 'rival', PaddleImpactState>>({
        player: { life: 0, intensity: 0, edgeBias: 0 },
        rival: { life: 0, intensity: 0, edgeBias: 0 },
    });
    const ballImpactRef = useRef<Record<string, BallImpactState>>({});
    const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });
    const gameOverRef = useRef(false);
    const startTimeRef = useRef(0);
    const lastFrameRef = useRef(0);
    const pauseTimeRef = useRef(0);
    const lastNarrationRef = useRef(0);
    const lastPingShiftRef = useRef(0);
    const lastCountdownCueRef = useRef<number | null>(null);
    const bestStreakRef = useRef(0);
    const streakRef = useRef(0);
    const scoreCacheRef = useRef<ScoreSnapshot>({ day: 0, night: 0 });
    const timeCacheRef = useRef(MATCH_DURATION);
    const phaseRef = useRef<'OPENING' | 'MIDGAME' | 'CLUTCH'>('OPENING');
    const momentumRef = useRef(12);
    const clutchDriveRef = useRef(0);
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

    const emitBoardPulse = (x: number, y: number, color: string, radius = TILE_SIZE * 1.2, intensity = 1) => {
        boardPulsesRef.current.push({
            x,
            y,
            radius,
            life: 1,
            color,
            intensity,
        });
    };

    const emitBoardSlash = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: string,
        width = TILE_SIZE * 0.4,
        intensity = 1,
    ) => {
        boardSlashesRef.current.push({
            x1,
            y1,
            x2,
            y2,
            width,
            life: 1,
            color,
            intensity,
        });
    };

    const emitImpactFlash = (
        x: number,
        y: number,
        angle: number,
        color: string,
        length = BALL_RADIUS * 5.6,
        width = BALL_RADIUS * 0.6,
        intensity = 1,
    ) => {
        impactFlashesRef.current.push({
            x,
            y,
            angle,
            color,
            length,
            width,
            life: 1,
            intensity,
        });
    };

    const triggerContactSnap = (
        ball: Ball,
        owner: 'player' | 'rival',
        impactPower: number,
        edgeBias: number,
        color: string,
    ) => {
        const angle = Math.atan2(ball.vy, ball.vx);
        const ownerMultiplier = owner === 'player' ? 1 : 0.72;
        const intensity = clamp((0.5 + impactPower * 0.62 + Math.abs(edgeBias) * 0.14) * ownerMultiplier, 0.28, 1.55);

        paddleImpactRef.current[owner] = {
            life: 1,
            intensity,
            edgeBias,
        };

        ballImpactRef.current[ball.id] = {
            life: 1,
            intensity,
            angle,
        };

        emitImpactFlash(ball.x, ball.y, angle + Math.PI, color, BALL_RADIUS * (5.8 + intensity * 2.4), BALL_RADIUS * (0.5 + intensity * 0.18), intensity);
        emitImpactFlash(ball.x, ball.y, angle + Math.PI * 0.5, color, BALL_RADIUS * (2.8 + intensity * 1.1), BALL_RADIUS * 0.24, intensity * 0.74);
        emitImpactFlash(ball.x, ball.y, angle - Math.PI * 0.5, color, BALL_RADIUS * (2.8 + intensity * 1.1), BALL_RADIUS * 0.24, intensity * 0.74);
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
            cutCharge: 0,
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

        for (let index = boardPulsesRef.current.length - 1; index >= 0; index -= 1) {
            const pulse = boardPulsesRef.current[index];
            pulse.radius += (1.9 + pulse.intensity * 1.4) * delta;
            pulse.life -= (0.055 + pulse.intensity * 0.006) * delta;

            if (pulse.life <= 0) {
                boardPulsesRef.current.splice(index, 1);
            }
        }

        for (let index = boardSlashesRef.current.length - 1; index >= 0; index -= 1) {
            const slash = boardSlashesRef.current[index];
            slash.life -= (0.06 + slash.intensity * 0.008) * delta;

            if (slash.life <= 0) {
                boardSlashesRef.current.splice(index, 1);
            }
        }

        for (let index = impactFlashesRef.current.length - 1; index >= 0; index -= 1) {
            const flash = impactFlashesRef.current[index];
            flash.length += (1.6 + flash.intensity * 1.4) * delta;
            flash.life -= (0.09 + flash.intensity * 0.01) * delta;

            if (flash.life <= 0) {
                impactFlashesRef.current.splice(index, 1);
            }
        }

        for (const owner of ['player', 'rival'] as const) {
            const impact = paddleImpactRef.current[owner];
            impact.life = Math.max(0, impact.life - (0.13 + impact.intensity * 0.012) * delta);
            impact.intensity *= Math.pow(0.92, delta);
        }

        const nextBallStates: Record<string, BallImpactState> = {};
        for (const [ballId, impact] of Object.entries(ballImpactRef.current)) {
            const nextLife = impact.life - (0.12 + impact.intensity * 0.014) * delta;
            if (nextLife <= 0) continue;

            nextBallStates[ballId] = {
                ...impact,
                life: nextLife,
                intensity: impact.intensity * Math.pow(0.925, delta),
            };
        }
        ballImpactRef.current = nextBallStates;
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
        const clutchDrive = remaining <= 15 ? clamp((15 - remaining) / 15, 0, 1) : 0;
        clutchDriveRef.current = clutchDrive;

        if (nextPhase !== phaseRef.current) {
            phaseRef.current = nextPhase;
            setPhase(nextPhase);
            if (nextPhase === 'CLUTCH') {
                emitFloatingText('Clutch', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 24, COLORS.warning, 34);
                playClutchEnterSound();
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

        const roundedRemaining = Math.ceil(remaining);
        if (roundedRemaining <= 10 && roundedRemaining > 0 && roundedRemaining !== lastCountdownCueRef.current) {
            lastCountdownCueRef.current = roundedRemaining;
            playClutchPulseSound(roundedRemaining);

            if ([10, 5, 3, 1].includes(roundedRemaining)) {
                emitFloatingText(
                    roundedRemaining === 10 ? 'Final 10' : `${roundedRemaining}`,
                    CANVAS_SIZE / 2,
                    CANVAS_SIZE * 0.28,
                    roundedRemaining <= 3 ? COLORS.danger : COLORS.warning,
                    roundedRemaining <= 3 ? 30 : 24,
                );
            }
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

    /**
     * Moves the player paddle toward the latest input target with a short
     * response curve so control feels precise without behaving like a raw
     * cursor snap.
     */
    const updatePlayerPaddle = (state: GameState, delta: number) => {
        const paddle = state.playerPaddle;
        const distance = paddle.targetX - paddle.x;
        const catchUp = clamp(Math.abs(distance) / 72, 0, 1);
        const clutchBonus = clutchDriveRef.current * 0.05;
        const response = PADDLE_TARGET_RESPONSE + catchUp * 0.32 + clutchBonus;
        const desiredVelocity = clamp(
            distance * response,
            -PADDLE_MAX_TRAVEL_SPEED,
            PADDLE_MAX_TRAVEL_SPEED,
        );
        const blend = PADDLE_TARGET_BLEND + catchUp * 0.24;

        paddle.velocity += (desiredVelocity - paddle.velocity) * blend * delta;
        paddle.velocity *= Math.pow(PADDLE_DAMPING, delta);

        const nextX = clamp(paddle.x + paddle.velocity * delta, 0, CANVAS_SIZE - paddle.width);
        const overshot =
            (distance > 0 && nextX >= paddle.targetX) ||
            (distance < 0 && nextX <= paddle.targetX);

        if (overshot && Math.abs(distance) < 46) {
            paddle.x = paddle.targetX;
            paddle.velocity *= 0.38;
        } else {
            paddle.x = nextX;
        }

        if (Math.abs(paddle.targetX - paddle.x) < 0.25 && Math.abs(paddle.velocity) < 0.3) {
            paddle.x = paddle.targetX;
            paddle.velocity = 0;
        }
    };

    const awardPlayerStreak = (state: GameState, ball: Ball) => {
        streakRef.current += 1;
        bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
        setStreak(streakRef.current);
        setBestStreak(bestStreakRef.current);
        const streakOverdrive = getStreakOverdrive(streakRef.current);
        const overdriveCaptureBonus = Math.floor(streakOverdrive / STREAK_OVERDRIVE_CAPTURE_STEP);

        ball.speedMultiplier = clamp(
            1 + streakRef.current * STREAK_SPEED_STEP + streakOverdrive * STREAK_OVERDRIVE_SPEED_STEP,
            1,
            4.2,
        );
        ball.captureCharge = clamp(
            Math.floor(streakRef.current / 2) + overdriveCaptureBonus + (streakOverdrive > 0 ? 1 : 0),
            0,
            MAX_CAPTURE_CHARGE,
        );

        if (streakRef.current % 2 === 0 && ball.captureCharge > 0) {
            emitFloatingText(`Charge +${ball.captureCharge}`, ball.x, ball.y - 18, COLORS.dayBall, 16 + ball.captureCharge);
        }

        if ([STREAK_OVERDRIVE_START, STREAK_OVERDRIVE_START + 3, STREAK_OVERDRIVE_START + 6].includes(streakRef.current)) {
            emitFloatingText('Overdrive', ball.x, ball.y - 46, COLORS.dayAccent, 20 + streakOverdrive * 1.2);
            narrate('High streaks now rip deeper through the board.', 'positive', 0);
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
        const edgeBias = Math.abs(hitOffset);
        const streakOverdrive = owner === 'player' ? getStreakOverdrive(streakRef.current) : 0;
        const edgePower = owner === 'player'
            ? clamp((edgeBias - PADDLE_EDGE_WINDOW_START) / PADDLE_EDGE_WINDOW_RANGE, 0, 1)
            : clamp((edgeBias - (PADDLE_EDGE_WINDOW_START + 0.1)) / (PADDLE_EDGE_WINDOW_RANGE + 0.12), 0, 0.42);
        const impactPower = clamp(Math.abs(paddle.velocity) / (owner === 'player' ? PADDLE_IMPACT_REFERENCE_SPEED : 26), 0, 1.35);
        const edgeDirection = Math.sign(hitOffset) || Math.sign(paddle.velocity);
        const paddleInfluence = paddle.velocity * (0.08 + impactPower * 0.035 + edgePower * 0.02);
        const edgeSpinBoost = edgeDirection * edgePower * (PADDLE_EDGE_SPIN_BONUS + ball.captureCharge * 0.24 + impactPower * 0.9);
        const spin = hitOffset * (owner === 'player' ? PLAYER_SPIN_FACTOR : RIVAL_SPIN_FACTOR) + paddleInfluence + edgeSpinBoost;
        const currentSpeed = Math.hypot(ball.vx, ball.vy);

        if (owner === 'player') {
            awardPlayerStreak(state, ball);
            if (impactPower > 0.82) {
                const heavyHitBonus = impactPower > 1.06 ? 2 : 1;
                ball.captureCharge = clamp(
                    ball.captureCharge + heavyHitBonus + Math.floor(streakOverdrive / STREAK_OVERDRIVE_CAPTURE_STEP),
                    0,
                    MAX_CAPTURE_CHARGE,
                );
                emitFloatingText(
                    impactPower > 1.08 ? 'Heavy hit' : 'Fast hit',
                    ball.x,
                    ball.y - 32,
                    COLORS.dayBall,
                    14 + impactPower * 4,
                );
            }

            if (edgePower > 0.54) {
                ball.cutCharge = clamp(
                    ball.cutCharge + edgePower * PADDLE_EDGE_CUT_CHARGE + impactPower * 0.14 + streakOverdrive * 0.06,
                    0,
                    BALL_CUT_CHARGE_MAX,
                );
            }

            if (edgePower > 0.72) {
                if (edgePower > 0.92 && impactPower > 0.48) {
                    ball.captureCharge = clamp(ball.captureCharge + 1, 0, MAX_CAPTURE_CHARGE);
                }

                emitFloatingText(
                    edgePower > 0.94 ? 'Cut shot' : 'Wide cut',
                    ball.x,
                    ball.y - (impactPower > 0.82 ? 48 : 32),
                    COLORS.dayAccent,
                    13 + edgePower * 6,
                );
            }
        } else {
            ball.speedMultiplier = clamp(ball.speedMultiplier * (1 + state.rival.aggression * 0.03), 1, 2.2);
            ball.captureCharge = clamp(Math.round(state.rival.aggression * 1.6) - 1, 0, 2);
            ball.cutCharge = clamp(edgePower * 0.34 + impactPower * 0.08, 0, 0.5);
        }

        const edgeSpeedBonus = edgePower * (PADDLE_EDGE_SPEED_BONUS + impactPower * PADDLE_EDGE_IMPACT_BONUS);
        const overdriveSpeedBonus = streakOverdrive * (0.14 + impactPower * 0.06);
        const speedBoost = owner === 'player'
            ? PLAYER_RETURN_BOOST + Math.abs(hitOffset) * 0.54 + ball.captureCharge * 0.16 + impactPower * 1.08 + edgeSpeedBonus + overdriveSpeedBonus
            : RIVAL_RETURN_BOOST + state.rival.aggression * 0.12 + impactPower * 0.34 + edgeSpeedBonus * 0.32;

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
        const expressiveImpact = clamp(
            impactPower + edgePower * PADDLE_EDGE_IMPACT_BONUS + streakOverdrive * STREAK_OVERDRIVE_IMPACT_STEP,
            0,
            1.72,
        );
        triggerContactSnap(ball, owner, expressiveImpact, hitOffset, effectColor);
        const impactBurst = Math.round(expressiveImpact * 6 + edgePower * 4);
        triggerShake(
            owner === 'player'
                ? 7 + Math.min(streakRef.current, 6) + expressiveImpact * 6 + edgePower * 2.4
                : 4 + expressiveImpact * 2.5 + edgePower,
        );
        emitParticles(
            ball.x,
            ball.y,
            effectColor,
            owner === 'player'
                ? 10 + streakRef.current + ball.captureCharge * 2 + impactBurst
                : 7 + impactBurst,
        );
        emitRing(
            ball.x,
            ball.y,
            effectColor,
            owner === 'player'
                ? 4.8 + ball.captureCharge * 0.4 + expressiveImpact * 1.3 + edgePower * 0.6
                : 3.8 + expressiveImpact * 0.6 + edgePower * 0.3,
        );
        playPaddleImpactSound({
            owner,
            streak: streakRef.current,
            charge: ball.captureCharge,
            impactPower: expressiveImpact,
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
     *
     * Very fast player balls widen their search area, flip more tiles, and keep
     * more of their charge so hot streaks visibly chew wider holes through the
     * enemy side instead of feeling like a subtle stat bonus.
     */
    const detectTileCollision = (ball: Ball, ownership: Team[]) => {
        const enemyTeam: Team = ball.team === 'day' ? 'night' : 'day';
        const streakOverdrive = ball.team === 'day' ? getStreakOverdrive(streakRef.current) : 0;
        const overdriveCaptureBonus = Math.floor(streakOverdrive / STREAK_OVERDRIVE_CAPTURE_STEP);
        const travelSpeed = Math.hypot(ball.vx, ball.vy) || 1;
        const speedDamageBonus = ball.team === 'day'
            ? Math.floor(
                clamp(
                    (travelSpeed - PLAYER_DESTRUCTION_SPEED_THRESHOLD * difficultyConfig.speedMod) / PLAYER_DESTRUCTION_SPEED_STEP,
                    0,
                    PLAYER_DESTRUCTION_MAX_BONUS,
                ),
            )
            : 0;
        const streakDamageBonus = ball.team === 'day'
            ? Math.min(4, Math.floor((streakOverdrive + Math.max(0, streakRef.current - 2)) / 2))
            : 0;
        const destructionBonus = speedDamageBonus + streakDamageBonus;
        const centerCol = clamp(Math.floor(ball.x / TILE_SIZE), 0, GRID_WIDTH - 1);
        const centerRow = clamp(Math.floor(ball.y / TILE_SIZE), 0, GRID_HEIGHT - 1);
        const searchRadius = 1
            + Math.min(ball.captureCharge, 2)
            + (ball.cutCharge >= 0.6 ? 1 : 0)
            + Math.min(2, Math.floor(destructionBonus / 2));
        const maxDistance = TILE_SIZE * (1.2 + ball.captureCharge * 0.72)
            + ball.cutCharge * TILE_SIZE * 0.72
            + destructionBonus * PLAYER_DESTRUCTION_RANGE_STEP;
        const candidates: Array<{
            col: number;
            row: number;
            index: number;
            distance: number;
            tileCenterX: number;
            tileCenterY: number;
        }> = [];

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
                    candidates.push({ col, row, index, distance, tileCenterX, tileCenterY });
                }
            }
        }

        if (candidates.length === 0) {
            return;
        }

        candidates.sort((left, right) => left.distance - right.distance);
        const captureCount = Math.min(
            candidates.length,
            1 + ball.captureCharge + overdriveCaptureBonus + speedDamageBonus + Math.ceil(streakDamageBonus * 0.7),
        );
        const primary = candidates[0];
        const captureTargets = candidates.slice(0, captureCount);
        const effectColor = ball.team === 'day' ? COLORS.dayAccent : COLORS.nightAccent;
        const directionX = ball.vx / travelSpeed;
        const directionY = ball.vy / travelSpeed;
        const laneTargets =
            ball.cutCharge > 0.16
                ? candidates
                    .filter((candidate) => !captureTargets.some((target) => target.index === candidate.index))
                    .map((candidate) => {
                        const laneX = candidate.tileCenterX - primary.tileCenterX;
                        const laneY = candidate.tileCenterY - primary.tileCenterY;
                        const forward = laneX * directionX + laneY * directionY;
                        const lateral = Math.abs(laneX * directionY - laneY * directionX);
                        const laneScore = forward - lateral * 0.72 - candidate.distance * 0.1;

                        return {
                            ...candidate,
                            forward,
                            lateral,
                            laneScore,
                        };
                    })
                    .filter((candidate) =>
                        candidate.forward > TILE_SIZE * 0.34
                        && candidate.forward <= BALL_CUT_LANE_RANGE * (0.82 + ball.cutCharge * 0.58)
                        && candidate.lateral <= BALL_CUT_LANE_WIDTH * (0.9 + ball.cutCharge * 0.4),
                    )
                    .sort((left, right) => right.laneScore - left.laneScore || left.distance - right.distance)
                    .slice(
                        0,
                        Math.min(
                            BALL_CUT_LANE_MAX_BONUS_CAPTURES + overdriveCaptureBonus + Math.min(speedDamageBonus, 2) + Math.min(2, Math.floor(streakDamageBonus / 2)),
                            Math.max(
                                1,
                                Math.round(ball.cutCharge + overdriveCaptureBonus + speedDamageBonus * 0.75 + streakDamageBonus * 0.45),
                            ),
                        ),
                    )
                : [];

        captureTargets.push(...laneTargets);
        const destructionIntensity = clamp(
            (destructionBonus + ball.captureCharge + ball.cutCharge * 2 + laneTargets.length * 0.9) / 7.4,
            0.55,
            1.65,
        );

        for (let index = 0; index < captureTargets.length; index += 1) {
            const target = captureTargets[index];
            ownership[target.index] = ball.team;
            emitBoardPulse(
                target.tileCenterX,
                target.tileCenterY,
                effectColor,
                TILE_SIZE * (0.9 + destructionIntensity * 0.72 + (index >= captureCount ? 0.18 : 0)),
                destructionIntensity + (index === 0 ? 0.16 : 0),
            );

            emitParticles(
                target.tileCenterX,
                target.tileCenterY,
                effectColor,
                index === 0
                    ? 5 + Math.round(ball.speedMultiplier * 2) + Math.round(ball.cutCharge * 2)
                    : 3 + ball.captureCharge + (index > captureCount - 1 ? 2 : 0),
            );
            emitRing(
                target.tileCenterX,
                target.tileCenterY,
                effectColor,
                index === 0 ? 3.2 + ball.cutCharge * 0.25 : 2.4 + (index > captureCount - 1 ? 0.35 : 0),
            );
        }

        if ((laneTargets.length > 0 || destructionBonus > 2) && captureTargets.length > 1) {
            const farthestTarget = captureTargets[captureTargets.length - 1];
            emitBoardSlash(
                primary.tileCenterX,
                primary.tileCenterY,
                farthestTarget.tileCenterX,
                farthestTarget.tileCenterY,
                effectColor,
                TILE_SIZE * (0.28 + destructionIntensity * 0.18),
                destructionIntensity,
            );
        }

        if (captureTargets.length > 1) {
            triggerShake(3 + captureTargets.length * 0.95 + ball.cutCharge * 1.1 + destructionBonus * 0.9);
            emitFloatingText(
                laneTargets.length > 0
                    ? streakOverdrive > 0 ? 'Overdrive break' : 'Lane break'
                    : destructionBonus > 4 ? 'Shock break' : `${captureTargets.length}-tile break`,
                ball.x,
                ball.y - 14,
                effectColor,
                15 + captureTargets.length + laneTargets.length,
            );
        }

        playTileBreakSound(captureTargets.length, ball.team);
        const captureDrain = destructionBonus >= 5 ? 0 : destructionBonus >= 2 ? 0.5 : 1;
        const cutDrain = Math.max(0.36, 0.82 - destructionBonus * 0.08);
        ball.captureCharge = Math.max(0, ball.captureCharge - captureDrain);
        ball.cutCharge = Math.max(0, ball.cutCharge - cutDrain);

        const dx = ball.x - primary.tileCenterX;
        const dy = ball.y - primary.tileCenterY;

        if (Math.abs(dx) > Math.abs(dy)) {
            ball.vx *= -1;
        } else {
            ball.vy *= -1;
        }
    };

    const handleBoundaryMiss = (state: GameState, ball: Ball, owner: 'player' | 'rival') => {
        ball.speedMultiplier = 1;
        ball.captureCharge = 0;
        ball.cutCharge = 0;
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
        const clutchDrive = clutchDriveRef.current;
        const acceleration = BASE_ACCELERATION * difficultyConfig.speedMod * (1 + clutchDrive * 1.55);
        ball.vx += (Math.random() - 0.5) * acceleration * delta;
        ball.vy += (Math.random() - 0.5) * acceleration * 0.55 * delta;

        const speed = Math.hypot(ball.vx, ball.vy) || 1;
        const maxSpeed = MAX_SPEED * difficultyConfig.speedMod * ball.speedMultiplier * (1 + clutchDrive * 0.16);
        const minSpeed = MIN_SPEED * difficultyConfig.speedMod * (1 + clutchDrive * 0.12);

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

        const reactionBoost = phaseRef.current === 'CLUTCH' ? 1.15 + clutchDriveRef.current * 0.18 : 1;
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

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.lineCap = 'round';
        for (const flash of impactFlashesRef.current) {
            const directionX = Math.cos(flash.angle);
            const directionY = Math.sin(flash.angle);
            const startX = flash.x - directionX * flash.length * 0.18;
            const startY = flash.y - directionY * flash.length * 0.18;
            const endX = flash.x + directionX * flash.length * (0.84 + flash.intensity * 0.08);
            const endY = flash.y + directionY * flash.length * (0.84 + flash.intensity * 0.08);

            ctx.globalAlpha = clamp(flash.life * (0.3 + flash.intensity * 0.24), 0, 1);
            ctx.strokeStyle = flash.color;
            ctx.lineWidth = flash.width * (1 + (1 - flash.life) * 0.34);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            ctx.globalAlpha = clamp(flash.life * (0.18 + flash.intensity * 0.12), 0, 1);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.lineWidth = flash.width * 0.34;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        ctx.restore();
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (const pulse of boardPulsesRef.current) {
            const pulseGradient = ctx.createRadialGradient(
                pulse.x,
                pulse.y,
                0,
                pulse.x,
                pulse.y,
                pulse.radius,
            );
            pulseGradient.addColorStop(0, hexToRgba('#ffffff', 0.12 * pulse.intensity * pulse.life));
            pulseGradient.addColorStop(0.32, hexToRgba(pulse.color, 0.2 * pulse.intensity * pulse.life));
            pulseGradient.addColorStop(0.72, hexToRgba(pulse.color, 0.08 * pulse.intensity * pulse.life));
            pulseGradient.addColorStop(1, hexToRgba(pulse.color, 0));
            ctx.globalAlpha = clamp(pulse.life * (0.7 + pulse.intensity * 0.24), 0, 1);
            ctx.fillStyle = pulseGradient;
            ctx.beginPath();
            ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.lineCap = 'round';
        for (const slash of boardSlashesRef.current) {
            ctx.globalAlpha = clamp(slash.life * (0.45 + slash.intensity * 0.16), 0, 1);
            ctx.strokeStyle = slash.color;
            ctx.lineWidth = slash.width * (1 + (1 - slash.life) * 0.34);
            ctx.beginPath();
            ctx.moveTo(slash.x1, slash.y1);
            ctx.lineTo(slash.x2, slash.y2);
            ctx.stroke();

            ctx.globalAlpha = clamp(slash.life * (0.22 + slash.intensity * 0.08), 0, 1);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = slash.width * 0.35;
            ctx.beginPath();
            ctx.moveTo(slash.x1, slash.y1);
            ctx.lineTo(slash.x2, slash.y2);
            ctx.stroke();
        }
        ctx.restore();
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
        ctx.globalAlpha = 0.03 + momentumRef.current * 0.001 + (phaseRef.current === 'CLUTCH' ? 0.04 + clutchDriveRef.current * 0.07 : 0);
        ctx.fillStyle = pulseGradient;
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.globalAlpha = 1;

        if (phaseRef.current === 'CLUTCH') {
            ctx.strokeStyle = `rgba(255, 190, 107, ${0.08 + clutchDriveRef.current * 0.18})`;
            ctx.lineWidth = 10 + clutchDriveRef.current * 6;
            ctx.strokeRect(6, 6, CANVAS_SIZE - 12, CANVAS_SIZE - 12);
        }

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

        renderPaddleTrail(ctx, state.playerPaddle, PLAYER_PADDLE_Y, COLORS.dayAccent);
        renderPaddleTrail(ctx, state.aiPaddle, AI_PADDLE_Y, COLORS.nightAccent);
        renderPaddleBody(ctx, state.playerPaddle, PLAYER_PADDLE_Y, COLORS.dayAccent, paddleImpactRef.current.player);
        renderPaddleBody(ctx, state.aiPaddle, AI_PADDLE_Y, COLORS.nightAccent, paddleImpactRef.current.rival);

        for (const ball of state.balls) {
            const ballColor = ball.team === 'day' ? COLORS.dayBall : COLORS.nightBall;
            const chargeGlow = ball.captureCharge * 10;
            const speed = Math.hypot(ball.vx, ball.vy) || 1;
            const slashTailLength = BALL_RADIUS * (4.6 + ball.cutCharge * 4.4 + Math.min(speed, 16) * 0.22);
            const slashTailX = ball.x - (ball.vx / speed) * slashTailLength;
            const slashTailY = ball.y - (ball.vy / speed) * slashTailLength;
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

            if (ball.cutCharge > 0.14) {
                ctx.globalAlpha = 0.1 + ball.cutCharge * 0.11;
                ctx.strokeStyle = ballColor;
                ctx.lineCap = 'round';
                ctx.lineWidth = BALL_RADIUS * (1.15 + ball.cutCharge * 0.6);
                ctx.beginPath();
                ctx.moveTo(ball.x, ball.y);
                ctx.lineTo(slashTailX, slashTailY);
                ctx.stroke();

                ctx.globalAlpha = 0.06 + ball.cutCharge * 0.06;
                ctx.lineWidth = BALL_RADIUS * (2.1 + ball.cutCharge * 0.9);
                ctx.beginPath();
                ctx.moveTo(ball.x, ball.y);
                ctx.lineTo(slashTailX, slashTailY);
                ctx.stroke();
            }

            const ballImpact = ballImpactRef.current[ball.id];
            const impactStretch = ballImpact ? ballImpact.life * ballImpact.intensity : 0;
            const renderAngle = ballImpact?.angle ?? Math.atan2(ball.vy, ball.vx);
            ctx.globalAlpha = 1;
            ctx.fillStyle = ballColor;
            ctx.save();
            ctx.translate(ball.x, ball.y);
            ctx.rotate(renderAngle);
            ctx.scale(
                1 + impactStretch * 0.26,
                1 - Math.min(0.24, impactStretch * 0.18),
            );
            ctx.beginPath();
            ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();

            if (impactStretch > 0.08) {
                ctx.globalAlpha = clamp(impactStretch * 0.3, 0, 0.5);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.ellipse(-BALL_RADIUS * 0.2, 0, BALL_RADIUS * 0.54, BALL_RADIUS * 0.32, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
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

        updatePlayerPaddle(state, delta);
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
                targetX: CANVAS_SIZE / 2 - PADDLE_WIDTH / 2,
                velocity: 0,
            },
            aiPaddle: {
                x: CANVAS_SIZE / 2 - PADDLE_WIDTH / 2,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                targetX: CANVAS_SIZE / 2 - PADDLE_WIDTH / 2,
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
        boardPulsesRef.current = [];
        boardSlashesRef.current = [];
        impactFlashesRef.current = [];
        paddleImpactRef.current = {
            player: { life: 0, intensity: 0, edgeBias: 0 },
            rival: { life: 0, intensity: 0, edgeBias: 0 },
        };
        ballImpactRef.current = {};
        shakeRef.current = { x: 0, y: 0, intensity: 0 };
        gameOverRef.current = false;
        lastNarrationRef.current = 0;
        lastPingShiftRef.current = performance.now();
        bestStreakRef.current = 0;
        streakRef.current = 0;
        leadStateRef.current = 'neutral';
        clutchDriveRef.current = 0;
        lastCountdownCueRef.current = null;
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

    const setPlayerPaddleTarget = useCallback((nextX: number) => {
        if (!stateRef.current || gameOverRef.current) return;

        stateRef.current.playerPaddle.targetX = clamp(nextX, 0, CANVAS_SIZE - PADDLE_WIDTH);
    }, []);

    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !stateRef.current || gameOverRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_SIZE / rect.width;
        const targetX = (event.clientX - rect.left) * scaleX - PADDLE_WIDTH / 2;
        setPlayerPaddleTarget(targetX);
    }, [canvasRef, setPlayerPaddleTarget]);

    const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !stateRef.current || gameOverRef.current) return;

        event.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_SIZE / rect.width;
        const targetX = (event.touches[0].clientX - rect.left) * scaleX - PADDLE_WIDTH / 2;
        setPlayerPaddleTarget(targetX);
    }, [canvasRef, setPlayerPaddleTarget]);

    const handleTouchMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !stateRef.current || gameOverRef.current) return;

        event.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_SIZE / rect.width;
        const targetX = (event.touches[0].clientX - rect.left) * scaleX - PADDLE_WIDTH / 2;
        setPlayerPaddleTarget(targetX);
    }, [canvasRef, setPlayerPaddleTarget]);

    const handlePointerDelta = useCallback((deltaX: number) => {
        if (!stateRef.current || gameOverRef.current) return;

        const playerPaddle = stateRef.current.playerPaddle;
        setPlayerPaddleTarget(playerPaddle.targetX + deltaX * PADDLE_POINTER_GAIN);
    }, [setPlayerPaddleTarget]);

    const renderPaddleTrail = (
        ctx: CanvasRenderingContext2D,
        paddle: Paddle,
        y: number,
        color: string,
    ) => {
        const velocityRatio = clamp(Math.abs(paddle.velocity) / PADDLE_MAX_TRAVEL_SPEED, 0, 1);
        if (velocityRatio < 0.06) return;

        for (let layer = 1; layer <= 3; layer += 1) {
            ctx.globalAlpha = velocityRatio * (0.18 - layer * 0.04);
            ctx.fillStyle = color;
            maybeRoundRect(
                ctx,
                paddle.x - paddle.velocity * 0.42 * layer,
                y,
                paddle.width,
                paddle.height,
                8,
            );
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    };

    const renderPaddleBody = (
        ctx: CanvasRenderingContext2D,
        paddle: Paddle,
        y: number,
        glowColor: string,
        impact: PaddleImpactState,
    ) => {
        const impactStretch = impact.life * impact.intensity;
        const centerX = paddle.x + paddle.width / 2 + impact.edgeBias * impactStretch * 4;
        const centerY = y + paddle.height / 2;
        const widthScale = 1 + impactStretch * 0.18;
        const heightScale = 1 - Math.min(0.28, impactStretch * 0.2);
        const glowBoost = clamp(impactStretch * 14, 0, 14);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(widthScale, heightScale);
        ctx.shadowBlur = 18 + clamp(Math.abs(paddle.velocity) * 0.42, 0, 12) + glowBoost;
        ctx.shadowColor = glowColor;
        ctx.fillStyle = COLORS.paddle;
        maybeRoundRect(ctx, -paddle.width / 2, -paddle.height / 2, paddle.width, paddle.height, 8);
        ctx.fill();

        if (impactStretch > 0.08) {
            ctx.globalAlpha = clamp(impactStretch * 0.22, 0, 0.34);
            ctx.fillStyle = hexToRgba(glowColor, 0.95);
            maybeRoundRect(ctx, -paddle.width / 2, -paddle.height / 2, paddle.width, paddle.height, 8);
            ctx.fill();
        }
        ctx.restore();
        ctx.shadowBlur = 0;
    };

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
        handleTouchStart,
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
