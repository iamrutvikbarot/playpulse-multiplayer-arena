import React from 'react';
import { ReactionBurstData } from '../types/game';
import { getCharacterById } from '../utils/characters';

interface ReactionBurstOverlayProps {
  bursts: ReactionBurstData[];
}

export const ReactionBurstOverlay: React.FC<ReactionBurstOverlayProps> = ({ bursts }) => {
  if (!bursts || bursts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {bursts.map((burst) => {
        const char = burst.characterId ? getCharacterById(burst.characterId) : null;
        const xPos = burst.x ?? 50;

        return (
          <div
            key={burst.id}
            style={{
              left: `${xPos}%`,
              bottom: '12%',
              animation: 'floatUpAndFade 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            }}
            className="absolute flex flex-col items-center select-none"
          >
            {/* Emoji with pulse glow */}
            <div className="relative">
              <span className="text-4xl sm:text-5xl filter drop-shadow-[0_0_16px_rgba(234,179,8,0.6)] transform hover:scale-125 transition-transform duration-150 inline-block animate-bounce">
                {burst.emoji}
              </span>
            </div>

            {/* Sender chip */}
            <div
              className="mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-lg backdrop-blur-md border flex items-center gap-1.5 whitespace-nowrap"
              style={{
                backgroundColor: char ? `${char.primaryColor}dd` : 'rgba(15, 23, 42, 0.85)',
                borderColor: char ? `${char.secondaryColor}88` : 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <span>{burst.senderName}</span>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes floatUpAndFade {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.6) rotate(-5deg);
          }
          15% {
            opacity: 1;
            transform: translateY(0) scale(1.15) rotate(5deg);
          }
          30% {
            transform: translateY(-40px) scale(1) rotate(-3deg);
          }
          70% {
            opacity: 0.95;
            transform: translateY(-160px) scale(0.95) rotate(3deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-260px) scale(0.7) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
};
