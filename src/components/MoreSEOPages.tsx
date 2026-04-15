// Additional SEO Pages - FAQ, About, Tips & Tricks
import { useEffect } from 'react';

interface SEOPageProps {
    onBack: () => void;
    onPlay: (mode: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE') => void;
}

// =============== FAQ PAGE ===============
export const FAQPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong FAQ - Frequently Asked Questions | Free Online Game';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Find answers to common Combat Pong questions. Learn about anonymous duel mode, controls, mobile play, and more. Get help with our free browser game!');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    const faqs = [
        { q: 'What is Combat Pong?', a: 'Combat Pong is a free browser-based territory control game inspired by classic Pong. You have 90 seconds to conquer as much territory as possible by controlling your paddle and hitting balls.' },
        { q: 'Is Combat Pong free to play?', a: 'Yes! Combat Pong is 100% free with no ads, no in-app purchases, and no download required. Just open your browser and start playing instantly.' },
        { q: 'How do I win a match?', a: 'Each match lasts 90 seconds. When time runs out, whoever controls more than 50% of the territory wins! Hit balls with your paddle to speed them up and conquer faster.' },
        { q: 'How does the streak system work?', a: 'Consecutive paddle hits build a streak! Each hit adds +0.25x to your ball\'s speed (1st hit = 1.25x, 2nd = 1.5x, 3rd = 1.75x... it keeps stacking!). Miss and hit the wall? Your ball slows to 0.85x and streak resets to 0.' },
        { q: 'Can I play on mobile?', a: 'Absolutely! Combat Pong is fully optimized for mobile devices with touch controls. Works on any smartphone or tablet browser - no app needed.' },
        { q: 'Is Combat Pong real multiplayer?', a: 'Not anymore. Combat Pong now simulates an anonymous rival locally so the match feels like a live 1v1 without logins, queues, or backend lag.' },
        { q: 'What are the difficulty levels?', a: 'There are 4 modes: Easy (2 slow balls), Medium (2 normal balls), Hard (4 fast balls), and Nightmare (6 very fast balls). All are 90-second matches.' },
        { q: 'What browsers are supported?', a: 'Combat Pong works on all modern browsers: Chrome, Firefox, Safari, Edge, and their mobile versions. No plugins required.' },
        { q: 'How do I control the paddle?', a: 'On desktop, move your mouse left/right. On mobile, touch the screen and drag your finger. The paddle follows your input.' },
        { q: 'Who created Combat Pong?', a: 'Combat Pong was inspired by the viral "Pong Wars" concept. We rebuilt it around sharper controls, stronger game feel, anonymous rival simulation, and mobile-first play.' }
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
                <h1 className="text-2xl sm:text-4xl font-black mb-4 sm:mb-8 text-center">
                    Frequently Asked Questions
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
                    Everything you need to know about Combat Pong
                </p>

                <div className="space-y-4 sm:space-y-6">
                    {faqs.map((faq, i) => (
                        <article key={i} className="bg-white/5 rounded-xl p-4 sm:p-6">
                            <h2 className="font-bold text-base sm:text-lg mb-2">{faq.q}</h2>
                            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{faq.a}</p>
                        </article>
                    ))}
                </div>

                <div className="mt-8 sm:mt-12">
                    <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Start Playing Now - Free!
                    </button>
                </div>
            </main>

            <Footer />

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": faqs.map(f => ({
                        "@type": "Question",
                        "name": f.q,
                        "acceptedAnswer": { "@type": "Answer", "text": f.a }
                    }))
                })
            }} />
        </div>
    );
};

