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

const AUDIO_CONFIG = {
	REFERENCE_FREQUENCY: 440,
	REFERENCE_MIDI_NOTE: 69,
	SEMITONES_PER_OCTAVE: 12,
	ATTACK_MAX_DURATION: 0.02,
	ATTACK_DURATION_RATIO: 0.5,
	GAIN_INITIAL: 0.0001,
	GAIN_MIN: 0.002,
	GAIN_SCALE: 0.18,
	MIDI_MAX_VOLUME: 127,
	RELEASE_DURATION: 0.03
};

function midiToFrequency(midi: number): number {
	return (
		AUDIO_CONFIG.REFERENCE_FREQUENCY *
		2 ** ((midi - AUDIO_CONFIG.REFERENCE_MIDI_NOTE) / AUDIO_CONFIG.SEMITONES_PER_OCTAVE)
	);
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
		const attackEnd = start + Math.min(AUDIO_CONFIG.ATTACK_MAX_DURATION, duration * AUDIO_CONFIG.ATTACK_DURATION_RATIO);
		const peakGain = Math.max(AUDIO_CONFIG.GAIN_MIN, ((event.volume ?? 100) / AUDIO_CONFIG.MIDI_MAX_VOLUME) * AUDIO_CONFIG.GAIN_SCALE);

		oscillator.type = waveformForInstrument(event.instrument ?? 0);
		oscillator.frequency.value = midiToFrequency(event.midi ?? 60);

		gain.gain.setValueAtTime(AUDIO_CONFIG.GAIN_INITIAL, start);
		gain.gain.exponentialRampToValueAtTime(peakGain, attackEnd);
		gain.gain.exponentialRampToValueAtTime(AUDIO_CONFIG.GAIN_INITIAL, start + duration);

		oscillator.connect(gain).connect(audioContext.destination);
		oscillator.start(start);
		oscillator.stop(start + duration + AUDIO_CONFIG.RELEASE_DURATION);

		return oscillator;
	}
}
