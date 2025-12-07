// SEO Landing Page for Game Modes - Mobile-First + Maximum SEO + 90-Second Timer
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
        metaTitle: 'Combat Pong Easy Mode - 90-Second Territory Battle | Free Online',
        metaDescription: 'Play Combat Pong Easy Mode free! 90-second matches with 2 slow balls. Learn paddle control, conquer territory, beat the AI. No download, mobile friendly!',
        keywords: 'easy pong game, beginner pong, 90 second game, simple browser game, casual game online, territory game easy, pong for beginners',
        description: 'Perfect for beginners! 2 balls at slow speed. 90 seconds to conquer the board.',
        balls: 2,
        speed: 'Slow',
        features: ['90-second matches', '2 balls total', 'Slow ball speed', 'Speed boost on paddle hits'],
        tips: ['Focus on smooth paddle control', 'Hit the ball for speed boosts', 'Watch both balls at once'],
        h2: 'Master the Basics in 90 Seconds',
        content: 'Combat Pong Easy Mode gives you 90 seconds to conquer as much territory as possible. With only 2 balls moving at a comfortable pace, you can focus on learning the mechanics: paddle control, territory conquest, and the speed boost system. Hit balls with your paddle to speed them up - miss and they slow down!'
    },
    MEDIUM: {
        title: 'Medium Mode',
        emoji: '⚔️',
        metaTitle: 'Combat Pong Medium Mode - Classic 90-Second Battle | Free Play',
        metaDescription: 'The classic Combat Pong challenge! 90-second matches with 2 balls at normal speed. Conquer territory, battle AI, play free online now!',
        keywords: 'pong game, classic pong, 90 second game, territory control, browser pong, arcade game online, pong wars',
        description: 'The classic Combat Pong experience! 2 balls at normal speed for 90-second battles.',
        balls: 2,
        speed: 'Normal',
        features: ['90-second matches', '2 balls total', 'Normal ball speed', 'Speed boost on paddle hits'],
        tips: ['Predict ball trajectories', 'Position yourself early', 'Keep balls fast with paddle hits'],
        h2: 'The Classic 90-Second Battle',
        content: 'Medium Mode delivers the quintessential Combat Pong experience. Two balls at moderate speed create an engaging 90-second challenge that rewards skill and strategy. Hit balls with your paddle to speed them up and conquer more territory. Miss and they slow down, giving Night the advantage.'
    },
    HARD: {
        title: 'Hard Mode',
        emoji: '🔥',
        metaTitle: 'Combat Pong Hard Mode - 4 Balls, 90 Seconds | Play Free',
        metaDescription: 'Challenge yourself! Combat Pong Hard Mode: 4 fast balls, 90 seconds, maximum intensity. Test your reflexes! Free online, no download.',
        keywords: 'hard pong game, difficult browser game, fast pong, 4 ball pong, 90 second challenge, intense game, reflex game',
        description: 'Intense action! 4 fast balls in 90 seconds. Quick reflexes required.',
        balls: 4,
        speed: 'Fast',
        features: ['90-second matches', '4 balls total', 'Fast ball speed', 'Speed boost on paddle hits'],
        tips: ['Prioritize closest ball', 'Stay centered', 'Every paddle hit matters'],
        h2: 'Test Your Reflexes in 90 Seconds',
        content: 'Hard Mode doubles the chaos with 4 balls racing across the battlefield. You have 90 seconds to prove yourself. Every paddle hit speeds up your balls, every miss slows them down. With more balls in play, maintaining speed is crucial for territory domination.'
    },
    NIGHTMARE: {
        title: 'Nightmare Mode',
        emoji: '💀',
        metaTitle: 'Combat Pong Nightmare - 6 Balls, 90 Seconds of Chaos | Free',
        metaDescription: 'Only legends survive! Combat Pong Nightmare: 6 balls at maximum speed, 90 seconds of pure chaos. The ultimate browser game challenge!',
        keywords: 'hardest pong game, nightmare difficulty, 6 ball pong, extreme browser game, 90 second challenge, impossible game',
        description: 'Pure chaos! 6 balls at maximum speed. 90 seconds of nightmare.',
        balls: 6,
        speed: 'Chaos',
        features: ['90-second matches', '6 balls total', 'Maximum ball speed', 'Speed boost on paddle hits'],
        tips: ['Accept some misses', 'Focus on hitting any ball', 'React, don\'t predict'],
        h2: '90 Seconds of Pure Chaos',
        content: 'Nightmare Mode is not for the faint of heart. Six balls traveling at maximum velocity give you 90 seconds of absolute chaos. Every split-second decision matters. Hit balls with your paddle to keep them fast. Miss and they slow down. Few survive, fewer conquer. Are you legend enough?'
    }
};

