import React from 'react';
import { Player, RoomState, TicTacToeState } from '../types/game';
import { sound } from '../utils/audio';
import { CharacterAvatar } from '../components/CharacterAvatar';

interface TicTacToeViewProps {
  room: RoomState;
  currentUserId: string;
  onSendAction: (type: string, payload?: any) => void;
}

export const TicTacToeView: React.FC<TicTacToeViewProps> = ({
  room,
  currentUserId,
  onSendAction,
}) => {
  const state = room.gameState as TicTacToeState;
  if (!state) return null;

  const isMyTurn = state.currentTurnPlayerId === currentUserId;
  const mySymbol = state.playerSymbols[currentUserId];
  const gridSize = state.gridSize || 3;

  const currentTurnPlayer = room.players.find((p) => p.id === state.currentTurnPlayerId);

  const handleCellClick = (index: number) => {
    if (!isMyTurn || state.board[index] !== null || state.winnerId !== null) {
      return;
    }
    sound.playMove(mySymbol || 'X');
    onSendAction('MAKE_MOVE', { cellIndex: index });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full">
      {/* Match Info & Scoreboard Bento Bar */}
      <div className="w-full flex items-center justify-between bg-[#0C101C]/90 border border-[#1A2238] rounded-2xl p-4 mb-6 shadow-xl backdrop-blur-sm">
        {room.players.map((p: Player) => {
          const symbol = state.playerSymbols[p.id] || 'X';
          const isTurn = state.currentTurnPlayerId === p.id && !state.winnerId;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                isTurn
                  ? 'bg-purple-600/20 border border-purple-500/60 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                  : 'opacity-80'
              }`}
            >
              <CharacterAvatar characterId={p.characterId} size="md" isHost={p.isHost} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white">{p.name}</span>
                  <span
                    className={`font-mono font-black text-sm px-2 py-0.5 rounded-md ${
                      symbol === 'X'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {symbol}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-medium mt-0.5">
                  Score: <strong className="text-purple-300">{state.scores[p.id] || 0}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Turn Indicator Banner */}
      <div className="mb-6 text-center">
        {state.winnerId ? (
          <div className="text-lg font-black text-amber-400 font-display">
            {state.winnerId === 'draw'
              ? "It's a Draw!"
              : `${room.players.find((p) => p.id === state.winnerId)?.name} wins the round!`}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isMyTurn ? 'bg-cyan-400 animate-ping' : 'bg-zinc-500'
              }`}
            />
            <span className="text-sm font-bold text-zinc-300 font-display">
              {isMyTurn ? (
                <span className="text-cyan-300">Your Turn to play ({mySymbol})</span>
              ) : (
                <span>Waiting for {currentTurnPlayer?.name || 'Opponent'}...</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Bento Tic-Tac-Toe Board Container */}
      <div
        className="relative p-4 rounded-3xl bg-[#0C101C] border border-[#1A2238] shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        style={{ width: 'min(90vw, 360px)', height: 'min(90vw, 360px)' }}
      >
        <div
          className="grid gap-3 w-full h-full"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {state.board.map((cell, idx) => {
            const isWinningCell = state.winningLine?.includes(idx);
            return (
              <button
                key={idx}
                id={`ttt-cell-${idx}`}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || !isMyTurn || state.winnerId !== null}
                className={`relative rounded-2xl flex items-center justify-center font-display font-black text-4xl sm:text-5xl transition-all duration-200 border select-none ${
                  cell === null
                    ? isMyTurn && !state.winnerId
                      ? 'bg-[#111627] hover:bg-[#182035] border-[#1E263D] hover:border-purple-500/50 cursor-pointer shadow-inner'
                      : 'bg-[#090C16] border-[#161D30] opacity-60'
                    : isWinningCell
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-102'
                    : 'bg-[#111627] border-[#1E263D] shadow-md'
                }`}
              >
                {cell === 'X' && (
                  <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-in zoom-in-50 duration-150">
                    ✕
                  </span>
                )}
                {cell === 'O' && (
                  <span className="text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-in zoom-in-50 duration-150">
                    ○
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Branding Credit */}
      <footer className="w-full text-center text-xs text-zinc-500 py-1.5 border-t border-[#1A2238]/60 mt-auto">
        Made with ❤️ and AI by <span className="text-purple-400 font-bold">Rutvik Barot</span>
      </footer>
    </div>
  );
};
