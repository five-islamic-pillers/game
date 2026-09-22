import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Gamepad2, X, RefreshCw, Crown, User, ShieldCheck } from 'lucide-react';
import { 
  getMostPlayedLeaderboard, 
  getMostWinsLeaderboard, 
  type LeaderboardPlayer 
} from '../services/leaderboardService';
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
  const [activeTab, setActiveTab] = useState<'most_played' | 'most_wins'>('most_wins');
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboardData = async (tab: 'most_played' | 'most_wins') => {
    setLoading(true);
    try {
      if (tab === 'most_played') {
        const data = await getMostPlayedLeaderboard(25);
        setPlayers(data);
      } else {
        const data = await getMostWinsLeaderboard(25);
        setPlayers(data);
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
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-6" dir="rtl">
      {/* Modal Container: Off-white in light mode, Dark in dark mode */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-stone-900 dark:text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0 bg-[#f4eee4] dark:bg-stone-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                <span>ڕیزبەندی یاریزانان</span>
                <Flame className="w-4 h-4 text-orange-500" />
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                پلەبەندی ڕاستەقینەی یارییە ئۆنلاینەکان
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                SoundManager.click();
                fetchLeaderboardData(activeTab);
              }}
              title="نوێکردنەوە"
              className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: 1. Most Wins | 2. Most Played */}
        <div className="p-3 bg-[#ede6d8] dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800/80 shrink-0">
          <div className="grid grid-cols-2 gap-2 bg-[#fdfcf9] dark:bg-stone-900 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800">
            <button
              onClick={() => {
                SoundManager.click();
                setActiveTab('most_wins');
              }}
              className={`py-2 px-3 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'most_wins'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>زۆرترین بردنەوە</span>
            </button>
            <button
              onClick={() => {
                SoundManager.click();
                setActiveTab('most_played');
              }}
              className={`py-2 px-3 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'most_played'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>زۆرترین یاری</span>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-4 py-2.5 bg-amber-500/10 dark:bg-stone-800/40 border-b border-amber-500/20 dark:border-stone-800/60 flex items-center gap-2 text-[11px] text-amber-900 dark:text-amber-300 font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>تەنها یارییە ئۆنلاینە ئەنجامدراوەکان تۆمار دەکرێن و لەم ڕیزبەندییەدا هەژمار دەکرێن.</span>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2.5">
          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 text-amber-600 dark:text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-stone-500 dark:text-stone-400">بارکردنی خشتەی ڕیزبەندی...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-14 h-14 rounded-3xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-stone-800 dark:text-stone-200">
                تا ئێستا هیچ یارییەکی ئۆنلاین تەواو نەکراوە
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed font-medium">
                لەگەڵ هاوڕێکانت یاری ئۆنلاین بکە! هەر کاتێک یارییەکی ئۆنلاین کۆتایی هات، ناوی یاریزانەکان و براوەکە بە شێوەیەکی ڕاستەقینە لێرە تۆمار دەکرێت.
              </p>
            </div>
          ) : (
            players.map((player, index) => {
              const isCurrentUser = currentUserGoogleId && player.userId === currentUserGoogleId;
              const isTop1 = index === 0;
              const isTop2 = index === 1;
              const isTop3 = index === 2;

              let rankBadge = (
                <span className="w-7 h-7 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono font-bold text-xs flex items-center justify-center border border-stone-200 dark:border-stone-700">
                  {index + 1}
                </span>
              );

              if (isTop1) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-xl bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-black text-sm flex items-center justify-center border border-yellow-500/40 shadow-sm shadow-yellow-500/20">
                    🥇
                  </span>
                );
              } else if (isTop2) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-xl bg-slate-300/30 text-slate-700 dark:text-slate-200 font-black text-sm flex items-center justify-center border border-slate-300/60 shadow-sm">
                    🥈
                  </span>
                );
              } else if (isTop3) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-xl bg-amber-700/20 text-amber-700 dark:text-amber-300 font-black text-sm flex items-center justify-center border border-amber-700/40 shadow-sm">
                    🥉
                  </span>
                );
              }

              return (
                <div
                  key={player.userId}
                  className={`flex items-center justify-between p-2.5 md:p-3 rounded-2xl border transition-all ${
                    isCurrentUser
                      ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
                      : isTop1
                      ? 'bg-yellow-50/60 dark:bg-stone-800/80 border-yellow-500/40 dark:border-yellow-500/30'
                      : 'bg-[#fdfcf9] dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {rankBadge}
                    
                    <div className="w-9 h-9 rounded-xl bg-stone-200 dark:bg-stone-700/60 border border-stone-300 dark:border-stone-600/50 flex items-center justify-center overflow-hidden shrink-0 text-amber-600 dark:text-amber-400 font-bold">
                      {player.photoURL ? (
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

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs md:text-sm font-black truncate ${isCurrentUser ? 'text-amber-700 dark:text-amber-300' : 'text-stone-900 dark:text-stone-100'}`}>
                          {player.displayName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] font-black bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-full shrink-0">
                            تۆ
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                        {activeTab === 'most_wins' 
                          ? `${player.gamesPlayed} یاری ئۆنلاین` 
                          : `${player.wins} بردنەوە`}
                      </span>
                    </div>
                  </div>

                  {/* Primary Score Pill */}
                  <div className="flex items-center gap-2 shrink-0">
                    {activeTab === 'most_wins' ? (
                      <div className="text-left bg-amber-50 dark:bg-stone-900/90 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-stone-700/60 shadow-sm">
                        <span className="text-amber-700 dark:text-amber-400 font-mono font-black text-sm md:text-base">
                          {player.wins}
                        </span>
                        <span className="text-[10px] text-stone-600 dark:text-stone-400 mr-1 font-bold">بردنەوە</span>
                      </div>
                    ) : (
                      <div className="text-left bg-sky-50 dark:bg-stone-900/90 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-stone-700/60 shadow-sm">
                        <span className="text-sky-700 dark:text-sky-400 font-mono font-black text-sm md:text-base">
                          {player.gamesPlayed}
                        </span>
                        <span className="text-[10px] text-stone-600 dark:text-stone-400 mr-1 font-bold">یاری</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#f4eee4] dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            داخستن
          </button>
        </div>

      </div>
    </div>
  );
};
