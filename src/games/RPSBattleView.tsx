import { Flame, Shield, Sparkles, Swords } from 'lucide-react';
import React from 'react';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { Player, RoomState, RPSBattleState, RPSChoice } from '../types/game';
import { sound } from '../utils/audio';

interface RPSBattleViewProps {
  room: RoomState;
  currentUserId: string;
  onSendAction: (type: string, payload?: any) => void;
}

const CHOICES: { id: RPSChoice; label: string; icon: string; beats: string; color: string }[] = [
  { id: 'rock', label: 'ROCK', icon: '✊', beats: 'Crushes Scissors', color: 'from-amber-500 to-orange-600' },
  { id: 'paper', label: 'PAPER', icon: '✋', beats: 'Covers Rock', color: 'from-cyan-500 to-blue-600' },
  { id: 'scissors', label: 'SCISSORS', icon: '✌️', beats: 'Cuts Paper', color: 'from-pink-500 to-rose-600' },
];

export const RPSBattleView: React.FC<RPSBattleViewProps> = ({
  room,
  currentUserId,
  onSendAction,
}) => {
  const state = room.gameState as RPSBattleState;
  if (!state) return null;

  const myChoice = state.roundChoices[currentUserId];
  const targetScore = Math.ceil(state.targetRounds / 2);

  const handleSelect = (choice: RPSChoice) => {
    if (state.phase !== 'choosing' || myChoice) return;
    sound.playClick();
    onSendAction('SELECT_CHOICE', { choice });
  };

  const [p1, p2] = room.players;
  const isP1Me = p1?.id === currentUserId;
  const myPlayer = isP1Me ? p1 : p2;
  const oppPlayer = isP1Me ? p2 : p1;

  const myRevealedChoice = myPlayer ? state.revealedChoices[myPlayer.id] : null;
  const oppRevealedChoice = oppPlayer ? state.revealedChoices[oppPlayer.id] : null;

  const isChoosing = state.phase === 'choosing';
  const isRevealing = state.phase === 'revealing' || state.phase === 'round-result';

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 max-w-2xl mx-auto w-full">
      {/* Top Header: Round info & Score track Bento Bar */}
      <div className="w-full flex items-center justify-between bg-[#0C101C]/90 border border-[#1A2238] rounded-2xl p-4 shadow-xl backdrop-blur-sm">
        {/* My Player */}
        <div className="flex items-center gap-3">
          {myPlayer && <CharacterAvatar characterId={myPlayer.characterId} size="md" />}
          <div>
            <div className="text-xs font-bold text-zinc-400">YOU ({myPlayer?.name})</div>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: targetScore }).map((_, i) => (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < (state.scores[myPlayer?.id || ''] || 0)
                      ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                      : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
            {(state.streaks[myPlayer?.id || ''] || 0) > 1 && (
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mt-0.5">
                <Flame className="w-3 h-3 fill-amber-400" /> {state.streaks[myPlayer?.id || '']}x Streak!
              </div>
            )}
          </div>
        </div>

        {/* Center Target & Round */}
        <div className="text-center px-3 py-1 rounded-xl bg-[#090C16] border border-[#161D30]">
          <div className="text-[11px] font-extrabold text-purple-400 uppercase tracking-widest">
            Round {state.currentRound}
          </div>
          <div className="text-xs font-bold text-zinc-400">
            First to {targetScore} Wins
          </div>
        </div>

        {/* Opponent Player */}
        <div className="flex items-center gap-3 flex-row-reverse text-right">
          {oppPlayer && <CharacterAvatar characterId={oppPlayer.characterId} size="md" />}
          <div>
            <div className="text-xs font-bold text-zinc-400">{oppPlayer?.name || 'Opponent'}</div>
            <div className="flex items-center gap-1 mt-0.5 justify-end">
              {Array.from({ length: targetScore }).map((_, i) => (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < (state.scores[oppPlayer?.id || ''] || 0)
                      ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]'
                      : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
            {(state.streaks[oppPlayer?.id || ''] || 0) > 1 && (
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mt-0.5 justify-end">
                <Flame className="w-3 h-3 fill-amber-400" /> {state.streaks[oppPlayer?.id || '']}x Streak!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center Arena: Clash Reveal or Waiting Status */}
      <div className="my-auto py-6 w-full flex flex-col items-center justify-center">
        {isRevealing ? (
          <div className="flex items-center justify-center gap-6 sm:gap-12 animate-in zoom-in-95 duration-200">
            {/* My Hand */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border-2 border-purple-500 flex items-center justify-center text-5xl sm:text-6xl shadow-[0_0_30px_rgba(147,51,234,0.4)]">
                {myRevealedChoice === 'rock' && '✊'}
                {myRevealedChoice === 'paper' && '✋'}
                {myRevealedChoice === 'scissors' && '✌️'}
              </div>
              <span className="font-display font-extrabold text-sm text-purple-300 uppercase tracking-wider">
                {myRevealedChoice}
              </span>
            </div>

            {/* VS Clash Badge */}
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 text-white shadow-lg animate-pulse">
                <Swords className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-amber-400 uppercase mt-2">
                {state.lastRoundWinnerId === 'draw'
                  ? 'DRAW'
                  : state.lastRoundWinnerId === currentUserId
                  ? 'YOU WON ROUND!'
                  : 'OPPONENT WON!'}
              </span>
            </div>

            {/* Opponent Hand */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-pink-600/30 to-rose-600/30 border-2 border-pink-500 flex items-center justify-center text-5xl sm:text-6xl shadow-[0_0_30px_rgba(236,72,153,0.4)]">
                {oppRevealedChoice === 'rock' && '✊'}
                {oppRevealedChoice === 'paper' && '✋'}
                {oppRevealedChoice === 'scissors' && '✌️'}
              </div>
              <span className="font-display font-extrabold text-sm text-pink-300 uppercase tracking-wider">
                {oppRevealedChoice}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {myChoice ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center text-4xl shadow-lg animate-pulse">
                  {myChoice === 'rock' && '✊'}
                  {myChoice === 'paper' && '✋'}
                  {myChoice === 'scissors' && '✌️'}
                </div>
                <div className="text-sm font-extrabold text-purple-300 font-display">
                  Choice Locked! Waiting for opponent...
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-[#111627] border border-[#1E263D] text-purple-400 animate-bounce">
                  <Swords className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-white font-display">
                  Make Your Secret Move!
                </h3>
                <p className="text-xs text-zinc-400">
                  Select Rock, Paper, or Scissors below
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Selection Bento Cards (Rock, Paper, Scissors) */}
      <div className="w-full grid grid-cols-3 gap-3 sm:gap-4">
        {CHOICES.map((c) => {
          const isSelected = myChoice === c.id;
          return (
            <button
              key={c.id}
              id={`rps-choice-${c.id}`}
              onClick={() => handleSelect(c.id)}
              disabled={!isChoosing || Boolean(myChoice)}
              className={`relative p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 border select-none ${
                isSelected
                  ? 'bg-purple-600/30 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-102'
                  : isChoosing && !myChoice
                  ? 'bg-[#0C101C] hover:bg-[#111627] border-[#1A2238] hover:border-purple-500/50 cursor-pointer shadow-lg hover:-translate-y-1'
                  : 'bg-[#090C16] border-[#161D30] opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-4xl sm:text-5xl drop-shadow-md">{c.icon}</span>
              <span className="font-display font-black text-sm sm:text-base text-white tracking-wider">
                {c.label}
              </span>
              <span className="text-[10px] text-zinc-400 hidden sm:block">
                {c.beats}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Branding Credit */}
      <footer className="w-full text-center text-xs text-zinc-500 py-1.5 border-t border-[#1A2238]/60 mt-auto">
        Made with ❤️ and AI by <span className="text-purple-400 font-bold">Rutvik Barot</span>
      </footer>
    </div>
  );
};
