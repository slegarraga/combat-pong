/**
 * The match screen. Owns the rAF loop and wires engine → renderer → audio.
 *
 * HUD numbers are written straight to the DOM (no re-renders at 60fps);
 * React state only changes on phase transitions (playing / paused / over).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { BOARD_SIZE, MATCH_DURATION, type ModeId } from './constants';
import { advance, createEngine, dayShare, setPlayerTarget } from './engine';
import { createRenderer, type Renderer } from './render';
import { isSoundEnabled, playCapture, playEnd, playMiss, playPaddle, setSoundEnabled, unlockAudio } from './audio';
import { recordMatch } from './PlayerStats';
import { shareResult } from './ShareCard';
import type { EngineState, MatchResult } from './types';

type Phase = 'playing' | 'paused' | 'over';

const formatClock = (seconds: number) => {
    const s = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

interface GameCanvasProps {
    mode: ModeId;
    onHome: () => void;
}

const GameCanvas = ({ mode, onHome }: GameCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<EngineState>();
    const rendererRef = useRef<Renderer>();
    const phaseRef = useRef<Phase>('playing');

    const clockRef = useRef<HTMLButtonElement>(null);
    const dayPctRef = useRef<HTMLSpanElement>(null);
    const nightPctRef = useRef<HTMLSpanElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const streakRef = useRef<HTMLDivElement>(null);

    const [phase, setPhase] = useState<Phase>('playing');
    const [result, setResult] = useState<MatchResult | null>(null);
    const [soundOn, setSoundOn] = useState(isSoundEnabled);
    const [shareState, setShareState] = useState<'idle' | 'busy' | 'done'>('idle');

    const setPhaseBoth = useCallback((next: Phase) => {
        phaseRef.current = next;
        setPhase(next);
    }, []);

    const restart = useCallback(() => {
        engineRef.current = createEngine(mode);
        setResult(null);
        setShareState('idle');
        setPhaseBoth('playing');
    }, [mode, setPhaseBoth]);

    // Boot engine + renderer + loop
    useEffect(() => {
        const canvas = canvasRef.current!;
        engineRef.current = createEngine(mode);
        rendererRef.current = createRenderer(canvas);
        setResult(null);
        setPhaseBoth('playing');

        const observer = new ResizeObserver(() => rendererRef.current?.resize());
        observer.observe(canvas);

        let raf = 0;
        let last = performance.now();
        let lastClock = '';
        let lastShare = -1;

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame);
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            const engine = engineRef.current!;
            const renderer = rendererRef.current!;

            if (phaseRef.current === 'playing') {
                advance(engine, dt);

                const events = engine.events;
                if (events.length > 0) {
                    renderer.ingest(events);
                    for (const e of events) {
                        if (e.type === 'capture') playCapture(e.team, e.row);
                        else if (e.type === 'paddle') {
                            playPaddle(e.side, e.streak, (e.side === 'player') === (e.ballTeam === 'day'));
                        } else if (e.type === 'miss') playMiss(e.side);
                        else if (e.type === 'over') {
                            const final: MatchResult = {
                                won: e.winner === 'day',
                                draw: e.winner === 'draw',
                                dayShare: dayShare(engine),
                                bestStreak: engine.bestStreak,
                                tilesFlipped: engine.tilesFlipped,
                                mode,
                                grid: engine.grid.slice(),
                            };
                            recordMatch(final);
                            playEnd(final.draw ? 'draw' : final.won ? 'win' : 'loss');
                            setResult(final);
                            setPhaseBoth('over');
                        }
                    }
                    events.length = 0;
                }

                // HUD: write straight to the DOM, only when values change.
                const clock = formatClock(engine.timeLeft);
                if (clock !== lastClock && clockRef.current) {
                    lastClock = clock;
                    clockRef.current.textContent = clock;
                    clockRef.current.classList.toggle('clock-low', engine.timeLeft <= 10);
                }
                const share = dayShare(engine);
                if (share !== lastShare) {
                    lastShare = share;
                    if (dayPctRef.current) dayPctRef.current.textContent = String(share);
                    if (nightPctRef.current) nightPctRef.current.textContent = String(100 - share);
                    if (barRef.current) barRef.current.style.width = `${share}%`;
                }
                if (streakRef.current) {
                    const streak = engine.streak;
                    streakRef.current.textContent = `×${streak}`;
                    streakRef.current.classList.toggle('streak-visible', streak >= 3);
                }
            }

            renderer.draw(engine, dt);
        };
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
        };
    }, [mode, setPhaseBoth]);

    // Pointer → paddle
    useEffect(() => {
        const board = boardRef.current!;
        const handlePointer = (e: PointerEvent) => {
            const rect = board.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * BOARD_SIZE;
            if (engineRef.current) setPlayerTarget(engineRef.current, x);
        };
        const handleDown = (e: PointerEvent) => {
            unlockAudio();
            handlePointer(e);
        };
        board.addEventListener('pointermove', handlePointer);
        board.addEventListener('pointerdown', handleDown);
        return () => {
            board.removeEventListener('pointermove', handlePointer);
            board.removeEventListener('pointerdown', handleDown);
        };
    }, []);

    // Keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (phaseRef.current === 'playing') setPhaseBoth('paused');
                else if (phaseRef.current === 'paused') setPhaseBoth('playing');
            } else if (e.key === 'm' || e.key === 'M') {
                const next = !isSoundEnabled();
                setSoundEnabled(next);
                setSoundOn(next);
                if (next) unlockAudio();
            } else if ((e.key === 'Enter' || e.key === ' ') && phaseRef.current === 'over') {
                e.preventDefault();
                restart();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [restart, setPhaseBoth]);

    const toggleSound = () => {
        const next = !isSoundEnabled();
        setSoundEnabled(next);
        setSoundOn(next);
        if (next) unlockAudio();
    };

    const handleShare = async () => {
        if (!result || shareState === 'busy') return;
        setShareState('busy');
        try {
            await shareResult(result);
            setShareState('done');
        } catch {
            setShareState('idle');
        }
    };

    const verdict = result ? (result.draw ? 'Dead even.' : result.won ? 'You took the board.' : 'The night held it.') : '';

    return (
        <div className="match">
            <header className="match-top">
                <button className="ghost-btn" onClick={onHome} aria-label="Back to home">
                    ←
                </button>
                <button
                    className="clock"
                    ref={clockRef}
                    aria-label="Pause"
                    onClick={() => {
                        if (phaseRef.current === 'playing') setPhaseBoth('paused');
                        else if (phaseRef.current === 'paused') setPhaseBoth('playing');
                    }}
                >
                    {formatClock(MATCH_DURATION)}
                </button>
                <button className="ghost-btn" onClick={toggleSound} aria-label={soundOn ? 'Mute' : 'Unmute'}>
                    {soundOn ? '♪' : '∅'}
                </button>
            </header>

            <div className="share-row">
                <span className="pct pct-day" ref={dayPctRef}>50</span>
                <div className="share-track">
                    <div className="share-fill" ref={barRef} style={{ width: '50%' }} />
                </div>
                <span className="pct pct-night" ref={nightPctRef}>50</span>
            </div>

            <div className="board" ref={boardRef}>
                <canvas ref={canvasRef} className="board-canvas" />
                <div className="streak-chip" ref={streakRef} aria-hidden="true" />

                {phase === 'paused' && (
                    <div className="overlay">
                        <p className="overlay-title">Paused</p>
                        <div className="overlay-actions">
                            <button className="btn btn-primary" onClick={() => setPhaseBoth('playing')}>
                                Resume
                            </button>
                            <button className="btn" onClick={restart}>
                                Restart
                            </button>
                        </div>
                        <button className="link-btn" onClick={onHome}>
                            home
                        </button>
                    </div>
                )}

                {phase === 'over' && result && (
                    <div className="overlay">
                        <p className="overlay-title">{verdict}</p>
                        <p className={`overlay-share ${result.won ? 'is-day' : 'is-night'}`}>{result.dayShare}%</p>
                        <p className="overlay-meta">
                            best streak ×{result.bestStreak} · {result.tilesFlipped} tiles flipped
                        </p>
                        <div className="overlay-actions">
                            <button className="btn btn-primary" onClick={restart}>
                                Play again
                            </button>
                            <button className="btn" onClick={handleShare} disabled={shareState === 'busy'}>
                                {shareState === 'done' ? 'Shared ✓' : 'Share'}
                            </button>
                        </div>
                        <button className="link-btn" onClick={onHome}>
                            home
                        </button>
                    </div>
                )}
            </div>

            <p className="match-hint">
                move to defend the cream
                <span className="hint-keys"> · esc pause · m sound</span>
            </p>
        </div>
    );
};

export default GameCanvas;
