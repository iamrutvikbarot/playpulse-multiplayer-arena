'use client';

import React, { useEffect, useState } from 'react';
import { Gamepad2, Radio, Sparkles, Zap } from 'lucide-react';

interface ServerLoaderProps {
  isConnecting: boolean;
}

export const ServerLoader: React.FC<ServerLoaderProps> = ({ isConnecting }) => {
  const [tickerIndex, setTickerIndex] = useState(0);

  const tickerMessages = [
    'Connecting to Real-Time WebSocket Gateway...',
    'Synchronizing Multiplayer Arena Nodes...',
    'Loading Marvel Hero Avatars & Assets...',
    'Initializing Game Physics Engines...',
    'Ready for Instant Multiplayer Action!',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [tickerMessages.length]);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#080A12]/90 backdrop-blur-2xl text-zinc-100 select-none animate-in fade-in duration-300">
      {/* Radial Ambient Glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
        {/* Luminous Cyber Arc Reactor Spinner */}
        <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
          {/* Outer Pulsing Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 opacity-30 blur-xl animate-pulse" />

          {/* Outer Counter-Rotating Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 animate-[spin_8s_linear_infinite]" />

          {/* Inner Fast Rotating Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-t-purple-500 border-r-cyan-400 border-b-transparent border-l-transparent animate-[spin_1.5s_cubic-bezier(0.4,0,0.2,1)_infinite]" />

          {/* Glowing Center Orb */}
          <div className="relative w-16 h-16 rounded-2xl bg-[#0E1324] border border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center justify-center group">
            <Zap className="w-8 h-8 text-cyan-400 animate-bounce" />
            <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-spin" />
          </div>
        </div>

        {/* Brand Title */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-extrabold tracking-widest uppercase mb-3">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-ping" />
          PLAYPULSE ARENA
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white mb-2">
          Entering <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">The Arena</span>
        </h2>

        {/* Live Status Ticker */}
        <p className="text-xs sm:text-sm font-medium text-zinc-400 h-6 transition-all duration-300">
          {tickerMessages[tickerIndex]}
        </p>

        {/* Cyber Neon Progress Shimmer Bar */}
        <div className="w-full mt-6 h-1.5 bg-[#161C2E] rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400 to-purple-500 rounded-full animate-[shimmer_1.5s_infinite_linear]" />
        </div>
      </div>
    </div>
  );
};
