import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Globe2, 
  Copy, 
  Check, 
  Play, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Crown, 
  Share2,
  Zap,
  DoorOpen,
  Clock,
  LogOut,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Trophy
} from 'lucide-react';
import { 
  createOnlineRoom, 
  joinOnlineRoom, 
  subscribeToRoom, 
  updateOnlineRoomState,
  findQuickMatchRoom,
  subscribeToOpenRooms,
  leaveOnlineRoom,
  normalizeRoomCode
} from '../services/onlineGameService';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  loginAsGuest,
  logoutUser, 
  subscribeToAuth, 
  getSavedUserSession,
  isProfilePhotoHidden,
  setProfilePhotoHidden,
  type AuthUser 
} from '../services/authService';
import { sendAccountCreationOtp, verifyAccountCreationOtp } from '../services/otpService';
import { getCookie, setCookie } from '../utils/cookieUtils';
import { SoundManager } from '../utils/sound';
import type { OnlineRoomData, GameDifficulty, CardTypes } from '../types';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  initialRoomCode?: string | null;
  onClose: () => void;
  onGameStart: (roomCode: string, myPlayerId: string, initialRoom: OnlineRoomData) => void;
  onOpenLeaderboard?: () => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  isOpen,
  initialRoomCode,
  onClose,
  onGameStart,
  onOpenLeaderboard
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [otpEmailSent, setOtpEmailSent] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);
  const [authEmail, setAuthEmail] = useState(() => {
    try {
      return getCookie('fourpieces_last_email') || '';
    } catch {
      return '';
    }
  });
  const [authPassword, setAuthPassword] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Lobby States
  const [tab, setTab] = useState<'menu' | 'create' | 'join' | 'waiting'>('menu');
  const [playerName, setPlayerName] = useState(() => {
    try {
      const fromCookie = getCookie('fourpieces_player_name');
      if (fromCookie) return fromCookie;
      const fromStorage = localStorage.getItem('fourpieces_player_name');
      if (fromStorage) return fromStorage;
      const savedSession = getSavedUserSession();
      if (savedSession?.displayName) return savedSession.displayName;
      return '';
    } catch {
      return '';
    }
  });
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [cardTypesAllowed, setCardTypesAllowed] = useState<CardTypes>('both');
  const [loading, setLoading] = useState(false);
  const [quickMatchLoading, setQuickMatchLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active room state while in waiting room
  const [activeRoom, setActiveRoom] = useState<OnlineRoomData | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  // Open public rooms waiting for players
  const [openRooms, setOpenRooms] = useState<OnlineRoomData[]>([]);

  // Auto-start countdown when 2nd player joins
  const [autoStartCountdown, setAutoStartCountdown] = useState<number | null>(null);
  const prevPlayersCountRef = useRef<number>(0);
  const countdownTimerRef = useRef<any>(null);

  // Subscribe to Auth status
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthChecking(false);
      if (user) {
        const name = user.displayName || user.email?.split('@')[0] || '';
        if (name) {
          updatePlayerName(name);
        }
      }
    });
    return () => unsub();
  }, []);

  // Save player name to localStorage and cookies whenever it changes
  const updatePlayerName = (name: string) => {
    setPlayerName(name);
    try {
      localStorage.setItem('fourpieces_player_name', name.trim());
      setCookie('fourpieces_player_name', name.trim(), 90);
    } catch {
      // ignore
    }
  };

  // OTP resend countdown effect
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const interval = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCountdown]);

  // If initialRoomCode is provided via URL (e.g. ?room=1234), open directly in join tab
  useEffect(() => {
    if (initialRoomCode && isOpen && currentUser) {
      setRoomCodeInput(normalizeRoomCode(initialRoomCode));
      setTab('join');
    }
  }, [initialRoomCode, isOpen, currentUser]);

  // Subscribe to live open rooms when on the menu tab
  useEffect(() => {
    if (!isOpen || tab !== 'menu' || !currentUser) return;
    const unsub = subscribeToOpenRooms((rooms) => {
      setOpenRooms(rooms);
    });
    return () => unsub();
  }, [isOpen, tab, currentUser]);

  // Listen to active room changes
  useEffect(() => {
    if (!activeRoom || tab !== 'waiting') return;

    const currentCount = activeRoom.players.length;
    const prevCount = prevPlayersCountRef.current;

    // Player joined!
    if (currentCount > prevCount && prevCount > 0) {
      SoundManager.playerJoined();
      // If exactly 2 players now in room, trigger auto-start countdown
      if (currentCount === 2 && autoStartCountdown === null) {
        setAutoStartCountdown(3);
      }
    }
    prevPlayersCountRef.current = currentCount;
  }, [activeRoom, tab]);

  // Countdown timer effect
  useEffect(() => {
    if (autoStartCountdown === null) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    if (autoStartCountdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setAutoStartCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(countdownTimerRef.current);
    }

    // Countdown reached 0: If host, start game!
    if (autoStartCountdown === 0 && activeRoom && activeRoom.hostId === myPlayerId) {
      handleHostStartGame();
      setAutoStartCountdown(null);
    }
  }, [autoStartCountdown, activeRoom, myPlayerId]);

  if (!isOpen) return null;

  const isHost = activeRoom?.hostId === myPlayerId;

  // Clean room subscription helper
  const setupRoomSubscription = (roomCode: string, playerId: string) => {
    return subscribeToRoom(roomCode, (roomData) => {
      if (!roomData) {
        setErrorMsg('ژوورەکە داخرا یان سڕایەوە');
        setActiveRoom(null);
        setTab('menu');
        return;
      }
      setActiveRoom(roomData);
      if (roomData.status === 'playing') {
        onGameStart(roomCode, playerId, roomData);
      }
    });
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    const res = await signInWithGoogle();
    if (res.error) {
      setAuthError(res.error);
    }
    setAuthLoading(false);
  };

  // Email Auth Submit
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword) {
      setAuthError('تکایە ئیمەیڵ و وشەی نهێنی بنووسە.');
      return;
    }

    if (authMode === 'signup') {
      if (!authDisplayName.trim()) {
        setAuthError('تکایە ناوی خۆت بنووسە.');
        return;
      }
      if (authPassword.length < 6) {
        setAuthError('وشەی نهێنی پێویستە بەلایەنی کەم ٦ پیت یان ژمارە بێت.');
        return;
      }

      setAuthLoading(true);
      setAuthError(null);
      const res = await sendAccountCreationOtp(authEmail, authDisplayName);
      setAuthLoading(false);

      if (!res.success) {
        setAuthError(res.error || 'نەتوانرا کۆدی دڵنیابوونەوە بنێردرێت.');
        return;
      }

      setAuthStep('otp');
      setOtpCode('');
      setOtpCountdown(60);
      setOtpEmailSent(Boolean(res.emailSent));
      setOtpNotice(res.previewOtp || null);
      SoundManager.click();
    } else {
      setAuthLoading(true);
      setAuthError(null);
      const res = await signInWithEmail(authEmail, authPassword);
      if (res.error) {
        setAuthError(res.error);
      } else if (res.user) {
        setCurrentUser(res.user);
      }
      setAuthLoading(false);
    }
  };

  // OTP Verification Submit
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setAuthError('تکایە هەموو ٦ ژمارەکەی کۆد بنووسە.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    const verifyRes = await verifyAccountCreationOtp(authEmail, cleanOtp);
    if (!verifyRes.success) {
      setAuthError(verifyRes.error || 'کۆدی دڵنیابوونەوە هەڵەیە.');
      setAuthLoading(false);
      return;
    }

    // OTP Verified! Now register and persist account
    const signUpRes = await signUpWithEmail(authEmail, authPassword, authDisplayName);
    if (signUpRes.error) {
      setAuthError(signUpRes.error);
    } else if (signUpRes.user) {
      setCurrentUser(signUpRes.user);
      setAuthStep('form');
      setOtpNotice(null);
      SoundManager.correct();
    }
    setAuthLoading(false);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpCountdown > 0 || authLoading) return;
    setAuthLoading(true);
    setAuthError(null);
    const res = await sendAccountCreationOtp(authEmail, authDisplayName);
    setAuthLoading(false);

    if (res.success) {
      setOtpCountdown(60);
      setOtpEmailSent(Boolean(res.emailSent));
      setOtpNotice(res.previewOtp || null);
      SoundManager.click();
    } else {
      setAuthError(res.error || 'نەتوانرا دووبارە بنێردرێتەوە.');
    }
  };

  // Back from OTP step to edit info
  const handleBackToForm = () => {
    setAuthStep('form');
    setAuthError(null);
    setOtpNotice(null);
  };

  // Guest Quick Play (instant access without email)
  const handleGuestLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await loginAsGuest(playerName.trim() || authDisplayName.trim());
      if (res.user) {
        setCurrentUser(res.user);
      }
    } catch {
      setAuthError('نەتوانرا وەک میوان بچیتەژوورەوە.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    await logoutUser();
    setActiveRoom(null);
    setMyPlayerId(null);
    setTab('menu');
  };

  // 1. Instant Quick Match: One-click matchmaking!
  const handleQuickMatch = async () => {
    if (!playerName.trim()) {
      setErrorMsg('تکایە سەرەتا ناوی خۆت دیاری بکە بۆ دەستپێکردن.');
      setTab('menu');
      return;
    }

    setQuickMatchLoading(true);
    setErrorMsg(null);

    try {
      const foundRoom = await findQuickMatchRoom();

      if (foundRoom) {
        const res = await joinOnlineRoom(foundRoom.roomCode, playerName);
        if ('error' in res) {
          setErrorMsg(res.error);
          setQuickMatchLoading(false);
          return;
        }

        setMyPlayerId(res.playerId);
        setTab('waiting');
        setupRoomSubscription(foundRoom.roomCode, res.playerId);
      } else {
        const { roomCode, playerId } = await createOnlineRoom(playerName, 'medium', 'both');
        setMyPlayerId(playerId);
        setTab('waiting');
        setupRoomSubscription(roomCode, playerId);
      }
    } catch (err) {
      setErrorMsg('هەڵەیەک ڕوویدا لە کاتی پەیوەندی کردن بە سێرڤەر. دووبارە هەوڵبدەرەوە.');
    } finally {
      setQuickMatchLoading(false);
    }
  };

  // 2. Direct Join from Open Rooms List
  const handleJoinSpecificRoom = async (roomCode: string) => {
    if (!playerName.trim()) {
      setErrorMsg('تکایە سەرەتا ناوت بنووسە بۆ چوونەژوورەوە.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await joinOnlineRoom(roomCode, playerName);
      if ('error' in res) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }

      setMyPlayerId(res.playerId);
      setTab('waiting');
      setupRoomSubscription(roomCode, res.playerId);
    } catch (err) {
      setErrorMsg('نەتوانرا بچیتە ناو ژوورەکە.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Create Custom Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('تکایە ناوی خۆت بنووسە');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const { roomCode, playerId } = await createOnlineRoom(playerName, difficulty, cardTypesAllowed);
      setMyPlayerId(playerId);
      setTab('waiting');
      setupRoomSubscription(roomCode, playerId);
    } catch (err: any) {
      setErrorMsg('هەڵەیەک ڕوویدا لە دروستکردنی ژوور. تکایە دووبارە هەوڵبدەرەوە.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Join by Code
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('تکایە ناوی خۆت بنووسە');
      return;
    }
    const cleanCode = normalizeRoomCode(roomCodeInput);
    if (!cleanCode) {
      setErrorMsg('تکایە کۆدی ژوورەکە بنووسە');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await joinOnlineRoom(cleanCode, playerName);
      if ('error' in res) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }
      setMyPlayerId(res.playerId);
      setTab('waiting');
      setupRoomSubscription(cleanCode, res.playerId);
    } catch (err: any) {
      setErrorMsg('نەتوانرا پەیوەندی بە ژوورەوە بکرێت. لە دروستی کۆدەکە دڵنیابە.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Host Manual / Immediate Start
  const handleHostStartGame = async () => {
    if (!activeRoom || !myPlayerId) return;
    if (activeRoom.players.length < 2) {
      setErrorMsg('بۆ دەستپێکردن پێویستە بەلایەنی کەم ٢ یاریزان لە ژووردا بن.');
      return;
    }
    setLoading(true);
    try {
      await updateOnlineRoomState(activeRoom.roomCode, {
        status: 'playing',
        currentPlayerIndex: 0,
        turnPhase: 'choose_card',
        timeLeft: 30
      });
    } catch (err) {
      setErrorMsg('نەتوانرا یاری دەستپێبکرێت.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Share / Copy links
  const copyRoomCode = () => {
    if (activeRoom) {
      navigator.clipboard.writeText(activeRoom.roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const shareRoomLink = async () => {
    if (!activeRoom) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${activeRoom.roomCode}`;
    const shareText = `وەرە با پێکەوە یاری چوارپارچە بکەین! کۆدی ژوور: ${activeRoom.roomCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'یاری چوارپارچە - ئۆنلاین',
          text: shareText,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Leave Room
  const handleLeaveRoom = async () => {
    if (activeRoom && myPlayerId) {
      await leaveOnlineRoom(activeRoom.roomCode, myPlayerId);
    }
    setActiveRoom(null);
    setMyPlayerId(null);
    setAutoStartCountdown(null);
    setTab('menu');
  };

  return (
    <div 
      id="online-lobby-modal-backdrop"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="online-lobby-modal-content"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-stone-900 border border-amber-500/40 rounded-3xl p-5 md:p-8 text-white shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-900/40">
              <Globe2 className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Real-time Multiplayer</span>
              <h2 className="text-lg md:text-xl font-black text-white">یاریکردنی ئۆنلاین</h2>
            </div>
          </div>
          <button 
            id="close-online-lobby-btn"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors text-xs font-bold cursor-pointer"
          >
            داخستن
          </button>
        </div>

        {/* Banner: Google Account Status / One-Click Link */}
        {currentUser ? (
          /* User Profile Banner */
            <div className="mb-4 p-2.5 bg-stone-800/90 border border-stone-700/80 rounded-2xl flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {currentUser.photoURL && !isProfilePhotoHidden() ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="User" 
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-amber-400 shrink-0 object-cover" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-xs shrink-0">
                    {(currentUser.displayName || currentUser.email || 'U').substring(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white block truncate">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <span 
                      title="زانیاری هەژمار لە کووکی پارێزراوە بۆ دانیشتنەکانی تر"
                      className="px-1.5 py-0.2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-bold rounded-md flex items-center gap-0.5"
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>پارێزراوە</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 truncate block">
                    {currentUser.email || 'هەژماری یاریزان (پارێزراو بە کووکی)'}
                  </span>
                </div>
              </div>

              {showLogoutConfirm ? (
                <div 
                  id="logout-confirm-inline"
                  className="flex items-center gap-1.5 shrink-0 bg-stone-900 border border-red-500/50 px-2 py-1 rounded-xl shadow-inner"
                >
                  <span className="text-[11px] font-black text-red-300">دڵنیایت لە دەرچوون؟</span>
                  <button
                    id="confirm-logout-btn"
                    type="button"
                    onClick={async () => {
                      setShowLogoutConfirm(false);
                      await handleSignOut();
                    }}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    بەڵێ
                  </button>
                  <button
                    id="cancel-logout-btn"
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-1.5 py-0.5 bg-stone-700 hover:bg-stone-600 text-stone-300 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    نەخێر
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenLeaderboard && (
                    <button
                      type="button"
                      onClick={() => {
                        SoundManager.click();
                        onOpenLeaderboard();
                      }}
                      className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>ڕیزبەندی</span>
                    </button>
                  )}
                  <button
                    id="signout-trigger-btn"
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    title="چوونەدەرەوە لە هەژمار"
                    className="px-2.5 py-1 bg-stone-700 hover:bg-red-500/20 hover:text-red-300 text-stone-300 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>دەرچوون</span>
                  </button>
                </div>
              )}
            </div>
        ) : (
          /* Google Account Prompt Banner */
          <div className="mb-4 p-3 bg-gradient-to-l from-amber-950/40 via-stone-800 to-stone-850 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md shrink-0">
            <div className="flex items-center gap-2.5 overflow-hidden w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-amber-300 block truncate">
                  دەتەوێت لە ڕیزبەندی یاریزانان بەشدار بیت؟
                </span>
                <span className="text-[10px] text-stone-400 font-medium block">
                  بەبێ هەژماریش دەتوانیت یاری بکەیت، بەڵام بە گووگڵ خاڵەکانت تۆمار دەبن
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                type="button"
                id="google-signin-lobby-btn"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="flex-1 sm:flex-initial px-3 py-1.5 bg-white hover:bg-stone-100 active:scale-95 text-stone-900 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{authLoading ? 'چاوەڕێ بە...' : 'چوونەژوورەوە بە گووگڵ'}</span>
              </button>
              {onOpenLeaderboard && (
                <button
                  type="button"
                  onClick={() => {
                    SoundManager.click();
                    onOpenLeaderboard();
                  }}
                  className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>ڕیزبەندی</span>
                </button>
              )}
            </div>
          </div>
        )}

            {/* Player Name In-Game Nickname */}
            {tab !== 'waiting' && (
              <div className="mb-4 p-2.5 bg-stone-800/60 border border-stone-700 rounded-xl flex items-center gap-2.5 shrink-0">
                <span className="text-xs font-bold text-stone-400 whitespace-nowrap">ناوی تۆ لە یاری:</span>
                <input 
                  id="online-player-name-input"
                  type="text"
                  value={playerName}
                  onChange={(e) => updatePlayerName(e.target.value)}
                  placeholder="ناوی یاریزان بنووسە..."
                  maxLength={20}
                  className="flex-1 bg-stone-900 border border-stone-700/80 rounded-lg px-2.5 py-1 text-white font-bold text-xs focus:outline-none focus:border-amber-500 transition-colors placeholder-stone-500"
                />
              </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-200 text-xs font-bold shrink-0 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Body Content (Scrollable) */}
            <div className="overflow-y-auto pr-1 -mr-1 flex-1">
              {/* TAB 1: Menu with Quick Match & Open Rooms List */}
              {tab === 'menu' && (
                <div className="space-y-4">
                  {/* Feature 1: Fast One-Click Quick Match */}
                  <button
                    id="online-quick-match-btn"
                    onClick={handleQuickMatch}
                    disabled={quickMatchLoading}
                    className="w-full p-4 md:p-5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 active:scale-[0.98] rounded-2xl shadow-xl flex items-center justify-between text-white font-bold transition-all border border-amber-300/40 group cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3.5 text-right">
                      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        {quickMatchLoading ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Zap className="w-6 h-6 text-white animate-bounce" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm md:text-base font-black text-white">⚡ یاری خێرا (دۆزینەوەی دەستبەجێ)</h3>
                          <span className="bg-white/25 text-white text-[10px] font-black px-2 py-0.5 rounded-full">خێراترین</span>
                        </div>
                        <p className="text-xs text-amber-100 font-normal mt-0.5">
                          {quickMatchLoading 
                            ? 'دەگەڕێین بۆ دۆزینەوەی یاریزانێک بۆت...' 
                            : 'دەستبەجێ بەبێ کۆد دەتبەستێتەوە بە یاریزانێکی چاوەڕوان'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/80 group-hover:-translate-x-1 transition-transform shrink-0" />
                  </button>

                  {/* Feature 2: Active Open Rooms List (Live Waiting Rooms) */}
                  <div className="p-3.5 bg-stone-800/60 border border-stone-700/80 rounded-2xl">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-stone-200">ژوورە کراوەکان ({openRooms.length}):</span>
                      </div>
                      <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        ڕاستەوخۆ نوێدەبێتەوە
                      </span>
                    </div>

                    {openRooms.length === 0 ? (
                      <div className="text-center py-3 px-2 text-stone-400 text-xs">
                        لە ئێستادا هیچ ژوورێکی کراوە نییە. دەتوانیت بە "یاری خێرا" یان "دروستکردنی ژوور" یاریزانی بەرامبەر بانگهێشت بکەیت!
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {openRooms.map((room) => {
                          const hostPlayer = room.players?.find(p => p.id === room.hostId) || room.players?.[0];
                          return (
                            <div 
                              key={room.roomCode}
                              className="flex items-center justify-between p-2 bg-stone-900/90 border border-stone-700 rounded-xl hover:border-amber-500/50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs border border-amber-500/30">
                                  {hostPlayer?.name?.substring(0, 1) || 'ی'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white">{hostPlayer?.name || 'هۆست'}</span>
                                    <span className="text-[10px] text-stone-400 font-mono">#{room.roomCode}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-stone-400">
                                    <span>{room.players.length}/6 یاریزان</span>
                                    <span>•</span>
                                    <span>{room.gameDifficulty === 'easy' ? 'ئاسان' : room.gameDifficulty === 'hard' ? 'قورس' : 'مامناوەند'}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleJoinSpecificRoom(room.roomCode)}
                                disabled={loading}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <span>بەشداربە</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Feature 3: Create & Join with Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      id="online-create-custom-room-btn"
                      onClick={() => { setErrorMsg(null); setTab('create'); }}
                      className="p-3.5 bg-stone-800 hover:bg-stone-750 active:scale-[0.98] rounded-2xl border border-stone-700 hover:border-amber-500/40 transition-all text-right group cursor-pointer flex items-center gap-2.5"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-black text-white group-hover:text-amber-200">دروستکردنی ژووری نوێ</h4>
                        <p className="text-[10px] text-stone-400 mt-0.5">بە خواستی خۆت ئاست و کارت دیاری بکە</p>
                      </div>
                    </button>

                    <button
                      id="online-join-by-code-btn"
                      onClick={() => { setErrorMsg(null); setTab('join'); }}
                      className="p-3.5 bg-stone-800 hover:bg-stone-750 active:scale-[0.98] rounded-2xl border border-stone-700 hover:border-indigo-500/40 transition-all text-right group cursor-pointer flex items-center gap-2.5"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-black text-white group-hover:text-indigo-200">چوونەژوورەوە بە کۆد</h4>
                        <p className="text-[10px] text-stone-400 mt-0.5">کۆدی ٤ ژمارەیی ژوورەکە لێبدە</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Create Custom Room */}
              {tab === 'create' && (
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-2">ئاستی پرسیارەکان:</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as GameDifficulty)}
                        className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-stone-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="easy">ئاسان</option>
                        <option value="medium">مامناوەند</option>
                        <option value="hard">قورس</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-2">جۆری کارتەکان:</label>
                      <select
                        value={cardTypesAllowed}
                        onChange={(e) => setCardTypesAllowed(e.target.value as CardTypes)}
                        className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-stone-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="both">هەردووکیان (هەڵبژاردن و زانین)</option>
                        <option value="brainteaser">تەنها کارتی هەڵبژاردن</option>
                        <option value="guess">تەنها کارتی زانین</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setTab('menu')}
                      className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      گەڕانەوە
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>دروستکردنی ژوور</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: Join Room by Code */}
              {tab === 'join' && (
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-2">کۆدی ژوور (٤ ژمارە):</label>
                    <input 
                      id="room-code-input-field"
                      type="text"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(normalizeRoomCode(e.target.value))}
                      placeholder="وەک: 5821"
                      maxLength={6}
                      required
                      autoFocus
                      className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-center tracking-widest text-2xl font-black text-amber-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setTab('menu')}
                      className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      گەڕانەوە
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                      <span>چوونەژوورەوە</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: Waiting Lobby with Instant Match & Auto-Start */}
              {tab === 'waiting' && activeRoom && (
                <div className="space-y-4">
                  {/* Auto-Start Countdown Banner */}
                  {autoStartCountdown !== null && (
                    <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-green-600 border border-emerald-400 rounded-2xl text-center shadow-lg shadow-emerald-950/50 animate-bounce">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-white animate-spin" />
                        <h4 className="text-sm font-black text-white">یاریزان هاتە ژوورەوە!</h4>
                      </div>
                      <p className="text-xs text-emerald-100 font-bold mb-2">
                        یاری بە شێوەیەکی ئۆتۆماتیکی دەستپێدەکات لە <span className="text-lg font-black text-amber-300">{autoStartCountdown}</span> چرکەدا...
                      </p>
                      {isHost && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={handleHostStartGame}
                            className="px-3 py-1 bg-white text-emerald-800 hover:bg-emerald-50 rounded-lg text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            دەستبەجێ دەستپێبکە!
                          </button>
                          <button
                            onClick={() => setAutoStartCountdown(null)}
                            className="px-2.5 py-1 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            وەستاندن
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Room Code & Quick Sharing Bar */}
                  <div className="p-3.5 bg-stone-800/90 border border-amber-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">کۆدی ژوورەکەت</span>
                      <span className="text-2xl font-black text-white tracking-widest">{activeRoom.roomCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyRoomCode}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 border border-amber-500/40 text-amber-300 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                        title="کۆپیکردنی کۆدی ٤ ژمارەیی"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'کۆپیکرا!' : 'کۆد'}</span>
                      </button>
                      <button
                        onClick={shareRoomLink}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                        title="ناردنی لینکی ڕاستەوخۆ بۆ هاوڕێکانت لە واتسئاپ / تێلیگرام"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'لینک کۆپیکرا!' : 'ناردنی لینک'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Players Joined List */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-400 mb-2">
                      <span>یاریزانانی ناو ژوور ({activeRoom.players.length}/6):</span>
                      <span className="text-amber-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                        ڕاستەوخۆ دەبەسترێتەوە
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {activeRoom.players.map((p) => (
                        <div 
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-800 border border-stone-700/60"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full ${p.color} border border-white/40 shadow-sm`} />
                            <span className="font-bold text-white text-xs md:text-sm">
                              {p.name} {p.id === myPlayerId && <span className="text-xs text-amber-400">(تۆ)</span>}
                            </span>
                          </div>
                          {p.id === activeRoom.hostId && (
                            <span className="flex items-center gap-1 text-[10px] font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                              <Crown className="w-3 h-3" /> هۆست
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Host and Member Actions */}
                  <div className="pt-2 border-t border-stone-800 space-y-2.5">
                    {isHost ? (
                      <div className="space-y-1.5">
                        <button
                          id="host-start-game-btn"
                          onClick={handleHostStartGame}
                          disabled={activeRoom.players.length < 2 || loading}
                          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.98] text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm border border-emerald-400/30 cursor-pointer"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                          <span>دەستپێکردنی یاری ({activeRoom.players.length} یاریزان)</span>
                        </button>
                        {activeRoom.players.length < 2 && (
                          <p className="text-center text-[11px] text-amber-400/90 font-medium">
                            چاوەڕێی یاریزانی دووەم دەکرێت... لینکی ژوور بنێرە یان چاوەڕێ بکە یاریزانێک بێتە ژوورەوە.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-stone-800/80 rounded-xl text-center border border-stone-700">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400 mx-auto mb-1" />
                        <p className="font-bold text-white text-xs">چاوەڕوانی دەستپێکردنی یارییەکە بکە...</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">بە دەستپێکردن، ڕاستەوخۆ دەچیتە ناو تەختەی یاری.</p>
                      </div>
                    )}

                    {/* Leave Room Button */}
                    <button
                      onClick={handleLeaveRoom}
                      className="w-full py-2 bg-stone-800/80 hover:bg-red-500/20 hover:text-red-300 text-stone-400 rounded-xl text-xs font-bold transition-all border border-stone-700/60 cursor-pointer"
                    >
                      چوونەدەرەوە لە ژوور
                    </button>
                  </div>
                </div>
              )}
            </div>
      </div>
    </div>
  );
};
