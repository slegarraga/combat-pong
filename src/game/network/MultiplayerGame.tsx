// Real-time Multiplayer Game Component using Supabase Realtime

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { COLORS, CANVAS_SIZE, TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_OFFSET, BALL_RADIUS, MAX_SPEED, MIN_SPEED, BASE_ACCELERATION } from '../constants';
import type { Ball, Team, Paddle } from '../types';

interface MultiplayerGameProps {
    roomId: string;
    isHost: boolean;
    opponentName?: string;
    onExit: () => void;
    onGameEnd?: (winner: 'player' | 'opponent', score: { player: number; opponent: number }) => void;
}

interface GameState {
    ownership: Team[];
    balls: Ball[];
    hostPaddle: Paddle;
    clientPaddle: Paddle;
}

export const MultiplayerGame = ({ roomId, isHost, opponentName, onExit }: MultiplayerGameProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const channelRef = useRef<any>(null);
    const stateRef = useRef<GameState | null>(null);
    const requestRef = useRef<number>();

    const [status, setStatus] = useState<'waiting' | 'playing' | 'ended'>('waiting');
    const [scores, setScores] = useState({ host: 0, client: 0 });
    const [winner, setWinner] = useState<'host' | 'client' | null>(null);

    // Initialize game state
    const initGame = useCallback(() => {
        const ownership: Team[] = [];
        for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++) {
            const row = Math.floor(i / GRID_WIDTH);
            ownership.push(row < GRID_HEIGHT / 2 ? 'night' : 'day');
        }

        // 2 balls with HARD difficulty speed (1.2x multiplier = 7.2 base speed)
        const HARD_SPEED = 7.2;
        const balls: Ball[] = [
            { x: CANVAS_SIZE / 2, y: CANVAS_SIZE * 0.75, vx: HARD_SPEED, vy: -HARD_SPEED, team: 'day' },
            { x: CANVAS_SIZE / 2, y: CANVAS_SIZE * 0.25, vx: -HARD_SPEED, vy: HARD_SPEED, team: 'night' }
        ];

        stateRef.current = {
            ownership,
            balls,
            hostPaddle: { x: CANVAS_SIZE / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
            clientPaddle: { x: CANVAS_SIZE / 2 - PADDLE_WIDTH / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT }
        };
    }, []);

    // Physics update (host only)
    const updatePhysics = useCallback(() => {
        if (!stateRef.current || status !== 'playing') return;

        const state = stateRef.current;

        state.balls.forEach(ball => {
            // Move ball
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Wall collisions
            if (ball.x < BALL_RADIUS || ball.x > CANVAS_SIZE - BALL_RADIUS) {
                ball.vx = -ball.vx;
                ball.x = Math.max(BALL_RADIUS, Math.min(CANVAS_SIZE - BALL_RADIUS, ball.x));
            }
            if (ball.y < BALL_RADIUS || ball.y > CANVAS_SIZE - BALL_RADIUS) {
                ball.vy = -ball.vy;
                ball.y = Math.max(BALL_RADIUS, Math.min(CANVAS_SIZE - BALL_RADIUS, ball.y));
            }

            // Paddle collisions
            const hostPaddleY = CANVAS_SIZE - PADDLE_OFFSET - PADDLE_HEIGHT;
            const clientPaddleY = PADDLE_OFFSET;

            // Host paddle (bottom)
            if (ball.vy > 0 &&
                ball.y + BALL_RADIUS > hostPaddleY &&
                ball.y - BALL_RADIUS < hostPaddleY + PADDLE_HEIGHT &&
                ball.x > state.hostPaddle.x &&
                ball.x < state.hostPaddle.x + PADDLE_WIDTH) {
                ball.vy = -Math.abs(ball.vy);
                const hitPoint = (ball.x - (state.hostPaddle.x + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
                ball.vx += hitPoint * 3;
            }

            // Client paddle (top)
            if (ball.vy < 0 &&
                ball.y - BALL_RADIUS < clientPaddleY + PADDLE_HEIGHT &&
                ball.y + BALL_RADIUS > clientPaddleY &&
                ball.x > state.clientPaddle.x &&
                ball.x < state.clientPaddle.x + PADDLE_WIDTH) {
                ball.vy = Math.abs(ball.vy);
                const hitPoint = (ball.x - (state.clientPaddle.x + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
                ball.vx += hitPoint * 3;
            }

            // Tile collisions
            const col = Math.floor(ball.x / TILE_SIZE);
            const row = Math.floor(ball.y / TILE_SIZE);
            if (col >= 0 && col < GRID_WIDTH && row >= 0 && row < GRID_HEIGHT) {
                const idx = col + row * GRID_WIDTH;
                const enemyTeam = ball.team === 'day' ? 'night' : 'day';
                if (state.ownership[idx] === enemyTeam) {
                    state.ownership[idx] = ball.team;
                    ball.vy = -ball.vy;
                }
            }

            // Speed limits
            const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
            if (speed > MAX_SPEED) {
                const scale = MAX_SPEED / speed;
                ball.vx *= scale;
                ball.vy *= scale;
            }
            if (speed < MIN_SPEED) {
                const scale = MIN_SPEED / speed;
                ball.vx *= scale;
                ball.vy *= scale;
            }

            // Random acceleration
            ball.vx += (Math.random() - 0.5) * BASE_ACCELERATION;
            ball.vy += (Math.random() - 0.5) * BASE_ACCELERATION * 0.5;
        });

        // Calculate scores
        let dayCount = 0, nightCount = 0;
        state.ownership.forEach(t => t === 'day' ? dayCount++ : nightCount++);
        setScores({ host: dayCount, client: nightCount });

        // Check win condition (one side has 90%+)
        const total = dayCount + nightCount;
        if (dayCount / total > 0.9) {
            setWinner('host');
            setStatus('ended');
        } else if (nightCount / total > 0.9) {
            setWinner('client');
            setStatus('ended');
        }
    }, [status]);

    // Render
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx || !stateRef.current) return;

        const state = stateRef.current;

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Tiles
        for (let row = 0; row < GRID_HEIGHT; row++) {
            for (let col = 0; col < GRID_WIDTH; col++) {
                const idx = col + row * GRID_WIDTH;
                ctx.fillStyle = state.ownership[idx] === 'day' ? COLORS.day : COLORS.night;
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

        // Paddles
        ctx.shadowBlur = 15;
        ctx.fillStyle = COLORS.paddle;

        ctx.shadowColor = COLORS.dayAccent;
        ctx.beginPath();
        ctx.roundRect(state.hostPaddle.x, CANVAS_SIZE - PADDLE_OFFSET - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
        ctx.fill();

        ctx.shadowColor = COLORS.nightBall;
        ctx.beginPath();
        ctx.roundRect(state.clientPaddle.x, PADDLE_OFFSET, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Balls
        ctx.shadowBlur = 20;
        state.balls.forEach(ball => {
            const ballColor = ball.team === 'day' ? COLORS.dayBall : COLORS.nightBall;
            ctx.shadowColor = ballColor;
            ctx.fillStyle = ballColor;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }, []);

    // Game loop
    const gameLoop = useCallback(() => {
        if (isHost && status === 'playing') {
            updatePhysics();
            // Broadcast state
            if (channelRef.current && stateRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'game_state',
                    payload: {
                        balls: stateRef.current.balls,
                        ownership: stateRef.current.ownership,
                        hostPaddle: stateRef.current.hostPaddle
                    }
                });
            }
        }
        render();
        requestRef.current = requestAnimationFrame(gameLoop);
    }, [isHost, status, updatePhysics, render]);

    // Handle mouse/touch
    const handleMove = useCallback((clientX: number) => {
        if (!canvasRef.current || !stateRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_SIZE / rect.width;
        const x = (clientX - rect.left) * scaleX;
        const paddleX = Math.max(0, Math.min(CANVAS_SIZE - PADDLE_WIDTH, x - PADDLE_WIDTH / 2));

        if (isHost) {
            stateRef.current.hostPaddle.x = paddleX;
        } else {
            stateRef.current.clientPaddle.x = paddleX;
            // Send paddle position
            if (channelRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'paddle_move',
                    payload: { x: paddleX }
                });
            }
        }
    }, [isHost]);

    // Setup channel
    useEffect(() => {
        initGame();

        const channel = supabase.channel(roomId, {
            config: { broadcast: { self: false } }
        });

        channelRef.current = channel;

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const users = Object.keys(state).length;
                if (users >= 2 && status === 'waiting') {
                    setStatus('playing');
                }
            })
            .on('broadcast', { event: 'game_state' }, ({ payload }) => {
                if (!isHost && stateRef.current) {
                    stateRef.current.balls = payload.balls;
                    stateRef.current.ownership = payload.ownership;
                    stateRef.current.hostPaddle = payload.hostPaddle;
                }
            })
            .on('broadcast', { event: 'paddle_move' }, ({ payload }) => {
                if (isHost && stateRef.current) {
                    stateRef.current.clientPaddle.x = payload.x;
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ user_id: Math.random().toString() });
                }
            });

        requestRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            supabase.removeChannel(channel);
        };
    }, [roomId, isHost, initGame, gameLoop, status]);

    const hostPercent = scores.host + scores.client > 0 ? Math.round((scores.host / (scores.host + scores.client)) * 100) : 50;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ background: COLORS.background }}>
            {/* Exit button */}
            <button
                onClick={onExit}
                className="fixed top-4 left-4 px-4 py-2 min-h-[44px] bg-white/10 hover:bg-white/20 rounded-full text-white text-sm touch-manipulation"
            >
                ← Exit
            </button>

            {/* Status */}
            <div className="text-white text-center mb-4">
                {status === 'waiting' && (
                    <div className="animate-pulse">
                        <p className="text-xl font-bold">Waiting for opponent...</p>
                        <p className="text-gray-400 text-sm mt-2">Room: {roomId.slice(0, 8)}...</p>
                    </div>
                )}
                {status === 'playing' && (
                    <p className="text-gray-400">VS {opponentName || 'Opponent'}</p>
                )}
            </div>

            {/* Score bar */}
            <div className="w-full max-w-md mb-4">
                <div className="flex justify-between text-sm text-white mb-1">
                    <span style={{ color: COLORS.nightBall }}>{isHost ? 'Opponent' : 'You'} {100 - hostPercent}%</span>
                    <span style={{ color: COLORS.dayAccent }}>{isHost ? 'You' : 'Opponent'} {hostPercent}%</span>
                </div>
                <div className="h-3 bg-black/50 rounded-full overflow-hidden flex">
                    <div style={{ width: `${100 - hostPercent}%`, background: COLORS.night }} className="h-full transition-all" />
                    <div style={{ width: `${hostPercent}%`, background: COLORS.day }} className="h-full transition-all" />
                </div>
            </div>

            {/* Canvas */}
            <div className="relative w-full max-w-md aspect-square">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="w-full h-full rounded-xl shadow-2xl border border-white/20 cursor-none touch-none"
                    onMouseMove={(e) => handleMove(e.clientX)}
                    onTouchMove={(e) => { e.preventDefault(); handleMove(e.touches[0].clientX); }}
                    onTouchStart={(e) => e.preventDefault()}
                />

                {/* Win overlay */}
                {status === 'ended' && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-xl">
                        <div className="text-center text-white">
                            <p className="text-4xl font-black mb-2">
                                {(winner === 'host' && isHost) || (winner === 'client' && !isHost)
                                    ? '🏆 YOU WIN!'
                                    : '😢 YOU LOSE'}
                            </p>
                            <p className="text-gray-400 mb-4">{hostPercent}% - {100 - hostPercent}%</p>
                            <button
                                onClick={onExit}
                                className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                                style={{ background: `linear-gradient(135deg, ${COLORS.dayAccent}, ${COLORS.nightBall})` }}
                            >
                                Back to Menu
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-gray-500 text-xs mt-4">
                {isHost ? 'You control the BOTTOM paddle (☀️ Day)' : 'You control the TOP paddle (🌙 Night)'}
            </p>
        </div>
    );
};
