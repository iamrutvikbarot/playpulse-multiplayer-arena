import confetti from 'canvas-confetti';
import { Award, RotateCcw, Sparkles, Trophy, Users } from 'lucide-react';
import React, { useEffect } from 'react';
import { Player, RoomState } from '../types/game';
import { sound } from '../utils/audio';
import { CharacterAvatar } from './CharacterAvatar';

interface GameResultModalProps {
  room: RoomState;
  currentUserId: string;
  onRematch: () => void;
  onReturnToLobby: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  room,
  currentUserId,
  onRematch,
  onReturnToLobby,
}) => {
  const isGameOver = room.gameStatus === 'game-over';

  // Determine winner or draw
  let winnerId: string | null = null;
  let isDraw = false;

  if (isGameOver) {
    if (room.currentGame === 'tic-tac-toe') {
      winnerId = room.gameState?.winnerId;
      isDraw = winnerId === 'draw';
    } else if (room.currentGame === 'rps-battle') {
      winnerId = room.gameState?.matchWinnerId;
    } else if (room.currentGame === 'ludo') {
      winnerId = room.gameState?.winnerRankings?.[0] || null;
    } else if (room.currentGame === 'card-battle') {
      winnerId = room.gameState?.winnerId;
    } else if (room.currentGame === 'mini-racing') {
      winnerId = room.gameState?.winnerRankings?.[0] || null;
    }
  }

  const winnerPlayer = room.players.find((p) => p.id === winnerId);
  const isMeWinner = Boolean(winnerId && winnerId === currentUserId);
  const hasVotedRematch = room.rematchVotes.includes(currentUserId);

  useEffect(() => {
    if (!isGameOver) return;

    if (isMeWinner) {
      sound.playWin();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4'],
        });
      } catch (e) {}
    } else if (isDraw) {
      sound.playClick();
    } else {
      sound.playDefeat();
    }
  }, [isGameOver, isMeWinner, isDraw]);

  if (!isGameOver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0C101C] border border-[#1A2238] rounded-3xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden"
        id="game-result-card"
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{
            background: isMeWinner
              ? 'radial-gradient(circle, #F59E0B, #8B5CF6)'
              : 'radial-gradient(circle, #3B82F6, #1E293B)',
          }}
        />

        {/* Trophy / Icon Visual */}
        <div className="relative inline-flex items-center justify-center mb-4">
          {isDraw ? (
            <div className="w-20 h-20 rounded-2xl bg-[#111627] border border-[#1E263D] flex items-center justify-center shadow-lg">
              <Award className="w-10 h-10 text-zinc-300" />
            </div>
          ) : isMeWinner ? (
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 border-yellow-200">
                <Trophy className="w-11 h-11 text-black fill-black" />
              </div>
              <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-950 to-purple-900 flex items-center justify-center border border-purple-500/30">
              <Trophy className="w-10 h-10 text-purple-300" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
          {isDraw ? 'MATCH DRAW!' : isMeWinner ? 'VICTORY! 🎉' : `${winnerPlayer?.name || 'Player'} WINS!`}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1 mb-6">
          {isDraw
            ? 'A clash of equal tactical mastery.'
            : isMeWinner
            ? 'Outstanding performance in the arena!'
            : 'Close match! Seek your vengeance in the rematch.'}
        </p>

        {/* Player Ranks & Scores Bento Tile */}
        <div className="bg-[#090C16] border border-[#161D30] rounded-2xl p-4 mb-6 text-left max-h-48 overflow-y-auto">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Arena Standings
          </h3>
          <div className="space-y-2">
            {room.players.map((p: Player, idx: number) => {
              const isWinner = p.id === winnerId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isWinner
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-sm'
                      : 'bg-[#111627] border-[#1E263D] text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold text-zinc-500 w-4">
                      #{idx + 1}
                    </span>
                    <CharacterAvatar characterId={p.characterId} size="sm" />
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-white">
                        {p.name} {p.id === currentUserId ? '(You)' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isWinner && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500 text-black">
                        Winner
                      </span>
                    )}
                    {p.score !== undefined && (
                      <span className="text-xs font-mono font-extrabold bg-[#161D30] px-2 py-1 rounded text-purple-300">
                        {p.score} pts
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls: Rematch & Lobby */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRematch}
            id="btn-rematch"
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              hasVotedRematch
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {hasVotedRematch ? (
              <span>Ready for Rematch ({room.rematchVotes.length})</span>
            ) : (
              <span>Rematch</span>
            )}
          </button>

          <button
            onClick={onReturnToLobby}
            id="btn-return-lobby"
            className="sm:w-auto px-5 py-3 rounded-xl bg-[#111627] hover:bg-[#182035] border border-[#1E263D] text-zinc-200 font-bold text-sm transition-colors cursor-pointer"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};