// =============== ABOUT PAGE ===============
export const AboutPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'About Combat Pong - Free Browser Game | Our Story';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Learn about Combat Pong, the addictive free browser game. Discover our mission to create the best territory control game. Play online, no download needed!');
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
                <h1 className="text-2xl sm:text-4xl font-black mb-6 sm:mb-10 text-center">
                    About Combat Pong
                </h1>

                <article className="space-y-6 sm:space-y-8 text-gray-300 text-sm sm:text-base leading-relaxed">
                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">🎮 What is Combat Pong?</h2>
                        <p>
                            Combat Pong is a modern take on the classic Pong concept, transformed into an addictive territory control game.
                            Unlike traditional Pong where you simply bounce a ball, Combat Pong challenges you to protect your team's balls
                            while conquering the game board tile by tile.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">✨ Our Mission</h2>
                        <p>
                            We believe great games should be accessible to everyone. That's why Combat Pong is completely free,
                            works in any browser, requires no download, and has no ads. Our mission is to create the most
                            engaging, polished browser game experience possible.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">🌟 Inspiration</h2>
                        <p>
                            Combat Pong was inspired by the viral "Pong Wars" concept that captivated millions online.
                            We took that mesmerizing territory battle and rebuilt it around paddle control, difficulty tuning,
                            stronger audiovisual feedback, and a simulated anonymous rival that preserves the tension of a 1v1 without the friction of real matchmaking.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">📱 Built for Everyone</h2>
                        <p>
                            Whether you're on a powerful gaming PC or a smartphone, Combat Pong delivers a smooth,
                            responsive experience. Our mobile-first design ensures touch controls feel natural,
                            while desktop players enjoy precise mouse control. Play anywhere, anytime.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">⚡ Anonymous Duel Mode</h2>
                        <p>
                            Combat Pong now leans fully into instant anonymous duels. The rival is simulated locally,
                            but the HUD, pacing, signal readout, and behavior tuning are designed to feel like you dropped
                            into a live 1v1 with zero queue time and zero account setup.
                        </p>
                    </section>
                </article>

                <div className="mt-8 sm:mt-12 space-y-3">
                    <button onClick={() => onPlay('MEDIUM')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation">
                        Play Combat Pong Now
                    </button>
                    <a href="/faq" className="block text-center py-3 text-gray-400 hover:text-white">
                        Have questions? Read our FAQ →
                    </a>
                </div>
            </main>

            <Footer />

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "AboutPage",
                    "name": "About Combat Pong",
                    "description": "Learn about Combat Pong, the free browser-based territory control game",
                    "url": "https://combatpong.com/about",
                    "mainEntity": {
                        "@type": "VideoGame",
                        "name": "Combat Pong",
                        "genre": ["Arcade", "Action", "Casual"],
                        "gamePlatform": ["Web Browser", "Mobile Browser"]
                    }
                })
            }} />
        </div>
    );
};

// =============== TIPS & TRICKS PAGE ===============
export const TipsPage = ({ onBack, onPlay }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong Tips & Tricks - Pro Strategies to Win | Game Guide';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Master Combat Pong with these pro tips and strategies! Learn paddle positioning, ball prediction, territory tactics, and advanced techniques to dominate.');
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, []);

    const tips = [
        { title: '🔥 Build Streak Combos', desc: 'Consecutive paddle hits build your streak! Each hit adds +0.25x speed (1st hit = 1.25x, 2nd = 1.5x, etc). Higher streaks also create wilder bounce angles! Never miss or you lose all momentum.' },
        { title: '🎯 Center Positioning', desc: 'Keep your paddle near the center when possible. This gives you maximum coverage and lets you catch more balls to build streaks.' },
        { title: '👀 Track Multiple Balls', desc: 'In Hard and Nightmare modes, don\'t focus on one ball. Use peripheral vision to track all balls and prioritize the most immediate threats.' },
        { title: '⏱️ Watch the Clock', desc: 'You have 90 seconds. If you\'re ahead at 50%, play defensively. If behind, take risks and hit more balls to speed them up!' },
        { title: '🛡️ Avoid Wall Hits', desc: 'When your ball hits the bottom wall, it slows to 0.85x AND your streak resets. Faster balls conquer more territory, so keep hitting!' },
        { title: '🔄 Use the Paddle Angle', desc: 'Where the ball hits your paddle affects its bounce angle. Hit with the edge for sharp angles, center for straighter returns. At high streaks, angles become even wilder and less predictable!' },
        { title: '📊 Know Your Limits', desc: 'Start with Easy mode to learn mechanics. Jumping to Nightmare before mastering basics leads to frustration, not improvement.' },
        { title: '💡 Learn from Losses', desc: 'Watch how you lost. Did a ball sneak past? Were you positioned wrong? Each loss teaches something valuable.' }
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
                <h1 className="text-2xl sm:text-4xl font-black mb-4 sm:mb-8 text-center">
                    Tips & Tricks for Combat Pong
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
                    Pro strategies to dominate the battlefield
                </p>

                <div className="space-y-4 sm:space-y-6">
                    {tips.map((tip, i) => (
                        <article key={i} className="bg-white/5 rounded-xl p-4 sm:p-6">
                            <h2 className="font-bold text-base sm:text-lg mb-2">{tip.title}</h2>
                            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{tip.desc}</p>
                        </article>
                    ))}
                </div>

                <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <h2 className="font-bold text-lg mb-2">🏆 Ready to Apply These Tips?</h2>
                    <p className="text-gray-400 text-sm mb-4">
                        Put your new knowledge to the test! Start with Easy mode to practice, then work your way up.
                    </p>
                    <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-3 min-h-[48px] rounded-xl font-bold text-white touch-manipulation">
                        Practice Now
                    </button>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
                    <a href="/how-to-play" className="text-gray-500 hover:text-white">📖 How to Play</a>
                    <a href="/mode/nightmare" className="text-gray-500 hover:text-white">💀 Try Nightmare</a>
                    <a href="/faq" className="text-gray-500 hover:text-white">❓ FAQ</a>
                </div>
            </main>

            <Footer />

            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "Combat Pong Tips & Tricks - Pro Strategies to Win",
                    "description": "Master Combat Pong with these expert tips on paddle positioning, ball tracking, and territory conquest",
                    "author": { "@type": "Organization", "name": "Combat Pong" }
                })
            }} />
        </div>
    );
};

