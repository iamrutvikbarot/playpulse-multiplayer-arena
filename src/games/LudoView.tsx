import { Award, ChevronRight, Crown, Dices, RotateCcw, Sparkles, Star, Trophy, Users, Volume2, Zap } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { LudoColor, LudoState, LudoToken, Player, RoomState } from '../types/game';
import { sound } from '../utils/audio';

interface LudoViewProps {
  room: RoomState;
  currentUserId: string;
  onSendAction: (type: string, payload?: any) => void;
}

const COLOR_CONFIG: Record<
  LudoColor,
  {
    name: string;
    hex: string;
    bgHex: string;
    borderHex: string;
    lightHex: string;
    glow: string;
    startTile: number;
    homeColumnCoords: [number, number][]; // 5 steps (r, c)
    yardCircleCoords: [number, number][]; // 4 yard circles (r, c)
  }
> = {
  green: {
    name: 'Green',
    hex: '#10B981',
    bgHex: '#064E3B',
    borderHex: '#059669',
    lightHex: '#34D399',
    glow: 'rgba(16, 185, 129, 0.45)',
    startTile: 39,
    homeColumnCoords: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
    yardCircleCoords: [[1.5, 1.5], [1.5, 3.5], [3.5, 1.5], [3.5, 3.5]],
  },
  yellow: {
    name: 'Yellow',
    hex: '#F59E0B',
    bgHex: '#78350F',
    borderHex: '#D97706',
    lightHex: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.45)',
    startTile: 26,
    homeColumnCoords: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
    yardCircleCoords: [[1.5, 10.5], [1.5, 12.5], [3.5, 10.5], [3.5, 12.5]],
  },
  red: {
    name: 'Red',
    hex: '#EF4444',
    bgHex: '#7F1D1D',
    borderHex: '#DC2626',
    lightHex: '#F87171',
    glow: 'rgba(239, 68, 68, 0.45)',
    startTile: 0,
    homeColumnCoords: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
    yardCircleCoords: [[10.5, 1.5], [10.5, 3.5], [12.5, 1.5], [12.5, 3.5]],
  },
  blue: {
    name: 'Blue',
    hex: '#3B82F6',
    bgHex: '#1E3A8A',
    borderHex: '#2563EB',
    lightHex: '#60A5FA',
    glow: 'rgba(59, 130, 246, 0.45)',
    startTile: 13,
    homeColumnCoords: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
    yardCircleCoords: [[10.5, 10.5], [10.5, 12.5], [12.5, 10.5], [12.5, 12.5]],
  },
};

