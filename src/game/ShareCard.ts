/**
 * Share cards, generated locally — every card shows the player's actual final
 * board, so no two are alike. Native share when available, otherwise download
 * the image and copy the brag line.
 */

import { GRID, COLORS, MODES } from './constants';
import { getDailyRecord } from './daily';
import type { MatchResult } from './types';

const CARD = 1080;

const roundRectPath = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number,
) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
};

export const generateShareCard = async (result: MatchResult): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = CARD;
    canvas.height = CARD;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = COLORS.page;
    ctx.fillRect(0, 0, CARD, CARD);

    // Final board, the real one from the match.
    const boardSize = 560;
    const bx = (CARD - boardSize) / 2;
    const by = 150;
    const tile = boardSize / GRID;

    ctx.save();
    roundRectPath(ctx, bx, by, boardSize, boardSize, 28);
    ctx.clip();
    ctx.fillStyle = COLORS.night;
    ctx.fillRect(bx, by, boardSize, boardSize);
    ctx.fillStyle = COLORS.day;
    for (let row = 0; row < GRID; row++) {
        let runStart = -1;
        for (let col = 0; col <= GRID; col++) {
            const isDay = col < GRID && result.grid[row * GRID + col] === 0;
            if (isDay && runStart < 0) runStart = col;
            if (!isDay && runStart >= 0) {
                ctx.fillRect(
                    bx + runStart * tile - 0.5,
                    by + row * tile - 0.5,
                    (col - runStart) * tile + 1,
                    tile + 1,
                );
                runStart = -1;
            }
        }
    }
    ctx.restore();

    const font = (size: number, weight = 500) =>
        `${weight} ${size}px "Space Grotesk", -apple-system, sans-serif`;

    // Wordmark
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(244, 240, 232, 0.55)';
    ctx.font = font(34, 500);
    ctx.fillText('C O M B A T   P O N G', CARD / 2, 96);

    // Verdict + share
    const verdict = result.draw ? 'Dead even.' : result.won ? 'I took the board.' : 'The night held it.';
    ctx.fillStyle = '#F4F0E8';
    ctx.font = font(58, 700);
    ctx.fillText(verdict, CARD / 2, by + boardSize + 96);

    ctx.fillStyle = result.won ? COLORS.dayText : COLORS.nightText;
    ctx.font = font(120, 700);
    ctx.fillText(`${result.dayShare}%`, CARD / 2, by + boardSize + 226);

    const label = result.daily !== undefined ? `Daily Duel #${result.daily}` : MODES[result.mode].label;
    ctx.fillStyle = 'rgba(244, 240, 232, 0.45)';
    ctx.font = font(30, 500);
    ctx.fillText(
        `${label} · best streak ×${result.bestStreak} · combatpong.com`,
        CARD / 2,
        by + boardSize + 286,
    );

    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
    });
};

/**
 * The final board as an 8x8 emoji mosaic — the Wordle trick, in our shape.
 * It pastes as plain text into any chat, renders everywhere, spoils nothing,
 * and no two players ever produce the same frontier.
 */
export const boardEmojiGrid = (grid: Uint8Array): string => {
    const block = GRID / 8; // 3x3 tiles per emoji cell, majority wins
    const rows: string[] = [];
    for (let by = 0; by < 8; by++) {
        let row = '';
        for (let bx = 0; bx < 8; bx++) {
            let day = 0;
            for (let y = 0; y < block; y++) {
                for (let x = 0; x < block; x++) {
                    if (grid[(by * block + y) * GRID + (bx * block + x)] === 0) day++;
                }
            }
            row += day * 2 > block * block ? '🟨' : '⬛';
        }
        rows.push(row);
    }
    return rows.join('\n');
};

/** The brag line: always ends in a challenge, because challenges get clicked. */
export const shareText = (result: MatchResult) => {
    if (result.daily !== undefined) {
        const streak = getDailyRecord(result.daily)?.streakDays ?? 1;
        const streakNote = streak >= 2 ? ` · ${streak}-day streak` : '';
        return `Combat Pong Daily #${result.daily} · ${result.dayShare}%${streakNote}\n\n${boardEmojiGrid(result.grid)}\n\nYour move: ${DAILY_URL}`;
    }
    return result.won
        ? `I took ${result.dayShare}% of the board in Combat Pong. Can you hold more? ${SHARE_URL}`
        : `The night held me to ${result.dayShare}% in Combat Pong. Can you do better? ${SHARE_URL}`;
};

const SHARE_URL = 'https://www.combatpong.com';
const DAILY_URL = 'https://www.combatpong.com/daily';

/** Whether the OS share sheet exists at all (mostly mobile and Safari). */
export const canNativeShare = () => typeof navigator.share === 'function';

/** Whether PNG-to-clipboard is available (Chromium and modern Safari). */
export const canCopyImage = () =>
    typeof window.ClipboardItem === 'function' && typeof navigator.clipboard?.write === 'function';

/** Open the OS share sheet with the card attached. False = dismissed/unavailable. */
export const nativeShareCard = async (result: MatchResult, blob: Blob): Promise<boolean> => {
    const file = new File([blob], 'combat-pong.png', { type: 'image/png' });
    if (!navigator.canShare?.({ files: [file] })) return false;
    try {
        // The text already carries its link; passing `url` too would double it.
        await navigator.share({ files: [file], text: shareText(result) });
        return true;
    } catch {
        return false;
    }
};

/** Copy the full share text (Daily Duels include the emoji board). */
export const copyShareText = async (result: MatchResult): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(shareText(result));
        return true;
    } catch {
        return false;
    }
};

/** Put the card PNG on the clipboard, ready to paste anywhere. */
export const copyCardImage = async (blob: Blob): Promise<boolean> => {
    if (!canCopyImage()) return false;
    try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        return true;
    } catch {
        return false;
    }
};

/** Save the card as a file. */
export const downloadCard = (blob: Blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'combat-pong.png';
    link.click();
    URL.revokeObjectURL(link.href);
};
