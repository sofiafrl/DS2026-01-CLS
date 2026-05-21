const BASE_OCTAVES = [6, 5, 4, 3];
const BASE_VOLUMES = [100, 80, 60, 40];
const BASE_INSTRUMENTS = [6, 20, 0, 70];

export class VoiceContext {
  constructor({ voiceIndex, delayBeats = 0, initialBpm = 120, initialVolume, initialInstrument, initialOctave }) {
    this.voiceIndex = voiceIndex;
    this.beat = delayBeats;
    this.bpm = initialBpm;
    this.baseOctave = initialOctave ?? BASE_OCTAVES[voiceIndex % BASE_OCTAVES.length];
    this.octave = this.baseOctave;
    this.volume = initialVolume ?? BASE_VOLUMES[voiceIndex % BASE_VOLUMES.length];
    this.instrument = initialInstrument ?? BASE_INSTRUMENTS[voiceIndex % BASE_INSTRUMENTS.length];
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
    this.instrument = Math.max(0, Math.min(127, Number(program)));
  }

  doubleVolume() {
    this.volume = Math.min(127, this.volume * 2);
  }

  increaseOctave() {
    this.octave = this.octave < 9 ? this.octave + 1 : this.baseOctave;
  }

  decreaseOctave() {
    this.octave = this.octave > 0 ? this.octave - 1 : this.baseOctave;
  }

  increaseBpm() {
    this.bpm += 10;
  }

  decreaseBpm() {
    this.bpm = Math.max(20, this.bpm - 10);
  }
}
