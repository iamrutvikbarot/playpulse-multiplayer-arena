import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string | null;
  type?: 'error' | 'info' | 'success' | 'warning';
  duration?: number;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({
  message,
  type = 'error',
  duration = 4500,
  onClose,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) return;

    setProgress(100);
    const startTime = Date.now();
    const interval = 50;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(timer);
        onClose();
      }
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeStyles = {
    error: {
      border: 'border-rose-500/40',
      glow: 'shadow-[0_10px_30px_rgba(244,63,94,0.2)]',
      iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      progressBar: 'bg-gradient-to-r from-rose-500 to-amber-500',
      icon: AlertCircle,
    },
    warning: {
      border: 'border-amber-500/40',
      glow: 'shadow-[0_10px_30px_rgba(245,158,11,0.2)]',
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      progressBar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
      icon: AlertCircle,
    },
    success: {
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_10px_30px_rgba(16,185,129,0.2)]',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      icon: CheckCircle2,
    },
    info: {
      border: 'border-purple-500/40',
      glow: 'shadow-[0_10px_30px_rgba(168,85,247,0.2)]',
      iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      progressBar: 'bg-gradient-to-r from-purple-500 to-pink-500',
      icon: Info,
    },
  }[type];

  const Icon = typeStyles.icon;

  return (
    <div
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 max-w-sm sm:max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
      id="toast-notification-banner"
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#0B0E1B]/95 backdrop-blur-2xl border ${typeStyles.border} ${typeStyles.glow} p-3.5 sm:p-4 shadow-2xl flex items-start gap-3`}
      >
        {/* Left Status Icon */}
        <div className={`p-2 rounded-xl border ${typeStyles.iconBg} flex-shrink-0 mt-0.5`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs sm:text-sm font-semibold text-zinc-100 leading-snug break-words">
            {message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          id="btn-toast-dismiss"
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1A2238] transition-colors cursor-pointer flex-shrink-0"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Bottom Time-Remaining Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800/40">
          <div
            className={`h-full ${typeStyles.progressBar} transition-all ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
