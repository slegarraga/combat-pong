/**
 * Anonymous duel HUD and canvas wrapper.
 *
 * The engine stays in `useGameLoop`; this component focuses on presentation,
 * match summary handling, and local-only persistence/share flows.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameLoop } from './GameLoop';
import { CANVAS_SIZE, COLORS, DIFFICULTY } from './constants';
import { shareToTwitter } from './ShareCard';
import { getWinRate, recordGame, type PlayerStats } from './PlayerStats';
import type { Difficulty } from './types';

interface GameCanvasProps {
    difficulty: Difficulty;
    onBack?: () => void;
}

const toneClassName: Record<'neutral' | 'positive' | 'warning', string> = {
    neutral: 'text-slate-200 border-white/10 bg-white/5',
    positive: 'text-emerald-200 border-emerald-400/20 bg-emerald-400/10',
    warning: 'text-amber-100 border-amber-300/20 bg-amber-300/10',
};

export const GameCanvas = ({ difficulty, onBack }: GameCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const {
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
    } = useGameLoop(canvasRef, difficulty);

    const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'shared' | 'copied' | 'downloaded'>('idle');
    const [hasRecordedGame, setHasRecordedGame] = useState(false);
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [isPointerLocked, setIsPointerLocked] = useState(false);
    const [isCoarsePointer, setIsCoarsePointer] = useState(false);

    const total = score.day + score.night;
    const dayPercent = total > 0 ? Math.round((score.day / total) * 100) : 50;
    const nightPercent = 100 - dayPercent;
    const playerWon = dayPercent >= nightPercent;
    const margin = dayPercent - nightPercent;
    const difficultyMeta = DIFFICULTY[difficulty];
    const surgeLevel = streak > 0 ? Math.min(4, Math.floor(streak / 2)) : 0;

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const timerColor = timeRemaining <= 12
        ? COLORS.danger
        : timeRemaining <= 28
            ? COLORS.warning
            : COLORS.text;

    useEffect(() => {
        const mediaQuery = window.matchMedia('(pointer: coarse)');
        const updatePointerMode = () => setIsCoarsePointer(mediaQuery.matches);

        updatePointerMode();

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', updatePointerMode);
            return () => mediaQuery.removeEventListener('change', updatePointerMode);
        }

        mediaQuery.addListener(updatePointerMode);
        return () => mediaQuery.removeListener(updatePointerMode);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        document.body.classList.add('game-active');
        return () => {
            if (document.pointerLockElement === canvas) {
                document.exitPointerLock?.();
            }
            document.body.classList.remove('game-active');
        };
    }, []);

    useEffect(() => {
        const handlePointerLockChange = () => {
            setIsPointerLocked(document.pointerLockElement === canvasRef.current);
        };

        const handleLockedMouseMove = (event: MouseEvent) => {
            if (document.pointerLockElement !== canvasRef.current || !canvasRef.current) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const scaleX = CANVAS_SIZE / rect.width;
            handlePointerDelta(event.movementX * scaleX);
        };

        document.addEventListener('pointerlockchange', handlePointerLockChange);
        document.addEventListener('mousemove', handleLockedMouseMove);

        return () => {
            document.removeEventListener('pointerlockchange', handlePointerLockChange);
            document.removeEventListener('mousemove', handleLockedMouseMove);
        };
    }, [handlePointerDelta]);

    useEffect(() => {
        if ((gameOver || isPaused) && document.pointerLockElement === canvasRef.current) {
            document.exitPointerLock?.();
        }
    }, [gameOver, isPaused]);

    useEffect(() => {
        if (!gameOver || hasRecordedGame) return;

        const nextStats = recordGame({
            result: playerWon ? 'win' : 'loss',
            territoryPercent: dayPercent,
            bestStreak,
            margin,
            difficulty,
            rivalAlias: rival.alias,
        });

        setStats(nextStats);
        setHasRecordedGame(true);
    }, [bestStreak, dayPercent, difficulty, gameOver, hasRecordedGame, margin, playerWon, rival.alias]);

    const handleRestart = useCallback(() => {
        setHasRecordedGame(false);
        setShareStatus('idle');
        setStats(null);
        restart();
    }, [restart]);

    const handleShare = async () => {
        setShareStatus('sharing');
        const result = await shareToTwitter({
            dayPercent,
            difficulty,
            playerWon,
            rivalAlias: rival.alias,
            bestStreak,
        });
        setShareStatus(result);
    };

    const lockCursorToArena = () => {
        if (gameOver || isPaused || isCoarsePointer) return;
        canvasRef.current?.requestPointerLock?.();
    };

    const shareLabel = {
        idle: 'Share the board',
        sharing: 'Building card...',
        shared: 'Posted',
        copied: 'Copied card',
        downloaded: 'Saved card',
    }[shareStatus];
    const pointerHint = isCoarsePointer
        ? 'Drag to steer the lower paddle'
        : isPointerLocked
            ? 'Aim locked • press Esc to release'
            : 'Click once to lock aim';
    const quickActionCopy = isCoarsePointer ? 'Touch ready.' : 'Aim fast. Rematch faster.';

    useEffect(() => {
        const handleHotkeys = (event: KeyboardEvent) => {
            if (event.repeat) return;

            if (gameOver && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                handleRestart();
                return;
            }

            if (!gameOver && (event.key === 'p' || event.key === 'P')) {
                event.preventDefault();
                togglePause();
            }
        };

        window.addEventListener('keydown', handleHotkeys);
        return () => window.removeEventListener('keydown', handleHotkeys);
    }, [gameOver, handleRestart, togglePause]);

    return (
        <div className="min-h-screen min-h-[100dvh] overflow-hidden bg-[var(--cp-bg)] text-[var(--cp-text)]">
            <div className="cp-arena-noise fixed inset-0 pointer-events-none" />
            <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="cp-chip min-h-[44px] rounded-full px-4 py-2 text-sm font-medium"
                            >
                                ← Exit arena
                            </button>
                        )}
                        <div className="cp-chip rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--cp-muted)]">
                            Arena online
                        </div>
                    </div>
                    <div
                        className="cp-timer-pill cp-display rounded-full border border-white/10 px-4 py-2 text-xl sm:text-2xl"
                        style={{ color: timerColor }}
                    >
                        {formatTime(timeRemaining)}
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.05fr,minmax(0,640px),1.05fr]">
                    <aside className="space-y-4">
                        <section className="cp-panel">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="cp-kicker">Your side</p>
                                    <h2 className="cp-display text-2xl font-black text-[var(--cp-text)]">Own the lower half</h2>
                                </div>
                                <div
                                    className="rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]"
                                    style={{ borderColor: 'rgba(255, 111, 60, 0.25)', color: COLORS.dayAccent }}
                                >
                                    {difficultyMeta.label}
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-[var(--cp-muted)]">
                                {difficultyMeta.subtitle}
                            </p>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Current streak</span>
                                    <strong className="cp-stat-value" style={{ color: COLORS.dayAccent }}>{streak}x</strong>
                                </div>
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Board surge</span>
                                    <strong className="cp-stat-value">{surgeLevel > 0 ? `+${surgeLevel}` : 'Idle'}</strong>
                                </div>
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Tiles held</span>
                                    <strong className="cp-stat-value">{score.day}</strong>
                                </div>
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Best this match</span>
                                    <strong className="cp-stat-value">{bestStreak}x</strong>
                                </div>
                            </div>
                        </section>

                        <section className="cp-panel">
                            <p className="cp-kicker">How it swings</p>
                            <ul className="space-y-3 text-sm leading-relaxed text-[var(--cp-muted)]">
                                <li>Drive the lower paddle with your mouse or thumb.</li>
                                <li>Clean returns charge the ball so the next invasion flips more tiles.</li>
                                <li>Finish above 50% territory when the horn lands.</li>
                            </ul>
                        </section>

                        {stats && (
                            <section className="cp-panel">
                                <p className="cp-kicker">Career stats</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="cp-stat-card">
                                        <span className="cp-stat-label">Win rate</span>
                                        <strong className="cp-stat-value">{getWinRate(stats)}%</strong>
                                    </div>
                                    <div className="cp-stat-card">
                                        <span className="cp-stat-label">Best board</span>
                                        <strong className="cp-stat-value">{stats.bestScore}%</strong>
                                    </div>
                                    <div className="cp-stat-card">
                                        <span className="cp-stat-label">Best streak</span>
                                        <strong className="cp-stat-value">{stats.bestStreak}x</strong>
                                    </div>
                                    <div className="cp-stat-card">
                                        <span className="cp-stat-label">Last rival</span>
                                        <strong className="cp-stat-value text-base">{stats.lastRivalAlias}</strong>
                                    </div>
                                </div>
                            </section>
                        )}
                    </aside>

                    <main className="space-y-4">
                        <section className="cp-panel">
                            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="cp-kicker">Live duel</p>
                                    <h1 className="cp-display text-3xl font-black tracking-tight sm:text-4xl">
                                        Combat Pong
                                    </h1>
                                </div>
                                <div className="min-w-[220px]">
                                    <div className="mb-2 flex items-center justify-between font-mono text-sm">
                                        <span style={{ color: COLORS.nightBall }}>{nightPercent}% rival</span>
                                        <span className="text-[var(--cp-dim)]">territory</span>
                                        <span style={{ color: COLORS.dayAccent }}>{dayPercent}% you</span>
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-black/40">
                                        <div className="flex h-full">
                                            <div style={{ width: `${nightPercent}%`, background: `linear-gradient(90deg, ${COLORS.night}, ${COLORS.nightAccent})` }} />
                                            <div style={{ width: `${dayPercent}%`, background: `linear-gradient(90deg, ${COLORS.dayAccent}, ${COLORS.day})` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/20 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                                <div className="absolute inset-x-5 top-4 z-10 flex justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--cp-muted)]">
                                    <span>Rival territory</span>
                                    <span>Your territory</span>
                                </div>
                                <canvas
                                    ref={canvasRef}
                                    width={CANVAS_SIZE}
                                    height={CANVAS_SIZE}
                                    className="relative z-[1] aspect-square w-full cursor-none touch-none rounded-[22px]"
                                    onClick={lockCursorToArena}
                                    onMouseMove={isPointerLocked ? undefined : handleMouseMove}
                                    onTouchMove={handleTouchMove}
                                    onTouchStart={(event) => event.preventDefault()}
                                />

                                {!gameOver && (
                                    <div className="pointer-events-none absolute inset-x-5 bottom-4 z-10 flex justify-center">
                                        <div className="cp-chip rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[var(--cp-muted)]">
                                            {pointerHint}
                                        </div>
                                    </div>
                                )}

                                {isPaused && !gameOver && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[22px] bg-black/70 backdrop-blur">
                                        <div className="text-center">
                                            <p className="cp-kicker">Paused</p>
                                            <h2 className="mt-2 text-3xl font-black">Hold the pressure</h2>
                                            <p className="mt-2 text-sm text-[var(--cp-muted)]">Resume when you are ready to pick the duel back up.</p>
                                        </div>
                                    </div>
                                )}

                                {gameOver && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[22px] bg-black/78 px-5 py-6 backdrop-blur-md">
                                        <div className="w-full max-w-md text-center">
                                            <p className="cp-kicker">Match complete</p>
                                            <h2
                                                className="cp-display mt-2 text-4xl font-black sm:text-5xl"
                                                style={{ color: playerWon ? COLORS.success : COLORS.nightBall }}
                                            >
                                                {playerWon ? 'Arena secured' : 'Rival held firm'}
                                            </h2>
                                            <p className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">
                                                {playerWon
                                                    ? `You finished with ${dayPercent}% against ${rival.alias}. Queue the next duel while the rhythm is hot.`
                                                    : `${rival.alias} edged it ${nightPercent}% to ${dayPercent}%. Jump back in and take the board right away.`}
                                            </p>

                                            <div className="mt-5 grid grid-cols-3 gap-3">
                                                <div className="cp-stat-card">
                                                    <span className="cp-stat-label">Margin</span>
                                                    <strong className="cp-stat-value">{Math.abs(margin)}%</strong>
                                                </div>
                                                <div className="cp-stat-card">
                                                    <span className="cp-stat-label">Peak streak</span>
                                                    <strong className="cp-stat-value">{bestStreak}x</strong>
                                                </div>
                                                <div className="cp-stat-card">
                                                    <span className="cp-stat-label">Rival</span>
                                                    <strong className="cp-stat-value text-base">{rival.alias}</strong>
                                                </div>
                                            </div>

                            <div className="mt-5 space-y-3">
                                                <button
                                                    onClick={handleRestart}
                                                    className="btn-gradient w-full justify-center rounded-2xl px-5 py-4 text-base font-bold text-white"
                                                >
                                                    Instant rematch
                                                </button>
                                                <button
                                                    onClick={handleShare}
                                                    disabled={shareStatus === 'sharing'}
                                                    className="cp-button-secondary w-full justify-center disabled:cursor-wait disabled:opacity-70"
                                                >
                                                    {shareLabel}
                                                </button>
                                                <p className="text-center text-xs uppercase tracking-[0.18em] text-[var(--cp-dim)]">
                                                    Press Enter for another run
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={togglePause}
                                disabled={gameOver}
                                className="cp-button-secondary disabled:opacity-50"
                            >
                                {isPaused ? 'Resume duel' : 'Pause duel'}
                            </button>
                            <button onClick={handleRestart} className="cp-button-secondary">
                                Reset board
                            </button>
                            <div className="cp-chip rounded-full px-4 py-3 text-sm text-[var(--cp-muted)]">
                                {quickActionCopy}
                            </div>
                        </div>
                    </main>

                    <aside className="space-y-4">
                        <section className="cp-panel">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <p className="cp-kicker">Matched rival</p>
                                    <h2 className="cp-display text-2xl font-black">{rival.alias}</h2>
                                    <p className="mt-1 text-sm text-[var(--cp-muted)]">{rival.title}</p>
                                </div>
                                <div className="cp-chip rounded-full px-3 py-2 font-mono text-sm">
                                    {pingMs}ms
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-[var(--cp-muted)]">
                                {rival.signature}
                            </p>
                            <div className="mt-5">
                                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--cp-dim)]">
                                    <span>Match pulse</span>
                                    <span>{momentum}%</span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-black/40">
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${momentum}%`,
                                            background: `linear-gradient(90deg, ${COLORS.nightAccent}, ${COLORS.dayAccent})`,
                                        }}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="cp-panel">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="cp-kicker">Arena feed</p>
                                <span className="text-xs uppercase tracking-[0.18em] text-[var(--cp-dim)]">
                                    {phase}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {feed.map((item) => (
                                    <div key={item.id} className={`rounded-2xl border px-4 py-3 text-sm ${toneClassName[item.tone]}`}>
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="cp-panel">
                            <p className="cp-kicker">Board split</p>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Rival side</span>
                                    <strong className="cp-stat-value" style={{ color: COLORS.nightBall }}>{score.night}</strong>
                                </div>
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Your side</span>
                                    <strong className="cp-stat-value" style={{ color: COLORS.dayAccent }}>{score.day}</strong>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
};
