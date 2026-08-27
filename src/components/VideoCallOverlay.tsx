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
  Settings,
  Sparkles,
  Users,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useState } from 'react';
import { Player } from '../types/game';
import { PeerMediaInfo } from '../network/useWebRTC';
import { VideoTile } from './VideoTile';
import { sound } from '../utils/audio';

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
  onStartCall,
  onLeaveCall,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleMirror,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [dockPosition, setDockPosition] = useState<'bottom-right' | 'top-right' | 'bottom-left'>('bottom-right');

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

  const otherPlayers = players.filter((p) => p.id !== currentUserId);

  if (!isInCall) {
    return null;
  }

  // Position classes for floating mode
  const dockPositionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'top-right': 'top-20 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <>
      {/* 1. Minimized Pill Badge */}
      {isMinimized && (
        <div
          id="video-call-minimized-dock"
          className={`fixed ${dockPositionClasses[dockPosition]} z-40 bg-[#0C101E]/90 backdrop-blur-xl border border-purple-500/40 rounded-full px-3.5 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Live Call ({Object.keys(peers).length + 1})
            </span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-white/10 pl-2">
            <button
              onClick={onToggleAudio}
              className={`p-1.5 rounded-full text-xs cursor-pointer ${
                isAudioMuted ? 'bg-red-950 text-red-400 border border-red-500/30' : 'bg-[#181F36] text-white hover:bg-[#222B4A]'
              }`}
              title={isAudioMuted ? 'Unmute' : 'Mute'}
            >
              {isAudioMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onToggleVideo}
              className={`p-1.5 rounded-full text-xs cursor-pointer ${
                isVideoOff ? 'bg-zinc-900 text-zinc-400' : 'bg-[#181F36] text-white hover:bg-[#222B4A]'
              }`}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
              title="Expand Call View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Floating Dock / Grid / Compact Bar */}
      {!isMinimized && (
        <div
          id="video-call-active-container"
          className={`fixed z-40 transition-all duration-200 ${
            callLayout === 'grid'
              ? 'inset-x-4 top-20 bottom-20 md:inset-x-16 lg:inset-x-32 bg-[#090C17]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.8)] flex flex-col'
              : callLayout === 'compact-bar'
              ? 'top-16 inset-x-4 max-w-4xl mx-auto bg-[#0A0D1A]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2.5 shadow-2xl flex flex-col'
              : `${dockPositionClasses[dockPosition]} w-[calc(100vw-2rem)] max-w-sm sm:w-96 max-h-[85vh] bg-[#0A0E1C]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex flex-col`
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 select-none">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>Battle Voice & Video</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-900/60 border border-purple-400/30 text-purple-300">
                  {Object.keys(peers).length + 1} connected
                </span>
              </h4>
            </div>

            {/* Layout switchers and minimize */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCallLayout(callLayout === 'floating-pip' ? 'compact-bar' : callLayout === 'compact-bar' ? 'grid' : 'floating-pip')}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
                title={`Layout: ${callLayout}`}
              >
                {callLayout === 'floating-pip' ? <Layers className="w-3.5 h-3.5" /> : callLayout === 'compact-bar' ? <LayoutGrid className="w-3.5 h-3.5" /> : <Grid className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Minimize Call"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Video Streams Canvas */}
          <div
            className={`p-2.5 overflow-y-auto ${
              callLayout === 'grid'
                ? 'flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-center justify-center'
                : callLayout === 'compact-bar'
                ? 'flex items-center gap-2 overflow-x-auto py-1 scrollbar-none'
                : 'grid grid-cols-1 gap-2 max-h-[380px]'
            }`}
          >
            {/* Local Video Tile */}
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
              compact={callLayout === 'compact-bar'}
            />

            {/* Remote Peer Video Tiles */}
            {otherPlayers.map((player) => {
              const peerInfo = peers[player.id];
              return (
                <VideoTile
                  key={player.id}
                  player={player}
                  stream={peerInfo?.stream || null}
                  isLocal={false}
                  isAudioMuted={peerInfo ? !peerInfo.isAudioOn : true}
                  isVideoOff={peerInfo ? !peerInfo.isVideoOn : true}
                  isScreenSharing={peerInfo?.isScreenSharing || false}
                  isSpeaking={peerInfo?.isSpeaking || false}
                  compact={callLayout === 'compact-bar'}
                />
              );
            })}
          </div>

          {/* Permission Error Banner if any */}
          {permissionError && (
            <div className="mx-2.5 mb-2 p-2 rounded-xl bg-red-950/80 border border-red-500/40 text-[11px] text-red-200 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{permissionError}</div>
            </div>
          )}

          {/* Interactive Floating Control Bar */}
          <div className="p-2.5 border-t border-white/10 bg-[#070A14] flex items-center justify-between rounded-b-2xl">
            <div className="flex items-center gap-1.5">
              {/* Mic Toggle */}
              <button
                id="call-btn-toggle-mic"
                onClick={onToggleAudio}
                className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAudioMuted
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                    : 'bg-[#151C33] text-white border border-white/10 hover:bg-[#1C2544]'
                }`}
                title={isAudioMuted ? 'Unmute Mic (M)' : 'Mute Mic (M)'}
              >
                {isAudioMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                <span className="hidden sm:inline text-[11px]">{isAudioMuted ? 'Muted' : 'Mute'}</span>
              </button>

              {/* Video Camera Toggle */}
              <button
                id="call-btn-toggle-camera"
                onClick={onToggleVideo}
                className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isVideoOff
                    ? 'bg-zinc-800 text-zinc-400 border border-white/10 hover:bg-zinc-700'
                    : 'bg-[#151C33] text-white border border-white/10 hover:bg-[#1C2544]'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4 text-zinc-400" /> : <Video className="w-4 h-4 text-purple-400" />}
                <span className="hidden sm:inline text-[11px]">{isVideoOff ? 'Cam Off' : 'Camera'}</span>
              </button>

              {/* Screen Share Toggle */}
              <button
                id="call-btn-toggle-screen"
                onClick={onToggleScreenShare}
                className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isScreenSharing
                    ? 'bg-emerald-600 text-white border border-emerald-400 shadow-md'
                    : 'bg-[#151C33] text-zinc-300 border border-white/10 hover:bg-[#1C2544] hover:text-white'
                }`}
                title="Share Screen"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">{isScreenSharing ? 'Sharing' : 'Share'}</span>
              </button>
            </div>

            {/* End / Leave Call Button */}
            <button
              id="call-btn-leave"
              onClick={onLeaveCall}
              className="p-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950/50 cursor-pointer active:scale-95 transition-transform"
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
