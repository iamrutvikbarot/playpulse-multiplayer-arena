import { Character } from '../types/game';

export const CHARACTERS: Character[] = [
  {
    id: 'char_krishna',
    name: 'Shri Krishna',
    title: 'Divine Charioteer & Jagadguru',
    gender: 'male',
    faction: 'Pandava Guide & Celestial',
    weapon: 'Sudarshana Chakra & Divine Bansuri (Flute)',
    origin: 'Dwaraka / Mathura',
    primaryColor: '#38BDF8', // Celestial Sky Blue
    secondaryColor: '#F59E0B', // Golden Pitambari
    accentBg: 'from-sky-500/35 via-amber-500/25 to-transparent',
    glowColor: 'rgba(56, 189, 248, 0.65)',
    description:
      'Supreme Avatara of protection and wisdom, adorned with a vibrant Peacock Feather (Mor Pankh) in his crown, wielding the cosmic spinning Sudarshana Chakra.',
    iconName: 'Sparkles',
  },
  {
    id: 'char_arjuna',
    name: 'Arjuna',
    title: 'Dhanurdhar Partha',
    gender: 'male',
    faction: 'Pandavas (Third Brother)',
    weapon: 'Gandiva Bow & Celestial Divyastras',
    origin: 'Indraprastha',
    primaryColor: '#EAB308', // Radiant Golden Arrow
    secondaryColor: '#3B82F6', // Lightning Blue Astra
    accentBg: 'from-yellow-500/35 via-blue-600/20 to-transparent',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    description:
      'Unrivaled archer of the universe wielding the celestial golden Gandiva Bow, renowned for unflinching concentration and devastating celestial arrows.',
    iconName: 'Zap',
  },
  {
    id: 'char_karna',
    name: 'Karna',
    title: 'Danveer Suryaputra',
    gender: 'male',
    faction: 'Anga Kingdom & Kaurava Ally',
    weapon: 'Vijaya Bow & Divine Kavach-Kundal',
    origin: 'Anga Desh',
    primaryColor: '#F97316', // Blazing Solar Saffron
    secondaryColor: '#FBBF24', // Sun Gold Armor
    accentBg: 'from-orange-500/35 via-amber-500/25 to-transparent',
    glowColor: 'rgba(249, 115, 22, 0.65)',
    description:
      'The unconquerable son of Surya, born with impenetrable golden armor (Kavach) and luminous sunburst earrings (Kundal) radiating pure solar energy.',
    iconName: 'Sun',
  },
  {
    id: 'char_bhishma',
    name: 'Bhishma Pitamah',
    title: 'Ganga Putra & Grand Patriarch',
    gender: 'male',
    faction: 'Kuru Dynasty Elder',
    weapon: 'Divine Celestial Bow & Iccha-Mrityu Boon',
    origin: 'Hastinapur',
    primaryColor: '#E2E8F0', // Silvery White & Ganga Water
    secondaryColor: '#D97706', // Royal Elder Gold
    accentBg: 'from-slate-300/35 via-amber-600/20 to-transparent',
    glowColor: 'rgba(226, 232, 240, 0.65)',
    description:
      'The immortal patriarch with flowing silver-white beard and hair, invincible in combat and blessed with Iccha-Mrityu (the power to choose his time of death).',
    iconName: 'Shield',
  },
  {
    id: 'char_duryodhana',
    name: 'Duryodhana',
    title: 'Kaurava Crown Prince & Mace Titan',
    gender: 'male',
    faction: 'Kauravas (Eldest Brother)',
    weapon: 'Vajra-Hard Spiked Iron Gada (Mace)',
    origin: 'Hastinapur',
    primaryColor: '#DC2626', // Blood Crimson Red
    secondaryColor: '#7F1D1D', // Dark Ruby Spikes
    accentBg: 'from-red-600/35 via-zinc-900/40 to-transparent',
    glowColor: 'rgba(220, 38, 38, 0.65)',
    description:
      'Fierce eldest Kaurava warrior king commanding colossal mace power, crowned with a dark blood-ruby diadem and burning with unyielding ambition.',
    iconName: 'Flame',
  },
  {
    id: 'char_draupadi',
    name: 'Draupadi',
    title: 'Yajnaseni & Panchali',
    gender: 'female',
    faction: 'Pandava Queen',
    weapon: 'Sacred Agni (Fire) Shakti & Aura',
    origin: 'Sacred Sacrificial Altar (Panchala)',
    primaryColor: '#EC4899', // Royal Lotus Magenta & Agni
    secondaryColor: '#F59E0B', // Sacred Gold Zari
    accentBg: 'from-pink-600/35 via-orange-500/25 to-transparent',
    glowColor: 'rgba(236, 72, 153, 0.65)',
    description:
      'Born directly from the sacred sacrificial holy fire, adorned with royal Maang Tikka, golden Nath, and fiery lotus eyes commanding unwavering Dharma.',
    iconName: 'Crown',
  },
  {
    id: 'char_bheema',
    name: 'Bheema',
    title: 'Vrikodara & Son of Vayu',
    gender: 'male',
    faction: 'Pandavas (Second Brother)',
    weapon: 'Colossal Spiked Lightning Gada (Mace)',
    origin: 'Indraprastha',
    primaryColor: '#10B981', // Emerald Titan & Wind Strength
    secondaryColor: '#047857', // Deep Forest Jade
    accentBg: 'from-emerald-600/35 via-teal-900/30 to-transparent',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    description:
      'Titan possessing the strength of ten thousand elephants, swinging a massive spiked iron mace that shatters battlefields with seismic shockwaves.',
    iconName: 'Shield',
  },
  {
    id: 'char_shakuni',
    name: 'Shakuni',
    title: 'Master of Cursed Dice & Illusions',
    gender: 'male',
    faction: 'Gandhara & Kaurava Mastermind',
    weapon: 'Enchanted Ivory Dice (Pasha) & Dark Illusions',
    origin: 'Gandhara Kingdom',
    primaryColor: '#A855F7', // Mystic Poison Violet
    secondaryColor: '#4C1D95', // Shadow Obsidian
    accentBg: 'from-purple-600/35 via-violet-950/40 to-transparent',
    glowColor: 'rgba(168, 85, 247, 0.65)',
    description:
      'Cunning King of Gandhara controlling magical ivory dice (Pasha) enveloped in swirling dark occult mist, outmaneuvering foes through unmatched strategy.',
    iconName: 'Dices',
  },
  {
    id: 'char_drona',
    name: 'Guru Dronacharya',
    title: 'Supreme Royal Archmaster of Divyastras',
    gender: 'male',
    faction: 'Guru of Pandavas & Kauravas',
    weapon: 'Brahmashira Astra & Master Divine Bow',
    origin: 'Bharadwaja Ashram / Hastinapur',
    primaryColor: '#8B5CF6', // Vedic Amethyst & Wisdom
    secondaryColor: '#F59E0B', // Holy Rudraksha Amber
    accentBg: 'from-violet-600/35 via-amber-600/20 to-transparent',
    glowColor: 'rgba(139, 92, 246, 0.6)',
    description:
      'Legendary master teacher of both Pandavas and Kauravas, bearing sage-warrior rudraksha, holding the floating glowing Brahmashira Astra orb.',
    iconName: 'Sparkles',
  },
  {
    id: 'char_ashwatthama',
    name: 'Ashwatthama',
    title: 'Chiranjeevi (The Immortal Warrior)',
    gender: 'male',
    faction: 'Son of Drona & Kaurava General',
    weapon: 'Narayanastra & Forehead Divine Mani Gem',
    origin: 'Hastinapur',
    primaryColor: '#06B6D4', // Mystic Mani Gem Cyan & Crimson
    secondaryColor: '#DC2626', // Burning Vengeance Red
    accentBg: 'from-cyan-600/35 via-red-600/25 to-transparent',
    glowColor: 'rgba(6, 182, 212, 0.65)',
    description:
      'Fierce immortal warrior bearing the radiant celestial Mani gemstone embedded on his forehead, radiating immense protective and destructive energy.',
    iconName: 'Zap',
  },
];

export const getCharacterById = (id?: string): Character => {
  if (!id) return CHARACTERS[0];
  const found = CHARACTERS.find((c) => c.id === id);
  return found || CHARACTERS[0];
};

export const getRandomCharacter = (): Character => {
  const idx = Math.floor(Math.random() * CHARACTERS.length);
  return CHARACTERS[idx];
};

/**
 * Validates whether a given name is an outdated legacy placeholder name
 * so we can migrate it automatically to an authentic character name.
 */
export const isLegacyName = (name?: string): boolean => {
  if (!name) return true;
  const legacyTokens = [
    'iron man',
    'ironman',
    'spider-man',
    'spiderman',
    'captain america',
    'thor',
    'hulk',
    'black panther',
    'doctor strange',
    'scarlet witch',
    'loki',
    'thanos',
    'stark',
    'banner',
    'steve rogers',
    'peter parker',
    'knight',
    'player',
  ];
  const lower = name.trim().toLowerCase();
  return legacyTokens.some((token) => lower === token || lower.includes(token));
};

export const isLegacyHeroName = isLegacyName;
