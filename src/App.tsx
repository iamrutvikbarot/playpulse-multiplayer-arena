'use client';

import React, { useEffect, useState } from 'react';
import { BackgroundEffect } from './components/BackgroundEffect';
import { ChatOverlay } from './components/ChatOverlay';
import { GameHeader } from './components/GameHeader';
import { GameResultModal } from './components/GameResultModal';
import { ServerLoader } from './components/ServerLoader';
import { Toast } from './components/Toast';
import { CardBattleView } from './games/CardBattleView';
import { LudoView } from './games/LudoView';
import { MiniRacingView } from './games/MiniRacingView';
import { RPSBattleView } from './games/RPSBattleView';
import { TicTacToeView } from './games/TicTacToeView';
import { useMultiplayer } from './network/useMultiplayer';
import { LandingPage } from './views/LandingPage';
import { RoomLobby } from './views/RoomLobby';
import { GameId } from './types/game';

export default function App() {
  const {
    connected,
    connecting,
    room,
    error,
    currentUserId,
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
    leaveRoom,
    clearError,
  } = useMultiplayer();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastReadChatCount, setLastReadChatCount] = useState(0);

  // Track initial room code from URL and previous room state
  const initialRoomAttemptedRef = React.useRef(false);
  const wasInRoomRef = React.useRef(false);

  // Auto-join room from URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined' && connected && !room && !initialRoomAttemptedRef.current) {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        initialRoomAttemptedRef.current = true;
        const savedName = localStorage.getItem('playpulse_saved_name') || 'Guest Player';
        const savedChar = localStorage.getItem('playpulse_saved_character') || 'char_ironman';
        joinRoom(roomParam.trim().toUpperCase(), savedName, savedChar);
      }
    }
  }, [connected, joinRoom, room]);

  // Sync URL when in room, and clean URL only when leaving an active room or on join error
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);

      if (room && room.code) {
        wasInRoomRef.current = true;
        if (url.searchParams.get('room') !== room.code) {
          url.searchParams.set('room', room.code);
          window.history.replaceState({}, '', url.pathname + url.search);
        }
      } else if (wasInRoomRef.current || error) {
        // Player was in a room and left, or room join failed
        if (url.searchParams.has('room')) {
          url.searchParams.delete('room');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }
        if (!room) wasInRoomRef.current = false;
      }
    }
  }, [room, error]);

  const messagesCount = room?.chatMessages.length || 0;
  const unreadChatCount = isChatOpen ? 0 : Math.max(0, messagesCount - lastReadChatCount);

  const handleToggleChat = () => {
    if (!isChatOpen) {
      setLastReadChatCount(messagesCount);
    }
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="relative min-h-screen bg-[#080A12] text-zinc-100 flex flex-col selection:bg-purple-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Dynamic Animated 3D Cyber Particle Canvas Background */}
      <BackgroundEffect />

      {/* Epic Cyber Server Connection Loader */}
      {!connected && <ServerLoader isConnecting={connecting} />}

      {/* Floating Global Toast Notification */}
      <Toast message={error} onClose={clearError} />

      {/* Screen 1: Landing Page (No active room) */}
      {!room && (
        <LandingPage
          onCreateRoom={(name, charId, initialGame) => createRoom(name, charId, initialGame)}
          onJoinRoom={(code, name, charId) => joinRoom(code, name, charId)}
        />
      )}

      {/* Screen 2: Waiting Room Lobby */}
      {room && room.gameStatus === 'lobby' && (
        <RoomLobby
          room={room}
          currentUserId={currentUserId}
          onSelectGame={(gameId: GameId) => selectGame(gameId)}
          onToggleReady={() => toggleReady()}
          onStartGame={() => startGame()}
          onAddBot={() => addBot()}
          onRemoveBot={(botId) => removeBot(botId)}
          onUpdateProfile={(name, charId) => updateProfile(name, charId)}
          onLeaveRoom={() => leaveRoom()}
          onToggleChat={handleToggleChat}
          unreadChatCount={unreadChatCount}
        />
      )}

      {/* Screen 3: Active Game Arena */}
      {room && (room.gameStatus === 'playing' || room.gameStatus === 'game-over') && (
        <div className="relative z-10 w-full min-h-screen flex flex-col justify-between">
          <GameHeader
            room={room}
            currentUserId={currentUserId}
            onLeave={() => returnToLobby()}
            onToggleChat={handleToggleChat}
            unreadChatCount={unreadChatCount}
          />

          <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full">
            {room.currentGame === 'tic-tac-toe' && (
              <TicTacToeView
                room={room}
                currentUserId={currentUserId}
                onSendAction={sendGameAction}
              />
            )}

            {room.currentGame === 'rps-battle' && (
              <RPSBattleView
                room={room}
                currentUserId={currentUserId}
                onSendAction={sendGameAction}
              />
            )}

            {room.currentGame === 'ludo' && (
              <LudoView
                room={room}
                currentUserId={currentUserId}
                onSendAction={sendGameAction}
              />
            )}

            {room.currentGame === 'card-battle' && (
              <CardBattleView
                room={room}
                currentUserId={currentUserId}
                onSendAction={sendGameAction}
              />
            )}

            {room.currentGame === 'mini-racing' && (
              <MiniRacingView
                room={room}
                currentUserId={currentUserId}
                onSendAction={sendGameAction}
              />
            )}
          </main>

          {/* Match Results Celebration Modal */}
          <GameResultModal
            room={room}
            currentUserId={currentUserId}
            onRematch={() => voteRematch()}
            onReturnToLobby={() => returnToLobby()}
          />
        </div>
      )}

      {/* Real-time Room Chat Overlay */}
      {room && (
        <ChatOverlay
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={room.chatMessages}
          players={room.players}
          currentUserId={currentUserId}
          onSendMessage={(text, isEmote) => sendChatMessage(text, isEmote)}
        />
      )}
    </div>
  );
}
