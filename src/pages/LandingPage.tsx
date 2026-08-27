import {
  ArrowRight,
  Bot,
  Check,
  Compass,
  Crown,
  Dices,
  Flame,
  Gamepad2,
  Grid3X3,
  Layers,
  Play,
  Plus,
  Radio,
  Shield,
  Sparkles,
  Swords,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { CharacterPickerModal } from '../components/CharacterPickerModal';
import { GameId } from '../types/game';
import { sound } from '../utils/audio';
import { CHARACTERS, getCharacterById } from '../utils/characters';
import { GAMES_CATALOGUE } from '../utils/gameInfo';

interface LandingPageProps {
  onCreateRoom: (playerName: string, characterId: string, initialGame: GameId) => void;
  onJoinRoom: (roomCode: string, playerName: string, characterId: string) => void;
  error?: string | null;
  onClearError?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onCreateRoom,
  onJoinRoom,
  error,
  onClearError,
}) => {
  const [playerName, setPlayerName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('playpulse_saved_name') || '';
    }
    return '';
  });

  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('playpulse_saved_character') || 'char_knight';
    }
    return 'char_knight';
  });

  const [selectedGame, setSelectedGame] = useState<GameId>('tic-tac-toe');
  const [joinCode, setJoinCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return (params.get('room') || '').toUpperCase().trim();
    }
    return '';
  });
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [actionTab, setActionTab] = useState<'create' | 'join'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room')) return 'join';
    }
    return 'create';
  });

  const selectedChar = getCharacterById(selectedCharacterId);

  const saveProfile = (name: string, charId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('playpulse_saved_name', name);
      localStorage.setItem('playpulse_saved_character', charId);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = playerName.trim() || selectedChar.name;
    saveProfile(finalName, selectedCharacterId);
    onCreateRoom(finalName, selectedCharacterId, selectedGame);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const finalName = playerName.trim() || selectedChar.name;
    saveProfile(finalName, selectedCharacterId);
    onJoinRoom(joinCode.trim().toUpperCase(), finalName, selectedCharacterId);
  };

  const handleQuickPlaySolo = (gameId: GameId) => {
    const finalName = playerName.trim() || selectedChar.name;
    saveProfile(finalName, selectedCharacterId);
    onCreateRoom(finalName, selectedCharacterId, gameId);
  };

  return (
    <div className="relative z-10 w-full min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navbar Bento Header */}
      <header className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0C101C]/90 border border-[#1A2238] shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-md shadow-purple-600/30 flex-shrink-0">
            <div className="w-full h-full bg-[#090C16] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white">
                PLAY<span className="text-purple-400">PULSE</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-[10px] font-extrabold text-purple-300 uppercase tracking-widest hidden sm:inline-block">
                Bento Arena
              </span>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">
              Zero Accounts • Real-time Multiplayer
            </span>
          </div>
        </div>

        {/* Live Network Status & Profile Quick Button */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111627] border border-[#1E263D] text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Low Latency WebSocket</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsCharModalOpen(true);
            }}
            id="btn-open-character-modal"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#111627] hover:bg-[#182035] border border-[#1E263D] hover:border-purple-500/50 transition-all shadow-md group cursor-pointer"
          >
            <CharacterAvatar characterId={selectedCharacterId} size="sm" />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                {playerName || selectedChar.name}
              </div>
              <div className="text-[10px] text-zinc-400">{selectedChar.title}</div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>
      </header>

      {/* Error Alert if any */}
      {error && (
        <div className="w-full p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>{error}</span>
          </div>
          {onClearError && (
            <button
              onClick={onClearError}
              className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800/80 text-red-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Bento Grid Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full">
        {/* Bento Box 1: Hero & Room Launchpad (col-span-8) */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-3xl bg-[#0C101C]/90 border border-[#1A2238] p-6 sm:p-8 flex flex-col justify-between shadow-xl backdrop-blur-md relative overflow-hidden">
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-extrabold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>INSTANT MULTIPLAYER SUITE</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-display uppercase leading-[1.08]">
              PLAY. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">COMPETE.</span> WIN.
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base mt-3 max-w-xl font-medium leading-relaxed">
              Create an instant private room, invite friends with a 5-digit code or link, and battle in real time across 5 lightweight multiplayer games.
            </p>
          </div>

          {/* Action Tabs: Create Room / Join Room */}
          <div className="mt-8 pt-6 border-t border-[#161D30]">
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActionTab('create');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-display font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  actionTab === 'create'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-[#111627] hover:bg-[#182035] text-zinc-400 hover:text-white border border-[#1E263D]'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Create New Room</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActionTab('join');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl font-display font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  actionTab === 'join'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-[#111627] hover:bg-[#182035] text-zinc-400 hover:text-white border border-[#1E263D]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Join with Code</span>
              </button>
            </div>

            {/* Create Room Form */}
            {actionTab === 'create' && (
              <form onSubmit={handleCreateSubmit} className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Initial Arena
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {Object.values(GAMES_CATALOGUE).map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSelectedGame(g.id);
                          }}
                          className={`p-2 rounded-xl text-left border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            selectedGame === g.id
                              ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                              : 'bg-[#0E1322] border-[#182035] text-zinc-400 hover:text-zinc-200 hover:bg-[#141A2E]'
                          }`}
                        >
                          <span className="truncate">{g.title}</span>
                          {selectedGame === g.id && (
                            <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Player Nickname
                      </label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder={selectedChar.name}
                        maxLength={16}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#090C16] border border-[#1E263D] focus:border-purple-500 text-white text-sm font-semibold focus:outline-none placeholder-zinc-600"
                      />
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        Defaults to avatar title if left empty.
                      </span>
                    </div>

                    <button
                      type="submit"
                      id="btn-hero-create-room"
                      className="w-full py-3 mt-3 sm:mt-0 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-display font-black text-sm shadow-[0_0_20px_rgba(147,51,234,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>LAUNCH ROOM</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Join Room Form */}
            {actionTab === 'join' && (
              <form onSubmit={handleJoinSubmit} className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      5-Letter Room Code
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. 7KP9A"
                      maxLength={5}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090C16] border border-[#1E263D] focus:border-purple-500 text-white text-base font-mono font-black tracking-widest text-center focus:outline-none uppercase placeholder-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Your Nickname
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder={selectedChar.name}
                      maxLength={16}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090C16] border border-[#1E263D] focus:border-purple-500 text-white text-sm font-semibold focus:outline-none placeholder-zinc-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  id="btn-hero-join-room"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-display font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>ENTER ROOM NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bento Box 2: Character Profile & Live Preview (col-span-4) */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-3xl bg-[#0C101C]/90 border border-[#1A2238] p-6 sm:p-7 flex flex-col justify-between shadow-xl backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                Active Avatar
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsCharModalOpen(true);
                }}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
              >
                Change Avatar
              </button>
            </div>

            {/* Character Showcase Card */}
            <div className="p-4 rounded-2xl bg-[#080B14] border border-[#161D30] flex items-center gap-4">
              <CharacterAvatar characterId={selectedCharacterId} size="lg" />
              <div>
                <h3 className="font-display font-extrabold text-base text-white">
                  {selectedChar.name}
                </h3>
                <p className="text-xs text-purple-300 font-semibold">{selectedChar.title}</p>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {selectedChar.description}
                </p>
              </div>
            </div>

            {/* Stats Chips */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="p-2.5 rounded-xl bg-[#111627] border border-[#1E263D] text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Archetype</span>
                <span className="text-xs font-extrabold text-amber-300 capitalize truncate block">
                  {selectedChar.title.split(' ')[1] || 'Hero'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111627] border border-[#1E263D] text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Color</span>
                <span className="text-xs font-extrabold text-cyan-300 capitalize truncate block" style={{ color: selectedChar.primaryColor }}>
                  {selectedChar.title.split(' ')[0]}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111627] border border-[#1E263D] text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Roster</span>
                <span className="text-xs font-extrabold text-purple-300 block">
                  {CHARACTERS.length} Avatars
                </span>
              </div>
            </div>
          </div>

          {/* Quick Features Bento Strip */}
          <div className="mt-6 pt-4 border-t border-[#161D30] space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Zero installs, zero registrations, instant access</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Cross-platform sync on phones, tablets, PCs</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Built-in smart AI bots for solo or team practice</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Row 2: 5 Mini-Games Arenas Showcase */}
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-wide flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            5 Featured Multiplayer Arenas
          </h2>
          <span className="text-xs text-zinc-500 font-semibold">Instant Play Ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {Object.values(GAMES_CATALOGUE).map((game) => (
            <div
              key={game.id}
              className="group relative p-4 rounded-2xl bg-[#0C101C]/90 hover:bg-[#12182B] border border-[#1A2238] hover:border-purple-500/50 flex flex-col justify-between transition-all duration-300 shadow-lg hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${game.accentColor}20`, color: game.accentColor }}
                  >
                    {game.minPlayers}-{game.maxPlayers} Players
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium">{game.duration}</span>
                </div>

                <h3 className="font-display font-extrabold text-base text-white group-hover:text-purple-300 transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {game.tagline}
                </p>
              </div>

              <div className="pt-3.5 mt-3.5 border-t border-[#161D30] flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">{game.difficulty}</span>
                <button
                  onClick={() => handleQuickPlaySolo(game.id)}
                  id={`btn-play-${game.id}`}
                  className="px-2.5 py-1 rounded-lg bg-[#141A2E] group-hover:bg-purple-600 text-zinc-300 group-hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-500 py-3 border-t border-[#1A2238]/60 flex flex-col sm:flex-row items-center justify-between gap-2 px-2">
        <span>PlayPulse Arena • Real-Time Server-Authoritative Multiplayer</span>
        <span className="text-zinc-400 font-medium">
          Made with ❤️ and AI by <strong className="text-purple-400 font-bold">Rutvik Barot</strong>
        </span>
      </footer>

      {/* Character Modal */}
      <CharacterPickerModal
        isOpen={isCharModalOpen}
        selectedCharacterId={selectedCharacterId}
        onSelect={(charId) => {
          setSelectedCharacterId(charId);
          saveProfile(playerName, charId);
        }}
        onClose={() => setIsCharModalOpen(false)}
      />
    </div>
  );
};
