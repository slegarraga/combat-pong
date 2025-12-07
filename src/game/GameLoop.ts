import { useRef, useEffect, useState, useCallback } from 'react';
import {
    CANVAS_SIZE, TILE_SIZE, GRID_WIDTH, GRID_HEIGHT,
    MAX_SPEED, MIN_SPEED, BASE_ACCELERATION, COLORS, DIFFICULTY,
    PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_OFFSET, BALL_RADIUS, STARTING_LIVES
} from './constants';
import type { GameState, Ball, Team, Paddle } from './types';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

export const useGameLoop = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    difficulty: Difficulty = 'MEDIUM'
) => {
    const requestRef = useRef<number>();
    const stateRef = useRef<GameState | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });
    const livesRef = useRef(STARTING_LIVES); // Use ref for real-time tracking
    const gameOverRef = useRef(false);

    const [score, setScore] = useState({ day: 0, night: 0 });
    const [lives, setLives] = useState(STARTING_LIVES); // For UI display
    const [isPaused, setIsPaused] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const diffSettings = DIFFICULTY[difficulty];

    const emitParticles = (x: number, y: number, color: string, count: number = 8) => {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 2 + Math.random() * 4;
            particlesRef.current.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color,
                size: 3 + Math.random() * 4
            });
        }
    };

    const triggerShake = (intensity: number = 5) => {
        shakeRef.current.intensity = intensity;
    };

    const updateParticles = () => {
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03;
            p.size *= 0.95;
            p.vy += 0.1;
            if (p.life <= 0) particles.splice(i, 1);
        }
    };

    const updateShake = () => {
        const shake = shakeRef.current;
        if (shake.intensity > 0) {
            shake.x = (Math.random() - 0.5) * shake.intensity;
            shake.y = (Math.random() - 0.5) * shake.intensity;
            shake.intensity *= 0.9;
            if (shake.intensity < 0.1) shake.intensity = 0;
        } else {
            shake.x = 0;
            shake.y = 0;
        }
    };

    const initOwnership = (): Team[] => {
        const ownership: Team[] = [];
        for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++) {
            const row = Math.floor(i / GRID_WIDTH);
            ownership.push(row < GRID_HEIGHT / 2 ? 'night' : 'day');
        }
        return ownership;
    };

    const createBalls = (): Ball[] => {
        const balls: Ball[] = [];
        const count = diffSettings.ballMultiplier;
        const speed = 6 * diffSettings.speedMod;

        for (let i = 0; i < count; i++) {
            balls.push({
                x: CANVAS_SIZE / 4 + Math.random() * (CANVAS_SIZE / 2),
                y: CANVAS_SIZE * 0.75 + (Math.random() - 0.5) * 50,
                vx: speed * (Math.random() > 0.5 ? 1 : -1),
                vy: -speed,
                team: 'day'
            });
            balls.push({
                x: CANVAS_SIZE / 4 + Math.random() * (CANVAS_SIZE / 2),
                y: CANVAS_SIZE * 0.25 + (Math.random() - 0.5) * 50,
                vx: speed * (Math.random() > 0.5 ? 1 : -1),
                vy: speed,
                team: 'night'
            });
        }
        return balls;
    };

    const initGame = useCallback(() => {
        stateRef.current = {
            ownership: initOwnership(),
            balls: createBalls(),
            playerPaddle: { x: CANVAS_SIZE / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
            aiPaddle: { x: CANVAS_SIZE / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
            dayScore: 0,
            nightScore: 0,
            isRunning: true,
            dayColor: COLORS.day,
            nightColor: COLORS.night,
        };
        particlesRef.current = [];
        shakeRef.current = { x: 0, y: 0, intensity: 0 };
        livesRef.current = STARTING_LIVES;
        gameOverRef.current = false;
        setLives(STARTING_LIVES);
        setIsPaused(false);
        setGameOver(false);
    }, [difficulty]);

    const checkPaddleCollision = (ball: Ball, paddle: Paddle, paddleY: number, bounceDirection: number) => {
        const ballTop = ball.y - BALL_RADIUS;
        const ballBottom = ball.y + BALL_RADIUS;
        const ballLeft = ball.x - BALL_RADIUS;
        const ballRight = ball.x + BALL_RADIUS;

        if (
            ballRight > paddle.x &&
            ballLeft < paddle.x + paddle.width &&
            ballBottom > paddleY &&
            ballTop < paddleY + paddle.height
        ) {
            triggerShake(6);
            emitParticles(ball.x, ball.y, ball.team === 'day' ? COLORS.dayAccent : COLORS.nightAccent, 10);

            ball.vy = bounceDirection * Math.abs(ball.vy) * 1.05;
            const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            ball.vx += hitPoint * 4;

            const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
            if (speed > MAX_SPEED * diffSettings.speedMod) {
                const scale = (MAX_SPEED * diffSettings.speedMod) / speed;
                ball.vx *= scale;
                ball.vy *= scale;
            }
            return true;
        }
        return false;
    };

    const detectTileCollision = (ball: Ball, ownership: Team[]) => {
        const halfTile = TILE_SIZE / 2;
        const enemyTeam: Team = ball.team === 'day' ? 'night' : 'day';

        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                const idx = col + row * GRID_WIDTH;
                const tileX = col * TILE_SIZE;
                const tileY = row * TILE_SIZE;

                if (
                    ball.x + halfTile > tileX &&
                    ball.x - halfTile < tileX + TILE_SIZE &&
                    ball.y + halfTile > tileY &&
                    ball.y - halfTile < tileY + TILE_SIZE &&
                    ownership[idx] === enemyTeam
                ) {
                    ownership[idx] = ball.team;
                    emitParticles(tileX + TILE_SIZE / 2, tileY + TILE_SIZE / 2,
                        ball.team === 'day' ? COLORS.dayAccent : COLORS.nightAccent, 4);

                    const dx = ball.x - (tileX + TILE_SIZE / 2);
                    const dy = ball.y - (tileY + TILE_SIZE / 2);
                    if (Math.abs(dx) > Math.abs(dy)) ball.vx = -ball.vx;
                    else ball.vy = -ball.vy;
                    return;
                }
            }
        }
    };

    // Check boundaries - FIXED LIVES SYSTEM using ref
    const checkBoundaries = (ball: Ball): void => {
        // Left/Right walls - normal bounce
        if (ball.x < BALL_RADIUS || ball.x > CANVAS_SIZE - BALL_RADIUS) {
            ball.vx = -ball.vx;
            ball.x = Math.max(BALL_RADIUS, Math.min(CANVAS_SIZE - BALL_RADIUS, ball.x));
            triggerShake(2);
        }

        // TOP wall - Night ball loses (AI misses) - just bounce
        if (ball.y < BALL_RADIUS) {
            ball.vy = Math.abs(ball.vy); // Force down
            ball.y = BALL_RADIUS + 5;
        }

        // BOTTOM wall - Day ball loses = PLAYER LOSES A LIFE!
        if (ball.y > CANVAS_SIZE - BALL_RADIUS) {
            if (ball.team === 'day' && !gameOverRef.current) {
                // Decrement lives using REF (not stale state)
                livesRef.current = Math.max(0, livesRef.current - 1);
                setLives(livesRef.current); // Update UI

                triggerShake(15);
                emitParticles(ball.x, ball.y, COLORS.heart, 20);

                // Check game over
                if (livesRef.current <= 0) {
                    gameOverRef.current = true;
                    setGameOver(true);
                    if (stateRef.current) stateRef.current.isRunning = false;
                }
            }
            ball.vy = -Math.abs(ball.vy); // Force up
            ball.y = CANVAS_SIZE - BALL_RADIUS - 5;
        }
    };

    const updateBallPhysics = (ball: Ball) => {
        const accel = BASE_ACCELERATION * diffSettings.speedMod;
        ball.vx += (Math.random() - 0.5) * accel;
        ball.vy += (Math.random() - 0.5) * accel * 0.5;

        const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
        const maxSpd = MAX_SPEED * diffSettings.speedMod;
        const minSpd = MIN_SPEED * diffSettings.speedMod;

        if (speed > maxSpd) {
            const scale = maxSpd / speed;
            ball.vx *= scale;
            ball.vy *= scale;
        }
        if (speed < minSpd) {
            const scale = minSpd / speed;
            ball.vx *= scale;
            ball.vy *= scale;
        }

        ball.x += ball.vx;
        ball.y += ball.vy;
    };

    const updateAI = (state: GameState) => {
        const aiPaddle = state.aiPaddle;
        const threats = state.balls.filter(b => b.team === 'day' && b.vy < 0).sort((a, b) => a.y - b.y);
        const target = threats[0];
        if (target) {
            const targetX = target.x - aiPaddle.width / 2;
            aiPaddle.x += (targetX - aiPaddle.x) * diffSettings.aiReaction;
        }
        aiPaddle.x = Math.max(0, Math.min(CANVAS_SIZE - aiPaddle.width, aiPaddle.x));
    };

    const update = () => {
        const state = stateRef.current;
        if (!state || !state.isRunning || gameOverRef.current) return;

        updateAI(state);
        updateParticles();
        updateShake();

        state.balls.forEach(ball => {
            const playerPaddleY = CANVAS_SIZE - PADDLE_OFFSET - PADDLE_HEIGHT;
            if (ball.vy > 0) checkPaddleCollision(ball, state.playerPaddle, playerPaddleY, -1);

            const aiPaddleY = PADDLE_OFFSET;
            if (ball.vy < 0) checkPaddleCollision(ball, state.aiPaddle, aiPaddleY, 1);

            detectTileCollision(ball, state.ownership);
            checkBoundaries(ball);
            updateBallPhysics(ball);
        });

        let dayCount = 0, nightCount = 0;
        state.ownership.forEach(team => {
            if (team === 'day') dayCount++;
            else nightCount++;
        });
        state.dayScore = dayCount;
        state.nightScore = nightCount;
        setScore({ day: dayCount, night: nightCount });

        render();
        requestRef.current = requestAnimationFrame(update);
    };

    const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx || !stateRef.current) return;

        const state = stateRef.current;
        const shake = shakeRef.current;

        ctx.save();
        ctx.translate(shake.x, shake.y);
        ctx.clearRect(-10, -10, CANVAS_SIZE + 20, CANVAS_SIZE + 20);

        // Tiles
        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                const idx = col + row * GRID_WIDTH;
                ctx.fillStyle = state.ownership[idx] === 'day' ? state.dayColor : state.nightColor;
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

        // Particles
        particlesRef.current.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Paddles
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = COLORS.dayAccent;
        ctx.beginPath();
        ctx.roundRect(state.playerPaddle.x, CANVAS_SIZE - PADDLE_OFFSET - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
        ctx.fill();

        ctx.shadowColor = COLORS.nightBall;
        ctx.beginPath();
        ctx.roundRect(state.aiPaddle.x, PADDLE_OFFSET, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Balls with trails
        ctx.shadowBlur = 20;
        state.balls.forEach(ball => {
            const ballColor = ball.team === 'day' ? COLORS.dayBall : COLORS.nightBall;
            ctx.shadowColor = ballColor;
            ctx.fillStyle = ballColor;

            // Trail
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(ball.x - ball.vx * 2, ball.y - ball.vy * 2, BALL_RADIUS * 0.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(ball.x - ball.vx, ball.y - ball.vy, BALL_RADIUS * 0.85, 0, Math.PI * 2);
            ctx.fill();

            // Main ball
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        ctx.restore();
    };

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !stateRef.current || gameOverRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_SIZE / rect.width;
        const mouseX = (e.clientX - rect.left) * scaleX;
        stateRef.current.playerPaddle.x = Math.max(0, Math.min(CANVAS_SIZE - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2));
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !stateRef.current || gameOverRef.current) return;
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_SIZE / rect.width;
        const touchX = (e.touches[0].clientX - rect.left) * scaleX;
        stateRef.current.playerPaddle.x = Math.max(0, Math.min(CANVAS_SIZE - PADDLE_WIDTH, touchX - PADDLE_WIDTH / 2));
    }, []);

    const restart = useCallback(() => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        initGame();
        requestRef.current = requestAnimationFrame(update);
    }, [initGame]);

    const togglePause = useCallback(() => {
        if (!stateRef.current || gameOverRef.current) return;
        stateRef.current.isRunning = !stateRef.current.isRunning;
        setIsPaused(!stateRef.current.isRunning);
        if (stateRef.current.isRunning) requestRef.current = requestAnimationFrame(update);
    }, []);

    useEffect(() => {
        initGame();
        requestRef.current = requestAnimationFrame(update);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [difficulty]);

    return { score, lives, restart, togglePause, handleMouseMove, handleTouchMove, isPaused, gameOver };
};
