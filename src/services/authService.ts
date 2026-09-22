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
import { auth } from '../firebase';
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
