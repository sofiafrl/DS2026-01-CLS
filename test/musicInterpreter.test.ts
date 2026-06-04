import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MusicInterpreter } from '../src/core/MusicInterpreter.js';

describe('MusicInterpreter', () => {
	const interpreter = new MusicInterpreter();

	it('interpreta múltiplos canais (vozes) e atrasos corretamente', () => {
		const piece = interpreter.interpret('[0] C D E F\n[4] G A B C', {
			bpm: 120,
			volume: 100,
			instrument: 6,
			octave: 6
		});
		assert.equal(piece.metadata.voiceCount, 2);
		assert.equal(piece.voices[0].events.find((e) => e.type === 'note')!.note, 'C');
		assert.equal(piece.voices[1].events.find((e) => e.type === 'note')!.beat, 4);
		assert.equal(piece.voices[1].events.find((e) => e.type === 'note')!.startSeconds, 2);
	});

	it('configura propriedades iniciais e perfis por índice de voz', () => {
		const piece = interpreter.interpret('[0] C\n[0] C\n[0] C\n[0] C\n[0] C');
		assert.equal(piece.voices[0].baseOctave, 6);
		assert.equal(piece.voices[1].baseOctave, 5);
		assert.equal(piece.voices[2].baseOctave, 4);
		assert.equal(piece.voices[3].baseOctave, 3);
		assert.equal(piece.voices[4].baseOctave, 6);
		assert.equal(piece.voices[0].finalVolume, 100);
		assert.equal(piece.voices[1].finalVolume, 80);
		assert.equal(piece.voices[2].finalVolume, 60);
		assert.equal(piece.voices[3].finalVolume, 40);
	});

	it('processa controles como modificadores de oitava e ajustes de tempo', () => {
		const piece = interpreter.interpret('[0] C?DVE>F<', {
			bpm: 120,
			volume: 80,
			instrument: 0,
			octave: 5
		});
		const notes = piece.voices[0].events.filter((e) => e.type === 'note');
		assert.equal(notes[0].octave, 5);
		assert.equal(notes[1].octave, 6);
		assert.equal(notes[2].octave, 5);
		assert.equal(notes[3].bpm, 130);
	});

	it('ajusta segundos baseado no tempo dinâmico', () => {
		const piece = interpreter.interpret('[0] C>D', { bpm: 150 });
		const notes = piece.voices[0].events.filter((e) => e.type === 'note');
		assert.equal(notes[0].startSeconds, 0);
		assert.equal(notes[0].durationSeconds, 0.4);
		assert.equal(notes[1].startSeconds, 0.4);
		assert.equal(notes[1].durationSeconds, 0.375);
	});

	it('lida com pausas em letras minúsculas', () => {
		const piece = interpreter.interpret('[0] a');
		assert.equal(piece.voices[0].events[0].type, 'rest');
	});

	it('dobra o volume ao encontrar espaços', () => {
		const piece = interpreter.interpret('[0] C C C', {
			bpm: 120,
			volume: 70,
			instrument: 0,
			octave: 5
		});
		const notes = piece.voices[0].events.filter((e) => e.type === 'note');
		assert.equal(notes[0].volume, 70);
		assert.equal(notes[1].volume, 127);
		assert.equal(notes[2].volume, 127);
	});

	it('altera o instrumento nos caracteres correspondentes', () => {
		const checkInstrument = (text: string, initialInstrument = 0) => {
			const piece = interpreter.interpret(text, { instrument: initialInstrument });
			return piece.voices[0].events.find((e) => e.type === 'note')!.instrument;
		};

		assert.equal(checkInstrument('[0] !C'), 22);
		assert.equal(checkInstrument('[0] OC'), 109);
		assert.equal(checkInstrument('[0] 2C', 10), 12);
		assert.equal(checkInstrument('[0] ;C'), 14);
		assert.equal(checkInstrument('[0] 1C'), 14);
		assert.equal(checkInstrument('[0] ,C'), 19);
		assert.equal(checkInstrument('[0] 8C', 124), 127);
	});

	it('lida com Mi bemol (Mb)', () => {
		const piece = interpreter.interpret('[0] Mb', { bpm: 120, volume: 80, instrument: 0, octave: 4 });
		const note = piece.voices[0].events.find((e) => e.type === 'note')!;
		assert.equal(note.note, 'Mb');
		assert.equal(note.midi, 63);
	});

	it('repete a última nota ou gera uma pausa como fallback em caracteres desconhecidos', () => {
		const repeatedPiece = interpreter.interpret('[0] CZ');
		const repeatedNotes = repeatedPiece.voices[0].events.filter((e) => e.type === 'note');
		assert.equal(repeatedNotes.length, 2);
		assert.equal(repeatedNotes[1].note, 'C');
		assert.equal(repeatedNotes[1].beat, 1);

		const fallbackPiece = interpreter.interpret('[0] Z');
		assert.equal(fallbackPiece.voices[0].events[0].type, 'rest');
	});

	it('mantém os limites de tempo sob as margens mínimas', () => {
		const piece = interpreter.interpret('[0] <<<<<<C', { bpm: 50 });
		const note = piece.voices[0].events.find((e) => e.type === 'note')!;
		assert.equal(note.bpm, 20);
	});
});
