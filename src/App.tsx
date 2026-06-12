/**
 * Application root. Routing stays dependency-free: three real routes, and
 * everything else renders the home page (vercel.json already rewrites all
 * paths to this SPA, so legacy URLs keep resolving).
 */

import { useCallback, useEffect, useState } from 'react';
import MainMenu from './components/MainMenu';
import HowToPlay from './components/HowToPlay';
import { getSavedMode } from './game/modePref';
import GameCanvas from './game/GameCanvas';
import type { ModeId } from './game/constants';

type Route = 'home' | 'play' | 'how-to-play';

const routeFromPath = (pathname: string): Route => {
    if (pathname === '/play') return 'play';
    if (pathname === '/how-to-play') return 'how-to-play';
    return 'home';
};

const TITLES: Record<Route, string> = {
    home: 'Combat Pong · a 90-second duel for territory',
    play: 'Combat Pong · playing',
    'how-to-play': 'How to play · Combat Pong',
};

const App = () => {
    const [route, setRoute] = useState<Route>(() => routeFromPath(window.location.pathname));
    const [mode, setMode] = useState<ModeId>(getSavedMode);

    const navigate = useCallback((path: string) => {
        window.history.pushState(null, '', path);
        setRoute(routeFromPath(path));
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const onPop = () => setRoute(routeFromPath(window.location.pathname));
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    useEffect(() => {
        document.title = TITLES[route];
    }, [route]);

    if (route === 'play') {
        return <GameCanvas mode={mode} onHome={() => navigate('/')} />;
    }

    if (route === 'how-to-play') {
        return <HowToPlay onPlay={() => navigate('/play')} onHome={() => navigate('/')} />;
    }

    return (
        <MainMenu
            onPlay={(selected) => {
                setMode(selected);
                navigate('/play');
            }}
            onHowTo={() => navigate('/how-to-play')}
        />
    );
};

export default App;