// =============== MULTIPLAYER PAGE ===============
export const MultiplayerInfoPage = ({ onBack }: SEOPageProps) => {
    useEffect(() => {
        document.title = 'Combat Pong Anonymous Duel Mode - Instant 1v1 Feel | No Login';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Enter Combat Pong anonymous duel mode. Instant 1v1 feel, no login, no matchmaking, no backend. Just fast local rivalry and savage territory swings.');
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
                    <span className="text-5xl sm:text-6xl mb-4 block">⚡</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-4">
                        Anonymous Duel Mode
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-lg">
                        The pressure of a live 1v1, rebuilt as a local instant-play ritual.
                    </p>
                </div>

                <div className="space-y-6 text-gray-300 text-sm sm:text-base leading-relaxed">
                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="text-lg font-bold text-white mb-2">🎮 How It Works</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Open the game and choose a difficulty instantly</li>
                            <li>A rival alias and duel profile are generated on the spot</li>
                            <li>The top paddle reacts like an aggressive anonymous opponent</li>
                            <li>Push the board in your favor before the 90-second timer ends</li>
                            <li>No login, no queue, no external service required</li>
                        </ol>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="text-lg font-bold text-white mb-2">⚡ Features</h2>
                        <ul className="space-y-2">
                            <li>✓ Anonymous rival alias, title, and signal profile every match</li>
                            <li>✓ Human-like pressure swings without network delay</li>
                            <li>✓ Queue-free rematches and local-only persistence</li>
                            <li>✓ Stronger bounce, streak, particle, and momentum feedback</li>
                            <li>✓ Mobile and desktop friendly controls</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 sm:p-6">
                        <h2 className="text-lg font-bold text-white mb-2">🏆 Win Conditions</h2>
                        <p>
                            Both sides fight for board control by converting tiles on impact. When the timer hits zero,
                            the side with more territory wins. The fake rival is tuned to feel unstable under pressure,
                            so late swings happen constantly if your streak gets rolling.
                        </p>
                    </section>
                </div>

                <div className="mt-8 sm:mt-12 space-y-3">
                    <a href="/" className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white touch-manipulation block text-center">
                        Enter an Anonymous Duel
                    </a>
                    <p className="text-center text-gray-500 text-xs">
                        Instant play. No login required.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// =============== SHARED FOOTER ===============
const Footer = () => (
    <footer className="px-4 py-8 mt-8 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
            <nav className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4">
                <a href="/" className="hover:text-white">Home</a>
                <a href="/how-to-play" className="hover:text-white">How to Play</a>
                <a href="/tips" className="hover:text-white">Tips & Tricks</a>
                <a href="/faq" className="hover:text-white">FAQ</a>
                <a href="/about" className="hover:text-white">About</a>
                <a href="/multiplayer" className="hover:text-white">Anonymous Duel</a>
            </nav>
            <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-600 mb-4">
                <a href="/mode/easy" className="hover:text-white">Easy Mode</a>
                <a href="/mode/medium" className="hover:text-white">Medium Mode</a>
                <a href="/mode/hard" className="hover:text-white">Hard Mode</a>
                <a href="/mode/nightmare" className="hover:text-white">Nightmare Mode</a>
            </nav>
            <p className="text-gray-700 text-xs">© 2025 Combat Pong. Free online browser game.</p>
        </div>
    </footer>
);
