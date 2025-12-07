// More SEO Pages - Targeting specific audiences and long-tail keywords
import { useEffect } from 'react';

interface SEOPageProps {
    onBack: () => void;
    onPlay: (mode: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE') => void;
}

// Shared Footer
const Footer = () => (
    <footer className="px-4 py-8 mt-8 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
            <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-500 mb-4">
                <a href="/" className="hover:text-white">Home</a>
                <a href="/how-to-play" className="hover:text-white">How to Play</a>
                <a href="/tips" className="hover:text-white">Tips</a>
                <a href="/faq" className="hover:text-white">FAQ</a>
            </nav>
            <p className="text-gray-700 text-xs">© 2025 Combat Pong</p>
        </div>
    </footer>
);

// =============== UNBLOCKED GAMES / SCHOOL PAGE ===============
export const UnblockedPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong Unblocked - Play at School or Work | Free Browser Game';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Play Combat Pong unblocked at school or work! No download, no install, works on any browser. Fast-loading territory game perfect for quick breaks. 100% free!');
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
                    <span className="text-5xl mb-4 block">🎓</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Combat Pong Unblocked
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Play anywhere - school, work, or home!
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-green-400 mb-3">✓ Why Combat Pong Works Everywhere</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>No download required</strong> - Plays directly in browser</li>
                            <li>• <strong>No plugins</strong> - Pure HTML5, no Flash or Java</li>
                            <li>• <strong>Lightweight</strong> - Under 500KB, loads in seconds</li>
                            <li>• <strong>HTTPS secured</strong> - Works on most networks</li>
                            <li>• <strong>No account needed</strong> - Play instantly as guest</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">⏱️ Perfect for Short Breaks</h2>
                        <p className="text-gray-300 text-sm mb-3">
                            Each Combat Pong match lasts exactly <span className="text-yellow-400 font-bold">90 seconds</span>.
                            Perfect for:
                        </p>
                        <ul className="text-gray-400 text-xs space-y-1">
                            <li>• Lunch breaks at school</li>
                            <li>• Quick work break between tasks</li>
                            <li>• Waiting for a meeting to start</li>
                            <li>• Study breaks (proven to improve focus!)</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">📱 Works on All Devices</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="text-gray-300">
                                <p className="font-bold">💻 School Computers</p>
                                <p className="text-gray-500 text-xs">Chrome, Edge, Firefox</p>
                            </div>
                            <div className="text-gray-300">
                                <p className="font-bold">📱 Personal Phones</p>
                                <p className="text-gray-500 text-xs">iOS Safari, Android Chrome</p>
                            </div>
                            <div className="text-gray-300">
                                <p className="font-bold">📲 Tablets</p>
                                <p className="text-gray-500 text-xs">iPad, Android tablets</p>
                            </div>
                            <div className="text-gray-300">
                                <p className="font-bold">🖥️ Chromebooks</p>
                                <p className="text-gray-500 text-xs">Full support</p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Play Unblocked Now - Free!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== WORK BREAK / QUICK GAMES PAGE ===============
