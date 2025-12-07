// Additional SEO Pages - More long-tail keyword coverage
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
                <a href="/mechanics" className="hover:text-white">Mechanics</a>
                <a href="/tips" className="hover:text-white">Tips</a>
                <a href="/faq" className="hover:text-white">FAQ</a>
                <a href="/challenge" className="hover:text-white">Challenge</a>
            </nav>
            <p className="text-gray-700 text-xs">© 2025 Combat Pong</p>
        </div>
    </footer>
);

// =============== PONG HISTORY PAGE ===============
export const PongHistoryPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Pong Game History - From 1972 to Combat Pong | Free Browser Game';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Explore the history of Pong from 1972 Atari classic to modern Combat Pong. See how the iconic game evolved into a territory control battle. Play free online!');
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
                    The History of Pong Games
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
                    From arcade cabinets to browser battles
                </p>

                <article className="space-y-6 text-gray-300 text-sm sm:text-base leading-relaxed">
                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="text-xl font-bold text-white mb-3">🕹️ 1972: The Birth of Pong</h2>
                        <p>
                            Atari's Pong became one of the first commercially successful video games.
                            The simple concept—two paddles bouncing a ball—captivated millions and launched
                            the video game industry. Its success proved games could be mainstream entertainment.
                        </p>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="text-xl font-bold text-white mb-3">🎮 1980s-2000s: Pong Clones Evolve</h2>
                        <p>
                            Countless variations emerged: Breakout, Arkanoid, and hundreds of home console versions.
                            Each added new mechanics—power-ups, multiple balls, brick-breaking—but the core
                            paddle-and-ball gameplay remained iconic.
                        </p>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="text-xl font-bold text-white mb-3">🌐 2024: Pong Wars Goes Viral</h2>
                        <p>
                            The "Pong Wars" concept—autonomous balls battling for territory—captivated
                            millions on social media. The mesmerizing visualization of Day vs Night tiles
                            inspired a new generation of Pong-inspired games.
                        </p>
                    </section>

                    <section className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="text-xl font-bold text-white mb-3">⚔️ 2025: Combat Pong</h2>
                        <p>
                            Combat Pong takes the Pong Wars concept and makes it <span className="text-yellow-400 font-bold">playable</span>.
                            We added paddle control, the streak speed system (+0.25x per hit), dynamic bounce angles,
                            and 90-second timed matches. The result? A skill-based territory battle that's
                            both nostalgic and fresh.
                        </p>
                    </section>
                </article>

                <div className="mt-8">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Experience Modern Pong - Play Free!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== CHALLENGE PAGE ===============
