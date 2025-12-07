// SEO Landing Page for Game Modes - Mobile-First + Maximum SEO
import { useEffect } from 'react';

interface ModeLandingPageProps {
    mode: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE';
    onPlay: () => void;
    onBack: () => void;
}

const modeData = {
    EASY: {
        title: 'Easy Mode',
        emoji: '👶',
        metaTitle: 'Combat Pong Easy Mode - Best Beginner Game 2024 | Free Online',
        metaDescription: 'Play Combat Pong Easy Mode free online! Perfect for beginners with 2 slow balls. Learn paddle control, conquer territory, and master the basics. No download required. Mobile friendly!',
        keywords: 'easy pong game, beginner pong, learn pong, simple browser game, casual game online, territory game easy, pong for beginners',
        description: 'Perfect for beginners! 2 balls at slow speed. Learn the mechanics and master your paddle control.',
        balls: 2,
        speed: 'Slow',
        features: ['Perfect for learning', '2 balls total', 'Slow ball speed', '3 lives to survive'],
        tips: ['Focus on smooth paddle control', 'Watch both balls at once', 'Take your time'],
        h2: 'Master the Basics with Easy Mode',
        content: 'Combat Pong Easy Mode is designed for players who are new to the game or want a relaxed gaming experience. With only 2 balls moving at a comfortable pace, you can focus on learning the core mechanics: paddle control, territory conquest, and strategic positioning. Perfect for casual gaming sessions or warming up before harder challenges.'
    },
    MEDIUM: {
        title: 'Medium Mode',
        emoji: '⚔️',
        metaTitle: 'Combat Pong Medium Mode - Classic Territory Game | Free Play',
        metaDescription: 'Experience the classic Combat Pong challenge! Medium mode offers balanced difficulty with 2 balls at normal speed. Conquer territory, battle AI, play free online!',
        keywords: 'pong game, classic pong, territory control game, browser pong game, arcade game online, pong wars, medium difficulty game',
        description: 'The classic Combat Pong experience! 2 balls at normal speed for balanced challenge.',
        balls: 2,
        speed: 'Normal',
        features: ['Balanced difficulty', '2 balls total', 'Normal ball speed', '3 lives to survive'],
        tips: ['Predict ball trajectories', 'Position yourself early', 'Watch bounce angles'],
        h2: 'The Classic Combat Pong Experience',
        content: 'Medium Mode delivers the quintessential Combat Pong experience. Two balls at moderate speed create an engaging challenge that rewards skill and strategy. This is where most players find their sweet spot - challenging enough to be exciting, accessible enough to be enjoyable. Perfect for daily gaming sessions and competing with friends.'
    },
    HARD: {
        title: 'Hard Mode',
        emoji: '🔥',
        metaTitle: 'Combat Pong Hard Mode - Intense 4-Ball Challenge | Play Free',
        metaDescription: 'Challenge yourself with Combat Pong Hard Mode! 4 fast balls test your reflexes. Can you handle the intensity? Free online, no download, mobile optimized!',
        keywords: 'hard pong game, difficult browser game, fast pong, 4 ball pong, challenging arcade game, intense online game, reflex game',
        description: 'Intense action with 4 balls! Fast speed requires quick reflexes and sharp focus.',
        balls: 4,
        speed: 'Fast',
        features: ['High intensity', '4 balls total', 'Fast ball speed', '3 lives to survive'],
        tips: ['Prioritize closest ball', 'Stay centered', 'Anticipate bounces'],
        h2: 'Test Your Reflexes in Hard Mode',
        content: 'Hard Mode doubles the chaos with 4 balls racing across the battlefield at increased speeds. Your reflexes will be pushed to their limits as you juggle multiple threats while trying to conquer territory. This mode separates casual players from dedicated gamers. Only those with sharp focus and quick reactions will thrive here.'
    },
    NIGHTMARE: {
        title: 'Nightmare Mode',
        emoji: '💀',
        metaTitle: 'Combat Pong Nightmare Mode - Ultimate Challenge 6 Balls | Free Game',
        metaDescription: 'Only legends survive Nightmare Mode! 6 balls at maximum speed in Combat Pong. The ultimate browser game challenge. Free to play, if you dare!',
        keywords: 'hardest pong game, nightmare difficulty, 6 ball pong, extreme browser game, impossible game, ultimate challenge, hardcore arcade game',
        description: 'Only for the elite! 6 balls at maximum speed create absolute chaos.',
        balls: 6,
        speed: 'Very Fast',
        features: ['Ultimate challenge', '6 balls total', 'Maximum speed', '3 lives to survive'],
        tips: ['Accept some losses', 'Focus on defense', 'React, don\'t predict'],
        h2: 'Embrace the Chaos - Nightmare Mode',
        content: 'Nightmare Mode is not for the faint of heart. Six balls traveling at maximum velocity create a whirlwind of chaos that demands superhuman reflexes. Every split-second decision matters. This mode exists to humble even the most skilled players. Few survive, fewer conquer. Do you have what it takes to become a Nightmare Mode legend?'
    }
};

