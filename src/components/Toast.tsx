'use client';

import { Info, X } from 'lucide-react';
import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  duration = 4500,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#0E1322]/95 border border-[#252F4A] shadow-[0_10px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-xl text-zinc-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400">
            <Info className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-zinc-200 truncate">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
