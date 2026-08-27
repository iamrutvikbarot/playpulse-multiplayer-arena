import { useCallback, useEffect, useRef, useState } from 'react';
import { GameId, Player, ReactionBurstData, RoomSettings, RoomState, WSMessage } from '../types/game';
import { sound } from '../utils/audio';

export interface MultiplayerHook {
  connected: boolean;
  connecting: boolean;
  latency: number;
  room: RoomState | null;
  error: string | null;
  currentUserId: string;
  currentPlayer: Player | null;
  isHost: boolean;
  reactionBursts: ReactionBurstData[];
  createRoom: (playerName: string, characterId: string, initialGame?: GameId, settings?: Partial<RoomSettings>) => void;
  joinRoom: (roomCode: string, playerName: string, characterId: string) => void;
  toggleReady: (isReady?: boolean) => void;
  updateProfile: (name: string, characterId: string) => void;
  selectGame: (gameId: GameId) => void;
  startGame: () => void;
  sendGameAction: (actionType: string, payload?: any) => void;
  voteRematch: () => void;
  returnToLobby: () => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
  sendChatMessage: (text: string, isEmote?: boolean) => void;
  sendReactionBurst: (emoji: string) => void;
  sendMessage: (msg: WSMessage) => void;
  registerSignalingHandler: (handler: (msg: WSMessage) => void) => () => void;
  leaveRoom: () => void;
  clearError: () => void;
}

