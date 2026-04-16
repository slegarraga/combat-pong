/**
 * Application root for the rebuilt anonymous duel product.
 *
 * Routing intentionally stays dependency-free: `window.location.pathname` is
 * enough for this site, keeps the bundle small, and still allows SEO-focused
 * landing pages to live alongside the playable app.
 */

import { useEffect, useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { ModeLandingPage, HowToPlayPage } from './components/SEOPages';
import { FAQPage, AboutPage, TipsPage, MultiplayerInfoPage } from './components/MoreSEOPages';
import { MechanicsPage, StreakGuidePage, MobileGuidePage, ControlsPage } from './components/ExtendedSEOPages';
import { PongHistoryPage, ChallengePage, HighScorePage, BrowserCompatPage, UpdatesPage, VsOtherGamesPage } from './components/AdditionalSEOPages';
import { UnblockedPage, WorkBreakPage, ReactionTimePage, OfflinePage, ArcadePage, AccessibilityPage } from './components/TargetedSEOPages';
import { KidsPage, TwoPlayerPage, BestFreeGamesPage, NoDownloadPage, RelaxingPage, FocusPage } from './components/MoreTargetedSEOPages';
import { BoredPage, WaitingRoomPage, LunchBreakPage, QuickGamesPage, AddictivePage, SoloPage, BallGamesPage, RetroPage, PaddleGamesPage, TerritoryPage, TimerGamesPage, SkillGamesPage } from './components/FinalSEOPages';
import { primeArenaAudio } from './game/audio';
import { GameCanvas } from './game/GameCanvas';
import type { Difficulty } from './game/types';

type Route =
  | 'home'
  | 'game'
  | 'mode-easy'
  | 'mode-medium'
  | 'mode-hard'
  | 'mode-nightmare'
  | 'how-to-play'
  | 'multiplayer'
  | 'faq'
  | 'about'
  | 'tips'
  | 'mechanics'
  | 'streak-guide'
  | 'mobile'
  | 'controls'
  | 'history'
  | 'challenge'
  | 'high-score'
  | 'browsers'
  | 'updates'
  | 'compare'
  | 'unblocked'
  | 'work-break'
  | 'reaction-time'
  | 'offline'
  | 'arcade'
  | 'accessibility'
  | 'kids'
  | 'two-player'
  | 'best-free'
  | 'no-download'
  | 'relaxing'
  | 'focus'
  | 'bored'
  | 'waiting-room'
  | 'lunch-break'
  | 'quick-games'
  | 'addictive'
  | 'solo'
  | 'ball-games'
  | 'retro'
  | 'paddle-games'
  | 'territory'
  | 'timer-games'
  | 'skill-games';

const ROUTE_PATHS: Record<Route, string> = {
  home: '/',
  game: '/play',
  'mode-easy': '/mode/easy',
  'mode-medium': '/mode/medium',
  'mode-hard': '/mode/hard',
  'mode-nightmare': '/mode/nightmare',
  'how-to-play': '/how-to-play',
  multiplayer: '/multiplayer',
  faq: '/faq',
  about: '/about',
  tips: '/tips',
  mechanics: '/mechanics',
  'streak-guide': '/streak-guide',
  mobile: '/mobile',
  controls: '/controls',
  history: '/history',
  challenge: '/challenge',
  'high-score': '/high-score',
  browsers: '/browsers',
  updates: '/updates',
  compare: '/compare',
  unblocked: '/unblocked',
  'work-break': '/work-break',
  'reaction-time': '/reaction-time',
  offline: '/offline',
  arcade: '/arcade',
  accessibility: '/accessibility',
  kids: '/kids',
  'two-player': '/two-player',
  'best-free': '/best-free',
  'no-download': '/no-download',
  relaxing: '/relaxing',
  focus: '/focus',
  bored: '/bored',
  'waiting-room': '/waiting-room',
  'lunch-break': '/lunch-break',
  'quick-games': '/quick-games',
  addictive: '/addictive',
  solo: '/solo',
  'ball-games': '/ball-games',
  retro: '/retro',
  'paddle-games': '/paddle-games',
  territory: '/territory',
  'timer-games': '/timer-games',
  'skill-games': '/skill-games',
};

const resolveRoute = (pathname: string): Route => {
  if (pathname.startsWith('/play')) return 'game';
  if (pathname.startsWith('/mode/easy')) return 'mode-easy';
  if (pathname.startsWith('/mode/medium')) return 'mode-medium';
  if (pathname.startsWith('/mode/hard')) return 'mode-hard';
  if (pathname.startsWith('/mode/nightmare')) return 'mode-nightmare';
  if (pathname.startsWith('/how-to-play')) return 'how-to-play';
  if (pathname.startsWith('/multiplayer')) return 'multiplayer';
  if (pathname.startsWith('/faq')) return 'faq';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/tips')) return 'tips';
  if (pathname.startsWith('/mechanics')) return 'mechanics';
  if (pathname.startsWith('/streak-guide')) return 'streak-guide';
  if (pathname.startsWith('/mobile')) return 'mobile';
  if (pathname.startsWith('/controls')) return 'controls';
  if (pathname.startsWith('/history')) return 'history';
  if (pathname.startsWith('/challenge')) return 'challenge';
  if (pathname.startsWith('/high-score')) return 'high-score';
  if (pathname.startsWith('/browsers')) return 'browsers';
  if (pathname.startsWith('/updates')) return 'updates';
  if (pathname.startsWith('/compare')) return 'compare';
  if (pathname.startsWith('/unblocked')) return 'unblocked';
  if (pathname.startsWith('/work-break')) return 'work-break';
  if (pathname.startsWith('/reaction-time')) return 'reaction-time';
  if (pathname.startsWith('/offline')) return 'offline';
  if (pathname.startsWith('/arcade')) return 'arcade';
  if (pathname.startsWith('/accessibility')) return 'accessibility';
  if (pathname.startsWith('/kids')) return 'kids';
  if (pathname.startsWith('/two-player')) return 'two-player';
  if (pathname.startsWith('/best-free')) return 'best-free';
  if (pathname.startsWith('/no-download')) return 'no-download';
  if (pathname.startsWith('/relaxing')) return 'relaxing';
  if (pathname.startsWith('/focus')) return 'focus';
  if (pathname.startsWith('/bored')) return 'bored';
  if (pathname.startsWith('/waiting-room')) return 'waiting-room';
  if (pathname.startsWith('/lunch-break')) return 'lunch-break';
  if (pathname.startsWith('/quick-games')) return 'quick-games';
  if (pathname.startsWith('/addictive')) return 'addictive';
  if (pathname.startsWith('/solo')) return 'solo';
  if (pathname.startsWith('/ball-games')) return 'ball-games';
  if (pathname.startsWith('/retro')) return 'retro';
  if (pathname.startsWith('/paddle-games')) return 'paddle-games';
  if (pathname.startsWith('/territory')) return 'territory';
  if (pathname.startsWith('/timer-games')) return 'timer-games';
  if (pathname.startsWith('/skill-games')) return 'skill-games';
  return 'home';
};

function App() {
  const [route, setRoute] = useState<Route>(() => resolveRoute(window.location.pathname));
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');

  useEffect(() => {
    const handlePopState = () => setRoute(resolveRoute(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (nextRoute: Route) => {
    window.history.pushState({}, '', ROUTE_PATHS[nextRoute]);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setRoute(nextRoute);
  };

  const startGame = (nextDifficulty: Difficulty) => {
    void primeArenaAudio();
    setDifficulty(nextDifficulty);
    navigateTo('game');
  };

  const seoPageProps = {
    onBack: () => navigateTo('home'),
    onPlay: startGame,
  };

  if (route === 'game') {
    return (
      <GameCanvas
        difficulty={difficulty}
        onBack={() => navigateTo('home')}
        onChangeDifficulty={setDifficulty}
      />
    );
  }

  if (route === 'mode-easy') return <ModeLandingPage mode="EASY" onPlay={() => startGame('EASY')} onBack={() => navigateTo('home')} />;
  if (route === 'mode-medium') return <ModeLandingPage mode="MEDIUM" onPlay={() => startGame('MEDIUM')} onBack={() => navigateTo('home')} />;
  if (route === 'mode-hard') return <ModeLandingPage mode="HARD" onPlay={() => startGame('HARD')} onBack={() => navigateTo('home')} />;
  if (route === 'mode-nightmare') return <ModeLandingPage mode="NIGHTMARE" onPlay={() => startGame('NIGHTMARE')} onBack={() => navigateTo('home')} />;

  if (route === 'how-to-play') return <HowToPlayPage {...seoPageProps} />;
  if (route === 'faq') return <FAQPage {...seoPageProps} />;
  if (route === 'about') return <AboutPage {...seoPageProps} />;
  if (route === 'tips') return <TipsPage {...seoPageProps} />;
  if (route === 'multiplayer') return <MultiplayerInfoPage {...seoPageProps} />;
  if (route === 'mechanics') return <MechanicsPage {...seoPageProps} />;
  if (route === 'streak-guide') return <StreakGuidePage {...seoPageProps} />;
  if (route === 'mobile') return <MobileGuidePage {...seoPageProps} />;
  if (route === 'controls') return <ControlsPage {...seoPageProps} />;

  if (route === 'history') return <PongHistoryPage {...seoPageProps} />;
  if (route === 'challenge') return <ChallengePage {...seoPageProps} />;
  if (route === 'high-score') return <HighScorePage {...seoPageProps} />;
  if (route === 'browsers') return <BrowserCompatPage {...seoPageProps} />;
  if (route === 'updates') return <UpdatesPage {...seoPageProps} />;
  if (route === 'compare') return <VsOtherGamesPage {...seoPageProps} />;

  if (route === 'unblocked') return <UnblockedPage {...seoPageProps} />;
  if (route === 'work-break') return <WorkBreakPage {...seoPageProps} />;
  if (route === 'reaction-time') return <ReactionTimePage {...seoPageProps} />;
  if (route === 'offline') return <OfflinePage {...seoPageProps} />;
  if (route === 'arcade') return <ArcadePage {...seoPageProps} />;
  if (route === 'accessibility') return <AccessibilityPage {...seoPageProps} />;

  if (route === 'kids') return <KidsPage {...seoPageProps} />;
  if (route === 'two-player') return <TwoPlayerPage {...seoPageProps} />;
  if (route === 'best-free') return <BestFreeGamesPage {...seoPageProps} />;
  if (route === 'no-download') return <NoDownloadPage {...seoPageProps} />;
  if (route === 'relaxing') return <RelaxingPage {...seoPageProps} />;
  if (route === 'focus') return <FocusPage {...seoPageProps} />;

  if (route === 'bored') return <BoredPage {...seoPageProps} />;
  if (route === 'waiting-room') return <WaitingRoomPage {...seoPageProps} />;
  if (route === 'lunch-break') return <LunchBreakPage {...seoPageProps} />;
  if (route === 'quick-games') return <QuickGamesPage {...seoPageProps} />;
  if (route === 'addictive') return <AddictivePage {...seoPageProps} />;
  if (route === 'solo') return <SoloPage {...seoPageProps} />;
  if (route === 'ball-games') return <BallGamesPage {...seoPageProps} />;
  if (route === 'retro') return <RetroPage {...seoPageProps} />;
  if (route === 'paddle-games') return <PaddleGamesPage {...seoPageProps} />;
  if (route === 'territory') return <TerritoryPage {...seoPageProps} />;
  if (route === 'timer-games') return <TimerGamesPage {...seoPageProps} />;
  if (route === 'skill-games') return <SkillGamesPage {...seoPageProps} />;

  return <MainMenu onStartGame={startGame} />;
}

export default App;
