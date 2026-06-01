import { GENERAL_MIDI_INSTRUMENTS } from './core/InstrumentCatalog.js';
import { MusicInterpreter } from './core/MusicInterpreter.js';
import { MidiWriter } from './midi/MidiWriter.js';
import { validateInterpretRequest } from './core/InputValidator.js';

const interpreter = new MusicInterpreter();
const midiWriter = new MidiWriter();

export async function fetchInstruments() {
  return GENERAL_MIDI_INSTRUMENTS.map((name, program) => ({ program, name }));
}

export async function interpretText(text, options) {
  const validated = validateInterpretRequest({ text, options });
  return interpreter.interpret(validated.text, validated.options);
}

export async function fetchMidi(text, options) {
  const validated = validateInterpretRequest({ text, options });
  const piece = interpreter.interpret(validated.text, validated.options);
  const midiBytes = midiWriter.write(piece);
  return new Blob([midiBytes], { type: 'audio/midi' });
}
