/**
 * Pure Web Audio API Sound Synthesizer
 * Generates realistic hospital phone chimes and dial tones without external audio assets.
 */

let audioCtx = null;
let ringtoneInterval = null;
let activeOscillators = [];

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Stop any currently playing synthesized sounds
 */
export function stopAllSounds() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }

  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // Ignored if already stopped
    }
  });
  activeOscillators = [];
}

/**
 * Plays a modern, pleasant medical incoming call ringtone
 */
export function playIncomingRingtone() {
  stopAllSounds();
  const ctx = getAudioContext();
  if (!ctx) return;

  const playChimeBurst = () => {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 melodic arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.4);

      activeOscillators.push(osc);
    });
  };

  // Play immediately and repeat every 2.4s
  playChimeBurst();
  ringtoneInterval = setInterval(playChimeBurst, 2400);
}

/**
 * Plays standard telephone dial tone (repeating ringback tone) for patient calling doctor
 */
export function playOutgoingDialTone() {
  stopAllSounds();
  const ctx = getAudioContext();
  if (!ctx) return;

  const playRingBurst = () => {
    const now = ctx.currentTime;
    // Dual-tone: 440 Hz + 480 Hz (Standard North American / European telephone ringback)
    [440, 480].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.setValueAtTime(0.08, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.35);

      activeOscillators.push(osc);
    });
  };

  playRingBurst();
  ringtoneInterval = setInterval(playRingBurst, 3500);
}
