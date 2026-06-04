import { GENERAL_MIDI_INSTRUMENTS } from './core/InstrumentCatalog.js';
import { MusicInterpreter } from './core/MusicInterpreter.js';
import { MidiWriter } from './midi/MidiWriter.js';
import { validateInterpretRequest } from './core/InputValidator.js';
import { MusicPiece, PlaybackOptions } from './core/types.js';

export class MusicService {
	constructor(
		private readonly interpreter = new MusicInterpreter(),
		private readonly midiWriter = new MidiWriter()
	) {}

	getInstruments(): { program: number; name: string }[] {
		// Converte o catalogo MIDI em opcoes simples para o select da interface.
		return GENERAL_MIDI_INSTRUMENTS.map((name, program) => ({ program, name }));
	}

	interpretText(text: string, options: PlaybackOptions): MusicPiece {
		// A mesma validacao protege tanto a interpretacao quanto a geracao de MIDI.
		const validated = validateInterpretRequest({ text, options });
		return this.interpreter.interpret(validated.text, validated.options);
	}

	generateMidi(text: string, options: PlaybackOptions): Blob {
		const validated = validateInterpretRequest({ text, options });
		const piece = this.interpreter.interpret(validated.text, validated.options);
		return new Blob([this.midiWriter.write(piece) as BlobPart], { type: 'audio/midi' });
	}
}

export const defaultMusicService = new MusicService();

export function getInstruments(): { program: number; name: string }[] {
	return defaultMusicService.getInstruments();
}

export function interpretText(text: string, options: PlaybackOptions): MusicPiece {
	return defaultMusicService.interpretText(text, options);
}

export function generateMidi(text: string, options: PlaybackOptions): Blob {
	return defaultMusicService.generateMidi(text, options);
}
