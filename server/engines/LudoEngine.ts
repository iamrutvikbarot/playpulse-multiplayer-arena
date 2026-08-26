import { LudoColor, LudoState, LudoToken, Player, RoomSettings } from '../../src/types/game';
import { GameActionResult, IGameEngine } from './BaseEngine';

const START_OFFSETS: Record<LudoColor, number> = {
  red: 0,
  blue: 13,
  yellow: 26,
  green: 39,
};

const SAFE_TILES = [0, 8, 13, 21, 26, 34, 39, 47];

export class LudoEngine implements IGameEngine {
  private state!: LudoState;
  private players: Player[] = [];
  private settings!: RoomSettings;
  private consecutiveSixes: number = 0;

  public init(players: Player[], settings: RoomSettings): LudoState {
    this.players = [...players];
    this.settings = settings;

    const availableColors: LudoColor[] = ['red', 'green', 'yellow', 'blue'];
    const playerColors: Record<string, LudoColor> = {};
    const colorOrder: LudoColor[] = [];
    const tokens: Record<LudoColor, LudoToken[]> = {
      red: [],
      green: [],
      yellow: [],
      blue: [],
    };

    players.forEach((p, idx) => {
      const color = availableColors[idx % 4];
      playerColors[p.id] = color;
      colorOrder.push(color);
      tokens[color] = [
        { id: 0, color, step: -1, isSafe: true },
        { id: 1, color, step: -1, isSafe: true },
        { id: 2, color, step: -1, isSafe: true },
        { id: 3, color, step: -1, isSafe: true },
      ];
    });

    this.consecutiveSixes = 0;

    this.state = {
      playerColors,
      colorOrder,
      currentColorIndex: 0,
      currentTurnPlayerId: players[0]?.id || '',
      currentDiceValue: null,
      diceRolled: false,
      tokens,
      movableTokenIds: [],
      winnerRankings: [],
      turnDeadline: Date.now() + 20000,
      lastActionText: `${players[0]?.name || 'Player 1'}'s turn to roll the dice!`,
    };

    return this.state;
  }

  public getPublicState(): LudoState {
    return this.state;
  }

  public reset(): void {
    this.init(this.players, this.settings);
  }

  public handleAction(playerId: string, action: { type: string; payload?: any }): GameActionResult {
    if (this.state.winnerRankings.length >= this.players.length - 1 && this.players.length > 1) {
      return { success: false, error: 'Match is complete' };
    }

    if (playerId !== this.state.currentTurnPlayerId) {
      return { success: false, error: 'Not your turn' };
    }

    const playerColor = this.state.playerColors[playerId];

    // 1. ROLL DICE
    if (action.type === 'ROLL_DICE') {
      if (this.state.diceRolled) {
        return { success: false, error: 'Dice already rolled for this turn' };
      }

      // Server generates authoritative random dice roll (1 to 6)
      const dice = Math.floor(Math.random() * 6) + 1;
      this.state.currentDiceValue = dice;
      this.state.diceRolled = true;

      if (dice === 6) {
        this.consecutiveSixes += 1;
      } else {
        this.consecutiveSixes = 0;
      }

      // If rolled 3 consecutive sixes, forfeit turn
      if (this.consecutiveSixes >= 3) {
        this.consecutiveSixes = 0;
        this.state.lastActionText = `${this.getPlayerName(playerId)} rolled 3 sixes in a row! Turn forfeited.`;
        this.nextTurn();
        return { success: true, state: this.state };
      }

      // Calculate movable tokens
      const movableTokens = this.calculateMovableTokens(playerColor, dice);
      this.state.movableTokenIds = movableTokens;

      if (movableTokens.length === 0) {
        // No valid moves possible -> automatically pass turn after brief moment
        this.state.lastActionText = `${this.getPlayerName(playerId)} rolled a ${dice}. No moves available!`;
        this.nextTurn();
      } else if (movableTokens.length === 1) {
        // Only 1 valid move -> auto-move for fast fluid gameplay!
        return this.moveToken(playerId, playerColor, movableTokens[0], dice);
      } else {
        this.state.lastActionText = `${this.getPlayerName(playerId)} rolled a ${dice}! Choose a token to advance.`;
        this.state.turnDeadline = Date.now() + 15000;
      }

      return { success: true, state: this.state };
    }

    // 2. MOVE TOKEN
    if (action.type === 'MOVE_TOKEN') {
      const { tokenId } = action.payload || {};
      if (!this.state.diceRolled || this.state.currentDiceValue === null) {
        return { success: false, error: 'Must roll dice first' };
      }

      if (typeof tokenId !== 'number' || !this.state.movableTokenIds.includes(tokenId)) {
        return { success: false, error: 'Invalid token choice' };
      }

      return this.moveToken(playerId, playerColor, tokenId, this.state.currentDiceValue);
    }

    return { success: false, error: 'Unknown action' };
  }

