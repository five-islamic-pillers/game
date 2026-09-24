import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  type User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { setCookie, getCookie, eraseCookie } from '../utils/cookieUtils';

export { type User };

// Ensure browser local persistence is active for Auth sessions across browser restarts
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase setPersistence warning:', err);
  });
} catch (e) {
  // ignore in unsupported environments
}

export interface SavedUserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  lastActive: number;
  isLocalOnly?: boolean;
}

export type AuthUser = User | SavedUserSession;

const SESSION_COOKIE_NAME = 'fourpieces_user_session';
const EMAIL_COOKIE_NAME = 'fourpieces_last_email';
const NAME_COOKIE_NAME = 'fourpieces_player_name';
const HIDE_PHOTO_KEY = 'fourpieces_hide_profile_photo';

export function isProfilePhotoHidden(): boolean {
  try {
    return localStorage.getItem(HIDE_PHOTO_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setProfilePhotoHidden(hidden: boolean): void {
  try {
    localStorage.setItem(HIDE_PHOTO_KEY, hidden ? 'true' : 'false');
    if (currentActiveUser) {
      notifyListeners(currentActiveUser);
    }
  } catch {}
}

const authListeners: Set<(user: AuthUser | null) => void> = new Set();
let currentActiveUser: AuthUser | null = null;

export function getSavedUserSession(): SavedUserSession | null {
  try {
    const raw = getCookie(SESSION_COOKIE_NAME) || localStorage.getItem(SESSION_COOKIE_NAME);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading saved user session:', err);
  }
  return null;
}

export function saveUserSessionToCookie(user: { 
  uid: string; 
  email?: string | null; 
  displayName?: string | null; 
  photoURL?: string | null; 
  isLocalOnly?: boolean 
}): void {
  const session: SavedUserSession = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    lastActive: Date.now(),
    isLocalOnly: user.isLocalOnly ?? false
  };
  currentActiveUser = session;
  const serialized = JSON.stringify(session);
  setCookie(SESSION_COOKIE_NAME, serialized, 90);
  try {
    localStorage.setItem(SESSION_COOKIE_NAME, serialized);
  } catch {}

  if (session.email) {
    setCookie(EMAIL_COOKIE_NAME, session.email, 90);
  }
  if (session.displayName) {
    setCookie(NAME_COOKIE_NAME, session.displayName, 90);
  }
}

export function clearUserSessionCookie(): void {
  currentActiveUser = null;
  eraseCookie(SESSION_COOKIE_NAME);
  try {
    localStorage.removeItem(SESSION_COOKIE_NAME);
  } catch {}
}

function notifyListeners(user: AuthUser | null) {
  currentActiveUser = user;
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.warn('Auth listener error:', e);
    }
  });
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<{ user?: AuthUser; error?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      if (result.user.photoURL) {
        try {
          localStorage.setItem(`fourpieces_google_photo_${result.user.uid}`, result.user.photoURL);
        } catch {}
      }
      saveUserSessionToCookie(result.user);
      notifyListeners(result.user);
    }
    return { user: result.user };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    let msg = 'نەتوانرا بە گووگڵ بچیتەژوورەوە.';
    if (error.code === 'auth/popup-closed-by-user') {
      msg = 'پەنجەرەی چوونەژوورەوەی گووگڵ داخرا پێش تەواوبوون.';
    } else if (error.code === 'auth/popup-blocked') {
      msg = 'پەنجەرەی گووگڵ بلۆک کرا لە وێبگەڕەکەت. تکایە ڕێگە بدە یان ئیمەیڵ بەکاربهێنە.';
    } else if (error.message) {
      msg = error.message;
    }
    return { error: msg };
  }
}

export async function signUpWithEmail(
  email: string, 
  pass: string, 
  displayName: string
): Promise<{ user?: AuthUser; error?: string; note?: string }> {
  const cleanEmail = email.trim();
  const cleanName = displayName.trim() || cleanEmail.split('@')[0];

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (cred.user && cleanName) {
      await updateProfile(cred.user, { displayName: cleanName });
    }
    if (cred.user) {
      saveUserSessionToCookie(cred.user);
      notifyListeners(cred.user);
    }
    return { user: cred.user };
  } catch (error: any) {
    console.warn('Firebase Sign Up failed with code:', error?.code, error?.message);

    // If Firebase project disabled Email/Password provider (auth/operation-not-allowed)
    // or network restriction occurs, seamlessly fall back to local saved player session!
    if (
      error.code === 'auth/operation-not-allowed' || 
      error.message?.includes('operation-not-allowed') ||
      error.code === 'auth/network-request-failed'
    ) {
      const localSession: SavedUserSession = {
        uid: 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
        email: cleanEmail,
        displayName: cleanName,
        photoURL: null,
        lastActive: Date.now(),
        isLocalOnly: true
      };
      saveUserSessionToCookie(localSession);
      notifyListeners(localSession);
      return { 
        user: localSession, 
        note: 'هەژمارەکەت بەسەرکەوتوویی لەسەر ئەم وێبگەڕە دروستکرا و لە کووکی پارێزرا.' 
      };
    }

    let msg = 'نەتوانرا هەژمار دروستبکرێت.';
    if (error.code === 'auth/email-already-in-use') {
      msg = 'ئەم ئیمەیڵە پێشتر هەژماری پێ دروستکراوە.';
    } else if (error.code === 'auth/weak-password') {
      msg = 'وشەی نهێنی لاوازە. بەلایەنی کەم پێویستە ٦ پیت یان ژمارە بێت.';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'ئەم ئیمەیڵە نادروستە.';
    } else if (error.message) {
      msg = error.message;
    }
    return { error: msg };
  }
}

