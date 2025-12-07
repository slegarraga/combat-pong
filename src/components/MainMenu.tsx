import { supabase } from '../supabaseClient'

interface MainMenuProps {
    onStartGame: (difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE') => void;
    onLoginClick: () => void;
    session: any;
    onFindMatch?: () => void;
    matchmakingStatus?: 'idle' | 'searching' | 'matched';
}

export const MainMenu = ({ onStartGame, onLoginClick, session, onFindMatch, matchmakingStatus }: MainMenuProps) => {
    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen min-h-[100dvh] px-4 py-8 sm:py-12 md:py-16 text-white relative overflow-hidden"
            style={{ background: '#1a1a2e' }}
        >
            {/* Title - Simple white */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-2 sm:mb-4 tracking-tighter relative z-10 drop-shadow-2xl text-center text-white">
                COMBAT PONG
            </h1>
            <p className="text-base sm:text-xl text-gray-400 mb-6 sm:mb-12 relative z-10">
                Protect your territory!
            </p>

            {/* User Status */}
            {session && (
                <div className="absolute top-3 left-3 sm:top-6 sm:left-6 text-xs sm:text-sm text-gray-400 bg-white/5 px-2 sm:px-4 py-1 sm:py-2 rounded-full backdrop-blur max-w-[40vw] truncate">
                    ✨ {session.user.email}
                </div>
            )}

            {/* Single Player Section */}
            <div className="relative z-10 mb-6 sm:mb-8 w-full max-w-xs sm:max-w-sm">
                <div className="text-center text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-widest">
                    Choose Difficulty
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                        onClick={() => onStartGame('EASY')}
                        className="btn-gradient py-4 sm:py-4 min-h-[60px] rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 touch-manipulation text-white"
                    >
                        👶 EASY
                        <div className="text-[10px] sm:text-xs opacity-80 mt-1">2 Balls • 3 ❤️</div>
                    </button>
                    <button
                        onClick={() => onStartGame('MEDIUM')}
                        className="btn-gradient py-4 sm:py-4 min-h-[60px] rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 touch-manipulation text-white"
                    >
                        ⚔️ MEDIUM
                        <div className="text-[10px] sm:text-xs opacity-80 mt-1">2 Balls • 3 ❤️</div>
                    </button>
                    <button
                        onClick={() => onStartGame('HARD')}
                        className="btn-gradient py-4 sm:py-4 min-h-[60px] rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 touch-manipulation text-white"
                    >
                        🔥 HARD
                        <div className="text-[10px] sm:text-xs opacity-80 mt-1">4 Balls • 3 ❤️</div>
                    </button>
                    <button
                        onClick={() => onStartGame('NIGHTMARE')}
                        className="btn-gradient py-4 sm:py-4 min-h-[60px] rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 touch-manipulation text-white"
                    >
                        💀 NIGHTMARE
                        <div className="text-[10px] sm:text-xs opacity-80 mt-1">6 Balls • 3 ❤️</div>
                    </button>
                </div>
            </div>

            {/* Multiplayer Section */}
            <div className="relative z-10 mt-4 sm:mt-8 w-full max-w-xs sm:max-w-sm">
                <div className="text-center text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-widest">
                    Multiplayer
                </div>
                {session ? (
                    <button
                        onClick={onFindMatch}
                        disabled={matchmakingStatus === 'searching'}
                        className="btn-gradient w-full py-4 min-h-[56px] rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 touch-manipulation text-white"
                    >
                        {matchmakingStatus === 'searching' ? '🔍 Finding...' : '⚡ FIND MATCH'}
                    </button>
                ) : (
                    <button
                        onClick={onLoginClick}
                        className="w-full py-4 min-h-[56px] bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl font-bold text-sm sm:text-base transition-all border border-white/10 touch-manipulation"
                    >
                        🔐 Login to Play VS
                    </button>
                )}
            </div>

            {/* Auth buttons */}
            {session ? (
                <button
                    onClick={() => supabase.auth.signOut()}
                    className="absolute top-3 right-3 sm:top-6 sm:right-6 text-gray-400 hover:text-white text-xs sm:text-sm bg-white/5 hover:bg-white/10 px-3 sm:px-4 py-2 min-h-[44px] rounded-full backdrop-blur transition-all touch-manipulation"
                >
                    Sign Out
                </button>
            ) : (
                <button
                    onClick={onLoginClick}
                    className="absolute top-3 right-3 sm:top-6 sm:right-6 text-gray-300 hover:text-white text-xs sm:text-sm bg-white/5 hover:bg-white/10 px-3 sm:px-4 py-2 min-h-[44px] rounded-full backdrop-blur transition-all touch-manipulation"
                >
                    Login
                </button>
            )}

            {/* Footer */}
            <div className="absolute bottom-3 sm:bottom-6 text-gray-500 text-[10px] sm:text-xs text-center px-4">
                Inspired by{' '}
                <a href="https://github.com/vnglst/pong-wars" className="underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                    Pong Wars
                </a>
            </div>
        </div>
    );
};
