import { Check, Sparkles, X } from 'lucide-react';
import React from 'react';
import { CHARACTERS } from '../utils/characters';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#0C101C] border border-[#1A2238] rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        id="character-picker-dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#161D30]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-black text-white tracking-wide font-display">
              Choose Avatar Character
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-[#141A2E] transition-colors cursor-pointer"
            id="close-char-picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Characters Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 overflow-y-auto pr-1">
          {CHARACTERS.map((char) => {
            const isSelected = char.id === selectedCharacterId;
            return (
              <button
                key={char.id}
                id={`char-select-${char.id}`}
                onClick={() => {
                  onSelect(char.id);
                  onClose();
                }}
                className={`relative group p-3.5 rounded-2xl text-left flex flex-col items-center gap-2.5 transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#141A2E] border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)] scale-102'
                    : 'bg-[#090C16] border-[#161D30] hover:border-zinc-500/50 hover:bg-[#101525]'
                }`}
              >
                {/* Active checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 p-1 rounded-full bg-purple-500 text-white shadow">
                    <Check className="w-3 h-3" />
                  </div>
                )}

                <CharacterAvatar characterId={char.id} size="lg" animate />

                <div className="text-center w-full">
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                    {char.name}
                  </h4>
                  <p className="text-[10px] font-medium text-zinc-400 truncate mt-0.5">
                    {char.title}
                  </p>
                </div>

                <div
                  className="w-full h-1 rounded-full opacity-60"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${char.primaryColor}, transparent)`,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#161D30] flex items-center justify-between text-xs text-zinc-400">
          <span>Session identity • No registration required</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
