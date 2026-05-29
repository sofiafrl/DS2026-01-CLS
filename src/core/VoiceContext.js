import { clampInstrument, clampVolume, getVoiceProfile, MUSIC_LIMITS } from './MusicDefaults.js';

export class VoiceContext {
  constructor({ voiceIndex, delayBeats = 0, initialBpm = 120, initialVolume, initialInstrument, initialOctave }) {
    const profile = getVoiceProfile(voiceIndex);

    this.voiceIndex = voiceIndex;
    this.beat = delayBeats;
    this.bpm = initialBpm;
    this.baseOctave = initialOctave ?? profile.baseOctave;
    this.octave = this.baseOctave;
    // Interface options currently override only the first voice.
    // Other voices keep their Phase 2 fugue profiles.
    this.volume = initialVolume ?? profile.baseVolume;
    this.instrument = initialInstrument ?? profile.baseInstrument;
    this.lastNote = null;
    this.lastProcessedWasNote = false;
    this.events = [];
  }

  addEvent(event) {
    this.events.push(event);
  }

  advance(duration = 1) {
    this.beat += duration;
  }

  setInstrument(program) {
    this.instrument = clampInstrument(program);
  }

  doubleVolume() {
    this.volume = clampVolume(this.volume * 2);
  }

  increaseOctave() {
    // When octave commands exceed the allowed range, return to the voice base octave.
    this.octave = this.octave < MUSIC_LIMITS.maxOctave ? this.octave + 1 : this.baseOctave;
  }

  decreaseOctave() {
    this.octave = this.octave > MUSIC_LIMITS.minOctave ? this.octave - 1 : this.baseOctave;
  }

  increaseBpm() {
    this.bpm += 10;
  }

  decreaseBpm() {
    this.bpm = Math.max(MUSIC_LIMITS.minBpm, this.bpm - 10);
  }
}
