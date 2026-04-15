/**
 * Local-only sharing helpers.
 *
 * Since the game no longer depends on Supabase storage, we keep the share loop
 * frictionless by generating an image locally, attempting a native share when
 * available, and otherwise downloading the card while copying the brag text.
 */

import { COLORS, DIFFICULTY } from './constants';
import type { Difficulty } from './types';

interface ShareCardData {
    dayPercent: number;
    difficulty: Difficulty;
    playerWon?: boolean;
    rivalAlias: string;
    bestStreak: number;
}

const shareFilename = () => `combat-pong-duel-${Date.now()}.png`;

const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
};

const getShareText = (data: ShareCardData) => {
    const won = data.playerWon ?? data.dayPercent > 50;
    const result = won ? 'won' : 'lost';
    const difficultyLabel = DIFFICULTY[data.difficulty].label;

    return `I ${result} an anonymous Combat Pong duel ${data.dayPercent}% to ${100 - data.dayPercent}% on ${difficultyLabel}. Rival: ${data.rivalAlias}. Best streak: ${data.bestStreak}x.`;
};

export const generateShareCard = async (data: ShareCardData): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas rendering is unavailable.');
    }

    const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    background.addColorStop(0, COLORS.background);
    background.addColorStop(0.55, COLORS.backgroundElevated);
    background.addColorStop(1, COLORS.night);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    drawRoundedRect(ctx, 80, 72, 1040, 486, 34);
    ctx.fillStyle = COLORS.surfaceStrong;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const accent = ctx.createLinearGradient(120, 0, 1080, 0);
    accent.addColorStop(0, COLORS.dayAccent);
    accent.addColorStop(1, COLORS.nightAccent);

    ctx.font = '700 34px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.textMuted;
    ctx.fillText('COMBAT PONG // ANONYMOUS DUEL', 128, 140);

    ctx.font = '900 184px "Space Grotesk", sans-serif';
    ctx.fillStyle = COLORS.text;
    ctx.shadowColor = COLORS.dayAccent;
    ctx.shadowBlur = 36;
    ctx.fillText(`${data.dayPercent}%`, 120, 360);
    ctx.shadowBlur = 0;

    ctx.font = '700 28px "IBM Plex Mono", monospace';
    ctx.fillStyle = COLORS.textMuted;
    ctx.fillText('TERRITORY CONTROLLED', 128, 404);

    ctx.fillStyle = accent;
    ctx.font = '700 42px "Space Grotesk", sans-serif';
    ctx.fillText(data.playerWon ?? data.dayPercent > 50 ? 'Victory secured' : 'Pressure broke late', 128, 478);

    ctx.font = '600 26px "IBM Plex Mono", monospace';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(`Rival  ${data.rivalAlias}`, 730, 182);
    ctx.fillText(`Mode   ${DIFFICULTY[data.difficulty].label}`, 730, 230);
    ctx.fillText(`Streak ${data.bestStreak}x`, 730, 278);
    ctx.fillText(`Split  ${100 - data.dayPercent}% / ${data.dayPercent}%`, 730, 326);

    ctx.font = '600 24px "Space Grotesk", sans-serif';
    ctx.fillStyle = COLORS.textMuted;
    ctx.fillText('No login. No queue. Just instant duel pressure.', 730, 396);
    ctx.fillText('combatpong.com', 730, 438);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Unable to generate share card.'));
                return;
            }
            resolve(blob);
        }, 'image/png', 1);
    });
};

const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = shareFilename();
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
};

export const shareToTwitter = async (
    data: ShareCardData,
): Promise<'shared' | 'copied' | 'downloaded'> => {
    const shareText = getShareText(data);
    const blob = await generateShareCard(data);
    const file = new File([blob], shareFilename(), { type: 'image/png' });
    const shareUrl = window.location.origin;

    try {
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({
                title: 'Combat Pong',
                text: shareText,
                url: shareUrl,
                files: [file],
            });
            return 'shared';
        }
    } catch (error) {
        console.warn('Native share failed, using local fallback:', error);
    }

    let copied = false;
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            copied = true;
        } catch (error) {
            console.warn('Clipboard write failed:', error);
        }
    }

    downloadBlob(blob);

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(tweetUrl, '_blank', 'width=550,height=420');

    return copied ? 'copied' : 'downloaded';
};