export const WorkBreakPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Quick Work Break Games - Combat Pong 90-Second Matches | Play Free';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Need a quick work break? Combat Pong: 90-second matches perfect for short breaks. Refresh your mind, improve focus. No download browser game!');
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
                    <span className="text-5xl mb-4 block">☕</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Perfect Work Break Game
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        90 seconds to recharge your brain
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🧠 Why Short Game Breaks Help</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>Mental reset</strong> - Briefly shift focus to refresh cognitive resources</li>
                            <li>• <strong>Stress relief</strong> - Light gaming reduces cortisol levels</li>
                            <li>• <strong>Improved focus</strong> - Return to work with renewed concentration</li>
                            <li>• <strong>Eye rest</strong> - Different visual focus than spreadsheets!</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">⏱️ Fits Any Break Length</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                                <span className="text-sm">2-Minute Break</span>
                                <span className="text-green-400 text-xs">1 match</span>
                            </div>
                            <div className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                                <span className="text-sm">5-Minute Break</span>
                                <span className="text-green-400 text-xs">2-3 matches</span>
                            </div>
                            <div className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
                                <span className="text-sm">15-Minute Break</span>
                                <span className="text-green-400 text-xs">Practice all modes!</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">💼 Work-Friendly Features</h2>
                        <ul className="text-gray-300 text-sm space-y-1">
                            <li>✓ No sound by default</li>
                            <li>✓ Pause anytime with one click</li>
                            <li>✓ Closes instantly - nothing to save</li>
                            <li>✓ No account or login required</li>
                            <li>✓ Won't drain laptop battery</li>
                        </ul>
                    </section>
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Take a Quick Break - Play Now!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== REACTION TIME / REFLEXES PAGE ===============
export const ReactionTimePage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Improve Reaction Time & Reflexes - Combat Pong Training | Free Game';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Train your reaction time and reflexes with Combat Pong! Fast-paced paddle game, multiple difficulty levels. Perfect for gamers, athletes, and anyone wanting sharper reflexes.');
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
                    <span className="text-5xl mb-4 block">⚡</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Train Your Reflexes
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Sharpen reaction time through gameplay
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-yellow-400 mb-3">🎯 How Combat Pong Trains Reflexes</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>Visual tracking</strong> - Follow multiple fast-moving objects</li>
                            <li>• <strong>Quick decisions</strong> - Prioritize which ball to catch</li>
                            <li>• <strong>Hand-eye coordination</strong> - Precise paddle positioning</li>
                            <li>• <strong>Progressive difficulty</strong> - Start slow, scale to chaos</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">📈 Training Progression</h2>
                        <div className="space-y-3">
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm">Week 1-2: Easy Mode</span>
                                    <span className="text-green-400 text-xs">Foundation</span>
                                </div>
                                <p className="text-gray-500 text-xs">Build basic tracking skills with 2 slow balls</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm">Week 3-4: Medium Mode</span>
                                    <span className="text-yellow-400 text-xs">Speed Training</span>
                                </div>
                                <p className="text-gray-500 text-xs">Increase reaction speed with normal velocity</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm">Week 5+: Hard/Nightmare</span>
                                    <span className="text-red-400 text-xs">Elite Reflexes</span>
                                </div>
                                <p className="text-gray-500 text-xs">4-6 fast balls = maximum reflex challenge</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🏆 Who Benefits</h2>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-black/20 rounded-lg p-2 text-center">
                                <span className="block text-lg">🎮</span>
                                <span className="text-gray-400 text-xs">Gamers</span>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 text-center">
                                <span className="block text-lg">⚽</span>
                                <span className="text-gray-400 text-xs">Athletes</span>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 text-center">
                                <span className="block text-lg">🚗</span>
                                <span className="text-gray-400 text-xs">Drivers</span>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 text-center">
                                <span className="block text-lg">👴</span>
                                <span className="text-gray-400 text-xs">Seniors</span>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Start Reflex Training - Free!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== OFFLINE / NO INTERNET PAGE ===============
