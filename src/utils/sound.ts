export interface SoundToast {
  id: string;
  muted: boolean;
  message: string;
  submessage?: string;
  timestamp: number;
}

// Robust Web Audio API Sound Manager with anti-glitch ramp envelopes, mobile unlock, global mute support, and visual toasts
export class SoundManager {
  private static ctx: AudioContext | null = null;
  private static masterGain: GainNode | null = null;
  private static compressor: DynamicsCompressorNode | null = null;
  private static isUnlocked = false;
  private static muted: boolean = (() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('fourpieces_sound_muted') === 'true';
      }
      return false;
    } catch {
      return false;
    }
  })();
  private static listeners: Set<(muted: boolean) => void> = new Set();
  private static toastListeners: Set<(toast: SoundToast) => void> = new Set();

  static isSoundMuted(): boolean {
    return this.muted;
  }

  static setMuted(muted: boolean, triggerToast = true) {
    this.muted = muted;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('fourpieces_sound_muted', muted ? 'true' : 'false');
      }
    } catch {
      // ignore
    }
    this.notifyListeners();

    if (triggerToast) {
      this.dispatchToast({
        id: `sound_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        muted,
        message: muted ? 'دەنگی یاری بێدەنگکرا' : 'دەنگی یاری چالاککرا',
        submessage: muted ? 'هەموو کاریگەرییە دەنگییەکان بێدەنگ کران' : 'دەنگی جووڵە، زار، کارت و کاردانەوەکان چالاکە',
        timestamp: Date.now()
      });
    }
  }

  static toggleMute(): boolean {
    const nextVal = !this.muted;
    this.setMuted(nextVal, true);
    if (!nextVal) {
      // Play a subtle click tone when unmuting so user gets audio feedback
      this.click();
    }
    return nextVal;
  }

  static subscribeToMute(callback: (muted: boolean) => void): () => void {
    this.listeners.add(callback);
    callback(this.muted);
    return () => {
      this.listeners.delete(callback);
    };
  }

  static subscribeToToast(callback: (toast: SoundToast) => void): () => void {
    this.toastListeners.add(callback);
    return () => {
      this.toastListeners.delete(callback);
    };
  }

  private static dispatchToast(toast: SoundToast) {
    this.toastListeners.forEach((fn) => {
      try {
        fn(toast);
      } catch {
        // ignore
      }
    });
  }

  private static notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.muted);
      } catch {
        // ignore
      }
    });
  }

  static init() {
    try {
      if (typeof window === 'undefined') return;
      
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }

      if (this.ctx && !this.masterGain) {
        // Create compressor to prevent clipping / distortion glitch when sounds overlap
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(20, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Audio not supported or blocked
    }
  }

  // Safe global unlock on user interactions to prevent mobile / WebView silent failures
  static unlock() {
    if (this.isUnlocked) return;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else if (this.ctx) {
      this.isUnlocked = true;
    }
  }

  static playTone(freq: number, type: OscillatorType, duration: number, vol: number, delay: number = 0) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + delay;
      const safeVol = Math.max(0.001, Math.min(vol, 0.9));
      const attackTime = 0.005; // 5ms attack eliminates digital clicking glitch
      const releaseTime = Math.max(0.01, duration - attackTime);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), now);

      // Micro attack ramp prevents DC offset click / pop glitch
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(safeVol, now + attackTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + attackTime + releaseTime);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + attackTime + releaseTime + 0.01);

      // Garbage collection cleanup
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // ignore
        }
      };
    } catch {
      // Ignore audio errors gracefully
    }
  }

  static correct() {
    this.playTone(523.25, 'sine', 0.1, 0.12, 0);     // C5
    this.playTone(659.25, 'sine', 0.1, 0.12, 0.08);  // E5
    this.playTone(783.99, 'sine', 0.22, 0.14, 0.16); // G5
  }

  static wrong() {
    this.playTone(280, 'sawtooth', 0.15, 0.08, 0);
    this.playTone(220, 'sawtooth', 0.25, 0.08, 0.12);
  }

  static roll() {
    this.playTone(750, 'triangle', 0.04, 0.05);
  }
  
  static tick() {
    this.playTone(450, 'sine', 0.04, 0.04);
  }

  static click() {
    this.playTone(500, 'sine', 0.03, 0.04);
  }

  static timerTick() {
    this.playTone(600, 'triangle', 0.04, 0.03);
  }

  static timeout() {
    this.playTone(220, 'sawtooth', 0.3, 0.12, 0);
    this.playTone(160, 'sawtooth', 0.45, 0.14, 0.15);
  }

  static win() {
    this.playTone(523.25, 'sine', 0.12, 0.12, 0);      // C5
    this.playTone(659.25, 'sine', 0.12, 0.12, 0.12);   // E5
    this.playTone(783.99, 'sine', 0.15, 0.12, 0.24);   // G5
    this.playTone(1046.50, 'sine', 0.35, 0.16, 0.36);  // C6
  }

  static playerJoined() {
    this.playTone(440, 'sine', 0.1, 0.12, 0);        // A4
    this.playTone(554.37, 'sine', 0.12, 0.12, 0.07); // C#5
    this.playTone(659.25, 'sine', 0.2, 0.14, 0.14);  // E5
  }

  static reaction() {
    // Bubble pop sparkle for emoji reactions
    this.playTone(600, 'sine', 0.05, 0.1, 0);
    this.playTone(900, 'sine', 0.08, 0.12, 0.04);
  }
}

// Auto-register touch / click unlock listeners for seamless mobile playback
if (typeof window !== 'undefined') {
  const handleInteraction = () => {
    SoundManager.unlock();
  };
  ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, handleInteraction, { once: true, passive: true });
  });
}
