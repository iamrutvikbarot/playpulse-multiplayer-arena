import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  Flame,
  Layers,
  Play,
  RotateCw,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { CharacterAvatar } from '../components/CharacterAvatar';
import {
  Card,
  CardBattlePlayerState,
  CardColor,
  CardValue,
  Player,
  RoomState,
} from '../types/game';
import { sound } from '../utils/audio';

interface CardBattleViewProps {
  room: RoomState;
  currentUserId: string;
  onSendAction: (type: string, payload?: any) => void;
}

const COLOR_MAP: Record<
  CardColor,
  {
    name: string;
    bg: string;
    border: string;
    glow: string;
    text: string;
    hex: string;
    lightHex: string;
  }
> = {
  red: {
    name: 'Red',
    bg: 'bg-[#EF4444]',
    border: 'border-red-400',
    glow: 'rgba(239, 68, 68, 0.6)',
    text: 'text-red-400',
    hex: '#EF4444',
    lightHex: '#FCA5A5',
  },
  blue: {
    name: 'Blue',
    bg: 'bg-[#3B82F6]',
    border: 'border-blue-400',
    glow: 'rgba(59, 130, 246, 0.6)',
    text: 'text-blue-400',
    hex: '#3B82F6',
    lightHex: '#93C5FD',
  },
  green: {
    name: 'Green',
    bg: 'bg-[#10B981]',
    border: 'border-emerald-400',
    glow: 'rgba(16, 185, 129, 0.6)',
    text: 'text-emerald-400',
    hex: '#10B981',
    lightHex: '#6EE7B7',
  },
  yellow: {
    name: 'Yellow',
    bg: 'bg-[#EAB308]',
    border: 'border-amber-300',
    glow: 'rgba(234, 179, 8, 0.6)',
    text: 'text-amber-300',
    hex: '#EAB308',
    lightHex: '#FDE047',
  },
  wild: {
    name: 'Wild',
    bg: 'bg-[#18181B]',
    border: 'border-purple-400',
    glow: 'rgba(168, 85, 247, 0.7)',
    text: 'text-purple-400',
    hex: '#A855F7',
    lightHex: '#E9D5FF',
  },
};

