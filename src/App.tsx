import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, X, Dices, UserPlus, Trophy, FastForward, PlayCircle, AlertCircle, Maximize2, Minimize2, ChevronRight, ChevronLeft, Brain, HelpCircle, Layers, Palette, Users, Clock, ArrowDown, Gamepad2, SkipForward, Smartphone, Download, Globe2, Wifi, WifiOff, Menu, Sun, Moon, ExternalLink, BookOpen, Volume2, VolumeX, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { BRAINTEASERS, GUESS_CARDS, type Difficulty, type CardTypes } from './data/cards';
import boardImage from './assets/board.jpg';
import bgImage from './assets/bg.png';
import { AndroidDownloadModal } from './components/AndroidDownloadModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HeaderNavDrawer } from './components/HeaderNavDrawer';
import { RulesModal } from './components/RulesModal';
import { GameLog } from './components/GameLog';
import { ReactionsOverlay } from './components/ReactionsOverlay';
import { subscribeToRoom, updateOnlineRoomState, sendOnlineReaction, subscribeToReactions, forfeitOnlineMatch } from './services/onlineGameService';
import { recordPlayerGameResult } from './services/leaderboardService';
import { auth } from './firebase';
import { SoundManager, type SoundToast } from './utils/sound';
import { useTheme } from './utils/theme';
import type { OnlineRoomData, GameLogEntry, GameLogActionType, GameReaction } from './types';

interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
  position: number;
  skipTurn?: boolean;
}

const PLAYER_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-400',
  'bg-purple-500',
  'bg-orange-500'
];

