export class TextRule {
	constructor() {
		if (new.target === TextRule) {
			throw new Error('TextRule is abstract and cannot be instantiated directly.');
		}
	}

	// Concrete rules decide whether they can handle the current parser position.
	matches(_character, _nextCharacter, _context) {
		throw new Error(`${this.constructor.name} must implement matches().`);
	}

	// Concrete rules apply their mapping and return how many characters were consumed.
	apply(_character, _context, _nextCharacter) {
		throw new Error(`${this.constructor.name} must implement apply().`);
	}
}

export function assertTextRule(rule) {
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
