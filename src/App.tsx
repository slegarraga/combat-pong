import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Auth } from './components/Auth';
import { MainMenu } from './components/MainMenu';
import { GameCanvas } from './game/GameCanvas';
import { useMatchmaking } from './game/network/Matchmaking';
import { MultiplayerGame } from './game/network/MultiplayerGame';
import { ModeLandingPage, HowToPlayPage } from './components/SEOPages';
import { FAQPage, AboutPage, TipsPage, MultiplayerInfoPage } from './components/MoreSEOPages';
import { MechanicsPage, StreakGuidePage, MobileGuidePage, ControlsPage } from './components/ExtendedSEOPages';
import { PongHistoryPage, ChallengePage, HighScorePage, BrowserCompatPage, UpdatesPage, VsOtherGamesPage } from './components/AdditionalSEOPages';

type Route = 'home' | 'game' | 'auth' | 'mode-easy' | 'mode-medium' | 'mode-hard' | 'mode-nightmare' | 'how-to-play' | 'multiplayer' | 'faq' | 'about' | 'tips' | 'mechanics' | 'streak-guide' | 'mobile' | 'controls' | 'history' | 'challenge' | 'high-score' | 'browsers' | 'updates' | 'compare';

function App() {
  const [session, setSession] = useState<any>(null);
  const [route, setRoute] = useState<Route>('home');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE'>('MEDIUM');

  const { findMatch, match, status: matchmakingStatus } = useMatchmaking(session ? session.user : null);

  // Parse URL for SEO routes
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/mode/easy')) setRoute('mode-easy');
    else if (path.startsWith('/mode/medium')) setRoute('mode-medium');
    else if (path.startsWith('/mode/hard')) setRoute('mode-hard');
    else if (path.startsWith('/mode/nightmare')) setRoute('mode-nightmare');
    else if (path.startsWith('/how-to-play')) setRoute('how-to-play');
    else if (path.startsWith('/multiplayer')) setRoute('multiplayer');
    else if (path.startsWith('/faq')) setRoute('faq');
    else if (path.startsWith('/about')) setRoute('about');
    else if (path.startsWith('/tips')) setRoute('tips');
    else if (path.startsWith('/mechanics')) setRoute('mechanics');
    else if (path.startsWith('/streak-guide')) setRoute('streak-guide');
    else if (path.startsWith('/mobile')) setRoute('mobile');
    else if (path.startsWith('/controls')) setRoute('controls');
    else if (path.startsWith('/history')) setRoute('history');
    else if (path.startsWith('/challenge')) setRoute('challenge');
    else if (path.startsWith('/high-score')) setRoute('high-score');
    else if (path.startsWith('/browsers')) setRoute('browsers');
    else if (path.startsWith('/updates')) setRoute('updates');
    else if (path.startsWith('/compare')) setRoute('compare');
    else setRoute('home');
  }, []);

  // Update URL when route changes
  const navigateTo = (newRoute: Route) => {
    const pathMap: Record<Route, string> = {
      'home': '/',
      'game': '/',
      'auth': '/',
      'mode-easy': '/mode/easy',
      'mode-medium': '/mode/medium',
      'mode-hard': '/mode/hard',
      'mode-nightmare': '/mode/nightmare',
      'how-to-play': '/how-to-play',
      'multiplayer': '/multiplayer',
      'faq': '/faq',
      'about': '/about',
      'tips': '/tips',
      'mechanics': '/mechanics',
      'streak-guide': '/streak-guide',
      'mobile': '/mobile',
      'controls': '/controls',
      'history': '/history',
      'challenge': '/challenge',
      'high-score': '/high-score',
      'browsers': '/browsers',
      'updates': '/updates',
      'compare': '/compare'
    };
    window.history.pushState({}, '', pathMap[newRoute]);
    setRoute(newRoute);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && route === 'auth') navigateTo('home');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && route === 'auth') navigateTo('home');
    });

    return () => subscription.unsubscribe();
  }, []);

  const startGame = (diff: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE') => {
    setDifficulty(diff);
    navigateTo('game');
  };

  // Multiplayer Match
  if (match) {
    return (
      <MultiplayerGame
        roomId={match.roomId}
        isHost={match.isHost}
        onExit={() => { navigateTo('home'); window.location.reload(); }}
      />
    );
  }

  // Game View
  if (route === 'game') {
    return (
      <GameCanvas
        difficulty={difficulty}
        onBack={() => navigateTo('home')}
      />
    );
  }

  // Auth View
  if (route === 'auth') {
    return (
      <div className="relative">
        <button onClick={() => navigateTo('home')} className="fixed top-4 left-4 text-white z-50">
          ← Back
        </button>
        <Auth />
      </div>
    );
  }

  // SEO Mode Landing Pages
  if (route === 'mode-easy') return <ModeLandingPage mode="EASY" onPlay={() => startGame('EASY')} onBack={() => navigateTo('home')} />;
  if (route === 'mode-medium') return <ModeLandingPage mode="MEDIUM" onPlay={() => startGame('MEDIUM')} onBack={() => navigateTo('home')} />;
  if (route === 'mode-hard') return <ModeLandingPage mode="HARD" onPlay={() => startGame('HARD')} onBack={() => navigateTo('home')} />;
  if (route === 'mode-nightmare') return <ModeLandingPage mode="NIGHTMARE" onPlay={() => startGame('NIGHTMARE')} onBack={() => navigateTo('home')} />;

  // Info Pages
  if (route === 'how-to-play') return <HowToPlayPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'faq') return <FAQPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'about') return <AboutPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'tips') return <TipsPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'multiplayer') return <MultiplayerInfoPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'mechanics') return <MechanicsPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'streak-guide') return <StreakGuidePage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'mobile') return <MobileGuidePage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'controls') return <ControlsPage onBack={() => navigateTo('home')} onPlay={startGame} />;

  // Additional SEO Pages
  if (route === 'history') return <PongHistoryPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'challenge') return <ChallengePage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'high-score') return <HighScorePage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'browsers') return <BrowserCompatPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'updates') return <UpdatesPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'compare') return <VsOtherGamesPage onBack={() => navigateTo('home')} onPlay={startGame} />;

  // Main Menu (Home)
  return (
    <MainMenu
      onStartGame={startGame}
      onLoginClick={() => navigateTo('auth')}
      session={session}
      onFindMatch={findMatch}
      matchmakingStatus={matchmakingStatus}
    />
  );
}

export default App;
