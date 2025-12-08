// Final SEO Pages - Additional long-tail keyword coverage
import { useEffect } from 'react';
import { SEOFooter } from './SEOFooter';

interface SEOPageProps {
    onBack: () => void;
    onPlay: (mode: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE') => void;
}

// =============== BORED / BOREDOM BUSTER PAGE ===============
export const BoredPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Games When Bored - Combat Pong Boredom Buster | Free Online';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Bored? Play Combat Pong! Instant entertainment, no download. 90-second matches perfect for killing boredom. Free browser game plays anywhere!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]">
                        <span>←</span> <span className="text-sm">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">😐</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Bored? We Got You!</h1>
                    <p className="text-gray-400">Instant cure for boredom - 90 seconds at a time</p>
                </div>
                <div className="space-y-6">
                    <section className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🎮 Why Combat Pong Beats Boredom</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>Instant play</strong> - No download, no signup, no waiting</li>
                            <li>• <strong>90-second matches</strong> - Quick dopamine hits</li>
                            <li>• <strong>Addictive gameplay</strong> - "One more game" guaranteed</li>
                            <li>• <strong>4 difficulty modes</strong> - Never gets stale</li>
                        </ul>
                    </section>
                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">⚡ Beat Boredom In Seconds</h2>
                        <p className="text-gray-300 text-sm">Click play below and you'll be conquering territory in under 3 seconds. No loading screens, no tutorials to skip - just instant action.</p>
                    </section>
                </div>
                <div className="mt-8">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">
                        Cure Your Boredom - Play Now!
                    </button>
                </div>
                <nav className="mt-6 text-center text-xs text-gray-500">
                    <span>Related: </span>
                    <a href="/quick-games" className="hover:text-white mx-1">Quick Games</a> •
                    <a href="/addictive" className="hover:text-white mx-1">Addictive Games</a> •
                    <a href="/relaxing" className="hover:text-white mx-1">Relaxing Games</a>
                </nav>
            </main>
            <SEOFooter currentPage="/bored" />
        </div>
    );
};

// =============== WAITING ROOM PAGE ===============
export const WaitingRoomPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Waiting Room Games - Kill Time with Combat Pong | Free';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Stuck waiting? Play Combat Pong! Perfect for waiting rooms, queues, appointments. 90-second matches, works on phone. Free browser game!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]">
                        <span>←</span> <span className="text-sm">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">⏳</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Waiting Room Games</h1>
                    <p className="text-gray-400">Make wait times fly by</p>
                </div>
                <div className="space-y-6">
                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">🏥 Perfect For</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• Doctor's office waiting rooms</li>
                            <li>• Airport terminals & gate delays</li>
                            <li>• DMV lines</li>
                            <li>• Waiting for food orders</li>
                            <li>• Any boring queue!</li>
                        </ul>
                    </section>
                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">📱 Works On Your Phone</h2>
                        <p className="text-gray-300 text-sm">No app to download. Open in Safari or Chrome, play instantly. Touch controls optimized for mobile.</p>
                    </section>
                </div>
                <div className="mt-8">
                    <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">
                        Kill Time Now - Play Free!
                    </button>
                </div>
            </main>
            <SEOFooter currentPage="/waiting-room" />
        </div>
    );
};

// =============== LUNCH BREAK PAGE ===============
export const LunchBreakPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Lunch Break Games - Combat Pong | Quick Office Game';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Perfect lunch break game! Combat Pong: 90-second matches, no sound by default, pause anytime. Recharge during your break. Free browser game!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]">
                        <span>←</span> <span className="text-sm">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🍔</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Lunch Break Gaming</h1>
                    <p className="text-gray-400">Recharge your brain in 90 seconds</p>
                </div>
                <div className="space-y-6">
                    <section className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-green-400 mb-3">✓ Office-Friendly</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• No sound by default</li>
                            <li>• Pause/close instantly</li>
                            <li>• Won't drain battery</li>
                            <li>• No awkward game-over sounds</li>
                        </ul>
                    </section>
                </div>
                <div className="mt-8">
                    <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">
                        Take a Break - Play Now!
                    </button>
                </div>
            </main>
            <SEOFooter currentPage="/lunch-break" />
        </div>
    );
};

// =============== QUICK GAMES PAGE ===============
export const QuickGamesPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Quick Games Online - 5 Minute Games Free | Combat Pong';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Need a quick game? Combat Pong: 90-second matches, instant play. Perfect for 5-minute gaming sessions. Free, no download browser game!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]">
                        <span>←</span> <span className="text-sm">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">⚡</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Quick Games Online</h1>
                    <p className="text-gray-400">90-second matches = perfect quick gaming</p>
                </div>
                <div className="space-y-6">
                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">⏱️ Fits Any Schedule</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between bg-black/20 rounded-lg px-3 py-2">
                                <span>1 quick game</span><span className="text-green-400">90 seconds</span>
                            </div>
                            <div className="flex justify-between bg-black/20 rounded-lg px-3 py-2">
                                <span>3 games</span><span className="text-green-400">~5 minutes</span>
                            </div>
                            <div className="flex justify-between bg-black/20 rounded-lg px-3 py-2">
                                <span>Full session</span><span className="text-green-400">~15 minutes</span>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="mt-8">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">
                        Play Quick Game Now!
                    </button>
                </div>
            </main>
            <SEOFooter currentPage="/quick-games" />
        </div>
    );
};