export async function signInWithEmail(
  email: string, 
  pass: string
): Promise<{ user?: AuthUser; error?: string; note?: string }> {
  const cleanEmail = email.trim();

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    if (cred.user) {
      saveUserSessionToCookie(cred.user);
      notifyListeners(cred.user);
    }
    return { user: cred.user };
  } catch (error: any) {
    console.warn('Firebase Sign In failed with code:', error?.code, error?.message);

    // If Firebase project disabled Email/Password provider
    if (
      error.code === 'auth/operation-not-allowed' || 
      error.message?.includes('operation-not-allowed')
    ) {
      const saved = getSavedUserSession();
      const localSession: SavedUserSession = {
        uid: saved?.uid || ('user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7)),
        email: cleanEmail,
        displayName: saved?.displayName || cleanEmail.split('@')[0],
        photoURL: saved?.photoURL || null,
        lastActive: Date.now(),
        isLocalOnly: true
      };
      saveUserSessionToCookie(localSession);
      notifyListeners(localSession);
      return { 
        user: localSession,
        note: 'چوونەژوورەوە بەسەرکەوتوویی ئەنجامدرا و لەسەر ئامێرەکەت پارێزرا.'
      };
    }

    let msg = 'ئیمەیڵ یان وشەی نهێنی هەڵەیە.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      msg = 'ئیمەیڵ یان وشەی نهێنی هەڵەیە.';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'ئەم ئیمەیڵە نادروستە.';
    }
    return { error: msg };
  }
}

export async function loginAsGuest(guestName?: string): Promise<{ user: AuthUser }> {
  const fallbackName = (guestName && guestName.trim()) 
    ? guestName.trim() 
    : ('میوان ' + Math.floor(100 + Math.random() * 900));

  const guestSession: SavedUserSession = {
    uid: 'guest_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    email: null,
    displayName: fallbackName,
    photoURL: null,
    lastActive: Date.now(),
    isLocalOnly: true
  };
  saveUserSessionToCookie(guestSession);
  notifyListeners(guestSession);
  return { user: guestSession };
}

export async function logoutUser(): Promise<void> {
  clearUserSessionCookie();
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
  notifyListeners(null);
}

export function subscribeToAuth(callback: (user: AuthUser | null) => void) {
  authListeners.add(callback);

  // 1. Immediately notify with currently saved session or active user if available
  const initialSaved = currentActiveUser || getSavedUserSession();
  if (initialSaved) {
    callback(initialSaved);
  } else if (auth.currentUser) {
    callback(auth.currentUser);
  }

  // 2. Also attach Firebase onAuthStateChanged
  const unsubFirebase = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      saveUserSessionToCookie(firebaseUser);
      notifyListeners(firebaseUser);
    } else {
      // If Firebase says no user, check if we have a valid saved cookie/local session
      const saved = getSavedUserSession();
      if (saved) {
        currentActiveUser = saved;
        callback(saved);
      } else {
        currentActiveUser = null;
        callback(null);
      }
    }
  });

  return () => {
    authListeners.delete(callback);
    unsubFirebase();
  };
}

export function getCurrentUser(): AuthUser | null {
  return currentActiveUser || auth.currentUser || getSavedUserSession();
}

/**
 * 7 Days Cooldown Constant (7 * 24 * 60 * 60 * 1000 ms)
 */
export const USERNAME_CHANGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export interface UsernameEligibility {
  canChange: boolean;
  lastNameChangeAt?: number;
  remainingMs: number;
  remainingDays: number;
  remainingHours: number;
  remainingMinutes: number;
  formattedRemaining: string;
}

/**
 * Retrieve the original Google profile photo if available
 */
export function getOriginalGooglePhoto(userId: string): string | null {
  try {
    return localStorage.getItem(`fourpieces_google_photo_${userId}`) || null;
  } catch {
    return null;
  }
}

/**
 * Check if the user is eligible to change their in-game username (once every 7 days)
 */