const BOARD_SPACES = [
  { id: 1, left: "10.71%", top: "89.63%", color: "transparent", visible: true },
  { id: 2, left: "20.33%", top: "92.57%", color: "transparent", visible: true },
  { id: 3, left: "28.54%", top: "93.15%", color: "transparent", visible: true },
  { id: 4, left: "37.93%", top: "88.81%", color: "transparent", visible: true },
  { id: 5, left: "46.14%", top: "83.53%", color: "transparent", visible: true },
  { id: 6, left: "42.86%", top: "77.32%", color: "transparent", visible: true },
  { id: 7, left: "34.76%", top: "78.26%", color: "transparent", visible: true },
  { id: 8, left: "28.43%", top: "78.72%", color: "transparent", visible: true },
  { id: 9, left: "14.58%", top: "70.16%", color: "transparent", visible: true },
  { id: 10, left: "14.11%", top: "65.94%", color: "transparent", visible: true },
  { id: 11, left: "10.59%", top: "61.71%", color: "transparent", visible: true },
  { id: 12, left: "13.76%", top: "46.35%", color: "transparent", visible: true },
  { id: 13, left: "20.33%", top: "52.10%", color: "transparent", visible: true },
  { id: 14, left: "24.20%", top: "57.61%", color: "transparent", visible: true },
  { id: 15, left: "25.26%", top: "62.54%", color: "transparent", visible: true },
  { id: 16, left: "28.07%", top: "65.94%", color: "transparent", visible: true },
  { id: 17, left: "33.24%", top: "67.58%", color: "transparent", visible: true },
  { id: 18, left: "37.46%", top: "64.18%", color: "transparent", visible: true },
  { id: 19, left: "38.28%", top: "47.99%", color: "transparent", visible: true },
  { id: 20, left: "38.16%", top: "42.36%", color: "transparent", visible: true },
  { id: 21, left: "32.53%", top: "39.43%", color: "transparent", visible: true },
  { id: 22, left: "32.06%", top: "33.79%", color: "transparent", visible: true },
  { id: 23, left: "26.78%", top: "34.50%", color: "transparent", visible: true },
  { id: 24, left: "20.92%", top: "35.91%", color: "transparent", visible: true },
  { id: 25, left: "5.67%", top: "40.95%", color: "transparent", visible: true },
  { id: 26, left: "8.01%", top: "29.81%", color: "transparent", visible: true },
  { id: 27, left: "27.60%", top: "25.82%", color: "transparent", visible: true },
  { id: 28, left: "31.83%", top: "27.46%", color: "transparent", visible: true },
  { id: 29, left: "36.40%", top: "26.40%", color: "transparent", visible: true },
  { id: 30, left: "39.69%", top: "23.24%", color: "transparent", visible: true },
  { id: 31, left: "39.80%", top: "19.01%", color: "transparent", visible: true },
  { id: 32, left: "35.82%", top: "15.61%", color: "transparent", visible: true },
  { id: 33, left: "28.66%", top: "15.02%", color: "transparent", visible: true },
  { id: 34, left: "21.27%", top: "14.32%", color: "transparent", visible: true },
  { id: 35, left: "20.57%", top: "10.10%", color: "transparent", visible: true },
  { id: 36, left: "23.97%", top: "6.34%", color: "transparent", visible: true },
  { id: 37, left: "29.95%", top: "5.29%", color: "transparent", visible: true },
  { id: 38, left: "42.62%", top: "5.29%", color: "transparent", visible: true },
  { id: 39, left: "49.31%", top: "6.81%", color: "transparent", visible: true },
  { id: 40, left: "50.36%", top: "13.15%", color: "transparent", visible: true },
  { id: 41, left: "48.37%", top: "19.37%", color: "transparent", visible: true },
  { id: 42, left: "51.07%", top: "25.70%", color: "transparent", visible: true },
  { id: 43, left: "45.08%", top: "31.21%", color: "transparent", visible: true },
  { id: 44, left: "56.11%", top: "37.20%", color: "transparent", visible: true },
  { id: 45, left: "58.46%", top: "32.97%", color: "transparent", visible: true },
  { id: 46, left: "58.93%", top: "26.40%", color: "transparent", visible: true },
  { id: 47, left: "58.69%", top: "19.95%", color: "transparent", visible: true },
  { id: 48, left: "59.51%", top: "14.44%", color: "transparent", visible: true },
  { id: 49, left: "74.65%", top: "10.10%", color: "transparent", visible: true },
  { id: 50, left: "94.12%", top: "16.67%", color: "transparent", visible: true },
  { id: 51, left: "90.95%", top: "19.60%", color: "transparent", visible: true },
  { id: 52, left: "84.38%", top: "20.54%", color: "transparent", visible: true },
  { id: 53, left: "77.81%", top: "20.54%", color: "transparent", visible: true },
  { id: 54, left: "71.60%", top: "20.77%", color: "transparent", visible: true },
  { id: 55, left: "66.90%", top: "34.85%", color: "transparent", visible: true },
  { id: 56, left: "64.67%", top: "39.19%", color: "transparent", visible: true },
  { id: 57, left: "64.32%", top: "44.12%", color: "transparent", visible: true },
  { id: 58, left: "67.61%", top: "48.69%", color: "transparent", visible: true },
  { id: 59, left: "73.47%", top: "50.57%", color: "transparent", visible: true },
  { id: 60, left: "82.74%", top: "46.70%", color: "transparent", visible: true },
  { id: 61, left: "77.46%", top: "40.72%", color: "transparent", visible: true },
  { id: 62, left: "76.64%", top: "37.20%", color: "transparent", visible: true },
  { id: 63, left: "78.52%", top: "32.03%", color: "transparent", visible: true },
  { id: 64, left: "82.39%", top: "30.16%", color: "transparent", visible: true },
  { id: 65, left: "87.08%", top: "30.04%", color: "transparent", visible: true },
  { id: 66, left: "92.13%", top: "38.49%", color: "transparent", visible: true },
  { id: 67, left: "91.77%", top: "45.88%", color: "transparent", visible: true },
  { id: 68, left: "91.77%", top: "51.74%", color: "transparent", visible: true },
  { id: 69, left: "91.77%", top: "56.08%", color: "transparent", visible: true },
  { id: 70, left: "91.19%", top: "60.19%", color: "transparent", visible: true },
  { id: 71, left: "87.67%", top: "63.94%", color: "transparent", visible: true },
  { id: 72, left: "79.81%", top: "67.81%", color: "transparent", visible: true },
  { id: 73, left: "60.69%", top: "66.29%", color: "transparent", visible: true },
  { id: 74, left: "61.86%", top: "70.75%", color: "transparent", visible: true },
  { id: 75, left: "70.77%", top: "76.50%", color: "transparent", visible: true },
  { id: 76, left: "76.41%", top: "75.67%", color: "transparent", visible: true },
  { id: 77, left: "81.57%", top: "73.68%", color: "transparent", visible: true },
  { id: 78, left: "85.79%", top: "71.22%", color: "transparent", visible: true },
  { id: 79, left: "90.48%", top: "71.45%", color: "transparent", visible: true },
  { id: 80, left: "93.77%", top: "74.85%", color: "transparent", visible: true },
  { id: 81, left: "94.00%", top: "83.42%", color: "transparent", visible: true },
  { id: 82, left: "91.42%", top: "87.64%", color: "transparent", visible: true },
  { id: 83, left: "87.43%", top: "91.39%", color: "transparent", visible: true },
  { id: 84, left: "81.92%", top: "91.98%", color: "transparent", visible: true },
  { id: 85, left: "71.60%", top: "96.20%", color: "transparent", visible: true },
  { id: 86, left: "63.15%", top: "91.39%", color: "transparent", visible: true },
  { id: 87, left: "54.47%", top: "86.35%", color: "transparent", visible: true },
  { id: 88, left: "53.76%", top: "82.71%", color: "transparent", visible: true },
  { id: 89, left: "54.23%", top: "67.35%", color: "transparent", visible: true },
  { id: 90, left: "53.53%", top: "60.78%", color: "transparent", visible: true },
  { id: 91, left: "50.83%", top: "49.98%", color: "transparent", visible: true },
    ];

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameState, setGameState] = useState<'intro' | 'landing' | 'setup' | 'playing' | 'finished'>('intro');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [winningPlayers, setWinningPlayers] = useState<Player[]>([]);
  const [landingCardInfoPopup, setLandingCardInfoPopup] = useState<'brainteaser' | 'guess' | null>(null);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [specialEffectData, setSpecialEffectData] = useState<any>(null);
  const [gameDifficulty, setGameDifficulty] = useState<Difficulty>('medium');
  const [cardTypesAllowed, setCardTypesAllowed] = useState<CardTypes>('both');
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showNavDrawer, setShowNavDrawer] = useState(false);

  // Online Multiplayer States
  const [showOnlineLobby, setShowOnlineLobby] = useState(false);
  const [onlineRoomCode, setOnlineRoomCode] = useState<string | null>(null);
  const [myOnlinePlayerId, setMyOnlinePlayerId] = useState<string | null>(null);
  const [isOnlineHost, setIsOnlineHost] = useState(false);
  const [onlineConnected, setOnlineConnected] = useState(false);
  const [initialOnlineRoomCode, setInitialOnlineRoomCode] = useState<string | null>(null);

  // Check URL query parameters for direct room joining (e.g. ?room=1234)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const roomParam = searchParams.get('room') || searchParams.get('join');
      if (roomParam) {
        setInitialOnlineRoomCode(roomParam.trim());
        setShowOnlineLobby(true);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);
  
  // Game Loop States
  const [turnPhase, setTurnPhase] = useState<'choose_card' | 'reading_card' | 'rolling_dice' | 'moving' | 'special_effect'>('choose_card');
  const [activeCardType, setActiveCardType] = useState<'brainteaser' | 'guess' | null>(null);
  const [activeCardData, setActiveCardData] = useState<any>(null);
  const [showGuessAnswer, setShowGuessAnswer] = useState(false);
  const [clueIndex, setClueIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Track drawn cards to prevent repeats
  const [usedBrainteasers, setUsedBrainteasers] = useState<number[]>([]);
  const [usedGuessCards, setUsedGuessCards] = useState<number[]>([]);
  
  // Game Actions Log (for immediate feedback)
  const [gameLogs, setGameLogs] = useState<GameLogEntry[]>([]);

  // In-Game Emoji Reactions
  const [floatingReactions, setFloatingReactions] = useState<GameReaction[]>([]);
  const seenReactionIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (floatingReactions.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingReactions(prev => prev.slice(1));
    }, 2800);
    return () => clearTimeout(timer);
  }, [floatingReactions]);

  // Dice and Animation State
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const confettiAnimationRef = useRef<number | null>(null);
  const hasTriggeredWinEffectRef = useRef(false);
  const hasRecordedLeaderboardResultRef = useRef(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => SoundManager.isSoundMuted());
  const [activeSoundToast, setActiveSoundToast] = useState<SoundToast | null>(null);
  const soundToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubMute = SoundManager.subscribeToMute((muted) => {
      setIsSoundMuted(muted);
    });

    const unsubToast = SoundManager.subscribeToToast((toast) => {
      setActiveSoundToast(toast);
      if (soundToastTimeoutRef.current) {
        clearTimeout(soundToastTimeoutRef.current);
      }
      soundToastTimeoutRef.current = setTimeout(() => {
        setActiveSoundToast(null);
      }, 2300);
    });

    return () => {
      unsubMute();
      unsubToast();
      if (soundToastTimeoutRef.current) {
        clearTimeout(soundToastTimeoutRef.current);
      }
    };
  }, []);

  const stopConfetti = () => {
    if (confettiAnimationRef.current) {
      cancelAnimationFrame(confettiAnimationRef.current);
      confettiAnimationRef.current = null;
    }
    try {
      confetti.reset();
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (gameState === 'landing') {
      stopConfetti();
    }
  }, [gameState]);

  useEffect(() => {
    return () => {
      stopConfetti();
    };
  }, []);

  // Refs to fix stale closures in async timeouts
  const playersRef = React.useRef(players);
  const currentPlayerIndexRef = React.useRef(currentPlayerIndex);
  
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    currentPlayerIndexRef.current = currentPlayerIndex;
  }, [currentPlayerIndex]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timerId = setTimeout(() => {
      SoundManager.timerTick();
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      if (turnPhase === 'reading_card') {
        SoundManager.timeout();
        setTimeLeft(null);
        if (activeCardType === 'guess') {
          setShowGuessAnswer(true);
        } else {
          setSpecialEffectData({
            message: "کاتەکەت تەواو بوو! نۆرەکەت فەوتا.",
            specialMove: 0,
            extraTurn: false,
            skipTurn: false
          });
          setTurnPhase('special_effect');
        }
      } else if (turnPhase === 'choose_card') {
        const type = cardTypesAllowed === 'both' ? (Math.random() > 0.5 ? 'brainteaser' : 'guess') : cardTypesAllowed;
        drawCard(type);
      }
    }
  }, [timeLeft, turnPhase, activeCardType]);

  // Online multiplayer Firestore subscription
  useEffect(() => {
    if (!onlineRoomCode) {
      setOnlineConnected(false);
      return;
    }

    setOnlineConnected(true);
    const unsubscribeRoom = subscribeToRoom(onlineRoomCode, (roomData) => {
      if (!roomData) return;

      if (roomData.status === 'playing') {
        if (gameState !== 'playing') setGameState('playing');
      } else if (roomData.status === 'finished') {
        if (roomData.winningPlayers && roomData.winningPlayers.length > 0) {
          setWinningPlayers(roomData.winningPlayers);
        } else {
          // Room was ended or disbanded
          setGameState('landing');
          setOnlineRoomCode(null);
        }
      }

      if (roomData.players && roomData.players.length > 0) {
        setPlayers(roomData.players);
      }
      if (typeof roomData.currentPlayerIndex === 'number') {
        setCurrentPlayerIndex(roomData.currentPlayerIndex);
      }
      if (roomData.turnPhase) {
        setTurnPhase(roomData.turnPhase);
      }
      setActiveCardType(roomData.activeCardType || null);
      setActiveCardData(roomData.activeCardData || null);
      setShowGuessAnswer(roomData.showGuessAnswer ?? false);
      setClueIndex(roomData.clueIndex ?? 0);
      setTimeLeft(roomData.timeLeft);
      setDiceValue(roomData.diceValue);
      setSpecialEffectData(roomData.specialEffectData || null);
      if (roomData.gameLogs && Array.isArray(roomData.gameLogs)) {
        setGameLogs(roomData.gameLogs);
      }
      if (roomData.winningPlayers && roomData.winningPlayers.length > 0) {
        setWinningPlayers(roomData.winningPlayers);
        if (!hasTriggeredWinEffectRef.current) {
          handleWin(roomData.winningPlayers);
        }
      }

      // Check recent reactions list from main room document
      if (Array.isArray(roomData.recentReactions)) {
        roomData.recentReactions.forEach((rx) => {
          if (rx && rx.id && !seenReactionIdsRef.current.has(rx.id)) {
            seenReactionIdsRef.current.add(rx.id);
            SoundManager.reaction();
            setFloatingReactions(prev => [...prev.slice(-6), rx]);
          }
        });
      } else if (roomData.latestReaction && !seenReactionIdsRef.current.has(roomData.latestReaction.id)) {
        seenReactionIdsRef.current.add(roomData.latestReaction.id);
        SoundManager.reaction();
        setFloatingReactions(prev => [...prev.slice(-6), roomData.latestReaction!]);
      }
    });

    // Dedicated listener for subcollection reactions across all players
    const unsubscribeReactions = subscribeToReactions(onlineRoomCode, (incomingReaction) => {
      if (incomingReaction && incomingReaction.id && !seenReactionIdsRef.current.has(incomingReaction.id)) {
        seenReactionIdsRef.current.add(incomingReaction.id);
        SoundManager.reaction();
        setFloatingReactions(prev => [...prev.slice(-6), incomingReaction]);
      }
    });

    return () => {
      unsubscribeRoom();
      unsubscribeReactions();
    };
  }, [onlineRoomCode]);

  // Handle sending emoji reactions
  const handleSendReaction = (emoji: string) => {
    const myPlayer = myOnlinePlayerId 
      ? players.find(p => p.id === myOnlinePlayerId)
      : players[currentPlayerIndex];

    const reaction: GameReaction = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      emoji,
      senderName: myPlayer?.name || 'یاریزان',
      senderColor: myPlayer?.color || 'bg-amber-500',
      timestamp: Date.now()
    };

    seenReactionIdsRef.current.add(reaction.id);
    setFloatingReactions(prev => [...prev.slice(-6), reaction]);

    if (onlineRoomCode) {
      sendOnlineReaction(onlineRoomCode, reaction);
    }
  };

  // Handle online match forfeit
  const handleForfeitMatch = async () => {
    SoundManager.click();
    setShowForfeitModal(false);
    if (onlineRoomCode) {
      const myPlayer = myOnlinePlayerId 
        ? players.find(p => p.id === myOnlinePlayerId) 
        : players[currentPlayerIndex];
      const myName = myPlayer?.name || 'یاریزان';
      await forfeitOnlineMatch(onlineRoomCode, myOnlinePlayerId || '', myName);
    }
    resetGame();
  };

  // Sync state helper to firestore if in online game and user is active player
  const syncOnlineRoom = (updates: Partial<OnlineRoomData>) => {
    if (!onlineRoomCode) return;
    updateOnlineRoomState(onlineRoomCode, updates).catch(err => {
      console.error("Failed to sync room state:", err);
    });
  };

  // Helper checking if current player is allowed to make turn moves
  const isMyTurn = !onlineRoomCode || (players[currentPlayerIndex]?.id === myOnlinePlayerId);

  // Helper to add game log entry and sync
  const addGameLog = (
    type: GameLogActionType,
    text: string,
    playerName?: string,
    playerColor?: string,
    details?: string | number
  ) => {
    const newEntry: GameLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      text,
      playerName,
      playerColor,
      details,
      timestamp: Date.now()
    };

    setGameLogs(prev => {
      const updated = [...prev.slice(-19), newEntry];
      if (onlineRoomCode) {
        syncOnlineRoom({ gameLogs: updated });
      }
      return updated;
    });
  };

  // Online Game start callback from OnlineLobbyModal
  const handleOnlineGameStart = (roomCode: string, myPlayerId: string, initialRoom: OnlineRoomData) => {
    stopConfetti();
    hasTriggeredWinEffectRef.current = false;
    hasRecordedLeaderboardResultRef.current = false;
    setOnlineRoomCode(roomCode);
    setMyOnlinePlayerId(myPlayerId);
    setIsOnlineHost(initialRoom.hostId === myPlayerId);
    setPlayers(initialRoom.players || []);
    setCurrentPlayerIndex(initialRoom.currentPlayerIndex ?? 0);
    setTurnPhase(initialRoom.turnPhase || 'choose_card');
    setGameDifficulty(initialRoom.gameDifficulty || 'medium');
    setCardTypesAllowed(initialRoom.cardTypesAllowed || 'both');
    setTimeLeft(initialRoom.timeLeft ?? 30);
    setGameLogs(initialRoom.gameLogs || [{
      id: `start-${Date.now()}`,
      type: 'game_start',
      text: 'یاری ئۆنلاین دەستیپێکرد! بەختی باش بۆ هەمووان.',
      timestamp: Date.now()
    }]);
    setShowOnlineLobby(false);
    setGameState('playing');
  };

  // Intro Sequence
  useEffect(() => {
    if (gameState === 'intro') {
      const timer = setTimeout(() => {
        setGameState('landing');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim() && players.length < 6) {
      setPlayers([...players, { 
        id: crypto.randomUUID(), 
        name: newPlayerName.trim(), 
        score: 0,
        color: PLAYER_COLORS[players.length],
        position: 1
      }]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const startGame = () => {
    if (players.length >= 2) {
      stopConfetti();
      hasTriggeredWinEffectRef.current = false;
      hasRecordedLeaderboardResultRef.current = false;
      SoundManager.init();
      setGameState('playing');
      const startIdx = Math.floor(Math.random() * players.length);
      setCurrentPlayerIndex(startIdx);
      setTurnPhase('choose_card');
      setTimeLeft(30);

      const initialLogs: GameLogEntry[] = [
        {
          id: `start-${Date.now()}`,
          type: 'game_start',
          text: 'یاری دەستیپێکرد! بەختی باش بۆ هەمووان.',
          timestamp: Date.now()
        },
        {
          id: `turn-0-${Date.now() + 1}`,
          type: 'draw_card',
          playerName: players[startIdx].name,
          playerColor: players[startIdx].color,
          text: 'یەکەم نۆرەی یارییە',
          timestamp: Date.now() + 1
        }
      ];
      setGameLogs(initialLogs);
    }
  };

  const drawCard = (type: 'brainteaser' | 'guess') => {
    setActiveCardType(type);
    setShowGuessAnswer(false);
    setClueIndex(0);
    
    let chosenCard: any = null;
    if (type === 'brainteaser') {
      const allOfDiff = BRAINTEASERS.filter(c => c.difficulty === gameDifficulty);
      let available = allOfDiff.filter(c => !usedBrainteasers.includes(c.id));
      if (available.length === 0) {
        available = allOfDiff;
        setUsedBrainteasers([]); 
      }
      const randomCard = available[Math.floor(Math.random() * available.length)];
      setUsedBrainteasers([...usedBrainteasers, randomCard.id]);
      setActiveCardData(randomCard);
      chosenCard = randomCard;
    } else {
      const allOfDiff = GUESS_CARDS.filter(c => c.difficulty === gameDifficulty);
      let available = allOfDiff.filter(c => !usedGuessCards.includes(c.id));
      if (available.length === 0) {
        available = allOfDiff;
        setUsedGuessCards([]);
      }
      const randomCard = available[Math.floor(Math.random() * available.length)];
      setUsedGuessCards([...usedGuessCards, randomCard.id]);
      setActiveCardData(randomCard);
      chosenCard = randomCard;
    }
    
    setTurnPhase('reading_card');
    setTimeLeft(30);

    const currentP = playersRef.current[currentPlayerIndexRef.current] || players[currentPlayerIndex];
    if (currentP) {
      addGameLog(
        'draw_card',
        type === 'brainteaser' ? 'کارتی هەڵبژاردنی ڕاکێشا' : 'کارتی زانینی ڕاکێشا',
        currentP.name,
        currentP.color
      );
    }

    syncOnlineRoom({
      activeCardType: type,
      activeCardData: chosenCard,
      turnPhase: 'reading_card',
      showGuessAnswer: false,
      clueIndex: 0,
      timeLeft: 30
    });
  };

  const handleAnswer = (isCorrect: boolean) => {
    setTimeLeft(null);
    const currentP = playersRef.current[currentPlayerIndexRef.current] || players[currentPlayerIndex];

    if (isCorrect) {
      SoundManager.correct();
      if (currentP) {
        addGameLog(
          'answer_correct',
          'بە دروستی وەڵامی دایەوە (+١ خاڵ)',
          currentP.name,
          currentP.color
        );
      }
      let updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex] = {
        ...updatedPlayers[currentPlayerIndex],
        score: updatedPlayers[currentPlayerIndex].score + 1
      };
      setPlayers(updatedPlayers);
      setTurnPhase('rolling_dice');
      syncOnlineRoom({
        players: updatedPlayers,
        turnPhase: 'rolling_dice',
        timeLeft: null
      });
    } else {
      SoundManager.wrong();
      if (currentP) {
        addGameLog(
          'answer_wrong',
          'وەڵامەکەی هەڵە بوو',
          currentP.name,
          currentP.color
        );
      }
      nextTurn();
    }
  };

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    let rolls = 0;
    const rollInterval = setInterval(() => {
      SoundManager.roll();
      const val = Math.floor(Math.random() * 6) + 1;
      setDiceValue(val);
      rolls++;
      if (rolls > 12) {
        clearInterval(rollInterval);
        setIsRolling(false);
        setTurnPhase('moving');
        const currentP = playersRef.current[currentPlayerIndexRef.current] || players[currentPlayerIndex];
        if (currentP) {
          addGameLog(
            'roll',
            `بەختی خۆی تاقی کردەوە: ${val}`,
            currentP.name,
            currentP.color,
            val
          );
        }
        syncOnlineRoom({
          diceValue: val,
          turnPhase: 'moving'
        });
      }
    }, 100);
  };

  const nextTurn = (skipCurrentPlayer = false) => {
    const currentIdx = currentPlayerIndexRef.current;
    
    // 1. Compute next index using refs (safe because skipTurn is stable here)
    const mockPlayers = playersRef.current.map(p => ({...p}));
    if (skipCurrentPlayer) mockPlayers[currentIdx].skipTurn = true;
    
    let nextIdx = (currentIdx + 1) % mockPlayers.length;
    let loops = 0;
    while (mockPlayers[nextIdx].skipTurn && loops < mockPlayers.length) {
       mockPlayers[nextIdx].skipTurn = false;
       nextIdx = (nextIdx + 1) % mockPlayers.length;
       loops++;
    }

    let updatedPlayers = playersRef.current.map(p => ({...p}));
    if (skipCurrentPlayer) {
      updatedPlayers[currentIdx].skipTurn = true;
    }
    let nIdx = (currentIdx + 1) % updatedPlayers.length;
    let lps = 0;
    while (updatedPlayers[nIdx].skipTurn && lps < updatedPlayers.length) {
       updatedPlayers[nIdx].skipTurn = false;
       nIdx = (nIdx + 1) % updatedPlayers.length;
       lps++;
    }

    setPlayers(updatedPlayers);
    setCurrentPlayerIndex(nextIdx);
    setTurnPhase('choose_card');
    setDiceValue(null);
    setActiveCardType(null);
    setActiveCardData(null);
    setSpecialEffectData(null);
    setTimeLeft(30);

    syncOnlineRoom({
      players: updatedPlayers,
      currentPlayerIndex: nextIdx,
      turnPhase: 'choose_card',
      diceValue: null,
      activeCardType: null,
      activeCardData: null,
      specialEffectData: null,
      timeLeft: 30
    });
  };

  const handleMovePlayer = async () => {
    if (diceValue === null || isMoving) return;
    setIsMoving(true);
    
    const currentIdx = currentPlayerIndexRef.current;
    const player = playersRef.current[currentIdx];
    const targetPos = Math.min(player.position + diceValue, 90);
    
    // Step-by-step forward movement
    for (let i = player.position + 1; i <= targetPos; i++) {
      await new Promise(r => setTimeout(r, 250));
      SoundManager.tick();
      setPlayers(prev => {
        const newP = [...prev];
        newP[currentIdx] = {
          ...newP[currentIdx],
          position: i
        };
        return newP;
      });
    }
    
    let message = null;
    let specialMove = 0;
    let extraTurn = false;
    let skipTurn = false;

    if ([4, 55, 81].includes(targetPos)) {
      message = "دیسان بەختی خۆت تاقی بکەرەوە !";
      extraTurn = true;
    } else if ([12, 65, 89].includes(targetPos)) {
      skipTurn = true;
      message = "سەرەیەک بفەوتێنە!";
    } else if ([25, 74].includes(targetPos)) {
      specialMove = 1;
      message = "١ هەنگاو بڕۆ پێشەوە!";
    } else if ([13, 42, 60].includes(targetPos)) {
      specialMove = 2;
      message = "٢ هەنگاو بڕۆ پێشەوە!";
    } else if ([19, 38, 87].includes(targetPos)) {
      specialMove = -1;
      message = "١ هەنگاو بگەڕێوە دواوە!";
    } else if ([49, 72].includes(targetPos)) {
      specialMove = -2;
      message = "٢ هەنگاو بگەڕێوە دواوە!";
    }

    setIsMoving(false);

    addGameLog(
      'move',
      `جوڵا بۆ خانەی ${targetPos}`,
      player.name,
      player.color,
      targetPos
    );

    if (message) {
      addGameLog(
        'special',
        message,
        player.name,
        player.color
      );
      setSpecialEffectData({ specialMove, extraTurn, skipTurn, message });
      setTurnPhase('special_effect');
      syncOnlineRoom({
        specialEffectData: { specialMove, extraTurn, skipTurn, message },
        turnPhase: 'special_effect'
      });
    } else {
      if (targetPos >= 90) handleWin([playersRef.current[currentIdx]]);
      else nextTurn();
    }
  };

  const handleSpecialEffectDismiss = async () => {
      if (isMoving || !specialEffectData) return;
      
      const currentIdx = currentPlayerIndexRef.current;
      const player = playersRef.current[currentIdx];
      const targetPos = Math.min(Math.max(player.position + specialEffectData.specialMove, 1), 90);
      
      if (specialEffectData.specialMove !== 0) {
          setIsMoving(true);
          setTurnPhase('moving'); 
          const step = specialEffectData.specialMove > 0 ? 1 : -1;
          let curr = player.position;
          
          while (curr !== targetPos) {
              curr += step;
              await new Promise(r => setTimeout(r, 250));
              SoundManager.tick();
              setPlayers(prev => {
                  const newP = [...prev];
                  newP[currentIdx] = {
                    ...newP[currentIdx],
                    position: curr
                  };
                  return newP;
              });
          }
          setIsMoving(false);
          addGameLog(
            'special',
            `بەهۆی کاریگەرییەوە گەیشتە خانەی ${targetPos}`,
            player.name,
            player.color,
            targetPos
          );
      }
      
      if (targetPos >= 90) {
          handleWin([playersRef.current[currentIdx]]);
      } else if (specialEffectData.extraTurn) {
          setTurnPhase('choose_card');
          setDiceValue(null);
          setSpecialEffectData(null);
          setTimeLeft(30);
          syncOnlineRoom({
            turnPhase: 'choose_card',
            diceValue: null,
            specialEffectData: null,
            timeLeft: 30
          });
      } else {
          nextTurn(specialEffectData.skipTurn);
      }
  };

  const handleWin = (winners: Player[]) => {
    setTimeLeft(null);
    setWinningPlayers(winners);

    const isFirstTime = !hasTriggeredWinEffectRef.current;
    if (isFirstTime) {
      hasTriggeredWinEffectRef.current = true;
      SoundManager.win();
    }
    
    if (winners.length === 1) {
      addGameLog(
        'win',
        'گەیشتە کۆتایی و یارییەکەی بردەوە! 🏆',
        winners[0].name,
        winners[0].color
      );
    } else {
      addGameLog(
        'win',
        `یاری کۆتایی هات! براوەکان: ${winners.map(w => w.name).join('، ')}`,
        undefined,
        undefined
      );
    }

    syncOnlineRoom({
      winningPlayers: winners,
      status: 'finished',
      timeLeft: null
    });

    // Record on leaderboard accurately for authenticated user (Online or Local)
    if (!hasRecordedLeaderboardResultRef.current) {
      hasRecordedLeaderboardResultRef.current = true;
      try {
        const currentUser = auth?.currentUser;
        if (currentUser && currentUser.uid) {
          const userDisplayName = (currentUser.displayName || currentUser.email?.split('@')[0] || 'یاریزان').trim();
          const isWinner = winners.some(w => {
            const wName = (w.name || '').trim().toLowerCase();
            return (
              (myOnlinePlayerId && w.id === myOnlinePlayerId) ||
              (userDisplayName && wName === userDisplayName.toLowerCase()) ||
              (currentUser.email && wName === currentUser.email.split('@')[0].toLowerCase())
            );
          });

          recordPlayerGameResult({
            userId: currentUser.uid,
            displayName: userDisplayName,
            photoURL: currentUser.photoURL || undefined,
            isWinner
          });
        }
      } catch (e) {
        console.error('Failed to update leaderboard stats', e);
      }
    }

    if (isFirstTime) {
      stopConfetti();

      // Only launch confetti if there is a single winner (no tie)
      if (winners.length === 1) {
        const duration = 4000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 6,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
            zIndex: 9999
          });
          confetti({
            particleCount: 6,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
            zIndex: 9999
          });

          if (Date.now() < end) {
            confettiAnimationRef.current = requestAnimationFrame(frame);
          } else {
            confettiAnimationRef.current = null;
          }
        };
        confettiAnimationRef.current = requestAnimationFrame(frame);
      }
    }
  };

  const playAgain = () => {
    stopConfetti();
    hasTriggeredWinEffectRef.current = false;
    hasRecordedLeaderboardResultRef.current = false;
    const restartedPlayers = players.map(p => ({ ...p, position: 1, score: 0 }));
    setPlayers(restartedPlayers);
    setUsedBrainteasers([]);
    setUsedGuessCards([]);
    setCurrentPlayerIndex(0);
    setTurnPhase('choose_card');
    setTimeLeft(30);
    setDiceValue(null);
    setActiveCardType(null);
    setActiveCardData(null);
    setShowGuessAnswer(false);
    setClueIndex(0);
    setSpecialEffectData(null);
    setWinningPlayers([]);
    const initialLogs: GameLogEntry[] = [{
      id: `restart-${Date.now()}`,
      type: 'game_start',
      text: 'یاری نوێ دەستیپێکردەوە!',
      timestamp: Date.now()
    }];
    setGameLogs(initialLogs);
    setGameState('playing');

    syncOnlineRoom({
      players: restartedPlayers,
      currentPlayerIndex: 0,
      turnPhase: 'choose_card',
      status: 'playing',
      timeLeft: 30,
      diceValue: null,
      activeCardType: null,
      activeCardData: null,
      showGuessAnswer: false,
      clueIndex: 0,
      specialEffectData: null,
      winningPlayers: [],
      gameLogs: initialLogs
    });
  };

  const resetGame = () => {
    stopConfetti();
    hasTriggeredWinEffectRef.current = false;
    setWinningPlayers([]);
    setGameState('landing');
    setPlayers([]);
    setUsedBrainteasers([]);
    setUsedGuessCards([]);
    setGameLogs([]);
    setOnlineRoomCode(null);
    setMyOnlinePlayerId(null);
    setIsOnlineHost(false);
    setOnlineConnected(false);
  };

  const boardStyle = {
    backgroundImage: `url(${boardImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    aspectRatio: '1',
    position: 'relative' as const,
  };

  return (
    <div dir="rtl" className="w-screen h-[100dvh] overflow-hidden bg-[#fdfaf6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans relative flex items-center justify-center transition-colors">
      
      {/* Winning Overlay */}
      <AnimatePresence>
        {winningPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 md:p-8 text-center text-white ${winningPlayers.length === 1 ? winningPlayers[0].color : 'bg-stone-800'}`}
          >
            <motion.div
              initial={{ y: 50, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              className="relative z-10 w-full max-w-3xl mx-auto"
            >
              <Trophy className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 drop-shadow-xl text-yellow-300" />
              <h2 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-md">{winningPlayers.length > 1 ? 'یەکسان بوون!' : 'بژی ئەی بەندەی خوا'}</h2>
              <p className="text-2xl md:text-5xl font-bold mb-8 drop-shadow-md leading-tight">
                {winningPlayers.length > 1 ? (
                  <>
                    یاریزانان <span className="font-black text-white px-4 py-2 bg-black/20 rounded-xl inline-block mx-2 my-2">{winningPlayers.map(p => p.name).join(' و ')}</span> یارییەکەیان بەیەکسانی تەواو کرد!
                  </>
                ) : (
                  <>
                    یاریزان <span className="font-black text-white px-4 py-2 bg-black/20 rounded-xl mx-2">{winningPlayers[0].name}</span> یارییەکەی بردەوە!
                  </>
                )}
              </p>
              <div className="text-xl md:text-3xl font-bold bg-white/30 inline-block px-8 py-4 rounded-2xl shadow-inner border-2 border-white/50 mb-10">
                بە کۆکردنەوەی <span className="font-black text-3xl md:text-5xl ml-2">{winningPlayers[0].score}</span> خاڵ
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={playAgain}
                  className="px-8 py-4 bg-white text-stone-900 text-lg md:text-xl font-bold rounded-2xl hover:bg-stone-100 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <RotateCcw className="w-6 h-6" />
                  یارییەکی نوێ
                </button>
                <button 
                  onClick={resetGame}
                  className="px-8 py-4 bg-black/30 text-white border-2 border-white/40 text-lg md:text-xl font-bold rounded-2xl hover:bg-black/50 hover:scale-105 transition-all flex items-center justify-center gap-3"
                >
                  گەڕانەوە بۆ بەشی ماڵەوە
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Game Modal (For Local Matches) */}
      {showEndModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center text-stone-900 dark:text-stone-100 transition-colors">
            <h3 className="text-2xl font-black text-stone-800 dark:text-stone-100 mb-4">کۆتایی یاری</h3>
            <p className="text-stone-600 dark:text-stone-300 mb-8 font-medium">دڵنیایت دەتەوێت یارییەکە کۆتایی پێ بهێنیت؟ براوە دیاری دەکرێت بەپێی زۆرترین خاڵ.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowEndModal(false)} 
                className="flex-1 py-3 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                نەخێر
              </button>
              <button 
                onClick={() => { 
                  setShowEndModal(false); 
                  const highestScore = Math.max(...players.map(p => p.score));
                  const winners = players.filter(p => p.score === highestScore);
                  handleWin(winners);
                }} 
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
              >
                بەڵێ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Match Forfeit Modal (Only allows forfeiting/surrendering in Online Matches) */}
      {showForfeitModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" dir="rtl">
          <div className="bg-[#faf8f5] dark:bg-stone-900 border-2 border-rose-500/50 rounded-3xl p-6 md:p-8 shadow-2xl max-w-sm w-full text-center text-stone-900 dark:text-white transition-all animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Flag className="w-7 h-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-stone-900 dark:text-white mb-2">کشانەوە لە یاری (تەسلیمبوون)</h3>
            <p className="text-stone-600 dark:text-stone-300 text-xs md:text-sm mb-6 leading-relaxed font-medium">
              دڵنیایت دەتەوێت لەم یارییە ئۆنلاینە بکشێیتەوە؟ لە کاتی کشانەوەدا یاریزانی بەرامبەر وەک براوە دەستنیشان دەکرێت.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  SoundManager.click();
                  setShowForfeitModal(false);
                }} 
                className="flex-1 py-3 bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-black rounded-xl transition-all cursor-pointer text-xs md:text-sm"
              >
                پەشیمانم (مانەوە)
              </button>
              <button 
                onClick={handleForfeitMatch} 
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-all cursor-pointer text-xs md:text-sm shadow-lg shadow-rose-600/30 active:scale-95"
              >
                بەڵێ، کشانەوە
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Board and Responsive HUD Layout (Visible during play) */}
      {gameState === 'playing' && (
        <div className="w-full h-full relative overflow-hidden bg-stone-100 dark:bg-stone-950 flex flex-col md:block transition-colors">
          
          {/* 1. Top Leaderboard (Score Board) */}
          {/* Mobile (< md): Ultra-compact top bar (~46px) with room code, player avatars & scores, app & end buttons */}
          {/* Desktop (md:): Floating card at top-right md:w-[320px] md:top-4 md:right-4 */}
          <div className="w-full md:w-[320px] md:absolute md:top-4 md:left-auto md:right-4 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border-b md:border border-stone-200 dark:border-stone-800 md:shadow-2xl md:rounded-2xl p-2 md:p-5 flex flex-col gap-1.5 md:gap-2 shrink-0 transition-colors">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-1.5 md:pb-3 shrink-0">
              <div className="flex items-center gap-1.5 md:gap-2">
                <h2 className="text-sm md:text-lg font-black text-stone-800 dark:text-stone-100">خاڵەکان</h2>
                {onlineRoomCode && (
                  <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-black bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800" title={`ژووری ئۆنلاین: ${onlineRoomCode}`}>
                    <Globe2 className="w-3 h-3 text-sky-600 animate-spin" />
                    <span>#{onlineRoomCode}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  id="board-download-android-btn"
                  onClick={() => setShowAndroidModal(true)}
                  title="داگرتنی ئەپی ئەندرۆید (APK)"
                  className="px-2 py-0.5 md:px-2.5 md:py-1 text-[11px] md:text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Smartphone className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span>ئەپ</span>
                </button>
                {onlineRoomCode ? (
                  <button 
                    id="board-forfeit-btn"
                    onClick={() => {
                      SoundManager.click();
                      setShowForfeitModal(true);
                    }}
                    className="px-2.5 py-1 text-[11px] md:text-xs font-black bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
                    title="کشانەوە لەم یارییە (تەسلیمبوون)"
                  >
                    <Flag className="w-3 h-3 md:w-3.5 md:h-3.5 text-rose-500" />
                    <span>کشانەوە</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      SoundManager.click();
                      setShowEndModal(true);
                    }}
                    className="px-2.5 py-1 text-[11px] md:text-xs font-bold bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
                  >
                    کۆتایی
                  </button>
                )}
              </div>
            </div>

            {/* Players Score Strip (Horizontal scroll on mobile, stacked on desktop) */}
            <div className="flex flex-row md:flex-col gap-1.5 md:gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[30vh] pr-0.5 pb-0.5 md:pb-0 items-center md:items-stretch scrollbar-none">
              {[...players].sort((a, b) => b.score - a.score).map((player) => {
                const isCurrentPlayer = players[currentPlayerIndex]?.id === player.id;
                return (
                  <div 
                    key={player.id} 
                    className={`flex items-center gap-2 px-2.5 py-1 md:py-2.5 rounded-lg md:rounded-xl border shrink-0 transition-all ${
                      isCurrentPlayer 
                        ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500 shadow-sm ring-1.5 md:ring-2 ring-amber-400/50 scale-[1.02]' 
                        : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700/60'
                    }`}
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <div className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full ${player.color} shadow-sm border border-stone-200 dark:border-stone-700`} />
                      {isCurrentPlayer && (
                        <span className="absolute -inset-1 rounded-full bg-amber-400 opacity-75 animate-ping pointer-events-none" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 truncate max-w-[85px] md:max-w-[130px]">
                      <span className={`text-xs md:text-sm truncate ${isCurrentPlayer ? 'font-black text-amber-950 dark:text-amber-200' : 'font-bold text-stone-700 dark:text-stone-200'}`}>
                        {player.name}
                      </span>
                      {isCurrentPlayer && (
                        <span className="shrink-0 px-1 py-0.2 bg-amber-600 text-[9px] md:text-[10px] text-white font-black rounded-full leading-tight animate-pulse">
                          نۆرەیە
                        </span>
                      )}
                    </div>
                    <span className={`mr-auto font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded md:rounded-md border shadow-sm text-xs md:text-sm ${
                      isCurrentPlayer 
                        ? 'bg-amber-100/80 dark:bg-amber-900/60 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200' 
                        : 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-900 dark:text-stone-100'
                    }`}>
                      {player.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Board Container (Center) */}
          {/* On Mobile: flex-1 takes ALL remaining vertical space between top and bottom bars! */}
          {/* On Desktop: absolute inset-0 pt-[24px] pb-[24px] px-8 */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center p-1 sm:p-2 relative md:absolute md:inset-0 md:pt-[24px] md:pb-[24px] md:px-8 pointer-events-none">
            <div className="w-full h-full flex items-center justify-center min-w-0 min-h-0 pointer-events-none">
              <div 
                className="relative shadow-[0_4px_24px_rgba(0,0,0,0.18)] rounded-xl md:rounded-2xl overflow-hidden pointer-events-auto max-w-full max-h-full" 
                style={{ 
                  ...boardStyle, 
                  height: '100%',
                  maxHeight: '100%',
                  maxWidth: '100%',
                  aspectRatio: '1 / 1'
                }}
              >
                {/* Draw Pawns */}
                {players.map((player) => {
                  const space = BOARD_SPACES.find(s => s.id === player.position) || BOARD_SPACES[0];
                  
                  // Offset logic for players on same space
                  const sameSpotPlayers = players.filter(p => p.position === player.position);
                  const playerIndexOnSpot = sameSpotPlayers.findIndex(p => p.id === player.id);
                  
                  const offsetX = (playerIndexOnSpot % 2 === 0 ? 1 : -1) * (Math.floor((playerIndexOnSpot+1) / 2) * 8);
                  const offsetY = playerIndexOnSpot > 0 ? (playerIndexOnSpot % 2 === 0 ? -8 : 8) : 0;

                  return (
                    <motion.div
                      key={player.id}
                      initial={{ left: space.left, top: space.top, x: offsetX, y: offsetY }}
                      animate={{ left: space.left, top: space.top, x: offsetX, y: offsetY }}
                      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                      className={`absolute w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 -ml-3 -mt-3 sm:-ml-3.5 sm:-mt-3.5 md:-ml-4.5 md:-mt-4.5 rounded-full border-2 md:border-[3px] border-white shadow-[0_2px_8px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center ${player.color}`}
                    >
                      <span className="text-white text-[10px] sm:text-[11px] md:text-sm font-black drop-shadow-md">
                        {player.name.substring(0, 1)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Bottom Action Panel */}
          {/* Mobile: compact responsive controller bar (h-auto py-2.5 px-3). Desktop: floating card md:w-[360px] md:absolute md:bottom-4 md:left-4 */}
          <div className="w-full md:w-[360px] md:absolute md:bottom-4 md:left-4 md:right-auto z-40 shrink-0">
            <AnimatePresence mode="wait">
              <motion.div 
                key={turnPhase}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl p-2.5 sm:p-3 md:p-6 md:rounded-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:shadow-2xl border-t md:border border-stone-200 dark:border-stone-800 text-center relative overflow-hidden h-auto max-h-[150px] md:max-h-none transition-colors"
              >
                <div className={`absolute top-0 left-0 w-full h-1 md:h-2 ${players[currentPlayerIndex]?.color || 'bg-amber-600'}`} />
                <div className="flex items-center justify-center gap-2 mb-1 mt-0.5">
                  <span className="text-[10px] md:text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">نۆرەی یاریزان</span>
                  <span className="text-xs md:text-base font-black text-stone-900 dark:text-stone-100 truncate max-w-[120px] md:max-w-[180px]">{players[currentPlayerIndex]?.name || 'یاریزان'}</span>
                  {onlineRoomCode && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isMyTurn ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 animate-pulse' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>
                      {isMyTurn ? 'نۆرەی تۆیە!' : 'چاوەڕێ بە...'}
                    </span>
                  )}
                </div>

                {turnPhase === 'choose_card' && (
                  <div className="space-y-1.5 md:space-y-3">
                    <div className="flex items-center justify-between mb-1 md:mb-3">
                      <p className="text-[11px] md:text-sm font-bold text-stone-600 dark:text-stone-300 truncate">
                        {isMyTurn ? 'کارتێک ڕابکێشە بۆ وەڵامدانەوە' : 'چاوەڕوانی یاریزان بکە...'}
                      </p>
                      {timeLeft !== null && (
                        <div className={`flex items-center gap-1 font-black text-xs md:text-sm px-2 py-0.5 rounded-full ${timeLeft <= 5 ? 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 animate-pulse' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'}`}>
                          <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>{timeLeft}</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(cardTypesAllowed === 'both' || cardTypesAllowed === 'brainteaser') && (
                        <button 
                          onClick={() => drawCard('brainteaser')}
                          disabled={!isMyTurn}
                          className="w-full py-2 md:py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-1.5 md:gap-3 shadow-md active:scale-95 text-xs md:text-base disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Brain className="w-3.5 h-3.5 md:w-5 md:h-5"/> <span>هەڵبژاردن</span>
                        </button>
                      )}
                      {(cardTypesAllowed === 'both' || cardTypesAllowed === 'guess') && (
                        <button 
                          onClick={() => drawCard('guess')}
                          disabled={!isMyTurn}
                          className="w-full py-2 md:py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-1.5 md:gap-3 shadow-md active:scale-95 text-xs md:text-base disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5 md:w-5 md:h-5"/> <span>زانین</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {turnPhase === 'rolling_dice' && (
                  <div className="flex items-center justify-center gap-3">
                    {diceValue === null ? (
                      <button 
                        onClick={rollDice}
                        disabled={isRolling || !isMyTurn}
                        className="w-full py-2.5 md:py-3.5 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-xs md:text-base cursor-pointer"
                      >
                        <Dices className="w-4 h-4 md:w-5 md:h-5" />
                        <span>{isRolling ? '...' : isMyTurn ? 'وەڵامی ڕاست! بەختی خۆت تاقی بکەرەوە 🎲' : 'چاوەڕێی تاقیکردنەوەی بەخت بە...'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-3 py-1">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-stone-50 dark:bg-stone-800 rounded-xl border-2 border-stone-200 dark:border-stone-700 shadow-inner flex items-center justify-center">
                          <motion.span 
                            key={diceValue}
                            initial={{ scale: 0.5, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-2xl md:text-3xl font-black text-stone-800 dark:text-stone-100"
                          >
                            {diceValue}
                          </motion.span>
                        </div>
                        <span className="text-xs md:text-sm font-bold text-stone-700 dark:text-stone-300">ئەنجامی بەخت: {diceValue} هەنگاو</span>
                      </div>
                    )}
                  </div>
                )}

                {turnPhase === 'moving' && diceValue !== null && (
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 md:w-12 md:h-12 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-center shrink-0">
                       <span className="text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400">{diceValue}</span>
                    </div>
                    <button 
                      onClick={handleMovePlayer}
                      disabled={isMoving || !isMyTurn}
                      className="flex-1 py-2 md:py-3.5 bg-stone-900 dark:bg-stone-800 text-white rounded-xl md:rounded-2xl font-bold hover:bg-stone-800 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md text-xs md:text-base disabled:opacity-50 cursor-pointer"
                    >
                      <span>{isMoving ? 'دەڕوات...' : isMyTurn ? `جوڵە بکە (${diceValue} هەنگاو)` : 'چاوەڕوانی جوڵە بە...'}</span>
                      <FastForward className="w-3.5 h-3.5 md:w-5 md:h-5"/>
                    </button>
                  </div>
                )}

                {turnPhase === 'special_effect' && specialEffectData && (
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-xs md:text-sm font-bold text-amber-700 dark:text-amber-300 truncate">{specialEffectData.message}</p>
                    <button 
                      onClick={handleSpecialEffectDismiss}
                      disabled={isMoving || !isMyTurn}
                      className="py-2 px-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all text-xs md:text-sm cursor-pointer"
                    >
                      {isMyTurn ? 'باشە' : 'چاوەڕێ بە...'}
                    </button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* 4. Small Game Log Component */}
          {/* On Mobile: sits right above action panel or compact ticker */}
          {/* On Desktop: md:absolute md:bottom-4 md:right-4 md:w-[320px] */}
          <div className="w-full md:w-[320px] md:absolute md:bottom-4 md:right-4 z-30 shrink-0 px-2 pb-1 md:p-0">
            <GameLog logs={gameLogs} />
          </div>

          {/* 5. In-Game Reactions Overlay & Trigger */}
          <ReactionsOverlay 
            floatingReactions={floatingReactions}
            onSendReaction={handleSendReaction}
            myPlayerName={myOnlinePlayerId ? (players.find(p => p.id === myOnlinePlayerId)?.name || 'من') : (players[currentPlayerIndex]?.name || 'من')}
          />
        </div>
      )}

      {/* Intro Sequence */}
      <AnimatePresence>
        {gameState === 'intro' && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-900"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl">پێنج پایەکەی ئیسلام</h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-2xl text-emerald-200 font-medium"
              >
                یاری خێزانی
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Landing Page */}
      <AnimatePresence>
        {gameState === 'landing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-40 bg-[#fdfaf6] dark:bg-[#14111c] text-stone-900 dark:text-stone-100 overflow-y-auto transition-colors"
          >
            {/* Navbar with Off-white Theme and Dark/Light Mode toggle */}
          <nav className="sticky top-0 z-50 bg-[#faf8f5]/90 dark:bg-stone-900/90 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl font-black text-amber-700 dark:text-amber-500">٥</span>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-stone-700 dark:text-stone-300 text-xs md:text-sm">یاری خێزانی</span>
                <span className="font-black text-lg md:text-xl text-red-700 dark:text-red-500">پێنج پایەکەی ئیسلام</span>
              </div>
            </div>

            {/* Header controls: Sound toggle, Dark/Light toggle and Three-line Hamburger menu */}
            <div className="flex items-center gap-2">
              <button
                id="header-sound-toggle-btn"
                type="button"
                onClick={() => {
                  SoundManager.toggleMute();
                }}
                className={`p-2.5 rounded-xl border shadow-sm transition-all cursor-pointer active:scale-95 ${
                  isSoundMuted
                    ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                    : 'bg-[#fdfcf9] hover:bg-[#f3ede1] dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-200/90 dark:border-stone-700/80'
                }`}
                title={isSoundMuted ? 'بێدەنگکراوە - کرتە بکە بۆ چالاککردنی دەنگ' : 'دەنگ چالاکە - کرتە بکە بۆ بێدەنگکردن'}
                aria-label="Toggle sound"
              >
                {isSoundMuted ? (
                  <VolumeX className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </button>

              <button
                id="header-theme-toggle-btn"
                type="button"
                onClick={() => {
                  SoundManager.click();
                  toggleTheme();
                }}
                className="p-2.5 bg-[#fdfcf9] hover:bg-[#f3ede1] dark:bg-stone-800 dark:hover:bg-stone-700 active:scale-95 text-stone-700 dark:text-stone-200 rounded-xl border border-stone-200/90 dark:border-stone-700/80 shadow-sm transition-all cursor-pointer"
                title={theme === 'dark' ? 'گۆڕین بۆ دۆخی ڕووناک' : 'گۆڕین بۆ دۆخی تاریک'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-stone-700" />
                )}
              </button>

              <button 
                id="header-hamburger-menu-btn"
                type="button"
                onClick={() => {
                  SoundManager.click();
                  setShowNavDrawer(true);
                }}
                className="flex items-center gap-2 px-3.5 md:px-4 py-2.5 bg-[#fdfcf9] hover:bg-[#f3ede1] dark:bg-stone-800 dark:hover:bg-stone-700 active:scale-95 text-stone-800 dark:text-stone-100 rounded-xl text-sm font-black shadow-sm border border-stone-200/90 dark:border-stone-700/80 transition-all cursor-pointer group"
                title="پێڕستی سەرەکی"
              >
                <Menu className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
                <span>پێڕست</span>
              </button>
            </div>
          </nav>

          {/* Hero Section */}
          <header 
            className="relative w-full overflow-hidden min-h-[500px] flex items-center bg-stone-100 dark:bg-stone-900 transition-colors"
            style={{ 
              backgroundImage: `url(${bgImage})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-white/40 dark:bg-black/65 backdrop-blur-[2px] transition-colors"></div>
            <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-3/5 max-w-2xl py-12 md:py-16">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-stone-900 dark:text-stone-100 mb-6 leading-tight flex flex-col gap-2">
                  <span>یاری خێزانی</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-amber-600 to-amber-500">پێنج پایەکەی ئیسلام</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl font-medium text-stone-700 dark:text-stone-300 mb-8 md:mb-10 leading-relaxed">
                  ئامانجی یارییەکە ئەوەیە وەڵامی ڕاستی پرسیارەکان بدەیتەوە، فێرببیت دەربارەی پێنج پایەکەی ئیسلام، و یەکەم کەس بیت بگەیتە خاڵی کۆتایی بە زۆرترین خاڵەوە.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 max-w-fit">
                  <button 
                    type="button"
                    onClick={() => {
                      SoundManager.click();
                      setGameState('setup');
                    }}
                    className="px-5 sm:px-6 py-3.5 sm:py-4 bg-red-700 hover:bg-red-800 active:scale-95 text-white text-sm sm:text-base md:text-lg font-bold rounded-xl transition-all shadow-lg shadow-red-700/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Gamepad2 className="w-5 h-5 shrink-0" />
                    <span>یاریکردنی ناوخۆیی</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      SoundManager.click();
                      setShowOnlineLobby(true);
                    }}
                    className="px-5 sm:px-6 py-3.5 sm:py-4 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-sm sm:text-base md:text-lg font-bold rounded-xl transition-all shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Globe2 className="w-5 h-5 shrink-0" />
                    <span>یاریکردنی ئۆنلاین</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      SoundManager.click();
                      setShowRulesModal(true);
                    }}
                    className="px-5 sm:px-6 py-3.5 sm:py-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-sm sm:text-base md:text-lg font-bold rounded-xl transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <BookOpen className="w-5 h-5 shrink-0" />
                    <span>یاساکانی یاری</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Cards Image Section */}
          <section className="py-16 bg-[#fdfaf6] dark:bg-stone-950 border-y border-stone-200 dark:border-stone-850 transition-colors">
            <div className="container mx-auto px-6 text-center flex flex-col items-center">
              <div className="flex gap-8 md:gap-16 justify-center items-center mb-10">
                
                {/* Guess Card */}
                <div className="flex flex-col items-center gap-4">
                  <motion.div 
                    initial={{ rotate: -5 }}
                    whileHover={{ rotate: 0, scale: 1.05 }}
                    onClick={() => setLandingCardInfoPopup('guess')}
                    className="w-40 h-56 md:w-48 md:h-64 bg-[#3b82f6] rounded-xl border-4 border-stone-800 shadow-[8px_8px_0px_rgba(41,37,36,1)] flex items-center justify-center relative overflow-hidden cursor-pointer"
                  >
                     <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center z-10">
                       <HelpCircle className="w-8 h-8 text-white/80" />
                     </div>
                  </motion.div>
                  <span className="text-2xl font-black text-stone-800 dark:text-stone-100">کارتی زانین</span>
                </div>

                {/* Brainteaser Card */}
                <div className="flex flex-col items-center gap-4">
                  <motion.div 
                    initial={{ rotate: 5 }}
                    whileHover={{ rotate: 0, scale: 1.05 }}
                    onClick={() => setLandingCardInfoPopup('brainteaser')}
                    className="w-40 h-56 md:w-48 md:h-64 bg-[#a33b5c] rounded-xl border-4 border-stone-800 shadow-[8px_8px_0px_rgba(41,37,36,1)] flex items-center justify-center relative overflow-hidden cursor-pointer"
                  >
                     <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center z-10">
                       <Brain className="w-8 h-8 text-white/80" />
                     </div>
                  </motion.div>
                  <span className="text-2xl font-black text-stone-800 dark:text-stone-100">کارتی هەڵبژاردن</span>
                </div>

              </div>

              {/* Info Row */}
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-stone-700 dark:text-stone-300 font-bold text-lg md:text-xl">
                <span>٦٠٠ کارتی چالەنج بۆ زیادکردنی زانیاری</span>
                <span className="hidden md:block w-px h-6 bg-stone-300 dark:bg-stone-700"></span>
                <span>کایەیەکی گونجاو بۆ تەمەنی ٨+</span>
                <span className="hidden md:block w-px h-6 bg-stone-300 dark:bg-stone-700"></span>
                <span>بۆ ٢-٦ یاریزان</span>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 bg-stone-100 dark:bg-stone-900 text-center text-stone-500 dark:text-stone-400 text-sm font-bold border-t border-stone-200 dark:border-stone-800 transition-colors">
            <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>دروستکراوە لەلایەن میر صڵاح بۆ کەناڵی ئافەرین , Copyright 2026</p>
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSf97Y6co7TdU19T5IHrzI4PEeHFozeskRfHImQsahewxVHsag/viewform?usp=publish-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:text-red-600 dark:hover:text-red-400 hover:underline font-bold transition-colors"
              >
                <span>ڕاپۆرتکردنی کێشە لە یاری</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </footer>
          
          {/* Card Info Popup */}
          <AnimatePresence>
            {landingCardInfoPopup && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-stone-900 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-stone-800 dark:border-stone-700 text-stone-900 dark:text-stone-100 transition-colors"
                >
                  <button 
                    onClick={() => setLandingCardInfoPopup(null)}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-1"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="text-center">
                    {landingCardInfoPopup === 'guess' ? (
                      <>
                        <div className="w-20 h-20 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-stone-800 dark:border-stone-700">
                          <HelpCircle className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-black text-stone-800 dark:text-stone-100 mb-4">کارتی زانین</h3>
                        <p className="text-stone-600 dark:text-stone-300 font-medium text-lg leading-relaxed">
                          لە کارتی زانیندا، وەسفێکی وشەیەک دەکرێت و یاریزان دەبێت بزانێت ئەو وشەیە چییە، ئەگەر یاریزانەکە وەڵامەکەی ڕاست بوو دەتوانێت بەختی خۆی تاقیبکاتەوە!
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-stone-800 dark:border-stone-700">
                          <Brain className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-black text-stone-800 dark:text-stone-100 mb-4">کارتی هەڵبژاردن</h3>
                        <p className="text-stone-600 dark:text-stone-300 font-medium text-lg leading-relaxed">
                          لە کارتی هەڵبژاردندا، پرسیارێکت ئاراستە دەکرێت لەگەڵ چەند هەڵبژاردنێک. ئەگەر وەڵامی ڕاست هەڵبژێریت، خاڵێک بەدەست دەهێنیت و بەختی خۆت تاقیدەکەیتەوە!
                        </p>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Setup Screen */}
      <AnimatePresence>
        {gameState === 'setup' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-stone-900/80 backdrop-blur-md"
          >
            <div className="w-full max-w-md max-h-[95dvh] overflow-y-auto bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 transition-colors">
              <button 
                onClick={() => setGameState('landing')}
                className="mb-6 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 flex items-center gap-1 transition-colors text-sm font-bold cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                گەڕانەوە
              </button>
              <h1 className="text-3xl font-black mb-2 text-center text-emerald-800 dark:text-emerald-400">ڕێکخستنی یاری</h1>
              <p className="text-stone-500 dark:text-stone-400 mb-6 text-center text-sm font-bold">٢ بۆ ٦ یاریزان زیاد بکە بۆ دەستپێکردن</p>
              
              <div className="bg-stone-50 dark:bg-stone-800/80 p-4 rounded-xl border border-stone-200 dark:border-stone-700 mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-200 mb-2">ئاستی سەختی پرسیارەکان:</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setGameDifficulty('easy')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors cursor-pointer ${gameDifficulty === 'easy' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>ئاسان</button>
                    <button type="button" onClick={() => setGameDifficulty('medium')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors cursor-pointer ${gameDifficulty === 'medium' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>مامناوەند</button>
                    <button type="button" onClick={() => setGameDifficulty('hard')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors cursor-pointer ${gameDifficulty === 'hard' ? 'bg-red-600 text-white shadow-sm' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>قورس</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-200 mb-2">جۆری پرسیارەکان:</label>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => setCardTypesAllowed('both')} className={`w-full py-2 px-3 rounded-lg font-bold text-sm transition-colors cursor-pointer ${cardTypesAllowed === 'both' ? 'bg-stone-800 dark:bg-amber-600 text-white shadow-sm' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>هەردووکی (هەڵبژاردن و زانین)</button>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCardTypesAllowed('brainteaser')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors cursor-pointer ${cardTypesAllowed === 'brainteaser' ? 'bg-pink-600 text-white shadow-sm' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>تەنها هەڵبژاردن</button>
                      <button type="button" onClick={() => setCardTypesAllowed('guess')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors cursor-pointer ${cardTypesAllowed === 'guess' ? 'bg-sky-500 text-white shadow-sm' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>تەنها زانین</button>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddPlayer} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="ناوی یاریزان..."
                  className="flex-1 px-4 py-3 bg-stone-50 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                  disabled={players.length >= 6}
                />
                <button
                  type="submit"
                  disabled={!newPlayerName.trim() || players.length >= 6}
                  className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </form>

              <div className="space-y-3 mb-8 min-h-[200px]">
                {players.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-stone-400 dark:text-stone-500 font-bold border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl p-8 text-center">
                    هیچ یاریزانێک زیاد نەکراوە
                  </div>
                ) : (
                  players.map((player) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={player.id} 
                      className="flex items-center justify-between bg-stone-50 dark:bg-stone-800/80 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3.5 h-3.5 rounded-full ${player.color} shadow-sm`} />
                        <span className="font-bold text-stone-700 dark:text-stone-200">{player.name}</span>
                      </div>
                      <button onClick={() => removePlayer(player.id)} className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={startGame}
                  disabled={players.length < 2}
                  className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white text-lg font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <PlayCircle className="w-6 h-6" />
                  <span>دەستپێکردنی یاری ناوخۆیی</span>
                </button>
                <button
                  onClick={() => setShowOnlineLobby(true)}
                  className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Globe2 className="w-5 h-5" />
                  <span>دەستپێکردنی ژووری ئۆنلاین (فرە-یاریزان)</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards Modal Overlay */}
      <AnimatePresence>
        {turnPhase === 'reading_card' && activeCardData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 lg:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-lg max-h-[95dvh] overflow-y-auto rounded-3xl p-6 lg:p-8 shadow-2xl border-4 transition-colors ${
                activeCardType === 'brainteaser' 
                  ? 'bg-pink-50 dark:bg-stone-900 border-pink-500 dark:border-pink-600 text-stone-900 dark:text-stone-100' 
                  : 'bg-sky-50 dark:bg-stone-900 border-sky-500 dark:border-sky-600 text-stone-900 dark:text-stone-100'
              }`}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/10 dark:border-white/10">
                {activeCardType === 'brainteaser' && <Brain className="w-8 h-8 text-pink-600 dark:text-pink-400" />}
                {activeCardType === 'guess' && <HelpCircle className="w-8 h-8 text-sky-600 dark:text-sky-400" />}
                <h2 className="text-2xl font-black text-stone-800 dark:text-stone-100">
                  {activeCardType === 'brainteaser' ? 'کارتی هەڵبژاردن' : 'کارتی زانین'}
                </h2>
                
                {timeLeft !== null && (
                  <div className={`mr-auto flex items-center gap-2 font-black text-xl px-4 py-1.5 rounded-full ${timeLeft <= 5 ? 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 animate-pulse' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'}`}>
                    <Clock className="w-6 h-6" />
                    <span>{timeLeft}</span>
                  </div>
                )}
              </div>

              {/* Brainteaser Content */}
              {activeCardType === 'brainteaser' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 text-center leading-relaxed">{activeCardData.question}</h3>
                  <div className="space-y-3">
                    {activeCardData.options.map((opt: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx === activeCardData.correctAnswer)}
                        disabled={!isMyTurn}
                        className="w-full py-4 px-6 bg-white dark:bg-stone-800/90 border-2 border-pink-200 dark:border-pink-800/60 rounded-xl font-bold text-stone-700 dark:text-stone-200 hover:bg-pink-100 dark:hover:bg-pink-950/50 hover:border-pink-400 dark:hover:border-pink-600 transition-all text-right shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {!isMyTurn && (
                    <p className="text-sm font-bold text-stone-500 dark:text-stone-400 text-center animate-pulse">
                      چاوەڕێی {players[currentPlayerIndex]?.name} بە وەڵام هەڵبژێرێت...
                    </p>
                  )}
                </div>
              )}

              {/* Guess Content */}
              {activeCardType === 'guess' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-stone-600 dark:text-stone-300 mb-4 text-center">نیشانەکان بخوێنەوە بزانە مەبەست چییە:</h3>
                  <div className="space-y-3">
                    {activeCardData.clues.map((clue: string, idx: number) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: idx <= clueIndex ? 1 : 0 }}
                        className="p-4 bg-white dark:bg-stone-800/90 rounded-xl border border-sky-200 dark:border-sky-800/60 font-bold text-stone-700 dark:text-stone-200 shadow-sm"
                      >
                        {clue}
                      </motion.div>
                    ))}
                  </div>
                  
                  {!showGuessAnswer ? (
                    <div className="space-y-3 pt-4">
                      <div className="flex gap-3">
                        {clueIndex < activeCardData.clues.length - 1 && (
                          <button 
                            onClick={() => {
                              const nextIdx = clueIndex + 1;
                              setClueIndex(nextIdx);
                              syncOnlineRoom({ clueIndex: nextIdx });
                            }}
                            disabled={!isMyTurn}
                            className="flex-1 py-4 bg-white dark:bg-stone-800 border-2 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 rounded-xl font-bold hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            نیشانەی داهاتوو
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setShowGuessAnswer(true);
                            setTimeLeft(null);
                            syncOnlineRoom({ showGuessAnswer: true, timeLeft: null });
                          }}
                          disabled={!isMyTurn}
                          className="flex-1 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          بینینی وەڵام
                        </button>
                      </div>
                      {!isMyTurn && (
                        <p className="text-sm font-bold text-stone-500 dark:text-stone-400 text-center animate-pulse">
                          چاوەڕێی {players[currentPlayerIndex]?.name} بە بۆ پشکنینی وەڵام...
                        </p>
                      )}
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t border-sky-200 dark:border-sky-800 mt-6 text-center">
                      <p className="text-sm font-bold text-stone-500 dark:text-stone-400 mb-2">وەڵام:</p>
                      <p className="text-3xl font-black text-sky-800 dark:text-sky-300 mb-6">{activeCardData.answer}</p>
                      <p className="text-stone-600 dark:text-stone-300 font-bold mb-4 text-lg">ئایا وەڵامەکەت ڕاست بوو؟</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleAnswer(true)}
                          disabled={!isMyTurn}
                          className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Check className="w-5 h-5"/> بەڵێ
                        </button>
                        <button 
                          onClick={() => handleAnswer(false)}
                          disabled={!isMyTurn}
                          className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <X className="w-5 h-5"/> نەخێر
                        </button>
                      </div>
                      {!isMyTurn && (
                        <p className="text-sm font-bold text-stone-500 dark:text-stone-400 text-center mt-3 animate-pulse">
                          تەنها {players[currentPlayerIndex]?.name} دەتوانێت بڕیار لەسەر دروستی وەڵام بدات.
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Android App & APK Download Modal */}
      <AndroidDownloadModal 
        isOpen={showAndroidModal} 
        onClose={() => setShowAndroidModal(false)} 
      />

      {/* Online Multiplayer Lobby Modal */}
      <OnlineLobbyModal 
        isOpen={showOnlineLobby}
        initialRoomCode={initialOnlineRoomCode}
        onClose={() => {
          setShowOnlineLobby(false);
          setInitialOnlineRoomCode(null);
        }}
        onGameStart={handleOnlineGameStart}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
      />

      {/* Header Navigation Drawer (Hamburger Menu) */}
      <HeaderNavDrawer
        isOpen={showNavDrawer}
        onClose={() => setShowNavDrawer(false)}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenOnlineLobby={() => setShowOnlineLobby(true)}
        onPlayLocal={() => setGameState('setup')}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenAndroidModal={() => setShowAndroidModal(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Game Rules Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      {/* Leaderboard Modal (Most Wins & Most Played) */}
      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        currentUserGoogleId={auth?.currentUser?.uid}
      />

      {/* Subtle Visual Toast Notification for Sound Mute/Unmute Confirmation */}
      <AnimatePresence>
        {activeSoundToast && (
          <motion.div
            key={activeSoundToast.id}
            initial={{ opacity: 0, y: -30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.94 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={() => setActiveSoundToast(null)}
            className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[200] max-w-[92vw] sm:max-w-md pointer-events-auto cursor-pointer select-none"
            role="status"
            aria-live="polite"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.4)] border backdrop-blur-xl transition-all ${
              activeSoundToast.muted
                ? 'bg-stone-900/95 text-white border-rose-500/50 ring-1 ring-rose-500/20'
                : 'bg-stone-900/95 text-white border-emerald-500/50 ring-1 ring-emerald-500/20'
            }`}>
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                activeSoundToast.muted
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {activeSoundToast.muted ? (
                  <VolumeX className="w-5 h-5 md:w-5.5 md:h-5.5 animate-pulse" />
                ) : (
                  <Volume2 className="w-5 h-5 md:w-5.5 md:h-5.5" />
                )}
              </div>

              <div className="flex flex-col text-right leading-tight min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs md:text-sm text-stone-100">
                    {activeSoundToast.message}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                    activeSoundToast.muted
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  }`}>
                    {activeSoundToast.muted ? 'Muted' : 'Sound ON'}
                  </span>
                </div>
                {activeSoundToast.submessage && (
                  <span className="text-[11px] text-stone-400 font-medium truncate mt-0.5">
                    {activeSoundToast.submessage}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
