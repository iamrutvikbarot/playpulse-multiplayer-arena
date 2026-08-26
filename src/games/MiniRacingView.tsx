import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Gauge,
  Play,
  RotateCcw,
  Shield,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { MiniRacingState, Player, RoomState } from '../types/game';
import { sound } from '../utils/audio';
import { getCharacterById } from '../utils/characters';

interface MiniRacingViewProps {
  room: RoomState;
  currentUserId: string;
  onSendAction: (type: string, payload?: any) => void;
}

export const MiniRacingView: React.FC<MiniRacingViewProps> = ({
  room,
  currentUserId,
  onSendAction,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const state = room.gameState as MiniRacingState;

  const inputRef = useRef({
    steer: 0,
    accelerate: false,
    brake: false,
    useItem: false,
  });

  const myRacer = state?.racers?.[currentUserId];

  // Send input changes to server at 30 Hz
  useEffect(() => {
    const interval = setInterval(() => {
      onSendAction('UPDATE_INPUT', inputRef.current);
    }, 35);
    return () => clearInterval(interval);
  }, [onSendAction]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        inputRef.current.accelerate = true;
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        inputRef.current.brake = true;
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        inputRef.current.steer = -1;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        inputRef.current.steer = 1;
      }
      if (['Space', 'KeyE'].includes(e.code)) {
        inputRef.current.useItem = true;
        sound.playBoost();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        inputRef.current.accelerate = false;
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        inputRef.current.brake = false;
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code) && inputRef.current.steer === -1) {
        inputRef.current.steer = 0;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code) && inputRef.current.steer === 1) {
        inputRef.current.steer = 0;
      }
      if (['Space', 'KeyE'].includes(e.code)) {
        inputRef.current.useItem = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 60 FPS HTML5 Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Track dimensions: 1000 x 600
      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Asphalt Background & Grid
      ctx.fillStyle = '#080B14';
      ctx.fillRect(0, 0, w, h);

      // 2. Draw Track Surface (Curved Closed Circuit)
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 110;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#141829'; // Road asphalt

      // Track Path Loop
      ctx.moveTo(500, 100);
      ctx.lineTo(820, 140);
      ctx.arcTo(900, 200, 860, 380, 80);
      ctx.lineTo(860, 380);
      ctx.arcTo(820, 500, 680, 500, 80);
      ctx.lineTo(300, 480);
      ctx.arcTo(120, 460, 140, 320, 80);
      ctx.lineTo(140, 320);
      ctx.arcTo(140, 140, 220, 140, 70);
      ctx.lineTo(220, 140);
      ctx.closePath();
      ctx.stroke();

      // Road Glow Borders
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // 3. Draw Checkered Start / Finish Line
      ctx.save();
      ctx.translate(500, 100);
      ctx.fillStyle = '#ffffff';
      for (let i = -50; i < 50; i += 10) {
        ctx.fillRect(0, i, 8, 5);
      }
      ctx.fillStyle = '#000000';
      for (let i = -45; i < 50; i += 10) {
        ctx.fillRect(8, i, 8, 5);
      }
      ctx.restore();

      // 4. Draw Pickups (Turbo Pads, Mystery Boxes, Oil Slicks)
      if (state?.pickups) {
        state.pickups.forEach((pickup) => {
          if (!pickup.active) return;
          ctx.save();
          ctx.translate(pickup.x, pickup.y);

          if (pickup.type === 'box') {
            // Mystery Item Box
            ctx.fillStyle = '#a855f7';
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 15;
            ctx.fillRect(-12, -12, 24, 24);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', 0, 0);
          } else if (pickup.type === 'turbo_pad') {
            // Turbo Boost Pad
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(12, 0);
            ctx.lineTo(-12, -10);
            ctx.lineTo(-6, 0);
            ctx.lineTo(-12, 10);
            ctx.closePath();
            ctx.fill();
          } else if (pickup.type === 'oil_slick') {
            // Oil puddle
            ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
            ctx.beginPath();
            ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }

      // 5. Draw Racers
      if (state?.racers) {
        for (const pid of Object.keys(state.racers)) {
          const racer = state.racers[pid];
          const player = room.players.find((p) => p.id === pid);
          const char = getCharacterById(player?.characterId || 'char_ironman');
          const isMe = pid === currentUserId;

          ctx.save();

          // Render glowing neon speed trails
          if (racer.trailPoints && racer.trailPoints.length > 1) {
            ctx.beginPath();
            ctx.moveTo(racer.trailPoints[0].x, racer.trailPoints[0].y);
            for (let i = 1; i < racer.trailPoints.length; i++) {
              ctx.lineTo(racer.trailPoints[i].x, racer.trailPoints[i].y);
            }
            ctx.strokeStyle = char.primaryColor;
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }

          ctx.translate(racer.x, racer.y);
          ctx.rotate(racer.angle);

          // Shield visual bubble
          if (racer.hasShield) {
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fill();
          }

          // Nitro flame exhaust
          if (Date.now() < racer.boostUntil) {
            ctx.fillStyle = '#f97316';
            ctx.shadowColor = '#f97316';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(-16, -5);
            ctx.lineTo(-26, 0);
            ctx.lineTo(-16, 5);
            ctx.closePath();
            ctx.fill();
          }

          // Car Body
          ctx.fillStyle = char.primaryColor;
          ctx.shadowColor = isMe ? '#ffffff' : char.primaryColor;
          ctx.shadowBlur = isMe ? 12 : 6;

          // Sleek racecar polygon
          ctx.beginPath();
          ctx.moveTo(16, 0); // Nose
          ctx.lineTo(-12, -9); // Left rear
          ctx.lineTo(-8, 0);
          ctx.lineTo(-12, 9); // Right rear
          ctx.closePath();
          ctx.fill();

          // Cockpit windshield
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(2, 0, 5, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Headlights
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.moveTo(16, -4);
          ctx.lineTo(40, -12);
          ctx.lineTo(40, 12);
          ctx.lineTo(16, 4);
          ctx.closePath();
          ctx.fill();

          ctx.restore();

          // Player Name Label over Car
          ctx.save();
          ctx.fillStyle = isMe ? '#38bdf8' : '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(player?.name || 'Racer', racer.x, racer.y - 20);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [state, room.players, currentUserId]);

  if (!state) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-2 sm:p-4 max-w-5xl mx-auto w-full select-none">
      {/* Top Bento HUD: Speedometer, Lap, Position, Item */}
      <div className="w-full flex items-center justify-between bg-[#0C101C]/90 border border-[#1A2238] rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-sm">
        {/* Position Rank */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
              Rank
            </span>
            <span className="font-display font-black text-xl leading-none">
              #{myRacer?.rank || 1}
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-zinc-400">
              Lap <strong className="text-white">{Math.min(myRacer?.lap || 1, state.totalLaps)}</strong> / {state.totalLaps}
            </div>
            <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
              {state.raceStatus === 'countdown'
                ? `Starting in ${state.countdownTimer}s...`
                : state.raceStatus === 'finished'
                ? 'Race Complete!'
                : 'Accelerate to Win!'}
            </div>
          </div>
        </div>

        {/* Center: Inventory Item Powerup */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 hidden sm:inline">ITEM:</span>
          <button
            onClick={() => onSendAction('USE_ITEM')}
            disabled={!myRacer?.activeItem || state.raceStatus !== 'racing'}
            id="btn-use-item-powerup"
            className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl transition-all ${
              myRacer?.activeItem
                ? 'bg-purple-600 border-purple-400 text-white animate-bounce shadow-[0_0_20px_rgba(168,85,247,0.8)] cursor-pointer'
                : 'bg-[#111627] border-[#1E263D] text-zinc-600'
            }`}
            title="Press SPACE or Tap to Use Item"
          >
            {myRacer?.activeItem === 'turbo' && '⚡'}
            {myRacer?.activeItem === 'shield' && '🛡️'}
            {myRacer?.activeItem === 'oil' && '🛢️'}
            {!myRacer?.activeItem && '—'}
          </button>
        </div>

        {/* Speedometer */}
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-sm font-mono font-black text-white">
              {Math.round((myRacer?.speed || 0) * 22)} <span className="text-[10px] text-zinc-400 font-normal">KM/H</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-bold">ARCADE RADAR</div>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-[5/3] max-w-4xl bg-[#090C16] border border-[#1A2238] rounded-3xl overflow-hidden shadow-2xl my-auto">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          className="w-full h-full block object-contain"
        />

        {/* Countdown Overlay */}
        {state.raceStatus === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <div className="text-6xl sm:text-8xl font-black font-display text-amber-400 animate-ping">
              {state.countdownTimer > 0 ? state.countdownTimer : 'GO!'}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls (D-Pad & Pedals) */}
      <div className="w-full grid grid-cols-2 gap-4 pt-2 md:hidden">
        {/* Steering Left / Right */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={() => (inputRef.current.steer = -1)}
            onTouchEnd={() => (inputRef.current.steer = 0)}
            onMouseDown={() => (inputRef.current.steer = -1)}
            onMouseUp={() => (inputRef.current.steer = 0)}
            id="touch-steer-left"
            className="flex-1 py-4 bg-[#111627] active:bg-purple-600 rounded-2xl border border-[#1E263D] text-white flex items-center justify-center shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            onTouchStart={() => (inputRef.current.steer = 1)}
            onTouchEnd={() => (inputRef.current.steer = 0)}
            onMouseDown={() => (inputRef.current.steer = 1)}
            onMouseUp={() => (inputRef.current.steer = 0)}
            id="touch-steer-right"
            className="flex-1 py-4 bg-[#111627] active:bg-purple-600 rounded-2xl border border-[#1E263D] text-white flex items-center justify-center shadow-lg active:scale-95"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Gas & Brake Pedals */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={() => (inputRef.current.brake = true)}
            onTouchEnd={() => (inputRef.current.brake = false)}
            onMouseDown={() => (inputRef.current.brake = true)}
            onMouseUp={() => (inputRef.current.brake = false)}
            id="touch-brake"
            className="flex-1 py-4 bg-red-950/50 active:bg-red-600 rounded-2xl border border-red-800/50 text-red-300 active:text-white flex items-center justify-center font-bold text-xs shadow-lg active:scale-95"
          >
            BRAKE
          </button>

          <button
            onTouchStart={() => (inputRef.current.accelerate = true)}
            onTouchEnd={() => (inputRef.current.accelerate = false)}
            onMouseDown={() => (inputRef.current.accelerate = true)}
            onMouseUp={() => (inputRef.current.accelerate = false)}
            id="touch-gas"
            className="flex-1 py-4 bg-emerald-950/50 active:bg-emerald-600 rounded-2xl border border-emerald-800/50 text-emerald-300 active:text-white flex items-center justify-center font-bold text-xs shadow-lg active:scale-95"
          >
            GAS
          </button>
        </div>
      </div>
    </div>
  );
};