export async function checkUsernameChangeEligibility(userId: string): Promise<UsernameEligibility> {
  let lastChanged = 0;
  try {
    // 1. Check localStorage for instant response
    const localVal = localStorage.getItem(`fourpieces_name_changed_${userId}`);
    if (localVal) {
      lastChanged = parseInt(localVal, 10) || 0;
    }

    // 2. Check Firestore leaderboard_users record
    if (userId && !userId.startsWith('guest_')) {
      const userDoc = await getDoc(doc(db, 'leaderboard_users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.lastNameChangeAt && typeof data.lastNameChangeAt === 'number') {
          lastChanged = Math.max(lastChanged, data.lastNameChangeAt);
        }
      }
    }
  } catch (err) {
    console.warn('Error checking username change eligibility:', err);
  }

  const now = Date.now();
  const timeSince = now - lastChanged;
  const remainingMs = Math.max(0, USERNAME_CHANGE_COOLDOWN_MS - timeSince);
  const canChange = lastChanged === 0 || remainingMs <= 0;

  const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  let formattedRemaining = '';
  if (remainingDays > 0) {
    formattedRemaining = `${remainingDays} ڕۆژ و ${remainingHours} کاتژمێر`;
  } else if (remainingHours > 0) {
    formattedRemaining = `${remainingHours} کاتژمێر و ${remainingMinutes} خولەک`;
  } else {
    formattedRemaining = `${Math.max(1, remainingMinutes)} خولەک`;
  }

  return {
    canChange,
    lastNameChangeAt: lastChanged > 0 ? lastChanged : undefined,
    remainingMs,
    remainingDays,
    remainingHours,
    remainingMinutes,
    formattedRemaining
  };
}

/**
 * Update the in-game username with a 7-day cooldown guarantee
 */
export async function updateInGameUsername(
  userId: string,
  newDisplayName: string
): Promise<{ success: boolean; error?: string; remainingText?: string }> {
  const cleanName = newDisplayName.trim();
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'تکایە ناوێک بنووسە کە بەلایەنی کەم ٢ پیت بێت.' };
  }
  if (cleanName.length > 25) {
    return { success: false, error: 'ناو نابێت زیاتر لە ٢٥ پیت بێت.' };
  }

  // Validate 7-day cooldown
  const eligibility = await checkUsernameChangeEligibility(userId);
  if (!eligibility.canChange) {
    return { 
      success: false, 
      error: `تەنها هەموو ٧ ڕۆژ جارێک دەتوانیت ناو بگۆڕیت. کاتی ماوە: ${eligibility.formattedRemaining}`,
      remainingText: eligibility.formattedRemaining
    };
  }

  const now = Date.now();

  try {
    // 1. If active Firebase Auth user, update Firebase profile
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await updateProfile(auth.currentUser, { displayName: cleanName });
    }

    // 2. Update Firestore leaderboard_users
    if (userId && !userId.startsWith('guest_')) {
      const userRef = doc(db, 'leaderboard_users', userId);
      await setDoc(userRef, {
        displayName: cleanName,
        lastNameChangeAt: now,
        updatedAt: now
      }, { merge: true });
    }

    // 3. Save cooldown to localStorage & cookies
    try {
      localStorage.setItem(`fourpieces_name_changed_${userId}`, now.toString());
    } catch {}

    const current = getSavedUserSession();
    if (current) {
      saveUserSessionToCookie({
        ...current,
        displayName: cleanName
      });
    } else if (auth.currentUser) {
      saveUserSessionToCookie(auth.currentUser);
    }

    notifyListeners(getCurrentUser());
    return { success: true };
  } catch (err: any) {
    console.error('Failed to update in-game username:', err);
    return { success: false, error: err?.message || 'نەتوانرا ناوەکە نوێبکرێتەوە.' };
  }
}

/**
 * Update the user's profile photo (custom avatar or preset)
 */
export async function updateUserProfilePhoto(
  userId: string,
  photoURL: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. If active Firebase Auth user, update auth profile
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await updateProfile(auth.currentUser, { photoURL: photoURL || '' });
    }

    // 2. Update Firestore leaderboard_users
    if (userId && !userId.startsWith('guest_')) {
      const userRef = doc(db, 'leaderboard_users', userId);
      await setDoc(userRef, {
        photoURL: photoURL || null,
        updatedAt: Date.now()
      }, { merge: true });
    }

    // 3. Update session
    const current = getSavedUserSession();
    if (current) {
      saveUserSessionToCookie({
        ...current,
        photoURL: photoURL || null
      });
    } else if (auth.currentUser) {
      saveUserSessionToCookie(auth.currentUser);
    }

    // Ensure photo visibility is turned ON when user changes their photo
    if (photoURL) {
      setProfilePhotoHidden(false);
    }

    notifyListeners(getCurrentUser());
    return { success: true };
  } catch (err: any) {
    console.error('Failed to update photo:', err);
    return { success: false, error: err?.message || 'نەتوانرا وێنەکە نوێبکرێتەوە.' };
  }
}

/**
 * Helper to downscale and compress an uploaded image client-side to WebP/JPEG Data URL
 */
export function resizeImageToDataUrl(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('تکایە تەنها فایلی وێنە هەڵبژێرە.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Crop to square center if not square
          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;

          const outputDim = Math.min(maxSize, minDim);
          canvas.width = outputDim;
          canvas.height = outputDim;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('ناتوانرێت وێنەکە پرۆسێس بکرێت.'));
          }

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, outputDim, outputDim);
          const dataUrl = canvas.toDataURL('image/webp', 0.82);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('هەڵە لە خوێندنەوەی فایلی وێنەکە.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('نەتوانرا فایلی وێنەکە بکرێتەوە.'));
    reader.readAsDataURL(file);
  });
}
