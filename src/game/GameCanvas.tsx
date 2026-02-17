/**
 * Game UI component — wraps the HTML canvas and renders all HUD elements.
 *
 * Responsibilities:
 *   - Hosts the <canvas> element and wires up mouse/touch input
 *   - Displays the countdown timer, territory score bar, and streak indicator
 *   - Shows pause and game-over overlays
 *   - Records game results to localStorage (and optionally Supabase)
 *   - Provides "Share to X" and "Play Again" buttons after each match
 */

import { useRef, useState, useEffect } from 'react';
import { useGameLoop } from './GameLoop';
import { CANVAS_SIZE, COLORS } from './constants';
import { shareToTwitter } from './ShareCard';
import { recordGame, type PlayerStats } from './PlayerStats';

interface GameCanvasProps {
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE';
    onBack?: () => void;
    /** If provided, game results sync to Supabase under this user ID. */
    userId?: string;
}

export const GameCanvas = ({ difficulty, onBack, userId }: GameCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { score, timeRemaining, streak, restart, togglePause, handleMouseMove, handleTouchMove, isPaused, gameOver } = useGameLoop(canvasRef, difficulty);
    const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'copied'>('idle');
    const [hasRecordedGame, setHasRecordedGame] = useState(false);
    const [stats, setStats] = useState<PlayerStats | null>(null);

    const total = score.day + score.night;
    const dayPercent = total > 0 ? Math.round((score.day / total) * 100) : 50;
    const nightPercent = 100 - dayPercent;
    const playerWon = dayPercent > 50;

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Record game result when game is over
    useEffect(() => {
        if (gameOver && !hasRecordedGame) {
            const result = playerWon ? 'win' : 'loss';
            recordGame(result, dayPercent, userId).then(newStats => {
                setStats(newStats);
            });
            setHasRecordedGame(true);
        }
    }, [gameOver, hasRecordedGame, playerWon, dayPercent, userId]);

    // Reset recording flag when game restarts
    const handleRestart = () => {
        setHasRecordedGame(false);
        setStats(null);
        restart();
    };

    // Main share function
    const handleShare = async () => {
        setShareStatus('sharing');
        await shareToTwitter({ dayPercent, difficulty, playerWon });
        setShareStatus('idle');
    };

    const getShareButtonText = () => {
        if (shareStatus === 'sharing') return '...';
        if (shareStatus === 'copied') return '✓ Paste in X!';
        return 'Share';
    };

    // Timer color based on time remaining
    const getTimerColor = () => {
        if (timeRemaining <= 10) return '#ef4444'; // red
        if (timeRemaining <= 30) return '#f59e0b'; // orange
        return '#ffffff'; // white
    };

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen min-h-[100dvh] p-2 sm:p-4 md:p-6 select-none overflow-hidden"
            style={{ background: COLORS.background }}
        >
            {/* Back Button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="fixed top-2 left-2 sm:top-4 sm:left-4 px-3 py-2 min-h-[44px] min-w-[44px] bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur rounded-full text-white text-sm font-medium transition-all z-50 touch-manipulation"
                >
                    ← Back
                </button>
            )}

            {/* Timer Display */}
            <div
                className="text-3xl sm:text-5xl font-black font-mono tracking-wider transition-colors duration-300 mb-2 sm:mb-3"
                style={{ color: getTimerColor() }}
            >
                ⏱️ {formatTime(timeRemaining)}
            </div>

            {/* Score Bar */}
            <div className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg mb-2 sm:mb-4 px-1">
                <div className="flex justify-between text-xs sm:text-sm font-mono text-white mb-1">
                    <span style={{ color: COLORS.nightBall }}>🌙 {nightPercent}%</span>
                    <span className="text-gray-500 text-[10px] sm:text-xs">TERRITORY</span>
                    <span style={{ color: COLORS.dayAccent }}>☀️ {dayPercent}%</span>
                </div>
                <div className="h-2 sm:h-3 bg-black/50 rounded-full overflow-hidden flex shadow-inner">
                    <div className="h-full transition-all duration-300 ease-out" style={{ width: `${nightPercent}%`, background: COLORS.night }} />
                    <div className="h-full transition-all duration-300 ease-out" style={{ width: `${dayPercent}%`, background: COLORS.day }} />
                </div>
            </div>

            {/* Game Canvas */}
            <div className="relative w-full max-w-[95vw] sm:max-w-md md:max-w-lg aspect-square">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="w-full h-full rounded-lg sm:rounded-xl shadow-2xl border border-white/10 sm:border-2 sm:border-white/20 cursor-none touch-none"
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                    onTouchStart={(e) => e.preventDefault()}
                />

                {/* Streak Indicator - Top-left corner (doesn't block gameplay) */}
                {streak > 0 && !gameOver && (
                    <div
                        className="absolute top-3 left-3 px-3 py-1 rounded-lg text-white font-bold text-xs pointer-events-none transition-all duration-150"
                        style={{
                            background: `rgba(255, ${Math.max(100 - streak * 30, 0)}, 0, ${0.6 + Math.min(streak * 0.1, 0.3)})`,
                            textShadow: '0 0 8px rgba(255, 100, 0, 0.6)'
                        }}
                    >
                        🔥 {streak}x ({(1 + streak * 0.25).toFixed(2)}x)
                    </div>
                )}

                {/* Pause Overlay */}
                {isPaused && !gameOver && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg sm:rounded-xl">
                        <div className="text-center text-white px-4">
                            <p className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">PAUSED</p>
                            <p className="text-gray-400 text-sm">Tap Play to resume</p>
                        </div>
                    </div>
                )}

                {/* Game Over Overlay */}
                {gameOver && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center rounded-lg sm:rounded-xl">
                        <div className="text-center text-white px-4">
                            <p className="text-xl sm:text-2xl text-gray-400 mb-1">⏱️ Time's Up!</p>
                            <p
                                className="text-3xl sm:text-4xl font-black mb-2"
                                style={{ color: playerWon ? '#22c55e' : COLORS.nightBall }}
                            >
                                {playerWon ? '🏆 YOU WIN!' : '😢 YOU LOSE'}
                            </p>
                            <p className="text-gray-400 text-sm mb-2">
                                Final: {dayPercent}% vs {nightPercent}%
                            </p>

                            {/* Stats Display */}
                            {stats && (
                                <div className="text-xs text-gray-500 mb-4 flex gap-3 justify-center">
                                    <span>🏆 {stats.wins}W</span>
                                    <span>📊 {stats.gamesPlayed} games</span>
                                    <span>⭐ Best: {stats.bestScore}%</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                {/* Share */}
                                <button
                                    onClick={handleShare}
                                    disabled={shareStatus === 'sharing'}
                                    className={`px-6 py-3 min-h-[48px] rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95 touch-manipulation flex items-center justify-center gap-2 ${shareStatus === 'copied' ? 'bg-green-600' : 'bg-black border border-white/30'
                                        } disabled:opacity-50`}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    {getShareButtonText()}
                                </button>

                                {/* Play Again */}
                                <button
                                    onClick={handleRestart}
                                    className="btn-gradient px-6 py-3 min-h-[48px] rounded-xl font-bold text-base text-white touch-manipulation flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                        <path d="M21 3v5h-5" />
                                    </svg>
                                    Play Again
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Score Display */}
            <div className="mt-2 sm:mt-4 px-4 sm:px-8 py-2 sm:py-3 bg-black/60 backdrop-blur rounded-full text-white font-mono text-sm sm:text-lg flex gap-3 sm:gap-6 items-center shadow-lg">
                <span style={{ color: COLORS.nightBall }}>{score.night}</span>
                <span className="text-gray-600 text-xs">tiles</span>
                <span style={{ color: COLORS.dayAccent }}>{score.day}</span>
            </div>

            {/* Controls */}
            <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3">
                <button
                    onClick={togglePause}
                    disabled={gameOver}
                    className="px-4 sm:px-5 py-3 sm:py-2 min-h-[44px] min-w-[80px] bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-50 backdrop-blur rounded-full text-white text-sm sm:text-base font-bold transition-all active:scale-95 border border-white/20 touch-manipulation"
                >
                    {isPaused ? '▶️ Play' : '⏸️'}
                </button>
                <button
                    onClick={handleRestart}
                    className="btn-gradient px-4 sm:px-5 py-3 sm:py-2 min-h-[44px] min-w-[80px] rounded-full text-white text-sm sm:text-base font-bold touch-manipulation"
                >
                    🔄
                </button>
            </div>

            {/* Instructions */}
            <div className="mt-2 sm:mt-4 text-gray-400 text-[10px] sm:text-sm text-center max-w-xs sm:max-w-md px-4">
                <p>Conquer more territory in 90 seconds to win!</p>
            </div>

            {/* Difficulty Badge */}
            <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 px-2 sm:px-3 py-1 bg-black/50 backdrop-blur rounded-full text-[10px] sm:text-xs text-gray-400">
                {difficulty}
            </div>
        </div>
    );
};