export function useMultiplayer(): MultiplayerHook {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [latency, setLatency] = useState(0);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reactionBursts, setReactionBursts] = useState<ReactionBurstData[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const pingStartRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<any>(null);
  const messageQueueRef = useRef<WSMessage[]>([]);
  const signalingHandlersRef = useRef<Set<(msg: WSMessage) => void>>(new Set());
  const roomRef = useRef<RoomState | null>(null);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  // Ephemeral session ID stored in sessionStorage
  const [currentUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('playpulse_session_id');
      if (saved) return saved;
      const newId = `player_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36)}`;
      sessionStorage.setItem('playpulse_session_id', newId);
      return newId;
    }
    return `player_${Date.now()}`;
  });

  // Helper to sync browser URL with room code
  const syncUrlWithRoom = useCallback((roomCode: string | null) => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (roomCode) {
          url.searchParams.set('room', roomCode);
          window.history.replaceState({}, '', url.toString());
        } else {
          url.searchParams.delete('room');
          window.history.replaceState({}, '', url.pathname);
        }
      } catch (e) {}
    }
  }, []);

  const send = useCallback(
    (msg: WSMessage) => {
      const formatted = { ...msg, senderId: currentUserId, timestamp: Date.now() };
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(formatted));
      } else {
        // Queue action to send once socket opens
        messageQueueRef.current.push(formatted);
      }
    },
    [currentUserId]
  );

  const registerSignalingHandler = useCallback((handler: (msg: WSMessage) => void) => {
    signalingHandlersRef.current.add(handler);
    return () => {
      signalingHandlersRef.current.delete(handler);
    };
  }, []);

  const connectSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

    // If socket is already open or currently opening, don't duplicate connection
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    setConnecting(true);
    const customWsUrl =
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WS_URL) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_WS_URL) ||
      null;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = customWsUrl || `${protocol}//${window.location.host}`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setConnecting(false);
      setError(null);

      // Flush queued messages
      if (messageQueueRef.current.length > 0) {
        while (messageQueueRef.current.length > 0) {
          const qMsg = messageQueueRef.current.shift();
          if (qMsg && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(qMsg));
          }
        }
      }

      // Ping to measure latency
      pingStartRef.current = Date.now();
      ws.send(JSON.stringify({ type: 'PING' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);

        // Notify signaling listeners (WebRTC)
        if (
          msg.type === 'WEBRTC_SIGNAL' ||
          msg.type === 'WEBRTC_JOIN_CALL' ||
          msg.type === 'WEBRTC_LEAVE_CALL' ||
          msg.type === 'MEDIA_STATE_UPDATE'
        ) {
          signalingHandlersRef.current.forEach((handler) => handler(msg));
          return;
        }

        if (msg.type === 'PONG') {
          const rtt = Date.now() - pingStartRef.current;
          setLatency(Math.max(5, Math.round(rtt)));
          return;
        }

        if (msg.type === 'REACTION_BURST') {
          const burst = msg.payload as ReactionBurstData;
          if (burst) {
            sound.playReactionPop();
            setReactionBursts((prev) => [...prev.slice(-15), burst]);
            setTimeout(() => {
              setReactionBursts((prev) => prev.filter((b) => b.id !== burst.id));
            }, 2600);
          }
          return;
        }

        if (msg.type === 'ROOM_SYNC') {
          const roomState = msg.payload as RoomState;
          setRoom((prev) => {
            // Play message sound if a new message from someone else arrived
            if (
              prev &&
              roomState.chatMessages.length > prev.chatMessages.length
            ) {
              const latest = roomState.chatMessages[roomState.chatMessages.length - 1];
              if (latest && latest.senderId !== currentUserId && !latest.isSystem) {
                sound.playMessagePing();
              }
            }
            return roomState;
          });
          setError(null);
          if (roomState.code) {
            syncUrlWithRoom(roomState.code);
          }
          return;
        }

        if (msg.type === 'ROOM_DISBANDED') {
          setRoom(null);
          syncUrlWithRoom(null);
          setError(msg.payload?.message || 'The host left the lobby. The room has been closed.');
          sound.playDefeat();
          return;
        }

        if (msg.type === 'ROOM_LEFT') {
          setRoom(null);
          syncUrlWithRoom(null);
          return;
        }

        if (msg.type === 'ERROR') {
          setError(msg.payload?.message || 'An error occurred');
          syncUrlWithRoom(null);
          sound.playDefeat();
          return;
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setConnecting(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectSocket();
      }, 2000);
    };

    ws.onerror = () => {
      setConnected(false);
      setConnecting(false);
    };
  }, [syncUrlWithRoom, currentUserId]);

  useEffect(() => {
    connectSocket();

    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        pingStartRef.current = Date.now();
        socketRef.current.send(JSON.stringify({ type: 'PING' }));
      }
    }, 10000);

    const handleBeforeUnload = () => {
      const currentRoom = roomRef.current;
      if (currentRoom && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(
            JSON.stringify({
              type: 'ROOM_LEAVE',
              payload: { roomCode: currentRoom.code, playerId: currentUserId },
              senderId: currentUserId,
            })
          );
        } catch (e) {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleBeforeUnload);

    return () => {
      clearInterval(pingInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleBeforeUnload);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connectSocket, currentUserId]);

  const createRoom = useCallback(
    (playerName: string, characterId: string, initialGame: GameId = 'tic-tac-toe', settings?: Partial<RoomSettings>) => {
      sound.playClick();
      send({
        type: 'ROOM_CREATE',
        payload: {
          player: { id: currentUserId, name: playerName, characterId },
          initialGame,
          settings,
        },
      });
    },
    [send, currentUserId]
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string, characterId: string) => {
      sound.playClick();
      send({
        type: 'ROOM_JOIN',
        payload: {
          roomCode,
          player: { id: currentUserId, name: playerName, characterId },
        },
      });
    },
    [send, currentUserId]
  );

  const toggleReady = useCallback(
    (isReady?: boolean) => {
      if (!room) return;
      sound.playClick();
      send({
        type: 'PLAYER_READY',
        payload: { roomCode: room.code, playerId: currentUserId, isReady },
      });
    },
    [send, room, currentUserId]
  );

  const updateProfile = useCallback(
    (name: string, characterId: string) => {
      if (!room) return;
      send({
        type: 'PLAYER_UPDATE',
        payload: { roomCode: room.code, playerId: currentUserId, name, characterId },
      });
    },
    [send, room, currentUserId]
  );

  const selectGame = useCallback(
    (gameId: GameId) => {
      if (!room) return;
      sound.playClick();
      send({
        type: 'GAME_SELECT',
        payload: { roomCode: room.code, gameId },
      });
    },
    [send, room]
  );

  const startGame = useCallback(() => {
    if (!room) return;
    sound.playJoin();
    send({
      type: 'GAME_START',
      payload: { roomCode: room.code },
    });
  }, [send, room]);

  const sendGameAction = useCallback(
    (actionType: string, payload?: any) => {
      if (!room) return;
      send({
        type: 'GAME_ACTION',
        payload: {
          roomCode: room.code,
          playerId: currentUserId,
          action: { type: actionType, payload },
        },
      });
    },
    [send, room, currentUserId]
  );

  const voteRematch = useCallback(() => {
    if (!room) return;
    sound.playClick();
    send({
      type: 'REMATCH_VOTE',
      payload: { roomCode: room.code, playerId: currentUserId },
    });
  }, [send, room, currentUserId]);

  const returnToLobby = useCallback(() => {
    if (!room) return;
    sound.playClick();
    send({
      type: 'RETURN_TO_LOBBY',
      payload: { roomCode: room.code },
    });
  }, [send, room]);

  const addBot = useCallback(() => {
    if (!room) return;
    sound.playClick();
    send({
      type: 'BOT_ADD',
      payload: { roomCode: room.code },
    });
  }, [send, room]);

  const removeBot = useCallback(
    (botId: string) => {
      if (!room) return;
      sound.playClick();
      send({
        type: 'BOT_REMOVE',
        payload: { roomCode: room.code, botId },
      });
    },
    [send, room]
  );

  const sendChatMessage = useCallback(
    (text: string, isEmote = false) => {
      if (!room || !text.trim()) return;
      send({
        type: isEmote ? 'CHAT_EMOTE' : 'CHAT_MESSAGE',
        payload: { roomCode: room.code, playerId: currentUserId, text: text.trim(), isEmote },
      });
    },
    [send, room, currentUserId]
  );

  const sendReactionBurst = useCallback(
    (emoji: string) => {
      if (!room) return;
      const me = room.players.find((p) => p.id === currentUserId);
      const xPercent = 20 + Math.floor(Math.random() * 60);

      // Trigger locally immediately
      const localBurst: ReactionBurstData = {
        id: `burst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        emoji,
        senderName: me?.name || 'You',
        characterId: me?.characterId || '',
        timestamp: Date.now(),
        x: xPercent,
      };
      sound.playReactionPop();
      setReactionBursts((prev) => [...prev.slice(-15), localBurst]);
      setTimeout(() => {
        setReactionBursts((prev) => prev.filter((b) => b.id !== localBurst.id));
      }, 2600);

      send({
        type: 'REACTION_BURST',
        payload: {
          roomCode: room.code,
          emoji,
          senderName: me?.name || 'Player',
          characterId: me?.characterId || '',
          x: xPercent,
        },
      });
    },
    [send, room, currentUserId]
  );

  const leaveRoom = useCallback(() => {
    sound.playClick();
    if (room) {
      send({
        type: 'ROOM_LEAVE',
        payload: { roomCode: room.code, playerId: currentUserId },
      });
    }
    setRoom(null);
    syncUrlWithRoom(null);
  }, [room, currentUserId, send, syncUrlWithRoom]);

  const currentPlayer = room?.players.find((p) => p.id === currentUserId) || null;
  const isHost = currentPlayer?.isHost || false;

  return {
    connected,
    connecting,
    latency,
    room,
    error,
    currentUserId,
    currentPlayer,
    isHost,
    reactionBursts,
    createRoom,
    joinRoom,
    toggleReady,
    updateProfile,
    selectGame,
    startGame,
    sendGameAction,
    voteRematch,
    returnToLobby,
    addBot,
    removeBot,
    sendChatMessage,
    sendReactionBurst,
    sendMessage: send,
    registerSignalingHandler,
    leaveRoom,
    clearError: () => setError(null),
  };
}

