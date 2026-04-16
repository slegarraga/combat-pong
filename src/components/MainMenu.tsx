/**
 * Minimal lobby that gets the player into a duel with almost no friction.
 *
 * The page keeps one job above everything else: make the board feel desirable
 * immediately, then get out of the way.
 */

import { DIFFICULTY } from '../game/constants';
import type { Difficulty } from '../game/types';

interface MainMenuProps {
    onStartGame: (difficulty: Difficulty) => void;
}

const difficultyOrder: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'];

export const MainMenu = ({ onStartGame }: MainMenuProps) => {
    return (
        <div className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-[var(--cp-bg)] text-[var(--cp-text)]">
            <div className="cp-home-bg fixed inset-0 pointer-events-none" />
            <div className="cp-home-shell relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 sm:py-6">
                <header className="flex items-center justify-between gap-4">
                    <p className="cp-kicker">Combat Pong</p>
                    <a href="/controls" className="cp-home-utility-link">
                        Controls
                    </a>
                </header>

                <main className="flex flex-1 items-center py-6 sm:py-8">
                    <section className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
                        <div className="max-w-xl">
                            <p className="cp-home-mini">Anonymous territory duel</p>
                            <h1 className="cp-display cp-home-title mt-3 text-white">Take the board.</h1>
                            <p className="cp-home-lede mt-4 max-w-lg text-[var(--cp-muted)]">
                                Fast swings hit harder. Hot streaks rip wider lanes. Every round lasts 90 seconds and
                                ends before the rematch urge can cool off.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => onStartGame('MEDIUM')}
                                    className="btn-gradient rounded-2xl px-6 py-3.5 text-base font-bold text-white"
                                >
                                    Play now
                                </button>
                                <button
                                    onClick={() => onStartGame('EASY')}
                                    className="cp-button-secondary rounded-2xl px-5 py-3.5 text-sm"
                                >
                                    Warm up
                                </button>
                                <a href="/how-to-play" className="cp-home-utility-link cp-home-inline-link">
                                    How it works
                                </a>
                            </div>

                            <p className="cp-home-note mt-4">No account. No queue. Mouse or touch.</p>

                            <div className="mt-8">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="cp-kicker">Pick the heat</p>
                                    <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--cp-dim)]">
                                        Medium starts best
                                    </span>
                                </div>
                                <div className="cp-mode-grid">
                                    {difficultyOrder.map((difficulty) => {
                                        const settings = DIFFICULTY[difficulty];
                                        const isDefault = difficulty === 'MEDIUM';

                                        return (
                                            <button
                                                key={difficulty}
                                                onClick={() => onStartGame(difficulty)}
                                                className="cp-mode-card group w-full text-left"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <h2 className="cp-display text-[1.02rem] font-bold text-white sm:text-[1.08rem]">
                                                        {settings.label}
                                                    </h2>
                                                    <span className={`text-[10px] uppercase tracking-[0.16em] ${isDefault ? 'text-white' : 'text-[var(--cp-dim)]'}`}>
                                                        {isDefault ? 'Start here' : difficulty}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm leading-relaxed text-[var(--cp-muted)]">
                                                    {settings.subtitle}
                                                </p>
                                                <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[var(--cp-dim)]">
                                                    <span>{settings.ballPairs * 2} balls</span>
                                                    <span>{Math.round(settings.speedMod * 100)}% pace</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="lg:justify-self-end">
                            <div className="cp-home-stage p-4 sm:p-5">
                                <div className="cp-home-board">
                                    <div className="cp-home-preview-paddle cp-home-preview-paddle-top" />
                                    <div className="cp-home-preview-paddle cp-home-preview-paddle-bottom" />
                                    <div className="cp-home-board-lane" />
                                    <div className="cp-home-orb cp-home-orb-night" />
                                    <div className="cp-home-orb cp-home-orb-day" />
                                </div>
                                <p className="cp-home-stage-note mt-4">
                                    Keep a streak alive and each clean return tears through more of the other side.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};
