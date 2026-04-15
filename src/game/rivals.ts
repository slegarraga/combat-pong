import { DIFFICULTY } from './constants';
import type { Difficulty, RivalProfile } from './types';

type RivalMood = 'opening' | 'pressure' | 'playerLead' | 'rivalLead' | 'clutch' | 'reset';

interface RivalTemplate {
    title: string;
    signature: string;
    aggressionBonus: number;
    precisionBonus: number;
    wobbleMultiplier: number;
    feintWindow: number;
}

const CALLSIGNS = [
    'Vanta', 'Static', 'Quartz', 'Cipher', 'Delta', 'North', 'Pulse', 'Mirage',
    'Vector', 'Echo', 'Signal', 'Kite', 'Nova', 'Mantis', 'Helix', 'Relay',
];

const SUFFIXES = [
    'Fox', 'Pilot', 'Saint', 'Runner', 'Shift', 'Mako', 'Bloom', 'Anchor',
    'Specter', 'Torch', 'Drift', 'Knuckle', 'Atlas', 'Bloom', 'Cinder', 'Trace',
];

const RIVAL_ARCHETYPES: Record<Difficulty, RivalTemplate[]> = {
    EASY: [
        {
            title: 'Soft Starter',
            signature: 'Starts slow, then copies your rhythm.',
            aggressionBonus: -0.08,
            precisionBonus: -0.05,
            wobbleMultiplier: 1.25,
            feintWindow: 22,
        },
        {
            title: 'Late Adapter',
            signature: 'Gives you space until the board starts slipping.',
            aggressionBonus: -0.03,
            precisionBonus: 0,
            wobbleMultiplier: 1.15,
            feintWindow: 20,
        },
    ],
    MEDIUM: [
        {
            title: 'Rhythm Reader',
            signature: 'Tracks patterns and punishes lazy center hits.',
            aggressionBonus: 0.04,
            precisionBonus: 0.04,
            wobbleMultiplier: 1,
            feintWindow: 16,
        },
        {
            title: 'Glass Cannon',
            signature: 'Wild angle hunter with occasional overcommitment.',
            aggressionBonus: 0.1,
            precisionBonus: -0.02,
            wobbleMultiplier: 1.1,
            feintWindow: 18,
        },
    ],
    HARD: [
        {
            title: 'Territory Shark',
            signature: 'Optimizes the next touch before the last one lands.',
            aggressionBonus: 0.12,
            precisionBonus: 0.06,
            wobbleMultiplier: 0.8,
            feintWindow: 12,
        },
        {
            title: 'Edge Hunter',
            signature: 'Attacks the corners to force ugly recoveries.',
            aggressionBonus: 0.15,
            precisionBonus: 0.02,
            wobbleMultiplier: 0.9,
            feintWindow: 10,
        },
    ],
    NIGHTMARE: [
        {
            title: 'Signal Predator',
            signature: 'Feels instant, ruthless, and impossible to calm down.',
            aggressionBonus: 0.18,
            precisionBonus: 0.08,
            wobbleMultiplier: 0.7,
            feintWindow: 8,
        },
        {
            title: 'Midnight Surgeon',
            signature: 'Turns one bad return into a full-board collapse.',
            aggressionBonus: 0.14,
            precisionBonus: 0.12,
            wobbleMultiplier: 0.65,
            feintWindow: 6,
        },
    ],
};

const FEED_TEMPLATES: Record<RivalMood, string[]> = {
    opening: [
        '{alias} joined the arena.',
        'Signal locked on {alias}.',
        '{alias} is reading your warmup touches.',
    ],
    pressure: [
        '{alias} is speeding the duel up.',
        '{alias} is probing for a bad angle.',
        '{alias} is forcing faster exchanges.',
    ],
    playerLead: [
        '{alias} is scrambling for clean territory.',
        '{alias} just got pushed onto the back foot.',
        '{alias} is trying to break your pace.',
    ],
    rivalLead: [
        '{alias} is squeezing the board.',
        '{alias} is turning pressure into territory.',
        '{alias} is dictating the tempo.',
    ],
    clutch: [
        'Clutch time. {alias} is all-in.',
        '{alias} is hunting one decisive swing.',
        'Final seconds. {alias} is playing sharp.',
    ],
    reset: [
        '{alias} caught a reset window.',
        'Momentum cracked. {alias} stabilized.',
        '{alias} just survived the storm.',
    ],
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const interpolate = (template: string, rival: RivalProfile) =>
    template.replaceAll('{alias}', rival.alias);

const randomBetween = ([min, max]: [number, number]) =>
    Math.round(min + Math.random() * (max - min));

export const createRivalProfile = (difficulty: Difficulty): RivalProfile => {
    const settings = DIFFICULTY[difficulty];
    const template = pick(RIVAL_ARCHETYPES[difficulty]);
    const alias = `${pick(CALLSIGNS)}${pick(SUFFIXES)}_${Math.floor(10 + Math.random() * 90)}`;

    return {
        alias,
        title: template.title,
        signature: template.signature,
        pingMs: randomBetween(settings.pingRange),
        reaction: settings.aiReaction,
        aggression: clamp(settings.aiAggression + template.aggressionBonus, 0.15, 0.95),
        precision: clamp(settings.aiPrecision + template.precisionBonus, 0.5, 0.99),
        wobble: settings.wobble * template.wobbleMultiplier,
        feintWindow: template.feintWindow,
    };
};

export const getRivalFeedLine = (rival: RivalProfile, mood: RivalMood) =>
    interpolate(pick(FEED_TEMPLATES[mood]), rival);

export const fluctuatePing = (rival: RivalProfile, difficulty: Difficulty) => {
    const [min, max] = DIFFICULTY[difficulty].pingRange;
    const nextPing = rival.pingMs + Math.round((Math.random() - 0.5) * 10);
    return clamp(nextPing, min, max);
};
