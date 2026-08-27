import { Check, Dices, Search, Shield, Sparkles, Sword, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { CHARACTERS, getCharacterById, getRandomCharacter } from '../utils/characters';
import { CharacterAvatar } from './CharacterAvatar';

interface CharacterPickerModalProps {
  isOpen: boolean;
  selectedCharacterId: string;
  onSelect: (charId: string) => void;
  onClose: () => void;
}

export const CharacterPickerModal: React.FC<CharacterPickerModalProps> = ({
  isOpen,
  selectedCharacterId,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewId, setPreviewId] = useState<string>(selectedCharacterId);
  const [mobileTab, setMobileTab] = useState<'grid' | 'inspect'>('grid');

  if (!isOpen) return null;

  const previewChar = getCharacterById(previewId || selectedCharacterId);
  const filteredChars = CHARACTERS.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.weapon.toLowerCase().includes(q) ||
      c.faction.toLowerCase().includes(q)
    );
  });

  const handleRandomPick = () => {
    sound.playClick();
    const randomChar = getRandomCharacter();
    setPreviewId(randomChar.id);
    onSelect(randomChar.id);
  };

  const handleSelectAndClose = (charId: string) => {
    sound.playClick();
    onSelect(charId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl lg:max-w-5xl bg-[#0B0E1A] border border-[#1E263D] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94dvh] sm:max-h-[90dvh] flex flex-col"
        id="character-picker-dialog"
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 blur-3xl pointer-events-none opacity-30"
          style={{ background: previewChar.glowColor }}
        />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-[#161D30] bg-[#0E1222] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base md:text-lg font-black text-white tracking-wide font-display truncate">
                Mahabharat Characters
              </h2>
              <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
                Choose your legendary avatar for the arena
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Re-roll Random Button */}
            <button
              onClick={handleRandomPick}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#182038] hover:bg-purple-600/30 border border-[#273252] hover:border-purple-500/50 text-amber-300 hover:text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              title="Pick a Random Character"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="hidden xs:inline">Random</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-[#182038] transition-colors cursor-pointer"
              id="close-char-picker"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher (< md screens) */}
        <div className="md:hidden flex border-b border-[#161D30] bg-[#090C17] flex-shrink-0">
          <button
            onClick={() => setMobileTab('grid')}
            className={`flex-1 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'grid'
                ? 'bg-[#141A2E] text-amber-300 border-b-2 border-amber-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Roster Grid ({filteredChars.length})</span>
          </button>
          <button
            onClick={() => setMobileTab('inspect')}
            className={`flex-1 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'inspect'
                ? 'bg-[#141A2E] text-purple-300 border-b-2 border-purple-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="truncate max-w-[150px]">Inspect ({previewChar.name})</span>
          </button>
        </div>

        {/* Search & Overview Sub-bar */}
        <div className="px-3.5 sm:px-6 py-2 bg-[#090C17] border-b border-[#161D30] flex items-center justify-between gap-2 flex-shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, weapon, faction..."
              className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg bg-[#12172A] border border-[#202A44] text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <span className="hidden sm:inline text-[11px] text-zinc-400 font-mono">
            {filteredChars.length} / {CHARACTERS.length} Characters
          </span>
        </div>

        {/* Main Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden flex-1 min-h-0">
          {/* Left: 3D Interactive Character Inspection Card */}
          <div
            className={`md:col-span-5 lg:col-span-5 p-3.5 sm:p-5 bg-[#080B14] md:border-r border-[#161D30] flex flex-col justify-between overflow-y-auto min-h-0 ${
              mobileTab === 'inspect' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <div className="space-y-3">
              {/* Clean Faction & Origin Header (No Overlap) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm inline-flex items-center gap-1 truncate max-w-full"
                    style={{
                      backgroundColor: `${previewChar.primaryColor}18`,
                      borderColor: `${previewChar.primaryColor}40`,
                      color: previewChar.primaryColor,
                    }}
                  >
                    <Sparkles className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{previewChar.faction}</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 truncate">
                  Origin: {previewChar.origin}
                </span>
              </div>

              {/* 3D Interactive Character Avatar Centerpiece */}
              <div className="py-1.5 sm:py-2 flex flex-col items-center justify-center">
                <CharacterAvatar
                  characterId={previewChar.id}
                  size="xl"
                  interactive3D={true}
                  animate={true}
                />
                <h3 className="font-display font-black text-base sm:text-lg text-white mt-2 text-center">
                  {previewChar.name}
                </h3>
                <p className="text-xs text-amber-300 font-bold text-center mt-0.5">
                  {previewChar.title}
                </p>
              </div>

              {/* Character Lore Description */}
              <div className="p-3 rounded-xl bg-[#0E1324] border border-[#1C243B] space-y-2">
                <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed">
                  {previewChar.description}
                </p>
                <div className="pt-2 border-t border-[#182035] flex flex-col gap-0.5 text-[11px]">
                  <span className="text-zinc-500 font-medium flex items-center gap-1">
                    <Sword className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    Weapon / Astra:
                  </span>
                  <span className="font-bold text-amber-300 break-words" title={previewChar.weapon}>
                    {previewChar.weapon}
                  </span>
                </div>
              </div>
            </div>

            {/* Select Button */}
            <div className="mt-3 pt-2.5 border-t border-[#161D30]">
              <button
                onClick={() => handleSelectAndClose(previewChar.id)}
                className="w-full min-h-[42px] py-2 px-4 rounded-xl font-display font-black text-xs uppercase tracking-wider text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                style={{
                  background: `linear-gradient(135deg, ${previewChar.primaryColor}, #D97706)`,
                }}
              >
                <Check className="w-4 h-4" />
                <span>Select {previewChar.name}</span>
              </button>
            </div>
          </div>

          {/* Right: Character Grid */}
          <div
            className={`md:col-span-7 lg:col-span-7 p-3 sm:p-4 md:p-5 overflow-y-auto min-h-0 flex-1 ${
              mobileTab === 'grid' ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pb-2">
              {filteredChars.map((char) => {
                const isSelected = char.id === selectedCharacterId;
                const isInspecting = char.id === previewChar.id;

                return (
                  <button
                    key={char.id}
                    id={`char-select-${char.id}`}
                    onMouseEnter={() => setPreviewId(char.id)}
                    onClick={() => {
                      sound.playClick();
                      setPreviewId(char.id);
                      onSelect(char.id);
                    }}
                    className={`relative group p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-left flex flex-col items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
                      isSelected
                        ? 'bg-[#151C33] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02] ring-1 ring-amber-400/50'
                        : isInspecting
                        ? 'bg-[#11172A] border-purple-400/60'
                        : 'bg-[#090C16] border-[#161D30] hover:border-zinc-500/40 hover:bg-[#0E1324]'
                    }`}
                  >
                    {/* Active checkmark badge */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 p-0.5 sm:p-1 rounded-full bg-amber-500 text-black shadow-md z-20">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                      </div>
                    )}

                    <CharacterAvatar characterId={char.id} size="md" interactive3D={true} />

                    <div className="text-center w-full mt-0.5 min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {char.name}
                      </h4>
                      <p className="text-[10px] font-medium text-zinc-400 truncate mt-0.5">
                        {char.title}
                      </p>
                    </div>

                    <div
                      className="w-full h-0.5 rounded-full opacity-60 mt-0.5"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${char.primaryColor}, transparent)`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-3.5 sm:px-6 py-2.5 bg-[#080A14] border-t border-[#161D30] flex items-center justify-between text-xs text-zinc-400 flex-shrink-0">
          <span className="flex items-center gap-1.5 text-[10px] sm:text-xs truncate">
            <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">Multiplayer Arenas & Battles</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-1.5 bg-[#161E36] hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer min-h-[34px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

