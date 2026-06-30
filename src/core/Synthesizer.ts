import { MusicEvent } from './types.js';

export interface Synthesizer {
	playNote(audioContext: AudioContext, event: MusicEvent, start: number, duration: number): OscillatorNode;
}

type WaveformType = 'triangle' | 'square' | 'sawtooth' | 'sine';

const INSTRUMENT_WAVEFORM = new Map<number, WaveformType>([
	[6, 'triangle'],
	[20, 'triangle'],
	[19, 'triangle'],
	[70, 'triangle'],
	[71, 'triangle'],
	[22, 'square'],
	[109, 'square'],
	[110, 'square'],
	[114, 'square'],
	[24, 'sawtooth'],
	[25, 'sawtooth'],
	[26, 'sawtooth'],
	[27, 'sawtooth'],
	[28, 'sawtooth'],
	[29, 'sawtooth'],
	[30, 'sawtooth'],
	[31, 'sawtooth']
]);

function waveformForInstrument(program: number): WaveformType {
	return INSTRUMENT_WAVEFORM.get(program) ?? 'sine';
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
