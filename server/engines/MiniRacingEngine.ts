import {
  MiniRacingState,
  Player,
  RacerInput,
  RacerState,
  RoomSettings,
  TrackPickup,
} from '../../src/types/game';
import { GameActionResult, IGameEngine } from './BaseEngine';

// Track Waypoints (Width: 1000, Height: 600)
export const TRACK_CHECKPOINTS = [
  { x: 500, y: 100, radius: 80, angle: 0 }, // Start / Finish Line (Top straight)
  { x: 820, y: 140, radius: 100, angle: Math.PI / 4 }, // Top-right curve
  { x: 860, y: 380, radius: 100, angle: Math.PI / 2 }, // Right bend
  { x: 680, y: 500, radius: 90, angle: Math.PI }, // Bottom straight
  { x: 300, y: 480, radius: 90, angle: Math.PI }, // Bottom-left turn
  { x: 140, y: 320, radius: 100, angle: -Math.PI / 2 }, // Left hairpin
  { x: 220, y: 140, radius: 90, angle: -Math.PI / 4 }, // Upper-left chicane
];

export class MiniRacingEngine implements IGameEngine {
  private state!: MiniRacingState;
  private players: Player[] = [];
  private settings!: RoomSettings;
  private playerInputs: Record<string, RacerInput> = {};

  public init(players: Player[], settings: RoomSettings): MiniRacingState {
    this.players = [...players];
    this.settings = settings;
    const totalLaps = settings.racingLaps || 3;

    const racers: Record<string, RacerState> = {};
    this.playerInputs = {};

    // Grid start positions behind start line (x: 500, y: 100) facing right (angle = 0)
    players.forEach((p, idx) => {
      const row = Math.floor(idx / 2);
      const col = idx % 2;
      const startX = 450 - row * 50;
      const startY = 85 + col * 35;

      racers[p.id] = {
        playerId: p.id,
        x: startX,
        y: startY,
        angle: 0,
        speed: 0,
        lap: 1,
        checkpoint: 0,
        finishTime: null,
        rank: idx + 1,
        activeItem: null,
        hasShield: false,
        isStunnedUntil: 0,
        boostUntil: 0,
        trailPoints: [],
      };

      this.playerInputs[p.id] = {
        steer: 0,
        accelerate: false,
        brake: false,
        useItem: false,
      };
    });

    const pickups: TrackPickup[] = [
      { id: 'box_1', x: 700, y: 110, type: 'box', active: true, respawnTime: 0 },
      { id: 'turbo_1', x: 880, y: 260, type: 'turbo_pad', active: true, respawnTime: 0 },
      { id: 'box_2', x: 500, y: 500, type: 'box', active: true, respawnTime: 0 },
      { id: 'turbo_2', x: 130, y: 230, type: 'turbo_pad', active: true, respawnTime: 0 },
    ];

    this.state = {
      totalLaps,
      trackId: 'cyber_circuit_1',
      raceStatus: 'countdown',
      countdownTimer: 3,
      raceStartedAt: Date.now() + 3500,
      racers,
      pickups,
      winnerRankings: [],
    };

    return this.state;
  }

  public getPublicState(): MiniRacingState {
    return this.state;
  }

  public reset(): void {
    this.init(this.players, this.settings);
  }

  public handleAction(playerId: string, action: { type: string; payload?: any }): GameActionResult {
    if (action.type === 'UPDATE_INPUT') {
      const input = action.payload as RacerInput;
      if (input) {
        this.playerInputs[playerId] = {
          steer: Math.max(-1, Math.min(1, Number(input.steer) || 0)),
          accelerate: Boolean(input.accelerate),
          brake: Boolean(input.brake),
          useItem: Boolean(input.useItem),
        };
      }
      return { success: true, state: this.state };
    }

    if (action.type === 'USE_ITEM') {
      const racer = this.state.racers[playerId];
      if (racer && racer.activeItem) {
        this.activateRacerItem(racer);
      }
      return { success: true, state: this.state };
    }

    return { success: false, error: 'Unknown action' };
  }

