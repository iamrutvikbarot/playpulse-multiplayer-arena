export type GameId = 'tic-tac-toe' | 'rps-battle' | 'ludo' | 'card-battle' | 'mini-racing';

export interface Character {
  id: string;
  name: string;
  title: string;
  primaryColor: string;
  secondaryColor: string;
  accentBg: string;
  glowColor: string;
  description: string;
  iconName: string;
}

export interface Player {
  id: string;
  name: string;
  characterId: string;
  isHost: boolean;
  isReady: boolean;
  isBot?: boolean;
  isConnected: boolean;
  score: number;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  characterId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  isEmote?: boolean;
}

export interface RoomSettings {
  maxPlayers: number;
  rpsRounds: 3 | 5 | 7;
  ticTacToeGrid: 3 | 4;
  racingLaps: 2 | 3 | 5;
  turnTimeoutSeconds: number;
}

export interface RoomState {
  code: string;
  hostId: string;
  currentGame: GameId;
  gameStatus: 'lobby' | 'playing' | 'game-over';
  players: Player[];
  settings: RoomSettings;
  chatMessages: ChatMessage[];
  rematchVotes: string[]; // player IDs
  gameState: any; // Game-specific state serialized by server
}

// ----------------------------------------------------
// 1. TIC-TAC-TOE TYPES
// ----------------------------------------------------
export type TTTCell = 'X' | 'O' | null;

export interface TicTacToeState {
  gridSize: 3 | 4;
  board: TTTCell[];
  currentTurnPlayerId: string;
  playerSymbols: Record<string, 'X' | 'O'>;
  winningLine: number[] | null;
  winnerId: string | null; // null, 'draw', or playerId
  round: number;
  scores: Record<string, number>;
  turnDeadline: number;
}

// ----------------------------------------------------
// 2. ROCK PAPER SCISSORS BATTLE TYPES
// ----------------------------------------------------
export type RPSChoice = 'rock' | 'paper' | 'scissors' | null;

export interface RPSRoundResult {
  roundNumber: number;
  choices: Record<string, RPSChoice>;
  winnerId: string | 'draw' | null;
}

export interface RPSBattleState {
  targetRounds: number; // e.g. 5 (first to 3)
  currentRound: number;
  phase: 'countdown' | 'choosing' | 'revealing' | 'round-result' | 'match-over';
  phaseDeadline: number;
  scores: Record<string, number>;
  streaks: Record<string, number>;
  roundChoices: Record<string, RPSChoice>; // hidden until reveal
  revealedChoices: Record<string, RPSChoice>;
  history: RPSRoundResult[];
  lastRoundWinnerId: string | 'draw' | null;
  matchWinnerId: string | null;
}

// ----------------------------------------------------
// 3. LUDO TYPES
// ----------------------------------------------------
export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoToken {
  id: number; // 0, 1, 2, 3
  color: LudoColor;
  step: number; // -1 = home yard, 0..51 = main track, 52..57 = home stretch, 58 = finished
  isSafe: boolean;
}

export interface LudoState {
  playerColors: Record<string, LudoColor>;
  colorOrder: LudoColor[];
  currentColorIndex: number;
  currentTurnPlayerId: string;
  currentDiceValue: number | null;
  diceRolled: boolean;
  tokens: Record<LudoColor, LudoToken[]>;
  movableTokenIds: number[];
  winnerRankings: string[]; // player IDs in order of 1st, 2nd, 3rd
  turnDeadline: number;
  lastActionText?: string;
}

// ----------------------------------------------------
// 4. CARD BATTLE (UNO-STYLE) TYPES
// ----------------------------------------------------
export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
  scoreValue: number;
}

export interface CardBattlePublicState {
  discardTopCard: Card;
  activeColor: CardColor;
  direction: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
  currentTurnPlayerId: string;
  drawPileCount: number;
  playerCardCounts: Record<string, number>;
  unoDeclared: Record<string, boolean>;
  winnerId: string | null;
  turnDeadline: number;
  lastPlayedCard: { playerId: string; card: Card } | null;
  accumulatedDrawCount: number;
}

export interface CardBattlePlayerState extends CardBattlePublicState {
  myHand: Card[];
  validPlayableCardIds: string[];
}

// ----------------------------------------------------
// 5. MINI RACING TYPES
// ----------------------------------------------------
export interface RacerInput {
  steer: number; // -1 (left) to 1 (right)
  accelerate: boolean;
  brake: boolean;
  useItem: boolean;
}

export interface RacerState {
  playerId: string;
  x: number;
  y: number;
  angle: number; // in radians
  speed: number;
  lap: number;
  checkpoint: number;
  finishTime: number | null;
  rank: number;
  activeItem: 'turbo' | 'shield' | 'oil' | null;
  hasShield: boolean;
  isStunnedUntil: number;
  boostUntil: number;
  trailPoints: { x: number; y: number }[];
}

export interface TrackPickup {
  id: string;
  x: number;
  y: number;
  type: 'box' | 'turbo_pad' | 'oil_slick';
  active: boolean;
  respawnTime: number;
}

export interface MiniRacingState {
  totalLaps: number;
  trackId: string;
  raceStatus: 'countdown' | 'racing' | 'finished';
  countdownTimer: number;
  raceStartedAt: number;
  racers: Record<string, RacerState>;
  pickups: TrackPickup[];
  winnerRankings: string[]; // player IDs
}

// ----------------------------------------------------
// WEBSOCKET PROTOCOL TYPES
// ----------------------------------------------------
export type WSMessageType =
  | 'ROOM_JOIN'
  | 'ROOM_CREATE'
  | 'ROOM_LEAVE'
  | 'ROOM_CLOSED'
  | 'PLAYER_LEAVE'
  | 'PLAYER_UPDATE'
  | 'PLAYER_READY'
  | 'BOT_ADD'
  | 'BOT_REMOVE'
  | 'GAME_SELECT'
  | 'GAME_START'
  | 'GAME_ACTION'
  | 'REMATCH_VOTE'
  | 'RETURN_TO_LOBBY'
  | 'CHAT_MESSAGE'
  | 'CHAT_EMOTE'
  | 'PING'
  | 'PONG'
  | 'ROOM_SYNC'
  | 'GAME_SYNC'
  | 'ERROR';

export interface WSMessage<T = any> {
  type: WSMessageType;
  payload: T;
  senderId?: string;
  roomCode?: string;
  timestamp?: number;
}
