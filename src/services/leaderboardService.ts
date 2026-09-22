import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  query, 
  orderBy, 
  limit, 
  increment 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface LeaderboardPlayer {
  userId: string;
  displayName: string;
  photoURL?: string;
  gamesPlayed: number;
  wins: number;
  updatedAt: number;
}

// Real player leaderboards strictly based on online games played
export async function getMostPlayedLeaderboard(limitCount = 25): Promise<LeaderboardPlayer[]> {
  try {
    const q = query(
      collection(db, 'leaderboard_users'),
      orderBy('gamesPlayed', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const results: LeaderboardPlayer[] = [];

    snap.forEach((doc) => {
      const data = doc.data();
      results.push({
        userId: doc.id,
        displayName: data.displayName || 'یاریزانی نەناسراو',
        photoURL: data.photoURL || undefined,
        gamesPlayed: Number(data.gamesPlayed || 0),
        wins: Number(data.wins || 0),
        updatedAt: Number(data.updatedAt || Date.now())
      });
    });

    return results;
  } catch (err) {
    console.warn('Error querying most played leaderboard:', err);
    return [];
  }
}

/**
 * Fetch leaderboard sorted by Most Wins
 */
export async function getMostWinsLeaderboard(limitCount = 25): Promise<LeaderboardPlayer[]> {
  try {
    const q = query(
      collection(db, 'leaderboard_users'),
      orderBy('wins', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const results: LeaderboardPlayer[] = [];

    snap.forEach((doc) => {
      const data = doc.data();
      results.push({
        userId: doc.id,
        displayName: data.displayName || 'یاریزانی نەناسراو',
        photoURL: data.photoURL || undefined,
        gamesPlayed: Number(data.gamesPlayed || 0),
        wins: Number(data.wins || 0),
        updatedAt: Number(data.updatedAt || Date.now())
      });
    });

    return results;
  } catch (err) {
    console.warn('Error querying most wins leaderboard:', err);
    return [];
  }
}

/**
 * Record a game completion for a player with a Google Account
 */
export async function recordPlayerGameResult(params: {
  userId: string;
  displayName: string;
  photoURL?: string;
  isWinner: boolean;
}): Promise<void> {
  const { userId, displayName, photoURL, isWinner } = params;
  if (!userId) {
    return;
  }

  try {
    const docRef = doc(db, 'leaderboard_users', userId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      await setDoc(
        docRef,
        {
          displayName: displayName || snap.data().displayName || 'یاریزان',
          ...(photoURL ? { photoURL } : {}),
          gamesPlayed: increment(1),
          ...(isWinner ? { wins: increment(1) } : {}),
          updatedAt: Date.now()
        },
        { merge: true }
      );
    } else {
      await setDoc(
        docRef,
        {
          userId,
          displayName: displayName || 'یاریزان',
          photoURL: photoURL || null,
          gamesPlayed: 1,
          wins: isWinner ? 1 : 0,
          updatedAt: Date.now()
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error('Failed to record player game result in leaderboard:', err);
  }
}
