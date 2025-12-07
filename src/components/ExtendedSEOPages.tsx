// Extended SEO Pages - Game Mechanics, Controls, Streak System, Mobile Guide
import { useEffect } from 'react';

interface SEOPageProps {
    onBack: () => void;
    onPlay: (mode: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE') => void;
}

// Shared Footer Component
const Footer = () => (
    <footer className="px-4 py-8 mt-8 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
            <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-500 mb-4">
                <a href="/" className="hover:text-white">Home</a>
                <a href="/how-to-play" className="hover:text-white">How to Play</a>
                <a href="/mechanics" className="hover:text-white">Game Mechanics</a>
                <a href="/streak-guide" className="hover:text-white">Streak Guide</a>
                <a href="/tips" className="hover:text-white">Tips</a>
                <a href="/faq" className="hover:text-white">FAQ</a>
            </nav>
            <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-600 mb-4">
                <a href="/mode/easy" className="hover:text-white">Easy</a>
                <a href="/mode/medium" className="hover:text-white">Medium</a>
                <a href="/mode/hard" className="hover:text-white">Hard</a>
                <a href="/mode/nightmare" className="hover:text-white">Nightmare</a>
            </nav>
            <p className="text-gray-700 text-xs">© 2025 Combat Pong</p>
        </div>
    </footer>
);

// =============== GAME MECHANICS PAGE ===============
export const MechanicsPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong Game Mechanics - Speed System, Territory & Streaks Explained';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Deep dive into Combat Pong mechanics: 90-second timer, streak speed system (+0.25x per hit!), dynamic bounce angles, territory conquest. Master the game!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px] touch-manipulation">
                        <span>←</span> <span className="text-sm sm:text-base">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>

            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-4xl font-black mb-6 text-center">
                    Combat Pong Game Mechanics
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
                    Complete guide to how Combat Pong works
                </p>

                {/* Timer System */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-blue-400 flex items-center gap-2">⏱️ 90-Second Timer</h2>
                    <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-3 text-gray-300 text-sm sm:text-base">
                        <p>Every match lasts exactly <span className="text-yellow-400 font-bold">90 seconds</span>. When the timer reaches 0:00:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Territory percentages are calculated</li>
                            <li>Player with <span className="text-green-400">more than 50%</span> territory wins</li>
                            <li>Your stats are updated (wins, games played, best score)</li>
                        </ul>
                        <p className="text-gray-500 text-xs">Timer turns orange at 30 seconds remaining, red at 10 seconds.</p>
                    </div>
                </article>

                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-orange-400 flex items-center gap-2">🔥 Streak Speed System</h2>
                    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 sm:p-6 space-y-4 text-gray-300 text-sm sm:text-base">
                        <p>The <span className="text-orange-400 font-bold">Streak System</span> is the key to winning. Each consecutive paddle hit increases your ball's speed by <span className="text-green-400 font-bold">+0.25x</span>:</p>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-2">
                                <span>1st hit</span>
                                <span className="text-green-400 font-bold">1.25x speed</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-2">
                                <span>2nd hit</span>
                                <span className="text-green-400 font-bold">1.50x speed</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-2">
                                <span>3rd hit</span>
                                <span className="text-green-400 font-bold">1.75x speed</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-2">
                                <span>4th hit</span>
                                <span className="text-green-400 font-bold">2.0x speed (double!)</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-2">
                                <span>8th hit</span>
                                <span className="text-green-400 font-bold">3.0x speed (triple!)</span>
                            </div>
                        </div>

                        <p className="text-red-400 font-semibold">⚠️ Miss a ball (hits bottom wall):</p>
                        <ul className="list-disc list-inside">
                            <li>Ball speed drops to <span className="text-red-400">0.85x</span></li>
                            <li>Streak resets to <span className="text-red-400">0</span></li>
                            <li>Speed multiplier resets - you lose all momentum!</li>
                        </ul>
                    </div>
                </article>

                {/* Territory */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-purple-400 flex items-center gap-2">🗺️ Territory Conquest</h2>
                    <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-3 text-gray-300 text-sm sm:text-base">
                        <p>The board is a grid of tiles. Each tile belongs to either:</p>
                        <div className="flex gap-4 my-3">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ background: '#FCD34D' }}></div>
                                <span className="text-yellow-400">Day (You)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ background: '#1e3a5f' }}></div>
                                <span className="text-blue-400">Night (AI)</span>
                            </div>
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                            <li>When a ball hits an enemy tile, that tile is <span className="text-green-400">conquered</span></li>
                            <li>Faster balls conquer more tiles per second</li>
                            <li>Territory can change hands throughout the match</li>
                        </ul>
                    </div>
                </article>

                {/* Paddle Physics */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-pink-400 flex items-center gap-2">🏓 Dynamic Paddle Physics</h2>
                    <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-3 text-gray-300 text-sm sm:text-base">
                        <p>Bounce angles are <span className="text-pink-400 font-bold">dynamic and unpredictable</span> - affected by multiple factors:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>Paddle position:</strong> Edge hits = sharp angles, center = straighter</li>
                            <li><strong>Random spin:</strong> Each hit has slight random variation</li>
                            <li><strong>Velocity influence:</strong> Current ball momentum affects the angle</li>
                            <li><strong>Streak bonus:</strong> Higher streaks = wilder deflections!</li>
                        </ul>
                        <p className="text-gray-500 text-sm mt-2">This makes the game less predictable and more exciting as your streak builds!</p>
                    </div>
                </article>

                <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                    Apply This Knowledge - Play Now!
                </button>
            </main>

            <Footer />
        </div>
    );
};