  private moveToken(playerId: string, color: LudoColor, tokenId: number, dice: number): GameActionResult {
    const token = this.state.tokens[color].find((t) => t.id === tokenId);
    if (!token) {
      return { success: false, error: 'Token not found' };
    }

    let earnedBonusRoll = false;

    if (token.step === -1) {
      // Move from yard to start (step 0)
      token.step = 0;
      token.isSafe = true;
      this.state.lastActionText = `${this.getPlayerName(playerId)} deployed a token to the track!`;
    } else {
      // Advance token
      const oldStep = token.step;
      token.step += dice;

      if (token.step === 57) {
        this.state.lastActionText = `${this.getPlayerName(playerId)} moved a token into the FINISH zone! 🎉`;
        earnedBonusRoll = true;
      } else {
        // Check capture on main circuit
        const absolutePos = this.getAbsoluteTrackTile(color, token.step);
        if (absolutePos !== null && !SAFE_TILES.includes(absolutePos)) {
          // Check if any opponent token sits on this tile
          for (const oppColor of this.state.colorOrder) {
            if (oppColor === color) continue;
            for (const oppToken of this.state.tokens[oppColor]) {
              if (oppToken.step >= 0 && oppToken.step < 52) {
                const oppAbsPos = this.getAbsoluteTrackTile(oppColor, oppToken.step);
                if (oppAbsPos === absolutePos) {
                  // Capture opponent token! Send back to yard!
                  oppToken.step = -1;
                  oppToken.isSafe = true;
                  earnedBonusRoll = true;
                  this.state.lastActionText = `${this.getPlayerName(playerId)} captured an opponent token! 💥 Extra turn granted!`;
                }
              }
            }
          }
        }
      }
    }

    // Check if this player finished all 4 tokens
    const allFinished = this.state.tokens[color].every((t) => t.step === 57);
    if (allFinished && !this.state.winnerRankings.includes(playerId)) {
      this.state.winnerRankings.push(playerId);
      this.state.lastActionText = `🏆 ${this.getPlayerName(playerId)} has completed all tokens!`;

      if (this.state.winnerRankings.length >= 1) {
        return {
          success: true,
          state: this.state,
          finishGame: {
            winnerId: this.state.winnerRankings[0],
            rankings: this.state.winnerRankings,
          },
        };
      }
    }

    // If rolled a 6 or captured or finished a token, player gets another roll!
    if (dice === 6 || earnedBonusRoll) {
      this.state.diceRolled = false;
      this.state.currentDiceValue = null;
      this.state.movableTokenIds = [];
      this.state.turnDeadline = Date.now() + 20000;
    } else {
      this.nextTurn();
    }

    return { success: true, state: this.state };
  }

  private calculateMovableTokens(color: LudoColor, dice: number): number[] {
    const tokens = this.state.tokens[color];
    const movable: number[] = [];

    tokens.forEach((t) => {
      if (t.step === 57) {
        // Already finished
        return;
      }
      if (t.step === -1) {
        // Needs a 6 to leave home
        if (dice === 6) movable.push(t.id);
      } else {
        // Can advance if new step <= 57 (exact finish)
        if (t.step + dice <= 57) {
          movable.push(t.id);
        }
      }
    });

    return movable;
  }

  private getAbsoluteTrackTile(color: LudoColor, step: number): number | null {
    if (step < 0 || step >= 52) return null;
    return (START_OFFSETS[color] + step) % 52;
  }

  private nextTurn() {
    this.state.diceRolled = false;
    this.state.currentDiceValue = null;
    this.state.movableTokenIds = [];

    // Advance to next active player
    let nextIdx = (this.state.currentColorIndex + 1) % this.state.colorOrder.length;
    let attempts = 0;
    while (attempts < this.state.colorOrder.length) {
      const nextColor = this.state.colorOrder[nextIdx];
      const nextPlayer = this.players.find((p) => this.state.playerColors[p.id] === nextColor);
      if (nextPlayer && !this.state.winnerRankings.includes(nextPlayer.id)) {
        this.state.currentColorIndex = nextIdx;
        this.state.currentTurnPlayerId = nextPlayer.id;
        this.state.turnDeadline = Date.now() + 20000;
        this.state.lastActionText = `${nextPlayer.name}'s turn to roll!`;
        return;
      }
      nextIdx = (nextIdx + 1) % this.state.colorOrder.length;
      attempts++;
    }
  }

  public tick(_deltaMs: number): GameActionResult | null {
    if (this.state.winnerRankings.length > 0) return null;

    // Turn timeout -> auto-roll or pass
    if (Date.now() > this.state.turnDeadline) {
      if (!this.state.diceRolled) {
        return this.handleAction(this.state.currentTurnPlayerId, { type: 'ROLL_DICE' });
      } else if (this.state.movableTokenIds.length > 0) {
        return this.handleAction(this.state.currentTurnPlayerId, {
          type: 'MOVE_TOKEN',
          payload: { tokenId: this.state.movableTokenIds[0] },
        });
      } else {
        this.nextTurn();
        return { success: true, state: this.state };
      }
    }

    return null;
  }

  public onPlayerLeave(playerId: string): GameActionResult | null {
    if (playerId === this.state.currentTurnPlayerId) {
      this.nextTurn();
      return { success: true, state: this.state };
    }
    return null;
  }

  private getPlayerName(playerId: string): string {
    return this.players.find((p) => p.id === playerId)?.name || 'Player';
  }
}
