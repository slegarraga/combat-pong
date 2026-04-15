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
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="cp-chip rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-[var(--cp-muted)]">
                            Combat Pong
                        </div>
                        <div className="cp-chip rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--cp-muted)]">
                            Instant anonymous duels
                        </div>
                    </div>
                    <a href="/how-to-play" className="text-sm text-[var(--cp-muted)] transition hover:text-white">
                        How it plays
                    </a>
                </header>

                <main className="flex flex-1 items-center py-8 sm:py-10">
                    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 xl:grid-cols-[1.04fr,0.88fr]">
                        <div className="max-w-3xl">
                            <p className="cp-kicker">Underground arcade duel</p>
                            <h1 className="cp-display cp-home-title mt-4 text-white">
                                Win the board before the board wins you.
                            </h1>
                            <p className="cp-home-lede mt-6 max-w-2xl text-[var(--cp-muted)]">
                                Fast returns land harder. Edge cuts carve lanes. Every round lasts 90 seconds and ends
                                with the exact kind of finish that makes a rematch feel automatic.
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
                                <a href="/controls" className="cp-home-utility-link">
                                    See controls
                                </a>
                            </div>

                            <div className="cp-home-meta mt-7 justify-start">
                                <span>No account</span>
                                <span>No queue</span>
                                <span>90-second rounds</span>
                                <span>Instant rematches</span>
                                <span>Mouse or touch</span>
                            </div>

                            <div className="cp-home-signal-grid mt-8">
                                <div className="cp-home-signal-card">
                                    <span>Read</span>
                                    <strong>Speed changes impact instantly.</strong>
                                </div>
                                <div className="cp-home-signal-card">
                                    <span>Mastery</span>
                                    <strong>Edge cuts now carve short lanes through territory.</strong>
                                </div>
                                <div className="cp-home-signal-card">
                                    <span>Loop</span>
                                    <strong>Short rounds, violent swings, instant rematch rhythm.</strong>
                                </div>
                            </div>

                            <div className="mt-10">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <p className="cp-kicker">Pick your pace</p>
                                    <span className="text-sm text-[var(--cp-muted)]">Medium is the best first run</span>
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
                                <div className="cp-home-record-strip mt-8">
                                    <span>{stats.gamesPlayed} duels</span>
                                    <strong>{getWinRate(stats)}% win rate</strong>
                                    <span>{getAverageTerritory(stats)}% average board</span>
                                    <span>{stats.bestStreak}x best streak</span>
                                </div>
                            )}
                        </div>

                        <div className="lg:justify-self-end">
                            <div className="cp-home-stage p-5 sm:p-6">
                                <div className="relative">
                                    <div className="cp-home-stage-header">
                                        <span>Live board feel</span>
                                        <span>Fast edge cuts</span>
                                    </div>
                                    <div className="cp-home-board mt-4">
                                        <div className="cp-home-preview-paddle cp-home-preview-paddle-top" />
                                        <div className="cp-home-preview-paddle cp-home-preview-paddle-bottom" />
                                        <div className="cp-home-board-lane" />
                                        <div className="cp-home-board-cluster cp-home-board-cluster-top" />
                                        <div className="cp-home-board-cluster cp-home-board-cluster-bottom" />
                                        <div className="cp-home-orb cp-home-orb-night" />
                                        <div className="cp-home-orb cp-home-orb-day" />
                                        <div className="cp-home-board-chip cp-home-board-chip-top">Impact scales with speed</div>
                                        <div className="cp-home-board-chip cp-home-board-chip-bottom">Edge cuts carve lanes</div>
                                    </div>
                                </div>

                                <div className="cp-home-stage-copy mt-6">
                                    <p className="cp-display text-3xl font-bold tracking-[-0.06em] text-white sm:text-[2.6rem]">
                                        One clean cut can rip the whole lane open.
                                    </p>
                                    <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--cp-muted)]">
                                        The board tells the story immediately: heavy returns explode harder, clean cuts
                                        chew through territory, and the closing seconds turn every touch into a dare.
                                    </p>
                                </div>

                                <div className="cp-home-stage-tags mt-5">
                                    <span>Heavy fast hits</span>
                                    <span>Cut-shot lane breaks</span>
                                    <span>Clutch finishes</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="mt-8 border-t border-white/6 pt-5 text-xs text-[var(--cp-dim)]">
                    Local-only, anonymous, frictionless. Open the board and play.
                </footer>
            </div>
        </div>
    );
};
