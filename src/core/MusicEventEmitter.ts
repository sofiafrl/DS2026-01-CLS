import { MusicEvent } from './types.js';
import { VoiceContext } from './VoiceContext.js';

const NOTE_TO_SEMITONE: Record<string, number> = {
	C: 0,
	D: 2,
	E: 4,
	F: 5,
	G: 7,
	A: 9,
	H: 10,
	B: 11
};

export function hasNote(character: string): boolean {
	return character in NOTE_TO_SEMITONE;
}

export function toMidi(note: string, octave: number): number {
	return 12 * (octave + 1) + NOTE_TO_SEMITONE[note];
}

const DEFAULT_EVENT_DURATION = 1;

export class MusicEventEmitter {
	emitNote(context: VoiceContext, note: string): MusicEvent {
		const duration = DEFAULT_EVENT_DURATION;
		// O evento guarda tanto a posicao em beats quanto em segundos para audio e MIDI.
		const event: MusicEvent = {
			type: 'note',
			voice: context.voiceIndex,
			beat: context.beat,
			duration,
			startSeconds: context.timeSeconds,
			durationSeconds: context.durationSeconds(duration),
			note,
			octave: context.octave,
			midi: toMidi(note, context.octave),
			volume: context.volume,
			instrument: context.instrument,
			bpm: context.bpm
		};

		context.addEvent(event);
		// O historico permite repetir a ultima nota quando aparece caractere desconhecido.
		context.lastNote = note;
		context.lastProcessedWasNote = true;
		context.advance();

		return event;
	}

	emitFlatMi(context: VoiceContext): MusicEvent {
		// Mi bemol nasce como Mi natural e depois desce um semitom no MIDI.
		const event = this.emitNote(context, 'E');

		event.note = 'Mb';
		if (event.midi !== null && event.midi !== undefined) {
			event.midi -= 1;
		}

		return event;
	}

	emitRest(context: VoiceContext) {
		const duration = DEFAULT_EVENT_DURATION;
		// Pausas tambem entram na linha do tempo para manter o espacamento das notas.
		context.addEvent({
			type: 'rest',
			voice: context.voiceIndex,
			beat: context.beat,
			duration,
			startSeconds: context.timeSeconds,
			durationSeconds: context.durationSeconds(duration),
			volume: context.volume,
			instrument: context.instrument,
			bpm: context.bpm
		});

		context.lastProcessedWasNote = false;
		context.advance();
	}

	repeatLastNoteOrRest(context: VoiceContext) {
		// Se a ultima acao musical foi nota, repete; caso contrario, gera pausa.
		if (context.lastProcessedWasNote && context.lastNote) {
			this.emitNote(context, context.lastNote);
			return;
		}

		this.emitRest(context);
	}
}
