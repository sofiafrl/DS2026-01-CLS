export class MusicEvent {
  constructor({
    type,
    voice,
    beat,
    duration = 1,
    startSeconds = 0,
    durationSeconds = 0,
    note = null,
    octave = null,
    midi = null,
    volume,
    instrument,
    bpm
  }) {
    this.type = type;
    this.voice = voice;
    this.beat = beat;
    this.duration = duration;
    this.startSeconds = startSeconds;
    this.durationSeconds = durationSeconds;
    this.note = note;
    this.octave = octave;
    this.midi = midi;
    this.volume = volume;
    this.instrument = instrument;
    this.bpm = bpm;
  }
}
