import { GENERAL_MIDI_INSTRUMENTS } from './core/InstrumentCatalog.js';
import { MusicInterpreter } from './core/MusicInterpreter.js';
import { MidiWriter } from './midi/MidiWriter.js';
import { validateInterpretRequest } from './core/InputValidator.js';
import { MusicPiece, PlaybackOptions } from './core/types.js';

const interpreter = new MusicInterpreter();
const midiWriter = new MidiWriter();

export function getInstruments(): { program: number; name: string }[] {
	// Converte o catalogo MIDI em opcoes simples para o select da interface.
	return GENERAL_MIDI_INSTRUMENTS.map((name, program) => ({ program, name }));
}

export function interpretText(text: string, options: PlaybackOptions): MusicPiece {
	// A mesma validacao protege tanto a interpretacao quanto a geracao de MIDI.
	const validated = validateInterpretRequest({ text, options });
	return interpreter.interpret(validated.text, validated.options);
}

export function generateMidi(text: string, options: PlaybackOptions): Blob {
	const validated = validateInterpretRequest({ text, options });
	const piece = interpreter.interpret(validated.text, validated.options);
	const midiBytes = midiWriter.write(piece);
	return new Blob([midiBytes.buffer as ArrayBuffer], { type: 'audio/midi' });
}
