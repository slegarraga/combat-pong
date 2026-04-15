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
            <div className="cp-home-shell relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="cp-chip rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-[var(--cp-muted)]">
                        Combat Pong
                    </div>
                    <nav className="flex flex-wrap items-center gap-4 text-sm text-[var(--cp-muted)]">
                        <a href="/how-to-play" className="hover:text-white">How it works</a>
                        <a href="/faq" className="hover:text-white">FAQ</a>
                        <a href="/tips" className="hover:text-white">Tips</a>
                    </nav>
                </header>

                <main className="flex flex-1 items-center">
                    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr,0.85fr]">
                        <div className="max-w-3xl">
                            <p className="cp-kicker">Combat Pong</p>
                            <h1 className="cp-display mt-4 text-6xl font-extrabold tracking-[-0.09em] text-white sm:text-7xl lg:text-[6.6rem]">
                                Own the board in 90 seconds.
                            </h1>
                            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--cp-muted)] sm:text-xl">
                                Combat Pong is a frictionless territory duel built for instant understanding, sharp pressure,
                                and immediate rematches.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => onStartGame('MEDIUM')}
                                    className="btn-gradient rounded-2xl px-7 py-4 text-base font-bold text-white"
                                >
                                    Play Now
                                </button>
                                <button
                                    onClick={() => onStartGame('EASY')}
                                    className="cp-button-secondary rounded-2xl px-5 py-4"
                                >
                                    Warm Up
                                </button>
                            </div>

                            <div className="cp-home-meta mt-6 justify-start">
                                <span>No setup</span>
                                <span>Instant read</span>
                                <span>90-second rounds</span>
                                <span>Instant rematches</span>
                                <span>Mouse or touch</span>
                            </div>

                            <div className="mt-10">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <p className="cp-kicker">Choose the pressure</p>
                                    <a href="/how-to-play" className="text-sm text-[var(--cp-muted)] hover:text-white">
                                        See the rules
                                    </a>
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
                                                    <h2 className="cp-display text-xl font-bold text-white">{settings.label}</h2>
                                                    <span className={`text-[10px] uppercase tracking-[0.18em] ${isDefault ? 'text-white' : 'text-[var(--cp-dim)]'}`}>
                                                        {isDefault ? 'Best first run' : difficulty}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm leading-relaxed text-[var(--cp-muted)]">
                                                    {settings.subtitle}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[var(--cp-dim)]">
                                                    <span>{settings.ballPairs * 2} balls</span>
                                                    <span>{Math.round(settings.speedMod * 100)}% pace</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {stats && (
                                <div className="mt-8">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <p className="cp-kicker">Your run</p>
                                        <span className="text-xs uppercase tracking-[0.18em] text-[var(--cp-dim)]">
                                            {stats.gamesPlayed} matches
                                        </span>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-4">
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
                                </div>
                            )}
                        </div>

                        <div className="lg:justify-self-end">
                            <div className="cp-home-stage p-5 sm:p-6">
                                <div className="relative">
                                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[var(--cp-muted)]">
                                        <span>Board preview</span>
                                        <span>No waiting</span>
                                    </div>
                                    <div className="cp-home-board mt-4">
                                        <div className="cp-home-orb cp-home-orb-night" />
                                        <div className="cp-home-orb cp-home-orb-day" />
                                        <div className="cp-home-board-chip cp-home-board-chip-top">Pressure rises</div>
                                        <div className="cp-home-board-chip cp-home-board-chip-bottom">Territory flips fast</div>
                                    </div>
                                </div>

                                <div className="cp-home-stage-copy mt-6">
                                    <p className="cp-display text-3xl font-bold tracking-[-0.06em] text-white sm:text-[2.35rem]">
                                        Fast to read. Hard to drop.
                                    </p>
                                    <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--cp-muted)]">
                                        Every clean return steals ground, every streak sharpens the pace, and every finish
                                        is built to trigger another run.
                                    </p>
                                </div>

                                <div className="cp-home-stage-tags mt-5">
                                    <span>90s rounds</span>
                                    <span>Zero setup</span>
                                    <span>Rematch loop</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/6 pt-5 text-xs text-[var(--cp-dim)]">
                    <div className="flex flex-wrap items-center gap-3">
                        <a href="/about" className="hover:text-white">About</a>
                        <a href="/multiplayer" className="hover:text-white">Duel guide</a>
                        <a href="/best-free" className="hover:text-white">Why people stay</a>
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
