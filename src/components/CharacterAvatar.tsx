import { Crown, Flame, ShieldCheck, Sparkles, Swords, Zap } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { getCharacterById } from '../utils/characters';

interface CharacterAvatarProps {
  characterId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isHost?: boolean;
  isReady?: boolean;
  showStatus?: boolean;
  showBadge?: boolean;
  animate?: boolean;
  interactive3D?: boolean;
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
  interactive3D = true,
  className = '',
}) => {
  const char = getCharacterById(characterId);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-13 h-13 text-sm',
    lg: 'w-18 h-18 text-base',
    xl: 'w-24 h-24 text-xl',
    '2xl': 'w-32 h-32 text-2xl',
  }[size];

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
    '2xl': 'w-20 h-20',
  }[size];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive3D || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const maxDeg = 22;
    setRotate({
      x: -(y / (rect.height / 2)) * maxDeg,
      y: (x / (rect.width / 2)) * maxDeg,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // High-fidelity, iconic vector artwork for 10 Mahabharat Characters
  const renderCharacterVisual = () => {
    switch (char.id) {
      // 1. SHRI KRISHNA - Peacock Feather (Mor Pankh), Sudarshana Chakra, Divine Flute (Bansuri), Blue Radiance
      case 'char_krishna':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_18px_rgba(56,189,248,0.95)]`}>
            {/* Rotating Sudarshana Chakra in top-right */}
            <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: '48px 16px' }}>
              <circle cx="48" cy="16" r="10" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" fill="#FEF08A" fillOpacity="0.2" />
              <polygon points="48,6 50,14 58,16 50,18 48,26 46,18 38,16 46,14" fill="#F59E0B" />
              <polygon points="41,9 49,15 55,9 49,17 55,23 47,17 41,23 47,15" fill="#EF4444" />
              <circle cx="48" cy="16" r="3" fill="#FDE047" stroke="#DC2626" strokeWidth="0.8" />
            </g>

            {/* Radiant Celestial Blue Head & Torso */}
            <path d="M19 24C19 13 25 7 32 7C39 7 45 13 45 24V37C45 46 39 53 32 57C25 53 19 46 19 37V24Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.2" />

            {/* Golden Mukut (Crown) */}
            <path d="M22 17L32 9L42 17L37 20H27L22 17Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
            <polygon points="32,7 35,13 32,16 29,13" fill="#FEF08A" />

            {/* Iconic Peacock Feather (Mor Pankh) atop Crown */}
            <g>
              <path d="M32 9C34 4 39 2 41 4C43 6 41 11 36 12" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
              {/* Outer Cyan/Green Fan */}
              <ellipse cx="38" cy="5" rx="5" ry="3.5" transform="rotate(-25 38 5)" fill="#10B981" />
              {/* Middle Royal Blue Eye */}
              <ellipse cx="38" cy="5" rx="3.2" ry="2.2" transform="rotate(-25 38 5)" fill="#1D4ED8" />
              {/* Inner Radiant Gold Core */}
              <ellipse cx="38" cy="5" rx="1.6" ry="1" transform="rotate(-25 38 5)" fill="#FBBF24" />
            </g>

            {/* Urdhva Pundra Chandan Tilak */}
            <path d="M30 19V24C30 25 34 25 34 24V19" stroke="#FEF08A" strokeWidth="1" fill="none" />
            <line x1="32" y1="20" x2="32" y2="25" stroke="#EF4444" strokeWidth="1" />

            {/* Serene Lotus Eyes */}
            <path d="M24 28C27 26 29 28 30 30C28 30.5 25 29.5 24 28Z" fill="#FFFFFF" />
            <circle cx="27" cy="28.5" r="1.3" fill="#0F172A" />
            <path d="M40 28C37 26 35 28 34 30C36 30.5 39 29.5 40 28Z" fill="#FFFFFF" />
            <circle cx="37" cy="28.5" r="1.3" fill="#0F172A" />

            {/* Divine Bansuri (Flute) across chest with Red Tassels */}
            <g transform="rotate(-15 32 44)">
              <rect x="14" y="42" width="36" height="4" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
              <circle cx="22" cy="44" r="1" fill="#78350F" />
              <circle cx="27" cy="44" r="1" fill="#78350F" />
              <circle cx="32" cy="44" r="1" fill="#78350F" />
              <circle cx="37" cy="44" r="1" fill="#78350F" />
              {/* Red Silk Tassel */}
              <path d="M15 45L12 52M16 45L15 53" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          </svg>
        );

      // 2. ARJUNA - Golden Gandiva Bow, Divine Nocked Arrow, Royal Warrior Diadem
      case 'char_arjuna':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_18px_rgba(234,179,8,0.95)]`}>
            {/* The Mighty Curved Gandiva Bow */}
            <path d="M12 8C6 24 6 40 12 56" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <path d="M12 8C8 24 8 40 12 56" stroke="#FEF08A" strokeWidth="1" strokeLinecap="round" />
            <line x1="12" y1="8" x2="12" y2="56" stroke="#60A5FA" strokeWidth="1" strokeDasharray="3 1" />

            {/* Celestial Golden Energy Arrow (Divyastra) ready on string */}
            <line x1="12" y1="32" x2="52" y2="32" stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="52,32 44,28 46,32 44,36" fill="#F59E0B" />
            <polygon points="12,32 17,29 16,32 17,35" fill="#3B82F6" />
            <circle cx="50" cy="32" r="3" fill="#60A5FA" opacity="0.8" className="animate-ping" />

            {/* Royal Warrior Head & Golden Crown */}
            <path d="M22 22C22 13 27 8 34 8C41 8 46 13 46 22V36C46 44 41 50 34 54C27 50 22 44 22 36V22Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />
            {/* Winged Solar Diadem */}
            <polygon points="34,6 40,14 34,17 28,14" fill="#FDE047" stroke="#B45309" strokeWidth="0.8" />
            <polygon points="26,10 20,7 24,14" fill="#F59E0B" />
            <polygon points="42,10 48,7 44,14" fill="#F59E0B" />

            {/* Warrior Eyes & Focused Brow */}
            <path d="M26 25L31 26" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M42 25L37 26" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="28.5" cy="28" r="1.4" fill="#18181B" />
            <circle cx="39.5" cy="28" r="1.4" fill="#18181B" />
            {/* Red Warrior Tilak */}
            <line x1="34" y1="19" x2="34" y2="24" stroke="#DC2626" strokeWidth="1.2" />

            {/* Quiver of Arrows at Back */}
            <rect x="47" y="18" width="6" height="24" rx="2" transform="rotate(15 47 18)" fill="#7F1D1D" stroke="#F59E0B" strokeWidth="0.8" />
            <line x1="49" y1="14" x2="49" y2="20" stroke="#FEF08A" strokeWidth="1.5" />
            <line x1="52" y1="12" x2="52" y2="20" stroke="#FEF08A" strokeWidth="1.5" />
          </svg>
        );

      // 3. KARNA - Golden Kavach (Chest Armor) + Radiant Sunburst Kundal (Earrings) + Surya Mandala
      case 'char_karna':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_18px_rgba(249,115,22,0.95)]`}>
            {/* Surya Solar Halo Rings behind Head */}
            <circle cx="32" cy="26" r="22" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" className="animate-[spin_12s_linear_infinite]" />
            <g stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" opacity="0.85">
              <line x1="32" y1="2" x2="32" y2="7" />
              <line x1="32" y1="45" x2="32" y2="50" />
              <line x1="8" y1="26" x2="13" y2="26" />
              <line x1="51" y1="26" x2="56" y2="26" />
              <line x1="15" y1="9" x2="19" y2="13" />
              <line x1="45" y1="39" x2="49" y2="43" />
              <line x1="49" y1="9" x2="45" y2="13" />
              <line x1="19" y1="39" x2="15" y2="43" />
            </g>

            {/* Heroic Head with Solar Warrior Turban/Crown */}
            <path d="M19 22C19 12 25 7 32 7C39 7 45 12 45 22V35C45 43 39 49 32 53C25 49 19 43 19 35V22Z" fill="#F97316" stroke="#C2410C" strokeWidth="1.2" />

            {/* Glowing Golden Kundal (Sunburst Earrings) */}
            <g>
              <circle cx="16" cy="30" r="3.5" fill="#FDE047" stroke="#D97706" strokeWidth="1" className="animate-pulse" />
              <circle cx="16" cy="30" r="1.5" fill="#EA580C" />
              <line x1="16" y1="24" x2="16" y2="26" stroke="#FDE047" strokeWidth="1.5" />
              <line x1="16" y1="34" x2="16" y2="36" stroke="#FDE047" strokeWidth="1.5" />
              <line x1="10" y1="30" x2="12" y2="30" stroke="#FDE047" strokeWidth="1.5" />
            </g>
            <g>
              <circle cx="48" cy="30" r="3.5" fill="#FDE047" stroke="#D97706" strokeWidth="1" className="animate-pulse" />
              <circle cx="48" cy="30" r="1.5" fill="#EA580C" />
              <line x1="48" y1="24" x2="48" y2="26" stroke="#FDE047" strokeWidth="1.5" />
              <line x1="48" y1="34" x2="48" y2="36" stroke="#FDE047" strokeWidth="1.5" />
              <line x1="52" y1="30" x2="54" y2="30" stroke="#FDE047" strokeWidth="1.5" />
            </g>

            {/* Solar Surya Tilak */}
            <circle cx="32" cy="18" r="2.5" fill="#DC2626" />
            <circle cx="32" cy="18" r="1" fill="#FEF08A" />

            {/* Eyes of Resolute Honor */}
            <circle cx="26.5" cy="27" r="1.5" fill="#18181B" />
            <circle cx="37.5" cy="27" r="1.5" fill="#18181B" />

            {/* Impenetrable Golden Kavach (Chest Armor) with Sun Emblem */}
            <path d="M21 38H43L40 54C35 57 29 57 24 54L21 38Z" fill="#FBBF24" stroke="#B45309" strokeWidth="1.2" />
            <circle cx="32" cy="46" r="4.5" fill="#F59E0B" stroke="#DC2626" strokeWidth="1" />
            <polygon points="32,43 33,45 35,44 34,46 36,48 33,47 32,50 31,47 28,48 30,46 29,44 31,45" fill="#FEF08A" />
          </svg>
        );

      // 4. BHISHMA PITAMAH - Flowing Silver Beard, Patriarch Golden Diadem, Ganga Waves & Bed of Arrows
      case 'char_bhishma':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_18px_rgba(226,232,240,0.95)]`}>
            {/* Celestial Golden Arc & Ganga Wave Motif */}
            <path d="M12 48C18 44 26 44 32 48C38 52 46 52 52 48" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            <path d="M14 52C20 48 26 48 32 52C38 56 44 56 50 52" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

            {/* Grand Vedic Patriarch Diadem / Crown */}
            <polygon points="32,6 40,16 35,18 32,13 29,18 24,16" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <circle cx="32" cy="11" r="2" fill="#0284C7" stroke="#FEF08A" strokeWidth="0.8" />

            {/* Majestic Head with Flowing White/Silver Hair */}
            <path d="M18 20C18 10 24 6 32 6C40 6 46 10 46 20V32C46 34 45 36 43 38C41 34 41 22 41 20C41 12 36 10 32 10C28 10 23 12 23 20C23 22 23 34 21 38C19 36 18 34 18 32V20Z" fill="#F1F5F9" />

            {/* Face */}
            <path d="M23 20C23 13 27 8 32 8C37 8 41 13 41 20V32C41 38 37 42 32 45C27 42 23 38 23 32V20Z" fill="#E2E8F0" />

            {/* Sacred Tripundra Chandan Tilak */}
            <line x1="28" y1="16" x2="36" y2="16" stroke="#FEF08A" strokeWidth="0.8" />
            <line x1="28" y1="18" x2="36" y2="18" stroke="#FEF08A" strokeWidth="0.8" />
            <circle cx="32" cy="17" r="0.8" fill="#DC2626" />

            {/* Deep, Wise & Honorable Eyes */}
            <line x1="26" y1="24" x2="30" y2="24" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="38" y1="24" x2="34" y2="24" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="28" cy="26" r="1.3" fill="#1E293B" />
            <circle cx="36" cy="26" r="1.3" fill="#1E293B" />

            {/* Flowing Long Silvery-White Grand Beard */}
            <path d="M22 30C22 30 26 34 32 34C38 34 42 30 42 30C44 38 42 56 32 60C22 56 20 38 22 30Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M28 34C30 46 34 46 36 34" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M32 34V52" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      // 5. DURYODHANA - Massive Spiked Iron & Gold Gada (Mace) + Blood Ruby Crown + Fierce Villain Glare
      case 'char_duryodhana':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_18px_rgba(220,38,38,0.95)]`}>
            {/* Heavy Spiked Gada resting on shoulder */}
            <g transform="rotate(35 48 20)">
              <rect x="44" y="6" width="8" height="34" rx="2" fill="#71717A" stroke="#DC2626" strokeWidth="1" />
              {/* Spikes on Mace Head */}
              <circle cx="48" cy="12" r="7" fill="#18181B" stroke="#F59E0B" strokeWidth="1.2" />
              <polygon points="48,2 50,7 46,7" fill="#EF4444" />
              <polygon points="48,22 50,17 46,17" fill="#EF4444" />
              <polygon points="38,12 43,14 43,10" fill="#EF4444" />
              <polygon points="58,12 53,14 53,10" fill="#EF4444" />
            </g>

            {/* Warrior Head with Sinister Dark-Gold Crown */}
            <path d="M19 22C19 12 25 7 32 7C39 7 45 12 45 22V36C45 44 39 50 32 54C25 50 19 44 19 36V22Z" fill="#7F1D1D" stroke="#991B1B" strokeWidth="1.2" />
            {/* Sinister Spiked Royal Crown */}
            <polygon points="21,18 24,8 29,15 32,5 35,15 40,8 43,18" fill="#D97706" stroke="#78350F" strokeWidth="1" />
            {/* Large Glowing Blood-Red Ruby in Crown Center */}
            <polygon points="32,7 35,12 32,16 29,12" fill="#EF4444" stroke="#FCA5A5" strokeWidth="0.8" className="animate-pulse" />

            {/* Fierce Angled Eyebrows & Glowing Red Warrior Eyes */}
            <path d="M24 24L30 27" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
            <path d="M40 24L34 27" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
            <circle cx="27" cy="28" r="1.8" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.5" />
            <circle cx="37" cy="28" r="1.8" fill="#EF4444" stroke="#FFFFFF" strokeWidth="0.5" />

            {/* Red War Tilak */}
            <polygon points="32,18 34,25 30,25" fill="#EF4444" />

            {/* Arrogant Mustache & Heavy Spiked Pauldrons */}
            <path d="M24 35C28 37 32 34 32 34C32 34 36 37 40 35C42 34 40 37 37 39C34 41 30 41 27 39C24 37 22 34 24 35Z" fill="#18181B" />
            <path d="M16 46L20 40M48 46L44 40" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            <rect x="18" y="44" width="28" height="12" rx="3" fill="#18181B" stroke="#D97706" strokeWidth="1" />
            <circle cx="32" cy="50" r="3" fill="#EF4444" />
          </svg>
        );

      // 6. DRAUPADI - Sacred Yajna Agni (Fire) Swirls, Royal Maang Tikka, Golden Nath (Nose Ring), Lotus Eyes
      case 'char_draupadi':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_18px_rgba(236,72,153,0.95)]`}>
            {/* Sacred Yajna Fire Aura behind head */}
            <g className="animate-pulse">
              <path d="M32 4C38 12 48 16 44 28C40 22 38 18 32 14C26 18 24 22 20 28C16 16 26 12 32 4Z" fill="#F97316" opacity="0.6" />
              <path d="M32 8C36 14 42 18 39 26C37 22 35 18 32 16C29 18 27 22 25 26C22 18 28 14 32 8Z" fill="#FDE047" opacity="0.8" />
            </g>

            {/* Royal Hair & Head Contour */}
            <path d="M18 24C18 13 24 7 32 7C40 7 46 13 46 24V38C46 47 40 54 32 57C24 54 18 47 18 38V24Z" fill="#BE185D" stroke="#9D174D" strokeWidth="1.2" />

            {/* Dark Lustrous Flowing Hair Framing Face */}
            <path d="M17 22C17 12 23 7 32 7C41 7 47 12 47 22C47 32 44 46 44 46C42 36 41 24 32 24C23 24 22 36 20 46C20 46 17 32 17 22Z" fill="#18181B" />

            {/* Golden Maang Tikka & Vermilion Sindoor */}
            <line x1="32" y1="8" x2="32" y2="18" stroke="#FDE047" strokeWidth="1.5" />
            <circle cx="32" cy="19" r="2.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
            <circle cx="32" cy="19" r="1.2" fill="#E11D48" />
            <circle cx="32" cy="14" r="1" fill="#DC2626" />

            {/* Expressive Lotus Eyes & Crimson Bindi */}
            <path d="M23 28C26 26 29 27 30 30C28 31 25 30 23 28Z" fill="#FFFFFF" />
            <circle cx="26.5" cy="28.5" r="1.3" fill="#18181B" />
            <path d="M41 28C38 26 35 27 34 30C36 31 39 30 41 28Z" fill="#FFFFFF" />
            <circle cx="37.5" cy="28.5" r="1.3" fill="#18181B" />
            <circle cx="32" cy="27" r="1.5" fill="#E11D48" />

            {/* Iconic Golden Nath (Nose Ring) with Pearl Chain to Ear */}
            <circle cx="36" cy="32" r="2" stroke="#FDE047" strokeWidth="1" fill="none" />
            <path d="M37 31C41 30 44 28 46 27" stroke="#FDE047" strokeWidth="0.8" strokeDasharray="1 1" />

            {/* Royal Gold & Magenta Zari Collar */}
            <path d="M22 46C27 52 37 52 42 46" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="32" cy="50" r="2.5" fill="#F43F5E" stroke="#FDE047" strokeWidth="0.8" />
          </svg>
        );

      // 7. BHEEMA - Titan Muscular Frame, Colossal Lightning Mace, Vayu Wind Vortex
      case 'char_bheema':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_18px_rgba(16,185,129,0.95)]`}>
            {/* Swirling Vayu Wind Energy Rings */}
            <circle cx="32" cy="32" r="27" stroke="#10B981" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" className="animate-[spin_8s_linear_infinite]" />

            {/* Colossal Iron Mace (Gada) over Left Shoulder with Lightning Sparks */}
            <g transform="rotate(-35 18 20)">
              <rect x="14" y="6" width="9" height="36" rx="2" fill="#334155" stroke="#10B981" strokeWidth="1" />
              <circle cx="18.5" cy="12" r="8" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
              <polygon points="18.5,1 21,7 16,7" fill="#34D399" />
              <polygon points="7,12 13,14 13,10" fill="#34D399" />
              <polygon points="30,12 24,14 24,10" fill="#34D399" />
              {/* Electric Zap Sparks */}
              <path d="M12 18L16 22L14 26" stroke="#6EE7B7" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* Massive Titan Head & Bullish Neck */}
            <path d="M17 24C17 12 23 7 32 7C41 7 47 12 47 24V38C47 48 41 55 32 58C23 55 17 48 17 38V24Z" fill="#065F46" stroke="#047857" strokeWidth="1.5" />

            {/* Bronze Warrior Torque & Headband */}
            <path d="M18 16H46V20H18V16Z" fill="#D97706" stroke="#78350F" strokeWidth="0.8" />
            <circle cx="32" cy="18" r="2" fill="#10B981" />

            {/* Fierce Titan Brow & Roaring Dark Eyes */}
            <path d="M23 25L30 27" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
            <path d="M41 25L34 27" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
            <circle cx="27" cy="28.5" r="1.8" fill="#F1F5F9" />
            <circle cx="27" cy="28.5" r="1" fill="#0F172A" />
            <circle cx="37" cy="28.5" r="1.8" fill="#F1F5F9" />
            <circle cx="37" cy="28.5" r="1" fill="#0F172A" />

            {/* Thick Heroic Warrior Mustache */}
            <path d="M22 36C27 39 32 34 32 34C32 34 37 39 42 36C44 34 43 38 39 41C34 43 30 43 25 41C21 38 20 34 22 36Z" fill="#0F172A" />

            {/* Tiger Pelt Sash & Heavy Bronze Neckguard */}
            <path d="M19 46C24 53 40 53 45 46" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <line x1="26" y1="48" x2="28" y2="52" stroke="#78350F" strokeWidth="1.5" />
            <line x1="36" y1="48" x2="38" y2="52" stroke="#78350F" strokeWidth="1.5" />
          </svg>
        );

      // 8. SHAKUNI - Enchanted Ivory Dice (Pasha) with Dark Purple Occult Mist, Crooked Cap, Scheming Smirk
      case 'char_shakuni':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_18px_rgba(147,51,234,0.95)]`}>
            {/* Swirling Dark Purple Occult Smoke */}
            <path d="M12 28C10 18 16 10 24 12C32 14 36 6 44 10C52 14 54 24 50 32C46 40 50 50 42 54C34 58 24 54 18 48C12 42 14 38 12 28Z" fill="#581C87" opacity="0.35" className="animate-pulse" />

            {/* Floating Enchanted Spiked Ivory Dice (Pasha) on Top Right */}
            <g className="animate-bounce" style={{ transformOrigin: '48px 14px' }}>
              <rect x="42" y="8" width="12" height="12" rx="2" fill="#FAF5FF" stroke="#9333EA" strokeWidth="1.2" />
              {/* Glowing Purple Pips */}
              <circle cx="45" cy="11" r="1.2" fill="#7E22CE" />
              <circle cx="51" cy="11" r="1.2" fill="#7E22CE" />
              <circle cx="48" cy="14" r="1.2" fill="#DC2626" />
              <circle cx="45" cy="17" r="1.2" fill="#7E22CE" />
              <circle cx="51" cy="17" r="1.2" fill="#7E22CE" />
            </g>

            {/* Head Contour */}
            <path d="M20 24C20 14 26 8 33 8C40 8 45 14 45 24V36C45 44 40 51 33 55C26 51 20 44 20 36V24Z" fill="#3B0764" stroke="#7E22CE" strokeWidth="1.2" />

            {/* Crooked Gandhara Royal Turban with Jewel */}
            <path d="M17 18C19 8 30 5 41 8C46 11 47 17 44 22L18 20L17 18Z" fill="#6B21A8" stroke="#F59E0B" strokeWidth="0.8" />
            <circle cx="24" cy="16" r="2.5" fill="#F59E0B" stroke="#4C1D95" strokeWidth="0.8" />
            <circle cx="24" cy="16" r="1" fill="#DC2626" />

            {/* Cunning Squinting Schemer Eyes */}
            <path d="M24 27L30 26" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
            <path d="M40 26L34 27" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="27" cy="29" rx="2" ry="1" fill="#FEF08A" />
            <circle cx="27.5" cy="29" r="0.8" fill="#18181B" />
            <ellipse cx="37" cy="29" rx="2" ry="1" fill="#FEF08A" />
            <circle cx="36.5" cy="29" r="0.8" fill="#18181B" />

            {/* Cunning Crooked Scheming Smirk */}
            <path d="M26 38C29 40 35 41 39 36" stroke="#E9D5FF" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Dark Obsidian Amulet Necklace */}
            <path d="M22 46C27 52 37 52 42 46" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" />
            <polygon points="32,48 35,53 32,56 29,53" fill="#18181B" stroke="#C084FC" strokeWidth="1" />
          </svg>
        );

      // 9. DRONACHARYA - Sage-Guru Beard, Ascetic Topknot with Rudraksha, Glowing Brahmashira Astra Orb
      case 'char_drona':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_18px_rgba(79,70,229,0.95)]`}>
            {/* Brahmashira Astra Glowing Energy Orb in Hand */}
            <g className="animate-pulse" style={{ transformOrigin: '48px 44px' }}>
              <circle cx="48" cy="44" r="8" fill="#4F46E5" fillOpacity="0.45" stroke="#818CF8" strokeWidth="1.5" />
              <circle cx="48" cy="44" r="4" fill="#FEF08A" />
              <line x1="48" y1="34" x2="48" y2="54" stroke="#FDE047" strokeWidth="1" strokeDasharray="1 1" />
              <line x1="38" y1="44" x2="58" y2="44" stroke="#FDE047" strokeWidth="1" strokeDasharray="1 1" />
            </g>

            {/* Ascetic Yogic Topknot (Jata) with Holy Rudraksha Beads */}
            <ellipse cx="32" cy="7" rx="6" ry="4" fill="#312E81" stroke="#D97706" strokeWidth="0.8" />
            <circle cx="28" cy="7" r="1.5" fill="#D97706" />
            <circle cx="32" cy="5" r="1.5" fill="#D97706" />
            <circle cx="36" cy="7" r="1.5" fill="#D97706" />

            {/* Wise Face Contour */}
            <path d="M21 18C21 11 26 8 32 8C38 8 43 11 43 18V30C43 36 38 40 32 42C26 40 21 36 21 30V18Z" fill="#312E81" stroke="#4F46E5" strokeWidth="1.2" />

            {/* Sacred Chandan Tripundra Tilak */}
            <line x1="28" y1="14" x2="36" y2="14" stroke="#FEF08A" strokeWidth="1" />
            <line x1="28" y1="16" x2="36" y2="16" stroke="#FEF08A" strokeWidth="1" />
            <circle cx="32" cy="15" r="1" fill="#DC2626" />

            {/* Calm, Masterful Guru Eyes */}
            <line x1="25" y1="22" x2="29" y2="22" stroke="#C7D2FE" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="39" y1="22" x2="35" y2="22" stroke="#C7D2FE" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="27" cy="24" r="1.3" fill="#EEF2FF" />
            <circle cx="37" cy="24" r="1.3" fill="#EEF2FF" />

            {/* Distinguished Grey-White Sage-Guru Beard */}
            <path d="M22 28C22 28 26 32 32 32C38 32 42 28 42 28C44 36 41 52 32 56C23 52 20 36 22 28Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M28 32C30 42 34 42 36 32" stroke="#94A3B8" strokeWidth="1.2" />

            {/* Holy Saffron-Gold Sacred Thread (Janeu) & Rudraksha Mala */}
            <line x1="20" y1="42" x2="38" y2="58" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="28" cy="49" r="1.4" fill="#D97706" />
          </svg>
        );

      // 10. ASHWATTHAMA - Radiant Celestial Mani Gem on Forehead, Immortality Beams, Battle Cowl & Eyes of Vengeance
      case 'char_ashwatthama':
        return (
          <svg viewBox="0 0 64 64" fill="none" className={`${iconSizes} drop-shadow-[0_0_18px_rgba(6,182,212,0.95)]`}>
            {/* The Legendary Divine Mani Gem Radiance Beams */}
            <g className="animate-pulse">
              <line x1="32" y1="2" x2="32" y2="10" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
              <line x1="22" y1="6" x2="27" y2="12" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="42" y1="6" x2="37" y2="12" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Disheveled Immortal Warrior Head & Hood */}
            <path d="M17 22C17 12 23 7 32 7C41 7 47 12 47 22V36C47 46 41 53 32 57C23 53 17 46 17 36V22Z" fill="#0E7490" stroke="#0891B2" strokeWidth="1.5" />
            {/* Dark Battle Bandana / Headwrap */}
            <path d="M16 18H48V23H16V18Z" fill="#18181B" stroke="#DC2626" strokeWidth="0.8" />

            {/* The Iconic Forehead Divine Mani (Gemstone) */}
            <polygon points="32,13 36,18 32,23 28,18" fill="#22D3EE" stroke="#FEF08A" strokeWidth="1.2" className="animate-pulse" />
            <polygon points="32,15 34,18 32,21 30,18" fill="#FFFFFF" />

            {/* Burning Vengeance Eyes */}
            <path d="M23 27L29 29" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            <path d="M41 27L35 29" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            <circle cx="26.5" cy="30.5" r="1.5" fill="#EF4444" stroke="#FEE2E2" strokeWidth="0.6" />
            <circle cx="37.5" cy="30.5" r="1.5" fill="#EF4444" stroke="#FEE2E2" strokeWidth="0.6" />

            {/* Battle Scars & Resolute Warrior Jaw */}
            <line x1="28" y1="36" x2="30" y2="40" stroke="#DC2626" strokeWidth="1" strokeLinecap="round" />
            <path d="M26 38H38" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />

            {/* Dark Iron Armor marked with Glowing Crimson Runes */}
            <path d="M19 46C25 54 39 54 45 46" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="32" cy="50" r="3" fill="#DC2626" stroke="#22D3EE" strokeWidth="1" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center font-display font-black text-amber-300">
            <Sparkles className={iconSizes} />
          </div>
        );
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '600px',
        transformStyle: 'preserve-3d',
      }}
      className={`relative inline-flex items-center justify-center select-none group cursor-pointer ${className}`}
    >
      {/* 3D Tilting Interactive Outer Container */}
      <div
        style={{
          transform:
            interactive3D && isHovered
              ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.08, 1.08, 1.08)`
              : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        }}
        className={`relative rounded-2xl flex items-center justify-center overflow-visible border-2 transition-all ${sizeClasses}`}
      >
        {/* Dynamic Glowing Halo */}
        <div
          className="absolute -inset-1.5 rounded-2xl opacity-75 blur-md transition-all group-hover:opacity-100 group-hover:blur-lg"
          style={{
            background: `radial-gradient(circle, ${char.glowColor} 0%, transparent 75%)`,
          }}
        />

        {/* Outer Background Card */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-br from-[#12182B] via-[#0C1022] to-[#070913] shadow-xl"
          style={{
            borderColor: isHovered ? char.primaryColor : `${char.primaryColor}55`,
          }}
        >
          {/* Subtle Ambient Radial Highlight */}
          <div
            className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${char.primaryColor}40, transparent 70%)`,
            }}
          />
        </div>

        {/* 3D Vector Icon / Artwork Layer with Elevation */}
        <div
          style={{
            transform: isHovered ? 'translateZ(18px)' : 'translateZ(0px)',
            transition: 'transform 0.2s ease-out',
          }}
          className={`relative z-10 flex items-center justify-center ${animate ? 'animate-pulse' : ''}`}
        >
          {renderCharacterVisual()}
        </div>

        {/* Host Crown Badge */}
        {showBadge && isHost && (
          <div
            title="Room Host"
            className="absolute -top-2.5 -right-2.5 z-20 w-6 h-6 rounded-full bg-amber-500 border-2 border-[#0C1022] shadow-lg flex items-center justify-center text-amber-950 animate-bounce"
          >
            <Crown className="w-3.5 h-3.5 fill-amber-950" />
          </div>
        )}

        {/* Ready Check Badge */}
        {showStatus && isReady && !isHost && (
          <div
            title="Ready"
            className="absolute -bottom-1 -right-1 z-20 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0C1022] shadow-md flex items-center justify-center text-white"
          >
            <ShieldCheck className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
};
