import assert from 'node:assert/strict';
import { MusicInterpreter } from '../src/core/MusicInterpreter.js';
import { MidiWriter } from '../src/midi/MidiWriter.js';
import { MusicEventEmitter, hasNote, toMidi } from '../src/core/MusicEventEmitter.js';
import { InputValidationError, validateInterpretRequest } from '../src/core/InputValidator.js';
import { TextRule, assertTextRule } from '../src/core/TextRule.js';
import { VoiceContext } from '../src/core/VoiceContext.js';

const interpreter = new MusicInterpreter();

function firstVoiceEvents(text, options = {}) {
  return interpreter.interpret(text, options).voices[0].events;
}

function firstNote(text, options = {}) {
  return firstVoiceEvents(text, options).find((event) => event.type === 'note');
}

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

const validInput = validateInterpretRequest({
  text: '[0] C>D',
  options: { bpm: 150, volume: 100, octave: 6, instrument: 24 }
});
assert.equal(validInput.text, '[0] C>D');
assert.equal(validInput.options.bpm, 150);
assert.throws(
  () => validateInterpretRequest({ text: 123, options: { bpm: 10, volume: 200, octave: 10, instrument: 128 } }),
  InputValidationError
);
assert.throws(
  () => validateInterpretRequest({ text: 'C', options: 'invalid' }),
  InputValidationError
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
assert.equal(piece.voices[1].events.find((event) => event.type === 'note').startSeconds, 2);

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

const lowercaseRest = firstVoiceEvents('[0] a');
assert.equal(lowercaseRest[0].type, 'rest');
assert.equal(lowercaseRest[0].beat, 0);

const volumeDoubling = firstVoiceEvents('[0] C C C', { bpm: 120, volume: 70, instrument: 0, octave: 5 })
  .filter((event) => event.type === 'note');
assert.equal(volumeDoubling[0].volume, 70);
assert.equal(volumeDoubling[1].volume, 127);
assert.equal(volumeDoubling[2].volume, 127);

assert.equal(firstNote('[0] !C', { instrument: 0 }).instrument, 22);
assert.equal(firstNote('[0] OC', { instrument: 0 }).instrument, 109);
assert.equal(firstNote('[0] 2C', { instrument: 10 }).instrument, 12);
assert.equal(firstNote('[0] ;C', { instrument: 0 }).instrument, 14);
assert.equal(firstNote('[0] 1C', { instrument: 0 }).instrument, 14);
assert.equal(firstNote('[0] ,C', { instrument: 0 }).instrument, 19);
assert.equal(firstNote('[0] 8C', { instrument: 124 }).instrument, 127);

const repeatedUnknown = firstVoiceEvents('[0] CZ').filter((event) => event.type === 'note');
assert.equal(repeatedUnknown.length, 2);
assert.equal(repeatedUnknown[1].note, 'C');
assert.equal(repeatedUnknown[1].beat, 1);

const fallbackRest = firstVoiceEvents('[0] Z');
assert.equal(fallbackRest[0].type, 'rest');

assert.equal(firstNote('[0] <<<<<<C', { bpm: 50 }).bpm, 20);

const mb = interpreter.interpret('[0] Mb', { bpm: 120, volume: 80, instrument: 0, octave: 4 });
const mbNote = mb.voices[0].events.find((event) => event.type === 'note');
assert.equal(mbNote.note, 'Mb');
assert.equal(mbNote.midi, 63);

const midi = new MidiWriter().write(piece);
assert.equal(midi.subarray(0, 4).toString(), 'MThd');
assert.ok(midi.length > 30);

console.log('Todos os testes passaram.');
