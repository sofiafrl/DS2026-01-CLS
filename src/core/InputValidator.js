import { MUSIC_LIMITS } from './MusicDefaults.js';

const TEXT_LIMITS = {
  maxLength: 3000
};

const OPTION_LIMITS = {
  bpm: { min: 40, max: 220 },
  volume: { min: 1, max: MUSIC_LIMITS.maxVolume },
  octave: { min: MUSIC_LIMITS.minOctave, max: MUSIC_LIMITS.maxOctave },
  instrument: { min: MUSIC_LIMITS.minInstrument, max: MUSIC_LIMITS.maxInstrument }
};

export class InputValidationError extends Error {
  constructor(errors) {
    super('Invalid music input.');
    this.name = 'InputValidationError';
    this.errors = errors;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateIntegerOption(options, name, errors) {
  if (options[name] === undefined) return;

  const value = Number(options[name]);
  const limits = OPTION_LIMITS[name];

  if (!Number.isInteger(value)) {
    errors.push(`${name} must be an integer.`);
    return;
  }

  if (value < limits.min || value > limits.max) {
    errors.push(`${name} must be between ${limits.min} and ${limits.max}.`);
  }
}

export function validateInterpretRequest(body = {}) {
  const errors = [];
  const payload = isPlainObject(body) ? body : {};
  const text = payload.text ?? '';
  const options = payload.options ?? {};

  if (typeof text !== 'string') {
    errors.push('text must be a string.');
  } else if (text.length > TEXT_LIMITS.maxLength) {
    errors.push(`text must have at most ${TEXT_LIMITS.maxLength} characters.`);
  }

  if (!isPlainObject(options)) {
    errors.push('options must be an object.');
  } else {
    // These ranges mirror the current interface controls and General MIDI limits.
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
