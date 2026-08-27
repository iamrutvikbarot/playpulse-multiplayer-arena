import React, { useEffect, useState } from 'react';
import { Shield, Sparkles, Wifi, Zap } from 'lucide-react';

interface ConnectingLoaderProps {
  connecting: boolean;
  connected: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const LOADING_STEPS = [
  'Initializing PlayPulse Arc Matrix...',
  'Connecting to Real-time Game Server...',
  'Calibrating Sub-50ms WebSocket Channel...',
  'Synchronizing Character Roster...',
  'Entering Multiplayer Arena...',
];

export const ConnectingLoader: React.FC<ConnectingLoaderProps> = ({
  connecting,
  connected,
  error,
  onRetry,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [hasInitiallyConnected, setHasInitiallyConnected] = useState(false);

  useEffect(() => {
    if (connected) {
      setProgress(100);
      setHasInitiallyConnected(true);
      return;
    }

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + Math.random() * 8 : prev));
    }, 300);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [connected]);

  // If already connected once, do not show the full screen splash screen
  if (connected || hasInitiallyConnected) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070913]/95 backdrop-blur-xl p-4 transition-all duration-500">
      {/* Ambient glowing backdrop */}
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center space-y-6">
        {/* Kinetic Arc Reactor / Marvel Multiverse Spinner */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Outer Pulsing Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 via-cyan-500 to-pink-500 blur-md opacity-70 animate-pulse" />

          {/* Outer Spinning Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/80 animate-[spin_4s_linear_infinite]" />

          {/* Middle Counter-Spinning Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-purple-400 border-l-transparent animate-[spin_2s_linear_infinite_reverse]" />

          {/* Inner Energy Core */}
          <div className="w-16 h-16 rounded-full bg-[#0C1022] border border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center justify-center relative overflow-hidden">
            {/* Core Arc Beam */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(6,182,212,0.4)_0%,transparent_70%)] animate-ping" />
            <Zap className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_10px_#06B6D4] animate-bounce" />
          </div>

          {/* Orbiting Satellite Particle */}
          <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_8px_#F43F5E] -top-1 left-1/2 -translate-x-1/2" />
          </div>
        </div>

        {/* Branding & Status */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs font-black tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>PLAYPULSE ARENA</span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            {error ? 'CONNECTION PAUSED' : 'INITIALIZING ARENA'}
          </h2>

          <p className="text-xs sm:text-sm text-cyan-300 font-mono font-bold tracking-wide min-h-[20px] transition-all">
            {error ? error : LOADING_STEPS[stepIndex]}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-2">
          <div className="w-full h-2 rounded-full bg-[#12182B] border border-[#1E263D] overflow-hidden p-0.5 relative shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-cyan-400 to-pink-500 transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{ width: `${Math.min(100, Math.round(progress))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-500 px-1">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>WebSocket Sync</span>
            </span>
            <span className="text-purple-300">{Math.min(100, Math.round(progress))}%</span>
          </div>
        </div>

        {/* If Error: Show Retry Button */}
        {error && onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-display font-black shadow-lg shadow-purple-600/40 transition-all cursor-pointer flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>RECONNECT NOW</span>
          </button>
        )}
      </div>
    </div>
  );
};
