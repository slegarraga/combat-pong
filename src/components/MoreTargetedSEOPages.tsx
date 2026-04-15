// Even More SEO Pages - More specific keywords and audiences
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

// =============== KIDS / FAMILY PAGE ===============
export const KidsPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong for Kids - Safe Family Game | Free & Ad-Free';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Safe game for kids! Combat Pong is ad-free, no violence, no chat. Easy controls perfect for children. Family-friendly browser game, play together!');
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
                    <span className="text-5xl mb-4 block">👨‍👩‍👧‍👦</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Combat Pong for Kids & Families
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Safe, fun, and educational gaming
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-green-400 mb-3">✓ Kid-Safe Features</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>No ads</strong> - Zero advertisements or pop-ups</li>
                            <li>• <strong>No violence</strong> - Just colorful balls and tiles</li>
                            <li>• <strong>No chat</strong> - Cannot interact with strangers</li>
                            <li>• <strong>No purchases</strong> - 100% free, nothing to buy</li>
                            <li>• <strong>No account needed</strong> - Play without signing up</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🎮 Easy for Kids to Play</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>One simple control</strong> - Just move left/right</li>
                            <li>• <strong>Touch-friendly</strong> - Works on tablets</li>
                            <li>• <strong>Easy Mode</strong> - Slow balls for beginners</li>
                            <li>• <strong>Short matches</strong> - 90 seconds, perfect attention span</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">📚 Learning Benefits</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>Hand-eye coordination</strong> - Track and react</li>
                            <li>• <strong>Pattern recognition</strong> - Predict ball paths</li>
                            <li>• <strong>Basic math</strong> - Territory percentages</li>
                            <li>• <strong>Focus training</strong> - 90 seconds of concentration</li>
                        </ul>
                    </section>

                    <section className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-purple-400 mb-3">👨‍👩‍👧 Family Game Night</h2>
                        <p className="text-gray-300 text-sm">
                            Take turns trying to beat each other's territory scores!
                            Kids vs parents, sibling competitions - everyone can play.
                            No complex rules to explain, just start and play!
                        </p>
                    </section>
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Start Easy Mode - Perfect for Kids!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== TWO PLAYER / LOCAL MULTIPLAYER PAGE ===============
export const TwoPlayerPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = '2 Player Pong Feel Online - Combat Pong Anonymous Duel | Play Free';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Want a 2-player pong feeling without signup friction? Combat Pong creates an anonymous rival instantly so every match feels like a tense 1v1. Free browser game.');
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
                    <span className="text-5xl mb-4 block">👥</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        2-Player Pong Feel
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Built to feel like a live rival without requiring one.
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-blue-400 mb-3">⚡ Anonymous Duel Energy</h2>
                        <p className="text-gray-300 text-sm mb-3">
                            Combat Pong now creates a convincing 1v1 feeling locally:
                        </p>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>No queue</strong> - Tap play and a rival appears instantly</li>
                            <li>• <strong>Human-style pressure</strong> - The top paddle feints and surges</li>
                            <li>• <strong>Cross-platform</strong> - Desktop and mobile both feel sharp</li>
                            <li>• <strong>Territory swings</strong> - Boards flip fast when streaks spike</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🎮 How 2-Player Works</h2>
                        <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                            <li>Choose a difficulty that matches how brutal you want the duel to feel</li>
                            <li>The game generates a rival alias, title, and signal readout</li>
                            <li>The simulated rival responds like a real opponent under pressure</li>
                            <li>Out-control the board before the 90-second clock expires</li>
                            <li>Run it back instantly if the finish gets ugly</li>
                        </ol>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🏠 Same Room Play</h2>
                        <p className="text-gray-300 text-sm mb-3">
                            Want to bring a real person into the room anyway? Try these options:
                        </p>
                        <ul className="text-gray-400 text-xs space-y-1">
                            <li>• Take turns on the same device and compare board percentage</li>
                            <li>• Put the device on a table and coach each other's rematches</li>
                            <li>• One plays, one coaches - teamwork!</li>
                        </ul>
                    </section>

                    <section className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <h2 className="font-bold text-sm text-yellow-400 mb-2">💡 Two Player Tips</h2>
                        <ul className="text-gray-400 text-xs space-y-1">
                            <li>• Watch your opponent's ball - if it's slow, push harder</li>
                            <li>• Maintain your streak - speed is everything</li>
                            <li>• Stay calm - 90% can flip in final seconds!</li>
                        </ul>
                    </section>
                </div>

                <div className="mt-8 space-y-3">
                    <a href="/" className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation block text-center">
                        Start a Duel Now
                    </a>
                    <button onClick={() => onPlay('MEDIUM')} className="w-full py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/5">
                        Or Practice vs AI First
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== BEST FREE GAMES PAGE ===============
export const BestFreeGamesPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Best Free Browser Games 2025 - Combat Pong | No Download';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Looking for the best free browser games in 2025? Combat Pong delivers instant play, no download, no ads, and a killer anonymous duel loop.');
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
                    <span className="text-5xl mb-4 block">🏆</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Best Free Browser Game 2025
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Why Combat Pong stands out
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-gradient-to-r from-yellow-500/10 to-green-500/10 border border-yellow-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-yellow-400 mb-3">⭐ What Makes a Great Free Game?</h2>
                        <div className="space-y-2">
                            {[
                                { feature: 'Actually Free', check: true, desc: 'No hidden costs, no pay-to-win' },
                                { feature: 'No Ads', check: true, desc: 'Zero interruptions or pop-ups' },
                                { feature: 'Instant Play', check: true, desc: 'No download, no install' },
                                { feature: 'Works Everywhere', check: true, desc: 'Desktop, mobile, tablet' },
                                { feature: 'No Accounts', check: true, desc: 'Anonymous rival mode works instantly' },
                                { feature: 'Regular Updates', check: true, desc: 'New features added' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-black/20 rounded-lg px-3 py-2">
                                    <span className={item.check ? 'text-green-400' : 'text-red-400'}>
                                        {item.check ? '✓' : '✗'}
                                    </span>
                                    <div>
                                        <span className="text-sm font-bold">{item.feature}</span>
                                        <span className="text-gray-500 text-xs ml-2">{item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🎮 Game Features</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>4 Difficulty Modes</strong> - Easy to Nightmare</li>
                            <li>• <strong>90-Second Matches</strong> - Quick, satisfying sessions</li>
                            <li>• <strong>Streak System</strong> - Skill-based speed mechanics</li>
                            <li>• <strong>Territory Control</strong> - Unique conquest gameplay</li>
                            <li>• <strong>Anonymous Duel Mode</strong> - 1v1 pressure with zero login friction</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">📊 By the Numbers</h2>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="text-xl font-bold text-blue-400">0</div>
                                <div className="text-gray-500 text-xs">Ads</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="text-xl font-bold text-green-400">$0</div>
                                <div className="text-gray-500 text-xs">Cost</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="text-xl font-bold text-purple-400">90s</div>
                                <div className="text-gray-500 text-xs">Per Match</div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Try the Best Free Game Now!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== NO DOWNLOAD GAMES PAGE ===============
export const NoDownloadPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'No Download Games - Play Combat Pong Instantly | Browser Game';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'No download needed! Play Combat Pong instantly in your browser. No install, no signup, no waiting. Click and play this free territory control game now!');
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
                        No Download Required
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Click and play instantly
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-green-400 mb-3">✓ Instant Play Benefits</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>No download</strong> - Nothing to install</li>
                            <li>• <strong>No storage space</strong> - Plays in browser</li>
                            <li>• <strong>No waiting</strong> - Loads in seconds</li>
                            <li>• <strong>No updates</strong> - Always latest version</li>
                            <li>• <strong>No malware risk</strong> - Pure web technology</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">💾 No Space Needed</h2>
                        <p className="text-gray-300 text-sm mb-3">
                            Traditional games take up storage:
                        </p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-black/20 rounded-lg px-3 py-2">
                                <span className="text-sm">Mobile Game Apps</span>
                                <span className="text-red-400 text-xs">100MB - 2GB</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/20 rounded-lg px-3 py-2">
                                <span className="text-sm">PC Game Downloads</span>
                                <span className="text-red-400 text-xs">5GB - 100GB+</span>
                            </div>
                            <div className="flex justify-between items-center bg-green-500/20 rounded-lg px-3 py-2">
                                <span className="text-sm font-bold">Combat Pong</span>
                                <span className="text-green-400 text-xs font-bold">0 MB (browser)</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🚀 How It Works</h2>
                        <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                            <li>Open combatpong.com in any browser</li>
                            <li>The game loads automatically (~500KB)</li>
                            <li>Click any difficulty to start playing</li>
                            <li>That's it - no steps, no waiting!</li>
                        </ol>
                    </section>
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Play Instantly - No Download!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== RELAXING / CHILL GAMES PAGE ===============
export const RelaxingPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Relaxing Games Online - Combat Pong Easy Mode | Chill & Play';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Need a relaxing game? Combat Pong Easy Mode: slow pace, satisfying colors, no pressure. Perfect for winding down. Free calming browser game!');
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
                    <span className="text-5xl mb-4 block">😌</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Relaxing Game Experience
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Unwind with satisfying gameplay
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-blue-400 mb-3">🌙 Why Combat Pong is Relaxing</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>Mesmerizing colors</strong> - Watch territory shift</li>
                            <li>• <strong>Smooth animations</strong> - Fluid ball movement</li>
                            <li>• <strong>No pressure</strong> - It's just territory, no lives</li>
                            <li>• <strong>Easy mode</strong> - Slow, comfortable pace</li>
                            <li>• <strong>Satisfying particles</strong> - Pretty visual feedback</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">☕ Perfect For</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• Winding down after work</li>
                            <li>• Light gaming before bed</li>
                            <li>• Casual play while listening to music</li>
                            <li>• De-stressing during breaks</li>
                            <li>• Background activity while thinking</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🎨 Calming Elements</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/20 rounded-lg p-3 text-center">
                                <div className="text-2xl mb-1">🌅</div>
                                <div className="text-xs text-gray-400">Warm Golden Tiles</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3 text-center">
                                <div className="text-2xl mb-1">🌌</div>
                                <div className="text-xs text-gray-400">Cool Blue Tiles</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3 text-center">
                                <div className="text-2xl mb-1">✨</div>
                                <div className="text-xs text-gray-400">Gentle Particles</div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3 text-center">
                                <div className="text-2xl mb-1">🔄</div>
                                <div className="text-xs text-gray-400">Flowing Motion</div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Start Relaxing - Easy Mode
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== FOCUS / CONCENTRATION PAGE ===============
export const FocusPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Games for Focus & Concentration - Combat Pong Brain Training';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Improve focus and concentration with Combat Pong! Track multiple objects, make quick decisions, train your brain. 90-second focus sessions. Free!');
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
                    <span className="text-5xl mb-4 block">🧠</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Train Your Focus
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        90-second concentration sessions
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-purple-400 mb-3">🎯 Focus Skills Trained</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>Sustained attention</strong> - 90 seconds of continuous focus</li>
                            <li>• <strong>Divided attention</strong> - Track multiple balls (Hard mode)</li>
                            <li>• <strong>Quick decision making</strong> - Prioritize threats</li>
                            <li>• <strong>Visual processing</strong> - Fast-moving object tracking</li>
                            <li>• <strong>Motor coordination</strong> - Precise paddle control</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">📈 Progressive Training</h2>
                        <div className="space-y-3">
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm text-green-400">Easy Mode</span>
                                    <span className="text-xs text-gray-500">2 balls, slow</span>
                                </div>
                                <p className="text-gray-500 text-xs">Build basic focus foundation</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm text-yellow-400">Medium Mode</span>
                                    <span className="text-xs text-gray-500">2 balls, normal</span>
                                </div>
                                <p className="text-gray-500 text-xs">Increase processing speed</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm text-orange-400">Hard Mode</span>
                                    <span className="text-xs text-gray-500">4 balls, fast</span>
                                </div>
                                <p className="text-gray-500 text-xs">Train divided attention</p>
                            </div>
                            <div className="bg-black/20 rounded-lg p-3">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm text-red-400">Nightmare</span>
                                    <span className="text-xs text-gray-500">6 balls, chaos</span>
                                </div>
                                <p className="text-gray-500 text-xs">Maximum cognitive load</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">⏱️ Why 90 Seconds?</h2>
                        <p className="text-gray-300 text-sm">
                            Research suggests focused work in short bursts is more effective than long sessions.
                            90 seconds is enough to engage concentration without mental fatigue.
                            Play 3-5 matches for a complete 5-8 minute focus training session!
                        </p>
                    </section>
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Start Focus Training!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};
