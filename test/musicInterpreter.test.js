import assert from 'node:assert/strict';
import { MusicInterpreter } from '../src/core/MusicInterpreter.js';
import { MidiWriter } from '../src/midi/MidiWriter.js';

const interpreter = new MusicInterpreter();

const piece = interpreter.interpret('[0] C D E F\n[4] G A B C', { bpm: 120, volume: 100, instrument: 6, octave: 6 });
assert.equal(piece.metadata.voiceCount, 2);
assert.equal(piece.voices[0].events.find((event) => event.type === 'note').note, 'C');
assert.equal(piece.voices[1].events.find((event) => event.type === 'note').beat, 4);

const controls = interpreter.interpret('[0] C?DVE>F<', { bpm: 120, volume: 80, instrument: 0, octave: 5 });
const notes = controls.voices[0].events.filter((event) => event.type === 'note');
assert.equal(notes[0].octave, 5);
assert.equal(notes[1].octave, 6);
assert.equal(notes[2].octave, 5);
assert.equal(notes[3].bpm, 130);

const mb = interpreter.interpret('[0] Mb', { bpm: 120, volume: 80, instrument: 0, octave: 4 });
const mbNote = mb.voices[0].events.find((event) => event.type === 'note');
assert.equal(mbNote.note, 'Mb');
assert.equal(mbNote.midi, 63);

const midi = new MidiWriter().write(piece);
assert.equal(midi.subarray(0, 4).toString(), 'MThd');
assert.ok(midi.length > 30);

console.log('Todos os testes passaram.');
