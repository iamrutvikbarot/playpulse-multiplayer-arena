import { Player, RoomSettings, RPSBattleState, RPSChoice } from '../../src/types/game';
import { GameActionResult, IGameEngine } from './BaseEngine';

export class RPSBattleEngine implements IGameEngine {
  private state!: RPSBattleState;
  private players: Player[] = [];
  private settings!: RoomSettings;

  public init(players: Player[], settings: RoomSettings): RPSBattleState {
    this.players = [...players];
    this.settings = settings;
    const targetRounds = settings.rpsRounds || 5;

    const scores: Record<string, number> = {};
    const streaks: Record<string, number> = {};
    players.forEach((p) => {
      scores[p.id] = 0;
      streaks[p.id] = 0;
    });

    this.state = {
      targetRounds,
      currentRound: 1,
      phase: 'choosing',
      phaseDeadline: Date.now() + 6000,
      scores,
      streaks,
      roundChoices: {},
      revealedChoices: {},
      history: [],
      lastRoundWinnerId: null,
      matchWinnerId: null,
    };

    return this.state;
  }

  public getPublicState(forPlayerId?: string): RPSBattleState {
    // When in choosing or countdown phase, hide opponents' secret choices!
    if (this.state.phase === 'choosing' || this.state.phase === 'countdown') {
      const maskedChoices: Record<string, RPSChoice> = {};
      for (const pid of Object.keys(this.state.roundChoices)) {
        if (pid === forPlayerId) {
          maskedChoices[pid] = this.state.roundChoices[pid];
        } else {
          // Send null or boolean indicated choice locked in
          maskedChoices[pid] = (this.state.roundChoices[pid] ? 'rock' : null) as any; // indicator
        }
      }
      return {
        ...this.state,
        roundChoices: maskedChoices,
      };
    }
    return this.state;
  }

  public reset(): void {
    const scores: Record<string, number> = {};
    const streaks: Record<string, number> = {};
    this.players.forEach((p) => {
      scores[p.id] = 0;
      streaks[p.id] = 0;
    });

    this.state.currentRound = 1;
    this.state.phase = 'choosing';
    this.state.phaseDeadline = Date.now() + 6000;
    this.state.scores = scores;
    this.state.streaks = streaks;
    this.state.roundChoices = {};
    this.state.revealedChoices = {};
    this.state.history = [];
    this.state.lastRoundWinnerId = null;
    this.state.matchWinnerId = null;
  }

  public handleAction(playerId: string, action: { type: string; payload?: any }): GameActionResult {
    if (action.type === 'SELECT_CHOICE') {
      const { choice } = action.payload || {};
      if (this.state.phase !== 'choosing') {
        return { success: false, error: 'Cannot choose right now' };
      }

      if (!['rock', 'paper', 'scissors'].includes(choice)) {
        return { success: false, error: 'Invalid choice' };
      }

      this.state.roundChoices[playerId] = choice;

      // Check if all players have chosen
      const allChosen = this.players.every((p) => this.state.roundChoices[p.id]);
      if (allChosen) {
        this.resolveRound();
      }

      return { success: true, state: this.state, broadcastAll: true };
    }

    return { success: false, error: 'Unknown action' };
  }

  public tick(_deltaMs: number): GameActionResult | null {
    if (this.state.matchWinnerId !== null) return null;

    const now = Date.now();

    // Auto-pick random choice if time expires in choosing phase
    if (this.state.phase === 'choosing' && now > this.state.phaseDeadline) {
      const options: RPSChoice[] = ['rock', 'paper', 'scissors'];
      this.players.forEach((p) => {
        if (!this.state.roundChoices[p.id]) {
          this.state.roundChoices[p.id] = options[Math.floor(Math.random() * options.length)];
        }
      });
      this.resolveRound();
      return { success: true, state: this.state, broadcastAll: true };
    }

    // Progress from revealing to round-result
    if (this.state.phase === 'revealing' && now > this.state.phaseDeadline) {
      this.state.phase = 'round-result';
      this.state.phaseDeadline = now + 2000;
      return { success: true, state: this.state, broadcastAll: true };
    }

    // Progress from round-result to next round or match over
    if (this.state.phase === 'round-result' && now > this.state.phaseDeadline) {
      // Check if anyone reached target score
      const winningThreshold = Math.ceil(this.state.targetRounds / 2);
      let matchWinner: string | null = null;

      for (const p of this.players) {
        if ((this.state.scores[p.id] || 0) >= winningThreshold) {
          matchWinner = p.id;
          break;
        }
      }

      if (matchWinner) {
        this.state.phase = 'match-over';
        this.state.matchWinnerId = matchWinner;
        return {
          success: true,
          state: this.state,
          finishGame: {
            winnerId: matchWinner,
            scores: this.state.scores,
          },
          broadcastAll: true,
        };
      }

      // Next round
      this.state.currentRound += 1;
      this.state.phase = 'choosing';
      this.state.phaseDeadline = now + 6000;
      this.state.roundChoices = {};
      this.state.revealedChoices = {};

      return { success: true, state: this.state, broadcastAll: true };
    }

    return null;
  }

  public onPlayerLeave(playerId: string): GameActionResult | null {
    if (this.state.matchWinnerId === null) {
      const remaining = this.players.find((p) => p.id !== playerId);
      if (remaining) {
        this.state.matchWinnerId = remaining.id;
        this.state.phase = 'match-over';
        return {
          success: true,
          state: this.state,
          finishGame: {
            winnerId: remaining.id,
            scores: this.state.scores,
          },
          broadcastAll: true,
        };
      }
    }
    return null;
  }

  private resolveRound() {
    this.state.revealedChoices = { ...this.state.roundChoices };
    this.state.phase = 'revealing';
    this.state.phaseDeadline = Date.now() + 2500;

    // Evaluate duel for 2 players
    const [p1, p2] = this.players;
    if (p1 && p2) {
      const c1 = this.state.roundChoices[p1.id];
      const c2 = this.state.roundChoices[p2.id];

      let roundWinner: string | 'draw' | null = null;
      if (c1 === c2) {
        roundWinner = 'draw';
      } else if (
        (c1 === 'rock' && c2 === 'scissors') ||
        (c1 === 'scissors' && c2 === 'paper') ||
        (c1 === 'paper' && c2 === 'rock')
      ) {
        roundWinner = p1.id;
        this.state.scores[p1.id] = (this.state.scores[p1.id] || 0) + 1;
        this.state.streaks[p1.id] = (this.state.streaks[p1.id] || 0) + 1;
        this.state.streaks[p2.id] = 0;
      } else {
        roundWinner = p2.id;
        this.state.scores[p2.id] = (this.state.scores[p2.id] || 0) + 1;
        this.state.streaks[p2.id] = (this.state.streaks[p2.id] || 0) + 1;
        this.state.streaks[p1.id] = 0;
      }

      this.state.lastRoundWinnerId = roundWinner;
      this.state.history.push({
        roundNumber: this.state.currentRound,
        choices: { ...this.state.roundChoices },
        winnerId: roundWinner,
      });
    }
  }
}
