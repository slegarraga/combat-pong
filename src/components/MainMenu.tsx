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
            <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="cp-chip rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-[var(--cp-muted)]">
                        Anonymous duel arcade
                    </div>
                    <nav className="flex flex-wrap items-center gap-3 text-sm text-[var(--cp-muted)]">
                        <a href="/how-to-play" className="hover:text-white">How to play</a>
                        <a href="/tips" className="hover:text-white">Tips</a>
                        <a href="/faq" className="hover:text-white">FAQ</a>
                        <a href="/multiplayer" className="hover:text-white">Duel guide</a>
                    </nav>
                </header>

                <main className="grid flex-1 gap-6 lg:grid-cols-[1.2fr,0.95fr]">
                    <section className="cp-panel relative overflow-hidden">
                        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(255,111,60,0.28),_transparent_68%)] blur-2xl" />
                        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(79,220,255,0.22),_transparent_66%)] blur-3xl" />
                        <div className="relative max-w-3xl">
                            <p className="cp-kicker">Queue-free competitive feel</p>
                            <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
                                Combat Pong
                            </h1>
                            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--cp-muted)] sm:text-xl">
                                A fake 1v1 that feels live: no account, no wait, just an anonymous rival,
                                a brutal board split, and 90 seconds of increasingly nasty returns.
                            </p>

                            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Instant rival</span>
                                    <strong className="cp-stat-value text-lg">Generated locally</strong>
                                </div>
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Match length</span>
                                    <strong className="cp-stat-value text-lg">90 seconds</strong>
                                </div>
                                <div className="cp-stat-card">
                                    <span className="cp-stat-label">Input</span>
                                    <strong className="cp-stat-value text-lg">Mouse + touch</strong>
                                </div>
                            </div>

                            {stats && (
                                <div className="mt-8 grid gap-3 sm:grid-cols-4">
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
                            )}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="cp-panel">
                            <p className="cp-kicker">Choose your pressure level</p>
                            <div className="mt-4 space-y-3">
                                {difficultyOrder.map((difficulty) => {
                                    const settings = DIFFICULTY[difficulty];
                                    return (
                                        <button
                                            key={difficulty}
                                            onClick={() => onStartGame(difficulty)}
                                            className="cp-mode-card group w-full text-left"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <h2 className="text-xl font-black text-white">{settings.label}</h2>
                                                    <span className="text-xs uppercase tracking-[0.2em] text-[var(--cp-dim)]">
                                                        {difficulty}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm leading-relaxed text-[var(--cp-muted)]">
                                                    {settings.subtitle}
                                                </p>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-[var(--cp-dim)]">
                                                <span>{settings.ballPairs * 2} balls</span>
                                                <span>•</span>
                                                <span>{Math.round(settings.speedMod * 100)}% pace</span>
                                                <span>•</span>
                                                <span>{Math.round(settings.aiPrecision * 100)}% rival precision</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="cp-panel">
                            <p className="cp-kicker">What changed</p>
                            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--cp-muted)]">
                                <p>No accounts. No Supabase. No real multiplayer infrastructure to slow the product down.</p>
                                <p>The rival is fully simulated, anonymous, and tuned to feel more human under pressure.</p>
                                <p>The board, HUD, and endgame loop are rebuilt around momentum swings and replay value.</p>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/6 pt-5 text-xs text-[var(--cp-dim)]">
                    <div className="flex flex-wrap items-center gap-3">
                        <a href="/about" className="hover:text-white">About</a>
                        <a href="/two-player" className="hover:text-white">2-player feel</a>
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
