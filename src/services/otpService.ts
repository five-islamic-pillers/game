import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface SendOtpResult {
  success: boolean;
  previewOtp?: string;
  emailSent?: boolean;
  message?: string;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  verified?: boolean;
  error?: string;
}

function sanitizeEmailForDocId(email: string): string {
  return email.trim().toLowerCase().replace(/[.#$[\]]/g, '_');
}

/**
 * Requests an OTP code to be sent to the user's email address
 */
export async function sendAccountCreationOtp(
  email: string, 
  displayName?: string
): Promise<SendOtpResult> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Primary: Request from the server endpoint
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, displayName: displayName?.trim() })
    });

    if (response.ok) {
      const data = await response.json();
      
      // Also sync to Firestore as backup if available
      try {
        const docRef = doc(db, 'verification_otps', sanitizeEmailForDocId(cleanEmail));
        await setDoc(docRef, {
          email: cleanEmail,
          otp: data.previewOtp || 'VERIFIED',
          expiresAt: Date.now() + 10 * 60 * 1000,
          createdAt: Date.now(),
          attempts: 0
        });
      } catch (fsErr) {
        // Firestore backup optional
        console.warn('Firestore OTP sync notice:', fsErr);
      }

      return {
        success: true,
        previewOtp: data.previewOtp,
        emailSent: data.emailSent,
        message: data.message
      };
    } else {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Server error sending OTP');
    }
  } catch (err: any) {
    console.warn('Backend /api/send-otp notice, using Firestore direct OTP fallback:', err?.message || err);

    // 2. Direct Firestore fallback if server endpoint is temporarily unreachable
    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const docRef = doc(db, 'verification_otps', sanitizeEmailForDocId(cleanEmail));
      await setDoc(docRef, {
        email: cleanEmail,
        otp: generatedOtp,
        expiresAt: Date.now() + 10 * 60 * 1000,
        createdAt: Date.now(),
        attempts: 0
      });

      return {
        success: true,
        previewOtp: generatedOtp,
        emailSent: false,
        message: 'کۆدی دڵنیابوونەوە دروستکرا'
      };
    } catch (fallbackErr: any) {
      console.error('Failed to generate OTP via fallback:', fallbackErr);
      return {
        success: false,
        error: 'نەتوانرا کۆدی دڵنیابوونەوە بنێردرێت. تکایە دووبارە هەوڵبدەرەوە.'
      };
    }
  }
}

/**
 * Verifies the OTP code entered by the user
 */
export async function verifyAccountCreationOtp(
  email: string, 
  enteredOtp: string
): Promise<VerifyOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = enteredOtp.trim();

  if (!cleanCode || cleanCode.length < 6) {
    return { success: false, error: 'تکایە هەموو ٦ ژمارەکەی کۆد بنووسە.' };
  }

  try {
    // 1. Try server verification
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, otp: cleanCode })
    });

    if (response.ok) {
      // Also clean up any Firestore doc
      try {
        const docRef = doc(db, 'verification_otps', sanitizeEmailForDocId(cleanEmail));
        await deleteDoc(docRef);
      } catch {}

      return { success: true, verified: true };
    } else {
      const errData = await response.json().catch(() => ({}));
      // If server returned an explicit error (wrong code, expired), return it
      if (response.status === 400 && errData.error) {
        return { success: false, error: errData.error };
      }
      throw new Error(errData.error || 'Server verify error');
    }
  } catch (err: any) {
    console.warn('Backend /api/verify-otp notice, checking Firestore directly:', err?.message || err);

    // 2. Direct Firestore verification fallback
    try {
      const docRef = doc(db, 'verification_otps', sanitizeEmailForDocId(cleanEmail));
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        return { 
          success: false, 
          error: 'هیچ کۆدێک نەدۆزرایەوە یان بەسەرچووە. تکایە دووبارە داوای کۆد بکەوە.' 
        };
      }

      const data = snap.data();
      if (Date.now() > data.expiresAt) {
        await deleteDoc(docRef);
        return { 
          success: false, 
          error: 'کاتی بەکارهێنانی ئەم کۆدە بەسەرچووە. تکایە دووبارە داوای کۆد بکەوە.' 
        };
      }

      if (data.otp !== cleanCode) {
        return { 
          success: false, 
          error: 'کۆدی دڵنیابوونەوە هەڵەیە. تکایە سەرنج بدە لە ژمارەکان.' 
        };
      }

      // Success - delete doc
      await deleteDoc(docRef);
      return { success: true, verified: true };
    } catch (fsErr: any) {
      console.error('Firestore verify fallback error:', fsErr);
      return { 
        success: false, 
        error: 'هەڵەیەک لە پشتڕاستکردنەوە ڕوویدا. تکایە دووبارە هەوڵبدەرەوە.' 
      };
    }
  }
}
