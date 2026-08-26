import { GameId } from '../types/game';

export interface GameInfo {
  id: GameId;
  title: string;
  subtitle: string;
  tagline: string;
  minPlayers: number;
  maxPlayers: number;
  duration: string;
  difficulty: 'Casual' | 'Tactical' | 'Fast-Paced';
  accentColor: string;
  gradient: string;
  icon: string;
  rules: string[];
}

export const GAMES_CATALOGUE: Record<GameId, GameInfo> = {
  'tic-tac-toe': {
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    subtitle: 'Classic 3x3 Grid Duel',
    tagline: 'Strategic turn-based duel with fast placement and streak counters.',
    minPlayers: 2,
    maxPlayers: 2,
    duration: '1-2 mins',
    difficulty: 'Casual',
    accentColor: '#06B6D4',
    gradient: 'from-cyan-500/30 via-blue-600/20 to-transparent',
    icon: 'Grid3X3',
    rules: [
      'Take turns placing X or O on the 3x3 grid.',
      'Align 3 marks horizontally, vertically, or diagonally to win.',
      '15-second turn countdown keeps every match dynamic and quick.',
      'Consecutive victory counters track match domination.',
    ],
  },
  'rps-battle': {
    id: 'rps-battle',
    title: 'Rock Paper Scissors',
    subtitle: 'Battle Mode & Series Duel',
    tagline: 'Simultaneous 3-2-1 clash with mind games and best-of-5 tournament rules.',
    minPlayers: 2,
    maxPlayers: 6,
    duration: '2-3 mins',
    difficulty: 'Casual',
    accentColor: '#EC4899',
    gradient: 'from-pink-500/30 via-rose-600/20 to-transparent',
    icon: 'Swords',
    rules: [
      'Both players choose Rock, Paper, or Scissors during the synchronized 3-2-1 timer.',
      'Choices are kept secret until simultaneous countdown reveal.',
      'Rock crushes Scissors, Scissors cuts Paper, Paper covers Rock.',
      'First player to reach the match win score wins the crown!',
    ],
  },
  'ludo': {
    id: 'ludo',
    title: 'Ludo',
    subtitle: 'Classic 15x15 Board Game',
    tagline: 'Authentic 4-color board, dice rolls, safe stars, captures, and home race.',
    minPlayers: 2,
    maxPlayers: 4,
    duration: '5-10 mins',
    difficulty: 'Tactical',
    accentColor: '#F59E0B',
    gradient: 'from-amber-500/30 via-orange-600/20 to-transparent',
    icon: 'Dices',
    rules: [
      'Roll a 6 to deploy a token from your colored home yard onto your starting tile.',
      'Advance tokens clockwise around the 52-tile circuit towards your home stretch.',
      'Land on an opponent on non-safe tiles to capture them back to their yard & earn a bonus turn!',
      'Star tiles and starting bases are Safe Zones where tokens cannot be captured.',
      'Roll a 6, capture a token, or bring a token home to earn an extra dice roll.',
      'First player to safely navigate all 4 tokens into the central home triangle wins!',
    ],
  },
  'card-battle': {
    id: 'card-battle',
    title: 'UNO',
    subtitle: 'Classic Card Game',
    tagline: 'Match colors and numbers, unleash Skips & Draw 4s, and shout UNO to win.',
    minPlayers: 2,
    maxPlayers: 6,
    duration: '3-6 mins',
    difficulty: 'Tactical',
    accentColor: '#10B981',
    gradient: 'from-emerald-500/30 via-teal-600/20 to-transparent',
    icon: 'Layers',
    rules: [
      'Match the top discard pile card by Color (Red, Blue, Green, Yellow) or Number/Symbol.',
      'Action cards shake up play: Skip turn, Reverse direction, and Draw +2 cards.',
      'Wild cards allow you to choose the active color; Wild Draw +4 forces +4 and skips.',
      'Press the vibrant UNO button when down to 1 card to avoid penalty draws!',
      'First player to successfully discard their entire hand wins the game!',
    ],
  },
  'mini-racing': {
    id: 'mini-racing',
    title: 'Formula Mini Racing',
    subtitle: 'Grand Prix Arcade Duel',
    tagline: 'Turbo boost pads, weapon mystery boxes, drifting, and high-speed laps.',
    minPlayers: 2,
    maxPlayers: 8,
    duration: '2-4 mins',
    difficulty: 'Fast-Paced',
    accentColor: '#8B5CF6',
    gradient: 'from-purple-500/30 via-indigo-600/20 to-transparent',
    icon: 'Zap',
    rules: [
      'Steer with Arrow Keys / WASD or responsive on-screen mobile controls.',
      'Drive over glowing Turbo Boost pads for instant acceleration.',
      'Collect Mystery Boxes to deploy Nitrous Boosts, Energy Shields, and Oil Slicks.',
      'Complete all track laps and cross the checkered finish line first!',
    ],
  },
};
