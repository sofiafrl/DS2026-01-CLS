import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MusicEventEmitter, hasNote, toMidi } from '../src/core/MusicEventEmitter.js';
import { VoiceContext } from '../src/core/VoiceContext.js';

describe('MusicEventEmitter', () => {
	it('verifica notas musicais corretamente', () => {
		assert.equal(hasNote('C'), true);
		assert.equal(hasNote('Z'), false);
	});

	it('calcula semitons midi corretamente', () => {
		assert.equal(toMidi('C', 4), 60);
	});

	it('emite notas e avança o contexto', () => {
		const eventEmitter = new MusicEventEmitter();
		const context = new VoiceContext({ voiceIndex: 0 });

		const event = eventEmitter.emitNote(context, 'C');
		assert.equal(context.events[0], event);
		assert.equal(event.type, 'note');
		assert.equal(event.midi, 84);
		assert.equal(event.startSeconds, 0);
		assert.equal(event.durationSeconds, 0.5);
		assert.equal(context.beat, 1);
	});

	it('emite pausas (rests) e avança o contexto', () => {
		const eventEmitter = new MusicEventEmitter();
		const context = new VoiceContext({ voiceIndex: 0 });

		eventEmitter.emitRest(context);
		assert.equal(context.events[0].type, 'rest');
		assert.equal(context.events[0].startSeconds, 0);
		assert.equal(context.events[0].durationSeconds, 0.5);
		assert.equal(context.beat, 1);
	});

	it('emite Mi bemol (Mb) corretamente', () => {
		const eventEmitter = new MusicEventEmitter();
		const context = new VoiceContext({ voiceIndex: 0 });

		const event = eventEmitter.emitFlatMi(context);
		assert.equal(event.note, 'Mb');
		assert.equal(event.midi, 87); // E6 = 88, Flat = 87
	});

	it('repete a última nota ou gera uma pausa', () => {
		const eventEmitter = new MusicEventEmitter();
		const context = new VoiceContext({ voiceIndex: 0 });

		// Primeira repetição quando nenhuma nota foi tocada deve ser uma pausa
		eventEmitter.repeatLastNoteOrRest(context);
		assert.equal(context.events[0].type, 'rest');

		// Emitir nota e depois repetir
		eventEmitter.emitNote(context, 'D');
		eventEmitter.repeatLastNoteOrRest(context);
		assert.equal(context.events[2].type, 'note');
		assert.equal(context.events[2].note, 'D');
	});
});