// =============== ADDICTIVE GAMES PAGE ===============
export const AddictivePage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Addictive Browser Games - Combat Pong | One More Game!';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Warning: Combat Pong is addictive! Territory conquest, streak combos, 90-second matches. You\'ll say "one more game" every time. Free browser game!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]">
                        <span>←</span> <span className="text-sm">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🎰</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Addictive Games Online</h1>
                    <p className="text-gray-400">⚠️ You've been warned: highly addictive!</p>
                </div>
                <div className="space-y-6">
                    <section className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg text-orange-400 mb-3">🔥 Why It's Addictive</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>Streak system</strong> - Building combos feels amazing</li>
                            <li>• <strong>Territory conquest</strong> - Watch your color spread</li>
                            <li>• <strong>Quick matches</strong> - "Just one more" is easy</li>
                            <li>• <strong>Skill ceiling</strong> - Always room to improve</li>
                        </ul>
                    </section>
                </div>
                <div className="mt-8">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">
                        Get Addicted - Play Free!
                    </button>
                </div>
            </main>
            <SEOFooter currentPage="/addictive" />
        </div>
    );
};

// =============== SOLO GAMES PAGE ===============
export const SoloPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Solo Games Online - Single Player Browser Games | Combat Pong';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Play solo! Combat Pong single-player vs AI. No waiting for opponents, play anytime. 4 difficulty levels, 90-second matches. Free browser game!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]">
                        <span>←</span> <span className="text-sm">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">👤</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Solo Games Online</h1>
                    <p className="text-gray-400">Single player perfection - no waiting</p>
                </div>
                <div className="space-y-6">
                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="font-bold text-lg mb-3">✓ Solo Player Benefits</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• Play instantly - no matchmaking wait</li>
                            <li>• Pause anytime - life happens</li>
                            <li>• No internet needed after loading</li>
                            <li>• 4 AI difficulty levels</li>
                        </ul>
                    </section>
                </div>
                <div className="mt-8">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">
                        Play Solo Now!
                    </button>
                </div>
            </main>
            <SEOFooter currentPage="/solo" />
        </div>
    );
};

// =============== BALL GAMES PAGE ===============
export const BallGamesPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Ball Games Online Free - Bouncing Ball Game | Combat Pong';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Free ball games online! Combat Pong: bouncing balls, territory conquest. Classic ball game mechanics with modern twist. Play in browser!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]"><span>←</span> <span className="text-sm">Menu</span></button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">⚽</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Ball Games Online</h1>
                    <p className="text-gray-400">Bouncing ball action meets territory conquest</p>
                </div>
                <section className="bg-white/5 rounded-xl p-4 sm:p-6 mb-6">
                    <h2 className="font-bold text-lg mb-3">🎱 Ball Game Features</h2>
                    <ul className="text-gray-300 text-sm space-y-2">
                        <li>• Multiple bouncing balls (2-6 depending on mode)</li>
                        <li>• Dynamic speed system - balls speed up with streaks</li>
                        <li>• Territory conquest through ball bounces</li>
                        <li>• Physics-based paddle deflection</li>
                    </ul>
                </section>
                <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">Play Ball Games Free!</button>
            </main>
            <SEOFooter currentPage="/ball-games" />
        </div>
    );
};

// =============== RETRO GAMING PAGE ===============
export const RetroPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Retro Games Online Free - Classic Gaming | Combat Pong';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Love retro games? Combat Pong brings classic Pong vibes with modern gameplay. Nostalgic arcade feel, play free in browser!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]"><span>←</span> <span className="text-sm">Menu</span></button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🕹️</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Retro Games Online</h1>
                    <p className="text-gray-400">Classic arcade vibes, modern browser gameplay</p>
                </div>
                <section className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 sm:p-6 mb-6">
                    <h2 className="font-bold text-lg mb-3">🎮 Retro DNA</h2>
                    <ul className="text-gray-300 text-sm space-y-2">
                        <li>• Inspired by 1972 Atari Pong</li>
                        <li>• Simple controls like classic arcade</li>
                        <li>• Score-chasing gameplay</li>
                        <li>• "One more game" addictiveness</li>
                    </ul>
                </section>
                <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">Play Retro Style!</button>
                <nav className="mt-6 text-center text-xs text-gray-500">
                    <a href="/history" className="hover:text-white mx-1">📜 Pong History</a> •
                    <a href="/arcade" className="hover:text-white mx-1">👾 Arcade Games</a>
                </nav>
            </main>
            <SEOFooter currentPage="/retro" />
        </div>
    );
};

