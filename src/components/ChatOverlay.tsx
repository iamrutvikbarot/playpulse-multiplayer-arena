import { MessageSquare, Send, Smile, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, Player } from '../types/game';
import { sound } from '../utils/audio';
import { CharacterAvatar } from './CharacterAvatar';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  players: Player[];
  currentUserId: string;
  onSendMessage: (text: string, isEmote?: boolean) => void;
}

const QUICK_EMOTES = ['🔥', '🎉', '👏', '⚡', '💀', '🤯', '🎲', '🏆', '👀', '❤️'];

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  isOpen,
  onClose,
  messages,
  currentUserId,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmotes, setShowEmotes] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), false);
    setInputText('');
    sound.playClick();
  };

  const handleEmote = (emote: string) => {
    onSendMessage(emote, true);
    sound.playClick();
    setShowEmotes(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#0C101C]/95 backdrop-blur-xl border-l border-[#1A2238] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#161D30] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-sm text-white font-display">Room Chat & Reactions</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#141A2E] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages List */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No messages yet. Send a greeting or emote!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="text-center my-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#111627] text-[10px] font-medium text-zinc-400 border border-[#1E263D]">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {msg.characterId && (
                  <CharacterAvatar characterId={msg.characterId} size="sm" />
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs ${
                    msg.isEmote
                      ? 'text-2xl py-1 bg-transparent'
                      : isMe
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-[#111627] text-zinc-200 rounded-tl-none border border-[#1E263D]'
                  }`}
                >
                  {!isMe && !msg.isEmote && (
                    <div className="font-bold text-[10px] text-purple-400 mb-0.5">
                      {msg.senderName}
                    </div>
                  )}
                  <p className="break-words leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Emote Picker drawer */}
      {showEmotes && (
        <div className="p-2 border-t border-[#161D30] bg-[#090C16] flex flex-wrap gap-2 justify-center animate-in fade-in">
          {QUICK_EMOTES.map((em) => (
            <button
              key={em}
              onClick={() => handleEmote(em)}
              className="text-xl hover:scale-125 transition-transform p-1 cursor-pointer"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#161D30] bg-[#080B14] flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEmotes(!showEmotes)}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            showEmotes
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-[#111627] border-[#1E263D] text-zinc-400 hover:text-white'
          }`}
          title="Emotes"
        >
          <Smile className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message..."
          maxLength={100}
          className="flex-1 bg-[#111627] border border-[#1E263D] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
