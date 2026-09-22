import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Player, OnlineRoomData, GameReaction } from '../types';

export const PLAYER_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-400',
  'bg-purple-500',
  'bg-orange-500'
];

export function normalizeRoomCode(code: string): string {
  const easternArabic = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  const persianArabic = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  let res = code.trim();
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(easternArabic[i], i.toString()).replaceAll(persianArabic[i], i.toString());
  }
  return res.replace(/\s+/g, '').toUpperCase();
}

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
    gameLogs: [{
      id: `start-${Date.now()}`,
      type: 'game_start',
      text: 'ژووری ئۆنلاین دروستکرا',
      timestamp: Date.now()
    }],
    updatedAt: Date.now()
  };

  const roomRef = doc(db, 'rooms', roomCode);
  await setDoc(roomRef, initialRoom);

  return { roomCode, playerId };
}

export async function joinOnlineRoom(
  roomCode: string, 
  playerName: string
): Promise<{ playerId: string; roomData?: OnlineRoomData } | { error: string }> {
  const cleanCode = normalizeRoomCode(roomCode);
  if (!cleanCode) {
    return { error: 'تکایە کۆدی ژوورەکە بنووسە.' };
  }

  const roomRef = doc(db, 'rooms', cleanCode);
  const snap = await getDoc(roomRef);

  if (!snap.exists()) {
    return { error: 'ژوور بەم کۆدە نەدۆزرایەوە! تکایە لە کۆدەکەت دڵنیابە.' };
  }

  const data = snap.data() as OnlineRoomData;
  const existingPlayer = data.players?.find(
    p => p.name.trim().toLowerCase() === playerName.trim().toLowerCase()
  );

  if (data.status !== 'lobby') {
    if (existingPlayer) {
      return { playerId: existingPlayer.id, roomData: data };
    }
    return { error: 'ئەم یارییە پێشتر دەستی پێکردووە.' };
  }

  if (existingPlayer) {
    return { playerId: existingPlayer.id, roomData: data };
  }

  if (data.players && data.players.length >= 6) {
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
  const updatedLogs = [
    ...(data.gameLogs || []),
    {
      id: `join-${Date.now()}`,
      type: 'game_start' as const,
      text: `${newPlayer.name} هاتە ناو یارییەوە`,
      timestamp: Date.now()
    }
  ];

  await updateDoc(roomRef, {
    players: updatedPlayers,
    gameLogs: updatedLogs,
    updatedAt: Date.now()
  });

  return { playerId, roomData: { ...data, players: updatedPlayers, gameLogs: updatedLogs } };
}

export async function findQuickMatchRoom(): Promise<OnlineRoomData | null> {
  try {
    const q = query(
      collection(db, 'rooms'),
      where('status', '==', 'lobby'),
      limit(25)
    );
    const snap = await getDocs(q);
    const now = Date.now();
    const candidateRooms: OnlineRoomData[] = [];
    
    snap.forEach((docSnap) => {
      const room = docSnap.data() as OnlineRoomData;
      // Rooms created/updated in the last 15 minutes that need a 2nd player
      if (
        room.status === 'lobby' &&
        room.players &&
        room.players.length >= 1 &&
        room.players.length < 6 &&
        room.updatedAt &&
        now - room.updatedAt < 15 * 60 * 1000
      ) {
        candidateRooms.push(room);
      }
    });

    if (candidateRooms.length === 0) return null;
    // Prefer rooms with 1 player that have been waiting longest
    candidateRooms.sort((a, b) => {
      if (a.players.length !== b.players.length) {
        return a.players.length - b.players.length;
      }
      return b.updatedAt - a.updatedAt;
    });
    return candidateRooms[0];
  } catch (err) {
    console.warn("Quick match search error:", err);
    return null;
  }
}

export function subscribeToOpenRooms(
  onUpdate: (rooms: OnlineRoomData[]) => void
) {
  const q = query(
    collection(db, 'rooms'),
    where('status', '==', 'lobby'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const now = Date.now();
    const openRooms: OnlineRoomData[] = [];
    snapshot.forEach((docSnap) => {
      const room = docSnap.data() as OnlineRoomData;
      if (
        room.status === 'lobby' &&
        room.players &&
        room.players.length < 6 &&
        room.updatedAt &&
        now - room.updatedAt < 15 * 60 * 1000
      ) {
        openRooms.push(room);
      }
    });
    openRooms.sort((a, b) => b.updatedAt - a.updatedAt);
    onUpdate(openRooms);
  }, (err) => {
    console.warn("Open rooms snapshot error:", err);
  });
}

export async function leaveOnlineRoom(roomCode: string, playerId: string) {
  try {
    const cleanCode = normalizeRoomCode(roomCode);
    const roomRef = doc(db, 'rooms', cleanCode);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as OnlineRoomData;
    const remainingPlayers = (data.players || []).filter(p => p.id !== playerId);
    if (remainingPlayers.length === 0 || data.hostId === playerId) {
      await updateDoc(roomRef, {
        status: 'finished',
        updatedAt: Date.now()
      });
    } else {
      await updateDoc(roomRef, {
        players: remainingPlayers,
        updatedAt: Date.now()
      });
    }
  } catch (err) {
    console.warn("Leave room error:", err);
  }
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

export async function sendOnlineReaction(
  roomCode: string, 
  reaction: GameReaction
) {
  try {
    const cleanCode = normalizeRoomCode(roomCode);
    const roomRef = doc(db, 'rooms', cleanCode);
    await updateDoc(roomRef, {
      latestReaction: reaction,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.warn("Failed to send online reaction:", err);
  }
}