export const CardBattleView: React.FC<CardBattleViewProps> = ({
  room,
  currentUserId,
  onSendAction,
}) => {
  const state = room.gameState as CardBattlePlayerState;
  const [wildCardPending, setWildCardPending] = useState<Card | null>(null);

  if (!state) return null;

  const isMyTurn = state.currentTurnPlayerId === currentUserId;
  const myHand = state.myHand || [];
  const validIds = state.validPlayableCardIds || [];
  const currentTurnPlayer = room.players.find((p) => p.id === state.currentTurnPlayerId);
  const activeColorTheme = COLOR_MAP[state.activeColor] || COLOR_MAP.red;

  const handleCardClick = (card: Card) => {
    if (!isMyTurn || !validIds.includes(card.id)) return;

    if (card.color === 'wild') {
      setWildCardPending(card);
    } else {
      sound.playCardPlay();
      onSendAction('PLAY_CARD', { cardId: card.id });
    }
  };

  const handleChooseWildColor = (chosenColor: CardColor) => {
    if (!wildCardPending) return;
    sound.playCardPlay();
    onSendAction('PLAY_CARD', { cardId: wildCardPending.id, chosenColor });
    setWildCardPending(null);
  };

  const handleDrawCard = () => {
    if (!isMyTurn) return;
    sound.playClick();
    onSendAction('DRAW_CARD');
  };

  const handleDeclareUno = () => {
    sound.playClick();
    onSendAction('DECLARE_UNO');
  };

  // Helper to render authentic UNO card design
  const renderUnoCard = (
    card: Card,
    isInteractive: boolean = false,
    isPlayable: boolean = false,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const isWild = card.color === 'wild';
    const colorInfo = COLOR_MAP[card.color] || COLOR_MAP.red;

    const sizeClasses = {
      sm: 'w-14 h-20 rounded-lg p-1.5 text-[9px]',
      md: 'w-20 h-30 sm:w-22 sm:h-34 rounded-xl p-2 text-xs',
      lg: 'w-28 h-42 sm:w-32 sm:h-48 rounded-2xl p-3 text-sm',
    }[size];

    const centerSymbol =
      card.value === 'draw2'
        ? '+2'
        : card.value === 'wild4'
        ? '+4'
        : card.value === 'skip'
        ? '⊘'
        : card.value === 'reverse'
        ? '⇄'
        : card.value === 'wild'
        ? 'W'
        : card.value;

    const cornerLabel =
      card.value === 'draw2'
        ? '+2'
        : card.value === 'wild4'
        ? '+4'
        : card.value === 'skip'
        ? '⊘'
        : card.value === 'reverse'
        ? '⇄'
        : card.value === 'wild'
        ? '★'
        : card.value;

    return (
      <div
        className={`relative ${sizeClasses} ${
          isWild ? 'bg-slate-900 border-2 border-white/40' : `${colorInfo.bg} border-2 border-white/60`
        } flex flex-col justify-between shadow-xl overflow-hidden select-none transition-all duration-200 ${
          isPlayable
            ? 'ring-4 ring-amber-400 -translate-y-3 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer'
            : isInteractive
            ? 'opacity-60 cursor-not-allowed'
            : ''
        }`}
        style={{
          boxShadow: isPlayable ? `0 0 25px ${colorInfo.glow}` : '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Top-Left Corner Index */}
        <div className="font-display font-black text-white leading-none drop-shadow">
          {cornerLabel}
        </div>

        {/* Center Iconic UNO Oval */}
        <div className="relative w-full h-[60%] my-auto flex items-center justify-center">
          {isWild ? (
            /* 4-Quadrant Color Wild Wheel */
            <div className="w-[85%] h-full rounded-full overflow-hidden border-2 border-white shadow-md grid grid-cols-2 grid-rows-2 -rotate-12">
              <div className="bg-[#EF4444]" />
              <div className="bg-[#3B82F6]" />
              <div className="bg-[#EAB308]" />
              <div className="bg-[#10B981]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-black text-white text-lg sm:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {centerSymbol}
                </span>
              </div>
            </div>
          ) : (
            /* Classic White Oval with bold colored number/symbol */
            <div className="w-[88%] h-full bg-white rounded-full flex items-center justify-center shadow-inner -rotate-12 border border-slate-200/50">
              <span
                className="font-display font-black text-2xl sm:text-3xl drop-shadow-sm"
                style={{ color: colorInfo.hex }}
              >
                {centerSymbol}
              </span>
            </div>
          )}
        </div>

        {/* Bottom-Right Corner Index (Upside Down) */}
        <div className="font-display font-black text-white leading-none self-end rotate-180 drop-shadow">
          {cornerLabel}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-2 sm:p-4 max-w-5xl mx-auto w-full select-none" id="uno-game-arena">
      {/* Top Header: Opponent Status Bento Bar */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto py-2 px-1">
        {room.players.map((p: Player) => {
          const isMe = p.id === currentUserId;
          const isTurn = state.currentTurnPlayerId === p.id;
          const cardCount = isMe ? myHand.length : state.playerCardCounts[p.id] || 0;
          const hasDeclaredUno = state.unoDeclared[p.id];

          return (
            <div
              key={p.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all ${
                isTurn
                  ? 'bg-[#182038] border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-105 ring-2 ring-amber-400/40'
                  : 'bg-[#0C101C] border-[#1A2238] opacity-80'
              }`}
            >
              <CharacterAvatar characterId={p.characterId} size="sm" isHost={p.isHost} animate={isTurn} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[85px]">
                    {p.name}
                  </span>
                  {isMe && (
                    <span className="text-[9px] bg-purple-500/30 text-purple-300 font-bold px-1 rounded">
                      You
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-bold mt-0.5">
                  <Layers className="w-3 h-3 text-purple-400" />
                  <span>{cardCount} cards</span>
                  {cardCount === 1 && (
                    <span className="text-[9px] bg-gradient-to-r from-red-600 to-amber-500 text-white font-black px-1.5 py-0.2 rounded-full animate-bounce shadow-sm">
                      UNO!
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Table Felt: Draw Pile, Discard Pile & Active Color Indicator */}
      <div className="my-auto w-full max-w-2xl bg-[#090C16] border-2 border-[#1A2238] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center gap-5 relative overflow-hidden">
        {/* Ambient Active Color Radial Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none transition-all duration-700 blur-3xl"
          style={{ backgroundColor: activeColorTheme.hex }}
        />

        {/* Turn & Status Bar */}
        <div className="flex items-center justify-between w-full z-10">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase font-display flex items-center gap-1.5 shadow-md ${
                isMyTurn
                  ? 'bg-emerald-500 text-black animate-pulse'
                  : 'bg-[#141A2E] text-zinc-300 border border-[#1E263D]'
              }`}
            >
              {isMyTurn ? '⚡ YOUR TURN' : `⏳ ${currentTurnPlayer?.name || 'Player'}'s Turn`}
            </span>

            {/* Rotation Direction */}
            <div
              className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 bg-[#0C101C] border border-[#1A2238] px-2.5 py-1 rounded-full"
              title={`Play direction: ${state.direction === 1 ? 'Clockwise' : 'Counter-Clockwise'}`}
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-purple-400 transition-transform duration-500 ${
                  state.direction === -1 ? '-scale-x-100' : ''
                }`}
              />
              <span>{state.direction === 1 ? 'Clockwise' : 'Counter-CW'}</span>
            </div>
          </div>

          {/* Active Match Color Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C101C] border border-[#1A2238] text-xs font-extrabold text-white shadow">
            <span>Color:</span>
            <div
              className="w-4 h-4 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] border border-white/50"
              style={{ backgroundColor: activeColorTheme.hex }}
            />
            <span style={{ color: activeColorTheme.lightHex }}>{activeColorTheme.name}</span>
          </div>
        </div>

        {/* Piles Center Area */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 z-10 py-2">
          {/* Draw Pile (Authentic UNO Face-Down Card) */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleDrawCard}
              disabled={!isMyTurn}
              id="btn-uno-draw-pile"
              className={`relative w-24 h-36 sm:w-28 sm:h-42 rounded-2xl bg-black border-2 border-red-500/80 flex flex-col items-center justify-center p-3 shadow-2xl transition-all ${
                isMyTurn
                  ? 'hover:scale-105 hover:border-amber-400 ring-4 ring-amber-400/50 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
                  : 'opacity-70 cursor-not-allowed'
              }`}
            >
              {/* Card Back UNO Oval */}
              <div className="w-[85%] h-[60%] bg-[#EF4444] rounded-full border-2 border-white flex items-center justify-center -rotate-25 shadow-inner">
                <span className="font-display font-black text-amber-300 text-xl tracking-tighter drop-shadow-md">
                  UNO
                </span>
              </div>
              <span className="text-[10px] font-black text-zinc-400 font-mono mt-2">
                DRAW ({state.drawPileCount})
              </span>
            </button>
            <span className="text-[11px] font-bold text-zinc-400">Draw Pile</span>
          </div>

          {/* Discard Pile (Top Played Card) */}
          <div className="flex flex-col items-center gap-2">
            {state.discardTopCard ? (
              renderUnoCard(state.discardTopCard, false, false, 'lg')
            ) : (
              <div className="w-28 h-42 rounded-2xl bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center text-xs text-zinc-500">
                Empty
              </div>
            )}
            <span className="text-[11px] font-bold text-zinc-400">Discard Pile</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: My Hand Cards & UNO Call Button */}
      <div className="w-full flex flex-col items-center gap-2 mt-2">
        {/* UNO Shout Button */}
        {(myHand.length === 1 || myHand.length === 2) && (
          <button
            onClick={handleDeclareUno}
            id="btn-declare-uno-shout"
            className="px-6 py-2 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-display font-black text-sm tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-bounce cursor-pointer flex items-center gap-2 border-2 border-white"
          >
            <Flame className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>SHOUT UNO!</span>
          </button>
        )}

        {/* Hand Cards Scrollable Carousel */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-3 px-2">
          {myHand.map((card) => {
            const isPlayable = isMyTurn && validIds.includes(card.id);

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                disabled={!isPlayable}
                id={`uno-hand-card-${card.id}`}
                className="bg-transparent border-0 p-0 transition-transform outline-none"
              >
                {renderUnoCard(card, true, isPlayable, 'md')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Wild Card Color Selection Modal */}
      {wildCardPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0C101C] border-2 border-[#1A2238] rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl">
            <h3 className="text-base font-black text-white font-display mb-1">
              Choose Active Color
            </h3>
            <p className="text-xs text-zinc-400 mb-5">
              Select the color the next player must match:
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              {(['red', 'blue', 'green', 'yellow'] as CardColor[]).map((col) => {
                const info = COLOR_MAP[col];
                return (
                  <button
                    key={col}
                    onClick={() => handleChooseWildColor(col)}
                    id={`btn-choose-color-${col}`}
                    className={`py-3.5 px-4 rounded-2xl font-display font-black text-white text-sm uppercase shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2 ${info.bg} border-2 border-white/60`}
                    style={{ boxShadow: `0 0 15px ${info.glow}` }}
                  >
                    <span>{info.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding Credit */}
      <footer className="w-full text-center text-xs text-zinc-500 py-1.5 border-t border-[#1A2238]/60 mt-auto">
        Made with ❤️ and AI by <span className="text-purple-400 font-bold">Rutvik Barot</span>
      </footer>
    </div>
  );
};

