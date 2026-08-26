import { Player, RoomSettings, TicTacToeState, TTTCell } from '../../src/types/game';
import { GameActionResult, IGameEngine } from './BaseEngine';

export class TicTacToeEngine implements IGameEngine {
  private state!: TicTacToeState;
  private players: Player[] = [];
  private settings!: RoomSettings;

  public init(players: Player[], settings: RoomSettings): TicTacToeState {
    this.players = [...players];
    this.settings = settings;
    const gridSize = settings.ticTacToeGrid || 3;
    const totalCells = gridSize * gridSize;

    // Assign X to first player, O to second
    const playerSymbols: Record<string, 'X' | 'O'> = {};
    if (players[0]) playerSymbols[players[0].id] = 'X';
    if (players[1]) playerSymbols[players[1].id] = 'O';

    const scores: Record<string, number> = {};
    players.forEach((p) => {
      scores[p.id] = 0;
    });

    this.state = {
      gridSize,
      board: Array(totalCells).fill(null),
      currentTurnPlayerId: players[0]?.id || '',
      playerSymbols,
      winningLine: null,
      winnerId: null,
      round: 1,
      scores,
      turnDeadline: Date.now() + (settings.turnTimeoutSeconds || 15) * 1000,
    };

    return this.state;
  }

  public getPublicState(): TicTacToeState {
    return this.state;
  }

  public reset(): void {
    const totalCells = this.state.gridSize * this.state.gridSize;
    // Swap starting player each round
    const playerIds = Object.keys(this.state.playerSymbols);
    const prevStarter = playerIds[0];
    const newStarter = this.state.round % 2 === 0 ? playerIds[0] : (playerIds[1] || playerIds[0]);

    this.state.board = Array(totalCells).fill(null);
    this.state.winningLine = null;
    this.state.winnerId = null;
    this.state.round += 1;
    this.state.currentTurnPlayerId = newStarter;
    this.state.turnDeadline = Date.now() + (this.settings.turnTimeoutSeconds || 15) * 1000;
  }

  public handleAction(playerId: string, action: { type: string; payload?: any }): GameActionResult {
    if (action.type === 'MAKE_MOVE') {
      const { cellIndex } = action.payload || {};

      if (this.state.winnerId !== null) {
        return { success: false, error: 'Game is already over' };
      }

      if (playerId !== this.state.currentTurnPlayerId) {
        return { success: false, error: 'Not your turn' };
      }

      if (typeof cellIndex !== 'number' || cellIndex < 0 || cellIndex >= this.state.board.length) {
        return { success: false, error: 'Invalid cell index' };
      }

      if (this.state.board[cellIndex] !== null) {
        return { success: false, error: 'Cell is already occupied' };
      }

      const symbol = this.state.playerSymbols[playerId];
      this.state.board[cellIndex] = symbol;

      // Check win or draw
      const winResult = this.checkWin(this.state.board, this.state.gridSize);

      if (winResult) {
        this.state.winningLine = winResult.line;
        this.state.winnerId = playerId;
        this.state.scores[playerId] = (this.state.scores[playerId] || 0) + 1;

        return {
          success: true,
          state: this.state,
          finishGame: {
            winnerId: playerId,
            scores: this.state.scores,
          },
        };
      }

      // Check draw
      const isBoardFull = this.state.board.every((cell) => cell !== null);
      if (isBoardFull) {
        this.state.winnerId = 'draw';
        return {
          success: true,
          state: this.state,
          finishGame: {
            winnerId: 'draw',
            scores: this.state.scores,
          },
        };
      }

      // Switch turn
      const playerIds = this.players.map((p) => p.id);
      const nextPlayerId = playerIds.find((id) => id !== playerId) || playerId;
      this.state.currentTurnPlayerId = nextPlayerId;
      this.state.turnDeadline = Date.now() + (this.settings.turnTimeoutSeconds || 15) * 1000;

      return { success: true, state: this.state };
    }

    return { success: false, error: 'Unknown action' };
  }

  public tick(_deltaMs: number): GameActionResult | null {
    if (this.state.winnerId !== null) return null;

    // Check if turn timed out -> auto make a random move for player
    if (Date.now() > this.state.turnDeadline) {
      const emptyIndices = this.state.board
        .map((val, idx) => (val === null ? idx : null))
        .filter((val): val is number => val !== null);

      if (emptyIndices.length > 0) {
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        return this.handleAction(this.state.currentTurnPlayerId, {
          type: 'MAKE_MOVE',
          payload: { cellIndex: randomIndex },
        });
      }
    }

    return null;
  }

  public onPlayerLeave(playerId: string): GameActionResult | null {
    if (this.state.winnerId === null) {
      const remaining = this.players.find((p) => p.id !== playerId);
      if (remaining) {
        this.state.winnerId = remaining.id;
        this.state.scores[remaining.id] = (this.state.scores[remaining.id] || 0) + 1;
        return {
          success: true,
          state: this.state,
          finishGame: {
            winnerId: remaining.id,
            scores: this.state.scores,
          },
        };
      }
    }
    return null;
  }

  private checkWin(board: TTTCell[], size: number): { winner: TTTCell; line: number[] } | null {
    // Check rows
    for (let r = 0; r < size; r++) {
      const start = r * size;
      const first = board[start];
      if (first) {
        let allMatch = true;
        const line: number[] = [start];
        for (let c = 1; c < size; c++) {
          line.push(start + c);
          if (board[start + c] !== first) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) return { winner: first, line };
      }
    }

    // Check cols
    for (let c = 0; c < size; c++) {
      const first = board[c];
      if (first) {
        let allMatch = true;
        const line: number[] = [c];
        for (let r = 1; r < size; r++) {
          line.push(r * size + c);
          if (board[r * size + c] !== first) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) return { winner: first, line };
      }
    }

    // Check main diagonal (top-left to bottom-right)
    const firstDiag = board[0];
    if (firstDiag) {
      let allMatch = true;
      const line: number[] = [0];
      for (let i = 1; i < size; i++) {
        line.push(i * size + i);
        if (board[i * size + i] !== firstDiag) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) return { winner: firstDiag, line };
    }

    // Check anti-diagonal (top-right to bottom-left)
    const firstAntiDiag = board[size - 1];
    if (firstAntiDiag) {
      let allMatch = true;
      const line: number[] = [size - 1];
      for (let i = 1; i < size; i++) {
        line.push(i * size + (size - 1 - i));
        if (board[i * size + (size - 1 - i)] !== firstAntiDiag) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) return { winner: firstAntiDiag, line };
    }

    return null;
  }
}
