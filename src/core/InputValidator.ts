import { MUSIC_LIMITS } from './MusicDefaults.js';
import { PlaybackOptions } from './types.js';

const TEXT_LIMITS = {
	maxLength: 3000
};

const OPTION_LIMITS = {
	// Estes limites protegem a interface e mantem os valores dentro do dominio MIDI.
	bpm: { min: 40, max: 220 },
	volume: { min: 1, max: MUSIC_LIMITS.maxVolume },
	octave: { min: MUSIC_LIMITS.minOctave, max: MUSIC_LIMITS.maxOctave },
	instrument: { min: MUSIC_LIMITS.minInstrument, max: MUSIC_LIMITS.maxInstrument }
};

export class InputValidationError extends Error {
	public errors: string[];

	constructor(message: string) {
		super(message);
		this.name = 'InputValidationError';
		this.errors = [message];
	}
}

export function validateInterpretRequest(payload: {
	text: string;
	options: PlaybackOptions;
}): {
	text: string;
	options: PlaybackOptions;
} {
	const text = payload.text;
	const options = payload.options;

	// A validacao fica antes do interpretador para rejeitar entradas invalidas cedo.
	if (text.length > TEXT_LIMITS.maxLength) {
		throw new InputValidationError(`text must have at most ${TEXT_LIMITS.maxLength} characters.`);
	}

	for (const key of ['bpm', 'volume', 'octave', 'instrument'] as const) {
		const value = options[key];
		if (value !== undefined) {
			const limits = OPTION_LIMITS[key];
			if (!Number.isInteger(value)) {
				throw new InputValidationError(`${key} must be an integer.`);
			}
			if (value < limits.min || value > limits.max) {
				throw new InputValidationError(`${key} must be between ${limits.min} and ${limits.max}.`);
			}
		}
	}

	return {
		text,
		options
	};
}
