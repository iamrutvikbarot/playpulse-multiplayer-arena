import {
  Check,
  Copy,
  LogOut,
  MessageSquare,
  Volume2,
  VolumeX,
  Wifi,
} from 'lucide-react';
import React, { useState } from 'react';
import { Player, RoomState } from '../types/game';
import { sound } from '../utils/audio';
import { GAMES_CATALOGUE } from '../utils/gameInfo';
import { CharacterAvatar } from './CharacterAvatar';

interface GameHeaderProps {
  room: RoomState;
  currentUserId: string;
  onLeave: () => void;
  onToggleChat?: () => void;
  unreadChatCount?: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  room,
  currentUserId,
  onLeave,
  onToggleChat,
  unreadChatCount = 0,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const gameInfo = GAMES_CATALOGUE[room.currentGame];

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      sound.playClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMuteToggle = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <header className="relative z-30 w-full px-4 sm:px-6 py-3 bg-[#0C101C]/90 backdrop-blur-md border-b border-[#1A2238] flex items-center justify-between gap-4">
      {/* Left: Game Title + Room Badge */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold text-white font-display tracking-tight flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: gameInfo.accentColor }}
              />
              {gameInfo.title}
            </h1>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
            {gameInfo.subtitle}
          </p>
        </div>

        {/* Room Code Badge */}
        <button
          onClick={handleCopy}
          id="btn-copy-room-code"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#111627] hover:bg-[#182035] border border-[#1E263D] text-xs font-mono font-bold text-zinc-200 transition-all group cursor-pointer"
          title="Click to copy room code"
        >
          <span className="text-zinc-400">ROOM:</span>
          <span className="text-purple-400 tracking-wider font-extrabold">{room.code}</span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
          )}
        </button>
      </div>

      {/* Center: Active Players Bento Bar */}
      <div className="hidden md:flex items-center gap-2 bg-[#090C16] px-3 py-1.5 rounded-2xl border border-[#161D30]">
        {room.players.map((p: Player) => {
          const isMe = p.id === currentUserId;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs ${
                isMe ? 'bg-purple-950/70 border border-purple-500/40 text-purple-200 shadow-sm' : 'text-zinc-300'
              }`}
            >
              <CharacterAvatar characterId={p.characterId} size="sm" isHost={p.isHost} />
              <span className="font-semibold truncate max-w-[80px]">
                {p.name} {isMe ? '(You)' : ''}
              </span>
              {p.score > 0 && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  {p.score}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Controls: Chat, Mute, Leave */}
      <div className="flex items-center gap-2">
        {onToggleChat && (
          <button
            onClick={onToggleChat}
            id="btn-toggle-chat"
            className="relative p-2 rounded-xl bg-[#111627] hover:bg-[#182035] border border-[#1E263D] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Chat & Emotes"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                {unreadChatCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={handleMuteToggle}
          id="btn-toggle-mute"
          className="p-2 rounded-xl bg-[#111627] hover:bg-[#182035] border border-[#1E263D] text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          onClick={onLeave}
          id="btn-exit-to-lobby"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-800/40 text-red-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          title="Return to Lobby"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lobby</span>
        </button>
      </div>
    </header>
  );
};
