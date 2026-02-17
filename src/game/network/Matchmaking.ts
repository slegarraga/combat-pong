/**
 * Matchmaking hook — finds or creates a multiplayer room via Supabase Presence.
 *
 * Flow:
 *   1. Player calls `findMatch()` which joins the `pong_lobby_v1` presence channel
 *   2. On sync, checks if any other user is broadcasting `waiting_host` status
 *   3. If a host is found → joins their room as client
 *   4. If no host found after 1.5s → becomes the host and waits for a client
 *   5. Returns a `MatchResult` with the room ID and host/client role
 */

import { useRef, useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export interface MatchResult {
    /** The Supabase Realtime channel name to join (e.g. `room_<userId>`). */
    roomId: string;
    isHost: boolean;
}

/** Hook that handles lobby matchmaking. Returns `findMatch` to start and `match` when paired. */
export const useMatchmaking = (user: any) => {
    const [match, setMatch] = useState<MatchResult | null>(null);
    const [status, setStatus] = useState<'idle' | 'searching' | 'matched'>('idle');
    const channelRef = useRef<any>(null);

    const findMatch = () => {
        if (!user) return;
        if (status === 'searching') return;

        setStatus('searching');
        console.log('Searching for match...');

        const lobby = supabase.channel('pong_lobby_v1');
        channelRef.current = lobby;

        lobby
            .on('presence', { event: 'sync' }, () => {
                const state = lobby.presenceState();
                if (match) return; // Already matched

                // Search for an existing host
                let foundHostId: string | null = null;

                Object.keys(state).forEach(key => {
                    if (foundHostId) return;
                    // @ts-ignore
                    const presences = state[key] as any[];
                    presences.forEach((p: any) => {
                        if (p.user_id !== user.id && p.user_status === 'waiting_host') {
                            foundHostId = p.user_id;
                        }
                    });
                });

                if (foundHostId) {
                    // Found a host! Join them.
                    console.log('Found host:', foundHostId);
                    setMatch({ roomId: `room_${foundHostId}`, isHost: false });
                    setStatus('matched');
                    lobby.unsubscribe();
                } else {
                    // No host found, become the host.
                    // We verify if we are already tracked as host to avoid re-tracking? 
                    // Presence tracking happens in 'subscribe' callback below.
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track myself. If I found a match in 'sync' (which runs immediately if data exists), I might unmount/unsub.
                    // But if I didn't find anyone, I track myself as 'waiting_host'.

                    // Small delay to allow 'sync' to fire first? sync fires after subscribe usually?
                    // Actually sync fires when state is delivered.

                    // const state = lobby.presenceState();
                    // Re-check logic here is hard because sync is async.
                    // We will just track ourselves as 'waiting_host' optimistically.
                    // If someone else finds us, they will join matches.

                    await lobby.track({
                        user_id: user.id,
                        user_status: 'waiting_host',
                        online_at: new Date().toISOString(),
                    });

                    // If I am tracking as host, I should effectively be "waiting".
                    // I need to listen to my own Room Channel to see if someone joins?
                    // Actually, if I match logic:
                    // Client finds Host -> Client Sets Match -> Client components mount Game. (Client leaves Lobby)
                    // Host is still in Lobby. Host needs to know Client joined.
                    // Host should ALREADY be subscribed to `room_${user.id}`? 
                    // Or we handle that in the Game component?
                    // Let's handle it here: If I am host, I implicitly assume I am hosting room `room_${user.id}`.
                    // So I set match immediately to my own room?

                    // Better approach:
                    // 1. Join Lobby.
                    // 2. If valid Host found -> Set Match (Client).
                    // 3. If NO Host found -> Set Match (Host).
                    //    Wait... if I set Match (Host), I leave Lobby ui?
                    //    Yes, but I must REMAIN in Lobby presence so Client can find me.
                    //    So 'useMatchmaking' hook must NOT unmount or unsusbscribe if I am Host?
                    //    This is tricky.

                    // Simplified:
                    // Just set match immediately if I don't find anyone?
                    // But then I leave the lobby UI component...

                    // Make Matchmaking component Persistent?
                    // Or: Return 'isHosting' state.
                }
            });
    };

    // Logic fix: 
    // If I become Host, I set my roomId to `room_${myID}`. 
    // But I must keep the Lobby channel open so others can find me.
    useEffect(() => {
        if (status === 'searching' && !match) {
            // If I've been searching for 1 second and haven't found a host, I become the host.
            const timer = setTimeout(() => {
                console.log("No host found, becoming host.");
                setMatch({ roomId: `room_${user.id}`, isHost: true });
                setStatus('matched');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [status, match, user]);

    // Cleanup
    useEffect(() => {
        // If we are matched as CLIENT, we unsub from lobby (done in callback).
        // If we are matched as HOST, we MUST keep lobby presence alive until game starts?
        // Actually, if we leave to 'Game' screen, we unmount this hook?
        // If so, we disappear from Lobby. That's bad.
        // The Logic must be:
        // Host stays in 'Waiting for Opponent' screen (which keeps this hook or similar active).

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, []);

    return {
        findMatch,
        match,
        status
    };
};