export const ModeLandingPage = ({ mode, onPlay, onBack }: ModeLandingPageProps) => {
    const data = modeData[mode];

    useEffect(() => {
        document.title = data.metaTitle;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.metaDescription);
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) metaKeywords.setAttribute('content', data.keywords);
        return () => { document.title = 'Combat Pong - Free Online Territory Control Game'; };
    }, [mode, data]);

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
                <header className="text-center mb-6 sm:mb-10">
                    <span className="text-5xl sm:text-6xl mb-3 block">{data.emoji}</span>
                    <h1 className="text-2xl sm:text-4xl font-black mb-2 sm:mb-4">Combat Pong: {data.title}</h1>
                    <p className="text-gray-400 text-sm sm:text-lg">{data.description}</p>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-10">
                    <div className="bg-white/5 rounded-xl p-3 sm:p-5 text-center">
                        <div className="text-xl sm:text-3xl font-bold text-purple-400">90s</div>
                        <div className="text-gray-400 text-[10px] sm:text-xs mt-1">Timer</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 sm:p-5 text-center">
                        <div className="text-xl sm:text-3xl font-bold text-blue-400">{data.balls}</div>
                        <div className="text-gray-400 text-[10px] sm:text-xs mt-1">Balls</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 sm:p-5 text-center">
                        <div className="text-xl sm:text-3xl font-bold text-pink-400">{data.speed}</div>
                        <div className="text-gray-400 text-[10px] sm:text-xs mt-1">Speed</div>
                    </div>
                </div>

                {/* Content */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3">{data.h2}</h2>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{data.content}</p>
                </article>

                {/* Features */}
                <section className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-xl font-bold mb-3">Game Features</h2>
                    <ul className="space-y-2">
                        {data.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-300 text-sm sm:text-base">
                                <span className="text-green-400">✓</span> {f}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Tips */}
                <section className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-xl font-bold mb-3">Pro Tips</h2>
                    <ul className="space-y-2">
                        {data.tips.map((t, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-300 text-sm sm:text-base">
                                <span className="text-yellow-400">💡</span> {t}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* CTA */}
                <button onClick={onPlay} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white mb-6 touch-manipulation">
                    Play {data.title} Now!
                </button>

                {/* Links */}
                <nav className="border-t border-white/10 pt-5">
                    <h3 className="text-xs text-gray-500 mb-3">Other Modes:</h3>
                    <div className="flex flex-wrap gap-2">
                        {(['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'] as const).filter(m => m !== mode).map(m => (
                            <a key={m} href={`/mode/${m.toLowerCase()}`} className="px-4 py-2 min-h-[44px] flex items-center bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-400">
                                {modeData[m].emoji} {m}
                            </a>
                        ))}
                    </div>
                    <div className="mt-4 flex gap-4 text-xs text-gray-500">
                        <a href="/how-to-play" className="hover:text-white">📖 How to Play</a>
                        <a href="/" className="hover:text-white">🏠 Home</a>
                    </div>
                </nav>
            </main>

            <footer className="px-4 py-8 border-t border-white/5 text-center">
                <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-500 mb-2">
                    <a href="/" className="hover:text-white">Home</a>
                    <a href="/how-to-play" className="hover:text-white">How to Play</a>
                    <a href="/tips" className="hover:text-white">Tips</a>
                    <a href="/faq" className="hover:text-white">FAQ</a>
                </nav>
                <p className="text-gray-700 text-xs">© 2025 Combat Pong</p>
            </footer>
        </div>
    );
};

// How to Play Page - Updated for 90-second timer
interface HowToPlayPageProps {
    onBack: () => void;
    onPlay: (mode: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE') => void;
}

export const HowToPlayPage = ({ onBack, onPlay }: HowToPlayPageProps) => {
    useEffect(() => {
        document.title = 'How to Play Combat Pong - 90-Second Territory Battle Guide';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', 'Learn how to play Combat Pong! 90-second matches, conquer territory, speed boost mechanics. Complete guide with controls, tips, and strategies.');
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
                <h1 className="text-2xl sm:text-4xl font-black mb-4 text-center">How to Play Combat Pong</h1>
                <p className="text-gray-400 text-center mb-8 text-sm sm:text-base">
                    Master the 90-second territory battle!
                </p>

                {/* Objective */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 text-purple-400 flex items-center gap-2">
                        <span>🎯</span> Objective
                    </h2>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        You have <span className="text-yellow-400 font-bold">90 seconds</span> to conquer as much territory as possible.
                        Control your paddle to redirect <span className="text-yellow-400">Day balls ☀️</span> and paint the board in your color.
                        When time runs out, whoever controls more territory wins!
                    </p>
                </article>

                {/* Controls */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 text-blue-400 flex items-center gap-2">
                        <span>🕹️</span> Controls
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-4">
                            <h3 className="font-bold mb-1 text-sm">🖱️ Desktop</h3>
                            <p className="text-gray-400 text-xs">Move mouse left/right</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <h3 className="font-bold mb-1 text-sm">👆 Mobile</h3>
                            <p className="text-gray-400 text-xs">Touch and drag finger</p>
                        </div>
                    </div>
                </article>

                {/* Speed Mechanic */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 text-pink-400 flex items-center gap-2">
                        <span>⚡</span> Streak Speed System
                    </h2>
                    <div className="bg-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="text-green-400 text-lg">🏓</span>
                            <div>
                                <p className="font-bold text-sm">Paddle Hit = +0.25x Speed!</p>
                                <p className="text-gray-400 text-xs">Each consecutive hit boosts speed: 1.25x → 1.5x → 1.75x → 2.0x and beyond!</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-red-400 text-lg">💥</span>
                            <div>
                                <p className="font-bold text-sm">Miss = 0.85x Penalty + Streak Reset!</p>
                                <p className="text-gray-400 text-xs">Ball slows to 0.85x speed and your streak resets to 0</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-3">
                        💡 Higher streaks = faster balls + wilder bounce angles. Keep hitting!
                    </p>
                </article>

                {/* Territory */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 text-green-400 flex items-center gap-2">
                        <span>🗺️</span> Territory
                    </h2>
                    <ul className="space-y-2 text-gray-300 text-sm">
                        <li>• Ball hits enemy tile = <span className="text-yellow-400">conquered!</span></li>
                        <li>• Score bar shows territory %</li>
                        <li>• Most territory at 0:00 = <span className="text-green-400">YOU WIN!</span></li>
                    </ul>
                </article>

                {/* Difficulty */}
                <article className="mb-6 sm:mb-10">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 text-orange-400 flex items-center gap-2">
                        <span>📊</span> Difficulty Modes
                    </h2>
                    <div className="space-y-2">
                        {(['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'] as const).map(mode => (
                            <a key={mode} href={`/mode/${mode.toLowerCase()}`} className="block bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm">
                                        <span>{modeData[mode].emoji}</span>
                                        <span className="font-bold">{mode}</span>
                                    </span>
                                    <span className="text-gray-500 text-xs">{modeData[mode].balls} balls • {modeData[mode].speed}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </article>

                {/* CTA */}
                <button onClick={() => onPlay('EASY')} className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-white mb-4 touch-manipulation">
                    Start Playing - 90 Seconds!
                </button>
                <a href="/" className="block text-center py-3 text-gray-400 hover:text-white text-sm">← Back to Menu</a>
            </main>

            <footer className="px-4 py-8 border-t border-white/5 text-center">
                <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                    <a href="/" className="hover:text-white">Play</a>
                    <a href="/tips" className="hover:text-white">Tips</a>
                    <a href="/faq" className="hover:text-white">FAQ</a>
                    <a href="/about" className="hover:text-white">About</a>
                </nav>
                <p className="text-gray-700 text-xs mt-2">© 2025 Combat Pong</p>
            </footer>
        </div>
    );
};
