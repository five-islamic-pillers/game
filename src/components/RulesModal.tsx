import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  BookOpen, 
  HelpCircle, 
  Brain, 
  Dices, 
  Trophy, 
  Sparkles, 
  AlertCircle, 
  ArrowLeftRight, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { SoundManager } from '../utils/sound';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        dir="rtl" 
        className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm"
      >
        {/* Backdrop Click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 cursor-pointer"
          onClick={() => {
            SoundManager.click();
            onClose();
          }}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#faf8f5] dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header */}
          <div className="p-5 md:p-6 bg-gradient-to-r from-amber-600 via-amber-500 to-red-600 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black">یاساکانی یاری پێنج پایە</h2>
                <p className="text-xs md:text-sm font-medium text-amber-100">ڕێنمایی و یاساکانی چۆنیەتی یاریکردن و سەرکەوتن</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                SoundManager.click();
                onClose();
              }}
              aria-label="داخستن"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 transition-all text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 md:p-7 overflow-y-auto space-y-6 text-stone-800 dark:text-stone-200 text-sm md:text-base leading-relaxed">
            
            {/* 1. Goal of Game */}
            <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-stone-800/80 border border-amber-500/30 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-stone-900 dark:text-amber-300 text-base mb-1">ئامانجی یاری</h3>
                <p className="text-stone-700 dark:text-stone-300 text-xs md:text-sm leading-normal">
                  ئامانجی یارییەکە ئەوەیە بە وەڵامدانەوەی ڕاستی پرسیارە ئیسلامییەکان خاڵ کۆبکەیتەوە، لەسەر تەختەکە بەرەو پێشەوە بچیت، و یەکەم کەس بیت بگەیتە خانەی کۆتایی (خانەی ٩١) بە زۆرترین خاڵ.
                </p>
              </div>
            </div>

            {/* 2. Turn Steps */}
            <div className="space-y-3">
              <h3 className="font-black text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>قۆناغەکانی نۆرەی هەر یاریزانێک</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">١</span>
                    <span className="font-black text-xs md:text-sm text-stone-900 dark:text-stone-100">هەڵبژاردنی کارت</span>
                  </div>
                  <p className="text-[11px] md:text-xs text-stone-600 dark:text-stone-300">
                    یاریزان دەتوانێت لە نێوان <strong>کارتی زانین</strong> یان <strong>کارتی هەڵبژاردن</strong> یەکێکیان هەڵبژێرێت.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">٢</span>
                    <span className="font-black text-xs md:text-sm text-stone-900 dark:text-stone-100">وەڵامدانەوەی پرسیار</span>
                  </div>
                  <p className="text-[11px] md:text-xs text-stone-600 dark:text-stone-300">
                    لە ماوەی دیاریکراودا وەڵامی پرسیارەکە بدەرەوە. وەڵامی ڕاست خاڵت پێدەبەخشێت!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">٣</span>
                    <span className="font-black text-xs md:text-sm text-stone-900 dark:text-stone-100">هاویشتنی زار</span>
                  </div>
                  <p className="text-[11px] md:text-xs text-stone-600 dark:text-stone-300">
                    ئەگەر وەڵامەکەت ڕاست بوو، مافی هاویشتنی زارت هەیە بۆ ئەوەی بەپێی ژمارەی زارەکە بەرەوپێش بچیت.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">٤</span>
                    <span className="font-black text-xs md:text-sm text-stone-900 dark:text-stone-100">کاریگەری خانەکان</span>
                  </div>
                  <p className="text-[11px] md:text-xs text-stone-600 dark:text-stone-300">
                    ئەگەر لەسەر خانەی تایبەت وەستایت، لەوانەیە باز بدەیتە پێشەوە یان بگەڕێیتەوە دواوە!
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Cards Guide */}
            <div className="space-y-3">
              <h3 className="font-black text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>جۆرەکانی کارت</span>
              </h3>

              <div className="space-y-2.5">
                {/* Guess Cards */}
                <div className="p-4 rounded-2xl bg-blue-500/10 dark:bg-blue-950/30 border border-blue-500/30 flex gap-3.5 items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-blue-700 dark:text-blue-300 text-sm mb-1">کارتی زانین (Guess Card)</h4>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-normal">
                      ئەم کارتە ٣ سەرەداو پێشکەش دەکات. ئەگەر بە سەرەداوی یەکەم وەڵام بدەیتەوە ٣ خاڵ، بە سەرەداوی دووەم ٢ خاڵ، و بە سەرەداوی سێیەم ١ خاڵ بەدەستدەهێنیت.
                    </p>
                  </div>
                </div>

                {/* Brainteaser Cards */}
                <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 flex gap-3.5 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#a33b5c] text-white flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-rose-700 dark:text-rose-300 text-sm mb-1">کارتی هەڵبژاردن (Brainteaser Card)</h4>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-normal">
                      پرسیاری چوار هەڵبژاردەییە دەربارەی زانیارییە ئیسلامییەکان. وەڵامی دروست ١ خاڵ دەبەخشێت و ڕێگە دەدات زار بهاوێژیت.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Winning Conditions */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-emerald-800 dark:text-emerald-300 text-sm mb-1">چۆنیەتی بردنەوە</h4>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-normal">
                  کاتێک یەکەم یاریزان دەگاتە خانەی کۆتایی (٩١)، یارییەکە تەواو دەبێت. براوە ئەو کەسەیە کە توانیویەتی زۆرترین خاڵ کۆبکاتەوە لە تەواوی یارییەکەدا.
                </p>
              </div>
            </div>

          </div>

          {/* Footer Action */}
          <div className="p-4 bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex justify-end shrink-0">
            <button
              type="button"
              onClick={() => {
                SoundManager.click();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-sm shadow-md transition-all cursor-pointer"
            >
              تێگەیشتم
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
