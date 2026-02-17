/**
 * Type definitions for the multiplayer networking layer.
 *
 * Uses a host/client architecture over Supabase Realtime broadcast channels:
 *   - The host runs physics and broadcasts game state each frame
 *   - The client sends paddle position updates back to the host
 */

export interface NetworkPlayer {
    id: string;
    email: string;
    isHost: boolean;
    ready: boolean;
}

export interface RoomState {
    roomId: string;
    players: NetworkPlayer[];
    status: 'waiting' | 'starting' | 'playing';
}

/** Messages sent over the Supabase Realtime broadcast channel. */
export type GameSignal =
    | { type: 'paddle_move'; y: number; x: number }
    | { type: 'game_state'; state: any };
