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
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-13 h-13',
    xl: 'w-17 h-17',
  }[size];

  // Authentic detailed Marvel hero SVG visual rendering
  const renderCharacterVisual = () => {
    switch (char.id) {
      case 'char_ironman':
        return (
          <svg viewBox="0 0 100 100" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]`}>
            <defs>
              <linearGradient id="im-red" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
              <linearGradient id="im-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <filter id="eye-glow">
                <feGaussianBlur stdDeviation="2" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Outer Helmet (Crimson) */}
            <path
              d="M20 35 C20 16 33 10 50 10 C67 10 80 16 80 35 C80 56 78 78 70 88 C66 93 58 94 50 94 C42 94 34 93 30 88 C22 78 20 56 20 35 Z"
              fill="url(#im-red)"
              stroke="#B91C1C"
              strokeWidth="2"
            />
            {/* Brow & Forehead Armor Plating */}
            <path d="M26 30 C34 26 44 24 50 24 C56 24 66 26 74 30 L70 38 L30 38 Z" fill="#991B1B" opacity="0.6" />
            {/* Gold Faceplate */}
            <path
              d="M30 38 L70 38 L72 58 L63 68 L64 82 L50 88 L36 82 L37 68 L28 58 Z"
              fill="url(#im-gold)"
              stroke="#B45309"
              strokeWidth="1.5"
            />
            {/* Faceplate Center Contour */}
            <path d="M42 38 L44 54 L50 58 L56 54 L58 38" fill="none" stroke="#D97706" strokeWidth="1.5" />
            {/* Slanted Glowing Cyan Eyes */}
            <polygon points="34,48 44,51 43,55 35,53" fill="#E0F2FE" filter="url(#eye-glow)" />
            <polygon points="34,48 44,51 43,55 35,53" fill="#38BDF8" opacity="0.8" />
            <polygon points="66,48 56,51 57,55 65,53" fill="#E0F2FE" filter="url(#eye-glow)" />
            <polygon points="66,48 56,51 57,55 65,53" fill="#38BDF8" opacity="0.8" />
            {/* Mouth / Chin vent slit */}
            <line x1="43" y1="76" x2="57" y2="76" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="46" y1="80" x2="54" y2="80" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'char_spiderman':
        return (
          <svg viewBox="0 0 100 100" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]`}>
            <defs>
              <radialGradient id="spidey-base" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="85%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#991B1B" />
              </radialGradient>
            </defs>
            {/* Mask Head Oval */}
            <ellipse cx="50" cy="50" rx="36" ry="43" fill="url(#spidey-base)" stroke="#991B1B" strokeWidth="2" />
            {/* Spider Web Lines - Vertical/Radial */}
            <line x1="50" y1="7" x2="50" y2="93" stroke="#18181B" strokeWidth="1.5" opacity="0.75" />
            <line x1="14" y1="50" x2="86" y2="50" stroke="#18181B" strokeWidth="1.5" opacity="0.75" />
            <line x1="24" y1="20" x2="76" y2="80" stroke="#18181B" strokeWidth="1.2" opacity="0.6" />
            <line x1="76" y1="20" x2="24" y2="80" stroke="#18181B" strokeWidth="1.2" opacity="0.6" />
            {/* Web Webbing Concentric Arcs */}
            <path d="M38 25 Q50 32 62 25" fill="none" stroke="#18181B" strokeWidth="1.2" opacity="0.7" />
            <path d="M28 36 Q50 46 72 36" fill="none" stroke="#18181B" strokeWidth="1.2" opacity="0.7" />
            <path d="M22 50 Q50 62 78 50" fill="none" stroke="#18181B" strokeWidth="1.2" opacity="0.7" />
            <path d="M28 66 Q50 78 72 66" fill="none" stroke="#18181B" strokeWidth="1.2" opacity="0.7" />
            <path d="M38 79 Q50 86 62 79" fill="none" stroke="#18181B" strokeWidth="1.2" opacity="0.7" />
            {/* Left Eye (Bold comic contour + White lens) */}
            <path
              d="M22 36 C34 38 43 47 44 60 C38 64 26 62 19 50 C18 43 20 38 22 36 Z"
              fill="#0F172A"
              stroke="#000000"
              strokeWidth="2"
            />
            <path
              d="M24 39 C33 41 40 48 41 57 C36 60 27 58 22 49 C21 44 22 40 24 39 Z"
              fill="#FFFFFF"
            />
            {/* Right Eye (Mirror) */}
            <path
              d="M78 36 C66 38 57 47 56 60 C62 64 74 62 81 50 C82 43 80 38 78 36 Z"
              fill="#0F172A"
              stroke="#000000"
              strokeWidth="2"
            />
            <path
              d="M76 39 C67 41 60 48 59 57 C64 60 73 58 78 49 C79 44 78 40 76 39 Z"
              fill="#FFFFFF"
            />
          </svg>
        );

      case 'char_cap':
        return (
          <svg viewBox="0 0 100 100" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]`}>
            {/* Concentric Vibranium Shield Rings */}
            {/* Outer Red Ring */}
            <circle cx="50" cy="50" r="46" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
            {/* Outer Silver Ring */}
            <circle cx="50" cy="50" r="37" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
            {/* Inner Red Ring */}
            <circle cx="50" cy="50" r="28" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
            {/* Blue Center Core */}
            <circle cx="50" cy="50" r="19" fill="#0284C7" stroke="#0369A1" strokeWidth="1" />
            {/* Metallic Sheen Highlight */}
            <path d="M10 32 A46 46 0 0 1 78 12 A46 46 0 0 0 10 32 Z" fill="#FFFFFF" opacity="0.25" />
            {/* 5-Point Center Star */}
            <polygon
              points="50,33 54.3,42.8 65,43.3 56.8,50.1 59.7,60.5 50,54.5 40.3,60.5 43.2,50.1 35,43.3 45.7,42.8"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="0.8"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
            />
          </svg>
        );

      case 'char_thor':
        return (
          <svg viewBox="0 0 100 100" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]`}>
            <defs>
              <linearGradient id="hammer-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
            {/* Lightning Aura */}
            <path d="M22 18 L34 8 L30 24 L42 22 L24 45 L28 30 L16 32 Z" fill="#38BDF8" opacity="0.85" />
            <path d="M78 18 L66 8 L70 24 L58 22 L76 45 L72 30 L84 32 Z" fill="#38BDF8" opacity="0.85" />
            {/* Mjolnir Handle */}
            <rect x="46" y="44" width="8" height="46" rx="3" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
            {/* Handle Leather Straps */}
            <line x1="46" y1="52" x2="54" y2="56" stroke="#D97706" strokeWidth="2" />
            <line x1="46" y1="62" x2="54" y2="66" stroke="#D97706" strokeWidth="2" />
            <line x1="46" y1="72" x2="54" y2="76" stroke="#D97706" strokeWidth="2" />
            <line x1="46" y1="82" x2="54" y2="86" stroke="#D97706" strokeWidth="2" />
            {/* Handle Pommel / Strap Loop */}
            <circle cx="50" cy="90" r="4" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
            {/* Mjolnir Hammer Head (Beveled Poly) */}
            <polygon
              points="18,18 82,18 88,26 88,42 82,48 18,48 12,42 12,26"
              fill="url(#hammer-metal)"
              stroke="#F59E0B"
              strokeWidth="2"
            />
            {/* Hammer Face Bevel Lines */}
            <line x1="18" y1="18" x2="18" y2="48" stroke="#334155" strokeWidth="1.5" />
            <line x1="82" y1="18" x2="82" y2="48" stroke="#334155" strokeWidth="1.5" />
            <rect x="24" y="24" width="52" height="18" rx="2" fill="#64748B" opacity="0.4" />
            {/* Asgardian Triquetra Rune */}
            <circle cx="50" cy="33" r="6" stroke="#FBBF24" strokeWidth="1.5" fill="none" />
            <path d="M46 36 Q50 27 54 36" stroke="#FBBF24" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case 'char_hulk':
        return (
          <svg viewBox="0 0 100 100" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]`}>
            <defs>
              <linearGradient id="hulk-green" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="50%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#15803D" />
              </linearGradient>
            </defs>
            {/* Hulk Wild Dark Hair */}
            <path
              d="M20 40 C18 20 32 10 50 10 C68 10 82 20 80 40 L76 34 L70 42 L64 32 L56 40 L50 30 L44 40 L36 32 L30 42 L24 34 Z"
              fill="#064E3B"
            />
            {/* Massive Green Face & Jaw */}
            <path
              d="M22 38 C22 25 34 22 50 22 C66 22 78 25 78 38 C78 58 76 80 68 88 C62 94 56 95 50 95 C44 95 38 94 32 88 C24 80 22 58 22 38 Z"
              fill="url(#hulk-green)"
              stroke="#166534"
              strokeWidth="2"
            />
            {/* Furious Heavy Brow */}
            <path d="M26 44 L44 50 L50 48 L56 50 L74 44 L68 40 L50 43 L32 40 Z" fill="#14532D" />
            {/* Fierce Glowing Eyes */}
            <polygon points="32,49 43,53 41,56 31,52" fill="#FEF08A" />
            <circle cx="37" cy="52" r="1.5" fill="#15803D" />
            <polygon points="68,49 57,53 59,56 69,52" fill="#FEF08A" />
            <circle cx="63" cy="52" r="1.5" fill="#15803D" />
            {/* Nose */}
            <polygon points="50,54 45,64 55,64" fill="#15803D" opacity="0.6" />
            {/* Snarl / Teeth Grating Mouth */}
            <rect x="34" y="70" width="32" height="14" rx="4" fill="#14532D" stroke="#052E16" strokeWidth="1.5" />
            {/* Clenched White Teeth */}
            <line x1="34" y1="77" x2="66" y2="77" stroke="#F8FAFC" strokeWidth="3" strokeDasharray="5 2" />
          </svg>
        );

      case 'char_panther':
        return (
          <svg viewBox="0 0 100 100" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]`}>
            <defs>
              <linearGradient id="panther-mask" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#27272A" />
                <stop offset="70%" stopColor="#18181B" />
                <stop offset="100%" stopColor="#09090B" />
              </linearGradient>
            </defs>
            {/* Panther Cat Ears */}
            <polygon points="20,18 36,32 18,38" fill="#18181B" stroke="#A855F7" strokeWidth="1.5" />
            <polygon points="80,18 64,32 82,38" fill="#18181B" stroke="#A855F7" strokeWidth="1.5" />
            {/* Wakandan Helmet Mask */}
            <path
              d="M24 32 C24 18 35 14 50 14 C65 14 76 18 76 32 C76 56 74 76 66 86 C60 92 55 94 50 94 C45 94 40 92 34 86 C26 76 24 56 24 32 Z"
              fill="url(#panther-mask)"
              stroke="#A855F7"
              strokeWidth="2"
            />
            {/* Kinetic Violet Forehead Patterns */}
            <path d="M50 20 L44 32 L50 36 L56 32 Z" fill="#C084FC" opacity="0.8" />
            <path d="M34 26 L42 34" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M66 26 L58 34" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" />
            {/* Sleek Silver/Purple Cat Eyes */}
            <polygon points="30,48 44,52 38,57 28,52" fill="#E9D5FF" stroke="#A855F7" strokeWidth="1" />
            <polygon points="70,48 56,52 62,57 72,52" fill="#E9D5FF" stroke="#A855F7" strokeWidth="1" />
            {/* Vibranium Fang Necklace on Jaw */}
            <path
              d="M32 72 L36 78 L40 72 L45 80 L50 72 L55 80 L60 72 L64 78 L68 72"
              fill="none"
              stroke="#C084FC"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'char_strange':
        return (
          <svg viewBox="0 0 100 100" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]`}>
            <defs>
              <linearGradient id="eye-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            {/* Outer Mystic Mandala Magic Ring */}
            <circle cx="50" cy="50" r="44" stroke="#F97316" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />
            <polygon
              points="50,8 86,29 86,71 50,92 14,71 14,29"
              fill="none"
              stroke="#EA580C"
              strokeWidth="1.5"
              opacity="0.6"
            />
            {/* Eye of Agamotto Amulet */}
            <ellipse cx="50" cy="50" rx="36" ry="24" fill="url(#eye-gold)" stroke="#78350F" strokeWidth="2" />
            {/* Ornate Eye Lids */}
            <path d="M16 50 C26 30 74 30 84 50" fill="none" stroke="#78350F" strokeWidth="3" />
            <path d="M16 50 C26 70 74 70 84 50" fill="none" stroke="#78350F" strokeWidth="3" />
            {/* Inner Emerald Time Stone Glow */}
            <circle cx="50" cy="50" r="14" fill="#10B981" stroke="#34D399" strokeWidth="2" />
            <circle cx="50" cy="50" r="8" fill="#A7F3D0" />
            <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
            {/* 4 Mystic Runic Rays */}
            <line x1="50" y1="14" x2="50" y2="26" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="74" x2="50" y2="86" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="14" y1="50" x2="24" y2="50" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="76" y1="50" x2="86" y2="50" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case 'char_deadpool':
        return (
          <svg viewBox="0 0 100 100" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(220,38,38,0.8)]`}>
            <defs>
              <radialGradient id="dp-red" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="70%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </radialGradient>
            </defs>
            {/* Mask Head Oval */}
            <ellipse cx="50" cy="50" rx="36" ry="43" fill="url(#dp-red)" stroke="#991B1B" strokeWidth="2" />
            {/* Center Mask Seam Line */}
            <line x1="50" y1="7" x2="50" y2="93" stroke="#18181B" strokeWidth="2" opacity="0.6" />
            {/* Left Big Black Eye Patch */}
            <path
              d="M20 34 C35 32 45 42 46 62 C40 72 26 70 17 56 C14 46 17 36 20 34 Z"
              fill="#18181B"
              stroke="#09090B"
              strokeWidth="2"
            />
            {/* Left White Slanted Eye */}
            <polygon points="26,48 40,51 34,57 24,53" fill="#FFFFFF" />
            {/* Right Big Black Eye Patch (Quirky Squinched Expression) */}
            <path
              d="M80 34 C65 32 55 42 54 62 C60 72 74 70 83 56 C86 46 83 36 80 34 Z"
              fill="#18181B"
              stroke="#09090B"
              strokeWidth="2"
            />
            {/* Right White Eye */}
            <polygon points="74,50 60,51 64,55 76,53" fill="#FFFFFF" />
          </svg>
        );

      case 'char_wolverine':
        return (
          <svg viewBox="0 0 100 100" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]`}>
            <defs>
              <linearGradient id="wolv-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
            </defs>
            {/* Wolverine Black Winged Cowl Fins */}
            <path d="M12 12 C18 36 28 50 34 58 L22 62 C16 48 8 28 12 12 Z" fill="#18181B" stroke="#000000" strokeWidth="1.5" />
            <path d="M88 12 C82 36 72 50 66 58 L78 62 C84 48 92 28 88 12 Z" fill="#18181B" stroke="#000000" strokeWidth="1.5" />
            {/* Yellow Mask Head */}
            <path
              d="M26 36 C26 20 36 16 50 16 C64 16 74 20 74 36 C74 58 72 78 64 88 C58 94 54 95 50 95 C46 95 42 94 36 88 C28 78 26 58 26 36 Z"
              fill="url(#wolv-yellow)"
              stroke="#A16207"
              strokeWidth="2"
            />
            {/* Black Cowl Wings on Face */}
            <polygon points="26,36 44,48 36,60 26,54" fill="#18181B" />
            <polygon points="74,36 56,48 64,60 74,54" fill="#18181B" />
            {/* Fierce White Eyes */}
            <polygon points="32,48 44,52 38,55 30,52" fill="#FFFFFF" />
            <polygon points="68,48 56,52 62,55 70,52" fill="#FFFFFF" />
            {/* Adamantium Triple Claws Slash Marks */}
            <line x1="38" y1="68" x2="32" y2="90" stroke="#F1F5F9" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="68" x2="50" y2="92" stroke="#F1F5F9" strokeWidth="3" strokeLinecap="round" />
            <line x1="62" y1="68" x2="68" y2="90" stroke="#F1F5F9" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case 'char_scarlet':
      default:
        return (
          <svg viewBox="0 0 100 100" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(225,29,72,0.8)]`}>
            <defs>
              <linearGradient id="tiara-red" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="50%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#9F1239" />
              </linearGradient>
            </defs>
            {/* Chaos Magic Hex Field Particles */}
            <circle cx="50" cy="50" r="42" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
            {/* Iconic Scarlet Witch Curved Horned Tiara */}
            <path
              d="M16 48 L22 18 L36 36 L50 22 L64 36 L78 18 L84 48 L72 44 L60 62 L50 54 L40 62 L28 44 Z"
              fill="url(#tiara-red)"
              stroke="#BE123C"
              strokeWidth="2"
            />
            {/* Tiara Center Gem / Chaos Rune */}
            <polygon points="50,30 55,40 50,48 45,40" fill="#7C3AED" stroke="#C084FC" strokeWidth="1" />
            <circle cx="50" cy="40" r="2" fill="#FFFFFF" />
            {/* Glowing Eyes */}
            <ellipse cx="38" cy="54" rx="4" ry="2.5" fill="#FDA4AF" />
            <ellipse cx="62" cy="54" rx="4" ry="2.5" fill="#FDA4AF" />
            {/* Magic Hex Blast Core */}
            <path d="M42 74 Q50 68 58 74 Q50 84 42 74 Z" fill="#E11D48" opacity="0.85" />
            <circle cx="50" cy="74" r="3" fill="#F43F5E" />
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
