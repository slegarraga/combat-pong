/**
 * Tiny synth-based audio layer for Combat Pong.
 *
 * The game should feel more alive without relying on asset files or a backend.
 * These helpers generate extremely short tones with the Web Audio API and stay
 * silent until the user interacts with the page. Sound is persistent and can
 * be toggled off from the arena HUD.
 */

const SOUND_KEY = 'combat_pong_sound_enabled_v1';

let cachedEnabled: boolean | null = null;
let audioContext: AudioContext | null = null;

const getStoredEnabled = () => {
    if (typeof window === 'undefined') return true;

    try {
        const value = window.localStorage.getItem(SOUND_KEY);
        return value === null ? true : value === 'true';
    } catch {
        return true;
    }
};

const getAudioContext = () => {
    if (typeof window === 'undefined') return null;

    const AudioContextConstructor = window.AudioContext
        ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) return null;

    if (!audioContext) {
        audioContext = new AudioContextConstructor();
    }

    return audioContext;
};

const playVoice = (
    context: AudioContext,
    {
        frequency,
        endFrequency = frequency,
        duration = 0.07,
        gain = 0.03,
        type = 'triangle',
        delay = 0,
        q,
    }: {
        frequency: number;
        endFrequency?: number;
        duration?: number;
        gain?: number;
        type?: OscillatorType;
        delay?: number;
        q?: number;
    },
) => {
    const now = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const amp = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + duration);

    filter.type = 'lowpass';
    filter.frequency.value = 2200;
    if (typeof q === 'number') {
        filter.Q.value = q;
    }

    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(filter);
    filter.connect(amp);
    amp.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
};

const withAudio = (callback: (context: AudioContext) => void) => {
    if (!isArenaAudioEnabled()) return;

    const context = getAudioContext();
    if (!context || context.state !== 'running') return;

    callback(context);
};

export const isArenaAudioEnabled = () => {
    if (cachedEnabled === null) {
        cachedEnabled = getStoredEnabled();
    }

    return cachedEnabled;
};

export const setArenaAudioEnabled = (enabled: boolean) => {
    cachedEnabled = enabled;

    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(SOUND_KEY, String(enabled));
        } catch {
            // Ignore storage failures and keep the in-memory preference.
        }
    }

    if (!enabled && audioContext && audioContext.state === 'running') {
        void audioContext.suspend();
        return;
    }

    if (enabled) {
        void primeArenaAudio();
    }
};

export const primeArenaAudio = async () => {
    if (!isArenaAudioEnabled()) return;

    const context = getAudioContext();
    if (!context) return;

    if (context.state !== 'running') {
        await context.resume();
    }
};

export const playPaddleImpactSound = ({
    owner,
    streak,
    charge,
    impactPower,
    speed,
}: {
    owner: 'player' | 'rival';
    streak: number;
    charge: number;
    impactPower: number;
    speed: number;
}) => {
    withAudio((context) => {
        const baseFrequency = owner === 'player'
            ? 280 + Math.min(streak, 10) * 18 + charge * 28 + impactPower * 32
            : 210 + charge * 12 + impactPower * 18;
        const gain = owner === 'player'
            ? 0.026 + impactPower * 0.02 + Math.min(speed / 28, 0.012)
            : 0.014 + impactPower * 0.009;
        const duration = owner === 'player'
            ? 0.05 + impactPower * 0.028
            : 0.048 + impactPower * 0.014;

        playVoice(context, {
            frequency: baseFrequency,
            endFrequency: owner === 'player' ? baseFrequency * (1.34 + impactPower * 0.16) : baseFrequency * (1.15 + impactPower * 0.08),
            duration,
            gain,
            type: owner === 'player' ? 'triangle' : 'sine',
        });

        if (owner === 'player' && charge > 0) {
            playVoice(context, {
                frequency: baseFrequency * 0.5,
                endFrequency: baseFrequency * (0.72 + impactPower * 0.08),
                duration: 0.08 + impactPower * 0.015,
                gain: 0.014 + charge * 0.003 + impactPower * 0.005,
                type: 'sine',
                delay: 0.008,
            });
        }

        if (owner === 'player' && impactPower > 0.72) {
            playVoice(context, {
                frequency: baseFrequency * 2.1,
                endFrequency: baseFrequency * 1.45,
                duration: 0.03 + impactPower * 0.012,
                gain: 0.01 + impactPower * 0.008,
                type: 'square',
                delay: 0.004,
            });
        }

        if (owner === 'player' && (impactPower > 0.92 || speed > 13)) {
            playVoice(context, {
                frequency: baseFrequency * 0.36,
                endFrequency: baseFrequency * 0.2,
                duration: 0.06 + impactPower * 0.02,
                gain: 0.012 + impactPower * 0.008 + Math.min(speed / 42, 0.006),
                type: 'sawtooth',
            });
            playVoice(context, {
                frequency: baseFrequency * 3.1,
                endFrequency: baseFrequency * 2.2,
                duration: 0.022 + impactPower * 0.008,
                gain: 0.008 + impactPower * 0.006,
                type: 'square',
                delay: 0.003,
                q: 2.2,
            });
        }
    });
};

