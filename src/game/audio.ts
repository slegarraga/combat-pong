/**
 * Generative soundscape — no asset files, just the Web Audio API.
 *
 * Every sound is drawn from the D major pentatonic scale, so any sequence of
 * captures and returns is musical by construction: the board literally plays
 * wind chimes as the frontier moves. Day events ring bright and warm; night
 * events answer darker and quieter. Nothing is loud, nothing is harsh.
 */

const SOUND_KEY = 'cp:sound';

// D major pentatonic across three octaves (D3 root).
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

let lastCaptureAt = 0;
let lastPaddleAt = 0;

export const isSoundEnabled = () => enabled;

export const setSoundEnabled = (value: boolean) => {
    enabled = value;
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

interface VoiceOpts {
    freq: number;
    gain: number;
    duration: number;
    type?: OscillatorType;
    lowpass?: number;
    detune?: number;
    glideTo?: number;
}

const voice = ({ freq, gain, duration, type = 'triangle', lowpass = 2400, detune = 0, glideTo }: VoiceOpts) => {
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
    env.connect(master!);
    osc.start(t);
    osc.stop(t + duration + 0.02);
};

/**
 * A tile changed hands. Row maps to pitch: pushing deep into enemy ground
 * literally sounds like climbing the scale.
 */
export const playCapture = (team: 'day' | 'night', row: number) => {
    if (!ready()) return;
    const now = performance.now();
    if (now - lastCaptureAt < 45) return;
    lastCaptureAt = now;

    if (team === 'day') {
        const depth = 1 - row / 23; // higher row = deeper into night = higher note
        const idx = 5 + Math.round(depth * 9);
        const freq = SCALE[Math.min(idx, SCALE.length - 1)];
        voice({ freq, gain: 0.085, duration: 0.42 });
        voice({ freq: freq * 2, gain: 0.022, duration: 0.3, type: 'sine' });
    } else {
        const depth = row / 23;
        const idx = Math.max(0, 4 - Math.round(depth * 4));
        voice({ freq: SCALE[idx], gain: 0.045, duration: 0.3, lowpass: 1100 });
    }
};

/** Paddle contact: a warm pluck that climbs the scale as your streak grows. */
export const playPaddle = (side: 'player' | 'ai', streak: number, ownBall: boolean) => {
    if (!ready()) return;
    const now = performance.now();
    if (now - lastPaddleAt < 30) return;
    lastPaddleAt = now;

    if (side === 'player') {
        if (ownBall) {
            const idx = Math.min(3 + Math.min(streak, 10), SCALE.length - 1);
            const freq = SCALE[idx];
            voice({ freq, gain: 0.15, duration: 0.24, lowpass: 3200, detune: -4 });
            voice({ freq, gain: 0.1, duration: 0.2, lowpass: 3200, detune: 5 });
        } else {
            // Cushioning an enemy ball: padded, low, reassuring.
            voice({ freq: SCALE[1], gain: 0.1, duration: 0.16, type: 'sine', lowpass: 900 });
        }
    } else {
        voice({ freq: SCALE[2], gain: 0.03, duration: 0.12, lowpass: 1200 });
    }
};

/** A ball slipped past someone. Yours: a soft low thud. Theirs: a bright blip. */
export const playMiss = (side: 'player' | 'ai') => {
    if (side === 'player') {
        voice({ freq: 110, gain: 0.12, duration: 0.35, type: 'sine', lowpass: 500, glideTo: 65 });
    } else {
        voice({ freq: SCALE[11], gain: 0.05, duration: 0.18, type: 'sine' });
    }
};

/** Match end: a gentle resolution, never a fanfare. */
export const playEnd = (outcome: 'win' | 'loss' | 'draw') => {
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
