import {
  Check,
  ChevronRight,
  Copy,
  Flame,
  MessageSquare,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Radio,
  Send,
  Smile,
  Sparkles,
  Swords,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, Player } from '../types/game';
import { getCharacterById } from '../utils/characters';
import { sound } from '../utils/audio';
import { CharacterAvatar } from './CharacterAvatar';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  players: Player[];
  currentUserId: string;
  roomCode?: string;
  onSendMessage: (text: string, isEmote?: boolean) => void;
  onSendReactionBurst: (emoji: string) => void;
  // Video Call props
  isInCall: boolean;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  onStartCall: (withVideo?: boolean) => Promise<boolean>;
  onLeaveCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => Promise<void>;
  connectedPeerCount: number;
}

const REACTION_CATEGORIES = [
  {
    name: 'Astras & Battle',
    icon: '🏹',
    emojis: ['🏹', '⚡', '🔥', '⚔️', '🛡️', '👑', '🕉️', '🐍'],
  },
  {
    name: 'Game Vibe',
    icon: '🎲',
    emojis: ['🏆', '🎲', '💀', '🤯', '🎯', '🚀', '⏱️', '🍿'],
  },
  {
    name: 'Expressions',
    icon: '😄',
    emojis: ['👏', '🤣', '❤️', '👀', '😎', '🙏', '💯', '✨'],
  },
];

const QUICK_BAR_EMOJIS = ['🔥', '⚡', '🏹', '⚔️', '👑', '🤯', '🏆', '🤣', '👏', '💀'];

