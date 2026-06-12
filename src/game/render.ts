/**
 * Canvas renderer. Consumes engine state + events, owns all visual effects.
 *
 * Visual language: two continuous masses of territory (no grid lines), a warm
 * dawn glow along the frontier, soft trails, round glowing balls, and small
 * capture ripples. Everything eases; nothing snaps or shakes.
 */

import {
    BOARD_SIZE, TILE_SIZE, GRID, BALL_RADIUS,
    PADDLE_HEIGHT, PADDLE_MARGIN, COLORS,
} from './constants';
import type { Ball, EngineEvent, EngineState, Team } from './types';

const FLIP_DURATION = 0.32;
const PLAYER_PADDLE_Y = BOARD_SIZE - PADDLE_MARGIN - PADDLE_HEIGHT;
const AI_PADDLE_Y = PADDLE_MARGIN;

interface FlipAnim {
    col: number;
    row: number;
    team: Team;
    t: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
}

interface Ripple {
    x: number;
    y: number;
    t: number;
    maxRadius: number;
    color: string;
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeOutBack = (t: number) => {
    const c1 = 1.4;
    return 1 + (c1 + 1) * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

export interface Renderer {
    ingest: (events: EngineEvent[]) => void;
    draw: (state: EngineState, dt: number) => void;
    resize: () => void;
}

export const createRenderer = (canvas: HTMLCanvasElement): Renderer => {
    const ctx = canvas.getContext('2d')!;
    let scale = 1;

    const flips: FlipAnim[] = [];
    const flipLookup = new Map<number, FlipAnim>();
    const particles: Particle[] = [];
    const ripples: Ripple[] = [];

    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const px = Math.max(1, Math.round(rect.width * dpr));
        if (canvas.width !== px) {
            canvas.width = px;
            canvas.height = px;
        }
        scale = px / BOARD_SIZE;
    };

    const spawnParticles = (x: number, y: number, color: string, count: number, speed: number) => {
        if (particles.length > 140) return;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const v = speed * (0.35 + Math.random() * 0.65);
            particles.push({
                x, y,
                vx: Math.cos(angle) * v,
                vy: Math.sin(angle) * v,
                life: 0,
                maxLife: 0.3 + Math.random() * 0.25,
                size: 1.6 + Math.random() * 2.2,
                color,
            });
        }
    };

    const ingest = (events: EngineEvent[]) => {
        for (const e of events) {
            if (e.type === 'capture') {
                const key = e.row * GRID + e.col;
                const existing = flipLookup.get(key);
                if (existing) {
                    existing.team = e.team;
                    existing.t = 0;
                } else {
                    const anim: FlipAnim = { col: e.col, row: e.row, team: e.team, t: 0 };
                    flips.push(anim);
                    flipLookup.set(key, anim);
                }
                const color = e.team === 'day' ? COLORS.dayBall : COLORS.nightBall;
                spawnParticles(e.x, e.y, color, 4, 70);
            } else if (e.type === 'paddle') {
                const color = e.side === 'player' ? COLORS.dayBall : COLORS.nightBall;
                spawnParticles(e.x, e.y, color, e.slam ? 14 : 8, e.slam ? 190 : 130);
                if (e.edge) spawnParticles(e.x, e.y, '#FFF6E4', 5, 230);
                ripples.push({
                    x: e.x,
                    y: e.y,
                    t: 0,
                    maxRadius: (e.slam ? 46 : 30) + Math.min(e.streak * 1.5, 18),
                    color,
                });
            } else if (e.type === 'miss' && e.side === 'player') {
                spawnParticles(e.x, BOARD_SIZE - 6, 'rgba(190,160,130,0.8)', 6, 60);
            }
        }
    };

