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

  // High-fidelity, authentic Marvel character vector artwork
  const renderCharacterVisual = () => {
    switch (char.id) {
      case 'char_ironman':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(239,68,68,0.85)]`}>
            {/* Iron Man Mark 85 Helmet Base */}
            <path
              d="M16 18C16 10 23 6 32 6C41 6 48 10 48 18V38C48 46 41 54 32 58C23 54 16 46 16 38V18Z"
              fill="#DC2626"
              stroke="#991B1B"
              strokeWidth="1.5"
            />
            {/* Ear Pods */}
            <rect x="12" y="24" width="4" height="14" rx="2" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1" />
            <rect x="48" y="24" width="4" height="14" rx="2" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1" />
            <circle cx="14" cy="31" r="1.5" fill="#F59E0B" />
            <circle cx="50" cy="31" r="1.5" fill="#F59E0B" />

            {/* Forehead Crimson Brow */}
            <path d="M22 14H42L38 20H26L22 14Z" fill="#B91C1C" />

            {/* Iconic Gold Faceplate */}
            <path
              d="M22 20H42L45 34L39 42L35 47H29L25 42L19 34L22 20Z"
              fill="url(#ironmanGoldGrad)"
              stroke="#D97706"
              strokeWidth="1"
            />

            {/* Cheek & Jaw Crimson Cutouts */}
            <path d="M19 36L25 44L28 50L32 53L36 50L39 44L45 36L48 38L42 50L32 56L22 50L16 38L19 36Z" fill="#B91C1C" />

            {/* Mouth / Chin Inset */}
            <path d="M28 47H36L35 50H29L28 47Z" fill="#991B1B" />
            <line x1="29" y1="48.5" x2="35" y2="48.5" stroke="#78350F" strokeWidth="1" />

            {/* Glowing Slanted Cyan LED Eyes */}
            <polygon points="23,28 30,29 29,32 24,31" fill="#E0F2FE" />
            <polygon points="23,28 30,29 29,32 24,31" stroke="#00E5FF" strokeWidth="1.5" />
            <polygon points="41,28 34,29 35,32 40,31" fill="#E0F2FE" />
            <polygon points="41,28 34,29 35,32 40,31" stroke="#00E5FF" strokeWidth="1.5" />

            {/* Gold Gradients */}
            <defs>
              <linearGradient id="ironmanGoldGrad" x1="20" y1="20" x2="44" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="0.5" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'char_spiderman':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(59,130,246,0.85)]`}>
            {/* Spider-Man Mask Head Base */}
            <path
              d="M16 22C16 11 23 7 32 7C41 7 48 11 48 22C48 37 42 50 32 57C22 50 16 37 16 22Z"
              fill="#EF4444"
              stroke="#B91C1C"
              strokeWidth="1.5"
            />
            {/* Shadow contours */}
            <path d="M16 26C16 40 22 49 32 57C26 50 20 40 20 26C20 18 24 10 32 7C23 7 16 13 16 26Z" fill="#DC2626" />

            {/* Web Lines - Converging Radial Lines */}
            <line x1="32" y1="7" x2="32" y2="57" stroke="#0F172A" strokeWidth="1" />
            <line x1="16" y1="20" x2="48" y2="20" stroke="#0F172A" strokeWidth="0.8" />
            <line x1="17" y1="32" x2="47" y2="32" stroke="#0F172A" strokeWidth="0.8" />
            <line x1="22" y1="44" x2="42" y2="44" stroke="#0F172A" strokeWidth="0.8" />
            <path d="M32 30L16 14" stroke="#0F172A" strokeWidth="0.8" />
            <path d="M32 30L48 14" stroke="#0F172A" strokeWidth="0.8" />
            <path d="M32 30L17 40" stroke="#0F172A" strokeWidth="0.8" />
            <path d="M32 30L47 40" stroke="#0F172A" strokeWidth="0.8" />

            {/* Web Rings */}
            <path d="M25 24Q32 27 39 24" stroke="#0F172A" strokeWidth="0.8" fill="none" />
            <path d="M22 34Q32 39 42 34" stroke="#0F172A" strokeWidth="0.8" fill="none" />
            <path d="M26 43Q32 47 38 43" stroke="#0F172A" strokeWidth="0.8" fill="none" />

            {/* Iconic Eyes - Thick Black Frames with Sharp Angles */}
            {/* Left Eye */}
            <path
              d="M17 24C21 24 28 29 29 36C26 37 19 34 17 24Z"
              fill="#0F172A"
              stroke="#020617"
              strokeWidth="1.5"
            />
            <path
              d="M18.5 25.5C21.5 25.5 26.5 29.5 27.5 34.5C25 35.5 20 33 18.5 25.5Z"
              fill="#FFFFFF"
            />
            <path
              d="M19 26C21 26 24 28 25 31C23 31.5 20 30.5 19 26Z"
              fill="#E0F2FE"
              opacity="0.8"
            />

            {/* Right Eye */}
            <path
              d="M47 24C43 24 36 29 35 36C38 37 45 34 47 24Z"
              fill="#0F172A"
              stroke="#020617"
              strokeWidth="1.5"
            />
            <path
              d="M45.5 25.5C42.5 25.5 37.5 29.5 36.5 34.5C39 35.5 44 33 45.5 25.5Z"
              fill="#FFFFFF"
            />
            <path
              d="M45 26C43 26 40 28 39 31C41 31.5 44 30.5 45 26Z"
              fill="#E0F2FE"
              opacity="0.8"
            />
          </svg>
        );

      case 'char_cap':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(14,165,233,0.85)]`}>
            {/* Captain America Combat Cowl */}
            <path
              d="M17 22C17 11 23 7 32 7C41 7 47 11 47 22V36C47 43 42 50 32 56C22 50 17 43 17 36V22Z"
              fill="#0284C7"
              stroke="#0369A1"
              strokeWidth="1.5"
            />
            {/* Brow ridge */}
            <path d="M17 28C22 30 28 28 32 30C36 28 42 30 47 28V24C42 22 36 24 32 23C28 24 22 22 17 24V28Z" fill="#0369A1" />

            {/* Wing details on sides */}
            <path d="M14 20L19 17L18 24L14 20Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.5" />
            <path d="M50 20L45 17L46 24L50 20Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.5" />

            {/* White Winged "A" Symbol on Forehead */}
            <path
              d="M32 10L26 23H29.5L30.8 20H33.2L34.5 23H38L32 10ZM32 14.5L32.8 17.5H31.2L32 14.5Z"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="0.5"
            />

            {/* Eye Cutouts / Mask Visor */}
            <path d="M22 32C25 32 28 34 29 37C26 37 23 35 22 32Z" fill="#0F172A" />
            <path d="M42 32C39 32 36 34 35 37C38 37 41 35 42 32Z" fill="#0F172A" />

            {/* Chin Strap with Buckle */}
            <path d="M23 44C27 50 37 50 41 44L42 47C37 54 27 54 22 47L23 44Z" fill="#78350F" />
            <rect x="30" y="47" width="4" height="3" rx="0.5" fill="#E2E8F0" />

            {/* Vibranium Star Shield Mini Emblem below */}
            <circle cx="32" cy="38" r="4.5" fill="#EF4444" stroke="#DC2626" strokeWidth="0.5" />
            <circle cx="32" cy="38" r="3.2" fill="#FFFFFF" />
            <circle cx="32" cy="38" r="2.2" fill="#0284C7" />
            <polygon points="32,36.5 32.5,37.6 33.7,37.6 32.8,38.3 33.1,39.5 32,38.8 30.9,39.5 31.2,38.3 30.3,37.6 31.5,37.6" fill="#FFFFFF" />
          </svg>
        );

      case 'char_thor':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(245,158,11,0.85)]`}>
            {/* Thor Winged Helmet Base */}
            <path
              d="M20 20C20 12 25 7 32 7C39 7 44 12 44 20V36C44 42 39 48 32 52C25 48 20 42 20 36V20Z"
              fill="#94A3B8"
              stroke="#64748B"
              strokeWidth="1.5"
            />
            {/* Center Golden Norse Crest */}
            <path d="M29 6H35L33 26H31L29 6Z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />
            <polygon points="32,4 35,9 29,9" fill="#FCD34D" />

            {/* Majestic Silver Helm Wings */}
            {/* Left Wing */}
            <path
              d="M20 24L8 12C12 18 11 26 15 32L20 28V24Z"
              fill="#E2E8F0"
              stroke="#CBD5E1"
              strokeWidth="1"
            />
            <path d="M10 14L18 24" stroke="#94A3B8" strokeWidth="1" />

            {/* Right Wing */}
            <path
              d="M44 24L56 12C52 18 53 26 49 32L44 28V24Z"
              fill="#E2E8F0"
              stroke="#CBD5E1"
              strokeWidth="1"
            />
            <path d="M54 14L46 24" stroke="#94A3B8" strokeWidth="1" />

            {/* Golden Flowing Hair & Beard */}
            <path d="M20 34C18 38 18 48 22 54C25 50 25 42 24 38" fill="#F59E0B" />
            <path d="M44 34C46 38 46 48 42 54C39 50 39 42 40 38" fill="#F59E0B" />
            <path d="M26 44C29 52 35 52 38 44C36 48 28 48 26 44Z" fill="#D97706" />

            {/* Lightning-Charged Glowing Cyan Eyes */}
            <ellipse cx="27" cy="27" rx="3" ry="2" fill="#00E5FF" />
            <circle cx="27" cy="27" r="1" fill="#FFFFFF" />
            <ellipse cx="37" cy="27" rx="3" ry="2" fill="#00E5FF" />
            <circle cx="37" cy="27" r="1" fill="#FFFFFF" />

            {/* Forehead Brow Band */}
            <path d="M20 22H44V26H20V22Z" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.8" />
          </svg>
        );

      case 'char_hulk':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(34,197,94,0.85)]`}>
            {/* Hulk Head & Heavy Jaw Shape */}
            <path
              d="M17 22C17 11 22 8 32 8C42 8 47 11 47 22V36C47 46 43 54 32 57C21 54 17 46 17 36V22Z"
              fill="#16A34A"
              stroke="#15803D"
              strokeWidth="1.5"
            />
            {/* Tousled Dark Forest Green Hair */}
            <path
              d="M15 18C16 11 22 6 32 6C42 6 48 11 49 18C46 15 42 16 39 12C37 16 33 13 30 15C27 12 23 16 19 14C17 16 16 17 15 18Z"
              fill="#14532D"
            />

            {/* Heavy Furrowed Brow Ridge */}
            <path d="M20 24C24 26 28 24 32 26C36 24 40 26 44 24C41 21 23 21 20 24Z" fill="#15803D" />

            {/* Glowing Gamma Green Enraged Eyes */}
            <polygon points="22,27 28,29 27,32 23,31" fill="#4ADE80" stroke="#15803D" strokeWidth="1" />
            <circle cx="25.5" cy="29.5" r="1" fill="#052E16" />
            <polygon points="42,27 36,29 37,32 41,31" fill="#4ADE80" stroke="#15803D" strokeWidth="1" />
            <circle cx="38.5" cy="29.5" r="1" fill="#052E16" />

            {/* Broad Nose */}
            <polygon points="32,29 29,37 35,37" fill="#15803D" opacity="0.7" />

            {/* Clenched Snarl & Teeth */}
            <path d="M24 42H40V47H24V42Z" fill="#052E16" />
            {/* Top Teeth */}
            <path d="M25 42L26 44H28L29 42H31L32 44H33L35 42H37L38 44H39L39 42" stroke="#F0FDF4" strokeWidth="1.2" />
            {/* Bottom Teeth */}
            <path d="M26 47L27 45H29L30 47H32L33 45H35L36 47H38" stroke="#F0FDF4" strokeWidth="1.2" />

            {/* Muscular Neck Lines */}
            <path d="M20 48L15 58" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
            <path d="M44 48L49 58" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'char_panther':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(168,85,247,0.85)]`}>
            {/* Sleek Panther Cowl Base with Pointed Feline Ears */}
            <path
              d="M17 12L21 20H43L47 12L46 24C47 36 43 48 32 56C21 48 17 36 18 24L17 12Z"
              fill="#0F172A"
              stroke="#A855F7"
              strokeWidth="1.5"
            />
            {/* Inner Ear Highlights */}
            <polygon points="19,15 21,21 18,21" fill="#7C3AED" />
            <polygon points="45,15 43,21 46,21" fill="#7C3AED" />

            {/* Wakandan Geometric Kinetic Weave Lines */}
            <path d="M24 20L32 26L40 20" stroke="#C084FC" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M26 26L32 31L38 26" stroke="#A855F7" strokeWidth="1" strokeLinecap="round" />
            <line x1="32" y1="12" x2="32" y2="26" stroke="#C084FC" strokeWidth="1" />

            {/* Glowing Slanted Violet Lenses */}
            <polygon points="21,28 29,31 27,35 22,33" fill="#FAF5FF" stroke="#A855F7" strokeWidth="1.5" />
            <polygon points="43,28 35,31 37,35 42,33" fill="#FAF5FF" stroke="#A855F7" strokeWidth="1.5" />

            {/* Nose Bridge Geometry */}
            <polygon points="32,34 29,40 35,40" fill="#1E1B4B" stroke="#A855F7" strokeWidth="0.8" />

            {/* Cheek & Jaw Contours */}
            <path d="M21 37L26 44L32 47L38 44L43 37" stroke="#6B21A8" strokeWidth="1.2" strokeLinecap="round" fill="none" />

            {/* Vibranium Fang Necklace Motif */}
            <polygon points="22,50 24,54 23,50" fill="#E2E8F0" />
            <polygon points="26,52 28,56 27,52" fill="#E2E8F0" />
            <polygon points="31,53 32,58 33,53" fill="#E2E8F0" />
            <polygon points="37,52 36,56 38,52" fill="#E2E8F0" />
            <polygon points="41,50 40,54 42,50" fill="#E2E8F0" />
          </svg>
        );

      case 'char_strange':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(249,115,22,0.85)]`}>
            {/* Popped High Collar of the Cloak of Levitation */}
            <path
              d="M12 12C12 28 20 44 32 48C44 44 52 28 52 12L42 22C38 28 26 28 22 22L12 12Z"
              fill="#BE123C"
              stroke="#F59E0B"
              strokeWidth="1.5"
            />
            <path d="M12 12L22 22" stroke="#F59E0B" strokeWidth="1.5" />
            <path d="M52 12L42 22" stroke="#F59E0B" strokeWidth="1.5" />

            {/* Sorcerer Hair with Silver Streaks */}
            <path d="M22 18C22 10 26 7 32 7C38 7 42 10 42 18V26C42 32 38 38 32 40C26 38 22 32 22 26V18Z" fill="#18181B" />
            {/* Silver temple streaks */}
            <path d="M22 18C22 14 24 12 26 10" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M42 18C42 14 40 12 38 10" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />

            {/* Sorcerer Face & Goatee */}
            <circle cx="28" cy="22" r="1.5" fill="#E0F2FE" />
            <circle cx="36" cy="22" r="1.5" fill="#E0F2FE" />
            <path d="M30 28L32 33L34 28" fill="#18181B" />

            {/* Glowing Eye of Agamotto Medallion */}
            <ellipse cx="32" cy="42" rx="10" ry="7" fill="#B45309" stroke="#F59E0B" strokeWidth="1.5" />
            {/* Green Time Stone Eye Center */}
            <circle cx="32" cy="42" r="4.5" fill="#10B981" stroke="#34D399" strokeWidth="1" />
            <circle cx="32" cy="42" r="2" fill="#ECFDF5" />

            {/* Mystic Runic Radiance */}
            <path d="M24 42L20 42" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M40 42L44 42" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M32 33L32 30" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M32 51L32 54" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      case 'char_deadpool':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(220,38,38,0.85)]`}>
            {/* Deadpool Mask Base with Little Top Fin */}
            <path
              d="M17 22C17 11 23 7 32 6C33 4 34 4 34 6C41 7 47 11 47 22C47 38 42 50 32 57C22 50 17 38 17 22Z"
              fill="#DC2626"
              stroke="#991B1B"
              strokeWidth="1.5"
            />
            {/* Central Stitch Seam */}
            <line x1="32" y1="6" x2="32" y2="57" stroke="#18181B" strokeWidth="1.2" />

            {/* Signature Large Black Teardrop Eye Patches */}
            {/* Left Eye Patch */}
            <path
              d="M19 22C19 16 28 17 30 26C30 36 21 38 19 32C18 28 19 25 19 22Z"
              fill="#18181B"
              stroke="#09090B"
              strokeWidth="1.2"
            />
            {/* Right Eye Patch */}
            <path
              d="M45 22C45 16 36 17 34 26C34 36 43 38 45 32C46 28 45 25 45 22Z"
              fill="#18181B"
              stroke="#09090B"
              strokeWidth="1.2"
            />

            {/* Expressive White Eyes - Classic Squint on Right, Wide on Left */}
            {/* Left Eye (Wide) */}
            <polygon points="21,25 27,27 25,31 22,30" fill="#FFFFFF" />
            {/* Right Eye (Squint) */}
            <path d="M43 27L37 28L42 30" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        );

      case 'char_wolverine':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(234,179,8,0.85)]`}>
            {/* Black Bat-Wing Cowl Horns / Fins */}
            {/* Left Flared Fin */}
            <path
              d="M32 18L18 6C12 12 10 24 16 38L22 30L32 18Z"
              fill="#0F172A"
              stroke="#020617"
              strokeWidth="1.2"
            />
            {/* Right Flared Fin */}
            <path
              d="M32 18L46 6C52 12 54 24 48 38L42 30L32 18Z"
              fill="#0F172A"
              stroke="#020617"
              strokeWidth="1.2"
            />

            {/* Wolverine Gold Mask Center */}
            <path
              d="M22 18C22 11 26 8 32 8C38 8 42 11 42 18V36C42 44 38 52 32 56C26 52 22 44 22 36V18Z"
              fill="#F59E0B"
              stroke="#D97706"
              strokeWidth="1.5"
            />

            {/* Black Nose & Brow Triangles */}
            <polygon points="32,22 28,14 36,14" fill="#0F172A" />

            {/* Fierce White Slit Eyes */}
            <polygon points="24,26 30,28 29,31 25,30" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
            <polygon points="40,26 34,28 35,31 39,30" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />

            {/* Stubble Jawline */}
            <path d="M26 42C28 46 36 46 38 42" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />

            {/* Three Crossed Adamantium Claw Tips */}
            <path d="M18 52L26 44" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
            <path d="M32 56L32 46" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M46 52L38 44" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'char_scarlet':
      default:
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_12px_rgba(225,29,72,0.85)]`}>
            {/* Flowing Dark Auburn Hair */}
            <path
              d="M18 20C18 10 24 6 32 6C40 6 46 10 46 20C46 36 48 48 50 56C44 52 44 42 42 36C40 44 38 52 32 55C26 52 24 44 22 36C20 42 20 52 14 56C16 48 18 36 18 20Z"
              fill="#581C87"
            />

            {/* Iconic Scarlet Witch 5-Pointed Chaos Tiara / Horned Headpiece */}
            <path
              d="M16 26L20 8L27 16L32 10L37 16L44 8L48 26L41 21L37 25L32 20L27 25L23 21L16 26Z"
              fill="#E11D48"
              stroke="#9F1239"
              strokeWidth="1.5"
            />
            {/* Inner Crown Shading */}
            <path d="M22 17L27 21L32 16L37 21L42 17L44 24L32 20L20 24L22 17Z" fill="#BE123C" />

            {/* Scarlet Eyes with Crimson Glow */}
            <circle cx="28" cy="30" r="2" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1" />
            <circle cx="36" cy="30" r="2" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1" />

            {/* Floating Chaos Magic Hex Runes & Spheres */}
            <circle cx="16" cy="38" r="3.5" fill="#E11D48" opacity="0.85" />
            <circle cx="16" cy="38" r="1.5" fill="#FFE4E6" />
            <circle cx="48" cy="38" r="3.5" fill="#E11D48" opacity="0.85" />
            <circle cx="48" cy="38" r="1.5" fill="#FFE4E6" />

            {/* Swirling Hex Energy Rings */}
            <path d="M12 40Q16 32 22 38" stroke="#F43F5E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M52 40Q48 32 42 38" stroke="#F43F5E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
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
