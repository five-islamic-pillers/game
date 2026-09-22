import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ScrollText, 
  Dices, 
  CheckCircle2, 
  XCircle, 
  FastForward, 
  Sparkles, 
  Trophy, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Activity
} from 'lucide-react';
import type { GameLogEntry, GameLogActionType } from '../types';

interface GameLogProps {
  logs: GameLogEntry[];
  className?: string;
}

const getActionIcon = (type: GameLogActionType) => {
  switch (type) {
    case 'roll':
      return <Dices className="w-3.5 h-3.5 text-indigo-500" />;
    case 'answer_correct':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    case 'answer_wrong':
      return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
    case 'move':
      return <FastForward className="w-3.5 h-3.5 text-sky-500" />;
    case 'draw_card':
      return <HelpCircle className="w-3.5 h-3.5 text-amber-500" />;
    case 'special':
      return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
    case 'win':
      return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
    case 'game_start':
    default:
      return <Activity className="w-3.5 h-3.5 text-stone-400" />;
  }
};

const getActionBg = (type: GameLogActionType) => {
  switch (type) {
    case 'roll':
      return 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200';
    case 'answer_correct':
      return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200';
    case 'answer_wrong':
      return 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200';
    case 'move':
      return 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-200';
    case 'draw_card':
      return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200';
    case 'special':
      return 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200';
    case 'win':
      return 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200';
    case 'game_start':
    default:
      return 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-200';
  }
};

export const GameLog: React.FC<GameLogProps> = ({ logs, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });

  const displayLogs = logs.slice(-5).reverse();
  const latestLog = displayLogs[0];

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div 
      id="game-log-panel" 
      className={`z-30 pointer-events-auto transition-all duration-200 ${className}`}
    >
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-stone-200 dark:border-stone-800 shadow-xl rounded-2xl overflow-hidden transition-colors">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 md:py-2.5 bg-stone-50/80 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 select-none">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <div className="flex items-center gap-1.5 text-xs font-black text-stone-800 dark:text-stone-200">
              <ScrollText className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span>تۆماری یاری</span>
            </div>
            <span className="text-[10px] font-bold text-stone-600 dark:text-stone-300 bg-stone-200/80 dark:bg-stone-800 px-1.5 py-0.2 rounded-full">
              {logs.length}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'کەمکردنەوە' : 'فراوانکردن'}
            className="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Log Entries */}
        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-2 space-y-1.5 max-h-[160px] md:max-h-[190px] overflow-y-auto"
            >
              {displayLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, delay: index === 0 ? 0 : 0.03 }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-medium ${getActionBg(log.type)} ${
                    index === 0 ? 'ring-1 ring-stone-300/80 dark:ring-stone-600/80 shadow-xs' : 'opacity-90'
                  }`}
                >
                  <div className="shrink-0 p-1 bg-white dark:bg-stone-800 rounded-lg shadow-2xs border border-stone-200 dark:border-stone-700 flex items-center justify-center">
                    {getActionIcon(log.type)}
                  </div>

                  {log.playerColor && (
                    <span 
                      className={`w-2 h-2 rounded-full shrink-0 shadow-xs ${log.playerColor}`}
                      title={log.playerName}
                    />
                  )}

                  <div className="flex-1 truncate leading-tight">
                    {log.playerName && (
                      <span className="font-black text-stone-900 dark:text-stone-100 ml-1">
                        {log.playerName}:
                      </span>
                    )}
                    <span className="font-semibold">{log.text}</span>
                  </div>

                  {index === 0 && (
                    <span className="text-[9px] font-black uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-full shrink-0 border border-emerald-300 dark:border-emerald-800">
                      تازە
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : latestLog ? (
            /* Minimized single-line ticker view */
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(true)}
              className="px-3 py-1.5 flex items-center gap-2 text-xs cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <div className="shrink-0 p-0.5">
                {getActionIcon(latestLog.type)}
              </div>
              {latestLog.playerColor && (
                <span className={`w-2 h-2 rounded-full shrink-0 ${latestLog.playerColor}`} />
              )}
              <div className="flex-1 truncate font-medium text-stone-700 dark:text-stone-300">
                {latestLog.playerName && (
                  <span className="font-black text-stone-900 dark:text-stone-100 ml-1">
                    {latestLog.playerName}:
                  </span>
                )}
                <span>{latestLog.text}</span>
              </div>
              <span className="text-[9px] font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-full border border-stone-200 dark:border-stone-700">
                دواهەمین
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};
