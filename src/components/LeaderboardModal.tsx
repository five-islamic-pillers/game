import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  Gamepad2, 
  X, 
  RefreshCw, 
  Crown, 
  User, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Clock, 
  Medal,
  Calendar,
  ListOrdered
} from 'lucide-react';
import { 
  getMostPlayedLeaderboard, 
  getMostWinsLeaderboard, 
  getUserStats,
  formatPlayingSince,
  type LeaderboardPlayer 
} from '../services/leaderboardService';
import { isProfilePhotoHidden } from '../services/authService';
import { SoundManager } from '../utils/sound';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserGoogleId?: string | null;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUserGoogleId
}) => {
  const [activeTab, setActiveTab] = useState<'most_wins' | 'most_played'>('most_wins');
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [myStats, setMyStats] = useState<LeaderboardPlayer | null>(null);
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const fetchLeaderboardData = async (tab: 'most_played' | 'most_wins') => {
    setLoading(true);
    try {
      if (tab === 'most_played') {
        const data = await getMostPlayedLeaderboard(30);
        setPlayers(data);
      } else {
        const data = await getMostWinsLeaderboard(30);
        setPlayers(data);
      }

      if (currentUserGoogleId) {
        const stats = await getUserStats(currentUserGoogleId);
        setMyStats(stats);
      }
    } catch (err) {
      console.error('Failed to load leaderboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboardData(activeTab);
      // Trigger fresh animation every time modal opens or tab changes
      setAnimKey((prev) => prev + 1);
    }
  }, [isOpen, activeTab, currentUserGoogleId]);

  // Handle ESC key to smoothly close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        SoundManager.click();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const top1 = players[0] || null;
  const top2 = players[1] || null;
  const top3 = players[2] || null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 md:p-6" dir="rtl">
          {/* Smooth Fade-in and Fade-out Backdrop */}
          <motion.div
            key="leaderboard-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            onClick={() => {
              SoundManager.click();
              onClose();
            }}
          />
      {/* Dynamic Keyframes Animation Styles */}
      <style>{`
        @keyframes pillarRiseGold {
          0% { transform: translateY(40px) scale(0.92); opacity: 0; }
          65% { transform: translateY(-4px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pillarRiseSilver {
          0% { transform: translateY(30px) scale(0.94); opacity: 0; }
          65% { transform: translateY(-3px) scale(1.01); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pillarRiseBronze {
          0% { transform: translateY(25px) scale(0.94); opacity: 0; }
          65% { transform: translateY(-3px) scale(1.01); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes crownFloatAnim {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-4px) rotate(2deg) scale(1.06); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        @keyframes auraPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        .anim-pillar-gold {
          animation: pillarRiseGold 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;
        }
        .anim-pillar-silver {
          animation: pillarRiseSilver 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both;
        }
        .anim-pillar-bronze {
          animation: pillarRiseBronze 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.18s both;
        }
        .anim-crown {
          animation: crownFloatAnim 2.5s ease-in-out infinite;
        }
        .anim-aura {
          animation: auraPulse 2.8s ease-in-out infinite;
        }
        .anim-shimmer {
          animation: shimmerSweep 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Modal Container with entrance and exit fade animations */}
      <motion.div
        key="leaderboard-modal-container"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#faf8f5] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-900 dark:text-white z-10"
      >
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0 bg-[#f4eee4] dark:bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                <span>ڕیزبەندی و کۆڵەکەی پاڵەوانان</span>
                <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              </h2>
              <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                کۆڵەکەی ٣ پلەی یەکەم لەگەڵ تەواوی خشتەی یاریزانان
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                SoundManager.click();
                fetchLeaderboardData(activeTab);
                setAnimKey((prev) => prev + 1);
              }}
              title="نوێکردنەوەی ڕیزبەندی"
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                SoundManager.click();
                onClose();
              }}
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: 1. Most Wins | 2. Most Played */}
        <div className="p-2 sm:p-2.5 bg-[#ede6d8] dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800/80 shrink-0">
          <div className="grid grid-cols-2 gap-2 bg-[#fdfcf9] dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800">
            <button
              onClick={() => {
                SoundManager.click();
                setActiveTab('most_wins');
              }}
              className={`py-1.5 px-3 rounded-lg font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'most_wins'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>زۆرترین بردنەوە</span>
            </button>
            <button
              onClick={() => {
                SoundManager.click();
                setActiveTab('most_played');
              }}
              className={`py-1.5 px-3 rounded-lg font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'most_played'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>زۆرترین یاری</span>
            </button>
          </div>
        </div>

        {/* Current User Stats Card (if logged in and played) */}
        {myStats && (
          <div className="px-3 py-2 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent dark:from-amber-950/50 dark:via-amber-950/20 border-b border-amber-500/30 flex items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-xs shrink-0">
                <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-stone-900 dark:text-white truncate">
                    ئامارەکانی تۆ ({myStats.displayName})
                  </span>
                  <span className="text-[9px] font-black bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-full">
                    تۆمارکراو
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400">
                  <span>ڕێژەی بردنەوە: {myStats.winRate ?? 0}٪</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 inline" />
                    <span>لە یاری دەکات: {formatPlayingSince(myStats.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="text-center px-2 py-0.5 bg-amber-500/20 rounded-lg border border-amber-500/30">
                <div className="text-xs font-black text-amber-800 dark:text-amber-300">{myStats.wins}</div>
                <div className="text-[8px] text-stone-600 dark:text-stone-400 font-bold">بردنەوە</div>
              </div>
              <div className="text-center px-2 py-0.5 bg-stone-200/70 dark:bg-stone-800 rounded-lg border border-stone-300 dark:border-stone-700">
                <div className="text-xs font-black text-stone-800 dark:text-stone-200">{myStats.gamesPlayed}</div>
                <div className="text-[8px] text-stone-500 dark:text-stone-400 font-bold">یاری</div>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="px-3.5 py-1.5 bg-amber-500/10 dark:bg-stone-800/40 border-b border-amber-500/20 dark:border-stone-800/60 flex items-center justify-between text-[10px] text-amber-900 dark:text-amber-300 font-bold shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>خاڵەکان بەشێوەی ئۆتۆماتیکی لەگەڵ ماوەی بەشداربوون نوێ دەکرێنەوە.</span>
          </div>
        </div>

        {/* Leaderboard Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-3">
          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-7 h-7 text-amber-600 dark:text-amber-500 animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400">بارکردنی خشتەی پاڵەوانان...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="py-16 text-center space-y-2.5 px-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-7 h-7" />
              </div>
              <h4 className="text-sm sm:text-base font-black text-stone-800 dark:text-stone-200">
                تا ئێستا هیچ یارییەکی تەواوکراو تۆمار نەکراوە
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed font-medium">
                دەست بە یاری بکە و ببە بە براوە! بە چوونەژوورەوە لە ڕێگەی هەژماری گووگڵ ناو و کاتی دەستپێکردنت لە خشتەدا تۆمار دەکرێن.
              </p>
            </div>
          ) : (
            <div key={animKey} className="space-y-3.5">
              
              {/* ============================================================== */}
              {/* COMPACT 3-PILLAR PODIUM (1ST GOLD, 2ND SILVER, 3RD BRONZE)     */}
              {/* ============================================================== */}
              <div className="relative pt-3 pb-2 px-2 bg-gradient-to-b from-stone-100/80 to-transparent dark:from-stone-950/60 dark:to-transparent rounded-2xl border border-stone-200/90 dark:border-stone-800/90 shadow-xs">
                
                {/* Decorative Stage Light Glow */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-40 h-16 bg-amber-400/15 dark:bg-amber-500/10 blur-xl pointer-events-none rounded-full" />

                {/* Pillars Grid Layout (2nd Silver Left, 1st Gold Center, 3rd Bronze Right) */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 items-end max-w-sm sm:max-w-md mx-auto relative z-10">
                  
                  {/* ----------------- 2ND PLACE PILLAR (SILVER) ----------------- */}
                  <div className="flex flex-col items-center anim-pillar-silver">
                    {top2 ? (
                      <div className="flex flex-col items-center w-full">
                        {/* Avatar & Silver Medal */}
                        <div className="relative mb-1">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-200 dark:bg-stone-700 border-2 border-slate-300 dark:border-slate-400 shadow-sm flex items-center justify-center overflow-hidden">
                            {top2.photoURL && (!currentUserGoogleId || top2.userId !== currentUserGoogleId || !isProfilePhotoHidden()) ? (
                              <img src={top2.photoURL} alt={top2.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-300" />
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-stone-900 border border-white dark:border-stone-800 flex items-center justify-center text-[10px] font-black shadow-xs">
                            🥈
                          </div>
                        </div>

                        {/* Player Name */}
                        <div className="text-center w-full px-0.5 mb-0.5">
                          <div className="text-[11px] sm:text-xs font-black text-stone-900 dark:text-slate-200 truncate" dir="auto" title={top2.displayName}>
                            {top2.displayName}
                          </div>
                        </div>

                        {/* Score Tag */}
                        <div className="px-1.5 py-0.2 mb-0.5 bg-slate-200/90 dark:bg-stone-800 rounded-md text-[9px] font-black text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-stone-700">
                          {activeTab === 'most_wins' ? `${top2.wins} بردنەوە` : `${top2.gamesPlayed} یاری`}
                        </div>

                        {/* Playing Since Time */}
                        <div className="text-[8px] sm:text-[9px] text-stone-500 dark:text-stone-400 mb-1 text-center truncate max-w-full font-medium leading-tight">
                          لە {formatPlayingSince(top2.createdAt)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center mb-1.5">
                        <div className="w-8 h-8 rounded-xl border border-dashed border-slate-300 dark:border-stone-700 flex items-center justify-center mx-auto mb-0.5 text-slate-400">
                          <Medal className="w-4 h-4 opacity-40" />
                        </div>
                        <span className="text-[9px] text-stone-400 font-bold">چاوەڕوان</span>
                      </div>
                    )}

                    {/* Compact 3D Pillar Body: Silver */}
                    <div className="w-full relative">
                      {/* Top Capital Ledge */}
                      <div className="w-full h-1.5 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 dark:from-stone-600 dark:via-slate-400 dark:to-stone-700 rounded-t-md shadow-xs border-t border-x border-white/60 dark:border-stone-500" />
                      
                      {/* Pillar Shaft */}
                      <div className="w-full h-13 sm:h-15 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 dark:from-stone-700 dark:via-stone-800 dark:to-stone-900 border-x border-slate-400/40 dark:border-stone-700 relative overflow-hidden flex flex-col items-center justify-between py-1 shadow-inner">
                        {/* Shimmer Light Reflection */}
                        <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent anim-shimmer pointer-events-none" />
                        
                        {/* Fluting */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,rgba(255,255,255,0.25)_6px,rgba(255,255,255,0.25)_8px)] pointer-events-none" />
                        
                        {/* Embossed Numeral 2 */}
                        <div className="relative z-10 font-black text-xl sm:text-2xl text-slate-600 dark:text-slate-300 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-mono">
                          2
                        </div>

                        {/* Pillar Label */}
                        <div className="relative z-10 text-[8px] sm:text-[9px] font-black text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-stone-950/80 px-1.5 py-0.2 rounded-full border border-slate-300 dark:border-stone-700 shadow-xs">
                          زیو
                        </div>
                      </div>

                      {/* Pillar Plinth (Base) */}
                      <div className="w-full h-2 bg-gradient-to-b from-slate-400 to-slate-500 dark:from-stone-800 dark:to-stone-950 rounded-b-md border-b border-x border-slate-500/50 shadow-xs" />
                    </div>
                  </div>


                  {/* ----------------- 1ST PLACE PILLAR (GOLD - TALLEST & CENTER) ----------------- */}
                  <div className="flex flex-col items-center anim-pillar-gold relative">
                    
                    {top1 ? (
                      <div className="flex flex-col items-center w-full">
                        {/* Floating Crown */}
                        <div className="anim-crown text-yellow-500 drop-shadow-[0_2px_6px_rgba(234,179,8,0.7)] mb-0.5">
                          <Crown className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-amber-600" />
                        </div>

                        {/* Avatar & Gold Aura */}
                        <div className="relative mb-1">
                          <div className="absolute inset-0 rounded-xl bg-amber-400/40 blur-xs anim-aura pointer-events-none" />
                          <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-tr from-amber-200 to-yellow-100 dark:from-stone-700 dark:to-amber-950 border-2 sm:border-3 border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.5)] flex items-center justify-center overflow-hidden">
                            {top1.photoURL && (!currentUserGoogleId || top1.userId !== currentUserGoogleId || !isProfilePhotoHidden()) ? (
                              <img src={top1.photoURL} alt={top1.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-yellow-400" />
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-200 text-stone-950 border border-white dark:border-stone-900 flex items-center justify-center text-xs font-black shadow-sm">
                            🥇
                          </div>
                        </div>

                        {/* Player Name */}
                        <div className="text-center w-full px-0.5 mb-0.5">
                          <div className="text-xs sm:text-sm font-black text-stone-900 dark:text-yellow-300 truncate" dir="auto" title={top1.displayName}>
                            {top1.displayName}
                          </div>
                        </div>

                        {/* Golden Score Tag */}
                        <div className="px-2 py-0.2 mb-0.5 bg-gradient-to-r from-yellow-500/25 to-amber-500/25 dark:from-yellow-400/20 dark:to-amber-500/20 rounded-md text-[9px] sm:text-[10px] font-black text-amber-900 dark:text-yellow-300 border border-yellow-500/50 shadow-xs flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-yellow-500 shrink-0" />
                          <span>{activeTab === 'most_wins' ? `${top1.wins} بردنەوە` : `${top1.gamesPlayed} یاری`}</span>
                        </div>

                        {/* Playing Since Time */}
                        <div className="text-[8px] sm:text-[9px] text-amber-800 dark:text-yellow-400/90 mb-1 text-center truncate max-w-full font-bold leading-tight">
                          لە {formatPlayingSince(top1.createdAt)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center mb-1.5">
                        <div className="w-10 h-10 rounded-xl border border-dashed border-yellow-400 dark:border-yellow-600/50 flex items-center justify-center mx-auto mb-0.5 text-yellow-500">
                          <Crown className="w-5 h-5 opacity-40" />
                        </div>
                        <span className="text-[9px] text-stone-400 font-bold">چاوەڕوان</span>
                      </div>
                    )}

                    {/* Compact 3D Pillar Body: Gold (Tallest) */}
                    <div className="w-full relative">
                      {/* Top Capital Ledge */}
                      <div className="w-full h-2 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 dark:from-yellow-500 dark:via-amber-300 dark:to-yellow-600 rounded-t-md shadow-xs border-t border-x border-white dark:border-yellow-300" />
                      
                      {/* Pillar Shaft */}
                      <div className="w-full h-18 sm:h-22 bg-gradient-to-b from-yellow-400 via-amber-500 to-amber-600 dark:from-yellow-500 dark:via-amber-600 dark:to-yellow-800 border-x border-amber-600/50 relative overflow-hidden flex flex-col items-center justify-between py-1 shadow-inner">
                        {/* Shimmer Light Reflection */}
                        <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent anim-shimmer pointer-events-none" />
                        
                        {/* Fluting */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,rgba(255,255,255,0.35)_6px,rgba(255,255,255,0.35)_8px)] pointer-events-none" />
                        
                        {/* Embossed Numeral 1 */}
                        <div className="relative z-10 font-black text-2xl sm:text-3xl text-yellow-900 dark:text-yellow-100 drop-shadow-[0_1px_3px_rgba(255,255,255,0.7)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-mono">
                          1
                        </div>

                        {/* Pillar Label */}
                        <div className="relative z-10 text-[8px] sm:text-[9px] font-black text-amber-950 dark:text-stone-900 bg-yellow-200 dark:bg-yellow-300 px-2 py-0.2 rounded-full border border-yellow-400 shadow-xs">
                          زێڕین
                        </div>
                      </div>

                      {/* Pillar Plinth (Base) */}
                      <div className="w-full h-2.5 bg-gradient-to-b from-amber-600 to-amber-800 dark:from-amber-700 dark:to-stone-950 rounded-b-md border-b border-x border-amber-800 shadow-sm" />
                    </div>
                  </div>


                  {/* ----------------- 3RD PLACE PILLAR (BRONZE) ----------------- */}
                  <div className="flex flex-col items-center anim-pillar-bronze">
                    {top3 ? (
                      <div className="flex flex-col items-center w-full">
                        {/* Avatar & Bronze Medal */}
                        <div className="relative mb-1">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-100 dark:bg-stone-800 border-2 border-amber-700 dark:border-amber-600 shadow-sm flex items-center justify-center overflow-hidden">
                            {top3.photoURL && (!currentUserGoogleId || top3.userId !== currentUserGoogleId || !isProfilePhotoHidden()) ? (
                              <img src={top3.photoURL} alt={top3.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-800 dark:text-amber-400" />
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white border border-white dark:border-stone-800 flex items-center justify-center text-[10px] font-black shadow-xs">
                            🥉
                          </div>
                        </div>

                        {/* Player Name */}
                        <div className="text-center w-full px-0.5 mb-0.5">
                          <div className="text-[11px] sm:text-xs font-black text-stone-900 dark:text-amber-200 truncate" dir="auto" title={top3.displayName}>
                            {top3.displayName}
                          </div>
                        </div>

                        {/* Score Tag */}
                        <div className="px-1.5 py-0.2 mb-0.5 bg-amber-600/15 dark:bg-stone-800 rounded-md text-[9px] font-black text-amber-800 dark:text-amber-300 border border-amber-600/30 dark:border-stone-700">
                          {activeTab === 'most_wins' ? `${top3.wins} بردنەوە` : `${top3.gamesPlayed} یاری`}
                        </div>

                        {/* Playing Since Time */}
                        <div className="text-[8px] sm:text-[9px] text-stone-500 dark:text-stone-400 mb-1 text-center truncate max-w-full font-medium leading-tight">
                          لە {formatPlayingSince(top3.createdAt)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center mb-1.5">
                        <div className="w-8 h-8 rounded-xl border border-dashed border-amber-700/50 dark:border-stone-700 flex items-center justify-center mx-auto mb-0.5 text-amber-700">
                          <Medal className="w-4 h-4 opacity-40" />
                        </div>
                        <span className="text-[9px] text-stone-400 font-bold">چاوەڕوان</span>
                      </div>
                    )}

                    {/* Compact 3D Pillar Body: Bronze */}
                    <div className="w-full relative">
                      {/* Top Capital Ledge */}
                      <div className="w-full h-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-700 dark:via-amber-600 dark:to-amber-800 rounded-t-md shadow-xs border-t border-x border-amber-400/50" />
                      
                      {/* Pillar Shaft */}
                      <div className="w-full h-10 sm:h-12 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 dark:from-amber-800 dark:via-amber-900 dark:to-stone-950 border-x border-amber-800/60 relative overflow-hidden flex flex-col items-center justify-between py-1 shadow-inner">
                        {/* Shimmer Light Reflection */}
                        <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent anim-shimmer pointer-events-none" />
                        
                        {/* Fluting */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,rgba(255,255,255,0.2)_6px,rgba(255,255,255,0.2)_8px)] pointer-events-none" />
                        
                        {/* Embossed Numeral 3 */}
                        <div className="relative z-10 font-black text-lg sm:text-xl text-amber-200 dark:text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] font-mono">
                          3
                        </div>

                        {/* Pillar Label */}
                        <div className="relative z-10 text-[8px] sm:text-[9px] font-black text-white bg-amber-950/80 px-1.5 py-0.2 rounded-full border border-amber-700/60 shadow-xs">
                          بڕۆنز
                        </div>
                      </div>

                      {/* Pillar Plinth (Base) */}
                      <div className="w-full h-2 bg-gradient-to-b from-amber-800 to-amber-950 dark:from-stone-900 dark:to-black rounded-b-md border-b border-x border-amber-950 shadow-xs" />
                    </div>
                  </div>

                </div>
              </div>


              {/* ============================================================== */}
              {/* FULL LEADERBOARD LIST AT THE BOTTOM (ALL PLAYERS 1..N)         */}
              {/* ============================================================== */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>تەواوی ڕیزبەندی یاریزانان</span>
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold">
                    {players.length} یاریزان تۆمارکراون
                  </span>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  {players.map((player, idx) => {
                    const rankNumber = idx + 1;
                    const isCurrentUser = currentUserGoogleId && player.userId === currentUserGoogleId;
                    const isTop1 = rankNumber === 1;
                    const isTop2 = rankNumber === 2;
                    const isTop3 = rankNumber === 3;

                    return (
                      <div
                        key={player.userId}
                        className={`flex items-center justify-between p-2 sm:p-2.5 rounded-2xl border transition-all ${
                          isCurrentUser
                            ? 'bg-amber-500/15 dark:bg-amber-950/40 border-amber-500/70 ring-1 ring-amber-500/50'
                            : isTop1
                            ? 'bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent dark:from-yellow-950/30 dark:via-stone-900 dark:to-stone-900 border-yellow-400/50 dark:border-yellow-500/30'
                            : isTop2
                            ? 'bg-gradient-to-r from-slate-200/40 via-transparent to-transparent dark:from-stone-800/60 dark:to-stone-900 border-slate-300/60 dark:border-stone-700'
                            : isTop3
                            ? 'bg-gradient-to-r from-amber-700/10 via-transparent to-transparent dark:from-amber-950/30 dark:to-stone-900 border-amber-700/30 dark:border-stone-700'
                            : 'bg-[#fdfcf9] dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Rank Badge */}
                          <div className="shrink-0 flex items-center justify-center">
                            {isTop1 ? (
                              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-300 text-stone-950 font-black text-xs flex items-center justify-center shadow-xs border border-yellow-200">
                                🥇
                              </div>
                            ) : isTop2 ? (
                              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-slate-300 to-slate-100 text-stone-950 font-black text-xs flex items-center justify-center shadow-xs border border-slate-200">
                                🥈
                              </div>
                            ) : isTop3 ? (
                              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-xs flex items-center justify-center shadow-xs border border-amber-500">
                                🥉
                              </div>
                            ) : (
                              <span className="w-7 h-7 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono font-bold text-xs flex items-center justify-center border border-stone-200 dark:border-stone-700">
                                {rankNumber}
                              </span>
                            )}
                          </div>
                          
                          {/* Avatar */}
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border ${
                            isTop1 
                              ? 'border-yellow-400 bg-yellow-100 dark:bg-stone-800' 
                              : isTop2 
                              ? 'border-slate-300 bg-slate-100 dark:bg-stone-800' 
                              : isTop3 
                              ? 'border-amber-700 bg-amber-50 dark:bg-stone-800' 
                              : 'border-stone-300 dark:border-stone-700 bg-stone-200 dark:bg-stone-700/60'
                          }`}>
                            {player.photoURL && (!isCurrentUser || !isProfilePhotoHidden()) ? (
                              <img 
                                src={player.photoURL} 
                                alt={player.displayName} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <User className="w-4 h-4 text-stone-500 dark:text-stone-300" />
                            )}
                          </div>

                          {/* Player Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs sm:text-sm font-black truncate ${
                                isCurrentUser 
                                  ? 'text-amber-700 dark:text-amber-300' 
                                  : isTop1
                                  ? 'text-amber-900 dark:text-yellow-300'
                                  : 'text-stone-900 dark:text-stone-100'
                              }`} dir="auto">
                                {player.displayName}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[9px] font-black bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-full shrink-0">
                                  تۆ
                                </span>
                              )}
                              {isTop1 && (
                                <span className="text-[9px] font-black bg-yellow-400/90 text-stone-950 px-1 py-0.2 rounded-md shrink-0">
                                  پاڵەوان
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                              <span>
                                {activeTab === 'most_wins' 
                                  ? `${player.gamesPlayed} یاری ئەنجامدراو` 
                                  : `${player.wins} سەرکەوتن`}
                              </span>
                              {typeof player.winRate === 'number' && (
                                <span className="text-amber-600 dark:text-amber-400 font-bold">
                                  ({player.winRate}٪ بردنەوە)
                                </span>
                              )}
                              <span>•</span>
                              <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
                                <Calendar className="w-2.5 h-2.5 text-stone-400 inline" />
                                <span>لە یاری دەکات: {formatPlayingSince(player.createdAt)}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Primary Score Pill */}
                        <div className="flex items-center gap-2 shrink-0">
                          {activeTab === 'most_wins' ? (
                            <div className={`text-left px-2.5 py-1 rounded-xl border shadow-xs ${
                              isTop1
                                ? 'bg-yellow-500/20 border-yellow-400/60 dark:bg-yellow-950/50'
                                : 'bg-amber-50 dark:bg-stone-900/90 border-amber-200 dark:border-stone-700/60'
                            }`}>
                              <span className="text-amber-700 dark:text-amber-400 font-mono font-black text-xs sm:text-sm">
                                {player.wins}
                              </span>
                              <span className="text-[9px] sm:text-[10px] text-stone-600 dark:text-stone-400 mr-1 font-bold">بردنەوە</span>
                            </div>
                          ) : (
                            <div className="text-left bg-sky-50 dark:bg-stone-900/90 px-2.5 py-1 rounded-xl border border-sky-200 dark:border-stone-700/60 shadow-xs">
                              <span className="text-sky-700 dark:text-sky-400 font-mono font-black text-xs sm:text-sm">
                                {player.gamesPlayed}
                              </span>
                              <span className="text-[9px] sm:text-[10px] text-stone-600 dark:text-stone-400 mr-1 font-bold">یاری</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
};
