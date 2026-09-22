import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc,
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
  winRate?: number;
  updatedAt: number;
}

// Clean up any legacy or temporary dummy entries from previous sessions
export async function cleanLegacyLeaderboard(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'leaderboard_users'));
    const deletePromises: Promise<void>[] = [];
    
    snap.forEach((d) => {
      const id = d.id;
      const data = d.data();
      // Remove temporary random IDs, unassigned dummy records, or corrupted test rows
      if (
        id.startsWith('online_player_') || 
        id.startsWith('temp_') || 
        id.startsWith('dummy_') ||
        !data.displayName ||
        data.displayName === 'player now' ||
        data.displayName === 'یاریزانی نەناسراو'
      ) {
        deletePromises.push(deleteDoc(doc(db, 'leaderboard_users', id)).catch(() => {}));
      }
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
  } catch (err) {
    console.warn('Leaderboard cleanup warning:', err);
  }
}

/**
 * Fetch leaderboard sorted by Most Games Played
 */
export async function getMostPlayedLeaderboard(limitCount = 30): Promise<LeaderboardPlayer[]> {
  try {
    // Run async background cleanup without blocking UI
    cleanLegacyLeaderboard().catch(() => {});

    const q = query(
      collection(db, 'leaderboard_users'),
      orderBy('gamesPlayed', 'desc'),
      limit(limitCount * 2) // Fetch buffer to filter out invalid records
    );
    const snap = await getDocs(q);
    const results: LeaderboardPlayer[] = [];

    snap.forEach((docSnap) => {
      const id = docSnap.id;
      // Skip temporary or dummy keys
      if (id.startsWith('online_player_') || id.startsWith('temp_') || id.startsWith('dummy_')) {
        return;
      }

      const data = docSnap.data();
      const displayName = (data.displayName || '').trim();
      if (!displayName || displayName.toLowerCase() === 'player now' || displayName === 'یاریزانی نەناسراو') {
        return;
      }

      const gamesPlayed = Math.max(1, Number(data.gamesPlayed || 0));
      const wins = Math.max(0, Math.min(gamesPlayed, Number(data.wins || 0)));
      const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

      results.push({
        userId: id,
        displayName,
        photoURL: data.photoURL || undefined,
        gamesPlayed,
        wins,
        winRate,
        updatedAt: Number(data.updatedAt || Date.now())
      });
    });

    // Sort by games played desc, then wins desc
    results.sort((a, b) => {
      if (b.gamesPlayed !== a.gamesPlayed) {
        return b.gamesPlayed - a.gamesPlayed;
      }
      return b.wins - a.wins;
    });

    return results.slice(0, limitCount);
  } catch (err) {
    console.warn('Error querying most played leaderboard:', err);
    return [];
  }
}

/**
 * Fetch leaderboard sorted by Most Wins
 */
export async function getMostWinsLeaderboard(limitCount = 30): Promise<LeaderboardPlayer[]> {
  try {
    cleanLegacyLeaderboard().catch(() => {});

    const q = query(
      collection(db, 'leaderboard_users'),
      orderBy('wins', 'desc'),
      limit(limitCount * 2)
    );
    const snap = await getDocs(q);
    const results: LeaderboardPlayer[] = [];

    snap.forEach((docSnap) => {
      const id = docSnap.id;
      if (id.startsWith('online_player_') || id.startsWith('temp_') || id.startsWith('dummy_')) {
        return;
      }

      const data = docSnap.data();
      const displayName = (data.displayName || '').trim();
      if (!displayName || displayName.toLowerCase() === 'player now' || displayName === 'یاریزانی نەناسراو') {
        return;
      }

      const gamesPlayed = Math.max(1, Number(data.gamesPlayed || 0));
      const wins = Math.max(0, Math.min(gamesPlayed, Number(data.wins || 0)));
      const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

      results.push({
        userId: id,
        displayName,
        photoURL: data.photoURL || undefined,
        gamesPlayed,
        wins,
        winRate,
        updatedAt: Number(data.updatedAt || Date.now())
      });
    });

    // Sort by wins desc, then games played desc
    results.sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      return b.gamesPlayed - a.gamesPlayed;
    });

    return results.slice(0, limitCount);
  } catch (err) {
    console.warn('Error querying most wins leaderboard:', err);
    return [];
  }
}

/**
 * Fetch stats for a specific user ID
 */
export async function getUserStats(userId: string): Promise<LeaderboardPlayer | null> {
  if (!userId) return null;
  try {
    const docRef = doc(db, 'leaderboard_users', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    const gamesPlayed = Number(data.gamesPlayed || 0);
    const wins = Number(data.wins || 0);
    return {
      userId,
      displayName: data.displayName || 'یاریزان',
      photoURL: data.photoURL || undefined,
      gamesPlayed,
      wins,
      winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
      updatedAt: Number(data.updatedAt || Date.now())
    };
  } catch (err) {
    console.warn('Error getting user stats:', err);
    return null;
  }
}

/**
 * Record a game completion for a player with persistent identity
 */
export async function recordPlayerGameResult(params: {
  userId: string;
  displayName: string;
  photoURL?: string;
  isWinner: boolean;
}): Promise<void> {
  const { userId, displayName, photoURL, isWinner } = params;
  
  // Guard against invalid or temporary IDs
  if (!userId || userId.startsWith('online_player_') || userId.startsWith('temp_') || userId.startsWith('dummy_')) {
    return;
  }

  const cleanName = (displayName || '').trim();
  if (!cleanName || cleanName.toLowerCase() === 'player now') {
    return;
  }

  try {
    const docRef = doc(db, 'leaderboard_users', userId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const currentData = snap.data();
      const currentGames = Number(currentData.gamesPlayed || 0);
      const currentWins = Number(currentData.wins || 0);

      const nextGames = currentGames + 1;
      const nextWins = isWinner ? currentWins + 1 : currentWins;

      await setDoc(
        docRef,
        {
          displayName: cleanName,
          ...(photoURL ? { photoURL } : {}),
          gamesPlayed: nextGames,
          wins: nextWins,
          updatedAt: Date.now()
        },
        { merge: true }
      );
    } else {
      await setDoc(
        docRef,
        {
          userId,
          displayName: cleanName,
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
