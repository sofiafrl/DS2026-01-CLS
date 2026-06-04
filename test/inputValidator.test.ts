import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { InputValidationError, validateInterpretRequest } from '../src/core/InputValidator.js';

describe('InputValidator', () => {
	it('aceita entradas de música válidas', () => {
		const validInput = validateInterpretRequest({
			text: '[0] C>D',
			options: { bpm: 150, volume: 100, octave: 6, instrument: 24 }
		});
		assert.equal(validInput.text, '[0] C>D');
		assert.equal(validInput.options.bpm, 150);
	});

	it('falha se as opções excederem os limites mínimo e máximo', () => {
		assert.throws(
			() =>
				validateInterpretRequest({
					text: 'C',
					options: { bpm: 10, volume: 200, octave: 10, instrument: 128 }
				}),
			InputValidationError
		);
	});
});