    const drawBoard = (state: EngineState) => {
        // Tiles are painted in device pixels with snapped edges: adjacent runs
        // and rows share the exact same boundary, so the two masses stay
        // seamless at any size or zoom. Everything else draws in board space.
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = COLORS.night;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = COLORS.day;
        const edge = (n: number) => Math.round(n * TILE_SIZE * scale);
        for (let row = 0; row < GRID; row++) {
            const y0 = edge(row);
            const y1 = edge(row + 1);
            let runStart = -1;
            for (let col = 0; col <= GRID; col++) {
                const idx = row * GRID + col;
                const flip = col < GRID ? flipLookup.get(idx) : undefined;
                // While a flip animates we draw the PREVIOUS owner as base;
                // the expanding new tile is drawn in the flip pass below.
                const baseIsDay =
                    col < GRID && (flip ? flip.team !== 'day' : state.grid[idx] === 0);
                if (baseIsDay && runStart < 0) runStart = col;
                if (!baseIsDay && runStart >= 0) {
                    const x0 = edge(runStart);
                    ctx.fillRect(x0, y0, edge(col) - x0, y1 - y0);
                    runStart = -1;
                }
            }
        }
        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        // Capture animation: the new color blooms out of the tile center.
        for (const flip of flips) {
            const p = easeOutBack(Math.min(flip.t / FLIP_DURATION, 1));
            const size = TILE_SIZE * Math.max(0, Math.min(p, 1.06));
            const cx = flip.col * TILE_SIZE + TILE_SIZE / 2;
            const cy = flip.row * TILE_SIZE + TILE_SIZE / 2;
            ctx.fillStyle = flip.team === 'day' ? COLORS.day : COLORS.night;
            const r = Math.min(6 * (1 - flip.t / FLIP_DURATION), 6);
            roundRect(ctx, cx - size / 2, cy - size / 2, size + 0.5, size + 0.5, r);
            ctx.fill();
        }

        // Dawn at the frontier: warm light bleeds up into the night sky
        // wherever it touches the cream below.
        for (let row = 0; row < GRID - 1; row++) {
            for (let col = 0; col < GRID; col++) {
                if (state.grid[row * GRID + col] === 1 && state.grid[(row + 1) * GRID + col] === 0) {
                    const x = col * TILE_SIZE;
                    const yBottom = (row + 1) * TILE_SIZE;
                    const glow = ctx.createLinearGradient(0, yBottom, 0, yBottom - 14);
                    glow.addColorStop(0, 'rgba(233, 201, 136, 0.22)');
                    glow.addColorStop(1, 'rgba(233, 201, 136, 0)');
                    ctx.fillStyle = glow;
                    ctx.fillRect(x, yBottom - 14, TILE_SIZE, 14);
                }
            }
        }
    };

    const roundRect = (
        c: CanvasRenderingContext2D,
        x: number, y: number, w: number, h: number, r: number,
    ) => {
        c.beginPath();
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
    };

    const drawBall = (ball: Ball) => {
        const color = ball.team === 'day' ? COLORS.dayBall : COLORS.nightBall;
        const core = ball.team === 'day' ? COLORS.dayBallCore : COLORS.nightBallCore;

        // Trail: fading ghosts toward the ball.
        const n = ball.trail.length;
        for (let i = 0; i < n; i++) {
            const p = ball.trail[i];
            const f = (i + 1) / n;
            ctx.globalAlpha = 0.085 * f;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, BALL_RADIUS * (0.35 + 0.5 * f), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(ball.x, ball.y);
        if (ball.squash > 0.02) {
            // Compress along the bounce axis, stretch along the other:
            // chewy contact on paddles, tiles and walls alike.
            ctx.rotate(ball.squashAngle);
            ctx.scale(1 + 0.3 * ball.squash, 1 - 0.26 * ball.squash);
        }
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        const gradient = ctx.createRadialGradient(-3, -3, 1, 0, 0, BALL_RADIUS);
        gradient.addColorStop(0, core);
        gradient.addColorStop(1, color);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    const drawPaddle = (x: number, y: number, width: number, stretch: number, color: string, glow: string) => {
        ctx.save();
        ctx.translate(x, y + PADDLE_HEIGHT / 2);
        ctx.scale(1 + 0.1 * stretch, 1 - 0.22 * stretch);
        ctx.shadowColor = glow;
        ctx.shadowBlur = 14;
        ctx.fillStyle = color;
        roundRect(ctx, -width / 2, -PADDLE_HEIGHT / 2, width, PADDLE_HEIGHT, PADDLE_HEIGHT / 2);
        ctx.fill();
        ctx.restore();
    };

    const drawFx = (dt: number) => {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life += dt;
            if (p.life >= p.maxLife) {
                particles.splice(i, 1);
                continue;
            }
            const f = 1 - p.life / p.maxLife;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 1 - 2.5 * dt;
            p.vy *= 1 - 2.5 * dt;
            ctx.globalAlpha = 0.55 * f;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * f, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i];
            r.t += dt;
            const p = r.t / 0.4;
            if (p >= 1) {
                ripples.splice(i, 1);
                continue;
            }
            const radius = r.maxRadius * easeOutCubic(p);
            ctx.globalAlpha = 0.35 * (1 - p);
            ctx.strokeStyle = r.color;
            ctx.lineWidth = 2 * (1 - p) + 0.5;
            ctx.beginPath();
            ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    };

    const draw = (state: EngineState, dt: number) => {
        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        for (let i = flips.length - 1; i >= 0; i--) {
            flips[i].t += dt;
            if (flips[i].t >= FLIP_DURATION) {
                flipLookup.delete(flips[i].row * GRID + flips[i].col);
                flips.splice(i, 1);
            }
        }

        drawBoard(state);

        for (const ball of state.balls) drawBall(ball);

        drawPaddle(
            state.player.x, PLAYER_PADDLE_Y, state.player.width, state.player.stretch,
            COLORS.playerPaddle, 'rgba(250, 246, 237, 0.55)',
        );
        drawPaddle(
            state.ai.x, AI_PADDLE_Y, state.ai.width, state.ai.stretch,
            COLORS.aiPaddle, 'rgba(113, 124, 171, 0.5)',
        );

        drawFx(dt);
    };

    resize();
    return { ingest, draw, resize };
};
