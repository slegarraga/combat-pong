/**
 * Home. One idea: the living board. A real simulation idles behind the title;
 * one tap and you own the bottom paddle.
 */

import { useEffect, useRef, useState } from 'react';
import { MODES, MODE_ORDER, type ModeId } from '../game/constants';
import { advance, createEngine } from '../game/engine';
import { createRenderer } from '../game/render';
import { getStats } from '../game/PlayerStats';
import { getSavedMode, saveMode } from '../game/modePref';
import { isSoundEnabled, setSoundEnabled, unlockAudio } from '../game/audio';

interface MainMenuProps {
    onPlay: (mode: ModeId) => void;
    onHowTo: () => void;
}

const MainMenu = ({ onPlay, onHowTo }: MainMenuProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<ModeId>(getSavedMode);
    const [soundOn, setSoundOn] = useState(isSoundEnabled);
    const stats = useRef(getStats());

    const chooseMode = (next: ModeId) => {
        setMode(next);
        saveMode(next);
    };

    // Ambient simulation behind the title.
    useEffect(() => {
        const canvas = canvasRef.current!;
        const engine = createEngine('classic', true);
        const renderer = createRenderer(canvas);
        const observer = new ResizeObserver(() => renderer.resize());
        observer.observe(canvas);

        let raf = 0;
        let last = performance.now();
        const frame = (now: number) => {
            raf = requestAnimationFrame(frame);
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            advance(engine, dt);
            renderer.ingest(engine.events);
            engine.events.length = 0;
            renderer.draw(engine, dt);
        };
        raf = requestAnimationFrame(frame);
        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                unlockAudio();
                onPlay(mode);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mode, onPlay]);

    const toggleSound = () => {
        const next = !isSoundEnabled();
        setSoundEnabled(next);
        setSoundOn(next);
        if (next) unlockAudio();
    };

    const { games, wins } = stats.current;

    return (
        <div className="home">
            <header className="home-head">
                <h1 className="wordmark">Combat Pong</h1>
                <p className="tagline">A 90-second duel for territory.</p>
            </header>

            <div className="home-board">
                <canvas ref={canvasRef} className="board-canvas" aria-hidden="true" />
            </div>

            <div className="home-actions">
                <button
                    className="btn btn-play"
                    onClick={() => {
                        unlockAudio();
                        onPlay(mode);
                    }}
                >
                    Play
                </button>

                <div className="mode-row" role="radiogroup" aria-label="Mode">
                    {MODE_ORDER.map((id) => (
                        <button
                            key={id}
                            role="radio"
                            aria-checked={mode === id}
                            className={`mode-pill ${mode === id ? 'is-active' : ''}`}
                            onClick={() => chooseMode(id)}
                        >
                            {MODES[id].label}
                        </button>
                    ))}
                </div>
            </div>

            <footer className="home-foot">
                <button className="link-btn" onClick={onHowTo}>
                    how to play
                </button>
                <span className="dot">·</span>
                <button className="link-btn" onClick={toggleSound}>
                    sound {soundOn ? 'on' : 'off'}
                </button>
                <span className="dot">·</span>
                <a className="link-btn" href="https://github.com/slegarraga/combat-pong" target="_blank" rel="noreferrer">
                    open source
                </a>
                {games > 0 && (
                    <p className="home-stats">
                        {games} {games === 1 ? 'duel' : 'duels'} · {Math.round((wins / games) * 100)}% won
                    </p>
                )}
            </footer>
        </div>
    );
};

export default MainMenu;
