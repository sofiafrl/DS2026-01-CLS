import { DEFAULT_EVENT_EMITTER, hasNote, MusicEventEmitter } from './MusicEventEmitter.js';
import { TextRule } from './TextRule.js';
import { VoiceContext } from './VoiceContext.js';

export class NoteRule extends TextRule {
	private eventEmitter: MusicEventEmitter;

	constructor(eventEmitter: MusicEventEmitter = DEFAULT_EVENT_EMITTER) {
		super();
		this.eventEmitter = eventEmitter;
	}

	override matches(character: string, nextCharacter: string, _context: VoiceContext): boolean {
		return hasNote(character) || (character === 'M' && nextCharacter === 'b');
	}

	override apply(character: string, context: VoiceContext, _nextCharacter: string): number {
		if (character === 'M') {
			this.eventEmitter.emitFlatMi(context);
			return 2;
		}

		this.eventEmitter.emitNote(context, character);
		return 1;
	}
}

export class LowercaseRestRule extends TextRule {
	private eventEmitter: MusicEventEmitter;

	constructor(eventEmitter: MusicEventEmitter = DEFAULT_EVENT_EMITTER) {
		super();
		this.eventEmitter = eventEmitter;
	}

	override matches(character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return character >= 'a' && character <= 'h';
	}

	override apply(_character: string, context: VoiceContext, _nextCharacter: string): number {
		this.eventEmitter.emitRest(context);
		return 1;
	}
}

export class SpaceVolumeRule extends TextRule {
	override matches(character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return character === ' ';
	}

	override apply(_character: string, context: VoiceContext, _nextCharacter: string): number {
		context.doubleVolume();
		return 1;
	}
}

export class HarmonicaRule extends TextRule {
	override matches(character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return character === '!';
	}

	override apply(_character: string, context: VoiceContext, _nextCharacter: string): number {
		context.setInstrument(22);
		return 1;
	}
}

export class BagpipeVowelRule extends TextRule {
	override matches(character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return 'OoIiUu'.includes(character);
	}

	override apply(_character: string, context: VoiceContext, _nextCharacter: string): number {
		context.setInstrument(109);
		return 1;
	}
}

export class EvenDigitRule extends TextRule {
	override matches(character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return '02468'.includes(character);
	}

	override apply(character: string, context: VoiceContext, _nextCharacter: string): number {
		context.setInstrument(context.instrument + Number(character));
		return 1;
	}
}

export class OctaveUpRule extends TextRule {
	override matches(character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return character === '?' || character === '.';
	}

	override apply(_character: string, context: VoiceContext, _nextCharacter: string): number {
		context.increaseOctave();
		return 1;
	}
}

export class OctaveDownRule extends TextRule {
	override matches(character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return character === 'V';
	}

	override apply(_character: string, context: VoiceContext, _nextCharacter: string): number {
		context.decreaseOctave();
		return 1;
	}
}

export class TubularBellsRule extends TextRule {
	override matches(character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return character === ';' || '13579'.includes(character);
	}

	override apply(_character: string, context: VoiceContext, _nextCharacter: string): number {
		context.setInstrument(14);
		return 1;
	}
}

export class ChurchOrganRule extends TextRule {
	override matches(character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return character === ',';
	}

	override apply(_character: string, context: VoiceContext, _nextCharacter: string): number {
		context.setInstrument(19);
		return 1;
	}
}

export class BpmUpRule extends TextRule {
	override matches(character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return character === '>';
	}

	override apply(_character: string, context: VoiceContext, _nextCharacter: string): number {
		context.increaseBpm();
		return 1;
	}
}

export class BpmDownRule extends TextRule {
	override matches(character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return character === '<';
	}

	override apply(_character: string, context: VoiceContext, _nextCharacter: string): number {
		context.decreaseBpm();
		return 1;
	}
}

export class RepeatOrRestRule extends TextRule {
	private eventEmitter: MusicEventEmitter;

	constructor(eventEmitter: MusicEventEmitter = DEFAULT_EVENT_EMITTER) {
		super();
		this.eventEmitter = eventEmitter;
	}

	override matches(_character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return true;
	}

	override apply(_character: string, context: VoiceContext, _nextCharacter: string): number {
		this.eventEmitter.repeatLastNoteOrRest(context);
		return 1;
	}
}

export const DEFAULT_RULES: TextRule[] = [
	new NoteRule(),
	new LowercaseRestRule(),
	new SpaceVolumeRule(),
	new HarmonicaRule(),
	new BagpipeVowelRule(),
	new EvenDigitRule(),
	new OctaveUpRule(),
	new OctaveDownRule(),
	new TubularBellsRule(),
	new ChurchOrganRule(),
	new BpmUpRule(),
	new BpmDownRule(),
	new RepeatOrRestRule()
];
