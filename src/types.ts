export interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
  position: number;
  skipTurn?: boolean;
}

export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type CardTypes = 'both' | 'brainteaser' | 'guess';

export type GameLogActionType = 
  | 'roll' 
  | 'answer_correct' 
  | 'answer_wrong' 
  | 'move' 
  | 'draw_card' 
  | 'special' 
  | 'win' 
  | 'game_start';

export interface GameLogEntry {
  id: string;
  playerName?: string;
  playerColor?: string;
  type: GameLogActionType;
  text: string;
  details?: string | number;
  timestamp: number;
}

export interface GameReaction {
  id: string;
  emoji: string;
  senderName: string;
  senderColor?: string;
  timestamp: number;
}

export interface OnlineRoomData {
  roomCode: string;
  hostId: string;
  status: 'lobby' | 'playing' | 'finished';
  players: Player[];
  currentPlayerIndex: number;
  turnPhase: 'choose_card' | 'reading_card' | 'rolling_dice' | 'moving' | 'special_effect';
  activeCardType: 'brainteaser' | 'guess' | null;
  activeCardData: any;
  showGuessAnswer: boolean;
  clueIndex: number;
  timeLeft: number | null;
  diceValue: number | null;
  specialEffectData: any;
  winningPlayers: Player[];
  gameDifficulty: GameDifficulty;
  cardTypesAllowed: CardTypes;
  gameLogs?: GameLogEntry[];
  latestReaction?: GameReaction;
  recentReactions?: GameReaction[];
  forfeitedPlayerName?: string;
  updatedAt: number;
}
