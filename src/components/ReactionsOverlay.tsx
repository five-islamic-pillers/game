import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, X, Sparkles } from 'lucide-react';
import { SoundManager } from '../utils/sound';
import type { GameReaction } from '../types';

interface ReactionsOverlayProps {
  floatingReactions: GameReaction[];
  onSendReaction: (emoji: string) => void;
  myPlayerName: string;
}

const REACTION_EMOJIS = ['😂', '🔥', '👏', '😮', '🎲', '🏆', '❤️', '🤔', '⚡', '😢'];

export const ReactionsOverlay: React.FC<ReactionsOverlayProps> = ({
  floatingReactions,
  onSendReaction,
  myPlayerName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleSelectEmoji = (emoji: string) => {
    if (cooldown) return;
    SoundManager.reaction();
    onSendReaction(emoji);

    // Short throttle to prevent emoji spamming
    setCooldown(true);
    setTimeout(() => setCooldown(false), 500);
  };

  return (
    <>
      {/* 1. Floating Reactions Animations on Screen */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        <AnimatePresence>
          {floatingReactions.map((r, index) => {
            // Distribute starting X position across bottom area
            const randomXOffset = (index % 5) * 15 - 30; // -30px to +30px
            const isMe = r.senderName === myPlayerName;

            return (
              <motion.div
                key={r.id}
                initial={{ 
                  opacity: 0, 
                  scale: 0.4, 
                  y: 50, 
                  x: `${50 + randomXOffset}%`,
                  rotate: (index % 2 === 0 ? 1 : -1) * 12 
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  scale: [0.6, 1.3, 1.1, 0.9], 
                  y: -280, 
                  rotate: (index % 2 === 0 ? -1 : 1) * 15 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.4, ease: 'easeOut' }}
                className="absolute bottom-28 left-0 flex flex-col items-center gap-1 drop-shadow-2xl"
              >
                <span className="text-4xl md:text-5xl select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                  {r.emoji}
                </span>
                <span className={`text-[10px] md:text-xs font-black px-2 py-0.5 rounded-full border shadow-md whitespace-nowrap ${
                  isMe 
                    ? 'bg-amber-500 text-amber-950 border-amber-300' 
                    : 'bg-stone-900/90 text-white border-white/20'
                }`}>
                  {r.senderName}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 2. Reaction Picker Button and Popup Tray */}
      <div className="fixed bottom-24 md:bottom-6 right-3 md:right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-stone-900/95 backdrop-blur-xl border-2 border-amber-500/50 p-2 md:p-3 rounded-2xl md:rounded-3xl shadow-2xl flex items-center gap-1.5 md:gap-2 text-xl md:text-2xl"
              dir="ltr"
            >
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSelectEmoji(emoji)}
                  disabled={cooldown}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-xl hover:bg-white/20 active:scale-125 transition-all flex items-center justify-center cursor-pointer select-none disabled:opacity-40"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors ml-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reaction Trigger Floating Button */}
        <button
          id="reaction-toggle-button"
          onClick={() => {
            SoundManager.init();
            setIsOpen(!isOpen);
          }}
          className={`w-11 h-11 md:w-13 md:h-13 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl transition-all active:scale-90 border-2 cursor-pointer ${
            isOpen 
              ? 'bg-amber-500 text-stone-950 border-amber-300 scale-105' 
              : 'bg-stone-900/90 text-amber-400 hover:bg-stone-800 border-amber-500/40 hover:border-amber-400'
          }`}
          title="ناردنی کاردانەوە (Reactions)"
        >
          <Smile className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      </div>
    </>
  );
};