  private activateRacerItem(racer: RacerState) {
    const item = racer.activeItem;
    racer.activeItem = null;

    if (item === 'turbo') {
      racer.boostUntil = Date.now() + 2500;
      racer.speed = Math.max(racer.speed, 8);
    } else if (item === 'shield') {
      racer.hasShield = true;
      setTimeout(() => {
        if (this.state.racers[racer.playerId]) {
          this.state.racers[racer.playerId].hasShield = false;
        }
      }, 5000);
    } else if (item === 'oil') {
      // Spawn an oil slick behind the racer
      const slickX = racer.x - Math.cos(racer.angle) * 30;
      const slickY = racer.y - Math.sin(racer.angle) * 30;
      this.state.pickups.push({
        id: `oil_${Date.now()}_${Math.random()}`,
        x: slickX,
        y: slickY,
        type: 'oil_slick',
        active: true,
        respawnTime: Date.now() + 15000,
      });
    }
  }

  public tick(deltaMs: number): GameActionResult | null {
    const now = Date.now();

    // Countdown check
    if (this.state.raceStatus === 'countdown') {
      const remaining = Math.max(0, Math.ceil((this.state.raceStartedAt - now) / 1000));
      this.state.countdownTimer = remaining;
      if (now >= this.state.raceStartedAt) {
        this.state.raceStatus = 'racing';
      }
      return { success: true, state: this.state };
    }

    if (this.state.raceStatus !== 'racing') {
      return null;
    }

    const dt = Math.min(deltaMs / 1000, 0.1); // in seconds

    // Update pickups respawn
    this.state.pickups = this.state.pickups.filter((p) => {
      if (p.type === 'oil_slick' && now > p.respawnTime) {
        return false; // Remove expired oil
      }
      if (!p.active && now > p.respawnTime) {
        p.active = true;
      }
      return true;
    });

    // Update physics for each racer
    for (const pid of Object.keys(this.state.racers)) {
      const racer = this.state.racers[pid];
      if (racer.finishTime !== null) continue; // Already finished

      const input = this.playerInputs[pid] || {
        steer: 0,
        accelerate: false,
        brake: false,
        useItem: false,
      };

      if (input.useItem && racer.activeItem) {
        this.activateRacerItem(racer);
        input.useItem = false;
      }

      const isStunned = now < racer.isStunnedUntil;
      const isBoosting = now < racer.boostUntil;

      // Max speeds and acceleration
      let maxSpeed = 5.5;
      let accel = 4.0;
      let friction = 0.96;
      let turnRate = 3.2;

      if (isBoosting) {
        maxSpeed = 8.5;
        accel = 6.5;
      }

      if (isStunned) {
        accel = 0;
        friction = 0.85;
      }

      // Acceleration / Braking
      if (!isStunned) {
        if (input.accelerate) {
          racer.speed = Math.min(maxSpeed, racer.speed + accel * dt);
        } else if (input.brake) {
          racer.speed = Math.max(-2.0, racer.speed - accel * 1.5 * dt);
        } else {
          racer.speed *= friction;
        }

        // Steering (proportional to speed)
        if (Math.abs(racer.speed) > 0.2) {
          const steerDirection = racer.speed >= 0 ? 1 : -1;
          racer.angle += input.steer * turnRate * steerDirection * dt;
        }
      } else {
        racer.speed *= friction;
      }

      // Update position
      racer.x += Math.cos(racer.angle) * racer.speed * 60 * dt;
      racer.y += Math.sin(racer.angle) * racer.speed * 60 * dt;

      // Keep inside bounds
      racer.x = Math.max(40, Math.min(960, racer.x));
      racer.y = Math.max(40, Math.min(560, racer.y));

      // Record trail points for glowing slipstreams
      if (Math.abs(racer.speed) > 1.5) {
        racer.trailPoints.push({ x: racer.x, y: racer.y });
        if (racer.trailPoints.length > 8) {
          racer.trailPoints.shift();
        }
      }

      // Checkpoint and Lap Progression
      const nextCpIdx = (racer.checkpoint + 1) % TRACK_CHECKPOINTS.length;
      const targetCp = TRACK_CHECKPOINTS[nextCpIdx];
      const distToCp = Math.hypot(racer.x - targetCp.x, racer.y - targetCp.y);

      if (distToCp < targetCp.radius) {
        racer.checkpoint = nextCpIdx;

        // Check if lap completed (passed checkpoint 0 after passing last checkpoint)
        if (nextCpIdx === 0) {
          racer.lap += 1;
          if (racer.lap > this.state.totalLaps) {
            // FINISHED RACE!
            racer.finishTime = now - this.state.raceStartedAt;
            this.state.winnerRankings.push(racer.playerId);
            racer.rank = this.state.winnerRankings.length;
          }
        }
      }

      // Check Pickups Collisions
      for (const pickup of this.state.pickups) {
        if (!pickup.active) continue;
        const dist = Math.hypot(racer.x - pickup.x, racer.y - pickup.y);
        if (dist < 28) {
          if (pickup.type === 'box') {
            pickup.active = false;
            pickup.respawnTime = now + 6000;
            if (!racer.activeItem) {
              const items: ('turbo' | 'shield' | 'oil')[] = ['turbo', 'shield', 'oil'];
              racer.activeItem = items[Math.floor(Math.random() * items.length)];
            }
          } else if (pickup.type === 'turbo_pad') {
            racer.boostUntil = now + 1800;
            racer.speed = Math.max(racer.speed, 8.0);
          } else if (pickup.type === 'oil_slick') {
            if (!racer.hasShield) {
              racer.isStunnedUntil = now + 1200;
              racer.speed *= 0.3;
            }
          }
        }
      }
    }

    // Update real-time rankings during race
    const activeRacers = Object.values(this.state.racers);
    activeRacers.sort((a, b) => {
      if (a.finishTime !== null && b.finishTime !== null) return a.finishTime - b.finishTime;
      if (a.finishTime !== null) return -1;
      if (b.finishTime !== null) return 1;
      if (b.lap !== a.lap) return b.lap - a.lap;
      if (b.checkpoint !== a.checkpoint) return b.checkpoint - a.checkpoint;
      // Distance to next checkpoint
      const nextCpIdxA = (a.checkpoint + 1) % TRACK_CHECKPOINTS.length;
      const nextCpIdxB = (b.checkpoint + 1) % TRACK_CHECKPOINTS.length;
      const distA = Math.hypot(
        a.x - TRACK_CHECKPOINTS[nextCpIdxA].x,
        a.y - TRACK_CHECKPOINTS[nextCpIdxA].y
      );
      const distB = Math.hypot(
        b.x - TRACK_CHECKPOINTS[nextCpIdxB].x,
        b.y - TRACK_CHECKPOINTS[nextCpIdxB].y
      );
      return distA - distB;
    });

    activeRacers.forEach((r, idx) => {
      if (r.finishTime === null) {
        r.rank = idx + 1;
      }
    });

    // Check if race complete (either everyone finished or 1st place finished and grace timeout ended)
    const allFinished = Object.values(this.state.racers).every((r) => r.finishTime !== null);
    if (allFinished && this.state.winnerRankings.length > 0) {
      this.state.raceStatus = 'finished';
      return {
        success: true,
        state: this.state,
        finishGame: {
          winnerId: this.state.winnerRankings[0],
          rankings: this.state.winnerRankings,
        },
      };
    }

    return { success: true, state: this.state };
  }

  public onPlayerLeave(playerId: string): GameActionResult | null {
    delete this.state.racers[playerId];
    delete this.playerInputs[playerId];
    return { success: true, state: this.state };
  }
}
