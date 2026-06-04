import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WebAudioSynth } from '../src/core/Synthesizer.js';
import { MusicEvent } from '../src/core/types.js';
import { INSTRUMENT_PRESETS } from '../src/core/MusicDefaults.js';

const MIDI_C4_FREQ_MIN = 261;
const MIDI_C4_FREQ_MAX = 262;

describe('WebAudioSynth', () => {
	it('cria e agenda os nós de áudio correspondentes', () => {
		const synth = new WebAudioSynth();

		const mockOscillator = {
			type: '',
			frequency: { value: 0 },
			connect() {
				return this;
			},
			start() {},
			stop() {}
		};

		const mockGainNode = {
			gain: {
				setValueAtTime() {},
				exponentialRampToValueAtTime() {}
			},
			connect() {}
		};

		const mockAudioContext = {
			createOscillator: () => mockOscillator,
			createGain: () => mockGainNode,
			destination: {}
		} as unknown as AudioContext;

		const event: MusicEvent = {
			type: 'note',
			voice: 0,
			beat: 0,
			duration: 1,
			startSeconds: 0.0,
			durationSeconds: 0.5,
			midi: 60,
			volume: 100,
			instrument: INSTRUMENT_PRESETS.harmonica
		};

		const result = synth.playNote(mockAudioContext, event, 0.0, 0.5);

		assert.equal(result, mockOscillator);
		assert.equal(mockOscillator.type, 'square');
		assert.ok(
			mockOscillator.frequency.value > MIDI_C4_FREQ_MIN &&
				mockOscillator.frequency.value < MIDI_C4_FREQ_MAX
		);
	});

	it('mapeia corretamente os instrumentos para as formas de onda triangle, sawtooth e sine', () => {
		const synth = new WebAudioSynth();

		const mockOscillator = {
			type: '',
			frequency: { value: 0 },
			connect() {
				return this;
			},
			start() {},
			stop() {}
		};

		const mockAudioContext = {
			createOscillator: () => mockOscillator,
			createGain: () => ({
				gain: {
					setValueAtTime() {},
					exponentialRampToValueAtTime() {}
				},
				connect() {}
			}),
			destination: {}
		} as unknown as AudioContext;

		const testWaveform = (instrument: number, expectedWave: string) => {
			const event: MusicEvent = {
				type: 'note',
				voice: 0,
				beat: 0,
				duration: 1,
				startSeconds: 0.0,
				durationSeconds: 0.5,
				midi: 60,
				volume: 100,
				instrument
			};
			synth.playNote(mockAudioContext, event, 0.0, 0.5);
			assert.equal(mockOscillator.type, expectedWave);
		};

		testWaveform(6, 'triangle');   // Harpsichord (triangle)
		testWaveform(24, 'sawtooth');  // Nylon Guitar (sawtooth)
		testWaveform(0, 'sine');       // Grand Piano (sine - default)
	});
});
