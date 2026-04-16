/**
 * Minimal lobby that gets the player into a duel with almost no friction.
 *
 * The page keeps one job above everything else: make the board feel desirable
 * immediately, then get out of the way.
 */

import { useEffect, useState } from 'react';
import { DIFFICULTY } from '../game/constants';
import type { Difficulty } from '../game/types';

interface MainMenuProps {
    onStartGame: (difficulty: Difficulty) => void;
}

const difficultyOrder: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'];

export const MainMenu = ({ onStartGame }: MainMenuProps) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('MEDIUM');
    const selectedSettings = DIFFICULTY[selectedDifficulty];

    useEffect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.defaultPrevented) return;
            if (event.key !== 'Enter') return;

            const target = event.target;
            if (target instanceof HTMLElement && ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                return;
            }

            event.preventDefault();
            onStartGame(selectedDifficulty);
        };

        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, [onStartGame, selectedDifficulty]);

    return (
        <div className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-[var(--cp-bg)] text-[var(--cp-text)]">
            <div className="cp-home-bg fixed inset-0 pointer-events-none" />
            <div className="cp-home-shell relative mx-auto flex min-h-screen w-full max-w-[66rem] flex-col px-4 py-4 sm:px-6 sm:py-6">
                <header className="flex items-center justify-between gap-4">
                    <p className="cp-kicker">Combat Pong</p>
                    <a href="/controls" className="cp-home-utility-link">
                        Controls
                    </a>
                </header>

                <main className="flex flex-1 items-center py-4 sm:py-6">
                    <section className="grid w-full items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17.5rem,0.78fr)]">
                        <div className="max-w-[31rem]">
                            <p className="cp-home-mini">Anonymous territory duel</p>
                            <h1 className="cp-display cp-home-title mt-3 text-white">Take the board.</h1>
                            <p className="cp-home-lede mt-4 max-w-[30rem] text-[var(--cp-muted)]">
                                Hit clean, build speed, rip lanes open. Ninety seconds decides the whole board.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => onStartGame(selectedDifficulty)}
                                    className="btn-gradient rounded-2xl px-5 py-3 text-base font-bold text-white"
                                >
                                    Drop in · {selectedSettings.label}
                                </button>
                                <a href="/how-to-play" className="cp-home-utility-link cp-home-inline-link">
                                    How it works
                                </a>
                            </div>

                            <p className="cp-home-note mt-4">No account. Instant drop-in. Enter starts.</p>

                            <div className="mt-7 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="cp-kicker">Pick the heat</p>
                                    <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--cp-muted)]">
                                        {selectedDifficulty === 'MEDIUM' ? 'Best first run' : selectedSettings.label}
                                    </span>
                                </div>
                                <div className="cp-home-difficulty-rail">
                                    {difficultyOrder.map((difficulty) => {
                                        const settings = DIFFICULTY[difficulty];
                                        const isSelected = difficulty === selectedDifficulty;

                                        return (
                                            <button
                                                key={difficulty}
                                                type="button"
                                                onClick={() => setSelectedDifficulty(difficulty)}
                                                className={`cp-home-difficulty-pill ${isSelected ? 'cp-home-difficulty-pill-active' : ''}`}
                                            >
                                                <span className="cp-display text-[0.98rem] font-bold text-white">
                                                    {settings.label}
                                                </span>
                                                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cp-muted)]">
                                                    {settings.ballPairs * 2} balls
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="cp-home-stage-note max-w-[31rem]">
                                    {selectedSettings.subtitle}. Clean streaks snowball harder, and late comebacks can still rip the board away.
                                </p>
                            </div>
                        </div>

                        <div className="mx-auto w-full max-w-[22.5rem] lg:max-w-none lg:justify-self-end">
                            <button
                                type="button"
                                onClick={() => onStartGame(selectedDifficulty)}
                                className="cp-home-stage-button group w-full text-left"
                                aria-label={`Start ${selectedSettings.label} duel`}
                            >
                                <div className="cp-home-stage p-3.5 sm:p-4">
                                    <div className="cp-home-stage-topline">
                                        <span>{selectedSettings.label}</span>
                                        <span>Start instantly</span>
                                    </div>
                                    <div className="cp-home-board">
                                        <div className="cp-home-preview-paddle cp-home-preview-paddle-top" />
                                        <div className="cp-home-preview-paddle cp-home-preview-paddle-bottom" />
                                        <div className="cp-home-board-lane" />
                                        <div className="cp-home-orb cp-home-orb-night" />
                                        <div className="cp-home-orb cp-home-orb-day" />
                                    </div>
                                    <div className="cp-home-stage-footer mt-4">
                                        <p className="cp-home-stage-hint">{selectedSettings.subtitle}</p>
                                        <span className="cp-home-stage-cta">Drop in</span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};
