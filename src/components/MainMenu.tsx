/**
 * Main lobby for the rebuilt anonymous duel experience.
 *
 * The old menu mixed single-player with account-gated multiplayer controls.
 * This version makes the core promise obvious: hit play, get an anonymous rival
 * instantly, and chase one-more-match momentum.
 */

import { useEffect, useState } from 'react';
import { DIFFICULTY } from '../game/constants';
import { getAverageTerritory, getLocalStats, getWinRate, type PlayerStats } from '../game/PlayerStats';
import type { Difficulty } from '../game/types';

interface MainMenuProps {
    onStartGame: (difficulty: Difficulty) => void;
}

const difficultyOrder: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'];

export const MainMenu = ({ onStartGame }: MainMenuProps) => {
    const [stats, setStats] = useState<PlayerStats | null>(null);

    useEffect(() => {
        const localStats = getLocalStats();
        if (localStats.gamesPlayed > 0) {
            setStats(localStats);
        }
    }, []);

    return (
        <div className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-[var(--cp-bg)] text-[var(--cp-text)]">
            <div className="cp-home-bg fixed inset-0 pointer-events-none" />
            <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="cp-chip rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-[var(--cp-muted)]">
                        Anonymous duel arcade
                    </div>
                    <nav className="flex flex-wrap items-center gap-4 text-sm text-[var(--cp-muted)]">
                        <a href="/how-to-play" className="hover:text-white">How to play</a>
                        <a href="/tips" className="hover:text-white">Tips</a>
                        <a href="/faq" className="hover:text-white">FAQ</a>
                    </nav>
                </header>

                <main className="flex flex-1 flex-col justify-center">
                    <section className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
                        <p className="cp-kicker">Fast, sharp, immediate</p>
                        <h1 className="mt-4 text-6xl font-black tracking-[-0.08em] text-white sm:text-7xl lg:text-[6.5rem]">
                            Combat Pong
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--cp-muted)] sm:text-xl">
                            One touch to start. Ninety seconds to take the board. Easy to learn, brutal to put down.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <button
                                onClick={() => onStartGame('MEDIUM')}
                                className="btn-gradient rounded-2xl px-7 py-4 text-base font-bold text-white"
                            >
                                Play Now
                            </button>
                            <a
                                href="/how-to-play"
                                className="cp-button-secondary rounded-2xl px-5 py-4"
                            >
                                Learn in 20 seconds
                            </a>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.18em] text-[var(--cp-dim)]">
                            <span>Instant entry</span>
                            <span>•</span>
                            <span>90-second matches</span>
                            <span>•</span>
                            <span>Mouse or touch</span>
                            <span>•</span>
                            <span>Instant rematches</span>
                        </div>
                    </section>

                    <section className="mx-auto mt-12 w-full max-w-5xl">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                                            <h2 className="text-xl font-black text-white">{settings.label}</h2>
                                            {isDefault ? (
                                                <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--cp-muted)]">
                                                    Start here
                                                </span>
                                            ) : (
                                                <span className="text-xs uppercase tracking-[0.2em] text-[var(--cp-dim)]">
                                                    {difficulty}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">
                                            {settings.subtitle}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-[var(--cp-dim)]">
                                            <span>{settings.ballPairs * 2} balls</span>
                                            <span>•</span>
                                            <span>{Math.round(settings.speedMod * 100)}% pace</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {stats && (
                        <section className="mx-auto mt-8 w-full max-w-5xl">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Wins</span>
                                    <strong className="cp-stat-value">{stats.wins}</strong>
                                </div>
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Win rate</span>
                                    <strong className="cp-stat-value">{getWinRate(stats)}%</strong>
                                </div>
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Avg. territory</span>
                                    <strong className="cp-stat-value">{getAverageTerritory(stats)}%</strong>
                                </div>
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Best streak</span>
                                    <strong className="cp-stat-value">{stats.bestStreak}x</strong>
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/6 pt-5 text-xs text-[var(--cp-dim)]">
                    <div className="flex flex-wrap items-center gap-3">
                        <a href="/about" className="hover:text-white">About</a>
                        <a href="/multiplayer" className="hover:text-white">Duel guide</a>
                        <a href="/best-free" className="hover:text-white">Why it hits</a>
                    </div>
                    <p>
                        Inspired by{' '}
                        <a
                            href="https://github.com/vnglst/pong-wars"
                            className="underline hover:text-white"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Pong Wars
                        </a>
                        {' '}and rebuilt for sharper anonymous duels.
                    </p>
                </footer>
            </div>
        </div>
    );
};
