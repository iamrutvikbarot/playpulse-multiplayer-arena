import { Player, RoomSettings } from '../../src/types/game';

export interface GameActionResult {
  success: boolean;
  error?: string;
  state?: any;
  finishGame?: {
    winnerId: string | null;
    rankings?: string[];
    scores?: Record<string, number>;
  };
  broadcastAll?: boolean;
}

export interface IGameEngine {
  init(players: Player[], settings: RoomSettings): any;
  handleAction(playerId: string, action: { type: string; payload?: any }): GameActionResult;
  getPublicState(forPlayerId?: string): any;
  tick?(deltaMs: number): GameActionResult | null;
  onPlayerLeave(playerId: string): GameActionResult | null;
  reset(): void;
}