// =============== PADDLE GAMES PAGE ===============
export const PaddleGamesPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Paddle Games Online - Paddle Ball Free | Combat Pong';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Classic paddle games online! Control your paddle, deflect balls, conquer territory. Free browser paddle game with modern twist!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]"><span>←</span> <span className="text-sm">Menu</span></button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🏓</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Paddle Games Online</h1>
                    <p className="text-gray-400">Master paddle control, conquer territory</p>
                </div>
                <section className="bg-white/5 rounded-xl p-4 sm:p-6 mb-6">
                    <h2 className="font-bold text-lg mb-3">🏓 Paddle Mechanics</h2>
                    <ul className="text-gray-300 text-sm space-y-2">
                        <li>• Responsive paddle follows mouse/touch</li>
                        <li>• Paddle position affects bounce angle</li>
                        <li>• Edge hits = sharp angles</li>
                        <li>• Center hits = straight returns</li>
                    </ul>
                </section>
                <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">Play Paddle Game!</button>
            </main>
            <SEOFooter currentPage="/paddle-games" />
        </div>
    );
};

// =============== TERRITORY GAMES PAGE ===============
export const TerritoryPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Territory Games Online - Territory Control Free | Combat Pong';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Territory conquest game! Watch your color spread across the board. Strategic territory control meets arcade action. Free browser game!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]"><span>←</span> <span className="text-sm">Menu</span></button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🗺️</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Territory Games</h1>
                    <p className="text-gray-400">Conquer the board, claim your domain</p>
                </div>
                <section className="bg-gradient-to-r from-yellow-500/10 to-blue-500/10 border border-yellow-500/20 rounded-xl p-4 sm:p-6 mb-6">
                    <h2 className="font-bold text-lg mb-3">🗺️ How Territory Works</h2>
                    <ul className="text-gray-300 text-sm space-y-2">
                        <li>• Board split into Day ☀️ and Night 🌙 tiles</li>
                        <li>• Your balls convert enemy tiles on contact</li>
                        <li>• Faster balls conquer more territory</li>
                        <li>• 50%+ territory at 0:00 = Victory!</li>
                    </ul>
                </section>
                <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">Conquer Territory Now!</button>
            </main>
            <SEOFooter currentPage="/territory" />
        </div>
    );
};

// =============== TIMER GAMES PAGE ===============
export const TimerGamesPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Timer Games Online - Timed Challenges Free | Combat Pong';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Love timed challenges? Combat Pong: 90-second matches create exciting pressure. Race against the clock! Free browser timer game!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]"><span>←</span> <span className="text-sm">Menu</span></button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">⏱️</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Timer Games Online</h1>
                    <p className="text-gray-400">90 seconds of pure adrenaline</p>
                </div>
                <section className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 sm:p-6 mb-6">
                    <h2 className="font-bold text-lg text-red-400 mb-3">⏱️ The Clock is Ticking</h2>
                    <ul className="text-gray-300 text-sm space-y-2">
                        <li>• Every match is exactly 90 seconds</li>
                        <li>• Timer turns orange at 30s, red at 10s</li>
                        <li>• Most territory when time hits 0:00 wins</li>
                        <li>• Creates exciting comeback potential</li>
                    </ul>
                </section>
                <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">Beat The Clock!</button>
            </main>
            <SEOFooter currentPage="/timer-games" />
        </div>
    );
};

// =============== SKILL GAMES PAGE ===============
export const SkillGamesPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Skill Games Online - Skill-Based Browser Games | Combat Pong';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Skill-based gaming! Combat Pong rewards reflexes, precision, and strategy. No luck, pure skill. Free browser game for competitive players!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white min-h-[44px]"><span>←</span> <span className="text-sm">Menu</span></button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">🎯</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">Skill Games Online</h1>
                    <p className="text-gray-400">Pure skill, zero luck</p>
                </div>
                <section className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-6 mb-6">
                    <h2 className="font-bold text-lg text-blue-400 mb-3">🎯 Skills Tested</h2>
                    <ul className="text-gray-300 text-sm space-y-2">
                        <li>• <strong>Reflexes</strong> - React to fast-moving balls</li>
                        <li>• <strong>Precision</strong> - Exact paddle positioning</li>
                        <li>• <strong>Tracking</strong> - Follow multiple objects</li>
                        <li>• <strong>Strategy</strong> - Manage streaks wisely</li>
                    </ul>
                </section>
                <button onClick={() => onPlay('HARD')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white">Test Your Skills!</button>
                <nav className="mt-6 text-center text-xs text-gray-500">
                    <a href="/reaction-time" className="hover:text-white mx-1">⚡ Reflex Training</a> •
                    <a href="/challenge" className="hover:text-white mx-1">🏆 Challenges</a>
                </nav>
            </main>
            <SEOFooter currentPage="/skill-games" />
        </div>
    );
};
