import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TextParser } from '../src/core/TextParser.js';

describe('TextParser', () => {
	const parser = new TextParser();

	it('ignora colchetes vazios ou não numéricos, tratando como texto comum', () => {
		const result1 = parser.parse('[] C D E');
		assert.equal(result1[0].delayBeats, 0);
		assert.equal(result1[0].content, '[] C D E');

		const result2 = parser.parse('[abc] G A');
		assert.equal(result2[0].delayBeats, 0);
		assert.equal(result2[0].content, '[abc] G A');
	});
});
