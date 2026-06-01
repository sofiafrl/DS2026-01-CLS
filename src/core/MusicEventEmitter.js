import { MusicEvent } from './MusicEvent.js';

const NOTE_TO_SEMITONE = {
	C: 0,
	D: 2,
	E: 4,
	F: 5,
	G: 7,
	A: 9,
	H: 10,
	B: 11
};

export function hasNote(character) {
	return Object.prototype.hasOwnProperty.call(NOTE_TO_SEMITONE, character);
}

export function toMidi(note, octave) {
	return 12 * (octave + 1) + NOTE_TO_SEMITONE[note];
}

const DEFAULT_EVENT_DURATION = 1;

export class MusicEventEmitter {
	// Rules delegate event creation here so text mapping stays separate from
	// the internal MusicEvent shape.
	emitNote(context, note) {
		const duration = DEFAULT_EVENT_DURATION;
		const event = new MusicEvent({
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
		});

		context.addEvent(event);
		context.lastNote = note;
		context.lastProcessedWasNote = true;
		context.advance();

		return event;
	}

	emitFlatMi(context) {
		const event = this.emitNote(context, 'E');

		event.note = 'Mb';
		event.midi -= 1;

		return event;
	}

	emitRest(context) {
		const duration = DEFAULT_EVENT_DURATION;
		context.addEvent(
			new MusicEvent({
				type: 'rest',
				voice: context.voiceIndex,
				beat: context.beat,
				duration,
				startSeconds: context.timeSeconds,
				durationSeconds: context.durationSeconds(duration),
				volume: context.volume,
				instrument: context.instrument,
				bpm: context.bpm
			})
		);

		context.lastProcessedWasNote = false;
		context.advance();
	}

	repeatLastNoteOrRest(context) {
		if (context.lastProcessedWasNote && context.lastNote) {
			this.emitNote(context, context.lastNote);
			return;
		}

		this.emitRest(context);
	}
}

export const DEFAULT_EVENT_EMITTER = new MusicEventEmitter();