export const ChallengePage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong Challenge - Test Your Skills | Daily Challenge';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Take the Combat Pong Challenge! Can you beat Nightmare mode? Reach a 10-streak combo? Conquer 80%+ territory? Test your skills in this free browser game!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    const challenges = [
        { name: 'Streak Master', desc: 'Reach a 10-hit streak combo', difficulty: 'Medium', reward: '🥉' },
        { name: 'Speed Demon', desc: 'Get your ball to 3.0x speed (8 streak)', difficulty: 'Hard', reward: '🥈' },
        { name: 'Territory King', desc: 'Win with 80%+ territory', difficulty: 'Hard', reward: '🥈' },
        { name: 'Nightmare Survivor', desc: 'Win a Nightmare mode match', difficulty: 'Extreme', reward: '🥇' },
        { name: 'Perfect Game', desc: 'Win without missing a single ball', difficulty: 'Legendary', reward: '🏆' },
        { name: 'Multi-Ball Master', desc: 'Maintain 5+ streak in Hard mode', difficulty: 'Hard', reward: '🥈' },
    ];

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
                        Combat Pong Challenges
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Test your skills with these epic challenges!
                    </p>
                </div>

                <div className="space-y-3 mb-8">
                    {challenges.map((c, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <span>{c.reward}</span> {c.name}
                                </h3>
                                <p className="text-gray-400 text-xs">{c.desc}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${c.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    c.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-400' :
                                        c.difficulty === 'Extreme' ? 'bg-red-500/20 text-red-400' :
                                            'bg-purple-500/20 text-purple-400'
                                }`}>
                                {c.difficulty}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
                    <h2 className="font-bold mb-2">💡 Challenge Tips</h2>
                    <ul className="text-gray-400 text-xs space-y-1">
                        <li>• Start with Easy mode to practice streak combos</li>
                        <li>• Center positioning is key for not missing balls</li>
                        <li>• Higher streaks make balls faster AND bounce wilder</li>
                    </ul>
                </div>

                <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                    Start Challenge Mode
                </button>
            </main>

            <Footer />
        </div>
    );
};

// =============== HIGH SCORE STRATEGY PAGE ===============
export const HighScorePage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong High Score Strategy - Win Every Game | Pro Guide';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Learn how to get high scores in Combat Pong! Pro strategies for territory control, streak building, and beating the AI. Master the 90-second battle!');
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
                    High Score Strategy Guide
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
                    Dominate with 80%+ territory every game
                </p>

                <article className="space-y-6">
                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="text-lg font-bold text-yellow-400 mb-3">⏱️ Phase 1: First 30 Seconds</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• <strong>Build your streak immediately</strong> - Every hit = +0.25x speed</li>
                            <li>• Focus on consistency over aggression</li>
                            <li>• Get to 4+ streak (2.0x speed) before pushing territory</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="text-lg font-bold text-blue-400 mb-3">⚔️ Phase 2: Middle 30 Seconds</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• Maintain streak - your fast ball is conquering territory</li>
                            <li>• Use paddle edges to angle balls toward enemy territory</li>
                            <li>• Watch the AI's ball - if it's slow, you're winning</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="text-lg font-bold text-green-400 mb-3">🏆 Phase 3: Final 30 Seconds</h2>
                        <ul className="text-gray-300 text-sm space-y-2">
                            <li>• Check the score - if ahead, play defensive</li>
                            <li>• If behind, take risks to hit more balls</li>
                            <li>• Never miss in the final 10 seconds - protect your lead!</li>
                        </ul>
                    </section>

                    <section className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 sm:p-6">
                        <h2 className="text-lg font-bold mb-3">🔥 Pro Tip: The Math of Winning</h2>
                        <p className="text-gray-300 text-sm">
                            A ball at <span className="text-green-400">2.0x speed</span> conquers tiles <strong>twice as fast</strong> as a 1.0x ball.
                            If you maintain 4+ streak while the AI misses (their ball drops to 0.85x), you'll
                            outpace them by over <span className="text-yellow-400">2.3x</span>. That's how you hit 80%+ territory!
                        </p>
                    </section>
                </article>

                <div className="mt-8">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Apply These Strategies Now!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== BROWSER COMPATIBILITY PAGE ===============
export const BrowserCompatPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong Browser Compatibility - Chrome, Safari, Firefox | Play Anywhere';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Combat Pong works on all browsers! Chrome, Safari, Firefox, Edge - desktop and mobile. No download, no plugins. Play this free territory game anywhere!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    const browsers = [
        { name: 'Google Chrome', icon: '🌐', status: 'Full Support', version: '80+' },
        { name: 'Safari', icon: '🧭', status: 'Full Support', version: '14+' },
        { name: 'Firefox', icon: '🦊', status: 'Full Support', version: '75+' },
        { name: 'Microsoft Edge', icon: '📘', status: 'Full Support', version: '80+' },
        { name: 'Samsung Internet', icon: '📱', status: 'Full Support', version: '12+' },
        { name: 'Opera', icon: '🔴', status: 'Full Support', version: '67+' },
    ];

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
                    Browser Compatibility
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
                    Combat Pong works everywhere - no download needed!
                </p>

                <div className="grid gap-3 mb-8">
                    {browsers.map((b, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{b.icon}</span>
                                <div>
                                    <h3 className="font-bold text-sm">{b.name}</h3>
                                    <p className="text-gray-500 text-xs">Version {b.version}</p>
                                </div>
                            </div>
                            <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full">
                                ✓ {b.status}
                            </span>
                        </div>
                    ))}
                </div>

                <section className="bg-white/5 rounded-xl p-4 sm:p-6 mb-6">
                    <h2 className="font-bold mb-3">📱 Mobile Browsers</h2>
                    <p className="text-gray-300 text-sm mb-3">
                        Combat Pong is fully optimized for mobile browsers with responsive touch controls:
                    </p>
                    <ul className="text-gray-400 text-xs space-y-1">
                        <li>✓ iOS Safari - iPhone & iPad</li>
                        <li>✓ Chrome for Android</li>
                        <li>✓ Samsung Internet</li>
                        <li>✓ Firefox Mobile</li>
                    </ul>
                </section>

                <section className="bg-white/5 rounded-xl p-4 sm:p-6 mb-6">
                    <h2 className="font-bold mb-3">⚡ Requirements</h2>
                    <ul className="text-gray-300 text-sm space-y-2">
                        <li>• <strong>JavaScript enabled</strong> (enabled by default)</li>
                        <li>• <strong>No plugins required</strong> - pure HTML5</li>
                        <li>• <strong>No download</strong> - plays instantly</li>
                        <li>• <strong>~500KB</strong> - loads in seconds</li>
                    </ul>
                </section>

                <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                    Play Now - Works on Your Browser!
                </button>
            </main>

            <Footer />
        </div>
    );
};

// =============== UPDATES / CHANGELOG PAGE ===============
export const UpdatesPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong Updates - Latest Features & Changelog | Version History';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'See what\'s new in Combat Pong! Latest updates include enhanced streak system (+0.25x per hit), dynamic bounce angles, fair AI penalties. Free browser game!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    const updates = [
        {
            version: '2.1',
            date: 'December 2025',
            title: 'Enhanced Ball Physics',
            changes: [
                'Streak system now adds +0.25x speed per hit (was +0.1x)',
                'Dynamic bounce angles with random spin effect',
                'Ball speed multiplier persists until miss',
                'Fair play: AI balls now also get 0.85x penalty on miss',
                'Higher streaks create wilder deflection angles',
            ]
        },
        {
            version: '2.0',
            date: 'November 2025',
            title: '90-Second Timer & Modes',
            changes: [
                'Added 90-second match timer',
                'Four difficulty modes: Easy, Medium, Hard, Nightmare',
                'Territory percentage scoring',
                'Win condition: most territory when time runs out',
            ]
        },
        {
            version: '1.0',
            date: 'October 2025',
            title: 'Initial Release',
            changes: [
                'Playable Pong Wars concept',
                'Paddle control for Day team',
                'AI opponent for Night team',
                'Mobile touch controls',
                'Real-time multiplayer (beta)',
            ]
        },
    ];

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
                    Updates & Changelog
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
                    See what's new in Combat Pong
                </p>

                <div className="space-y-6">
                    {updates.map((u, i) => (
                        <article key={i} className={`rounded-xl p-4 sm:p-6 ${i === 0 ? 'bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20' : 'bg-white/5'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    {i === 0 && <span className="text-green-400 text-xs bg-green-400/20 px-2 py-0.5 rounded">LATEST</span>}
                                    v{u.version} - {u.title}
                                </h2>
                                <span className="text-gray-500 text-xs">{u.date}</span>
                            </div>
                            <ul className="space-y-1">
                                {u.changes.map((c, j) => (
                                    <li key={j} className="text-gray-300 text-sm flex items-start gap-2">
                                        <span className="text-green-400">+</span> {c}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>

                <div className="mt-8">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Try the Latest Version!
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== VS OTHER GAMES PAGE ===============
export const VsOtherGamesPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong vs Other Pong Games - Why Play | Free Comparison';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'How does Combat Pong compare to classic Pong, Pong Wars, and other browser games? Unique features: streak speed system, territory control, 90-second matches. Play free!');
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
                    Combat Pong vs Other Games
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
                    What makes Combat Pong unique?
                </p>

                {/* Comparison Table */}
                <div className="overflow-x-auto mb-8">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-2">Feature</th>
                                <th className="text-center py-3 px-2 text-yellow-400">Combat Pong</th>
                                <th className="text-center py-3 px-2 text-gray-500">Classic Pong</th>
                                <th className="text-center py-3 px-2 text-gray-500">Pong Wars</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-2">Playable</td>
                                <td className="text-center text-green-400">✓</td>
                                <td className="text-center text-green-400">✓</td>
                                <td className="text-center text-red-400">✗</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-2">Territory Control</td>
                                <td className="text-center text-green-400">✓</td>
                                <td className="text-center text-red-400">✗</td>
                                <td className="text-center text-green-400">✓</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-2">Streak System</td>
                                <td className="text-center text-green-400">✓</td>
                                <td className="text-center text-red-400">✗</td>
                                <td className="text-center text-red-400">✗</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-2">Dynamic Speed</td>
                                <td className="text-center text-green-400">✓</td>
                                <td className="text-center text-red-400">✗</td>
                                <td className="text-center text-red-400">✗</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-2">90-Second Matches</td>
                                <td className="text-center text-green-400">✓</td>
                                <td className="text-center text-red-400">✗</td>
                                <td className="text-center text-red-400">✗</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-2 px-2">Mobile Optimized</td>
                                <td className="text-center text-green-400">✓</td>
                                <td className="text-center text-yellow-400">Some</td>
                                <td className="text-center text-green-400">✓</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-2">Free to Play</td>
                                <td className="text-center text-green-400">✓</td>
                                <td className="text-center text-green-400">✓</td>
                                <td className="text-center text-green-400">✓</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <section className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 sm:p-6 mb-6">
                    <h2 className="font-bold text-lg mb-3">🎮 Why Choose Combat Pong?</h2>
                    <ul className="text-gray-300 text-sm space-y-2">
                        <li>• <strong>Actually playable</strong> - Not just a visualization to watch</li>
                        <li>• <strong>Skill-based</strong> - Your streak and timing matter</li>
                        <li>• <strong>Quick matches</strong> - Perfect for short breaks</li>
                        <li>• <strong>Deep mechanics</strong> - Dynamic speed, angles, and strategy</li>
                    </ul>
                </section>

                <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                    Experience the Difference - Play Free!
                </button>
            </main>

            <Footer />
        </div>
    );
};
