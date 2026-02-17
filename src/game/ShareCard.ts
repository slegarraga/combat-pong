/**
 * Twitter/X sharing — generates a 1200x630 score card image and shares it.
 *
 * Flow:
 *   1. `generateShareCard()` draws a score card onto an off-screen canvas
 *   2. `uploadToSupabase()` uploads the PNG to the `share-cards` storage bucket
 *   3. `shareToTwitter()` opens a Twitter intent URL with the image link and tweet text
 *   4. Falls back to sharing the game URL if Supabase upload fails
 */

import { COLORS } from './constants';
import { supabase } from '../supabaseClient';

interface ShareCardData {
    dayPercent: number;
    difficulty: string;
    playerWon?: boolean;
}

/** Renders a 1200x630 Open Graph-sized score card as a PNG blob. */
export const generateShareCard = async (data: ShareCardData): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, COLORS.night);
    gradient.addColorStop(0.5, COLORS.background);
    gradient.addColorStop(1, COLORS.day);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid pattern
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#FFFFFF';
    for (let x = 0; x < canvas.width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Title
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    const textGradient = ctx.createLinearGradient(300, 0, 900, 0);
    textGradient.addColorStop(0, COLORS.dayAccent);
    textGradient.addColorStop(1, COLORS.nightBall);
    ctx.fillStyle = textGradient;
    ctx.fillText('COMBAT PONG', canvas.width / 2, 120);

    // Big percentage
    ctx.font = 'bold 200px system-ui, -apple-system, sans-serif';
    ctx.shadowColor = COLORS.dayAccent;
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${data.dayPercent}%`, canvas.width / 2, 380);
    ctx.shadowBlur = 0;

    // Label
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('TERRITORY CONTROLLED', canvas.width / 2, 440);

    // Difficulty badge
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    const won = data.playerWon ?? data.dayPercent > 50;
    ctx.fillText(`${won ? '🏆' : '💀'}  •  ${data.difficulty}`, canvas.width / 2, 520);

    // CTA
    ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = textGradient;
    ctx.fillText('CAN YOU BEAT ME? 🎮', canvas.width / 2, 590);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
    });
};

// Upload image to Supabase Storage and get public URL
const uploadToSupabase = async (imageBlob: Blob): Promise<string | null> => {
    try {
        const filename = `score_${Date.now()}_${Math.random().toString(36).slice(2)}.png`;

        const { error } = await supabase.storage
            .from('share-cards')
            .upload(filename, imageBlob, {
                contentType: 'image/png',
                cacheControl: '31536000',
                upsert: true
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return null;
        }

        const { data: urlData } = supabase.storage
            .from('share-cards')
            .getPublicUrl(filename);

        return urlData.publicUrl;
    } catch (err) {
        console.error('Upload failed:', err);
        return null;
    }
};

/** Generates a score card, uploads it, and opens a Twitter intent window. */
export const shareToTwitter = async (data: ShareCardData): Promise<'success' | 'fallback'> => {
    // Generate the image
    const imageBlob = await generateShareCard(data);

    // Upload to Supabase to get public URL
    const imageUrl = await uploadToSupabase(imageBlob);

    // Determine win/loss
    const won = data.playerWon ?? data.dayPercent > 50;
    const result = won ? '🏆 WON' : '💀 LOST';
    const diffEmoji = data.difficulty === 'NIGHTMARE' ? '👹' : data.difficulty === 'HARD' ? '🔥' : data.difficulty === 'MEDIUM' ? '⚔️' : '🌱';

    // Short, punchy tweet
    const tweetText = `${result} with ${data.dayPercent}% territory in Combat Pong ${diffEmoji}

Beat my score 👇`;

    const gameUrl = window.location.origin;

    if (imageUrl) {
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(imageUrl)}`;
        window.open(tweetUrl, '_blank', 'width=550,height=420');
        return 'success';
    } else {
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(gameUrl)}`;
        window.open(tweetUrl, '_blank', 'width=550,height=420');
        return 'fallback';
    }
};
