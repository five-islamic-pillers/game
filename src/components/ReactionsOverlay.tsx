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
      {/* 1. Floating Reactions Overlay - Visible to All Players */}
      <div 
        aria-live="polite"
        className="fixed inset-0 pointer-events-none z-[110] overflow-hidden"
      >
        <AnimatePresence>
          {floatingReactions.map((r, index) => {
            const isMe = r.senderName === myPlayerName;
            // Spread reactions horizontally across 25% to 75% of screen width
            const spreadSlots = [25, 40, 55, 70, 35, 60, 48];
            const leftPercent = spreadSlots[index % spreadSlots.length];
            const rotationDegree = (index % 2 === 0 ? 1 : -1) * (10 + (index % 4) * 4);

            return (
              <motion.div
                key={r.id}
                initial={{ 
                  opacity: 0, 
                  scale: 0.2, 
                  y: 100, 
                  x: '-50%',
                  rotate: rotationDegree 
                }}
                animate={{ 
                  opacity: [0, 1, 1, 1, 0], 
                  scale: [0.3, 1.45, 1.25, 1.1, 0.9], 
                  y: -360, 
                  rotate: -rotationDegree * 0.8
                }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ 
                  duration: 2.6, 
                  ease: [0.22, 1, 0.36, 1],
                  times: [0, 0.15, 0.4, 0.8, 1]
                }}
                style={{ left: `${leftPercent}%` }}
                className="absolute bottom-24 flex flex-col items-center gap-1.5 drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
              >
                {/* Glowing Emoji with pop animation */}
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: 1, duration: 0.6 }}
                  className="relative select-none text-5xl sm:text-6xl md:text-7xl filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)] cursor-default"
                >
                  {r.emoji}
                </motion.div>

                {/* Sender Name Pill Badge */}
                <motion.div 
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-black shadow-xl border-2 backdrop-blur-md whitespace-nowrap ${
                    isMe 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 border-amber-200 ring-2 ring-amber-400/50' 
                      : 'bg-stone-900/95 text-white border-stone-700/80'
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
      <div className="fixed bottom-20 md:bottom-6 right-3 md:right-6 z-50 flex flex-col items-end gap-2.5">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 15, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: 15 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="bg-stone-900/95 dark:bg-stone-900/98 backdrop-blur-2xl border-2 border-amber-500/50 p-2 md:p-3 rounded-2xl md:rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center gap-1 sm:gap-2 text-xl md:text-2xl"
              dir="ltr"
            >
              {REACTION_EMOJIS.map(({ emoji, label }) => {
                const isJustClicked = lastClickedEmoji === emoji;
                return (
                  <motion.button
                    key={emoji}
                    type="button"
                    whileHover={{ scale: 1.3, y: -4 }}
                    whileTap={{ scale: 0.8, rotate: -12 }}
                    animate={isJustClicked ? { scale: [1, 1.45, 1], rotate: [0, 15, -15, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleSelectEmoji(emoji)}
                    disabled={cooldown}
                    className={`relative w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center cursor-pointer select-none disabled:opacity-40 hover:bg-white/15 active:bg-amber-500/30 ${
                      isJustClicked ? 'bg-amber-500/30 ring-2 ring-amber-400' : ''
                    }`}
                    title={label}
                  >
                    <span className="text-xl sm:text-2xl md:text-3xl leading-none">{emoji}</span>
                  </motion.button>
                );
              })}

              {/* Close Tray Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-colors ml-1 cursor-pointer"
                title="داخستن"
              >
                <X className="w-4 h-4" />
              </button>
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
          className={`relative w-11 h-11 md:w-14 md:h-14 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl transition-all border-2 cursor-pointer ${
            isOpen 
              ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-amber-500/30 ring-4 ring-amber-400/30' 
              : 'bg-stone-900/90 text-amber-400 hover:bg-stone-800 border-amber-500/40 hover:border-amber-400 shadow-black/40'
          }`}
          title="ناردنی کاردانەوە (Reactions)"
          aria-label="Toggle reactions tray"
        >
          <Smile className="w-6 h-6 md:w-7 md:h-7" />
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75" />
          )}
        </motion.button>
      </div>
    </>
  );
};
