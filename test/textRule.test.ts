import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TextRule, assertTextRule } from '../src/core/TextRule.js';
import { VoiceContext } from '../src/core/VoiceContext.js';

class TestRule extends TextRule {
	override matches(_character: string, _nextCharacter: string, _context: VoiceContext): boolean {
		return true;
	}

	override apply(_character: string, _context: VoiceContext, _nextCharacter: string): number {
		return 1;
	}
}

describe('TextRule', () => {
	it('permite implementações de regras válidas', () => {
		const rule = new TestRule();
		assert.equal(assertTextRule(rule) instanceof TextRule, true);
	});

	it('rejeita objetos que não herdam de TextRule', () => {
		assert.throws(
			() => assertTextRule({ matches() {}, apply() {} }),
			/Every text rule must extend TextRule/
		);
	});
});
