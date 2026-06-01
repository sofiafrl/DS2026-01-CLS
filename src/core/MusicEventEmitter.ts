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
	return Object.prototype.hasOwnProperty.call(NOTE_TO_SEMITONE, character);
}

export function toMidi(note: string, octave: number): number {
	return 12 * (octave + 1) + NOTE_TO_SEMITONE[note];
}

const DEFAULT_EVENT_DURATION = 1;

export class MusicEventEmitter {
	emitNote(context: VoiceContext, note: string): MusicEvent {
		const duration = DEFAULT_EVENT_DURATION;
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
		context.lastNote = note;
		context.lastProcessedWasNote = true;
		context.advance();

		return event;
	}

	emitFlatMi(context: VoiceContext): MusicEvent {
		const event = this.emitNote(context, 'E');

		event.note = 'Mb';
		if (event.midi !== null && event.midi !== undefined) {
			event.midi -= 1;
		}

		return event;
	}

	emitRest(context: VoiceContext) {
		const duration = DEFAULT_EVENT_DURATION;
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
		if (context.lastProcessedWasNote && context.lastNote) {
			this.emitNote(context, context.lastNote);
			return;
		}

		this.emitRest(context);
	}
}

export const DEFAULT_EVENT_EMITTER = new MusicEventEmitter();
