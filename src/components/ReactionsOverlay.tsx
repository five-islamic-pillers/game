import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, X, Sparkles } from 'lucide-react';
import { SoundManager } from '../utils/sound';
import type { GameReaction } from '../types';

interface ReactionsOverlayProps {
  floatingReactions: GameReaction[];
  onSendReaction: (emoji: string) => void;
  myPlayerName: string;
}

const REACTION_EMOJIS = [
  { emoji: '😂', label: 'پێکەنین' },
  { emoji: '🔥', label: 'ئاگر' },
  { emoji: '👏', label: 'چەپڵە' },
  { emoji: '😮', label: 'سەرسوڕماو' },
  { emoji: '🎲', label: 'زار' },
  { emoji: '🏆', label: 'بردنەوە' },
  { emoji: '❤️', label: 'دڵ' },
  { emoji: '🤔', label: 'بیرکردنەوە' },
  { emoji: '⚡', label: 'بروسکە' },
  { emoji: '😢', label: 'خەمبار' }
];

export const ReactionsOverlay: React.FC<ReactionsOverlayProps> = ({
  floatingReactions,
  onSendReaction,
  myPlayerName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [lastClickedEmoji, setLastClickedEmoji] = useState<string | null>(null);

  const handleSelectEmoji = (emoji: string) => {
    if (cooldown) return;
    setLastClickedEmoji(emoji);
    SoundManager.reaction();
    onSendReaction(emoji);

    // Short cooldown to prevent spamming
    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
      setLastClickedEmoji(null);
    }, 450);
  };

  return (
    <>
      {/* 1. Floating Reactions Overlay - Visible to All Players on Mobile & PC */}
      <div 
        aria-live="polite"
        className="fixed inset-0 pointer-events-none z-[140] overflow-hidden"
      >
        <AnimatePresence>
          {floatingReactions.map((r, index) => {
            const isMe = r.senderName === myPlayerName;
            // Spread reactions horizontally across 20% to 80% of screen width
            const spreadSlots = [25, 45, 65, 35, 75, 50, 30, 60];
            const leftPercent = spreadSlots[index % spreadSlots.length];
            const rotationDegree = (index % 2 === 0 ? 1 : -1) * (8 + (index % 3) * 5);

            return (
              <motion.div
                key={r.id}
                initial={{ 
                  opacity: 0, 
                  scale: 0.2, 
                  y: 120, 
                  x: '-50%',
                  rotate: rotationDegree 
                }}
                animate={{ 
                  opacity: [0, 1, 1, 1, 0], 
                  scale: [0.3, 1.4, 1.2, 1.05, 0.85], 
                  y: -380, 
                  rotate: -rotationDegree * 0.8
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ 
                  duration: 2.8, 
                  ease: [0.22, 1, 0.36, 1],
                  times: [0, 0.12, 0.35, 0.8, 1]
                }}
                style={{ left: `${leftPercent}%` }}
                className="absolute bottom-24 flex flex-col items-center gap-1.5 drop-shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
              >
                {/* Glowing Emoji with pop animation */}
                <motion.div 
                  initial={{ scale: 0.7 }}
                  animate={{ scale: [1, 1.28, 1] }}
                  transition={{ repeat: 1, duration: 0.55 }}
                  className="relative select-none text-5xl sm:text-6xl md:text-7xl filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)] cursor-default"
                >
                  {r.emoji}
                </motion.div>

                {/* Sender Name Pill Badge */}
                <motion.div 
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.06 }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-black shadow-2xl border-2 backdrop-blur-md whitespace-nowrap ${
                    isMe 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 border-amber-200 ring-2 ring-amber-400/50' 
                      : 'bg-stone-900/95 text-white border-stone-700/90'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${r.senderColor || 'bg-amber-400'} border border-white/60`} />
                  <span>{isMe ? `تۆ (${r.senderName})` : r.senderName}</span>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 2. Floating Reaction Picker Tray and Toggle Button */}
      <div className="fixed bottom-20 md:bottom-6 right-3 md:right-6 z-[140] flex flex-col items-end gap-2">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 15 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="bg-stone-950/95 dark:bg-stone-900/98 backdrop-blur-2xl border-2 border-amber-500/60 p-2 md:p-3 rounded-2xl md:rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] max-w-[92vw] sm:max-w-none"
              dir="ltr"
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-800 text-stone-300 text-[11px] font-bold px-1 sm:hidden">
                <span className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>کاردانەوە بنێرە:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grid on mobile (2 rows of 5) and single flex row on desktop */}
              <div className="grid grid-cols-5 gap-1.5 sm:flex sm:items-center sm:gap-2">
                {REACTION_EMOJIS.map(({ emoji, label }) => {
                  const isJustClicked = lastClickedEmoji === emoji;
                  return (
                    <motion.button
                      key={emoji}
                      type="button"
                      whileHover={{ scale: 1.25, y: -3 }}
                      whileTap={{ scale: 0.8, rotate: -10 }}
                      animate={isJustClicked ? { scale: [1, 1.45, 1], rotate: [0, 15, -15, 0] } : {}}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleSelectEmoji(emoji)}
                      disabled={cooldown}
                      className={`relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center cursor-pointer select-none disabled:opacity-40 hover:bg-white/20 active:bg-amber-500/30 ${
                        isJustClicked ? 'bg-amber-500/30 ring-2 ring-amber-400' : 'bg-white/5'
                      }`}
                      title={label}
                    >
                      <span className="text-2xl sm:text-2xl md:text-3xl leading-none">{emoji}</span>
                    </motion.button>
                  );
                })}

                {/* Close Button on Desktop */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="hidden sm:flex p-2 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-colors ml-1 cursor-pointer items-center justify-center"
                  title="داخستن"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reaction Trigger Floating Button */}
        <motion.button
          id="reaction-toggle-button"
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            SoundManager.init();
            setIsOpen(!isOpen);
          }}
          className={`relative w-11 h-11 md:w-14 md:h-14 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl transition-all border-2 cursor-pointer ${
            isOpen 
              ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-amber-500/30 ring-4 ring-amber-400/30' 
              : 'bg-stone-900/95 text-amber-400 hover:bg-stone-800 border-amber-500/50 hover:border-amber-400 shadow-black/60 ring-1 ring-amber-400/20'
          }`}
          title="ناردنی کاردانەوە (Reactions)"
          aria-label="Toggle reactions tray"
        >
          <Smile className="w-6 h-6 md:w-7 md:h-7" />
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full animate-ping opacity-80" />
          )}
        </motion.button>
      </div>
    </>
  );
};
