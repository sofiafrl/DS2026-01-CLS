import { MusicEvent, MusicPiece } from './core/types.js';

function midiToFrequency(midi: number): number {
	return 440 * 2 ** ((midi - 69) / 12);
}

const WAVEFORM_INSTRUMENTS = {
	triangle: [6, 20, 19, 70, 71], // Harpsichord, organs, woodwinds
	square: [22, 109, 110, 114],   // Accordion, bagpipe, kalimba, tinkle bell
	sawtooth: [24, 25, 26, 27, 28, 29, 30, 31] // Guitars
};

function waveformForInstrument(program: number): 'triangle' | 'square' | 'sawtooth' | 'sine' {
	if (WAVEFORM_INSTRUMENTS.triangle.includes(program)) return 'triangle';
	if (WAVEFORM_INSTRUMENTS.square.includes(program)) return 'square';
	if (WAVEFORM_INSTRUMENTS.sawtooth.includes(program)) return 'sawtooth';
	return 'sine';
}

export class AudioPlayer {
	private audioContext: AudioContext | null = null;
	private scheduledNodes: OscillatorNode[] = [];
	private currentPiece: MusicPiece | null = null;
	private startedAt = 0;
	private pausedAtSeconds = 0;
	private isPlaying = false;
	private finishTimer: ReturnType<typeof setTimeout> | null = null;

	canResume(): boolean {
		return Boolean(this.currentPiece && !this.isPlaying && this.pausedAtSeconds > 0);
	}

	isCurrentlyPlaying(): boolean {
		return this.isPlaying;
	}

	play(piece: MusicPiece | null = this.currentPiece) {
		if (!piece) return;

		if (piece !== this.currentPiece) {
			this.pausedAtSeconds = 0;
		}

		this.currentPiece = piece;
		this.stopScheduledAudio();
		this.audioContext = new AudioContext();
		this.startedAt = this.audioContext.currentTime + 0.08 - this.pausedAtSeconds;
		let lastAudibleSecond = this.pausedAtSeconds;

		for (const voice of piece.voices) {
			for (const event of voice.events) {
				if (event.type !== 'note') continue;
				const audibleEnd = this.scheduleNote(event);
				lastAudibleSecond = Math.max(lastAudibleSecond, audibleEnd);
			}
		}

		this.isPlaying = true;
		this.finishTimer = setTimeout(
			() => {
				this.isPlaying = false;
				this.pausedAtSeconds = 0;
				this.stopScheduledAudio();
			},
			Math.max(0, (lastAudibleSecond - this.pausedAtSeconds) * 1000 + 120)
		);
	}

	scheduleNote(event: MusicEvent): number {
		if (!this.audioContext) return 0;

		const audibleDuration = event.durationSeconds * 0.92;
		const audibleEnd = event.startSeconds + audibleDuration;

		if (audibleEnd <= this.pausedAtSeconds) return 0;

		// The core interpreter already accumulated tempo changes into seconds.
		const start = Math.max(
			this.audioContext.currentTime + 0.01,
			this.startedAt + event.startSeconds
		);
		const duration = audibleEnd - Math.max(this.pausedAtSeconds, event.startSeconds);
		const oscillator = this.audioContext.createOscillator();
		const gain = this.audioContext.createGain();
		const attackEnd = start + Math.min(0.02, duration * 0.5);

		oscillator.type = waveformForInstrument(event.instrument!);
		oscillator.frequency.value = midiToFrequency(event.midi!);
		gain.gain.setValueAtTime(0.0001, start);
		gain.gain.exponentialRampToValueAtTime(Math.max(0.002, (event.volume! / 127) * 0.18), attackEnd);
		gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

		oscillator.connect(gain).connect(this.audioContext.destination);
		oscillator.start(start);
		oscillator.stop(start + duration + 0.03);
		this.scheduledNodes.push(oscillator);

		return audibleEnd;
	}

	pause() {
		if (!this.isPlaying || !this.audioContext) return;

		this.pausedAtSeconds = Math.max(0, this.audioContext.currentTime - this.startedAt);
		this.isPlaying = false;
		this.stopScheduledAudio();
	}

	restart(piece: MusicPiece | null = this.currentPiece) {
		this.pausedAtSeconds = 0;
		this.currentPiece = piece;
		this.play(piece);
	}

	stop() {
		this.pausedAtSeconds = 0;
		this.currentPiece = null;
		this.isPlaying = false;
		this.stopScheduledAudio();
	}

	stopScheduledAudio() {
		if (this.finishTimer) {
			clearTimeout(this.finishTimer);
			this.finishTimer = null;
		}

		for (const node of this.scheduledNodes) {
			try {
				node.stop();
			} catch {
				/* node already stopped */
			}
		}
		this.scheduledNodes = [];

		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
	}
}
