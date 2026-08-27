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
  aspect?: 'square' | 'video' | 'auto';
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
  aspect = 'square',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasActualVideo, setHasActualVideo] = useState(false);

  const character = getCharacterById(player.characterId || 'char_arjuna');

  // Handle Video stream attachment
  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
        const videoTracks = stream.getVideoTracks();
        const activeVideo = videoTracks.length > 0 && videoTracks[0].enabled && !isVideoOff;
        setHasActualVideo(activeVideo);

        // Attempt play
        videoRef.current.play().catch(() => {
          // Autoplay policy might catch it, ignore
        });
      } else {
        videoRef.current.srcObject = null;
        setHasActualVideo(false);
      }
    }
  }, [stream, isVideoOff]);

  // Handle Remote Audio stream attachment
  useEffect(() => {
    if (!isLocal && audioRef.current) {
      if (stream) {
        audioRef.current.srcObject = stream;
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.srcObject = null;
      }
    }
  }, [stream, isLocal]);

  const showVideoFeed = hasActualVideo && !isVideoOff;

  const aspectClass =
    aspect === 'square'
      ? 'aspect-square w-full max-h-full'
      : aspect === 'video'
      ? 'aspect-video w-full'
      : 'w-full h-full min-h-0 min-w-0 flex-1';

  return (
    <div
      id={`video-tile-${player.id}`}
      className={`relative group rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-b from-[#121626] to-[#0A0D18] border transition-all duration-200 flex flex-col items-center justify-center select-none ${
        isSpeaking
          ? 'border-yellow-400/90 shadow-[0_0_24px_rgba(250,204,21,0.4)] ring-2 ring-yellow-400/40'
          : 'border-white/10 hover:border-white/20 shadow-lg'
      } ${aspectClass}`}
    >
      {/* 1. Main Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local video to avoid feedback loop
        className={`w-full h-full object-cover transition-transform duration-200 ${
          isLocal && isMirrorMode && !isScreenSharing ? 'scale-x-[-1]' : ''
        } ${showVideoFeed ? 'opacity-100' : 'hidden'}`}
      />

      {/* 2. Dedicated Audio Element for Remote Peers */}
      {!isLocal && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          muted={false}
          className="hidden"
        />
      )}

      {/* 3. Fallback Animated Character Avatar when camera is disabled */}
      {!showVideoFeed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-gradient-to-b from-[#151A2E] to-[#0B0E1B]">
          {/* Speaking Pulse Halo */}
          {isSpeaking && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-24 h-24 rounded-full animate-ping opacity-35"
                style={{ backgroundColor: character.primaryColor }}
              />
              <div
                className="w-20 h-20 rounded-full animate-pulse opacity-45 absolute"
                style={{ backgroundColor: character.secondaryColor }}
              />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="relative transform hover:scale-105 transition-transform">
              <CharacterAvatar characterId={player.characterId} size={compact ? 'sm' : 'md'} />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0D1020]" />
                </span>
              )}
            </div>

            {!compact && (
              <span className="text-[10px] sm:text-xs font-semibold text-zinc-300 mt-1 sm:mt-1.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 inline" />
                <span className="truncate max-w-[100px]">{character.name}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4. Top Floating Badges (Name & Status) */}
      <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2 sm:left-2 sm:right-2 flex items-center justify-between z-20 pointer-events-none">
        {/* Name tag with role pill */}
        <div className="flex items-center gap-1 bg-[#090C16]/85 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full border border-white/10 text-white text-[10px] sm:text-[11px] font-medium max-w-[85%] truncate">
          <span className="truncate">{isLocal ? `${player.name} (You)` : player.name}</span>
          {player.isHost && (
            <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-400 bg-amber-950/80 px-1 rounded">Host</span>
          )}
          {player.isBot && (
            <span className="text-[8px] sm:text-[9px] font-black uppercase text-purple-400 bg-purple-950/80 px-1 rounded">AI</span>
          )}
        </div>

        {/* Screen share indicator */}
        {isScreenSharing && (
          <span className="flex items-center gap-1 bg-emerald-600/90 text-white px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold shadow">
            <Monitor className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            Live
          </span>
        )}
      </div>

      {/* 5. Bottom Status Icons (Mic & Video state) */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-1">
          {/* Mic indicator */}
          {isAudioMuted ? (
            <div className="p-1 rounded-md bg-red-950/90 border border-red-500/50 text-red-400" title="Microphone Muted">
              <MicOff className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
          ) : isSpeaking ? (
            <div className="p-1 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 flex items-center gap-0.5" title="Speaking">
              <Mic className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-pulse" />
              <div className="flex items-center gap-0.5 h-2.5 px-0.5">
                <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-0.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-0.5 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          ) : (
            <div className="p-1 rounded-md bg-black/60 text-zinc-400" title="Microphone Active">
              <Mic className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
          )}

          {/* Camera indicator if off */}
          {isVideoOff && (
            <div className="p-1 rounded-md bg-zinc-900/90 border border-zinc-700/50 text-zinc-400" title="Camera Disabled">
              <VideoOff className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
          )}
        </div>

        {/* Local Mirror toggle button */}
        {isLocal && onToggleMirror && (
          <button
            onClick={onToggleMirror}
            className="pointer-events-auto p-1 rounded-md bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Mirror Camera Flip"
          >
            <FlipHorizontal className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
