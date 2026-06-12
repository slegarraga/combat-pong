/**
 * Generative soundscape — no asset files, just the Web Audio API.
 *
 * Every sound is drawn from the D major pentatonic scale, so any sequence of
 * captures and returns is musical by construction: the board literally plays
 * wind chimes as the frontier moves. Three small ideas do most of the work:
 *
 *   - Pitch is meaning. Captures climb the scale the deeper they land in
 *     enemy ground, and your streak walks the paddle pluck up note by note.
 *   - Space is meaning. Each voice is panned by its board column, so with
 *     headphones the frontier moves around you.
 *   - Quiet is a feature. Night events answer darker and softer than day
 *     events, and nothing ever spikes: a compressor guards the master bus.
 */

const SOUND_KEY = 'cp:sound';

/** D major pentatonic across three octaves (D3 root). */
const SCALE = [
    146.83, 164.81, 185.0, 220.0, 246.94,
    293.66, 329.63, 369.99, 440.0, 493.88,
    587.33, 659.26, 739.99, 880.0, 987.77,
];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = (() => {
    try {
        return localStorage.getItem(SOUND_KEY) !== '0';
    } catch {
        return true;
    }
})();

// Per-family throttles and the capture-cascade combo counter.
let lastCaptureAt = 0;
let lastPaddleAt = 0;
let lastWallAt = 0;
let dayCombo = 0;
let lastDayCaptureAt = 0;

export const isSoundEnabled = () => enabled;

export const setSoundEnabled = (value: boolean) => {
    enabled = value;
    if (!value) stopEndgameDrone();
    try {
        localStorage.setItem(SOUND_KEY, value ? '1' : '0');
    } catch {
        // private mode — keep the in-memory preference
    }
};

/** Create/resume the context. Must be called from a user gesture at least once. */
export const unlockAudio = () => {
    if (!enabled) return;
    if (!ctx) {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        ctx = new Ctor();
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.ratio.value = 8;
        master = ctx.createGain();
        master.gain.value = 0.5;
        master.connect(compressor);
        compressor.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
};

const ready = () => enabled && ctx !== null && ctx.state === 'running' && master !== null;

/** Board x (0..600) → stereo position (-0.6..0.6). */
const panOf = (x: number) => (x / 600) * 1.2 - 0.6;

interface VoiceOpts {
    freq: number;
    gain: number;
    duration: number;
    type?: OscillatorType;
    lowpass?: number;
    detune?: number;
    glideTo?: number;
    pan?: number;
}

const voice = ({ freq, gain, duration, type = 'triangle', lowpass = 2400, detune = 0, glideTo, pan = 0 }: VoiceOpts) => {
    if (!ready()) return;
    const t = ctx!.currentTime;
    const osc = ctx!.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + duration);
    osc.detune.value = detune;

    const filter = ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;

    const env = ctx!.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(gain, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0004, t + duration);

    osc.connect(filter);
    filter.connect(env);

    // Stereo placement when the browser supports it; mono otherwise.
    if (pan !== 0 && typeof ctx!.createStereoPanner === 'function') {
        const panner = ctx!.createStereoPanner();
        panner.pan.value = pan;
        env.connect(panner);
        panner.connect(master!);
    } else {
        env.connect(master!);
    }

    osc.start(t);
    osc.stop(t + duration + 0.02);
};

/**
 * A tile changed hands. Row maps to pitch (deeper = higher), column maps to
 * stereo position, and rapid day cascades climb the scale step by step, so
 * a good run literally plays an arpeggio across the room.
 */
export const playCapture = (team: 'day' | 'night', row: number, col: number) => {
    if (!ready()) return;
    const now = performance.now();
    if (now - lastCaptureAt < 45) return;
    lastCaptureAt = now;

    const pan = panOf(col * 25 + 12.5);
    if (team === 'day') {
        dayCombo = now - lastDayCaptureAt < 450 ? dayCombo + 1 : 0;
        lastDayCaptureAt = now;
        const depth = 1 - row / 23; // higher row = deeper into night = higher note
        const idx = Math.min(5 + Math.round(depth * 7) + Math.min(dayCombo, 4), SCALE.length - 1);
        const freq = SCALE[idx];
        voice({ freq, gain: 0.085, duration: 0.42, pan });
        voice({ freq: freq * 2, gain: 0.022, duration: 0.3, type: 'sine', pan });
    } else {
        const depth = row / 23;
        const idx = Math.max(0, 4 - Math.round(depth * 4));
        voice({ freq: SCALE[idx], gain: 0.045, duration: 0.3, lowpass: 1100, pan });
    }
};

/**
 * Paddle contact. Your slams ring louder and land a fifth on top; cushioning
 * an enemy ball answers low and padded; the AI stays in the background.
 */
