import { Character } from '../types/game';

export const CHARACTERS: Character[] = [
  {
    id: 'char_ironman',
    name: 'Iron Man',
    title: 'Tony Stark',
    primaryColor: '#EF4444', // Crimson Red
    secondaryColor: '#F59E0B', // Gold
    accentBg: 'from-red-600/25 via-amber-500/20 to-transparent',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    description: 'Armored Avenger powered by the Arc Reactor and nano-tech firepower.',
    iconName: 'Zap',
  },
  {
    id: 'char_spiderman',
    name: 'Spider-Man',
    title: 'Peter Parker',
    primaryColor: '#3B82F6', // Cobalt Blue
    secondaryColor: '#EF4444', // Web Red
    accentBg: 'from-blue-600/25 via-red-500/20 to-transparent',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    description: 'Friendly neighborhood wall-crawler with spider-sense and agile webcraft.',
    iconName: 'Flame',
  },
  {
    id: 'char_cap',
    name: 'Captain America',
    title: 'Steve Rogers',
    primaryColor: '#0EA5E9', // Sky Blue
    secondaryColor: '#E2E8F0', // Star Silver
    accentBg: 'from-sky-600/25 via-slate-400/20 to-transparent',
    glowColor: 'rgba(14, 165, 233, 0.45)',
    description: 'First Avenger wielding the indestructible Vibranium Star Shield.',
    iconName: 'Shield',
  },
  {
    id: 'char_thor',
    name: 'Thor',
    title: 'God of Thunder',
    primaryColor: '#F59E0B', // Asgardian Gold
    secondaryColor: '#06B6D4', // Lightning Cyan
    accentBg: 'from-amber-500/25 via-cyan-500/20 to-transparent',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    description: 'Asgardian warrior summoning lightning storms and the mighty Mjolnir.',
    iconName: 'Zap',
  },
  {
    id: 'char_hulk',
    name: 'Hulk',
    title: 'Bruce Banner',
    primaryColor: '#22C55E', // Gamma Green
    secondaryColor: '#A855F7', // Gamma Purple
    accentBg: 'from-green-600/25 via-purple-600/20 to-transparent',
    glowColor: 'rgba(34, 197, 94, 0.45)',
    description: 'Unstoppable gamma powerhouse with earth-shattering smashing power.',
    iconName: 'Flame',
  },
  {
    id: 'char_panther',
    name: 'Black Panther',
    title: "King T'Challa",
    primaryColor: '#A855F7', // Wakandan Violet
    secondaryColor: '#1E293B', // Vibranium Slate
    accentBg: 'from-purple-600/25 via-slate-800/20 to-transparent',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    description: 'Protector of Wakanda equipped with kinetic Vibranium claw armor.',
    iconName: 'Sparkles',
  },
  {
    id: 'char_strange',
    name: 'Doctor Strange',
    title: 'Stephen Strange',
    primaryColor: '#F97316', // Mystic Orange
    secondaryColor: '#E11D48', // Cloak Crimson
    accentBg: 'from-orange-500/25 via-rose-600/20 to-transparent',
    glowColor: 'rgba(249, 115, 22, 0.45)',
    description: 'Sorcerer Supreme casting reality-bending spells with the Eye of Agamotto.',
    iconName: 'Sparkles',
  },
  {
    id: 'char_deadpool',
    name: 'Deadpool',
    title: 'Wade Wilson',
    primaryColor: '#DC2626', // Crimson Red
    secondaryColor: '#18181B', // Stealth Black
    accentBg: 'from-red-600/25 via-zinc-900/40 to-transparent',
    glowColor: 'rgba(220, 38, 38, 0.45)',
    description: 'Merc with a Mouth armed with dual katanas and mutant regeneration.',
    iconName: 'Sword',
  },
  {
    id: 'char_wolverine',
    name: 'Wolverine',
    title: 'Logan',
    primaryColor: '#EAB308', // X-Men Gold
    secondaryColor: '#1D4ED8', // Royal Blue
    accentBg: 'from-yellow-500/25 via-blue-600/20 to-transparent',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    description: 'Fierce mutant brawler equipped with lethal Adamantium claws.',
    iconName: 'Sword',
  },
  {
    id: 'char_scarlet',
    name: 'Scarlet Witch',
    title: 'Wanda Maximoff',
    primaryColor: '#E11D48', // Hex Rose
    secondaryColor: '#7C3AED', // Chaos Violet
    accentBg: 'from-rose-600/25 via-violet-600/20 to-transparent',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    description: 'Chaos magic prodigy manipulating probability and reality.',
    iconName: 'Sparkles',
  },
];

export function getCharacterById(id: string): Character {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}
