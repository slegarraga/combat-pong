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
import { recordGame } from './PlayerStats';
import type { Difficulty } from './types';

interface GameCanvasProps {
    difficulty: Difficulty;
    onBack?: () => void;
    onChangeDifficulty?: (difficulty: Difficulty) => void;
}

const difficultyOrder: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'];

export const GameCanvas = ({ difficulty, onBack, onChangeDifficulty }: GameCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const {
        score,
        timeRemaining,
        bestStreak,
        restart,
        togglePause,
        handleMouseMove,
        handlePointerDelta,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleTouchCancel,
        isPaused,
        gameOver,
        rival,
    } = useGameLoop(canvasRef, difficulty);

    const [hasRecordedGame, setHasRecordedGame] = useState(false);
    const [isPointerLocked, setIsPointerLocked] = useState(false);
    const [isCoarsePointer, setIsCoarsePointer] = useState(false);
    const [soundEnabled, setSoundEnabledState] = useState(() => isArenaAudioEnabled());
    const arenaViewportStyle = {
        maxWidth: isCoarsePointer
            ? 'min(100%, calc(100dvh - 10.5rem), 33rem)'
            : 'min(100%, 72dvh, 38rem)',
    };

    const total = score.day + score.night;
    const dayPercent = total > 0 ? Math.round((score.day / total) * 100) : 50;
    const nightPercent = 100 - dayPercent;
    const playerWon = dayPercent >= nightPercent;
    const margin = dayPercent - nightPercent;
    const difficultyMeta = DIFFICULTY[difficulty];
    const clutchActive = timeRemaining <= 15;
    const criticalActive = timeRemaining <= 5;
    const difficultyIndex = difficultyOrder.indexOf(difficulty);
    const harderDifficulty = difficultyOrder[difficultyIndex + 1];
    const easierDifficulty = difficultyOrder[difficultyIndex - 1];
    const suggestedDifficulty = playerWon ? harderDifficulty : easierDifficulty;
    const suggestedDifficultyLabel = suggestedDifficulty ? DIFFICULTY[suggestedDifficulty].label : null;
    const primaryActionLabel = playerWon ? 'Keep the arena' : 'Take it back';
    const secondaryActionLabel = suggestedDifficulty && suggestedDifficultyLabel
        ? playerWon
            ? `Push harder · ${suggestedDifficultyLabel}`
            : `Settle in · ${suggestedDifficultyLabel}`
        : 'Back to home';
    const postMatchHint = isCoarsePointer
        ? 'Tap anywhere to rematch.'
        : suggestedDifficulty
            ? 'Click anywhere to rematch. Shift+Enter changes the heat.'
            : 'Click anywhere to rematch.';
    const exitLabel = isCoarsePointer ? 'Exit' : '← Exit';
    const arenaMetaLine = isCoarsePointer ? rival.alias : `${rival.alias} · ${difficultyMeta.label}`;

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

        recordGame({
            result: playerWon ? 'win' : 'loss',
            territoryPercent: dayPercent,
            bestStreak,
            margin,
            difficulty,
            rivalAlias: rival.alias,
        });
        setHasRecordedGame(true);
    }, [bestStreak, dayPercent, difficulty, gameOver, hasRecordedGame, margin, playerWon, rival.alias]);

    const handleRestart = useCallback(() => {
        setHasRecordedGame(false);
        restart();
    }, [restart]);

    const handleDifficultyJump = useCallback((nextDifficulty: Difficulty) => {
        setHasRecordedGame(false);

        if (nextDifficulty === difficulty || !onChangeDifficulty) {
            restart();
            return;
        }

        onChangeDifficulty(nextDifficulty);
    }, [difficulty, onChangeDifficulty, restart]);

    const handlePostMatchSecondary = useCallback(() => {
        if (suggestedDifficulty) {
            handleDifficultyJump(suggestedDifficulty);
            return;
        }

        onBack?.();
    }, [handleDifficultyJump, onBack, suggestedDifficulty]);

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

    const resultLine = `${dayPercent}% board · ${bestStreak}x peak · ${margin > 0 ? '+' : ''}${margin}% swing`;

    useEffect(() => {
        const handleHotkeys = (event: KeyboardEvent) => {
            if (event.repeat) return;

            if (gameOver && event.key === 'Enter' && event.shiftKey && suggestedDifficulty) {
                event.preventDefault();
                handleDifficultyJump(suggestedDifficulty);
                return;
            }

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
    }, [gameOver, handleDifficultyJump, handleRestart, suggestedDifficulty, togglePause]);

    return (
        <div className="min-h-screen min-h-[100dvh] overflow-hidden bg-[var(--cp-bg)] text-[var(--cp-text)]">
            <div className="cp-arena-noise fixed inset-0 pointer-events-none" />
            <div className="relative mx-auto flex min-h-screen w-full max-w-[42rem] flex-col px-3 py-3 sm:px-6 sm:py-5">
                <main className="flex flex-1 items-center justify-center py-0.5 sm:py-1">
                    <section className="w-full space-y-1" style={arenaViewportStyle}>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                                {onBack && (
                                    <button
                                        onClick={onBack}
                                        className="cp-chip min-h-[40px] rounded-full px-3 py-1.5 text-[12px] font-semibold text-[var(--cp-muted)] transition hover:text-white"
                                    >
                                        {exitLabel}
                                    </button>
                                )}
                                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--cp-muted)] sm:text-[12px]">
                                    {arenaMetaLine}
                                </p>
                            </div>
                            <div
                                className={`cp-timer-pill cp-display rounded-full border border-white/10 px-3 py-1 text-[1.05rem] sm:px-3.5 sm:py-1.5 sm:text-lg ${clutchActive ? 'cp-timer-pill-clutch' : ''} ${criticalActive ? 'cp-timer-pill-critical' : ''}`}
                                style={{ color: timerColor }}
                            >
                                {formatTime(timeRemaining)}
                            </div>
                        </div>

                        <section
                            className={`cp-panel cp-arena-stage p-1.5 sm:p-2 ${clutchActive ? 'cp-arena-stage-clutch' : ''} ${criticalActive ? 'cp-arena-stage-critical' : ''}`}
                        >
                            <div className="mb-1.5">
                                {!isCoarsePointer && (
                                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--cp-muted)]">
                                        {difficultyMeta.label}
                                    </p>
                                )}
                                <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[11px]">
                                        <span style={{ color: COLORS.nightBall }}>{nightPercent}% rival</span>
                                        <span style={{ color: COLORS.dayAccent }}>{dayPercent}% you</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-black/40">
                                    <div className="flex h-full">
                                        <div style={{ width: `${nightPercent}%`, background: `linear-gradient(90deg, ${COLORS.night}, ${COLORS.nightAccent})` }} />
                                        <div style={{ width: `${dayPercent}%`, background: `linear-gradient(90deg, ${COLORS.dayAccent}, ${COLORS.day})` }} />
                                    </div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/18 p-1 shadow-[0_18px_46px_rgba(0,0,0,0.42)] sm:p-1.5">
                                {clutchActive && !gameOver && (
                                    <div className="pointer-events-none absolute inset-x-0 top-2.5 z-10 flex justify-center">
                                        <div className={`cp-chip rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${criticalActive ? 'text-rose-100' : 'text-amber-100'}`}>
                                            {criticalActive ? `${timeRemaining}s left` : 'Clutch'}
                                        </div>
                                    </div>
                                )}
                                <canvas
                                    ref={canvasRef}
                                    width={CANVAS_SIZE}
                                    height={CANVAS_SIZE}
                                    className="relative z-[1] aspect-square w-full cursor-none touch-none rounded-[20px] sm:rounded-[22px]"
                                    onClick={lockCursorToArena}
                                    onMouseMove={isPointerLocked ? undefined : handleMouseMove}
                                    onTouchMove={handleTouchMove}
                                    onTouchStart={handleArenaTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                    onTouchCancel={handleTouchCancel}
                                />

                                {isPaused && !gameOver && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[20px] px-4 py-5 sm:rounded-[22px]">
                                        <div className="cp-overlay-scrim absolute inset-0 rounded-[20px] sm:rounded-[22px]" />
                                        <div className="cp-overlay-card relative max-w-[16.5rem] text-center">
                                            <p className="cp-kicker cp-overlay-kicker">Paused</p>
                                            <h2 className="mt-2 text-3xl font-black">Hold the pressure</h2>
                                            <p className="cp-overlay-copy mt-2 text-sm">Resume when you are ready to pick the duel back up.</p>
                                        </div>
                                    </div>
                                )}

                                {gameOver && (
                                    <div
                                        className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center rounded-[20px] px-4 py-5 sm:rounded-[22px] sm:px-5 sm:py-6"
                                        onClick={handleRestart}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                handleRestart();
                                            }
                                        }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="cp-overlay-scrim absolute inset-0 rounded-[20px] sm:rounded-[22px]" />
                                        <div className="cp-overlay-card relative w-full max-w-[17.25rem] text-center sm:max-w-[18.5rem]">
                                            <p className="cp-kicker cp-overlay-kicker">Match complete</p>
                                            <h2
                                                className="cp-display mt-2 text-[1.8rem] font-black sm:text-[2.25rem]"
                                                style={{ color: playerWon ? COLORS.success : COLORS.nightBall }}
                                            >
                                                {playerWon ? 'Arena secured' : 'Rival held firm'}
                                            </h2>
                                            <p className="cp-overlay-copy mt-3 text-[0.98rem] leading-relaxed">
                                                {playerWon
                                                    ? `Held ${dayPercent}% against ${rival.alias}. Stay in rhythm.`
                                                    : `${rival.alias} closed ${nightPercent}% to ${dayPercent}. Run it back now.`}
                                            </p>

                                            <p className="cp-overlay-meta mt-4 text-[12px] font-semibold uppercase tracking-[0.14em]">
                                                {resultLine}
                                            </p>

                                            <div className="mt-5 space-y-2">
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleRestart();
                                                    }}
                                                    className="btn-gradient w-full justify-center rounded-2xl px-5 py-3.5 text-base font-bold text-white"
                                                >
                                                    {primaryActionLabel}
                                                </button>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handlePostMatchSecondary();
                                                    }}
                                                    className="cp-button-secondary w-full justify-center px-4 py-3 text-sm"
                                                >
                                                    {secondaryActionLabel}
                                                </button>
                                            </div>
                                            <p className="cp-overlay-hint mt-4 text-[11px] font-semibold uppercase tracking-[0.14em]">
                                                {postMatchHint}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!gameOver && (
                                <div className={`mt-2 flex gap-2 ${isCoarsePointer ? 'flex-wrap' : 'items-center justify-end'}`}>
                                    <button
                                        onClick={handleSoundToggle}
                                        className={`cp-button-secondary min-h-[44px] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] sm:px-3.5 sm:text-[12px] ${isCoarsePointer ? 'flex-1 justify-center' : ''}`}
                                    >
                                        {soundEnabled ? 'Sound on' : 'Sound off'}
                                    </button>
                                    <button
                                        onClick={togglePause}
                                        disabled={gameOver}
                                        className={`cp-button-secondary min-h-[44px] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50 sm:px-3.5 sm:text-[12px] ${isCoarsePointer ? 'flex-1 justify-center' : ''}`}
                                    >
                                        {isPaused ? 'Resume' : 'Pause'}
                                    </button>
                                    <button
                                        onClick={handleRestart}
                                        className={`cp-button-secondary min-h-[44px] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] sm:px-3.5 sm:text-[12px] ${isCoarsePointer ? 'w-full justify-center' : ''}`}
                                    >
                                        Reset
                                    </button>
                                </div>
                            )}
                        </section>
                    </section>
                </main>
            </div>
        </div>
    );
};
