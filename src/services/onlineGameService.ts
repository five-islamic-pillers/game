import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Player, OnlineRoomData } from '../types';

export const PLAYER_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-400',
  'bg-purple-500',
  'bg-orange-500'
];

export function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function createOnlineRoom(
  hostName: string, 
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  cardTypesAllowed: 'both' | 'brainteaser' | 'guess' = 'both'
): Promise<{ roomCode: string; playerId: string }> {
  const roomCode = generateRoomCode();
  const playerId = 'player_' + Math.random().toString(36).substring(2, 9);
  
  const hostPlayer: Player = {
    id: playerId,
    name: hostName.trim() || 'یاریزان ١',
    score: 0,
    color: PLAYER_COLORS[0],
    position: 1,
    skipTurn: false
  };

  const initialRoom: OnlineRoomData = {
    roomCode,
    hostId: playerId,
    status: 'lobby',
    players: [hostPlayer],
    currentPlayerIndex: 0,
    turnPhase: 'choose_card',
    activeCardType: null,
    activeCardData: null,
    showGuessAnswer: false,
    clueIndex: 0,
    timeLeft: 30,
    diceValue: null,
    specialEffectData: null,
    winningPlayers: [],
    gameDifficulty: difficulty,
    cardTypesAllowed,
    updatedAt: Date.now()
  };

  const roomRef = doc(db, 'rooms', roomCode);
  await setDoc(roomRef, initialRoom);

  return { roomCode, playerId };
}

export async function joinOnlineRoom(
  roomCode: string, 
  playerName: string
): Promise<{ playerId: string } | { error: string }> {
  const cleanCode = roomCode.trim().toUpperCase();
  const roomRef = doc(db, 'rooms', cleanCode);
  const snap = await getDoc(roomRef);

  if (!snap.exists()) {
    return { error: 'ژوور بەم کۆدە نەدۆزرایەوە! تکایە لە کۆدەکەت دڵنیابە.' };
  }

  const data = snap.data() as OnlineRoomData;
  if (data.status !== 'lobby') {
    return { error: 'ئەم یارییە دەستی پێکردووە و ناتوانیت ئێستا بەشدار بیت.' };
  }

  if (data.players.length >= 6) {
    return { error: 'ژوورەکە پڕ بووە (زۆرترین ٦ یاریزان).' };
  }

  const playerId = 'player_' + Math.random().toString(36).substring(2, 9);
  const colorIndex = data.players.length % PLAYER_COLORS.length;
  
  const newPlayer: Player = {
    id: playerId,
    name: playerName.trim() || `یاریزان ${data.players.length + 1}`,
    score: 0,
    color: PLAYER_COLORS[colorIndex],
    position: 1,
    skipTurn: false
  };

  const updatedPlayers = [...data.players, newPlayer];
  await updateDoc(roomRef, {
    players: updatedPlayers,
    updatedAt: Date.now()
  });

  return { playerId };
}

export function subscribeToRoom(
  roomCode: string, 
  onUpdate: (data: OnlineRoomData | null) => void,
  onError?: (err: Error) => void
) {
  const roomRef = doc(db, 'rooms', roomCode);
  return onSnapshot(roomRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as OnlineRoomData);
    } else {
      onUpdate(null);
    }
  }, (err) => {
    console.error("Firestore room sync error:", err);
    if (onError) onError(err);
  });
}

export async function updateOnlineRoomState(
  roomCode: string, 
  updates: Partial<OnlineRoomData>
) {
  const roomRef = doc(db, 'rooms', roomCode);
  await updateDoc(roomRef, {
    ...updates,
    updatedAt: Date.now()
  });
}
