// SEO Landing Page for Game Modes
interface ModeLandingPageProps {
    mode: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE';
    onPlay: () => void;
    onBack: () => void;
}

const modeData = {
    EASY: {
        title: 'Easy Mode',
        emoji: '👶',
        description: 'Perfect for beginners! 2 balls at slow speed. Learn the mechanics and master your paddle control before taking on harder challenges.',
        balls: 2,
        speed: 'Slow',
        features: ['Perfect for learning', '2 balls total', 'Slow ball speed', '3 lives to survive'],
        tips: ['Focus on controlling your paddle smoothly', 'Watch both balls at once', 'Don\'t rush - take your time']
    },
    MEDIUM: {
        title: 'Medium Mode',
        emoji: '⚔️',
        description: 'The classic Combat Pong experience! 2 balls at normal speed. A balanced challenge for players who want to test their skills.',
        balls: 2,
        speed: 'Normal',
        features: ['Balanced difficulty', '2 balls total', 'Normal ball speed', '3 lives to survive'],
        tips: ['Predict ball trajectories', 'Position yourself early', 'Watch for bounce angles']
    },
    HARD: {
        title: 'Hard Mode',
        emoji: '🔥',
        description: 'Intense action with 4 balls! Fast speed means you need quick reflexes and sharp focus to survive.',
        balls: 4,
        speed: 'Fast',
        features: ['High intensity', '4 balls total', 'Fast ball speed', '3 lives to survive'],
        tips: ['Prioritize the closest ball', 'Stay centered when possible', 'Anticipate multiple bounces']
    },
    NIGHTMARE: {
        title: 'Nightmare Mode',
        emoji: '💀',
        description: 'Only for the elite! 6 balls at maximum speed create absolute chaos. Can you conquer the nightmare?',
        balls: 6,
        speed: 'Very Fast',
        features: ['Ultimate challenge', '6 balls total', 'Maximum ball speed', '3 lives to survive'],
        tips: ['Accept some loses', 'Focus on defense', 'React, don\'t predict']
    }
};

export const ModeLandingPage = ({ mode, onPlay, onBack }: ModeLandingPageProps) => {
    const data = modeData[mode];

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white p-4 sm:p-8">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="mb-6 text-gray-400 hover:text-white transition-colors"
            >
                ← Back to Menu
            </button>

            {/* Hero Section */}
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <span className="text-6xl mb-4 block">{data.emoji}</span>
                    <h1 className="text-4xl sm:text-5xl font-black mb-4">
                        Combat Pong: {data.title}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {data.description}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400">{data.balls}</div>
                        <div className="text-gray-400 text-sm">Balls</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{data.speed}</div>
                        <div className="text-gray-400 text-sm">Speed</div>
                    </div>
                </div>

                {/* Features */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Features</h2>
                    <ul className="space-y-2">
                        {data.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-300">
                                <span className="text-green-400">✓</span> {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tips */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Pro Tips</h2>
                    <ul className="space-y-2">
                        {data.tips.map((tip, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-300">
                                <span className="text-yellow-400">💡</span> {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA */}
                <button
                    onClick={onPlay}
                    className="btn-gradient w-full py-4 rounded-xl font-bold text-lg text-white mb-8"
                >
                    Play {data.title} Now
                </button>

                {/* Internal Links - SEO */}
                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-sm text-gray-500 mb-3">Try Other Modes:</h3>
                    <div className="flex flex-wrap gap-2">
                        {(['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'] as const)
                            .filter(m => m !== mode)
                            .map(m => (
                                <a
                                    key={m}
                                    href={`/mode/${m.toLowerCase()}`}
                                    className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    {modeData[m].emoji} {m}
                                </a>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* Schema Markup for this page */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": `Combat Pong ${data.title} - Play Free Online`,
                        "description": data.description,
                        "url": `https://combat-pong.vercel.app/mode/${mode.toLowerCase()}`,
                        "mainEntity": {
                            "@type": "VideoGame",
                            "name": `Combat Pong ${data.title}`,
                            "numberOfPlayers": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 1 },
                            "gamePlatform": "Web Browser"
                        }
                    })
                }}
            />
        </div>
    );
};

// How to Play Page
interface HowToPlayPageProps {
    onBack: () => void;
    onPlay: (mode: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE') => void;
}

export const HowToPlayPage = ({ onBack, onPlay }: HowToPlayPageProps) => {
    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white p-4 sm:p-8 overflow-auto">
            <button onClick={onBack} className="mb-6 text-gray-400 hover:text-white">
                ← Back to Menu
            </button>

            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-black mb-8 text-center">
                    How to Play Combat Pong
                </h1>

                {/* Objective */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-purple-400">🎯 Objective</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Control your paddle at the bottom of the screen to protect your <span className="text-yellow-400">Day balls ☀️</span> from hitting the bottom wall.
                        Each ball that touches the bottom costs you one life. Survive as long as possible while conquering enemy territory!
                    </p>
                </section>

                {/* Controls */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-blue-400">🕹️ Controls</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4">
                            <h3 className="font-bold mb-2">Desktop</h3>
                            <p className="text-gray-400">Move your mouse left/right to control the paddle</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <h3 className="font-bold mb-2">Mobile</h3>
                            <p className="text-gray-400">Touch and drag your finger to move the paddle</p>
                        </div>
                    </div>
                </section>

                {/* Territory */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-pink-400">🗺️ Territory System</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        The board is divided into two territories: <span className="text-yellow-400">Day ☀️</span> (your team) and <span className="text-blue-400">Night 🌙</span> (enemy team).
                    </p>
                    <ul className="space-y-2 text-gray-300">
                        <li>• When your ball hits enemy territory, it conquers that tile</li>
                        <li>• The score bar shows territory percentage</li>
                        <li>• Conquer more territory to win!</li>
                    </ul>
                </section>

                {/* Lives */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-red-400">❤️ Lives System</h2>
                    <p className="text-gray-300 leading-relaxed">
                        You start with 3 lives (❤️❤️❤️). When a Day ball hits the bottom wall, you lose one life.
                        When all lives are gone, it's Game Over! The Night team's balls hitting the top wall don't affect you.
                    </p>
                </section>

                {/* Difficulty */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-green-400">📊 Difficulty Modes</h2>
                    <div className="space-y-3">
                        {(['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'] as const).map(mode => (
                            <a
                                key={mode}
                                href={`/mode/${mode.toLowerCase()}`}
                                className="block bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <span>{modeData[mode].emoji}</span>
                                        <span className="font-bold">{mode}</span>
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        {modeData[mode].balls} balls • {modeData[mode].speed}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Multiplayer */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-orange-400">⚡ Multiplayer</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Login with Google and click "Find Match" to battle another player in real-time!
                        First player to control 90% of the territory wins.
                    </p>
                </section>

                {/* CTA */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => onPlay('EASY')}
                        className="btn-gradient w-full py-4 rounded-xl font-bold text-lg text-white"
                    >
                        Start Playing Now
                    </button>
                    <a
                        href="/"
                        className="text-center text-gray-400 hover:text-white transition-colors"
                    >
                        Back to Main Menu
                    </a>
                </div>
            </div>
        </div>
    );
};
