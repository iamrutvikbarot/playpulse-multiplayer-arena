import React, { useEffect, useState } from 'react';
import { BackgroundEffect } from './components/BackgroundEffect';
import { ChatOverlay } from './components/ChatOverlay';
import { ConnectingLoader } from './components/ConnectingLoader';
import { GameHeader } from './components/GameHeader';
import { GameResultModal } from './components/GameResultModal';
import { ReactionBurstOverlay } from './components/ReactionBurstOverlay';
import { ToastNotification } from './components/ToastNotification';
import { VideoCallOverlay } from './components/VideoCallOverlay';
import { CardBattleView } from './games/CardBattleView';
import { LudoView } from './games/LudoView';
import { MiniRacingView } from './games/MiniRacingView';
import { RPSBattleView } from './games/RPSBattleView';
import { TicTacToeView } from './games/TicTacToeView';
import { useMultiplayer } from './network/useMultiplayer';
import { useWebRTC } from './network/useWebRTC';
import { LandingPage } from './pages/LandingPage';
import { RoomLobby } from './pages/RoomLobby';
import { GameId } from './types/game';
import { getRandomCharacter } from './utils/characters';

export default function App() {
  const {
    connected,
    connecting,
    room,
    error,
    currentUserId,
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
    leaveRoom,
    clearError,
    registerSignalingHandler,
    sendMessage,
  } = useMultiplayer();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastReadChatCount, setLastReadChatCount] = useState(0);

  // WebRTC Video & Audio Hook
  const webRTC = useWebRTC({
    roomCode: room?.code || null,
    currentUserId,
    players: room?.players || [],
    sendMessage,
  });

  // Connect WebRTC signaling dispatcher to multiplayer socket messages
  useEffect(() => {
    return registerSignalingHandler((data) => {
      webRTC.handleSignalingMessage(data);
    });
  }, [registerSignalingHandler, webRTC.handleSignalingMessage]);

  // Check URL query parameters for auto-room join
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam && !room) {
        const savedName = localStorage.getItem('playpulse_saved_name') || 'Player';
        const savedChar = localStorage.getItem('playpulse_saved_character') || getRandomCharacter().id;
        joinRoom(roomParam.toUpperCase().trim(), savedName, savedChar);
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

  const handleToggleVideoCall = async () => {
    if (webRTC.isInCall) {
      webRTC.leaveCall();
    } else {
      setIsChatOpen(false);
      await webRTC.startCall(true);
    }
  };

  const handleStartCall = async (withVideo?: boolean) => {
    setIsChatOpen(false);
    return await webRTC.startCall(withVideo);
  };

  return (
    <div className="relative w-full h-screen h-[100dvh] max-h-[100dvh] bg-[#070913] text-zinc-100 flex flex-col selection:bg-purple-500 selection:text-white font-sans antialiased overflow-hidden">
      {/* 3D Animated Particle & Polyhedra Background */}
      <BackgroundEffect />

      {/* Floating Animated Reaction Bursts */}
      <ReactionBurstOverlay bursts={reactionBursts} />

      {/* Floating Toast Notifications */}
      <ToastNotification message={error} onClose={clearError} />

      {/* Project Custom Loader until server connection is established */}
      <ConnectingLoader
        connecting={connecting}
        connected={connected}
        error={!connected && !connecting ? 'Reconnecting to game server...' : null}
      />

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
          onLeaveRoom={() => {
            if (webRTC.isInCall) webRTC.leaveCall();
            leaveRoom();
          }}
          onToggleChat={handleToggleChat}
          unreadChatCount={unreadChatCount}
          isInCall={webRTC.isInCall}
          onToggleVideoCall={handleToggleVideoCall}
        />
      )}

      {/* Screen 3: Active Game Arena */}
      {room && (room.gameStatus === 'playing' || room.gameStatus === 'game-over') && (
        <div className="relative z-10 w-full h-full max-h-full flex flex-col justify-between overflow-hidden">
          <GameHeader
            room={room}
            currentUserId={currentUserId}
            onLeave={() => {
              if (webRTC.isInCall) webRTC.leaveCall();
              returnToLobby();
            }}
            onToggleChat={handleToggleChat}
            unreadChatCount={unreadChatCount}
            isInCall={webRTC.isInCall}
            onToggleVideoCall={handleToggleVideoCall}
            onTriggerReaction={(emoji) => sendReactionBurst(emoji)}
          />

          <main className="flex-1 overflow-y-auto min-h-0 flex flex-col items-center justify-center p-2 sm:p-4 w-full">
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

      {/* Real-time Room Video Call HUD / Overlay */}
      {room && (
        <VideoCallOverlay
          isInCall={webRTC.isInCall}
          isAudioMuted={webRTC.isAudioMuted}
          isVideoOff={webRTC.isVideoOff}
          isScreenSharing={webRTC.isScreenSharing}
          isSpeaking={webRTC.isSpeaking}
          isMirrorMode={webRTC.isMirrorMode}
          localStream={webRTC.localStream}
          peers={webRTC.peers}
          activeSpeakerId={webRTC.activeSpeakerId}
          callLayout={webRTC.callLayout}
          setCallLayout={webRTC.setCallLayout}
          permissionError={webRTC.permissionError}
          currentUserId={currentUserId}
          players={room.players}
          onStartCall={handleStartCall}
          onLeaveCall={webRTC.leaveCall}
          onToggleAudio={webRTC.toggleAudio}
          onToggleVideo={webRTC.toggleVideo}
          onToggleScreenShare={webRTC.toggleScreenShare}
          onToggleMirror={webRTC.toggleMirrorMode}
        />
      )}

      {/* Real-time Room Chat & Reactions Drawer */}
      {room && (
        <ChatOverlay
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={room.chatMessages}
          players={room.players}
          currentUserId={currentUserId}
          roomCode={room.code}
          onSendMessage={(text, isEmote) => sendChatMessage(text, isEmote)}
          onSendReactionBurst={(emoji) => sendReactionBurst(emoji)}
          isInCall={webRTC.isInCall}
          isAudioMuted={webRTC.isAudioMuted}
          isVideoOff={webRTC.isVideoOff}
          onStartCall={handleStartCall}
          onLeaveCall={webRTC.leaveCall}
          onToggleAudio={webRTC.toggleAudio}
          onToggleVideo={webRTC.toggleVideo}
          connectedPeerCount={Object.keys(webRTC.peers).length}
        />
      )}
    </div>
  );
}