export const OfflinePage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong - Works Offline After First Load | No Internet Game';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Play Combat Pong without internet! After first load, the game works offline. Perfect for flights, commutes, areas with poor WiFi. Single player vs AI!');
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
                    <span className="text-5xl mb-4 block">📴</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Play Without Internet
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Combat Pong works offline after loading once
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-green-400 mb-3">✓ Offline-Capable</h2>
                        <p className="text-gray-300 text-sm mb-3">
                            Combat Pong is built as a <strong>Progressive Web App (PWA)</strong>.
                            After your first visit, the game caches locally and works without internet!
                        </p>
                        <ul className="text-gray-400 text-xs space-y-1">
                            <li>• Single-player vs AI works fully offline</li>
                            <li>• All 4 difficulty modes available</li>
                            <li>• No data connection needed after first load</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">✈️ Perfect For</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>Airplane mode</strong> - Entertainment on flights</li>
                            <li>• <strong>Subway/Metro</strong> - Underground commutes</li>
                            <li>• <strong>Rural areas</strong> - Poor or no signal</li>
                            <li>• <strong>Data saving</strong> - No streaming required</li>
                            <li>• <strong>Waiting rooms</strong> - Play anywhere</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">📲 Add to Home Screen</h2>
                        <p className="text-gray-300 text-sm mb-3">
                            For the best offline experience, add Combat Pong to your home screen:
                        </p>
                        <div className="space-y-2 text-gray-400 text-xs">
                            <p><strong>iPhone:</strong> Safari → Share → Add to Home Screen</p>
                            <p><strong>Android:</strong> Chrome → Menu → Add to Home Screen</p>
                        </div>
                    </section>

                    <section className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <p className="text-yellow-400 text-xs">
                            ⚠️ Note: Multiplayer mode requires internet connection. Single-player works fully offline.
                        </p>
                    </section>
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Load Game Now (Then Play Offline!)
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== ARCADE / RETRO GAMES PAGE ===============
export const ArcadePage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Free Arcade Games Online - Combat Pong | Retro Arcade Style';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Love arcade games? Play Combat Pong free! Modern take on classic Pong with retro arcade vibes. Fast action, simple controls, addictive gameplay. No coins needed!');
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
                    <span className="text-5xl mb-4 block">👾</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Free Arcade Game Online
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Classic arcade vibes, modern gameplay
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🕹️ What Makes an Arcade Game?</h2>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-green-400">✓</span>
                                <span className="text-gray-300 text-sm">Easy to learn, hard to master</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-green-400">✓</span>
                                <span className="text-gray-300 text-sm">Quick play sessions</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-green-400">✓</span>
                                <span className="text-gray-300 text-sm">Addictive "one more game" feeling</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-green-400">✓</span>
                                <span className="text-gray-300 text-sm">Score chasing / high score focus</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-green-400">✓</span>
                                <span className="text-gray-300 text-sm">Simple controls</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-xs mt-3">Combat Pong has all of these! 👆</p>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🎮 Arcade Game Features</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-black/20 rounded-lg p-3">
                                <p className="font-bold text-yellow-400">90-Second Rounds</p>
                                <p className="text-gray-500 text-xs">Like arcade quarter play</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                                <p className="font-bold text-blue-400">4 Difficulties</p>
                                <p className="text-gray-500 text-xs">Easy to Nightmare</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                                <p className="font-bold text-green-400">Streak System</p>
                                <p className="text-gray-500 text-xs">Combo mechanics</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                                <p className="font-bold text-pink-400">Territory %</p>
                                <p className="text-gray-500 text-xs">High score tracking</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🏆 Classic Arcade Inspiration</h2>
                        <p className="text-gray-300 text-sm">
                            Combat Pong is a spiritual successor to the games that started it all:
                        </p>
                        <ul className="text-gray-500 text-xs mt-2 space-y-1">
                            <li>• Pong (1972) - The original paddle game</li>
                            <li>• Breakout (1976) - Brick-breaking action</li>
                            <li>• Arkanoid (1986) - Enhanced paddle gameplay</li>
                            <li>• Pong Wars (2024) - Territory visualization</li>
                        </ul>
                    </section>
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Play Arcade Mode - No Coins Needed!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== ACCESSIBILITY PAGE ===============
export const AccessibilityPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong Accessibility - Inclusive Gaming | Play Free';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Combat Pong is designed for everyone! Simple controls, clear visuals, adjustable difficulty. Accessible gaming for all skill levels and abilities.');
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
                    <span className="text-5xl mb-4 block">♿</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Accessibility
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Combat Pong is designed for everyone
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-blue-400 mb-3">🎮 Simple Controls</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>One-axis movement only</strong> - Left and right, no complex inputs</li>
                            <li>• <strong>Mouse or touch</strong> - Works with preferred input method</li>
                            <li>• <strong>No button combos</strong> - Just move the paddle</li>
                            <li>• <strong>Pause anytime</strong> - Take breaks when needed</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-green-400 mb-3">👁️ Visual Design</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>High contrast colors</strong> - Yellow/gold vs dark blue</li>
                            <li>• <strong>Large game elements</strong> - Easy to see paddles and balls</li>
                            <li>• <strong>Clear score display</strong> - Always visible percentages</li>
                            <li>• <strong>Particle feedback</strong> - Visual confirmation of hits</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-yellow-400 mb-3">⚙️ Adjustable Difficulty</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>Easy Mode</strong> - 2 slow balls, comfortable pace</li>
                            <li>• <strong>Medium Mode</strong> - Balanced challenge</li>
                            <li>• <strong>Hard/Nightmare</strong> - For those seeking intensity</li>
                            <li>• <strong>Practice without penalty</strong> - No lives, just territory</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-purple-400 mb-3">📱 Device Flexibility</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• Works on any screen size</li>
                            <li>• Responsive touch controls</li>
                            <li>• No required audio</li>
                            <li>• Minimal data usage</li>
                        </ul>
                    </section>
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Try Easy Mode - Accessible Fun!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};