// 52 track coordinate positions in clockwise order around the 15x15 board
const TRACK_COORDINATES: [number, number][] = [
  [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  [14, 7],
  [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  [7, 14],
  [6, 14], [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  [0, 7],
  [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  [7, 0], [8, 0],
];

// Safe tile indices
const SAFE_TILE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

export const LudoView: React.FC<LudoViewProps> = ({
  room,
  currentUserId,
  onSendAction,
}) => {
  const state = room.gameState as LudoState;
  const [rollingAnim, setRollingAnim] = useState(false);

  if (!state) return null;

  const myColor = state.playerColors[currentUserId];
  const isMyTurn = state.currentTurnPlayerId === currentUserId;
  const currentTurnPlayer = room.players.find((p) => p.id === state.currentTurnPlayerId);
  const currentTurnColor = currentTurnPlayer ? state.playerColors[currentTurnPlayer.id] : null;

  const handleRollDice = () => {
    if (!isMyTurn || state.diceRolled) return;
    sound.playDiceRoll();
    setRollingAnim(true);
    setTimeout(() => {
      setRollingAnim(false);
      onSendAction('ROLL_DICE');
    }, 450);
  };

  const handleSelectToken = (tokenId: number) => {
    if (!isMyTurn || !state.diceRolled || !state.movableTokenIds.includes(tokenId)) return;
    sound.playMove('O');
    onSendAction('MOVE_TOKEN', { tokenId });
  };

  // Helper to compute pixel/grid coordinates of each token
  const getTokenPosition = (color: LudoColor, token: LudoToken): { r: number; c: number; isFinish: boolean } => {
    if (token.step === -1) {
      // In Yard
      const yardCoords = COLOR_CONFIG[color].yardCircleCoords[token.id] || [0, 0];
      return { r: yardCoords[0], c: yardCoords[1], isFinish: false };
    }

    if (token.step === 57) {
      // In Home Center Finish
      const centerOffsets: Record<LudoColor, [number, number]> = {
        green: [6.8, 6.8],
        yellow: [6.8, 7.2],
        red: [7.2, 6.8],
        blue: [7.2, 7.2],
      };
      const coord = centerOffsets[color];
      return { r: coord[0], c: coord[1], isFinish: true };
    }

    if (token.step < 52) {
      // On Main Circuit Track
      const startOffset = COLOR_CONFIG[color].startTile;
      const trackIndex = (startOffset + token.step) % 52;
      const coord = TRACK_COORDINATES[trackIndex];
      return { r: coord[0], c: coord[1], isFinish: false };
    }

    // In Home Column (steps 52 to 56 -> index 0 to 4)
    const homeStepIndex = token.step - 52;
    const homeCoord = COLOR_CONFIG[color].homeColumnCoords[homeStepIndex] || [7, 7];
    return { r: homeCoord[0], c: homeCoord[1], isFinish: false };
  };

  // Render 3D-styled dice pip layout
  const renderDicePips = (val: number | null) => {
    if (val === null) {
      return <Dices className="w-8 h-8 text-zinc-400" />;
    }

    const pipMap: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };

    const activePips = pipMap[val] || [4];

    return (
      <div className="grid grid-cols-3 gap-1 w-8 h-8 p-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center justify-center">
            {activePips.includes(i) && (
              <div className="w-2 h-2 rounded-full bg-slate-900 shadow-inner" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-2 sm:p-4 max-w-5xl mx-auto w-full select-none" id="ludo-arena-view">
      {/* Top Banner: Bento Turn Banner & Action Prompt */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0C101C]/90 border border-[#1A2238] rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {currentTurnPlayer && (
            <CharacterAvatar characterId={currentTurnPlayer.characterId} size="md" isHost={currentTurnPlayer.isHost} animate />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-sm sm:text-base text-white">
                {isMyTurn ? 'Your Turn to Roll!' : `${currentTurnPlayer?.name || 'Player'}'s Turn`}
              </h2>
              {currentTurnColor && (
                <span
                  className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm text-white"
                  style={{ backgroundColor: COLOR_CONFIG[currentTurnColor].hex }}
                >
                  {COLOR_CONFIG[currentTurnColor].name}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              {state.lastActionText || 'Roll the dice to advance your tokens around the board.'}
            </p>
          </div>
        </div>

        {/* Dice Controller */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Animated 3D Dice Display */}
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-slate-200 border-2 border-amber-300 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300 ${
              rollingAnim ? 'rotate-180 scale-110 animate-spin' : ''
            }`}
          >
            {renderDicePips(state.currentDiceValue)}
          </div>

          <button
            onClick={handleRollDice}
            disabled={!isMyTurn || state.diceRolled}
            id="btn-ludo-roll-dice"
            className={`px-5 py-3 rounded-xl font-display font-black text-sm flex items-center gap-2 shadow-lg transition-all ${
              isMyTurn && !state.diceRolled
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse scale-105 cursor-pointer'
                : 'bg-[#111627] border border-[#1E263D] text-zinc-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <Dices className={`w-4 h-4 ${rollingAnim ? 'animate-spin' : ''}`} />
            <span>ROLL DICE</span>
          </button>
        </div>
      </div>

      {/* Main Board Arena Container */}
      <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 my-3">
        {/* Authentic 15x15 Ludo Board Grid */}
        <div
          className="relative w-full max-w-[460px] sm:max-w-[500px] aspect-square bg-[#080B14] border-2 border-[#1E263D] rounded-3xl p-2 sm:p-3 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
          id="ludo-board-grid-container"
        >
          {/* Inner 15x15 SVG/Grid Matrix */}
          <div className="relative w-full h-full grid grid-cols-15 grid-rows-15 bg-[#090C16] border border-[#161D30] rounded-2xl overflow-hidden">
            {/* 1. TOP-LEFT: Green Yard (6x6: r0..5, c0..5) */}
            <div
              className="absolute top-0 left-0 w-[40%] h-[40%] rounded-tl-2xl p-2 flex items-center justify-center border-b-2 border-r-2 border-[#161D30]"
              style={{ backgroundColor: COLOR_CONFIG.green.bgHex }}
            >
              <div className="w-full h-full bg-[#0C101C] rounded-xl border border-emerald-500/40 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="rounded-full border-2 border-emerald-500/60 bg-emerald-950/40 flex items-center justify-center shadow-sm"
                  />
                ))}
              </div>
            </div>

            {/* 2. TOP-RIGHT: Yellow Yard (6x6: r0..5, c9..14) */}
            <div
              className="absolute top-0 right-0 w-[40%] h-[40%] rounded-tr-2xl p-2 flex items-center justify-center border-b-2 border-l-2 border-[#161D30]"
              style={{ backgroundColor: COLOR_CONFIG.yellow.bgHex }}
            >
              <div className="w-full h-full bg-[#0C101C] rounded-xl border border-amber-500/40 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="rounded-full border-2 border-amber-500/60 bg-amber-950/40 flex items-center justify-center shadow-sm"
                  />
                ))}
              </div>
            </div>

            {/* 3. BOTTOM-LEFT: Red Yard (6x6: r9..14, c0..5) */}
            <div
              className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-bl-2xl p-2 flex items-center justify-center border-t-2 border-r-2 border-[#161D30]"
              style={{ backgroundColor: COLOR_CONFIG.red.bgHex }}
            >
              <div className="w-full h-full bg-[#0C101C] rounded-xl border border-red-500/40 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="rounded-full border-2 border-red-500/60 bg-red-950/40 flex items-center justify-center shadow-sm"
                  />
                ))}
              </div>
            </div>

            {/* 4. BOTTOM-RIGHT: Blue Yard (6x6: r9..14, c9..14) */}
            <div
              className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-br-2xl p-2 flex items-center justify-center border-t-2 border-l-2 border-[#161D30]"
              style={{ backgroundColor: COLOR_CONFIG.blue.bgHex }}
            >
              <div className="w-full h-full bg-[#0C101C] rounded-xl border border-blue-500/40 p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="rounded-full border-2 border-blue-500/60 bg-blue-950/40 flex items-center justify-center shadow-sm"
                  />
                ))}
              </div>
            </div>

            {/* 5. CENTER: 3x3 Finish Zone (r6..8, c6..8) */}
            <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-[#080B14] border border-[#1E263D] overflow-hidden flex items-center justify-center z-10">
              {/* Triangular quadrants meeting at center */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Top: Green Triangle */}
                <polygon points="0,0 100,0 50,50" fill="#10B981" fillOpacity="0.85" />
                {/* Right: Yellow Triangle */}
                <polygon points="100,0 100,100 50,50" fill="#F59E0B" fillOpacity="0.85" />
                {/* Bottom: Blue Triangle */}
                <polygon points="100,100 0,100 50,50" fill="#3B82F6" fillOpacity="0.85" />
                {/* Left: Red Triangle */}
                <polygon points="0,100 0,0 50,50" fill="#EF4444" fillOpacity="0.85" />
              </svg>
              {/* Trophy In Center */}
              <div className="absolute w-6 h-6 rounded-full bg-slate-900/90 border border-amber-300 flex items-center justify-center shadow-lg">
                <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
            </div>

            {/* 6. Board Grid Squares (Track & Home Columns) */}
            {Array.from({ length: 15 }).map((_, r) =>
              Array.from({ length: 15 }).map((_, c) => {
                // Yard regions
                const isYard =
                  (r < 6 && c < 6) ||
                  (r < 6 && c > 8) ||
                  (r > 8 && c < 6) ||
                  (r > 8 && c > 8);
                // Center 3x3
                const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;

                if (isYard || isCenter) {
                  return <div key={`${r}-${c}`} className="pointer-events-none" />;
                }

                // Check if this cell is a colored start tile
                const isRedStart = r === 8 && c === 1;
                const isBlueStart = r === 13 && c === 8;
                const isYellowStart = r === 6 && c === 13;
                const isGreenStart = r === 1 && c === 6;

                // Check Home column
                const isRedHomeCol = r === 7 && c >= 1 && c <= 5;
                const isGreenHomeCol = c === 7 && r >= 1 && r <= 5;
                const isYellowHomeCol = r === 7 && c >= 9 && c <= 13;
                const isBlueHomeCol = c === 7 && r >= 9 && r <= 13;

                // Check safe star tiles
                const isSafeTile =
                  (r === 8 && c === 1) ||
                  (r === 12 && c === 6) ||
                  (r === 13 && c === 8) ||
                  (r === 8 && c === 12) ||
                  (r === 6 && c === 13) ||
                  (r === 2 && c === 8) ||
                  (r === 1 && c === 6) ||
                  (r === 6 && c === 2);

                let bgClass = 'bg-[#0E1322]';
                let borderClass = 'border-[#1A2238]';
                let starColor = '#F59E0B';

                if (isRedStart || isRedHomeCol) {
                  bgClass = 'bg-red-950/70';
                  borderClass = 'border-red-600/40';
                  starColor = '#EF4444';
                } else if (isGreenStart || isGreenHomeCol) {
                  bgClass = 'bg-emerald-950/70';
                  borderClass = 'border-emerald-600/40';
                  starColor = '#10B981';
                } else if (isYellowStart || isYellowHomeCol) {
                  bgClass = 'bg-amber-950/70';
                  borderClass = 'border-amber-600/40';
                  starColor = '#F59E0B';
                } else if (isBlueStart || isBlueHomeCol) {
                  bgClass = 'bg-blue-950/70';
                  borderClass = 'border-blue-600/40';
                  starColor = '#3B82F6';
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative border-[0.5px] ${borderClass} ${bgClass} flex items-center justify-center`}
                  >
                    {isSafeTile && (
                      <Star
                        className="w-2.5 h-2.5 opacity-80"
                        style={{ color: starColor, fill: starColor }}
                      />
                    )}
                  </div>
                );
              })
            )}

            {/* 7. Active Player Tokens Overlay on the 15x15 Grid */}
            {state.colorOrder.map((color) => {
              const tokens = state.tokens[color] || [];
              const theme = COLOR_CONFIG[color];

              return tokens.map((token) => {
                const pos = getTokenPosition(color, token);
                const isMovable =
                  isMyTurn && color === myColor && state.movableTokenIds.includes(token.id);

                // Calculate percentage position
                const leftPct = (pos.c / 15) * 100;
                const topPct = (pos.r / 15) * 100;

                return (
                  <button
                    key={`${color}-${token.id}`}
                    id={`token-${color}-${token.id}`}
                    onClick={() => handleSelectToken(token.id)}
                    disabled={!isMovable}
                    className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                      isMovable
                        ? 'cursor-pointer scale-125 ring-4 ring-amber-400 animate-bounce'
                        : 'cursor-default'
                    }`}
                    style={{
                      left: `${leftPct + 100 / 30}%`,
                      top: `${topPct + 100 / 30}%`,
                      width: '5.2%',
                      height: '5.2%',
                      backgroundColor: theme.hex,
                      borderColor: '#FFFFFF',
                      borderWidth: '1.5px',
                      boxShadow: `0 0 10px ${theme.glow}`,
                    }}
                    title={`${color} Token ${token.id + 1} (${token.step === -1 ? 'Yard' : token.step === 57 ? 'Finish' : `Step ${token.step}`})`}
                  >
                    <span className="text-[9px] font-black text-white drop-shadow">
                      {token.step === 57 ? '👑' : token.id + 1}
                    </span>
                  </button>
                );
              });
            })}
          </div>
        </div>

        {/* Players Sidebar Bento Cards */}
        <div className="w-full lg:w-72 flex flex-col gap-2.5">
          <div className="bg-[#0C101C] border border-[#1A2238] rounded-2xl p-3 shadow-lg">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2.5 flex items-center gap-1.5 font-display">
              <Users className="w-3.5 h-3.5 text-purple-400" /> Active Players
            </h3>

            <div className="space-y-2">
              {state.colorOrder.map((color) => {
                const player = room.players.find((p) => state.playerColors[p.id] === color);
                const tokens = state.tokens[color] || [];
                const finishedCount = tokens.filter((t) => t.step === 57).length;
                const isCurrentTurn = state.colorOrder[state.currentColorIndex] === color;
                const theme = COLOR_CONFIG[color];

                return (
                  <div
                    key={color}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isCurrentTurn
                        ? 'bg-[#141A2E] border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                        : 'bg-[#090C16] border-[#161D30]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {player ? (
                          <CharacterAvatar characterId={player.characterId} size="sm" isHost={player.isHost} />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                            ?
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate max-w-[100px]">
                              {player ? player.name : 'Waiting...'}
                            </span>
                            {player?.id === currentUserId && (
                              <span className="text-[9px] bg-purple-500/30 text-purple-300 font-bold px-1 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <span
                            className="text-[10px] font-black uppercase"
                            style={{ color: theme.lightHex }}
                          >
                            {theme.name} Team
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="text-right">
                        <div className="text-xs font-mono font-black text-white">
                          {finishedCount} / 4
                        </div>
                        <span className="text-[9px] text-zinc-500 font-semibold">Home</span>
                      </div>
                    </div>

                    {/* Token Mini-Indicator Bar */}
                    <div className="grid grid-cols-4 gap-1.5 mt-2 pt-2 border-t border-[#161D30]">
                      {tokens.map((token) => {
                        const isMovable =
                          isMyTurn && color === myColor && state.movableTokenIds.includes(token.id);

                        return (
                          <button
                            key={token.id}
                            onClick={() => handleSelectToken(token.id)}
                            disabled={!isMovable}
                            className={`py-1 rounded text-[9px] font-extrabold flex items-center justify-center transition-all ${
                              token.step === 57
                                ? 'bg-amber-500 text-black shadow-sm font-black'
                                : token.step === -1
                                ? 'bg-[#111627] text-zinc-500'
                                : 'bg-[#182035] text-emerald-300'
                            } ${isMovable ? 'ring-2 ring-amber-400 animate-pulse cursor-pointer' : ''}`}
                            title={`Token ${token.id + 1}: ${token.step === -1 ? 'Yard' : token.step === 57 ? 'Finish' : `Step ${token.step}`}`}
                          >
                            {token.step === 57 ? '👑' : token.step === -1 ? 'Y' : token.step}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding Credit */}
      <footer className="w-full text-center text-xs text-zinc-500 py-1.5 border-t border-[#1A2238]/60 mt-auto">
        Made with ❤️ and AI by <span className="text-purple-400 font-bold">Rutvik Barot</span>
      </footer>
    </div>
  );
};

