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
import { UnblockedPage, WorkBreakPage, ReactionTimePage, OfflinePage, ArcadePage, AccessibilityPage } from './components/TargetedSEOPages';
import { KidsPage, TwoPlayerPage, BestFreeGamesPage, NoDownloadPage, RelaxingPage, FocusPage } from './components/MoreTargetedSEOPages';
import { BoredPage, WaitingRoomPage, LunchBreakPage, QuickGamesPage, AddictivePage, SoloPage, BallGamesPage, RetroPage, PaddleGamesPage, TerritoryPage, TimerGamesPage, SkillGamesPage } from './components/FinalSEOPages';

type Route = 'home' | 'game' | 'auth' | 'mode-easy' | 'mode-medium' | 'mode-hard' | 'mode-nightmare' | 'how-to-play' | 'multiplayer' | 'faq' | 'about' | 'tips' | 'mechanics' | 'streak-guide' | 'mobile' | 'controls' | 'history' | 'challenge' | 'high-score' | 'browsers' | 'updates' | 'compare' | 'unblocked' | 'work-break' | 'reaction-time' | 'offline' | 'arcade' | 'accessibility' | 'kids' | 'two-player' | 'best-free' | 'no-download' | 'relaxing' | 'focus' | 'bored' | 'waiting-room' | 'lunch-break' | 'quick-games' | 'addictive' | 'solo' | 'ball-games' | 'retro' | 'paddle-games' | 'territory' | 'timer-games' | 'skill-games';

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
    else if (path.startsWith('/unblocked')) setRoute('unblocked');
    else if (path.startsWith('/work-break')) setRoute('work-break');
    else if (path.startsWith('/reaction-time')) setRoute('reaction-time');
    else if (path.startsWith('/offline')) setRoute('offline');
    else if (path.startsWith('/arcade')) setRoute('arcade');
    else if (path.startsWith('/accessibility')) setRoute('accessibility');
    else if (path.startsWith('/kids')) setRoute('kids');
    else if (path.startsWith('/two-player')) setRoute('two-player');
    else if (path.startsWith('/best-free')) setRoute('best-free');
    else if (path.startsWith('/no-download')) setRoute('no-download');
    else if (path.startsWith('/relaxing')) setRoute('relaxing');
    else if (path.startsWith('/focus')) setRoute('focus');
    else if (path.startsWith('/bored')) setRoute('bored');
    else if (path.startsWith('/waiting-room')) setRoute('waiting-room');
    else if (path.startsWith('/lunch-break')) setRoute('lunch-break');
    else if (path.startsWith('/quick-games')) setRoute('quick-games');
    else if (path.startsWith('/addictive')) setRoute('addictive');
    else if (path.startsWith('/solo')) setRoute('solo');
    else if (path.startsWith('/ball-games')) setRoute('ball-games');
    else if (path.startsWith('/retro')) setRoute('retro');
    else if (path.startsWith('/paddle-games')) setRoute('paddle-games');
    else if (path.startsWith('/territory')) setRoute('territory');
    else if (path.startsWith('/timer-games')) setRoute('timer-games');
    else if (path.startsWith('/skill-games')) setRoute('skill-games');
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
      'compare': '/compare',
      'unblocked': '/unblocked',
      'work-break': '/work-break',
      'reaction-time': '/reaction-time',
      'offline': '/offline',
      'arcade': '/arcade',
      'accessibility': '/accessibility',
      'kids': '/kids',
      'two-player': '/two-player',
      'best-free': '/best-free',
      'no-download': '/no-download',
      'relaxing': '/relaxing',
      'focus': '/focus',
      'bored': '/bored',
      'waiting-room': '/waiting-room',
      'lunch-break': '/lunch-break',
      'quick-games': '/quick-games',
      'addictive': '/addictive',
      'solo': '/solo',
      'ball-games': '/ball-games',
      'retro': '/retro',
      'paddle-games': '/paddle-games',
      'territory': '/territory',
      'timer-games': '/timer-games',
      'skill-games': '/skill-games'
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

  // Targeted SEO Pages
  if (route === 'unblocked') return <UnblockedPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'work-break') return <WorkBreakPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'reaction-time') return <ReactionTimePage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'offline') return <OfflinePage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'arcade') return <ArcadePage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'accessibility') return <AccessibilityPage onBack={() => navigateTo('home')} onPlay={startGame} />;

  // More Targeted SEO Pages
  if (route === 'kids') return <KidsPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'two-player') return <TwoPlayerPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'best-free') return <BestFreeGamesPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'no-download') return <NoDownloadPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'relaxing') return <RelaxingPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'focus') return <FocusPage onBack={() => navigateTo('home')} onPlay={startGame} />;

  // Final Long-Tail SEO Pages
  if (route === 'bored') return <BoredPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'waiting-room') return <WaitingRoomPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'lunch-break') return <LunchBreakPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'quick-games') return <QuickGamesPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'addictive') return <AddictivePage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'solo') return <SoloPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'ball-games') return <BallGamesPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'retro') return <RetroPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'paddle-games') return <PaddleGamesPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'territory') return <TerritoryPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'timer-games') return <TimerGamesPage onBack={() => navigateTo('home')} onPlay={startGame} />;
  if (route === 'skill-games') return <SkillGamesPage onBack={() => navigateTo('home')} onPlay={startGame} />;
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
