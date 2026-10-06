/**
 * High-Fidelity Audio Chime & Notification Sound Engine
 * Cross-browser, mobile-compatible, and resilient to autoplay restrictions.
 */

let sharedAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

// Pre-synthesized base64 WAV chime fallback for browsers that block AudioContext
let cachedWavUrl: string | null = null;

function getAudioContext(forceCreate = false): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    if (!forceCreate && !isAudioUnlocked) return null;
    try {
      sharedAudioCtx = new AudioContextClass();
    } catch (_) {
      return null;
    }
  }
  return sharedAudioCtx;
}

// Unlock audio context on initial user interaction (click, key, touch)
if (typeof window !== 'undefined') {
  const unlock = () => {
    isAudioUnlocked = true;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass && !sharedAudioCtx) {
        sharedAudioCtx = new AudioContextClass();
      }
      if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume().catch(() => {});
      }
    } catch (_) {}
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
}

// Generate an ultra-clean 44.1kHz WAV chime in memory as a bulletproof fallback
function generateWavChimeUrl(): string {
  if (cachedWavUrl) return cachedWavUrl;
  try {
    const sampleRate = 22050;
    const duration = 0.55;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // Write WAV Header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true); // 16-bit
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Synthesize Bell Harmonics (Note 1: 988 Hz, Note 2: 1318 Hz)
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const env1 = Math.exp(-t * 6.0);
      const s1 = Math.sin(2 * Math.PI * 987.77 * t) * env1 * 0.45;
      
      let s2 = 0;
      if (t > 0.1) {
        const t2 = t - 0.1;
        const env2 = Math.exp(-t2 * 5.0);
        s2 = Math.sin(2 * Math.PI * 1318.51 * t2) * env2 * 0.50;
      }

      const sample = Math.max(-1, Math.min(1, s1 + s2));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    cachedWavUrl = URL.createObjectURL(blob);
    return cachedWavUrl;
  } catch (e) {
    return '';
  }
}

/**
 * Play an audible, high-clarity notification chime
 */
export function playNotificationSound(): void {
  try {
    const ctx = getAudioContext(true);
    if (!ctx) {
      playFallbackWav();
      return;
    }

    const playNodes = () => {
      const now = ctx.currentTime;

      // Note 1: High sweet chime (A5 - 880Hz / B5 - 987.77Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.40, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // Note 2: Radiant fifth (E6 - 1318.5Hz) with 110ms delay
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.11);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.45, now + 0.11);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      // Note 3: Warm harmonic sparkle (A6 - 1760Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1760.0, now + 0.20);
      gain3.gain.setValueAtTime(0, now);
      gain3.gain.setValueAtTime(0.20, now + 0.20);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.6);
      osc2.start(now + 0.11);
      osc2.stop(now + 0.8);
      osc3.start(now + 0.20);
      osc3.stop(now + 0.7);
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        playNodes();
      }).catch(() => {
        playFallbackWav();
      });
    } else {
      playNodes();
    }
  } catch (err) {
    playFallbackWav();
  }
}

function playFallbackWav(): void {
  try {
    const url = generateWavChimeUrl();
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (_) {}
}
