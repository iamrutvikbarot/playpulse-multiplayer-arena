import {
  Bot,
  Check,
  ChevronRight,
  Copy,
  Crown,
  Gamepad2,
  Layers,
  LogOut,
  MessageSquare,
  Play,
  Plus,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { CharacterPickerModal } from '../components/CharacterPickerModal';
import { GameId, Player, RoomState } from '../types/game';
import { sound } from '../utils/audio';
import { GAMES_CATALOGUE } from '../utils/gameInfo';

interface RoomLobbyProps {
  room: RoomState;
  currentUserId: string;
  onSelectGame: (gameId: GameId) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onUpdateProfile: (name: string, characterId: string) => void;
  onLeaveRoom: () => void;
  onToggleChat: () => void;
  unreadChatCount?: number;
  // Video call
  isInCall?: boolean;
  onToggleVideoCall?: () => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  room,
  currentUserId,
  onSelectGame,
  onToggleReady,
  onStartGame,
  onAddBot,
  onRemoveBot,
  onUpdateProfile,
  onLeaveRoom,
  onToggleChat,
  unreadChatCount = 0,
  isInCall = false,
  onToggleVideoCall,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);

  const currentPlayer = room.players.find((p) => p.id === currentUserId);
  const isHost = currentPlayer?.isHost || false;
  const currentGameInfo = GAMES_CATALOGUE[room.currentGame];

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      sound.playClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const url = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      sound.playClick();
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isPlayerCountValid =
    room.players.length >= currentGameInfo.minPlayers &&
    room.players.length <= currentGameInfo.maxPlayers;

  const allNonHostsReady = room.players
    .filter((p) => !p.isHost)
    .every((p) => p.isReady);

  const canStartMatch = isHost && isPlayerCountValid && allNonHostsReady;

  return (
    <div className="relative z-10 w-full h-full max-h-full flex flex-col justify-between p-3 sm:p-4 lg:p-6 max-w-6xl mx-auto overflow-hidden">
      {/* Top Lobby Bento Bar (Fixed at top) */}
      <header className="flex-shrink-0 w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0C101C]/95 border border-[#1A2238] shadow-2xl backdrop-blur-xl mb-3 sm:mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onLeaveRoom}
            id="btn-leave-lobby"
            className="p-2.5 rounded-xl bg-[#111627] hover:bg-[#182035] border border-[#1E263D] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Leave Room"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-lg text-white">LOBBY ARENA</h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-[10px] font-extrabold text-purple-300 uppercase tracking-widest hidden sm:inline-block">
                Bento Matchmaking
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Host: <strong className="text-purple-400">{room.players.find((p) => p.isHost)?.name}</strong>
            </p>
          </div>
        </div>

        {/* Room Code Badge, Share Link & Chat Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Share Link Button */}
          <button
            onClick={handleCopyShareLink}
            id="btn-lobby-share-link"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111627] hover:bg-[#182035] border border-[#1E263D] text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-md cursor-pointer"
            title="Copy Invite Link"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
          </button>

          {/* Room Code Badge */}
          <button
            onClick={handleCopyCode}
            id="btn-lobby-copy-code"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111627] hover:bg-[#182035] border border-[#1E263D] text-xs font-mono font-bold text-white transition-all shadow-md group cursor-pointer"
          >
            <span className="text-zinc-500">CODE:</span>
            <span className="text-purple-400 tracking-wider text-sm font-extrabold">
              {room.code}
            </span>
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-zinc-400 group-hover:text-white" />
            )}
          </button>

          {/* Video Call Quick Launch */}
          {onToggleVideoCall && (
            <button
              onClick={onToggleVideoCall}
              id="btn-lobby-video-call"
              className={`relative p-2.5 rounded-xl border transition-all shadow-md cursor-pointer ${
                isInCall
                  ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-[#111627] hover:bg-[#182035] border-[#1E263D] text-zinc-300 hover:text-white'
              }`}
              title={isInCall ? 'Video Call (Active)' : 'Start Video & Voice Call'}
            >
              <Video className="w-4 h-4" />
              {isInCall && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              )}
            </button>
          )}

          {/* Chat Toggle */}
          <button
            onClick={onToggleChat}
            id="btn-lobby-chat-toggle"
            className="relative p-2.5 rounded-xl bg-[#111627] hover:bg-[#182035] border border-[#1E263D] text-zinc-300 hover:text-white transition-colors shadow-md cursor-pointer"
            title="Room Chat & Reactions"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                {unreadChatCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Center Scrollable Content Area ONLY */}
      <main className="flex-1 overflow-y-auto min-h-0 space-y-4 sm:space-y-6 pr-1 sm:pr-2 pb-2">
        {/* Main Bento Grid: Players on Left, Game Selector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full my-auto">
        {/* Left Bento Box: Player Roster & Bot Management (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0C101C]/90 border border-[#1A2238] p-5 sm:p-6 flex flex-col justify-between shadow-xl backdrop-blur-md space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-display font-black text-sm uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                Players ({room.players.length} / {currentGameInfo.maxPlayers})
              </h2>

              {isHost && room.players.length < currentGameInfo.maxPlayers && (
                <button
                  onClick={onAddBot}
                  id="btn-add-ai-bot"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-600/40 text-purple-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>+ Add Bot</span>
                </button>
              )}
            </div>

            {/* Players List */}
            <div className="space-y-2.5">
              {room.players.map((p: Player) => {
                const isMe = p.id === currentUserId;
                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      isMe
                        ? 'bg-[#141A2E] border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-[#090C16] border-[#161D30]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => isMe && setIsCharModalOpen(true)}
                        className={isMe ? 'cursor-pointer hover:opacity-80' : ''}
                        title={isMe ? 'Click to change avatar' : undefined}
                      >
                        <CharacterAvatar
                          characterId={p.characterId}
                          size="md"
                          isHost={p.isHost}
                          isReady={p.isReady}
                          showStatus={!p.isHost}
                        />
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-extrabold text-sm text-white">
                            {p.name}
                          </span>
                          {isMe && (
                            <span className="text-[10px] font-bold text-purple-400 bg-purple-950 px-1.5 py-0.2 rounded border border-purple-700/50">
                              YOU
                            </span>
                          )}
                          {p.isBot && (
                            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-700/50 flex items-center gap-0.5">
                              <Bot className="w-2.5 h-2.5" /> BOT
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-medium">
                          {p.isHost ? (
                            <span className="text-amber-400 font-bold">Room Host</span>
                          ) : p.isReady ? (
                            <span className="text-emerald-400 font-bold">Ready to Play</span>
                          ) : (
                            <span className="text-zinc-500 font-medium">Not Ready</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Remove Bot if Host, or Ready Badge */}
                    <div>
                      {isHost && p.isBot ? (
                        <button
                          onClick={() => onRemoveBot(p.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Remove Bot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : !p.isHost ? (
                        <div
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                            p.isReady
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-zinc-800/60 text-zinc-400'
                          }`}
                        >
                          {p.isReady ? 'READY' : 'WAITING'}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Player controls: Ready Toggle */}
          {!isHost && currentPlayer && (
            <button
              onClick={onToggleReady}
              id="btn-lobby-toggle-ready"
              className={`w-full py-3.5 rounded-2xl font-display font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                currentPlayer.isReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{currentPlayer.isReady ? 'READY! (Click to Unready)' : 'CLICK WHEN READY'}</span>
            </button>
          )}
        </div>

        {/* Right Bento Box: Game Selector & Match Launchpad (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0C101C]/90 border border-[#1A2238] p-5 sm:p-6 flex flex-col justify-between shadow-xl backdrop-blur-md space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-display font-black text-sm uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Select Arena {isHost ? '(Host Selected)' : ''}
              </h2>
              <span className="text-xs text-zinc-400 font-semibold">
                Required: {currentGameInfo.minPlayers}-{currentGameInfo.maxPlayers} Players
              </span>
            </div>

            {/* Game Cards Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(GAMES_CATALOGUE).map((g) => {
                const isSelected = room.currentGame === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => isHost && onSelectGame(g.id)}
                    disabled={!isHost}
                    id={`lobby-select-game-${g.id}`}
                    className={`p-4 rounded-2xl text-left border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#141A2E] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-101'
                        : isHost
                        ? 'bg-[#090C16] border-[#161D30] hover:border-zinc-500/50 hover:bg-[#101525] cursor-pointer'
                        : 'bg-[#080B14] border-[#141A2A] opacity-70 cursor-default'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${g.accentColor}20`,
                            color: g.accentColor,
                          }}
                        >
                          {g.minPlayers}-{g.maxPlayers} Players
                        </span>
                        {isSelected && (
                          <span className="p-1 rounded-full bg-purple-500 text-white shadow">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-extrabold text-base text-white">
                        {g.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {g.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#161D30] flex items-center justify-between text-[11px] text-zinc-500 font-bold">
                      <span>{g.difficulty}</span>
                      <span>{g.duration}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Host Start Game Launch Bar */}
          {isHost && (
            <div className="p-4 rounded-2xl bg-[#090C16] border border-[#1E263D] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
              <div>
                <h4 className="font-display font-extrabold text-sm text-white">
                  Match Readiness Status
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {!isPlayerCountValid
                    ? `Need ${currentGameInfo.minPlayers} players minimum to start (Add a bot or wait for friends)`
                    : !allNonHostsReady
                    ? 'Waiting for all players to click Ready...'
                    : 'All players ready! Ready to launch.'}
                </p>
              </div>

              <button
                onClick={onStartGame}
                disabled={!canStartMatch}
                id="btn-host-start-match"
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 disabled:opacity-50 disabled:pointer-events-none text-white font-display font-black text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer flex-shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START MATCH</span>
              </button>
            </div>
          )}
        </div>
      </div>
      </main>

      {/* Pinned Footer (Fixed bottom, never scrolls) */}
      <footer className="flex-shrink-0 mt-2 sm:mt-3 w-full text-center text-xs text-zinc-400 py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-[#080B15]/95 backdrop-blur-xl border border-[#1A2238]/80 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>PlayPulse Arena • Real-Time Bento Lobby</span>
        <span className="text-zinc-400 font-medium">
          Made with ❤️ and AI by <strong className="text-purple-400 font-bold">Rutvik Barot</strong>
        </span>
      </footer>

      {/* Character Change Modal */}
      {currentPlayer && (
        <CharacterPickerModal
          isOpen={isCharModalOpen}
          selectedCharacterId={currentPlayer.characterId}
          onSelect={(charId) => onUpdateProfile(currentPlayer.name, charId)}
          onClose={() => setIsCharModalOpen(false)}
        />
      )}
    </div>
  );
};
