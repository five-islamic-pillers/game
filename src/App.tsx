import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, X, Dices, UserPlus, Trophy, FastForward, PlayCircle, AlertCircle, Maximize2, Minimize2, ChevronRight, ChevronLeft, Brain, HelpCircle, Layers, Palette, Users, Clock, ArrowDown, ScrollText, Gamepad2, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { BRAINTEASERS, GUESS_CARDS, type Difficulty, type CardTypes } from './data/cards';
import boardImage from './assets/board.jpg';
import bgImage from './assets/bg.png';

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

// --- Sound Manager ---
class SoundManager {
  private static ctx: AudioContext | null = null;

  static init() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Audio not supported or blocked
    }
  }

  static playTone(freq: number, type: OscillatorType, duration: number, vol: number, delay: number = 0) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch {
      // Ignore audio errors
    }
  }

  static correct() {
    this.playTone(523.25, 'sine', 0.1, 0.1); // C5
    this.playTone(659.25, 'sine', 0.1, 0.1, 0.1); // E5
    this.playTone(783.99, 'sine', 0.2, 0.1, 0.2); // G5
  }

  static wrong() {
    this.playTone(300, 'sawtooth', 0.2, 0.1);
    this.playTone(250, 'sawtooth', 0.4, 0.1, 0.2);
  }

  static roll() {
    this.playTone(800, 'square', 0.05, 0.02);
  }
  
  static tick() {
    this.playTone(400, 'sine', 0.05, 0.05);
  }

  static timerTick() {
    this.playTone(800, 'square', 0.05, 0.02);
  }

  static timeout() {
    this.playTone(200, 'sawtooth', 0.4, 0.2);
    this.playTone(150, 'sawtooth', 0.6, 0.2, 0.2);
  }

  static win() {
    this.playTone(523.25, 'sine', 0.15, 0.1, 0);      // C5
    this.playTone(659.25, 'sine', 0.15, 0.1, 0.15);   // E5
    this.playTone(783.99, 'sine', 0.15, 0.1, 0.3);    // G5
    this.playTone(1046.50, 'sine', 0.4, 0.15, 0.45);  // C6
  }
}

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
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameState, setGameState] = useState<'intro' | 'landing' | 'setup' | 'playing' | 'finished'>('intro');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [winningPlayers, setWinningPlayers] = useState<Player[]>([]);
  const [landingCardInfoPopup, setLandingCardInfoPopup] = useState<'brainteaser' | 'guess' | null>(null);
  const [specialEffectData, setSpecialEffectData] = useState<any>(null);
  const [gameDifficulty, setGameDifficulty] = useState<Difficulty>('medium');
  const [cardTypesAllowed, setCardTypesAllowed] = useState<CardTypes>('both');
  
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
  
  // Dice and Animation State
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const confettiAnimationRef = useRef<number | null>(null);

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
      SoundManager.init();
      setGameState('playing');
      setCurrentPlayerIndex(Math.floor(Math.random() * players.length));
      setTurnPhase('choose_card');
      setTimeLeft(15);
    }
  };

  const drawCard = (type: 'brainteaser' | 'guess') => {
    setActiveCardType(type);
    setShowGuessAnswer(false);
    setClueIndex(0);
    
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
    }
    
    setTurnPhase('reading_card');
    setTimeLeft(15);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setTimeLeft(null);
    if (isCorrect) {
      SoundManager.correct();
      setPlayers(prev => {
        const newPlayers = [...prev];
        newPlayers[currentPlayerIndex] = {
          ...newPlayers[currentPlayerIndex],
          score: newPlayers[currentPlayerIndex].score + 1
        };
        return newPlayers;
      });
      setTurnPhase('rolling_dice');
    } else {
      SoundManager.wrong();
      nextTurn();
    }
  };

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    let rolls = 0;
    const rollInterval = setInterval(() => {
      SoundManager.roll();
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 12) {
        clearInterval(rollInterval);
        setIsRolling(false);
        setTurnPhase('moving');
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

    // 2. Safely update actual players array using functional updater to preserve position
    setPlayers(prevPlayers => {
      const newPlayers = prevPlayers.map(p => ({...p}));
      if (skipCurrentPlayer) {
        newPlayers[currentIdx].skipTurn = true;
      }
      
      let nIdx = (currentIdx + 1) % newPlayers.length;
      let lps = 0;
      while (newPlayers[nIdx].skipTurn && lps < newPlayers.length) {
         newPlayers[nIdx].skipTurn = false;
         nIdx = (nIdx + 1) % newPlayers.length;
         lps++;
      }
      return newPlayers;
    });

    setCurrentPlayerIndex(nextIdx);
    setTurnPhase('choose_card');
    setDiceValue(null);
    setActiveCardType(null);
    setActiveCardData(null);
    setSpecialEffectData(null);
    setTimeLeft(15);
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

    if (message) {
      setSpecialEffectData({ specialMove, extraTurn, skipTurn, message });
      setTurnPhase('special_effect');
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
      }
      
      if (targetPos >= 90) {
          handleWin([playersRef.current[currentIdx]]);
      } else if (specialEffectData.extraTurn) {
          setTurnPhase('choose_card');
          setDiceValue(null);
          setSpecialEffectData(null);
          setTimeLeft(15);
      } else {
          nextTurn(specialEffectData.skipTurn);
      }
  };

  const handleWin = (winners: Player[]) => {
    setTimeLeft(null);
    setWinningPlayers(winners);
    SoundManager.win();
    
    stopConfetti();

    // Only launch confetti if there is a single winner (no tie)
    if (winners.length === 1) {
      const duration = 5500;
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
  };

  const playAgain = () => {
    stopConfetti();
    setPlayers(players.map(p => ({ ...p, position: 1, score: 0 })));
    setUsedBrainteasers([]);
    setUsedGuessCards([]);
    setCurrentPlayerIndex(0);
    setTurnPhase('choose_card');
    setTimeLeft(15);
    setDiceValue(null);
    setActiveCardType(null);
    setActiveCardData(null);
    setShowGuessAnswer(false);
    setClueIndex(0);
    setSpecialEffectData(null);
    setWinningPlayers([]);
    setGameState('playing');
  };

  const resetGame = () => {
    stopConfetti();
    setWinningPlayers([]);
    setGameState('landing');
    setPlayers([]);
    setUsedBrainteasers([]);
    setUsedGuessCards([]);
  };

  const scrollToRules = () => {
    const rulesElement = document.getElementById('rules-section');
    if (rulesElement) {
      rulesElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const boardStyle = {
    backgroundImage: "url('./board.jpg')"
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    aspectRatio: '1',
    position: 'relative' as const,
  };

  return (
    <div dir="rtl" className="w-screen h-[100dvh] overflow-hidden bg-stone-900 text-stone-900 font-sans relative flex items-center justify-center">
      
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

      {/* End Game Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-2xl font-black text-stone-800 mb-4">کۆتایی یاری</h3>
            <p className="text-stone-600 mb-8 font-medium">دڵنیایت دەتەوێت یارییەکە کۆتایی پێ بهێنیت؟ براوە دیاری دەکرێت بەپێی زۆرترین خاڵ.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowEndModal(false)} 
                className="flex-1 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200 transition-colors"
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
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                بەڵێ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Board and Floating HUD Layout (Visible during play) */}
      {gameState === 'playing' && (
        <div className="w-full h-full relative overflow-hidden bg-stone-100">
          
          {/* 1. Board Container (Full Screen / Max Size) */}
          <div className="absolute inset-0 flex items-center justify-center pt-[140px] pb-[280px] md:pt-[24px] md:pb-[24px] px-2 md:px-8 pointer-events-none">
            <div className="w-full h-full flex items-center justify-center min-w-0 min-h-0 pointer-events-none">
              <div 
                className="relative shadow-[0_0_50px_rgba(0,0,0,0.15)] rounded-xl md:rounded-2xl overflow-hidden pointer-events-auto" 
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
                      className={`absolute w-7 h-7 md:w-9 md:h-9 -ml-3.5 -mt-3.5 md:-ml-4.5 md:-mt-4.5 rounded-full border-[3px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center ${player.color}`}
                    >
                      <span className="text-white text-[11px] md:text-sm font-black drop-shadow-md">
                        {player.name.substring(0, 1)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Top Leaderboard (Score Board) */}
          <div className="absolute top-0 left-0 right-0 md:top-4 md:left-auto md:right-4 md:w-[320px] z-40 bg-white/95 backdrop-blur-2xl border-b md:border border-stone-200 md:shadow-2xl md:rounded-2xl p-3 md:p-5 flex flex-col gap-2 h-[130px] md:h-auto md:max-h-none">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2 md:pb-3 shrink-0">
              <h2 className="text-base md:text-lg font-black text-stone-800">خاڵەکان</h2>
              <button 
                onClick={() => setShowEndModal(true)}
                className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                کۆتایی
              </button>
            </div>
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[30vh] pr-1 pb-1 md:pb-0 items-center md:items-stretch">
              {[...players].sort((a, b) => b.score - a.score).map((player) => (
                <div key={player.id} className="flex items-center gap-3 px-3 py-2 md:py-2.5 bg-stone-50 rounded-xl border border-stone-200 shrink-0 min-w-[140px] md:min-w-0">
                  <div className={`w-3.5 h-3.5 rounded-full ${player.color} shadow-sm border border-stone-200 shrink-0`} />
                  <span className="font-bold text-stone-700 text-sm truncate max-w-[70px] md:max-w-[120px]">{player.name}</span>
                  <span className="mr-auto font-black text-stone-900 bg-white px-2 py-1 rounded-md border border-stone-100 shadow-sm text-sm">{player.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Bottom Action Panel */}
          <div className="absolute bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-auto md:w-[360px] z-40">
            <AnimatePresence mode="wait">
              <motion.div 
                key={turnPhase}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-white/95 backdrop-blur-2xl p-4 md:p-6 md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl border-t md:border border-stone-200 text-center relative overflow-y-auto h-[260px] md:h-auto md:max-h-none"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 md:h-2 ${players[currentPlayerIndex].color}`} />
                <span className="text-[10px] md:text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 block mt-1 md:mt-0">نۆرەی یاریزان</span>
                <h3 className="text-xl md:text-2xl font-black text-stone-900 mb-4 md:mb-6 truncate">{players[currentPlayerIndex].name}</h3>

                {turnPhase === 'choose_card' && (
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <p className="text-xs md:text-sm font-bold text-stone-600">کارتێک ڕابکێشە بۆ وەڵامدانەوە</p>
                      {timeLeft !== null && (
                        <div className={`flex items-center gap-1 font-black text-sm px-2 py-1 rounded-full ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-stone-200 text-stone-700'}`}>
                          <Clock className="w-4 h-4" />
                          <span>{timeLeft}</span>
                        </div>
                      )}
                    </div>
                    {(cardTypesAllowed === 'both' || cardTypesAllowed === 'brainteaser') && (
                      <button 
                        onClick={() => drawCard('brainteaser')}
                        className="w-full py-3 md:py-4 bg-pink-600 text-white rounded-xl md:rounded-2xl font-bold hover:bg-pink-700 transition-all flex items-center justify-center gap-2 md:gap-3 shadow-md md:shadow-lg active:scale-95 text-sm md:text-base"
                      >
                        <Brain className="w-4 h-4 md:w-5 md:h-5"/> هەڵبژاردن
                      </button>
                    )}
                    {(cardTypesAllowed === 'both' || cardTypesAllowed === 'guess') && (
                      <button 
                        onClick={() => drawCard('guess')}
                        className="w-full py-3 md:py-4 bg-sky-500 text-white rounded-xl md:rounded-2xl font-bold hover:bg-sky-600 transition-all flex items-center justify-center gap-2 md:gap-3 shadow-md md:shadow-lg active:scale-95 text-sm md:text-base"
                      >
                        <HelpCircle className="w-4 h-4 md:w-5 md:h-5"/> زانین
                      </button>
                    )}
                  </div>
                )}

                {turnPhase === 'rolling_dice' && (
                  <div>
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-inner">
                      <Check className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <p className="font-bold text-emerald-700 mb-4 md:mb-6 text-sm md:text-lg">وەڵامی ڕاست! (+١ خاڵ)</p>
                    
                    {diceValue === null ? (
                      <button 
                        onClick={rollDice}
                        disabled={isRolling}
                        className="w-full py-3 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-75 text-sm md:text-base"
                      >
                        <span>{isRolling ? '...' : 'بەختی خۆت تاقیبکەوە'}</span>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-stone-50 rounded-2xl border-4 border-stone-200 shadow-inner flex items-center justify-center overflow-hidden">
                          <motion.span 
                            key={diceValue}
                            initial={{ scale: 0.5, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-4xl md:text-5xl font-black text-stone-800"
                          >
                            {diceValue}
                          </motion.span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {turnPhase === 'moving' && diceValue !== null && (
                  <div>
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-indigo-50 rounded-2xl border-4 border-indigo-100 flex items-center justify-center mb-4 md:mb-5">
                       <span className="text-4xl md:text-5xl font-black text-indigo-600">{diceValue}</span>
                    </div>
                    <p className="font-bold text-stone-700 mb-4 md:mb-5 text-sm md:text-lg">مەیدان بڕۆ پێشەوە هەنگاو!</p>
                    <button 
                      onClick={handleMovePlayer}
                      disabled={isMoving}
                      className="w-full py-3 md:py-4 bg-stone-900 text-white rounded-xl md:rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95 shadow-lg text-sm md:text-base disabled:opacity-50"
                    >
                      {isMoving ? 'دەڕوات...' : 'جوڵە بکە'} <FastForward className="w-4 h-4 md:w-5 md:h-5"/>
                    </button>
                  </div>
                )}

                {turnPhase === 'special_effect' && specialEffectData && (
                  <div>
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-inner">
                      <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <p className="font-black text-amber-700 mb-4 md:mb-6 text-base md:text-xl leading-snug md:leading-relaxed">{specialEffectData.message}</p>
                    <button 
                      onClick={handleSpecialEffectDismiss}
                      disabled={isMoving}
                      className="w-full py-3 md:py-4 bg-amber-600 text-white rounded-xl md:rounded-2xl font-bold hover:bg-amber-700 transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95 shadow-md md:shadow-lg text-sm md:text-base disabled:opacity-50"
                    >
                      باشە
                    </button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
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
            className="absolute inset-0 z-40 bg-[#fdfaf6] overflow-y-auto"
          >
            {/* Navbar */}
          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-amber-700">٥</span>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-stone-800">یاری خێزانی</span>
                <span className="font-black text-xl text-red-700">پێنج پایەکەی ئیسلام</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8 font-bold text-stone-600">
              <button onClick={scrollToRules} className="hover:text-stone-900 transition-colors">چۆنیەتی یاریکردن</button>
              <button 
                onClick={() => setGameState('setup')}
                className="px-6 py-2.5 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors shadow-sm"
              >
                ئێستا یاری بکە
              </button>
            </div>
          </nav>

          {/* Hero Section */}
          <header 
            className="relative w-full overflow-hidden min-h-[500px] flex items-center bg-stone-100"
            style={{ 
              backgroundImage: "url('./bg.png')" 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
            <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 max-w-xl py-16">
                <h1 className="text-5xl md:text-6xl font-black text-stone-900 mb-6 leading-tight flex flex-col gap-2">
                  <span>یاری خێزانی</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-amber-600">پێنج پایەکەی ئیسلام</span>
                </h1>
                <p className="text-xl md:text-2xl font-medium text-stone-700 mb-10 leading-relaxed">
                  ئامانجی یارییەکە ئەوەیە وەڵامی ڕاستی پرسیارەکان بدەیتەوە، فێرببیت دەربارەی پێنج پایەکەی ئیسلام، و یەکەم کەس بیت بگەیتە خاڵی کۆتایی بە زۆرترین خاڵەوە.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setGameState('setup')}
                    className="px-8 py-4 bg-red-700 text-white text-lg font-bold rounded-xl hover:bg-red-800 transition-all shadow-lg shadow-red-700/20 flex items-center justify-center gap-2"
                  >
                    <Gamepad2 className="w-5 h-5" />
                    دەستپێکردنی یاری
                  </button>
                  <button 
                    onClick={scrollToRules}
                    className="px-8 py-4 bg-white text-stone-800 border-2 border-stone-200 text-lg font-bold rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
                  >
                    <ScrollText className="w-5 h-5" />
                    زانیاری زیاتر
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Cards Image Section */}
          <section className="py-16 bg-[#fdfaf6] border-y border-stone-200">
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
                  <span className="text-2xl font-black text-stone-800">کارتی زانین</span>
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
                  <span className="text-2xl font-black text-stone-800">کارتی هەڵبژاردن</span>
                </div>

              </div>

              {/* Info Row */}
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-stone-700 font-bold text-lg md:text-xl">
                <span>٦٠٠ کارتی چالەنج بۆ زیادکردنی زانیاری</span>
                <span className="hidden md:block w-px h-6 bg-stone-300"></span>
                <span>کایەیەکی گونجاو بۆ تەمەنی ٨+</span>
                <span className="hidden md:block w-px h-6 bg-stone-300"></span>
                <span>بۆ ٢-٦ یاریزان</span>
              </div>
            </div>
          </section>

          {/* Rules Section */}
          <section id="rules-section" className="py-24 bg-[#fdfaf6]">
            <div className="container mx-auto px-6 max-w-4xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-stone-900 mb-4">چۆنیەتی یاریکردن</h2>
                <p className="text-xl text-stone-600 font-medium">یاساکان زۆر ئاسانن، با دەست پێبکەین!</p>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-16 h-16 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center shrink-0">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-3">ئامانجی یاری</h3>
                    <p className="text-stone-600 leading-relaxed text-lg font-medium">ئامانجی یارییەکە ئەوەیە وەڵامی ڕاستی پرسیارەکان بدەیتەوە، فێرببیت دەربارەی پێنج پایەکەی ئیسلام، و یەکەم کەس بیت بگەیتە خاڵی کۆتایی بە زۆرترین خاڵەوە.</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-16 h-16 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center shrink-0">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-3">کارتە دیجیتاڵییەکان</h3>
                    <p className="text-stone-600 leading-relaxed text-lg mb-3 font-medium">لە نۆرەی خۆتدا، دەتوانیت کارتێک هەڵبژێریت ڕاستەوخۆ لەناو شاشەکەدا و وەڵامی بدەیتەوە!</p>
                    <ul className="list-disc list-inside text-stone-600 space-y-2 text-lg font-medium">
                      <li><strong>وەڵامی ڕاست:</strong> بەختی خۆت تاقیدەکەیتەوە و پارچەکەت دەبەیتە پێشەوە.</li>
                      <li><strong>وەڵامی هەڵە:</strong> ڕاستەوخۆ نۆرەکەت کۆتایی دێت و لە جێگای خۆت دەمێنیتەوە.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-16 text-center">
                <button 
                  onClick={() => setGameState('setup')}
                  className="px-10 py-5 bg-stone-900 text-white text-xl font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 active:scale-95"
                >
                  ئامادەیت؟ دەستپێبکە!
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 bg-stone-100 text-center text-stone-500 text-sm font-bold border-t border-stone-200">
            <div className="container mx-auto px-6">
              <p>Made by Meer Salah Mhohamed Fateh, Copyright 2026</p>
            </div>
          </footer>
          
          {/* Card Info Popup */}
          <AnimatePresence>
            {landingCardInfoPopup && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-stone-800"
                >
                  <button 
                    onClick={() => setLandingCardInfoPopup(null)}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="text-center">
                    {landingCardInfoPopup === 'guess' ? (
                      <>
                        <div className="w-20 h-20 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-stone-800">
                          <HelpCircle className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-black text-stone-800 mb-4">کارتی زانین</h3>
                        <p className="text-stone-600 font-medium text-lg leading-relaxed">
                          لە کارتی زانیندا، وەسفێکی وشەیەک دەکرێت و یاریزان دەبێت بزانێت ئەو وشەیە چییە، ئەگەر یاریزانەکە وەڵامەکەی ڕاست بوو دەتوانێت بەختی خۆی تاقیبکاتەوە!
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-stone-800">
                          <Brain className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-black text-stone-800 mb-4">کارتی هەڵبژاردن</h3>
                        <p className="text-stone-600 font-medium text-lg leading-relaxed">
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
            <div className="w-full max-w-md max-h-[95dvh] overflow-y-auto bg-white p-8 rounded-3xl shadow-2xl">
              <button 
                onClick={() => setGameState('landing')}
                className="mb-6 text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors text-sm font-bold"
              >
                <ChevronRight className="w-4 h-4" />
                گەڕانەوە
              </button>
              <h1 className="text-3xl font-black mb-2 text-center text-emerald-800">ڕێکخستنی یاری</h1>
              <p className="text-stone-500 mb-6 text-center text-sm font-bold">٢ بۆ ٦ یاریزان زیاد بکە بۆ دەستپێکردن</p>
              
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">ئاستی سەختی پرسیارەکان:</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setGameDifficulty('easy')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors ${gameDifficulty === 'easy' ? 'bg-emerald-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'}`}>ئاسان</button>
                    <button type="button" onClick={() => setGameDifficulty('medium')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors ${gameDifficulty === 'medium' ? 'bg-amber-500 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'}`}>مامناوەند</button>
                    <button type="button" onClick={() => setGameDifficulty('hard')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors ${gameDifficulty === 'hard' ? 'bg-red-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'}`}>قورس</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">جۆری پرسیارەکان:</label>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => setCardTypesAllowed('both')} className={`w-full py-2 px-3 rounded-lg font-bold text-sm transition-colors ${cardTypesAllowed === 'both' ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'}`}>هەردووکی (هەڵبژاردن و زانین)</button>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setCardTypesAllowed('brainteaser')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors ${cardTypesAllowed === 'brainteaser' ? 'bg-pink-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'}`}>تەنها هەڵبژاردن</button>
                      <button type="button" onClick={() => setCardTypesAllowed('guess')} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors ${cardTypesAllowed === 'guess' ? 'bg-sky-500 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'}`}>تەنها زانین</button>
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
                  className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                  disabled={players.length >= 6}
                />
                <button
                  type="submit"
                  disabled={!newPlayerName.trim() || players.length >= 6}
                  className="px-5 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </form>

              <div className="space-y-3 mb-8 min-h-[200px]">
                {players.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-stone-400 font-bold border-2 border-dashed border-stone-200 rounded-xl p-8 text-center">
                    هیچ یاریزانێک زیاد نەکراوە
                  </div>
                ) : (
                  players.map((player) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={player.id} 
                      className="flex items-center justify-between bg-stone-50 px-4 py-3 rounded-xl border border-stone-200 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${player.color}`} />
                        <span className="font-bold text-stone-700">{player.name}</span>
                      </div>
                      <button onClick={() => removePlayer(player.id)} className="text-stone-400 hover:text-red-500 transition-colors p-1">
                        <X className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              <button
                onClick={startGame}
                disabled={players.length < 2}
                className="w-full py-4 bg-emerald-700 text-white text-lg font-bold rounded-xl hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <PlayCircle className="w-6 h-6" />
                <span>دەستپێکردن</span>
              </button>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 lg:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-lg max-h-[95dvh] overflow-y-auto rounded-3xl p-6 lg:p-8 shadow-2xl border-4 ${
                activeCardType === 'brainteaser' ? 'bg-pink-50 border-pink-500' : 'bg-sky-50 border-sky-500'
              }`}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/10">
                {activeCardType === 'brainteaser' && <Brain className="w-8 h-8 text-pink-600" />}
                {activeCardType === 'guess' && <HelpCircle className="w-8 h-8 text-sky-600" />}
                <h2 className="text-2xl font-black text-stone-800">
                  {activeCardType === 'brainteaser' ? 'کارتی هەڵبژاردن' : 'کارتی زانین'}
                </h2>
                
                {timeLeft !== null && (
                  <div className={`mr-auto flex items-center gap-2 font-black text-xl px-4 py-1.5 rounded-full ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-stone-200 text-stone-700'}`}>
                    <Clock className="w-6 h-6" />
                    <span>{timeLeft}</span>
                  </div>
                )}
              </div>

              {/* Brainteaser Content */}
              {activeCardType === 'brainteaser' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-stone-800 text-center leading-relaxed">{activeCardData.question}</h3>
                  <div className="space-y-3">
                    {activeCardData.options.map((opt: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx === activeCardData.correctAnswer)}
                        className="w-full py-4 px-6 bg-white border-2 border-pink-200 rounded-xl font-bold text-stone-700 hover:bg-pink-100 hover:border-pink-400 transition-all text-right shadow-sm"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Guess Content */}
              {activeCardType === 'guess' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-stone-600 mb-4 text-center">نیشانەکان بخوێنەوە بزانە مەبەست چییە:</h3>
                  <div className="space-y-3">
                    {activeCardData.clues.map((clue: string, idx: number) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: idx <= clueIndex ? 1 : 0 }}
                        className="p-4 bg-white rounded-xl border border-sky-200 font-bold text-stone-700 shadow-sm"
                      >
                        {clue}
                      </motion.div>
                    ))}
                  </div>
                  
                  {!showGuessAnswer ? (
                    <div className="flex gap-3 pt-4">
                      {clueIndex < activeCardData.clues.length - 1 && (
                        <button 
                          onClick={() => setClueIndex(prev => prev + 1)}
                          className="flex-1 py-4 bg-white border-2 border-sky-300 text-sky-700 rounded-xl font-bold hover:bg-sky-50 transition-all"
                        >
                          نیشانەی داهاتوو
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setShowGuessAnswer(true);
                          setTimeLeft(null);
                        }}
                        className="flex-1 py-4 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-md"
                      >
                        بینینی وەڵام
                      </button>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t border-sky-200 mt-6 text-center">
                      <p className="text-sm font-bold text-stone-500 mb-2">وەڵام:</p>
                      <p className="text-3xl font-black text-sky-800 mb-6">{activeCardData.answer}</p>
                      <p className="text-stone-600 font-bold mb-4 text-lg">ئایا وەڵامەکەت ڕاست بوو؟</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleAnswer(true)}
                          className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <Check className="w-5 h-5"/> بەڵێ
                        </button>
                        <button 
                          onClick={() => handleAnswer(false)}
                          className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <X className="w-5 h-5"/> نەخێر
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
