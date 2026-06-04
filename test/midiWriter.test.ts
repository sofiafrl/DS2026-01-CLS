import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MidiWriter } from '../src/midi/MidiWriter.js';
import { MusicInterpreter } from '../src/core/MusicInterpreter.js';

describe('MidiWriter', () => {
	const interpreter = new MusicInterpreter();
	const midiWriter = new MidiWriter();

	it('gera um arquivo MIDI válido', () => {
		const piece = interpreter.interpret('[0] C D E F');
		const midi = midiWriter.write(piece);

		assert.equal(new TextDecoder().decode(midi.subarray(0, 4)), 'MThd');
		assert.ok(midi.length > 30);
	});
});
