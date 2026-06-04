import { VoiceContext } from './VoiceContext.js';

export abstract class TextRule {
	abstract matches(character: string, nextCharacter: string, context: VoiceContext): boolean;
	abstract apply(character: string, context: VoiceContext, nextCharacter: string): number;
}

export function assertTextRule(rule: unknown): TextRule {
	if (!(rule instanceof TextRule)) {
		throw new TypeError(
			'Every text rule must extend TextRule and implement matches() and apply().'
		);
	}

	return rule;
}
