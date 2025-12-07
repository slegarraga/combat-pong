export interface NetworkPlayer {
    id: string; // Supabase user ID or presence ID
    email: string;
    isHost: boolean;
    ready: boolean;
}

export interface RoomState {
    roomId: string;
    players: NetworkPlayer[];
    status: 'waiting' | 'starting' | 'playing';
}

export type GameSignal =
    | { type: 'paddle_move'; y: number; x: number } // Client sends this
    | { type: 'game_state'; state: any }; // Host sends this (compressed game state)
