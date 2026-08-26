import React, { useEffect, useState } from 'react';
import { BackgroundEffect } from './components/BackgroundEffect';
import { ChatOverlay } from './components/ChatOverlay';
import { GameHeader } from './components/GameHeader';
import { GameResultModal } from './components/GameResultModal';
import { CardBattleView } from './games/CardBattleView';
import { LudoView } from './games/LudoView';
import { MiniRacingView } from './games/MiniRacingView';
import { RPSBattleView } from './games/RPSBattleView';
import { TicTacToeView } from './games/TicTacToeView';
import { useMultiplayer } from './network/useMultiplayer';
import { LandingPage } from './pages/LandingPage';
import { RoomLobby } from './pages/RoomLobby';
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

  // Check URL query parameters for auto-room join
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam && !room) {
        const savedName = localStorage.getItem('playpulse_saved_name') || 'Guest Player';
        const savedChar = localStorage.getItem('playpulse_saved_character') || 'char_knight';
        joinRoom(roomParam.toUpperCase(), savedName, savedChar);
      }
    }
  }, [joinRoom, room]);

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
      {/* Dynamic Animated Particle Canvas Background */}
      <BackgroundEffect />

      {/* Connection Indicator when disconnected/connecting */}
      {!connected && (
        <div className="fixed top-2 right-2 z-50 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{connecting ? 'Connecting to Server...' : 'Reconnecting...'}</span>
        </div>
      )}

      {/* Screen 1: Landing Page (No active room) */}
      {!room && (
        <LandingPage
          onCreateRoom={(name, charId, initialGame) => createRoom(name, charId, initialGame)}
          onJoinRoom={(code, name, charId) => joinRoom(code, name, charId)}
          error={error}
          onClearError={clearError}
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
