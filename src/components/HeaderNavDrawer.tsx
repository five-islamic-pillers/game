import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  X, 
  Trophy, 
  Globe2, 
  Gamepad2, 
  Smartphone, 
  ChevronLeft,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { SoundManager } from '../utils/sound';

interface HeaderNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
  onOpenOnlineLobby: () => void;
  onPlayLocal: () => void;
  onOpenAndroidModal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const HeaderNavDrawer: React.FC<HeaderNavDrawerProps> = ({
  isOpen,
  onClose,
  onOpenLeaderboard,
  onOpenOnlineLobby,
  onPlayLocal,
  onOpenAndroidModal,
  theme,
  onToggleTheme
}) => {
  // Check if current device is Android (only show APK download if Android)
  const isAndroid = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /android/i.test(navigator.userAgent || '');
  }, []);

  const handleAction = (action: () => void) => {
    SoundManager.click();
    onClose();
    action();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex justify-end overflow-hidden" dir="rtl">
          {/* Backdrop with smooth fade transition */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={onClose} 
          />

          {/* Drawer Content: Slide in and out from the right with spring physics */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-xs md:max-w-sm h-full bg-[#faf8f5] dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col z-10"
          >
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-[#f4eee4] dark:bg-stone-950/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 dark:text-white text-base">پێڕستی سەرەکی</h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-bold">یاری خێزانی ٥ پایەکەی ئیسلام</p>
                </div>
              </div>

              <button
                onClick={() => {
                  SoundManager.click();
                  onClose();
                }}
                className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Buttons List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              
              {/* 1. Leaderboard */}
              <button
                onClick={() => handleAction(onOpenLeaderboard)}
                className="w-full p-3.5 rounded-2xl bg-[#fdfcf9] hover:bg-[#f3ede1] dark:bg-stone-800/80 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-700/60 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-stone-900 dark:text-amber-300 block">ڕیزبەندی یاریزانان</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">زۆرترین بردنەوە و زۆرترین یاری</span>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:-translate-x-1 transition-all" />
              </button>

              {/* 2. Online Mode */}
              <button
                onClick={() => handleAction(onOpenOnlineLobby)}
                className="w-full p-3.5 rounded-2xl bg-[#fdfcf9] hover:bg-[#f3ede1] dark:bg-stone-800/80 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-700/60 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-stone-900 dark:text-sky-300 block">یاری ئۆنلاین</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">یاری ڕاستەوخۆ لەگەڵ هاوڕێکانت</span>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:-translate-x-1 transition-all" />
              </button>

              {/* 3. Play Local */}
              <button
                onClick={() => handleAction(onPlayLocal)}
                className="w-full p-3.5 rounded-2xl bg-[#fdfcf9] hover:bg-[#f3ede1] dark:bg-stone-800/80 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-700/60 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-stone-900 dark:text-red-300 block">دەستپێکردنی یاری ناوخۆیی</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">یاریکردن لەسەر یەک ئامێر (٢-٦ یاریزان)</span>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:-translate-x-1 transition-all" />
              </button>

              {/* 4. Android APK Download: ONLY SHOWN IF THE DEVICE IS ANDROID */}
              {isAndroid && (
                <button
                  onClick={() => handleAction(onOpenAndroidModal)}
                  className="w-full p-3.5 rounded-2xl bg-[#fdfcf9] hover:bg-[#f3ede1] dark:bg-stone-800/80 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-700/60 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-sm text-stone-900 dark:text-emerald-300 block">داگرتنی ئەپی ئەندرۆید (APK)</span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">دامەزراندنی فایلی APK ڕاستەوخۆ</span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all" />
                </button>
              )}

              {/* 5. Dark / Light Mode Toggle Button */}
              <button
                onClick={() => {
                  SoundManager.click();
                  onToggleTheme();
                }}
                className="w-full p-3.5 rounded-2xl bg-[#fdfcf9] hover:bg-[#f3ede1] dark:bg-stone-800/80 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-700/60 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div>
                    <span className="font-black text-sm text-stone-900 dark:text-stone-200 block">
                      {theme === 'dark' ? 'دۆخی ڕووناک (Light Mode)' : 'دۆخی تاریک (Dark Mode)'}
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                      {theme === 'dark' ? 'گۆڕین بۆ دۆخی ڕووناک' : 'گۆڕین بۆ دۆخی تاریک'}
                    </span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200">
                  {theme === 'dark' ? 'تاریک' : 'ڕووناک'}
                </div>
              </button>

            </div>

            {/* Footer info */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-[#f4eee4] dark:bg-stone-950/40 text-center shrink-0">
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-bold">
                دروستکراوە لەلایەن میر صڵاح بۆ کەناڵی ئافەرین
              </p>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
