/**
 * The match screen. Owns the rAF loop and wires engine → renderer → audio.
 *
 * HUD numbers are written straight to the DOM (no re-renders at 60fps);
 * React state only changes on phase transitions (playing / paused / over)
 * and around the share lightbox, where the player views their result card
 * full-size and picks how to take it with them (share / copy / download).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { BOARD_SIZE, MATCH_DURATION, POINTER_LOCK_SENSITIVITY, type ModeId } from './constants';
import { advance, createEngine, dayShare, setPlayerTarget, softResume } from './engine';
import { createRenderer, type Renderer } from './render';
import {
    isSoundEnabled, playCapture, playEnd, playMiss, playPaddle, playWall,
    setSoundEnabled, startEndgameDrone, stopEndgameDrone, unlockAudio,
} from './audio';
import { getStats, recordMatch } from './PlayerStats';
import { dailySeed, saveDailyRecord } from './daily';
import {
    canCopyImage, canNativeShare, copyCardImage, copyShareText, downloadCard,
    generateShareCard, nativeShareCard,
} from './ShareCard';
import type { EngineState, MatchResult } from './types';

type Phase = 'playing' | 'paused' | 'over';

const formatClock = (seconds: number) => {
    const s = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

interface GameCanvasProps {
    mode: ModeId;
    /** when set, this match is the Daily Duel for that day number */
    daily?: number;
    onHome: () => void;
}

