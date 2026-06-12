/** Persisted mode selection. */

import { MODES, type ModeId } from './constants';

const MODE_KEY = 'cp:mode';

export const getSavedMode = (): ModeId => {
    try {
        const saved = localStorage.getItem(MODE_KEY) as ModeId | null;
        return saved && MODES[saved] ? saved : 'classic';
    } catch {
        return 'classic';
    }
};

export const saveMode = (mode: ModeId) => {
    try {
        localStorage.setItem(MODE_KEY, mode);
    } catch {
        // private mode — selection just won't persist
    }
};
