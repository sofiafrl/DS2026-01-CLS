import assert from 'node:assert/strict';
import { MusicInterpreter } from '../src/core/MusicInterpreter.js';
import { MidiWriter } from '../src/midi/MidiWriter.js';
import { MusicEventEmitter, hasNote, toMidi } from '../src/core/MusicEventEmitter.js';
import { TextRule, assertTextRule } from '../src/core/TextRule.js';
import { VoiceContext } from '../src/core/VoiceContext.js';

const interpreter = new MusicInterpreter();

class TestRule extends TextRule {
  matches(_character, _nextCharacter, _context) {
    return true;
  }

  apply(_character, _context, _nextCharacter) {
    return 1;
  }
}

assert.equal(assertTextRule(new TestRule()) instanceof TextRule, true);
assert.throws(() => new TextRule(), /TextRule is abstract/);
assert.throws(
  () => assertTextRule({ matches() {}, apply() {} }),
  /Every text rule must extend TextRule and implement matches\(\) and apply\(\)\./
);

assert.equal(hasNote('C'), true);
assert.equal(hasNote('Z'), false);
assert.equal(toMidi('C', 4), 60);

const eventEmitter = new MusicEventEmitter();
const eventContext = new VoiceContext({ voiceIndex: 0 });
eventEmitter.emitNote(eventContext, 'C');
assert.equal(eventContext.events[0].type, 'note');
assert.equal(eventContext.events[0].midi, 84);
assert.equal(eventContext.events[0].startSeconds, 0);
assert.equal(eventContext.events[0].durationSeconds, 0.5);
assert.equal(eventContext.beat, 1);

eventEmitter.emitRest(eventContext);
assert.equal(eventContext.events[1].type, 'rest');
assert.equal(eventContext.events[1].startSeconds, 0.5);
assert.equal(eventContext.events[1].durationSeconds, 0.5);
assert.equal(eventContext.beat, 2);

const piece = interpreter.interpret('[0] C D E F\n[4] G A B C', { bpm: 120, volume: 100, instrument: 6, octave: 6 });
assert.equal(piece.metadata.voiceCount, 2);
assert.equal(piece.voices[0].events.find((event) => event.type === 'note').note, 'C');
assert.equal(piece.voices[1].events.find((event) => event.type === 'note').beat, 4);

const voiceProfiles = interpreter.interpret('[0] C\n[0] C\n[0] C\n[0] C\n[0] C');
assert.equal(voiceProfiles.voices[0].baseOctave, 6);
assert.equal(voiceProfiles.voices[1].baseOctave, 5);
assert.equal(voiceProfiles.voices[2].baseOctave, 4);
assert.equal(voiceProfiles.voices[3].baseOctave, 3);
assert.equal(voiceProfiles.voices[4].baseOctave, 6);
assert.equal(voiceProfiles.voices[0].finalVolume, 100);
assert.equal(voiceProfiles.voices[1].finalVolume, 80);
assert.equal(voiceProfiles.voices[2].finalVolume, 60);
assert.equal(voiceProfiles.voices[3].finalVolume, 40);

const controls = interpreter.interpret('[0] C?DVE>F<', { bpm: 120, volume: 80, instrument: 0, octave: 5 });
const notes = controls.voices[0].events.filter((event) => event.type === 'note');
assert.equal(notes[0].octave, 5);
assert.equal(notes[1].octave, 6);
assert.equal(notes[2].octave, 5);
assert.equal(notes[3].bpm, 130);

const variableTempo = interpreter.interpret('[0] C>D', { bpm: 150 });
const variableTempoNotes = variableTempo.voices[0].events.filter((event) => event.type === 'note');
assert.equal(variableTempoNotes[0].startSeconds, 0);
assert.equal(variableTempoNotes[0].durationSeconds, 0.4);
assert.equal(variableTempoNotes[1].startSeconds, 0.4);
assert.equal(variableTempoNotes[1].durationSeconds, 0.375);

const mb = interpreter.interpret('[0] Mb', { bpm: 120, volume: 80, instrument: 0, octave: 4 });
const mbNote = mb.voices[0].events.find((event) => event.type === 'note');
assert.equal(mbNote.note, 'Mb');
assert.equal(mbNote.midi, 63);

const midi = new MidiWriter().write(piece);
assert.equal(midi.subarray(0, 4).toString(), 'MThd');
assert.ok(midi.length > 30);

console.log('Todos os testes passaram.');
