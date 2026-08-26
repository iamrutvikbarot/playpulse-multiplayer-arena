import { Crown, ShieldCheck } from 'lucide-react';
import React from 'react';
import { getCharacterById } from '../utils/characters';

interface CharacterAvatarProps {
  characterId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isHost?: boolean;
  isReady?: boolean;
  showStatus?: boolean;
  showBadge?: boolean;
  animate?: boolean;
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  characterId,
  size = 'md',
  isHost = false,
  isReady = false,
  showStatus = false,
  showBadge = true,
  animate = false,
  className = '',
}) => {
  const char = getCharacterById(characterId);

  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-13 h-13 text-sm',
    lg: 'w-18 h-18 text-base',
    xl: 'w-24 h-24 text-xl',
  }[size];

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  }[size];

  // Stylized Marvel character vector icons
  const renderCharacterVisual = () => {
    switch (char.id) {
      case 'char_ironman':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={`${iconSizes} drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]`}>
            {/* Iron Man Helmet / Arc Reactor */}
            <path d="M5 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6V6z" fill="#EF4444" stroke="#F59E0B" strokeWidth="1.5" />
            <path d="M8 8h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4V8z" fill="#F59E0B" />
            {/* Slanted Eyes */}
            <line x1="8" y1="10" x2="10.5" y2="10" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
            <line x1="13.5" y1="10" x2="16" y2="10" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="18" r="1.5" fill="#38BDF8" />
          </svg>
        );
      case 'char_spiderman':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={`${iconSizes} drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]`}>
            {/* Spider-Man Mask */}
            <ellipse cx="12" cy="12" rx="7" ry="9" fill="#EF4444" stroke="#1E293B" strokeWidth="1.5" />
            {/* Web lines */}
            <line x1="12" y1="3" x2="12" y2="21" stroke="#1E293B" strokeWidth="0.75" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="#1E293B" strokeWidth="0.75" />
            {/* Iconic Eyes */}
            <path d="M7 9c1.5 0 3 1.5 3 3.5 0 1-1.5 1-3 0V9z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
            <path d="M17 9c-1.5 0-3 1.5-3 3.5 0 1 1.5 1 3 0V9z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
          </svg>
        );
      case 'char_cap':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={`${iconSizes} drop-shadow-[0_0_10px_rgba(14,165,233,0.7)]`}>
            {/* Captain America Shield Rings */}
            <circle cx="12" cy="12" r="9.5" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
            <circle cx="12" cy="12" r="7.5" fill="#F8FAFC" />
            <circle cx="12" cy="12" r="5.5" fill="#EF4444" />
            <circle cx="12" cy="12" r="3.5" fill="#0284C7" />
            {/* Center Star */}
            <polygon points="12,9.2 12.8,11 14.8,11 13.2,12.2 13.8,14 12,12.8 10.2,14 10.8,12.2 9.2,11 11.2,11" fill="#FFFFFF" />
          </svg>
        );
      case 'char_thor':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={`${iconSizes} drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]`}>
            {/* Mjolnir Hammer Head */}
            <rect x="5" y="5" width="14" height="7" rx="1.5" fill="#94A3B8" stroke="#F59E0B" strokeWidth="1.5" />
            {/* Hammer Handle */}
            <rect x="11" y="12" width="2" height="9" rx="1" fill="#78350F" stroke="#F59E0B" strokeWidth="1" />
            {/* Lightning bolt */}
            <path d="M10 8.5l3-2.5-1 3h2.5l-3.5 3 1-2.5H10z" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.5" />
          </svg>
        );
      case 'char_hulk':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={`${iconSizes} drop-shadow-[0_0_10px_rgba(34,197,94,0.7)]`}>
            {/* Hulk Smash Fist */}
            <path d="M7 11V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
            <path d="M5 11h14v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-5z" fill="#16A34A" stroke="#15803D" strokeWidth="1.5" />
            {/* Knuckles */}
            <circle cx="8" cy="11" r="1" fill="#15803D" />
            <circle cx="10.5" cy="11" r="1" fill="#15803D" />
            <circle cx="13.5" cy="11" r="1" fill="#15803D" />
            <circle cx="16" cy="11" r="1" fill="#15803D" />
          </svg>
        );
      case 'char_panther':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={`${iconSizes} drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]`}>
            {/* Black Panther Mask */}
            <path d="M6 5l3 3h6l3-3v8c0 4-3 7-6 8-3-1-6-4-6-8V5z" fill="#18181B" stroke="#A855F7" strokeWidth="1.5" />
            {/* Silver/Purple Eyes */}
            <polygon points="8,11 10,12 8.5,13" fill="#E9D5FF" />
            <polygon points="16,11 14,12 15.5,13" fill="#E9D5FF" />
            {/* Vibranium Teeth Marks */}
            <path d="M9 16l1.5 2 1.5-2 1.5 2 1.5-2" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case 'char_strange':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={`${iconSizes} drop-shadow-[0_0_10px_rgba(249,115,22,0.7)]`}>
            {/* Eye of Agamotto Talisman */}
            <ellipse cx="12" cy="12" rx="9" ry="5.5" fill="#B45309" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3.5" fill="#10B981" stroke="#FDE047" strokeWidth="1" />
            <line x1="12" y1="3" x2="12" y2="6.5" stroke="#F59E0B" strokeWidth="1.5" />
            <line x1="12" y1="17.5" x2="12" y2="21" stroke="#F59E0B" strokeWidth="1.5" />
            <line x1="3" y1="12" x2="6.5" y2="12" stroke="#F59E0B" strokeWidth="1.5" />
            <line x1="17.5" y1="12" x2="21" y2="12" stroke="#F59E0B" strokeWidth="1.5" />
          </svg>
        );
      case 'char_deadpool':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={`${iconSizes} drop-shadow-[0_0_10px_rgba(220,38,38,0.7)]`}>
            {/* Deadpool Mask Face */}
            <circle cx="12" cy="12" r="9" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
            <line x1="12" y1="3" x2="12" y2="21" stroke="#18181B" strokeWidth="1.5" />
            {/* Black Eye Patches */}
            <ellipse cx="8.5" cy="12" rx="2.5" ry="4" fill="#18181B" />
            <ellipse cx="15.5" cy="12" rx="2.5" ry="4" fill="#18181B" />
            {/* White Slanted Eyes */}
            <polygon points="7.5,11.5 9.5,12 7.8,13" fill="#FFFFFF" />
            <polygon points="16.5,11.5 14.5,12 16.2,13" fill="#FFFFFF" />
          </svg>
        );
      case 'char_wolverine':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={`${iconSizes} drop-shadow-[0_0_10px_rgba(234,179,8,0.7)]`}>
            {/* Triple Adamantium Claws */}
            <path d="M6 21L8 3" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 21L12 2" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M18 21L16 3" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
            {/* Slash Glow */}
            <path d="M4 8l16 4" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
          </svg>
        );
      case 'char_scarlet':
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" className={`${iconSizes} drop-shadow-[0_0_10px_rgba(225,29,72,0.7)]`}>
            {/* Scarlet Witch Tiara Headpiece */}
            <path d="M4 14l3-8 5 4 5-4 3 8-4-2-4 4-4-4-4 2z" fill="#E11D48" stroke="#BE123C" strokeWidth="1.5" />
            {/* Chaos Magic Hex Core */}
            <circle cx="12" cy="16" r="3.5" fill="#7C3AED" stroke="#F43F5E" strokeWidth="1.5" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer Halo */}
      <div
        className={`relative ${sizeClasses} rounded-2xl flex items-center justify-center bg-gradient-to-b from-[#181D2D] to-[#111522] border-2 transition-all duration-300 shadow-lg ${
          animate ? 'hover:scale-105' : ''
        }`}
        style={{
          borderColor: char.primaryColor,
          boxShadow: `0 0 16px ${char.glowColor}`,
        }}
      >
        {/* Inner ambient shine */}
        <div
          className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${char.primaryColor}, transparent 70%)`,
          }}
        />

        {/* Character Icon Visual */}
        <div className="relative z-10">{renderCharacterVisual()}</div>
      </div>

      {/* Host Crown Badge */}
      {showBadge && isHost && (
        <div
          className="absolute -top-2.5 -right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black p-1 rounded-full shadow-md z-20 border border-amber-200"
          title="Room Host"
        >
          <Crown className="w-3.5 h-3.5 fill-black stroke-black" />
        </div>
      )}

      {/* Ready Status indicator */}
      {showStatus && (
        <div
          className={`absolute -bottom-1 -right-1 p-0.5 rounded-full z-20 border-2 border-[#080A12] ${
            isReady ? 'bg-emerald-500 text-white' : 'bg-zinc-600 text-zinc-300'
          }`}
          title={isReady ? 'Ready' : 'Not Ready'}
        >
          <ShieldCheck className="w-3 h-3" />
        </div>
      )}
    </div>
  );
};
