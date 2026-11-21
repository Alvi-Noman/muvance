/**
 * Short notification tones, made with Web Audio so there are no sound files to load.
 * Browsers only allow sound after the person has clicked something, which joining a call is.
 */
let ctx: AudioContext | undefined;

function tone(freqs: number[], { gap = 0.12, length = 0.18, volume = 0.08 } = {}) {
  try {
    ctx ??= new AudioContext();
    const audio = ctx;
    if (audio.state === 'suspended') void audio.resume();
    const start = audio.currentTime + 0.02;
    freqs.forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = start + i * gap;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
      osc.connect(gain).connect(audio.destination);
      osc.start(t);
      osc.stop(t + length + 0.05);
    });
  } catch {
    // No audio available: notifications stay silent.
  }
}

export const sounds = {
  join: () => tone([523.25, 659.25, 783.99]),
  leave: () => tone([783.99, 659.25, 523.25]),
  knock: () => tone([880, 880, 1174.66], { gap: 0.16, length: 0.14, volume: 0.1 }),
  message: () => tone([1046.5, 1318.5], { gap: 0.08, length: 0.12, volume: 0.05 }),
  hand: () => tone([659.25, 987.77], { gap: 0.1, length: 0.2, volume: 0.06 }),
};
