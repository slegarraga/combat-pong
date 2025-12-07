import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Auth } from './components/Auth';
import { MainMenu } from './components/MainMenu';
import { GameCanvas } from './game/GameCanvas';
import { useMatchmaking } from './game/network/Matchmaking';
import { MultiplayerGame } from './game/network/MultiplayerGame';

function App() {
  const [session, setSession] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE'>('MEDIUM');

  const { findMatch, match, status: matchmakingStatus } = useMatchmaking(session ? session.user : null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setShowAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const startGame = (diff: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE') => {
    setDifficulty(diff);
    setGameStarted(true);
  };

  // If Multiplayer Match Found
  if (match) {
    return (
      <MultiplayerGame
        roomId={match.roomId}
        isHost={match.isHost}
        onExit={() => window.location.reload()} // Simple exit for now
      />
    );
  }

  // If Single Player Game Started
  if (gameStarted) {
    return (
      <div className="w-full h-full">
        <button
          onClick={() => setGameStarted(false)}
          className="fixed top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded opacity-50 hover:opacity-100 transition z-50"
        >
          Back to Menu
        </button>
        <GameCanvas difficulty={difficulty} />
      </div>
    );
  }

  if (showAuth && !session) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowAuth(false)}
          className="fixed top-4 left-4 text-white z-50"
        >
          ← Back
        </button>
        <Auth />
      </div>
    )
  }

  return (
    <MainMenu
      onStartGame={startGame}
      onLoginClick={() => setShowAuth(true)}
      session={session}
      onFindMatch={findMatch}
      matchmakingStatus={matchmakingStatus}
    />
  );
}

export default App;
