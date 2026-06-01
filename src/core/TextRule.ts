import { VoiceContext } from './VoiceContext.js';

export class TextRule {
	constructor() {
		if (new.target === TextRule) {
			throw new Error('TextRule is abstract and cannot be instantiated directly.');
		}
	}

	matches(character: string, nextCharacter: string, context: VoiceContext): boolean {
		throw new Error(`${this.constructor.name} must implement matches().`);
	}

	apply(character: string, context: VoiceContext, nextCharacter: string): number {
		throw new Error(`${this.constructor.name} must implement apply().`);
	}
}

export function assertTextRule(rule: any): TextRule {
	const followsTextRuleContract =
		rule instanceof TextRule &&
		typeof rule.matches === 'function' &&
		typeof rule.apply === 'function';

	if (!followsTextRuleContract) {
		throw new TypeError(
			'Every text rule must extend TextRule and implement matches() and apply().'
		);
	}

	return rule;
}