// =============== STREAK GUIDE PAGE ===============
export const StreakGuidePage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong Streak Guide - Master the Speed System | Pro Strategy';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Master the Combat Pong streak system! Learn how consecutive paddle hits boost speed by +0.25x each (1st=1.25x, 2nd=1.5x...). Pro strategies for dominating territory.');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px] touch-manipulation">
                        <span>←</span> <span className="text-sm sm:text-base">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>

            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🔥</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Streak System Mastery Guide
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        The secret to winning Combat Pong
                    </p>
                </div>

                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3">What is the Streak System?</h2>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                        The Streak System rewards consistent paddle hits. Each consecutive time you hit a ball with your paddle,
                        it gains <span className="text-orange-400 font-bold">+0.25x speed</span>. This compounds quickly: 1.25x → 1.5x → 1.75x → 2.0x and beyond!
                    </p>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                        <p className="text-orange-400 font-bold text-center text-lg">
                            Speed = 1.0 + (Streak × 0.25)
                        </p>
                    </div>
                </article>

                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3">Streak Speed Multipliers</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                            <div key={n} className="bg-white/5 rounded-lg p-3 text-center">
                                <div className="text-orange-400 font-bold">{n}x Streak</div>
                                <div className="text-green-400 text-lg font-black">{(1 + n * 0.25).toFixed(2)}x</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-3 text-center">Speed boost persists on the ball until you miss!</p>
                </article>

                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-red-400">⚠️ The Miss Penalty</h2>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 sm:p-6 space-y-3 text-gray-300 text-sm sm:text-base">
                        <p>When your ball hits the bottom wall (you missed it):</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Ball speed multiplied by <span className="text-red-400 font-bold">0.85x</span> (slows down)</li>
                            <li>Ball's speed multiplier resets to <span className="text-red-400 font-bold">1.0x</span></li>
                            <li>Your streak counter resets to <span className="text-red-400 font-bold">0</span></li>
                            <li>Red particles burst as a warning</li>
                        </ul>
                        <p className="text-gray-500 text-sm mt-3">
                            A 4-streak ball at 2.0x speed drops to just 0.85x after a miss - that's a 57% speed loss!
                        </p>
                    </div>
                </article>

                {/* Strategies */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3">🎯 Pro Streak Strategies</h2>
                    <div className="space-y-3">
                        {[
                            { title: 'Prioritize paddle hits', desc: 'One miss costs more than multiple safe plays. Always catch the ball.' },
                            { title: 'Center positioning', desc: 'Stay near the middle to reach balls on either side.' },
                            { title: 'Early is better than late', desc: 'Move toward the ball early. Reacting late causes misses.' },
                            { title: 'Build streak early', desc: 'The first 30 seconds are crucial for building momentum.' },
                            { title: 'Protect your streak', desc: 'A 5-streak ball conquers territory twice as fast as a 0-streak.' }
                        ].map((s, i) => (
                            <div key={i} className="bg-white/5 rounded-xl p-4">
                                <h3 className="font-bold text-sm">{s.title}</h3>
                                <p className="text-gray-400 text-xs">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                    Practice Streaks Now
                </button>
            </main>

            <Footer />
        </div>
    );
};

// =============== MOBILE GUIDE PAGE ===============
export const MobileGuidePage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong Mobile Guide - Touch Controls & Tips | Play on Phone';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Play Combat Pong on mobile! Optimized touch controls, responsive design, no app needed. Tips for playing on phone and tablet. Works on iOS and Android.');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px] touch-manipulation">
                        <span>←</span> <span className="text-sm sm:text-base">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>

            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">📱</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Mobile Play Guide
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Combat Pong is fully optimized for mobile
                    </p>
                </div>

                {/* Touch Controls */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-blue-400">👆 Touch Controls</h2>
                    <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-3 text-gray-300 text-sm sm:text-base">
                        <p>Controlling your paddle on mobile is easy:</p>
                        <ol className="list-decimal list-inside space-y-2">
                            <li><strong>Touch anywhere</strong> on the screen</li>
                            <li><strong>Drag left or right</strong> to move the paddle</li>
                            <li>The paddle follows your finger position</li>
                            <li>Release and touch again anytime</li>
                        </ol>
                        <p className="text-gray-500 text-sm mt-3">
                            Pro tip: You don't need to touch the paddle itself - touch anywhere and the paddle moves to that position!
                        </p>
                    </div>
                </article>

                {/* Supported Devices */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-green-400">✅ Supported Devices</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-4">
                            <h3 className="font-bold mb-2">📱 Phones</h3>
                            <ul className="text-gray-400 text-xs space-y-1">
                                <li>✓ iPhone (Safari)</li>
                                <li>✓ Android (Chrome)</li>
                                <li>✓ Any modern phone</li>
                            </ul>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <h3 className="font-bold mb-2">📲 Tablets</h3>
                            <ul className="text-gray-400 text-xs space-y-1">
                                <li>✓ iPad</li>
                                <li>✓ Android tablets</li>
                                <li>✓ Any tablet browser</li>
                            </ul>
                        </div>
                    </div>
                </article>

                {/* Mobile Tips */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-yellow-400">💡 Mobile Tips</h2>
                    <div className="space-y-3">
                        {[
                            { tip: 'Use landscape mode', desc: 'The game is optimized for portrait but works in landscape too' },
                            { tip: 'Disable auto-rotate', desc: 'Prevents accidental rotation during intense moments' },
                            { tip: 'Good lighting', desc: 'Ensure you can see the screen clearly' },
                            { tip: 'Stable grip', desc: 'Hold your phone firmly for precise control' },
                            { tip: 'No app needed', desc: 'Just open combatpong.com in your browser' }
                        ].map((t, i) => (
                            <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                                <span className="text-yellow-400">💡</span>
                                <div>
                                    <p className="font-bold text-sm">{t.tip}</p>
                                    <p className="text-gray-500 text-xs">{t.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                {/* Add to Home Screen */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-purple-400">➕ Add to Home Screen</h2>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-gray-300 text-sm">
                        <p className="mb-3">Make Combat Pong feel like a native app:</p>
                        <p><strong>iPhone:</strong> Safari → Share → Add to Home Screen</p>
                        <p><strong>Android:</strong> Chrome → Menu → Add to Home Screen</p>
                        <p className="text-gray-500 text-xs mt-3">This gives you a fullscreen experience with no browser UI!</p>
                    </div>
                </article>

                <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                    Play on Mobile Now
                </button>
            </main>

            <Footer />
        </div>
    );
};

// =============== CONTROLS PAGE ===============
export const ControlsPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong Controls Guide - Desktop & Mobile | How to Control';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Complete Combat Pong controls guide. Learn mouse controls for desktop, touch controls for mobile, and tips for precise paddle movement.');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px] touch-manipulation">
                        <span>←</span> <span className="text-sm sm:text-base">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>

            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🎮</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Game Controls
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Master your paddle on any device
                    </p>
                </div>

                {/* Desktop */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-blue-400">🖱️ Desktop Controls</h2>
                    <div className="bg-white/5 rounded-xl p-4 sm:p-6 text-gray-300 text-sm sm:text-base">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-700 px-4 py-2 rounded-lg font-mono">Mouse</div>
                                <span>Move left/right to control paddle position</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-700 px-4 py-2 rounded-lg font-mono">⏸️ Button</div>
                                <span>Pause/resume the game</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-700 px-4 py-2 rounded-lg font-mono">🔄 Button</div>
                                <span>Restart the match</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-xs mt-4">
                            The paddle follows your cursor position - no clicking required!
                        </p>
                    </div>
                </article>

                {/* Mobile */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-green-400">👆 Mobile Controls</h2>
                    <div className="bg-white/5 rounded-xl p-4 sm:p-6 text-gray-300 text-sm sm:text-base">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-700 px-4 py-2 rounded-lg font-mono text-xl">👆↔️</div>
                                <span>Touch and drag anywhere on screen</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-700 px-4 py-2 rounded-lg font-mono">Tap ⏸️</div>
                                <span>Pause/resume the game</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-700 px-4 py-2 rounded-lg font-mono">Tap 🔄</div>
                                <span>Restart the match</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-xs mt-4">
                            The paddle moves to your finger position - very responsive!
                        </p>
                    </div>
                </article>

                {/* Tips */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-xl font-bold mb-3 text-yellow-400">💡 Control Tips</h2>
                    <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-400">💡</span>
                            <span>Small, precise movements beat large sweeping motions</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-400">💡</span>
                            <span>Return to center position after each hit</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-400">💡</span>
                            <span>Anticipate ball trajectories instead of reacting late</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-400">💡</span>
                            <span>Use paddle edges for angled shots toward enemy territory</span>
                        </li>
                    </ul>
                </article>

                <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                    Practice Your Controls
                </button>
            </main>

            <Footer />
        </div>
    );
};