const GameCanvas = ({ mode, daily, onHome }: GameCanvasProps) => {
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
    const [eyebrow, setEyebrow] = useState<string | null>(null);
    const [cardUrl, setCardUrl] = useState<string | null>(null);
    const cardBlobRef = useRef<Blob | null>(null);
    const [soundOn, setSoundOn] = useState(isSoundEnabled);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [shareFeedback, setShareFeedback] = useState<'shared' | 'copied' | 'copiedText' | 'saved' | null>(null);

    const setPhaseBoth = useCallback((next: Phase) => {
        phaseRef.current = next;
        setPhase(next);
    }, []);

    /** The Daily Duel always plays the classic recipe with the day's seed. */
    const buildEngine = useCallback(
        () => (daily === undefined ? createEngine(mode) : createEngine('classic', false, dailySeed(daily))),
        [mode, daily],
    );

    // Capture the mouse on desktop so the cursor can never leave the duel.
    // Touch devices and unsupported browsers fall back to window tracking.
    const requestLock = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || document.pointerLockElement === canvas) return;
        if (!window.matchMedia('(pointer: fine)').matches) return;
        if (!('requestPointerLock' in canvas)) return;
        try {
            const res = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
            res?.catch?.(() => {
                // denied (e.g. right after Esc) — absolute tracking still works
            });
        } catch {
            // unsupported — absolute tracking still works
        }
    }, []);
    const requestLockRef = useRef(requestLock);
    requestLockRef.current = requestLock;

    const restart = useCallback(() => {
        engineRef.current = buildEngine();
        setResult(null);
        setEyebrow(null);
        setLightboxOpen(false);
        setShareFeedback(null);
        setPhaseBoth('playing');
        requestLock();
    }, [buildEngine, setPhaseBoth, requestLock]);

    /** Every way back into play goes through here: slow-motion + mouse lock. */
    const resume = useCallback(() => {
        if (engineRef.current) softResume(engineRef.current);
        setPhaseBoth('playing');
        requestLock();
    }, [setPhaseBoth, requestLock]);

    // Boot engine + renderer + loop
    useEffect(() => {
        const canvas = canvasRef.current!;
        engineRef.current = buildEngine();
        rendererRef.current = createRenderer(canvas);
        setResult(null);
        setEyebrow(null);
        setPhaseBoth('playing');

        const observer = new ResizeObserver(() => rendererRef.current?.resize());
        observer.observe(canvas);

        let raf = 0;
        let last = performance.now();
        let lastClock = '';
        let lastShare = -1;
        let droneOn = false;

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame);
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            const engine = engineRef.current!;
            const renderer = rendererRef.current!;

            if (phaseRef.current === 'playing') {
                advance(engine, dt);

                // The last ten seconds get a quiet pad under them.
                if (!droneOn && engine.timeLeft <= 10 && engine.timeLeft > 0.5) {
                    droneOn = true;
                    startEndgameDrone();
                } else if (droneOn && engine.timeLeft > 10) {
                    droneOn = false; // a restart reset the clock
                }

                const events = engine.events;
                if (events.length > 0) {
                    renderer.ingest(events);
                    for (const e of events) {
                        if (e.type === 'capture') playCapture(e.team, e.row, e.col);
                        else if (e.type === 'paddle') {
                            const own = (e.side === 'player') === (e.ballTeam === 'day');
                            playPaddle(e.side, e.streak, own, e.x, e.speed, e.slam);
                        } else if (e.type === 'miss') playMiss(e.side, e.x);
                        else if (e.type === 'wall') playWall(e.x);
                        else if (e.type === 'over') {
                            droneOn = false;
                            const final: MatchResult = {
                                won: e.winner === 'day',
                                draw: e.winner === 'draw',
                                dayShare: dayShare(engine),
                                bestStreak: engine.bestStreak,
                                tilesFlipped: engine.tilesFlipped,
                                mode: daily === undefined ? mode : 'classic',
                                grid: engine.grid.slice(),
                                daily,
                            };
                            // "New best" is measured against your career so far.
                            const before = getStats();
                            recordMatch(final);
                            if (daily !== undefined) {
                                const record = saveDailyRecord(daily, final);
                                setEyebrow(
                                    record.streakDays >= 2
                                        ? `Daily Duel #${daily} · day streak ${record.streakDays}`
                                        : `Daily Duel #${daily}`,
                                );
                            } else if (before.games > 0 && final.dayShare > before.bestShare) {
                                setEyebrow('New best board');
                            } else if (before.games > 0 && final.bestStreak > before.bestStreak) {
                                setEyebrow(`New best streak ×${final.bestStreak}`);
                            }
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
            stopEndgameDrone();
        };
    }, [mode, daily, buildEngine, setPhaseBoth]);

    // Pausing or finishing silences the endgame pad immediately.
    useEffect(() => {
        if (phase !== 'playing') stopEndgameDrone();
    }, [phase]);

    // Render the share card as soon as there is a result: seeing the artifact
    // is what makes people want to send it.
    useEffect(() => {
        if (!result) {
            setCardUrl(null);
            cardBlobRef.current = null;
            return;
        }
        let url: string | null = null;
        let cancelled = false;
        void generateShareCard(result).then((blob) => {
            if (cancelled) return;
            cardBlobRef.current = blob;
            url = URL.createObjectURL(blob);
            setCardUrl(url);
        });
        return () => {
            cancelled = true;
            if (url) URL.revokeObjectURL(url);
        };
    }, [result]);

    // Pointer → paddle.
    //
    // Mouse-first desktop problem: an absolute cursor walks off the board (or
    // the window) mid-rally and the paddle dies. Two layers fix it:
    //   1. Tracking lives on `window`, not the board, so the paddle follows
    //      the cursor anywhere on screen, clamped to the board.
    //   2. Clicking the board engages the Pointer Lock API: from then on the
    //      mouse is captured and movement is relative, so there is no edge,
    //      no focus loss, nothing to fall off of. Esc releases and pauses.
    // Touch is the primary input overall: absolute, drag anywhere, primary
    // pointer only (a resting second finger must never yank the paddle).
    useEffect(() => {
        const canvas = canvasRef.current!;
        const board = boardRef.current!;
        let rect = board.getBoundingClientRect();
        let virtualX: number | null = null;
        let wasLocked = false;

        const refreshRect = () => {
            rect = board.getBoundingClientRect();
        };
        const observer = new ResizeObserver(refreshRect);
        observer.observe(board);

        const isLocked = () => document.pointerLockElement === canvas;

        const absoluteMove = (e: PointerEvent) => {
            if (!e.isPrimary || isLocked()) return;
            const engine = engineRef.current;
            if (!engine) return;
            setPlayerTarget(engine, ((e.clientX - rect.left) / rect.width) * BOARD_SIZE);
        };

        // Pointer Lock deltas ride on mousemove (the most reliable carrier of
        // movementX across browsers).
        const relativeMove = (e: MouseEvent) => {
            if (!isLocked()) return;
            const engine = engineRef.current;
            if (!engine) return;
            const gain = (BOARD_SIZE / rect.width) * POINTER_LOCK_SENSITIVITY;
            const base = virtualX ?? engine.player.targetX;
            virtualX = Math.max(0, Math.min(BOARD_SIZE, base + e.movementX * gain));
            setPlayerTarget(engine, virtualX);
        };

        const handleDown = (e: PointerEvent) => {
            unlockAudio();
            absoluteMove(e);
            if (e.pointerType === 'mouse' && phaseRef.current === 'playing') requestLockRef.current();
        };

        const handleLockChange = () => {
            const locked = isLocked();
            if (locked) {
                // Continue from wherever the paddle is — no jump on entry.
                virtualX = engineRef.current?.player.targetX ?? null;
            } else if (wasLocked && phaseRef.current === 'playing') {
                // Lock can only vanish mid-match via Esc (the browser swallows
                // the keydown), so treat it as the pause gesture it was.
                setPhaseBoth('paused');
            }
            wasLocked = locked;
        };

        const blockMenu = (e: Event) => e.preventDefault();

        window.addEventListener('pointermove', absoluteMove);
        window.addEventListener('mousemove', relativeMove);
        board.addEventListener('pointerdown', handleDown);
        board.addEventListener('contextmenu', blockMenu);
        document.addEventListener('pointerlockchange', handleLockChange);
        return () => {
            observer.disconnect();
            window.removeEventListener('pointermove', absoluteMove);
            window.removeEventListener('mousemove', relativeMove);
            board.removeEventListener('pointerdown', handleDown);
            board.removeEventListener('contextmenu', blockMenu);
            document.removeEventListener('pointerlockchange', handleLockChange);
            if (isLocked()) document.exitPointerLock();
        };
    }, [setPhaseBoth]);

    // Lock is only meaningful while playing; give the cursor back to overlays.
    useEffect(() => {
        if (phase !== 'playing' && document.pointerLockElement) document.exitPointerLock();
    }, [phase]);

    // Leaving the tab mid-rally parks the match on the pause screen, so
    // coming back is calm instead of an instant ball to the face.
    useEffect(() => {
        const onVisibility = () => {
            if (document.hidden && phaseRef.current === 'playing') setPhaseBoth('paused');
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [setPhaseBoth]);

    // Keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (lightboxOpen) setLightboxOpen(false);
                else if (phaseRef.current === 'playing') setPhaseBoth('paused');
                else if (phaseRef.current === 'paused') resume();
            } else if (e.key === 'm' || e.key === 'M') {
                const next = !isSoundEnabled();
                setSoundEnabled(next);
                setSoundOn(next);
                if (next) unlockAudio();
            } else if ((e.key === 'Enter' || e.key === ' ') && phaseRef.current === 'over' && !lightboxOpen) {
                e.preventDefault();
                restart();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [restart, resume, setPhaseBoth, lightboxOpen]);

    const toggleSound = () => {
        const next = !isSoundEnabled();
        setSoundEnabled(next);
        setSoundOn(next);
        if (next) unlockAudio();
    };

    // The share hub: every entry point (card click, Share button) opens the
    // lightbox, where the user picks how to take the card with them.
    const openLightbox = () => {
        setShareFeedback(null);
        setLightboxOpen(true);
    };

    const handleNativeShare = async () => {
        if (!result || !cardBlobRef.current) return;
        if (await nativeShareCard(result, cardBlobRef.current)) setShareFeedback('shared');
    };

    const handleCopy = async () => {
        if (!cardBlobRef.current) return;
        if (await copyCardImage(cardBlobRef.current)) setShareFeedback('copied');
    };

    const handleCopyText = async () => {
        if (!result) return;
        if (await copyShareText(result)) setShareFeedback('copiedText');
    };

    const handleDownload = () => {
        if (!cardBlobRef.current) return;
        downloadCard(cardBlobRef.current);
        setShareFeedback('saved');
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
                        else if (phaseRef.current === 'paused') resume();
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
                            <button className="btn btn-primary" onClick={resume}>
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
                    <div className="overlay overlay-delayed">
                        {eyebrow && <p className="overlay-eyebrow">{eyebrow}</p>}
                        <p className="overlay-title">{verdict}</p>
                        <p className={`overlay-share ${result.won ? 'is-day' : 'is-night'}`}>{result.dayShare}%</p>
                        <p className="overlay-meta">
                            best streak ×{result.bestStreak} · {result.tilesFlipped} tiles flipped
                        </p>
                        {cardUrl && (
                            <button className="result-card" onClick={openLightbox} aria-label="View and share your result card">
                                <img src={cardUrl} alt={`Result card: ${result.dayShare}% of the board`} />
                            </button>
                        )}
                        <div className="overlay-actions">
                            <button className="btn btn-primary" onClick={restart}>
                                Play again
                            </button>
                            <button className="btn" onClick={openLightbox}>
                                Share
                            </button>
                        </div>
                        <button className="link-btn" onClick={onHome}>
                            home
                        </button>
                    </div>
                )}
            </div>

            {lightboxOpen && result && cardUrl && (
                <div
                    className="lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Share your result card"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setLightboxOpen(false);
                    }}
                >
                    <img className="lightbox-img" src={cardUrl} alt={`Result card: ${result.dayShare}% of the board`} />
                    <div className="overlay-actions">
                        {canNativeShare() && (
                            <button className="btn btn-primary" onClick={handleNativeShare}>
                                {shareFeedback === 'shared' ? 'Shared ✓' : 'Share'}
                            </button>
                        )}
                        {result.daily !== undefined && (
                            <button className={`btn ${canNativeShare() ? '' : 'btn-primary'}`} onClick={handleCopyText}>
                                {shareFeedback === 'copiedText' ? 'Copied ✓' : 'Copy text'}
                            </button>
                        )}
                        {canCopyImage() && (
                            <button
                                className={`btn ${!canNativeShare() && result.daily === undefined ? 'btn-primary' : ''}`}
                                onClick={handleCopy}
                            >
                                {shareFeedback === 'copied' ? 'Copied ✓' : 'Copy image'}
                            </button>
                        )}
                        <button className="btn" onClick={handleDownload}>
                            {shareFeedback === 'saved' ? 'Saved ✓' : 'Download'}
                        </button>
                    </div>
                    <button className="link-btn" onClick={() => setLightboxOpen(false)}>
                        close
                    </button>
                </div>
            )}

            <p className="match-hint">
                <span className="hint-touch">drag anywhere to defend the cream</span>
                <span className="hint-keys">move to defend the cream · click locks your mouse · esc pause</span>
            </p>
        </div>
    );
};

export default GameCanvas;
