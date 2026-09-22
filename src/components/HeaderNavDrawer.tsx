import React, { useState, useEffect, useMemo } from 'react';
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
  Moon,
  MessageSquareWarning,
  User as UserIcon,
  Eye,
  EyeOff,
  LogOut,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Volume2,
  VolumeX
} from 'lucide-react';
import { SoundManager } from '../utils/sound';
import { 
  subscribeToAuth, 
  logoutUser, 
  isProfilePhotoHidden, 
  setProfilePhotoHidden, 
  type AuthUser 
} from '../services/authService';

interface HeaderNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
  onOpenOnlineLobby: () => void;
  onPlayLocal: () => void;
  onOpenRules: () => void;
  onOpenAndroidModal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const REPORT_PROBLEM_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf97Y6co7TdU19T5IHrzI4PEeHFozeskRfHImQsahewxVHsag/viewform?usp=publish-editor';

export const HeaderNavDrawer: React.FC<HeaderNavDrawerProps> = ({
  isOpen,
  onClose,
  onOpenLeaderboard,
  onOpenOnlineLobby,
  onPlayLocal,
  onOpenRules,
  onOpenAndroidModal,
  theme,
  onToggleTheme
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hidePhoto, setHidePhoto] = useState<boolean>(() => isProfilePhotoHidden());
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => SoundManager.isSoundMuted());

  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      setHidePhoto(isProfilePhotoHidden());
    });
    const unsubSound = SoundManager.subscribeToMute((muted) => {
      setIsSoundMuted(muted);
    });
    return () => {
      unsubAuth();
      unsubSound();
    };
  }, []);

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

  const togglePhotoVisibility = () => {
    SoundManager.click();
    const nextVal = !hidePhoto;
    setHidePhoto(nextVal);
    setProfilePhotoHidden(nextVal);
  };

  const handleSignOut = async () => {
    SoundManager.click();
    await logoutUser();
    setShowAccountSettings(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] pointer-events-none" style={{ direction: 'ltr' }}>
          {/* Backdrop with smooth fade transition */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto cursor-pointer"
            onClick={onClose} 
          />

          {/* Drawer Content: Anchored to the LEFT edge of the screen */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260, mass: 0.8 }}
            dir="rtl"
            className="absolute top-0 bottom-0 left-0 w-full max-w-xs sm:max-w-sm h-full bg-[#faf8f5] dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col pointer-events-auto z-10 select-none overflow-hidden"
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
                aria-label="داخستن"
                className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Account / Profile Card */}
            {currentUser && (
              <div className="mx-4 mt-4 p-3 bg-amber-500/10 dark:bg-stone-800/80 border border-amber-500/30 dark:border-stone-700 rounded-2xl shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {currentUser.photoURL && !hidePhoto ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border-2 border-amber-400 shrink-0 object-cover" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-sm shrink-0">
                        {(currentUser.displayName || currentUser.email || 'U').substring(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-stone-900 dark:text-white truncate block">
                          {currentUser.displayName || currentUser.email?.split('@')[0]}
                        </span>
                        <span className="px-1 py-0.2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold rounded flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>تۆمارە</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">
                        {currentUser.email || 'هەژماری یاریزان'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      SoundManager.click();
                      setShowAccountSettings(!showAccountSettings);
                    }}
                    className="px-2 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {showAccountSettings ? 'داخستن' : 'ڕێکخستن'}
                  </button>
                </div>

                {/* Account Settings Sub-panel (Photo visibility toggle & Logout) */}
                {showAccountSettings && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20 dark:border-stone-700 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 dark:text-stone-300">
                      <span className="flex items-center gap-1.5">
                        {hidePhoto ? <EyeOff className="w-3.5 h-3.5 text-stone-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                        <span>پێشاندانی وێنەی هەژمار:</span>
                      </span>
                      <button
                        type="button"
                        onClick={togglePhotoVisibility}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                          hidePhoto 
                            ? 'bg-stone-300 dark:bg-stone-700 text-stone-600 dark:text-stone-300' 
                            : 'bg-emerald-600 text-white shadow-sm'
                        }`}
                      >
                        {hidePhoto ? 'شاراوەیە (سڕاوە)' : 'دیارە'}
                      </button>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>چوونەدەرەوە لە هەژمار</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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

              {/* 4. Game Rules (یاساکانی یاری) */}
              <button
                onClick={() => handleAction(onOpenRules)}
                className="w-full p-3.5 rounded-2xl bg-[#fdfcf9] hover:bg-[#f3ede1] dark:bg-stone-800/80 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-700/60 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-stone-900 dark:text-amber-300 block">یاساکانی یاری</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">ڕێنمایی و یاساکانی چۆنیەتی بردنەوە</span>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:-translate-x-1 transition-all" />
              </button>

              {/* 5. Report a Problem (Google Form Redirection) */}
              <a
                href={REPORT_PROBLEM_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => SoundManager.click()}
                className="w-full p-3.5 rounded-2xl bg-[#fdfcf9] hover:bg-[#fef2f2] dark:bg-stone-800/80 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-700/60 hover:border-red-300 dark:hover:border-red-900/60 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                    <MessageSquareWarning className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-stone-900 dark:text-red-300 block">ڕاپۆرتکردنی کێشە لە یاری</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">پێشنیار یان هەڵەیەک ڕابگەیەنە</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-red-500 transition-colors shrink-0" />
              </a>

              {/* 6. Android APK Download: ONLY SHOWN IF THE DEVICE IS ANDROID */}
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

              {/* 7. Sound Effects Mute / Unmute Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  SoundManager.toggleMute();
                }}
                className="w-full p-3.5 rounded-2xl bg-[#fdfcf9] hover:bg-[#f3ede1] dark:bg-stone-800/80 dark:hover:bg-stone-800 border border-stone-200/90 dark:border-stone-700/60 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    isSoundMuted 
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' 
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  }`}>
                    {isSoundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="font-black text-sm text-stone-900 dark:text-stone-200 block">
                      {isSoundMuted ? 'بێدەنگکردنی دەنگ (Muted)' : 'دەنگی یاری (Sound Effects)'}
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                      {isSoundMuted ? 'کرتە بکە بۆ چالاککردنی دەنگ' : 'کرتە بکە بۆ بێدەنگکردن'}
                    </span>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-colors ${
                  isSoundMuted 
                    ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60' 
                    : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                }`}>
                  {isSoundMuted ? 'بێدەنگکراوە' : 'چالاکە'}
                </div>
              </button>

              {/* 8. Dark / Light Mode Toggle Button */}
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