export const playPaddle = (
    side: 'player' | 'ai',
    streak: number,
    ownBall: boolean,
    x: number,
    speed: number,
    slam: boolean,
) => {
    if (!ready()) return;
    const now = performance.now();
    if (now - lastPaddleAt < 30) return;
    lastPaddleAt = now;

    const pan = panOf(x);
    if (side === 'player') {
        if (ownBall) {
            const idx = Math.min(3 + Math.min(streak, 10), SCALE.length - 1);
            const freq = SCALE[idx];
            const punch = 0.11 + Math.min(speed / 900, 1) * 0.07;
            voice({ freq, gain: punch, duration: 0.24, lowpass: 3200, detune: -4, pan });
            voice({ freq, gain: punch * 0.65, duration: 0.2, lowpass: 3200, detune: 5, pan });
            if (slam) {
                const fifth = SCALE[Math.min(idx + 3, SCALE.length - 1)];
                voice({ freq: fifth, gain: punch * 0.55, duration: 0.3, lowpass: 2800, pan });
            }
        } else {
            // Cushioning an enemy ball: padded, low, reassuring.
            voice({ freq: SCALE[1], gain: 0.1, duration: 0.16, type: 'sine', lowpass: 900, pan });
        }
    } else {
        voice({ freq: SCALE[2], gain: 0.03, duration: 0.12, lowpass: 1200, pan });
    }
};

/** Side-wall tick: barely there, but it keeps the rally's rhythm honest. */
export const playWall = (x: number) => {
    if (!ready()) return;
    const now = performance.now();
    if (now - lastWallAt < 60) return;
    lastWallAt = now;
    voice({ freq: 196, gain: 0.022, duration: 0.06, lowpass: 800, pan: panOf(x) });
};

/** A gift appeared: the faintest sparkle, just enough to make you look. */
export const playPowerUpSpawn = (x: number) => {
    voice({ freq: SCALE[10], gain: 0.035, duration: 0.3, type: 'sine', pan: panOf(x) });
    voice({ freq: SCALE[12], gain: 0.022, duration: 0.35, type: 'sine', pan: panOf(x) });
};

/** A gift was claimed. Burst splashes a chord, wide steps up, wave runs the scale. */
export const playPowerUpCollect = (kind: 'burst' | 'wide' | 'wave', x: number) => {
    if (!ready()) return;
    const pan = panOf(x);
    if (kind === 'burst') {
        for (const idx of [5, 8, 10]) {
            voice({ freq: SCALE[idx], gain: 0.1, duration: 0.5, lowpass: 2600, pan });
        }
    } else if (kind === 'wide') {
        voice({ freq: SCALE[5], gain: 0.11, duration: 0.3, pan });
        setTimeout(() => voice({ freq: SCALE[8], gain: 0.11, duration: 0.45, pan }), 110);
    } else {
        [5, 7, 9, 11, 13].forEach((idx, i) => {
            setTimeout(() => voice({ freq: SCALE[idx], gain: 0.09, duration: 0.35, pan: -0.5 + i * 0.25 }), i * 55);
        });
    }
};

/** A ball slipped past someone. Yours: a soft low thud. Theirs: a bright blip. */
export const playMiss = (side: 'player' | 'ai', x: number) => {
    const pan = panOf(x);
    if (side === 'player') {
        voice({ freq: 110, gain: 0.12, duration: 0.35, type: 'sine', lowpass: 500, glideTo: 65, pan });
    } else {
        voice({ freq: SCALE[11], gain: 0.05, duration: 0.18, type: 'sine', pan });
    }
};

// ---------------------------------------------------------------------------
// Endgame drone: a quiet D2 pad that fades in under the last ten seconds.
// Tension by sunset, not by alarm.

let droneNodes: { osc: OscillatorNode; osc2: OscillatorNode; env: GainNode } | null = null;

export const startEndgameDrone = () => {
    if (!ready() || droneNodes) return;
    const t = ctx!.currentTime;
    const env = ctx!.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.035, t + 1.6);
    const filter = ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;

    const osc = ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 73.42; // D2
    const osc2 = ctx!.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 73.42;
    osc2.detune.value = 6; // slow beat against the root

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(env);
    env.connect(master!);
    osc.start(t);
    osc2.start(t);
    droneNodes = { osc, osc2, env };
};

export const stopEndgameDrone = () => {
    if (!droneNodes || !ctx) return;
    const { osc, osc2, env } = droneNodes;
    droneNodes = null;
    const t = ctx.currentTime;
    env.gain.cancelScheduledValues(t);
    env.gain.setValueAtTime(env.gain.value, t);
    env.gain.linearRampToValueAtTime(0, t + 0.5);
    osc.stop(t + 0.6);
    osc2.stop(t + 0.6);
};

/** Match end: a gentle resolution, never a fanfare. */
export const playEnd = (outcome: 'win' | 'loss' | 'draw') => {
    stopEndgameDrone();
    if (!ready()) return;
    const notes =
        outcome === 'win' ? [5, 8, 9, 12] : outcome === 'loss' ? [5, 3, 1] : [5, 5];
    notes.forEach((idx, i) => {
        setTimeout(() => {
            voice({ freq: SCALE[idx], gain: 0.12, duration: 0.6, lowpass: 2000 });
            voice({ freq: SCALE[idx] * 2, gain: 0.025, duration: 0.5, type: 'sine' });
        }, i * 130);
    });
};
