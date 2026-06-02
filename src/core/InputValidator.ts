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

	constructor(errors: string[]) {
		super('Invalid music input.');
		this.name = 'InputValidationError';
		this.errors = errors;
	}
}

function isPlainObject(value: any): boolean {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateIntegerOption(options: any, name: keyof typeof OPTION_LIMITS, errors: string[]) {
	if (options[name] === undefined) return;

	const value = Number(options[name]);
	const limits = OPTION_LIMITS[name];

	if (!Number.isInteger(value)) {
		// Opcoes musicais fracionadas criariam estados ambiguos no interpretador.
		errors.push(`${name} must be an integer.`);
		return;
	}

	if (value < limits.min || value > limits.max) {
		errors.push(`${name} must be between ${limits.min} and ${limits.max}.`);
	}
}

export function validateInterpretRequest(body: any = {}): {
	text: string;
	options: PlaybackOptions;
} {
	const errors: string[] = [];
	const payload = isPlainObject(body) ? body : {};
	const text = payload.text ?? '';
	const options = payload.options ?? {};

	// A validacao fica antes do interpretador para rejeitar entradas invalidas cedo.
	if (typeof text !== 'string') {
		errors.push('text must be a string.');
	} else if (text.length > TEXT_LIMITS.maxLength) {
		errors.push(`text must have at most ${TEXT_LIMITS.maxLength} characters.`);
	}

	if (!isPlainObject(options)) {
		errors.push('options must be an object.');
	} else {
		validateIntegerOption(options, 'bpm', errors);
		validateIntegerOption(options, 'volume', errors);
		validateIntegerOption(options, 'octave', errors);
		validateIntegerOption(options, 'instrument', errors);
	}

	if (errors.length > 0) {
		throw new InputValidationError(errors);
	}

	return {
		text,
		options
	};
}
