import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  X, 
  Trophy, 
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
  VolumeX,
  LogIn,
  Loader2,
  AlertCircle,
  Camera,
  Edit3
} from 'lucide-react';
import { SoundManager } from '../utils/sound';
import { 
  subscribeToAuth, 
  signInWithGoogle,
  logoutUser, 
  isProfilePhotoHidden, 
  setProfilePhotoHidden, 
  type AuthUser 
} from '../services/authService';
import { TikTokIcon } from './TikTokIcon';
import { EditProfileModal } from './EditProfileModal';
import { MatrixCodeButton } from './MatrixCodeButton';

interface HeaderNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
  onOpenRules: () => void;
  onOpenAndroidModal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const REPORT_PROBLEM_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf97Y6co7TdU19T5IHrzI4PEeHFozeskRfHImQsahewxVHsag/viewform?usp=publish-editor';
const TIKTOK_PAGE_URL = 'https://www.tiktok.com/@five_islamic_pillers';

export const HeaderNavDrawer: React.FC<HeaderNavDrawerProps> = ({
  isOpen,
  onClose,
  onOpenLeaderboard,
  onOpenRules,
  onOpenAndroidModal,
  theme,
  onToggleTheme
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hidePhoto, setHidePhoto] = useState<boolean>(() => isProfilePhotoHidden());
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileInitialTab, setEditProfileInitialTab] = useState<'photo' | 'username' | 'privacy'>('photo');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => SoundManager.isSoundMuted());
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [googleSignInError, setGoogleSignInError] = useState<string | null>(null);

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

  const handleGoogleSignIn = async () => {
    SoundManager.click();
    setIsSigningInGoogle(true);
    setGoogleSignInError(null);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setGoogleSignInError(res.error);
      } else {
        setGoogleSignInError(null);
      }
    } catch (e: any) {
      setGoogleSignInError('هەڵەیەک ڕوویدا لە کاتی چوونەژوورەوە بە گووگڵ.');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[170] pointer-events-none" style={{ direction: 'ltr' }}>
          {/* Backdrop with smooth fade transition */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm pointer-events-auto cursor-pointer"
            onClick={onClose} 
          />

          {/* Drawer Content: Anchored to the LEFT edge of the screen, wider & spacious */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260, mass: 0.8 }}
            dir="rtl"
            className="absolute top-0 bottom-0 left-0 w-full max-w-[92vw] sm:max-w-md md:max-w-[450px] h-full bg-[#faf8f5] dark:bg-stone-900 border-r-2 border-stone-200/80 dark:border-stone-800 shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto z-10 select-none overflow-hidden"
          >
            
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-[#f4eee4] dark:bg-stone-950/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 dark:text-white text-lg">پێڕستی سەرەکی</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-bold">یاری خێزانی ٥ پایەکەی ئیسلام</p>
                </div>
              </div>

              <button
                onClick={() => {
                  SoundManager.click();
                  onClose();
                }}
                aria-label="داخستن"
                className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-stone-800 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Account / Profile Card OR Google Sign In Banner */}
            {currentUser ? (
              <div className="mx-4 sm:mx-5 mt-4 sm:mt-5 p-3.5 sm:p-4 bg-amber-500/10 dark:bg-stone-800/90 border border-amber-500/35 dark:border-stone-700 rounded-2xl shrink-0 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        SoundManager.click();
                        setShowEditProfileModal(true);
                      }}
                      className="relative cursor-pointer group/avatar shrink-0 active:scale-95 transition-transform"
                      title="کرتە بکە بۆ گۆڕینی وێنەی پرۆفایل"
                    >
                      {currentUser.photoURL && !hidePhoto ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt="Profile" 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full border-2 border-amber-400 shrink-0 object-cover shadow-sm group-hover/avatar:border-amber-300 transition-colors" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                          {(currentUser.displayName || currentUser.email || 'U').substring(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-md group-hover/avatar:scale-110 transition-transform">
                        <Camera className="w-3 h-3" />
                      </div>
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-stone-900 dark:text-white truncate block" dir="auto">
                          {currentUser.displayName || currentUser.email?.split('@')[0]}
                        </span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          <span>تۆمارە</span>
                        </span>
                      </div>
                      <span className="text-xs text-stone-500 dark:text-stone-400 truncate block mt-0.5">
                        {currentUser.email || 'هەژماری یاریزان'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      SoundManager.click();
                      setShowAccountSettings(!showAccountSettings);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    {showAccountSettings ? 'داخستن' : 'ڕێکخستن'}
                  </button>
                </div>

                {/* Direct Action Buttons: Change Photo & Change Username */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      SoundManager.click();
                      setEditProfileInitialTab('photo');
                      setShowEditProfileModal(true);
                    }}
                    className="py-2 px-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/35 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="truncate">گۆڕینی وێنە</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      SoundManager.click();
                      setEditProfileInitialTab('username');
                      setShowEditProfileModal(true);
                    }}
                    className="py-2 px-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/35 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="truncate">گۆڕینی ناو (٧ ڕۆژ)</span>
                  </button>
                </div>

                {/* Account Settings Sub-panel (Photo visibility toggle & Logout) */}
                {showAccountSettings && (
                  <div className="mt-3 pt-3 border-t border-amber-500/20 dark:border-stone-700 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                      <span className="flex items-center gap-1.5">
                        {hidePhoto ? <EyeOff className="w-4 h-4 text-stone-400" /> : <Eye className="w-4 h-4 text-emerald-500" />}
                        <span>پێشاندانی وێنە لە ڕیزبەندی:</span>
                      </span>
                      <button
                        type="button"
                        onClick={togglePhotoVisibility}
                        className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                          hidePhoto 
                            ? 'bg-stone-300 dark:bg-stone-700 text-stone-600 dark:text-stone-300' 
                            : 'bg-emerald-600 text-white shadow-sm'
                        }`}
                      >
                        {hidePhoto ? 'شاراوەیە (سڕاوە)' : 'دیارە'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          SoundManager.click();
                          setEditProfileInitialTab('privacy');
                          setShowEditProfileModal(true);
                        }}
                        className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>ڕێکخستنی زیاتری تایبەتمەندی</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>چوونەدەرەوە لە هەژمار</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-4 sm:mx-5 mt-4 sm:mt-5 p-4 bg-gradient-to-br from-amber-500/10 via-[#fdfaf6] to-amber-500/5 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border border-amber-500/30 dark:border-amber-500/30 rounded-2xl shadow-sm shrink-0">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-stone-900 dark:text-amber-300">
                        چوونەژوورەوە بە گووگڵ
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-200 font-medium mt-1 leading-relaxed">
                      خاڵەکانت لە ڕیزبەندی گشتی و یاری ئۆنلاین بە ناوی خۆتەوە تۆمار بکە
                    </p>
                  </div>
                </div>

                {googleSignInError && (
                  <div className="mb-3 p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold leading-tight">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{googleSignInError}</span>
                  </div>
                )}

                <button
                  type="button"
                  id="menu-google-signin-top-btn"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningInGoogle}
                  className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 active:scale-[0.98] text-stone-900 border border-stone-200 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-60"
                >
                  {isSigningInGoogle ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span>پەیوەندی دەبەسترێت...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>چوونەژوورەوە بە گووگڵ</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Menu Buttons List - Spacious & Clear */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              
              {/* 1. Leaderboard */}
              <button
                onClick={() => handleAction(onOpenLeaderboard)}
                className="w-full p-4 rounded-2xl bg-gradient-to-l from-amber-500/15 via-amber-500/5 to-[#fdfcf9] hover:from-amber-500/25 hover:to-amber-50 dark:from-amber-950/40 dark:via-stone-900 dark:to-stone-900/90 dark:hover:from-amber-950/60 border-2 border-amber-500/40 dark:border-amber-500/35 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm hover:shadow-md active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25 group-hover:scale-105 group-hover:rotate-6 transition-transform">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="font-black text-base text-stone-900 dark:text-amber-300 block">ڕیزبەندی یاریزانان</span>
                    <span className="text-xs text-stone-600 dark:text-amber-200/70 font-medium">زۆرترین بردنەوە و کۆی یارییەکان</span>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-amber-500 group-hover:-translate-x-1 transition-all" />
              </button>

              {/* 2. Game Rules (یاساکانی یاری) */}
              <button
                onClick={() => handleAction(onOpenRules)}
                className="w-full p-4 rounded-2xl bg-gradient-to-l from-emerald-500/15 via-emerald-500/5 to-[#fdfcf9] hover:from-emerald-500/25 hover:to-emerald-50 dark:from-emerald-950/40 dark:via-stone-900 dark:to-stone-900/90 dark:hover:from-emerald-950/60 border-2 border-emerald-500/40 dark:border-emerald-500/35 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm hover:shadow-md active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25 group-hover:scale-105 group-hover:-rotate-6 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-black text-base text-stone-900 dark:text-emerald-300 block">یاساکانی یاری</span>
                    <span className="text-xs text-stone-600 dark:text-emerald-200/70 font-medium">ڕێنمایی و یاساکانی چۆنیەتی بردنەوە</span>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-emerald-500 group-hover:-translate-x-1 transition-all" />
              </button>

              {/* 3. Creator Button with Matrix Green Falling Code Style */}
              <MatrixCodeButton onClick={onClose} />

              {/* 4. TikTok Official Page Link */}
              <a
                href={TIKTOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => SoundManager.click()}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 dark:from-black dark:via-stone-950 dark:to-black text-white hover:border-amber-400 border-2 border-stone-800 flex items-center justify-between transition-all cursor-pointer group text-right shadow-md active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-black border border-stone-800 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform p-2">
                    {/* Official TikTok Icon */}
                    <TikTokIcon className="w-full h-full" variant="color" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-white block">
                        پەیجی تیکتۆکی یاری
                      </span>
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black rounded-full">
                        TikTok
                      </span>
                    </div>
                    <span className="text-xs text-stone-300 font-bold block mt-0.5" dir="ltr">
                      @five_islamic_pillers
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-amber-400 group-hover:translate-x-[-2px] transition-transform shrink-0" />
              </a>

              {/* 6. Report a Problem (Google Form Redirection) */}
              <a
                href={REPORT_PROBLEM_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => SoundManager.click()}
                className="w-full p-4 rounded-2xl bg-gradient-to-l from-orange-500/15 via-orange-500/5 to-[#fdfcf9] hover:from-orange-500/25 hover:to-orange-50 dark:from-orange-950/40 dark:via-stone-900 dark:to-stone-900/90 dark:hover:from-orange-950/60 border-2 border-orange-500/40 dark:border-orange-500/35 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm hover:shadow-md active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
                    <MessageSquareWarning className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-black text-base text-stone-900 dark:text-orange-300 block">ڕاپۆرتکردنی کێشە لە یاری</span>
                    <span className="text-xs text-stone-600 dark:text-orange-200/70 font-medium">پێشنیار یان کێشەیەک ڕابگەیەنە</span>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-orange-500 group-hover:translate-x-[-2px] transition-transform shrink-0" />
              </a>

              {/* 7. Android APK Download: ONLY SHOWN IF THE DEVICE IS ANDROID */}
              {isAndroid && (
                <button
                  onClick={() => handleAction(onOpenAndroidModal)}
                  className="w-full p-4 rounded-2xl bg-gradient-to-l from-lime-500/15 via-lime-500/5 to-[#fdfcf9] hover:from-lime-500/25 hover:to-lime-50 dark:from-lime-950/40 dark:via-stone-900 dark:to-stone-900/90 dark:hover:from-lime-950/60 border-2 border-lime-500/40 dark:border-lime-500/35 flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm hover:shadow-md active:scale-98"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-lime-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-lime-500/25 group-hover:scale-105 transition-transform">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-black text-base text-stone-900 dark:text-lime-300 block">داگرتنی ئەپی ئەندرۆید (APK)</span>
                      <span className="text-xs text-stone-600 dark:text-lime-200/70 font-medium">دامەزراندنی فایلی APK ڕاستەوخۆ</span>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-lime-500 group-hover:-translate-x-1 transition-all" />
                </button>
              )}

              {/* 8. Sound Effects Mute / Unmute Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  SoundManager.toggleMute();
                }}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm hover:shadow-md active:scale-98 border-2 ${
                  isSoundMuted 
                    ? 'bg-gradient-to-l from-rose-500/15 via-rose-500/5 to-[#fdfcf9] hover:from-rose-500/25 dark:from-rose-950/40 dark:via-stone-900 dark:to-stone-900/90 border-rose-500/40 dark:border-rose-500/35'
                    : 'bg-gradient-to-l from-violet-500/15 via-violet-500/5 to-[#fdfcf9] hover:from-violet-500/25 dark:from-violet-950/40 dark:via-stone-900 dark:to-stone-900/90 border-violet-500/40 dark:border-violet-500/35'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105 ${
                    isSoundMuted 
                      ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/25' 
                      : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/25'
                  }`}>
                    {isSoundMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className={`font-black text-base block ${
                      isSoundMuted ? 'text-rose-950 dark:text-rose-300' : 'text-violet-950 dark:text-violet-300'
                    }`}>
                      {isSoundMuted ? 'بێدەنگکردنی دەنگ (Muted)' : 'دەنگی یاری (Sound Effects)'}
                    </span>
                    <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                      {isSoundMuted ? 'کرتە بکە بۆ چالاککردنی دەنگ' : 'کرتە بکە بۆ بێدەنگکردن'}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition-colors ${
                  isSoundMuted 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-violet-600 text-white'
                }`}>
                  {isSoundMuted ? 'بێدەنگکراوە' : 'چالاکە'}
                </div>
              </button>

              {/* 9. Dark / Light Mode Toggle Button */}
              <button
                onClick={() => {
                  SoundManager.click();
                  onToggleTheme();
                }}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group text-right shadow-sm hover:shadow-md active:scale-98 border-2 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-l from-indigo-500/20 via-purple-500/10 to-stone-900 hover:from-indigo-500/30 border-indigo-500/40'
                    : 'bg-gradient-to-l from-amber-400/20 via-amber-300/10 to-[#fdfcf9] hover:from-amber-400/30 border-amber-400/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-amber-200 shadow-indigo-500/25'
                      : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/25'
                  }`}>
                    {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className={`font-black text-base block ${
                      theme === 'dark' ? 'text-indigo-200' : 'text-amber-950'
                    }`}>
                      {theme === 'dark' ? 'دۆخی ڕووناک (Light Mode)' : 'دۆخی تاریک (Dark Mode)'}
                    </span>
                    <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                      {theme === 'dark' ? 'گۆڕین بۆ دۆخی ڕووناک' : 'گۆڕین بۆ دۆخی تاریک'}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-amber-500 text-stone-950 font-black'
                }`}>
                  {theme === 'dark' ? 'تاریک' : 'ڕووناک'}
                </div>
              </button>

            </div>

            {/* Footer info */}
            <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-[#f4eee4] dark:bg-stone-950/50 text-center shrink-0">
              <p className="text-xs text-stone-600 dark:text-stone-400 font-bold">
                دروستکراوە لەلایەن{' '}
                <a 
                  href="https://five-islamic-pillers.github.io/me/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline font-black transition-colors"
                >
                  میر صڵاح
                </a>
              </p>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Dedicated Edit Profile & Username Modal */}
    <EditProfileModal
      isOpen={showEditProfileModal}
      onClose={() => setShowEditProfileModal(false)}
      currentUser={currentUser}
      initialTab={editProfileInitialTab}
    />
  </>
  );
};
