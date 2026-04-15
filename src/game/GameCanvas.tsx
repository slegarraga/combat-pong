/**
 * Anonymous duel HUD and canvas wrapper.
 *
 * The engine stays in `useGameLoop`; this component focuses on presentation,
 * match summary handling, and local-only persistence/share flows.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { isArenaAudioEnabled, primeArenaAudio, setArenaAudioEnabled } from './audio';
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
        handleTouchStart,
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
    const [soundEnabled, setSoundEnabledState] = useState(() => isArenaAudioEnabled());

    const total = score.day + score.night;
    const dayPercent = total > 0 ? Math.round((score.day / total) * 100) : 50;
    const nightPercent = 100 - dayPercent;
    const playerWon = dayPercent >= nightPercent;
    const margin = dayPercent - nightPercent;
    const difficultyMeta = DIFFICULTY[difficulty];
    const clutchActive = timeRemaining <= 15;
    const criticalActive = timeRemaining <= 5;

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

    const handleSoundToggle = useCallback(() => {
        const nextValue = !soundEnabled;
        setSoundEnabledState(nextValue);
        setArenaAudioEnabled(nextValue);
    }, [soundEnabled]);

    const handleArenaTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
        handleTouchStart(event);
        void primeArenaAudio();
    }, [handleTouchStart]);

    const lockCursorToArena = useCallback(() => {
        void primeArenaAudio();

        if (gameOver || isPaused || isCoarsePointer) return;
        canvasRef.current?.requestPointerLock?.();
    }, [gameOver, isCoarsePointer, isPaused]);

    const shareLabel = {
        idle: 'Share the board',
        sharing: 'Building card...',
        shared: 'Posted',
        copied: 'Copied card',
        downloaded: 'Saved card',
    }[shareStatus];
    const liveFeed = feed[0];
    const liveFeedText = liveFeed?.text ?? rival.signature;
    const liveFeedToneClass = liveFeed ? toneClassName[liveFeed.tone] : toneClassName.neutral;
    const pointerHint = isCoarsePointer
        ? 'Drag anywhere on the board'
        : isPointerLocked
            ? 'Aim locked • Esc releases'
            : 'Click board to lock aim';
    const quickActionCopy = criticalActive
        ? 'One clean touch flips it.'
        : clutchActive
            ? 'Cut shots matter now.'
            : isCoarsePointer
                ? 'Drag low. Carve lanes.'
                : 'Clip the edge to carve lanes.';

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
            <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
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
                        <button
                            onClick={handleSoundToggle}
                            className="cp-chip min-h-[44px] rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--cp-muted)] transition hover:text-white"
                        >
                            {soundEnabled ? 'Sound on' : 'Sound off'}
                        </button>
                    </div>
                    <div
                        className={`cp-timer-pill cp-display rounded-full border border-white/10 px-4 py-2 text-xl sm:text-2xl ${clutchActive ? 'cp-timer-pill-clutch' : ''} ${criticalActive ? 'cp-timer-pill-critical' : ''}`}
                        style={{ color: timerColor }}
                    >
                        {formatTime(timeRemaining)}
                    </div>
                </div>

                <main className="flex flex-1 items-center justify-center py-3 sm:py-6">
                    <section className="w-full space-y-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-2xl">
                                <p className="cp-kicker">Matched rival</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    <h1 className="cp-display text-3xl font-black tracking-tight text-white sm:text-4xl">
                                        {rival.alias}
                                    </h1>
                                    <span
                                        className="rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]"
                                        style={{ borderColor: 'rgba(255, 111, 60, 0.25)', color: COLORS.dayAccent }}
                                    >
                                        {difficultyMeta.label}
                                    </span>
                                    <span className="cp-chip rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--cp-muted)]">
                                        {rival.title}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="cp-chip rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[var(--cp-muted)]">
                                    Streak {streak}x
                                </div>
                                <div className="cp-chip rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[var(--cp-muted)]">
                                    Pulse {momentum}%
                                </div>
                                <div className="cp-chip rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[var(--cp-muted)]">
                                    {pingMs}ms
                                </div>
                            </div>
                        </div>

                        <section className={`cp-panel cp-arena-stage p-3 sm:p-4 ${clutchActive ? 'cp-arena-stage-clutch' : ''} ${criticalActive ? 'cp-arena-stage-critical' : ''}`}>
                            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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

                                <div className={`rounded-full border px-4 py-2 text-sm ${liveFeedToneClass}`}>
                                    {phase} · {quickActionCopy}
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/20 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                                {clutchActive && !gameOver && (
                                    <div className="pointer-events-none absolute inset-x-0 top-14 z-10 flex justify-center">
                                        <div className={`cp-chip rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] ${criticalActive ? 'text-rose-100' : 'text-amber-100'}`}>
                                            {criticalActive ? `Final ${timeRemaining}s` : 'Clutch'}
                                        </div>
                                    </div>
                                )}
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
                                    onTouchStart={handleArenaTouchStart}
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

                                            {stats && (
                                                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--cp-dim)]">
                                                    Career win rate {getWinRate(stats)}% · Best board {stats.bestScore}%
                                                </p>
                                            )}

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

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className={`rounded-full border px-4 py-3 text-sm ${liveFeedToneClass}`}>
                                {liveFeedText}
                            </div>
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
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};