export const ModeLandingPage = ({ mode, onPlay, onBack }: ModeLandingPageProps) => {
    const data = modeData[mode];

    // Update document title and meta tags for SEO
    useEffect(() => {
        document.title = data.metaTitle;

        // Update meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.metaDescription);

        // Update keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) metaKeywords.setAttribute('content', data.keywords);

        // Update OG tags
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', data.metaTitle);

        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', data.metaDescription);

        // Update canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', `https://combatpong.com/mode/${mode.toLowerCase()}`);

        return () => {
            // Reset to default on unmount
            document.title = 'Combat Pong - Free Online Territory Control Game';
        };
    }, [mode, data]);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            {/* Compact Mobile Header */}
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    >
                        <span className="text-lg">←</span>
                        <span className="text-sm sm:text-base">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                {/* Hero */}
                <header className="text-center mb-6 sm:mb-10">
                    <span className="text-5xl sm:text-6xl mb-3 sm:mb-4 block" role="img" aria-label={`${mode} mode icon`}>{data.emoji}</span>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-4 leading-tight">
                        Combat Pong: {data.title}
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-lg leading-relaxed">
                        {data.description}
                    </p>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-10">
                    <div className="bg-white/5 rounded-xl p-3 sm:p-5 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-purple-400">{data.balls}</div>
                        <div className="text-gray-400 text-xs sm:text-sm mt-1">Balls in Play</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 sm:p-5 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-blue-400">{data.speed}</div>
                        <div className="text-gray-400 text-xs sm:text-sm mt-1">Ball Speed</div>
                    </div>
                </div>

                {/* SEO Content Section */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">{data.h2}</h2>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        {data.content}
                    </p>
                </article>

                {/* Features */}
                <section className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Game Features</h2>
                    <ul className="space-y-2 sm:space-y-3">
                        {data.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-300 text-sm sm:text-base">
                                <span className="text-green-400 flex-shrink-0">✓</span>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Tips */}
                <section className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Pro Strategies for {data.title}</h2>
                    <ul className="space-y-2 sm:space-y-3">
                        {data.tips.map((tip, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-300 text-sm sm:text-base">
                                <span className="text-yellow-400 flex-shrink-0">💡</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* CTA */}
                <button
                    onClick={onPlay}
                    className="btn-gradient w-full py-4 min-h-[56px] sm:min-h-[64px] rounded-xl font-bold text-base sm:text-lg text-white mb-6 sm:mb-10 touch-manipulation active:scale-95 transition-transform"
                >
                    Play {data.title} Now - Free!
                </button>

                {/* Internal Links */}
                <nav className="border-t border-white/10 pt-5 sm:pt-6" aria-label="Other game modes">
                    <h3 className="text-xs sm:text-sm text-gray-500 mb-3">Explore Other Difficulty Modes:</h3>
                    <div className="flex flex-wrap gap-2">
                        {(['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'] as const)
                            .filter(m => m !== mode)
                            .map(m => (
                                <a
                                    key={m}
                                    href={`/mode/${m.toLowerCase()}`}
                                    className="px-4 py-2 min-h-[44px] flex items-center bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-full text-sm text-gray-400 hover:text-white transition-colors touch-manipulation"
                                    title={`Play Combat Pong ${m} Mode`}
                                >
                                    {modeData[m].emoji} {m}
                                </a>
                            ))
                        }
                    </div>

                    {/* More SEO Links */}
                    <div className="mt-4 flex flex-wrap gap-4 text-xs sm:text-sm">
                        <a href="/how-to-play" className="text-gray-500 hover:text-white transition-colors">📖 How to Play Combat Pong</a>
                        <a href="/" className="text-gray-500 hover:text-white transition-colors">🏠 Back to Home</a>
                    </div>
                </nav>
            </main>

            {/* SEO Footer */}
            <footer className="px-4 py-8 mt-8 border-t border-white/5 text-center">
                <div className="max-w-2xl mx-auto">
                    <p className="text-gray-600 text-xs sm:text-sm mb-4">
                        Combat Pong is a free online territory control game. Play in your browser on desktop or mobile. No download required.
                    </p>
                    <nav className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                        <a href="/" className="hover:text-white">Home</a>
                        <a href="/mode/easy" className="hover:text-white">Easy Mode</a>
                        <a href="/mode/medium" className="hover:text-white">Medium Mode</a>
                        <a href="/mode/hard" className="hover:text-white">Hard Mode</a>
                        <a href="/mode/nightmare" className="hover:text-white">Nightmare Mode</a>
                        <a href="/how-to-play" className="hover:text-white">How to Play</a>
                    </nav>
                    <p className="text-gray-700 text-xs mt-4">© 2025 Combat Pong. Free browser game.</p>
                </div>
            </footer>

            {/* Enhanced Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": data.metaTitle,
                        "description": data.metaDescription,
                        "url": `https://combatpong.com/mode/${mode.toLowerCase()}`,
                        "mainEntity": {
                            "@type": "VideoGame",
                            "name": `Combat Pong ${data.title}`,
                            "description": data.content,
                            "numberOfPlayers": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 1 },
                            "gamePlatform": ["Web Browser", "Mobile Browser"],
                            "applicationCategory": "Game",
                            "genre": ["Arcade", "Action", "Casual"],
                            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                        },
                        "breadcrumb": {
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://combatpong.com/" },
                                { "@type": "ListItem", "position": 2, "name": data.title, "item": `https://combatpong.com/mode/${mode.toLowerCase()}` }
                            ]
                        }
                    })
                }}
            />
        </div>
    );
};

// How to Play Page - Maximum SEO
interface HowToPlayPageProps {
    onBack: () => void;
    onPlay: (mode: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE') => void;
}

export const HowToPlayPage = ({ onBack, onPlay }: HowToPlayPageProps) => {
    // Update meta tags for SEO
    useEffect(() => {
        document.title = 'How to Play Combat Pong - Complete Guide & Tutorial 2024';

        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Learn how to play Combat Pong! Complete guide covering controls, territory conquest, lives system, difficulty modes, and multiplayer. Master the game with our tips!');

        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) metaKeywords.setAttribute('content', 'how to play pong, pong tutorial, combat pong guide, pong game rules, territory game tutorial, browser game instructions');

        return () => {
            document.title = 'Combat Pong - Free Online Territory Control Game';
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-white/5">
                <div className="px-3 py-2 sm:px-6 sm:py-3 flex justify-between items-center">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    >
                        <span className="text-lg">←</span>
                        <span className="text-sm sm:text-base">Menu</span>
                    </button>
                    <a href="/" className="text-gray-500 hover:text-white text-sm">Combat Pong</a>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-6 sm:mb-10 text-center leading-tight">
                    How to Play Combat Pong
                </h1>

                <p className="text-gray-300 text-sm sm:text-base mb-8 text-center">
                    The complete guide to mastering Combat Pong - the addictive territory control game!
                </p>

                {/* Objective */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-purple-400 flex items-center gap-2">
                        <span>🎯</span> Game Objective
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        Your mission is to control your paddle and protect the <span className="text-yellow-400">Day balls ☀️</span> from hitting the bottom wall.
                        Every ball that touches the bottom costs you one life. Meanwhile, conquer as much territory as possible by letting your balls paint the board!
                    </p>
                </article>

                {/* Controls */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-400 flex items-center gap-2">
                        <span>🕹️</span> Game Controls
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <div className="bg-white/5 rounded-xl p-4 sm:p-5">
                            <h3 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base">🖱️ Desktop Controls</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">Move your mouse left and right to control the paddle position</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 sm:p-5">
                            <h3 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base">👆 Mobile Controls</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">Touch the screen and drag your finger to move the paddle</p>
                        </div>
                    </div>
                </article>

                {/* Territory */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-pink-400 flex items-center gap-2">
                        <span>🗺️</span> Territory System Explained
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                        The game board is divided into territories belonging to two teams: <span className="text-yellow-400">Day ☀️</span> (you) and <span className="text-blue-400">Night 🌙</span> (AI opponent).
                    </p>
                    <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                        <li className="flex gap-2"><span>•</span> When your ball hits an enemy tile, it gets conquered!</li>
                        <li className="flex gap-2"><span>•</span> The score bar at the top shows territory percentage</li>
                        <li className="flex gap-2"><span>•</span> More territory = higher score</li>
                        <li className="flex gap-2"><span>•</span> Strategic paddle blocking can redirect balls</li>
                    </ul>
                </article>

                {/* Lives */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-red-400 flex items-center gap-2">
                        <span>❤️</span> Lives & Game Over
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        You begin each game with 3 lives, shown as hearts (❤️❤️❤️). When a Day ball hits the bottom wall, you lose one life.
                        When all lives are depleted, the game ends and your final territory percentage is displayed. Try to survive as long as possible!
                    </p>
                </article>

                {/* Difficulty */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-green-400 flex items-center gap-2">
                        <span>📊</span> Difficulty Modes Guide
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base mb-4">
                        Choose your challenge level - each mode offers a unique experience:
                    </p>
                    <div className="space-y-2 sm:space-y-3">
                        {(['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'] as const).map(mode => (
                            <a
                                key={mode}
                                href={`/mode/${mode.toLowerCase()}`}
                                className="block bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl p-4 transition-colors touch-manipulation"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm sm:text-base">
                                        <span>{modeData[mode].emoji}</span>
                                        <span className="font-bold">{mode}</span>
                                    </span>
                                    <span className="text-gray-500 text-xs sm:text-sm">
                                        {modeData[mode].balls} balls • {modeData[mode].speed}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </article>

                {/* Multiplayer */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-orange-400 flex items-center gap-2">
                        <span>⚡</span> Multiplayer Mode
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        Ready to compete against real players? Login with your Google account and click "Find Match" to enter the matchmaking queue.
                        You'll be paired with another player for a real-time 1v1 battle. The first player to control 90% of the territory wins!
                    </p>
                </article>

                {/* CTA */}
                <div className="space-y-3">
                    <button
                        onClick={() => onPlay('EASY')}
                        className="btn-gradient w-full py-4 min-h-[56px] sm:min-h-[64px] rounded-xl font-bold text-base sm:text-lg text-white touch-manipulation active:scale-95 transition-transform"
                    >
                        Start Playing Now - It's Free!
                    </button>
                    <a
                        href="/"
                        className="block text-center py-3 min-h-[44px] text-gray-400 hover:text-white transition-colors touch-manipulation"
                    >
                        ← Back to Main Menu
                    </a>
                </div>
            </main>

            {/* SEO Footer */}
            <footer className="px-4 py-8 mt-8 border-t border-white/5 text-center">
                <div className="max-w-2xl mx-auto">
                    <p className="text-gray-600 text-xs sm:text-sm mb-4">
                        Combat Pong is a free browser-based game inspired by classic Pong. No download or installation needed.
                    </p>
                    <nav className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                        <a href="/" className="hover:text-white">Play Now</a>
                        <a href="/mode/easy" className="hover:text-white">Easy Mode</a>
                        <a href="/mode/nightmare" className="hover:text-white">Nightmare Mode</a>
                    </nav>
                </div>
            </footer>

            {/* Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "HowTo",
                        "name": "How to Play Combat Pong",
                        "description": "Complete guide to playing Combat Pong - the addictive territory control game",
                        "step": [
                            { "@type": "HowToStep", "name": "Move Your Paddle", "text": "Use mouse or touch to control your paddle at the bottom of the screen" },
                            { "@type": "HowToStep", "name": "Protect Your Balls", "text": "Prevent Day balls from hitting the bottom wall to preserve lives" },
                            { "@type": "HowToStep", "name": "Conquer Territory", "text": "Let your balls hit enemy tiles to paint them in your color" },
                            { "@type": "HowToStep", "name": "Survive", "text": "Keep at least one life to continue playing and maximize your score" }
                        ]
                    })
                }}
            />
        </div>
    );
};
