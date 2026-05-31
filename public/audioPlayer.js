function midiToFrequency(midi) {
  return 440 * (2 ** ((midi - 69) / 12));
}

function waveformForInstrument(program) {
  if ([6, 20, 19, 70, 71].includes(program)) return 'triangle';
  if ([22, 109, 110, 114].includes(program)) return 'square';
  if (program >= 24 && program <= 31) return 'sawtooth';
  return 'sine';
}

export class AudioPlayer {
  constructor() {
    this.audioContext = null;
    this.scheduledNodes = [];
  }

  play(piece) {
    this.stop();
    this.audioContext = new AudioContext();
    const startAt = this.audioContext.currentTime + 0.08;

    for (const voice of piece.voices) {
      for (const event of voice.events) {
        if (event.type !== 'note') continue;

        // The core interpreter already accumulated tempo changes into seconds.
        const start = startAt + event.startSeconds;
        const duration = event.durationSeconds * 0.92;
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        oscillator.type = waveformForInstrument(event.instrument);
        oscillator.frequency.value = midiToFrequency(event.midi);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.002, event.volume / 127 * 0.18), start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        oscillator.connect(gain).connect(this.audioContext.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.03);
        this.scheduledNodes.push(oscillator);
      }
    }
  }

  stop() {
    for (const node of this.scheduledNodes) {
      try { node.stop(); } catch { /* node already stopped */ }
    }
    this.scheduledNodes = [];

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
