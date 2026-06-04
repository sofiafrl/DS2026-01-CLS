import { MusicEvent } from './types.js';

export interface Synthesizer {
	playNote(audioContext: AudioContext, event: MusicEvent, start: number, duration: number): OscillatorNode;
}

const WAVEFORM_INSTRUMENTS = {
	triangle: [6, 20, 19, 70, 71], // Harpsichord, organs and woodwinds.
	square: [22, 109, 110, 114], // Accordion, bagpipe, kalimba and tinkle bell.
	sawtooth: [24, 25, 26, 27, 28, 29, 30, 31] // Guitars.
};

function waveformForInstrument(program: number): 'triangle' | 'square' | 'sawtooth' | 'sine' {
	if (WAVEFORM_INSTRUMENTS.triangle.includes(program)) return 'triangle';
	if (WAVEFORM_INSTRUMENTS.square.includes(program)) return 'square';
	if (WAVEFORM_INSTRUMENTS.sawtooth.includes(program)) return 'sawtooth';
	return 'sine';
}

function midiToFrequency(midi: number): number {
	return 440 * 2 ** ((midi - 69) / 12);
}

export class WebAudioSynth implements Synthesizer {
	playNote(
		audioContext: AudioContext,
		event: MusicEvent,
		start: number,
		duration: number
	): OscillatorNode {
		const oscillator = audioContext.createOscillator();
		const gain = audioContext.createGain();
		const attackEnd = start + Math.min(0.02, duration * 0.5);

		oscillator.type = waveformForInstrument(event.instrument ?? 0);
		oscillator.frequency.value = midiToFrequency(event.midi ?? 60);

		gain.gain.setValueAtTime(0.0001, start);
		gain.gain.exponentialRampToValueAtTime(
			Math.max(0.002, ((event.volume ?? 100) / 127) * 0.18),
			attackEnd
		);
		gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

		oscillator.connect(gain).connect(audioContext.destination);
		oscillator.start(start);
		oscillator.stop(start + duration + 0.03);

		return oscillator;
	}
}
