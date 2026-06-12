/**
 * Share cards, generated locally — every card shows the player's actual final
 * board, so no two are alike. Native share when available, otherwise download
 * the image and copy the brag line.
 */

import { GRID, COLORS, MODES } from './constants';
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

    ctx.fillStyle = 'rgba(244, 240, 232, 0.45)';
    ctx.font = font(30, 500);
    ctx.fillText(
        `${MODES[result.mode].label} · best streak ×${result.bestStreak} · combatpong.com`,
        CARD / 2,
        by + boardSize + 286,
    );

    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
    });
};

export const shareResult = async (result: MatchResult): Promise<'shared' | 'downloaded'> => {
    const blob = await generateShareCard(result);
    const text = result.won
        ? `I took ${result.dayShare}% of the board in Combat Pong.`
        : `The board got away from me this time: ${result.dayShare}% in Combat Pong.`;
    const url = 'https://www.combatpong.com';

    const file = new File([blob], 'combat-pong.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], text, url });
            return 'shared';
        } catch {
            // user dismissed the sheet — fall through to download
        }
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'combat-pong.png';
    link.click();
    URL.revokeObjectURL(link.href);
    try {
        await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
        // clipboard unavailable — the download alone is fine
    }
    return 'downloaded';
};