const QUICK_SHOUTOUTS = [
  'Good Game! ⚔️',
  'Well Played! 🏹',
  'All by Dharma! ✨',
  'Rematch! 🎲',
  'Nice Move! 🧠',
  'Let us battle! 🚀',
];

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  isOpen,
  onClose,
  messages,
  players,
  currentUserId,
  roomCode,
  onSendMessage,
  onSendReactionBurst,
  isInCall,
  isAudioMuted,
  isVideoOff,
  onStartCall,
  onLeaveCall,
  onToggleAudio,
  onToggleVideo,
  connectedPeerCount,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'call'>('chat');
  const [inputText, setInputText] = useState('');
  const [showEmotes, setShowEmotes] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [showQuickShoutouts, setShowQuickShoutouts] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState(() => sound.getMuted());

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen && activeTab === 'chat') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), false);
    setInputText('');
    sound.playClick();
  };

  const handleEmoteClick = (emoji: string) => {
    // Send both as chat emote and animated floating burst
    onSendMessage(emoji, true);
    onSendReactionBurst(emoji);
    sound.playReactionPop();
  };

  const handleShoutoutClick = (shoutout: string) => {
    onSendMessage(shoutout, false);
    sound.playClick();
    setShowQuickShoutouts(false);
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    sound.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyMsg = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    sound.playClick();
    setTimeout(() => setCopiedMsgId(null), 1500);
  };

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setIsSoundMuted(next);
  };

  return (
    <div
      id="room-chat-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#090C16]/98 backdrop-blur-2xl border-l border-[#1E263D] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Header with Room Info & Actions */}
      <div className="p-3.5 border-b border-[#161D30] bg-[#070912] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-display flex items-center gap-1.5">
              <span>Arena Comms</span>
              {isInCall && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </h3>
            {roomCode && (
              <button
                onClick={handleCopyCode}
                className="text-[10px] text-zinc-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer font-mono"
                title="Click to copy room code"
              >
                <span>Room: <strong className="text-amber-400">{roomCode}</strong></span>
                {copiedCode ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-zinc-500" />}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#141A2E] cursor-pointer transition-colors"
            title={isSoundMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Close Drawer */}
          <button
            id="chat-drawer-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#141A2E] cursor-pointer transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs: Chat vs Voice/Video Call */}
      <div className="grid grid-cols-2 p-1.5 bg-[#0D1222] border-b border-[#161D30] gap-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('chat')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Live Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('call')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
            activeTab === 'call'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isInCall ? 'text-emerald-400 animate-pulse' : ''}`} />
          <span>Voice & Video</span>
          {isInCall && (
            <span className="px-1 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">
              Live
            </span>
          )}
        </button>
      </div>

      {/* CALL TAB VIEW */}
      {activeTab === 'call' && (
        <div className="flex-1 p-4 flex flex-col items-center justify-between overflow-y-auto space-y-4">
          <div className="w-full space-y-3">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-[#0D1222] border border-[#1E263D] text-center">
              <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-500/30 flex items-center justify-center mx-auto mb-2 text-purple-400">
                {isInCall ? <Radio className="w-6 h-6 animate-pulse text-emerald-400" /> : <PhoneCall className="w-6 h-6" />}
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                {isInCall ? 'Call Active & Connected' : 'Battle Voice & Video Call'}
              </h4>
              <p className="text-xs text-zinc-400">
                {isInCall
                  ? `You are connected with ${connectedPeerCount} participant(s) in this room.`
                  : 'Talk and see your opponents in real-time while playing!'}
              </p>
            </div>

            {/* In-Call Quick Controls */}
            {isInCall ? (
              <div className="p-3 rounded-2xl bg-[#11172A] border border-white/10 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onToggleAudio}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isAudioMuted
                        ? 'bg-red-950/80 text-red-400 border border-red-500/40'
                        : 'bg-[#182038] text-white hover:bg-[#202B4B] border border-white/10'
                    }`}
                  >
                    {isAudioMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                    <span>{isAudioMuted ? 'Mic Muted' : 'Mic Active'}</span>
                  </button>

                  <button
                    onClick={onToggleVideo}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isVideoOff
                        ? 'bg-zinc-900 text-zinc-400 border border-white/10'
                        : 'bg-[#182038] text-white hover:bg-[#202B4B] border border-white/10'
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="w-4 h-4 text-zinc-400" /> : <Video className="w-4 h-4 text-purple-400" />}
                    <span>{isVideoOff ? 'Camera Off' : 'Camera On'}</span>
                  </button>
                </div>

                <button
                  onClick={onLeaveCall}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Leave Video Call</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => onStartCall(true)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 cursor-pointer active:scale-98 transition-transform"
                >
                  <Video className="w-4 h-4" />
                  <span>Join with Camera & Mic</span>
                </button>

                <button
                  onClick={() => onStartCall(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#11172A] hover:bg-[#182038] text-zinc-200 border border-white/10 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>Join Audio-Only</span>
                </button>
              </div>
            )}

            {/* Room Participants Preview */}
            <div className="p-3 rounded-2xl bg-[#0B0F1E] border border-white/10 space-y-2">
              <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Players in Room ({players.length})
              </h5>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {players.map((p) => {
                  const char = getCharacterById(p.characterId);
                  const isMe = p.id === currentUserId;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-1.5 rounded-xl bg-[#080B15] border border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <CharacterAvatar characterId={p.characterId} size="xs" />
                        <div>
                          <span className="text-xs font-semibold text-white">
                            {p.name} {isMe && '(You)'}
                          </span>
                          <div className="text-[10px] text-zinc-400">{char.name}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {p.isBot ? 'AI Bot' : p.isConnected ? 'Online' : 'Away'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Peer-to-peer encrypted WebRTC stream</span>
          </div>
        </div>
      )}

      {/* CHAT TAB VIEW */}
      {activeTab === 'chat' && (
        <>
          {/* Active Call Quick Banner in Chat */}
          {!isInCall && (
            <div className="mx-3 mt-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-purple-200">
                <Video className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Voice & Video Call available</span>
              </div>
              <button
                onClick={() => onStartCall(true)}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] cursor-pointer shadow transition-transform active:scale-95"
              >
                Join Call
              </button>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div ref={scrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-3 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-xs space-y-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p>No messages yet. Send a greeting or launch an astra reaction!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const char = msg.characterId ? getCharacterById(msg.characterId) : null;

                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#11172A] text-[11px] font-medium text-zinc-300 border border-[#1E263D] shadow-sm">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`group relative flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    {msg.characterId && (
                      <div className="shrink-0 mt-0.5">
                        <CharacterAvatar characterId={msg.characterId} size="xs" />
                      </div>
                    )}

                    <div
                      className={`relative max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-sm transition-all ${
                        msg.isEmote
                          ? 'text-3xl py-1.5 bg-transparent border-0'
                          : isMe
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-purple-950/30'
                          : 'bg-[#111627] text-zinc-200 rounded-tl-none border border-[#1E263D]'
                      }`}
                    >
                      {!isMe && !msg.isEmote && (
                        <div className="flex items-center gap-1.5 font-bold text-[11px] mb-0.5" style={{ color: char?.secondaryColor || '#a855f7' }}>
                          <span>{msg.senderName}</span>
                          {char && (
                            <span className="text-[9px] font-normal text-zinc-400 opacity-80">
                              ({char.title})
                            </span>
                          )}
                        </div>
                      )}

                      <p className="break-words leading-relaxed select-text">{msg.text}</p>

                      {/* Copy message button on hover */}
                      {!msg.isEmote && (
                        <button
                          onClick={() => handleCopyMsg(msg.id, msg.text)}
                          className={`absolute ${isMe ? '-left-6' : '-right-6'} top-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/60 hover:bg-black text-zinc-400 hover:text-white text-[9px] cursor-pointer transition-opacity`}
                          title="Copy text"
                        >
                          {copiedMsgId === msg.id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Shoutout Bar & Quick Reactions Drawer */}
          <div className="border-t border-[#161D30] bg-[#070912] p-2 space-y-2">
            {/* Horizontal One-Tap Reactions Bar */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto py-0.5 scrollbar-none">
              {QUICK_BAR_EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => handleEmoteClick(em)}
                  className="p-1.5 rounded-xl hover:bg-white/10 hover:scale-125 active:scale-95 transition-all text-base shrink-0 cursor-pointer"
                  title={`React ${em}`}
                >
                  {em}
                </button>
              ))}
            </div>

            {/* Category Emojis / Shoutout Panel Drawer */}
            {showEmotes && (
              <div className="p-2.5 rounded-2xl bg-[#0E1324] border border-[#1E263D] space-y-2 animate-in fade-in zoom-in-95">
                {/* Category Pills */}
                <div className="flex items-center gap-1 border-b border-white/10 pb-1.5">
                  {REACTION_CATEGORIES.map((cat, idx) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategoryIndex(idx)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                        selectedCategoryIndex === idx
                          ? 'bg-purple-600 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* Emojis Grid for selected category */}
                <div className="grid grid-cols-8 gap-1.5 py-1">
                  {REACTION_CATEGORIES[selectedCategoryIndex].emojis.map((em) => (
                    <button
                      key={em}
                      onClick={() => handleEmoteClick(em)}
                      className="p-1 text-xl rounded-lg hover:bg-white/10 hover:scale-125 transition-transform cursor-pointer flex items-center justify-center"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Shoutouts Drawer */}
            {showQuickShoutouts && (
              <div className="p-2.5 rounded-2xl bg-[#0E1324] border border-[#1E263D] grid grid-cols-2 gap-1.5 animate-in fade-in zoom-in-95">
                {QUICK_SHOUTOUTS.map((shout) => (
                  <button
                    key={shout}
                    onClick={() => handleShoutoutClick(shout)}
                    className="p-1.5 px-2 rounded-xl bg-[#141A30] hover:bg-purple-600/80 text-zinc-200 hover:text-white text-[11px] font-medium text-left border border-white/5 truncate transition-all cursor-pointer"
                  >
                    {shout}
                  </button>
                ))}
              </div>
            )}

            {/* Main Chat Input Bar */}
            <form onSubmit={handleSend} className="flex items-center gap-1.5">
              {/* Quick Shoutouts button */}
              <button
                type="button"
                onClick={() => {
                  setShowQuickShoutouts(!showQuickShoutouts);
                  setShowEmotes(false);
                }}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  showQuickShoutouts
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-[#111627] border-[#1E263D] text-zinc-400 hover:text-white'
                }`}
                title="Quick Shoutouts"
              >
                <Zap className="w-4 h-4" />
              </button>

              {/* Full Emojis drawer toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowEmotes(!showEmotes);
                  setShowQuickShoutouts(false);
                }}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  showEmotes
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-[#111627] border-[#1E263D] text-zinc-400 hover:text-white'
                }`}
                title="Mahabharat Astras & Emojis"
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* Input text */}
              <input
                id="chat-input-field"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type message or battle cry..."
                maxLength={120}
                className="flex-1 bg-[#111627] border border-[#1E263D] focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all"
              />

              {/* Send button */}
              <button
                id="chat-send-btn"
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white shadow-md shadow-purple-950/50 cursor-pointer transition-all active:scale-95"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
