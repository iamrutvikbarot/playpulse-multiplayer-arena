import {
  ChevronDown,
  ChevronUp,
  FlipHorizontal,
  Grid,
  Info,
  Layers,
  LayoutGrid,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Monitor,
  PhoneCall,
  PhoneOff,
  Radio,
  Sparkles,
  Users,
  Video,
  VideoOff,
} from 'lucide-react';
import React, { useState } from 'react';
import { Player } from '../types/game';
import { PeerMediaInfo } from '../network/useWebRTC';
import { VideoTile } from './VideoTile';

interface VideoCallOverlayProps {
  isInCall: boolean;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  isMirrorMode: boolean;
  localStream: MediaStream | null;
  peers: Record<string, PeerMediaInfo>;
  activeSpeakerId: string | null;
  callLayout: 'floating-pip' | 'grid' | 'compact-bar';
  setCallLayout: (layout: 'floating-pip' | 'grid' | 'compact-bar') => void;
  permissionError: string | null;
  currentUserId: string;
  players: Player[];
  onStartCall: (withVideo?: boolean) => Promise<boolean>;
  onLeaveCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => Promise<void>;
  onToggleScreenShare: () => Promise<void>;
  onToggleMirror: () => void;
}

export const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({
  isInCall,
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  isSpeaking,
  isMirrorMode,
  localStream,
  peers,
  callLayout,
  setCallLayout,
  permissionError,
  currentUserId,
  players,
  onLeaveCall,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleMirror,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const me = players.find((p) => p.id === currentUserId) || {
    id: currentUserId,
    name: 'You',
    characterId: 'char_arjuna',
    isHost: false,
    isReady: true,
    isConnected: true,
    score: 0,
    joinedAt: Date.now(),
  };

  // Only include human players who are in the call or connected
  const activeRemotePlayers = players.filter(
    (p) => p.id !== currentUserId && !p.isBot && (peers[p.id] || p.isConnected)
  );
  const totalInCall = activeRemotePlayers.length + 1;

  if (!isInCall) {
    return null;
  }

  // Google Meet / Zoom style auto-adaptive grid layout
  // Ensures video tiles stretch/shrink to fit 100% of the available container without overflow scrolling
  const getGridClasses = (count: number) => {
    switch (count) {
      case 1:
        return 'grid grid-cols-1 grid-rows-1 place-items-center w-full h-full max-w-md max-h-full mx-auto';
      case 2:
        return 'grid grid-cols-2 grid-rows-1 gap-2 place-items-center w-full h-full max-w-2xl mx-auto';
      case 3:
        return 'grid grid-cols-3 grid-rows-1 gap-1.5 sm:gap-2 place-items-center w-full h-full max-w-3xl mx-auto';
      case 4:
        return 'grid grid-cols-2 grid-rows-2 gap-1.5 sm:gap-2 place-items-center w-full h-full max-w-2xl mx-auto';
      case 5:
      case 6:
        return 'grid grid-cols-3 grid-rows-2 gap-1.5 sm:gap-2 place-items-center w-full h-full max-w-3xl mx-auto';
      default:
        return 'grid grid-cols-3 auto-rows-fr gap-2 place-items-center w-full h-full max-w-3xl mx-auto overflow-y-auto';
    }
  };

  return (
    <>
      {/* 1. Minimized Pill Badge (High Z-Index, Accessible Anytime) */}
      {isMinimized && (
        <div
          id="video-call-minimized-dock"
          className="fixed bottom-4 right-4 z-[80] bg-[#0A0D1A]/95 backdrop-blur-2xl border border-purple-500/40 rounded-full px-3.5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Call ({totalInCall})</span>
            </span>
          </div>

          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            {/* Quick Mic toggle */}
            <button
              onClick={onToggleAudio}
              className={`p-1.5 rounded-full text-xs cursor-pointer transition-colors ${
                isAudioMuted
                  ? 'bg-red-950 text-red-400 border border-red-500/40'
                  : 'bg-[#182038] text-white hover:bg-[#222E50]'
              }`}
              title={isAudioMuted ? 'Unmute' : 'Mute'}
            >
              {isAudioMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            {/* Quick Camera toggle */}
            <button
              onClick={onToggleVideo}
              className={`p-1.5 rounded-full text-xs cursor-pointer transition-colors ${
                isVideoOff
                  ? 'bg-zinc-900 text-zinc-400'
                  : 'bg-[#182038] text-white hover:bg-[#222E50]'
              }`}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5 text-purple-400" />}
            </button>

            {/* Expand Call View */}
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-colors"
              title="Expand Call View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Call Container */}
      {!isMinimized && (
        <div
          id="video-call-active-container"
          className={`fixed z-[80] transition-all duration-300 flex flex-col ${
            /* Mobile / Small Screens: Cover Top portion of the Screen (48dvh) with clear view */
            'inset-x-0 top-0 h-[48dvh] max-h-[50dvh] sm:h-auto sm:max-h-[85vh] ' +
            (callLayout === 'grid'
              ? 'sm:inset-x-6 sm:top-16 sm:bottom-16 sm:max-w-5xl sm:mx-auto bg-[#070A14]/98 backdrop-blur-2xl border border-white/15 sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)]'
              : callLayout === 'compact-bar'
              ? 'sm:top-16 sm:inset-x-4 sm:max-w-4xl sm:mx-auto bg-[#080B16]/95 backdrop-blur-xl border border-white/15 sm:rounded-2xl shadow-2xl'
              : 'sm:bottom-4 sm:right-4 sm:top-auto sm:inset-x-auto sm:w-[380px] lg:w-[440px] bg-[#070A15]/95 backdrop-blur-2xl border border-purple-500/30 sm:rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)]')
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 border-b border-white/10 select-none bg-[#05070E]/80 sm:rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1.5 font-display">
                <span>Battle Voice & Video</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-900/70 border border-purple-400/40 text-purple-300 font-mono">
                  {totalInCall} {totalInCall === 1 ? 'player' : 'players'}
                </span>
              </h4>
            </div>

            {/* Layout controls & minimize button */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setCallLayout(
                    callLayout === 'floating-pip'
                      ? 'compact-bar'
                      : callLayout === 'compact-bar'
                      ? 'grid'
                      : 'floating-pip'
                  )
                }
                className="hidden sm:inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={`Layout: ${callLayout}`}
              >
                {callLayout === 'floating-pip' ? (
                  <Layers className="w-3.5 h-3.5" />
                ) : callLayout === 'compact-bar' ? (
                  <LayoutGrid className="w-3.5 h-3.5" />
                ) : (
                  <Grid className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Minimize Call View"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Streams Canvas (Adaptive Google Meet style grid without unnecessary scrolling) */}
          <div className="flex-1 min-h-0 w-full h-full p-2 sm:p-3 overflow-hidden flex items-center justify-center">
            <div className={`w-full h-full min-h-0 ${getGridClasses(totalInCall)}`}>
              {/* Local Player Video Tile */}
              <div className="w-full h-full min-h-0 min-w-0 flex items-center justify-center flex-1">
                <VideoTile
                  player={me}
                  stream={localStream}
                  isLocal={true}
                  isAudioMuted={isAudioMuted}
                  isVideoOff={isVideoOff}
                  isScreenSharing={isScreenSharing}
                  isSpeaking={isSpeaking}
                  isMirrorMode={isMirrorMode}
                  onToggleMirror={onToggleMirror}
                  aspect="auto"
                />
              </div>

              {/* Remote Peer Video Tiles */}
              {activeRemotePlayers.map((player) => {
                const peerInfo = peers[player.id];
                return (
                  <div key={player.id} className="w-full h-full min-h-0 min-w-0 flex items-center justify-center flex-1">
                    <VideoTile
                      player={player}
                      stream={peerInfo?.stream || null}
                      isLocal={false}
                      isAudioMuted={peerInfo ? peerInfo.isAudioOn === false : false}
                      isVideoOff={peerInfo ? peerInfo.isVideoOn === false : false}
                      isScreenSharing={peerInfo?.isScreenSharing || false}
                      isSpeaking={peerInfo?.isSpeaking || false}
                      aspect="auto"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permission Error Banner if any */}
          {permissionError && (
            <div className="mx-2.5 mb-1.5 p-2 rounded-xl bg-red-950/90 border border-red-500/40 text-[11px] text-red-200 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{permissionError}</div>
            </div>
          )}

          {/* Interactive Control Action Bar */}
          <div className="p-2 sm:p-3 border-t border-white/10 bg-[#05070E]/95 flex items-center justify-between sm:rounded-b-2xl flex-shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Mic Toggle */}
              <button
                id="call-btn-toggle-mic"
                onClick={onToggleAudio}
                className={`p-2 sm:px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAudioMuted
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                    : 'bg-[#151C33] text-white border border-white/10 hover:bg-[#1C2544]'
                }`}
                title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isAudioMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                <span className="text-[11px] sm:text-xs">{isAudioMuted ? 'Muted' : 'Mic On'}</span>
              </button>

              {/* Video Camera Toggle */}
              <button
                id="call-btn-toggle-camera"
                onClick={onToggleVideo}
                className={`p-2 sm:px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isVideoOff
                    ? 'bg-zinc-800 text-zinc-400 border border-white/10 hover:bg-zinc-700'
                    : 'bg-[#151C33] text-white border border-white/10 hover:bg-[#1C2544]'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4 text-zinc-400" /> : <Video className="w-4 h-4 text-purple-400" />}
                <span className="text-[11px] sm:text-xs">{isVideoOff ? 'Cam Off' : 'Camera'}</span>
              </button>

              {/* Screen Share Toggle (visible on tablets & desktops) */}
              <button
                id="call-btn-toggle-screen"
                onClick={onToggleScreenShare}
                className={`hidden sm:flex p-2 sm:px-3 rounded-xl text-xs font-semibold items-center gap-1.5 transition-all cursor-pointer ${
                  isScreenSharing
                    ? 'bg-emerald-600 text-white border border-emerald-400 shadow-md'
                    : 'bg-[#151C33] text-zinc-300 border border-white/10 hover:bg-[#1C2544] hover:text-white'
                }`}
                title="Share Screen"
              >
                <Monitor className="w-4 h-4" />
                <span className="text-[11px] sm:text-xs">{isScreenSharing ? 'Sharing' : 'Share'}</span>
              </button>
            </div>

            {/* Leave Call Button */}
            <button
              id="call-btn-leave"
              onClick={onLeaveCall}
              className="py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950/50 cursor-pointer active:scale-95 transition-transform"
              title="Leave Video Call"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