export const playClutchEnterSound = () => {
    withAudio((context) => {
        playVoice(context, {
            frequency: 240,
            endFrequency: 320,
            duration: 0.12,
            gain: 0.022,
            type: 'triangle',
        });
        playVoice(context, {
            frequency: 320,
            endFrequency: 440,
            duration: 0.11,
            gain: 0.018,
            type: 'square',
            delay: 0.05,
        });
    });
};

export const playClutchPulseSound = (secondsLeft: number) => {
    withAudio((context) => {
        const urgent = secondsLeft <= 5;
        const baseFrequency = urgent
            ? 220 + (5 - secondsLeft) * 26
            : 176 + (10 - secondsLeft) * 8;

        playVoice(context, {
            frequency: baseFrequency,
            endFrequency: baseFrequency * (urgent ? 1.22 : 1.08),
            duration: urgent ? 0.12 : 0.08,
            gain: urgent ? 0.022 : 0.014,
            type: urgent ? 'square' : 'triangle',
        });

        if (urgent) {
            playVoice(context, {
                frequency: baseFrequency * 0.72,
                endFrequency: baseFrequency * 0.86,
                duration: 0.08,
                gain: 0.012,
                type: 'sine',
                delay: 0.035,
            });
        }
    });
};

export const playTileBreakSound = (captureCount: number, team: 'day' | 'night') => {
    withAudio((context) => {
        const frequency = team === 'day' ? 170 + captureCount * 34 : 145 + captureCount * 24;

        playVoice(context, {
            frequency,
            endFrequency: frequency * 0.9,
            duration: 0.07,
            gain: 0.012 + captureCount * 0.004,
            type: team === 'day' ? 'square' : 'triangle',
        });

        if (captureCount > 1) {
            playVoice(context, {
                frequency: frequency * 1.9,
                endFrequency: frequency * 1.35,
                duration: 0.055,
                gain: 0.01 + captureCount * 0.002,
                type: 'triangle',
                delay: 0.015,
            });
        }
    });
};

export const playMissSound = (owner: 'player' | 'rival') => {
    withAudio((context) => {
        playVoice(context, {
            frequency: owner === 'player' ? 210 : 180,
            endFrequency: owner === 'player' ? 92 : 120,
            duration: 0.16,
            gain: owner === 'player' ? 0.03 : 0.016,
            type: 'sawtooth',
        });
    });
};

export const playFinishSound = (playerWon: boolean) => {
    withAudio((context) => {
        if (playerWon) {
            playVoice(context, { frequency: 360, endFrequency: 520, duration: 0.12, gain: 0.04, type: 'triangle' });
            playVoice(context, { frequency: 520, endFrequency: 690, duration: 0.14, gain: 0.032, type: 'triangle', delay: 0.08 });
            return;
        }

        playVoice(context, { frequency: 250, endFrequency: 160, duration: 0.14, gain: 0.028, type: 'sawtooth' });
        playVoice(context, { frequency: 160, endFrequency: 110, duration: 0.16, gain: 0.022, type: 'triangle', delay: 0.06 });
    });
};
