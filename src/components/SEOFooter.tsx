// Comprehensive SEO Footer with maximum interlinking
import React from 'react';

interface SEOFooterProps {
    currentPage?: string;
}

export const SEOFooter: React.FC<SEOFooterProps> = ({ currentPage }) => {
    const linkClass = "hover:text-white transition-colors";

    const isNotCurrent = (path: string) => currentPage !== path;

    return (
        <footer className="px-4 py-8 mt-8 border-t border-white/5">
            <div className="max-w-4xl mx-auto">
                {/* Primary Navigation */}
                <nav className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-6">
                    {isNotCurrent('/') && <a href="/" className={linkClass}>🏠 Home</a>}
                    {isNotCurrent('/how-to-play') && <a href="/how-to-play" className={linkClass}>📖 How to Play</a>}
                    {isNotCurrent('/tips') && <a href="/tips" className={linkClass}>💡 Tips & Tricks</a>}
                    {isNotCurrent('/faq') && <a href="/faq" className={linkClass}>❓ FAQ</a>}
                    {isNotCurrent('/about') && <a href="/about" className={linkClass}>ℹ️ About</a>}
                    {isNotCurrent('/multiplayer') && <a href="/multiplayer" className={linkClass}>⚡ Multiplayer</a>}
                </nav>

                {/* Game Modes */}
                <div className="mb-6">
                    <h3 className="text-center text-xs text-gray-600 mb-2">🎮 Game Modes</h3>
                    <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                        {isNotCurrent('/mode/easy') && <a href="/mode/easy" className={linkClass}>👶 Easy Mode</a>}
                        {isNotCurrent('/mode/medium') && <a href="/mode/medium" className={linkClass}>⚔️ Medium Mode</a>}
                        {isNotCurrent('/mode/hard') && <a href="/mode/hard" className={linkClass}>🔥 Hard Mode</a>}
                        {isNotCurrent('/mode/nightmare') && <a href="/mode/nightmare" className={linkClass}>💀 Nightmare Mode</a>}
                    </nav>
                </div>

                {/* Guides & Learn */}
                <div className="mb-6">
                    <h3 className="text-center text-xs text-gray-600 mb-2">📚 Guides</h3>
                    <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                        {isNotCurrent('/mechanics') && <a href="/mechanics" className={linkClass}>⚙️ Game Mechanics</a>}
                        {isNotCurrent('/streak-guide') && <a href="/streak-guide" className={linkClass}>🔥 Streak Guide</a>}
                        {isNotCurrent('/controls') && <a href="/controls" className={linkClass}>🎮 Controls</a>}
                        {isNotCurrent('/mobile') && <a href="/mobile" className={linkClass}>📱 Mobile Guide</a>}
                        {isNotCurrent('/high-score') && <a href="/high-score" className={linkClass}>🏆 High Score Strategy</a>}
                    </nav>
                </div>

                {/* Categories & Audiences */}
                <div className="mb-6">
                    <h3 className="text-center text-xs text-gray-600 mb-2">🎯 Play For</h3>
                    <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                        {isNotCurrent('/unblocked') && <a href="/unblocked" className={linkClass}>🎓 Unblocked</a>}
                        {isNotCurrent('/work-break') && <a href="/work-break" className={linkClass}>☕ Work Break</a>}
                        {isNotCurrent('/kids') && <a href="/kids" className={linkClass}>👨‍👩‍👧‍👦 Kids & Family</a>}
                        {isNotCurrent('/relaxing') && <a href="/relaxing" className={linkClass}>😌 Relaxing</a>}
                        {isNotCurrent('/focus') && <a href="/focus" className={linkClass}>🧠 Focus Training</a>}
                        {isNotCurrent('/reaction-time') && <a href="/reaction-time" className={linkClass}>⚡ Reflex Training</a>}
                    </nav>
                </div>

                {/* Game Types */}
                <div className="mb-6">
                    <h3 className="text-center text-xs text-gray-600 mb-2">🕹️ Game Types</h3>
                    <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                        {isNotCurrent('/arcade') && <a href="/arcade" className={linkClass}>👾 Arcade</a>}
                        {isNotCurrent('/retro') && <a href="/retro" className={linkClass}>🕹️ Retro</a>}
                        {isNotCurrent('/ball-games') && <a href="/ball-games" className={linkClass}>⚽ Ball Games</a>}
                        {isNotCurrent('/paddle-games') && <a href="/paddle-games" className={linkClass}>🏓 Paddle Games</a>}
                        {isNotCurrent('/territory') && <a href="/territory" className={linkClass}>🗺️ Territory Games</a>}
                        {isNotCurrent('/skill-games') && <a href="/skill-games" className={linkClass}>🎯 Skill Games</a>}
                    </nav>
                </div>

                {/* Quick Play */}
                <div className="mb-6">
                    <h3 className="text-center text-xs text-gray-600 mb-2">⏱️ Quick Play</h3>
                    <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                        {isNotCurrent('/quick-games') && <a href="/quick-games" className={linkClass}>⚡ Quick Games</a>}
                        {isNotCurrent('/bored') && <a href="/bored" className={linkClass}>😐 Bored?</a>}
                        {isNotCurrent('/lunch-break') && <a href="/lunch-break" className={linkClass}>🍔 Lunch Break</a>}
                        {isNotCurrent('/waiting-room') && <a href="/waiting-room" className={linkClass}>⏳ Waiting Room</a>}
                        {isNotCurrent('/addictive') && <a href="/addictive" className={linkClass}>🎰 Addictive Games</a>}
                        {isNotCurrent('/solo') && <a href="/solo" className={linkClass}>👤 Solo Games</a>}
                    </nav>
                </div>

                {/* More Links */}
                <div className="mb-6">
                    <h3 className="text-center text-xs text-gray-600 mb-2">📌 More</h3>
                    <nav className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                        {isNotCurrent('/history') && <a href="/history" className={linkClass}>📜 Pong History</a>}
                        {isNotCurrent('/challenge') && <a href="/challenge" className={linkClass}>🏆 Challenges</a>}
                        {isNotCurrent('/compare') && <a href="/compare" className={linkClass}>⚖️ vs Other Games</a>}
                        {isNotCurrent('/updates') && <a href="/updates" className={linkClass}>🆕 Updates</a>}
                        {isNotCurrent('/browsers') && <a href="/browsers" className={linkClass}>🌐 Browser Support</a>}
                        {isNotCurrent('/no-download') && <a href="/no-download" className={linkClass}>📥 No Download</a>}
                        {isNotCurrent('/offline') && <a href="/offline" className={linkClass}>📴 Offline Play</a>}
                        {isNotCurrent('/two-player') && <a href="/two-player" className={linkClass}>👥 2 Player</a>}
                        {isNotCurrent('/best-free') && <a href="/best-free" className={linkClass}>⭐ Best Free Games</a>}
                        {isNotCurrent('/accessibility') && <a href="/accessibility" className={linkClass}>♿ Accessibility</a>}
                        {isNotCurrent('/timer-games') && <a href="/timer-games" className={linkClass}>⏱️ Timer Games</a>}
                    </nav>
                </div>

                <p className="text-gray-700 text-xs text-center">© 2025 Combat Pong. Free online browser game.</p>
            </div>
        </footer>
    );
};

export default SEOFooter;
