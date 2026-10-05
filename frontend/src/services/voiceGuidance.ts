/**
 * Voice Guidance Service for KumariSafe Real-Time Navigation
 * Uses Web Speech API with optimized voice selection, rate & audio chime
 */
import { audioChime } from './audioChime';

class VoiceGuidanceService {
  private isMuted: boolean = false;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Speak an instruction aloud with crisp clarity, pre-speech chime, and deduplication.
   */
  public speak(text: string, force: boolean = false) {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    // Don't repeat identical instruction within 5 seconds unless forced
    if (!force && this.lastSpokenText === text && now - this.lastSpokenTime < 5000) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any lingering speech

      // Play pleasant attention chime before speaking turn
      audioChime.playTurnChime();

      // Format text with commas to force natural pauses in speech synthesis
      const formattedText = text
        .replace(/in (\d+) meters/i, 'In $1 meters,')
        .replace(/turn (left|right|sharp left|sharp right)/i, 'turn $1,');

      const utterance = new SpeechSynthesisUtterance(formattedText);
      // Slightly slower rate (0.88) makes speech crystal clear over vehicle/ambient noise
      utterance.rate = 0.88;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select highest quality available English voice
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = 
        voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))) ||
        voices.find(v => v.lang.includes('en-IN')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang || 'en-US';
      }

      this.lastSpokenText = text;
      this.lastSpokenTime = now;

      // Small 120ms pause after chime so chime and voice do not overlap
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 120);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceGuidance = new VoiceGuidanceService();
