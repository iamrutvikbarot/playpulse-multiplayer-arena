import { FlipHorizontal, Maximize2, Mic, MicOff, Monitor, Sparkles, Video, VideoOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Player } from '../types/game';
import { getCharacterById } from '../utils/characters';
import { CharacterAvatar } from './CharacterAvatar';

interface VideoTileProps {
  player: Player;
  stream: MediaStream | null;
  isLocal?: boolean;
  isAudioMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
  isMirrorMode?: boolean;
  onToggleMirror?: () => void;
  compact?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  player,
  stream,
  isLocal = false,
  isAudioMuted = false,
  isVideoOff = false,
  isScreenSharing = false,
  isSpeaking = false,
  isMirrorMode = false,
  onToggleMirror,
  compact = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasActualVideo, setHasActualVideo] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const character = getCharacterById(player.characterId || 'char_arjuna');

  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
        const videoTracks = stream.getVideoTracks();
        setHasActualVideo(videoTracks.length > 0 && videoTracks[0].enabled && !isVideoOff);
      } else {
        videoRef.current.srcObject = null;
        setHasActualVideo(false);
      }
    }
  }, [stream, isVideoOff]);

  const showVideoFeed = hasActualVideo && !isVideoOff;

  return (
    <div
      id={`video-tile-${player.id}`}
      className={`relative group rounded-2xl overflow-hidden bg-gradient-to-b from-[#121626] to-[#0A0D18] border transition-all duration-200 flex flex-col items-center justify-center ${
        isSpeaking
          ? 'border-yellow-400/90 shadow-[0_0_24px_rgba(250,204,21,0.35)] ring-2 ring-yellow-400/40'
          : 'border-white/10 hover:border-white/20'
      } ${compact ? 'w-28 h-24 min-w-[112px]' : isExpanded ? 'col-span-2 row-span-2 min-h-[260px]' : 'w-full min-h-[160px] aspect-video'}`}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video so user doesn't hear own echo
        className={`w-full h-full object-cover transition-transform duration-200 ${
          isLocal && isMirrorMode && !isScreenSharing ? 'scale-x-[-1]' : ''
        } ${showVideoFeed ? 'opacity-100' : 'hidden'}`}
      />

      {/* Fallback Animated Character Card if video is off or bot */}
      {!showVideoFeed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-gradient-to-b from-[#161B30] to-[#0D1020]">
          {/* Animated Glow Rings when speaking */}
          {isSpeaking && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-20 h-20 rounded-full animate-ping opacity-30"
                style={{ backgroundColor: character.primaryColor }}
              />
              <div
                className="w-16 h-16 rounded-full animate-pulse opacity-40 absolute"
                style={{ backgroundColor: character.secondaryColor }}
              />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center">
            <div className={`relative ${compact ? 'scale-75' : 'scale-95 sm:scale-100'} transition-transform`}>
              <CharacterAvatar characterId={player.characterId} size={compact ? 'sm' : 'md'} />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0D1020]" />
                </span>
              )}
            </div>

            {!compact && (
              <span className="text-[11px] font-semibold text-zinc-300 mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 inline" />
                {character.name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Floating Badges */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
        {/* Name tag with role pill */}
        <div className="flex items-center gap-1.5 bg-[#090C16]/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-white text-[11px] font-medium max-w-[80%] truncate">
          <span className="truncate">{isLocal ? `${player.name} (You)` : player.name}</span>
          {player.isHost && (
            <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-950/60 px-1 rounded">Host</span>
          )}
          {player.isBot && (
            <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-950/60 px-1 rounded">AI</span>
          )}
        </div>

        {/* Screen share indicator */}
        {isScreenSharing && (
          <span className="flex items-center gap-1 bg-emerald-600/90 text-white px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow">
            <Monitor className="w-3 h-3" />
            Live
          </span>
        )}
      </div>

      {/* Bottom status indicators */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
        {/* Mic Status */}
        <div className="flex items-center gap-1">
          {isAudioMuted ? (
            <div className="p-1 rounded-md bg-red-950/80 border border-red-500/40 text-red-400" title="Muted">
              <MicOff className="w-3 h-3" />
            </div>
          ) : isSpeaking ? (
            <div className="p-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center gap-0.5" title="Speaking">
              <Mic className="w-3 h-3 animate-pulse" />
              <div className="flex items-center gap-0.5 h-3 px-0.5">
                <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          ) : (
            <div className="p-1 rounded-md bg-black/60 text-zinc-400" title="Mic On">
              <Mic className="w-3 h-3" />
            </div>
          )}

          {isVideoOff && (
            <div className="p-1 rounded-md bg-zinc-900/80 border border-zinc-700/50 text-zinc-400" title="Camera Off">
              <VideoOff className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Local Mirror & Expand Controls (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          {isLocal && onToggleMirror && (
            <button
              onClick={onToggleMirror}
              title={isMirrorMode ? 'Disable Mirror' : 'Enable Mirror'}
              className="p-1 rounded-md bg-black/70 hover:bg-black text-zinc-300 hover:text-white border border-white/10 cursor-pointer text-[10px]"
            >
              <FlipHorizontal className="w-3 h-3" />
            </button>
          )}

          {!compact && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse' : 'Expand'}
              className="p-1 rounded-md bg-black/70 hover:bg-black text-zinc-300 hover:text-white border border-white/10 cursor-pointer text-[10px]"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
