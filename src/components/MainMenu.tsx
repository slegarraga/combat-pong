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

                <main className="flex flex-1 items-center py-8 sm:py-10">
                    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.06fr,0.82fr]">
                        <div className="max-w-3xl">
                            <p className="cp-kicker">Anonymous territory duel</p>
                            <h1 className="cp-display cp-home-title mt-4 text-white">
                                Fast hands. Heavy hits. One more run.
                            </h1>
                            <p className="cp-home-lede mt-6 max-w-2xl text-[var(--cp-muted)]">
                                Every fast return hits harder, steals more ground, and turns the board in your favor.
                                That one rule makes the duel instantly readable and extremely replayable.
                            </p>

                            <div className="mt-9 flex flex-wrap items-center gap-3">
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

                            <div className="cp-home-meta mt-7 justify-start">
                                <span>No setup</span>
                                <span>Heavier fast hits</span>
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
                                                    <h2 className="cp-display text-[1.1rem] font-bold text-white sm:text-[1.2rem]">{settings.label}</h2>
                                                    <span className={`text-[10px] uppercase tracking-[0.18em] ${isDefault ? 'text-white' : 'text-[var(--cp-dim)]'}`}>
                                                        {isDefault ? 'Start here' : difficulty}
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
                                <div className="cp-home-results mt-10">
                                    <div className="cp-home-result">
                                        <span>Wins</span>
                                        <strong>{stats.wins}</strong>
                                    </div>
                                    <div className="cp-home-result">
                                        <span>Win rate</span>
                                        <strong>{getWinRate(stats)}%</strong>
                                    </div>
                                    <div className="cp-home-result">
                                        <span>Avg. territory</span>
                                        <strong>{getAverageTerritory(stats)}%</strong>
                                    </div>
                                    <div className="cp-home-result">
                                        <span>Best streak</span>
                                        <strong>{stats.bestStreak}x</strong>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:justify-self-end">
                            <div className="cp-home-stage p-6 sm:p-7">
                                <div className="relative">
                                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[var(--cp-muted)]">
                                        <span>Live board</span>
                                        <span>90-second duel</span>
                                    </div>
                                    <div className="cp-home-board mt-5">
                                        <div className="cp-home-preview-paddle cp-home-preview-paddle-top" />
                                        <div className="cp-home-preview-paddle cp-home-preview-paddle-bottom" />
                                        <div className="cp-home-orb cp-home-orb-night" />
                                        <div className="cp-home-orb cp-home-orb-day" />
                                        <div className="cp-home-board-chip cp-home-board-chip-top">Speed scales impact</div>
                                        <div className="cp-home-board-chip cp-home-board-chip-bottom">Clean streaks steal faster</div>
                                    </div>
                                </div>

                                <div className="cp-home-stage-copy mt-6">
                                    <p className="cp-display text-3xl font-bold tracking-[-0.06em] text-white sm:text-[2.6rem]">
                                        The faster the swing, the harder the board breaks.
                                    </p>
                                    <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--cp-muted)]">
                                        You understand the rule in seconds, then spend the next matches trying to hit
                                        cleaner, faster, and meaner than the last one.
                                    </p>
                                </div>

                                <div className="cp-home-stage-tags mt-5">
                                    <span>Dynamic impact</span>
                                    <span>Charged streaks</span>
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
