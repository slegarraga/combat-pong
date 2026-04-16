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

const arenaViewportStyle = {
    maxWidth: 'min(100%, 72dvh, 38rem)',
};

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
        isPaused,
        gameOver,
        rival,
    } = useGameLoop(canvasRef, difficulty);

    const [hasRecordedGame, setHasRecordedGame] = useState(false);
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
    const difficultyIndex = difficultyOrder.indexOf(difficulty);
    const harderDifficulty = difficultyOrder[difficultyIndex + 1];
    const easierDifficulty = difficultyOrder[difficultyIndex - 1];
    const suggestedDifficulty = playerWon ? harderDifficulty : easierDifficulty;
    const suggestedDifficultyLabel = suggestedDifficulty ? DIFFICULTY[suggestedDifficulty].label : null;

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
            <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-4 sm:px-6 sm:py-5">
                <main className="flex flex-1 items-center justify-center py-1 sm:py-2">
                    <section className="w-full space-y-1.5" style={arenaViewportStyle}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                                {onBack && (
                                    <button
                                        onClick={onBack}
                                        className="cp-chip min-h-[38px] rounded-full px-3 py-1.5 text-[11px] font-medium text-[var(--cp-muted)] transition hover:text-white"
                                    >
                                        ← Exit
                                    </button>
                                )}
                                <p className="truncate text-[10px] uppercase tracking-[0.18em] text-[var(--cp-dim)] sm:text-[11px]">
                                    {rival.alias} · {difficultyMeta.label}
                                </p>
                            </div>
                            <div
                                className={`cp-timer-pill cp-display rounded-full border border-white/10 px-3 py-1.5 text-base sm:text-lg ${clutchActive ? 'cp-timer-pill-clutch' : ''} ${criticalActive ? 'cp-timer-pill-critical' : ''}`}
                                style={{ color: timerColor }}
                            >
                                {formatTime(timeRemaining)}
                            </div>
                        </div>

                        <section
                            className={`cp-panel cp-arena-stage p-2 sm:p-2.5 ${clutchActive ? 'cp-arena-stage-clutch' : ''} ${criticalActive ? 'cp-arena-stage-critical' : ''}`}
                        >
                            <div className="mb-1.5">
                                <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] sm:text-[11px]">
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

                            <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black/18 p-1.5 shadow-[0_18px_46px_rgba(0,0,0,0.42)]">
                                {clutchActive && !gameOver && (
                                    <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
                                        <div className={`cp-chip rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] ${criticalActive ? 'text-rose-100' : 'text-amber-100'}`}>
                                            {criticalActive ? `${timeRemaining}s left` : 'Clutch'}
                                        </div>
                                    </div>
                                )}
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
                                        <div className="w-full max-w-[18.5rem] text-center">
                                            <p className="cp-kicker">Match complete</p>
                                            <h2
                                                className="cp-display mt-2 text-[2rem] font-black sm:text-[2.35rem]"
                                                style={{ color: playerWon ? COLORS.success : COLORS.nightBall }}
                                            >
                                                {playerWon ? 'Arena secured' : 'Rival held firm'}
                                            </h2>
                                            <p className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">
                                                {playerWon
                                                    ? `Held ${dayPercent}% against ${rival.alias}. Queue the next duel while the rhythm is still hot.`
                                                    : `${rival.alias} finished ${nightPercent}% to ${dayPercent}%. Run it back before the read fades.`}
                                            </p>

                                            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-[var(--cp-dim)]">
                                                {resultLine}
                                            </p>

                                            <div className="mt-5 space-y-2">
                                                <button
                                                    onClick={handleRestart}
                                                    className="btn-gradient w-full justify-center rounded-2xl px-5 py-3.5 text-base font-bold text-white"
                                                >
                                                    Instant rematch
                                                </button>
                                                <button
                                                    onClick={suggestedDifficulty ? () => handleDifficultyJump(suggestedDifficulty) : onBack}
                                                    className="cp-button-secondary w-full justify-center px-4 py-3 text-sm"
                                                >
                                                    {suggestedDifficulty && suggestedDifficultyLabel
                                                        ? playerWon
                                                            ? `Raise heat · ${suggestedDifficultyLabel}`
                                                            : `Reset lower · ${suggestedDifficultyLabel}`
                                                        : 'Back to home'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!gameOver && (
                                <div className="mt-2 flex items-center justify-end gap-2">
                                    <button
                                        onClick={handleSoundToggle}
                                        className="cp-button-secondary !min-h-[38px] px-3.5 py-2 text-[11px] uppercase tracking-[0.14em]"
                                    >
                                        {soundEnabled ? 'Sound on' : 'Sound off'}
                                    </button>
                                    <button
                                        onClick={togglePause}
                                        disabled={gameOver}
                                        className="cp-button-secondary !min-h-[38px] px-3.5 py-2 text-[11px] uppercase tracking-[0.14em] disabled:opacity-50"
                                    >
                                        {isPaused ? 'Resume' : 'Pause'}
                                    </button>
                                    <button
                                        onClick={handleRestart}
                                        className="cp-button-secondary !min-h-[38px] px-3.5 py-2 text-[11px] uppercase tracking-[0.14em]"
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
