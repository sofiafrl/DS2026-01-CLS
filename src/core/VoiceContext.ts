import { clampInstrument, clampVolume, getVoiceProfile, MUSIC_LIMITS } from './MusicDefaults.js';
import { MusicEvent } from './types.js';

export class VoiceContext {
	public voiceIndex: number;
	public beat: number;
	public timeSeconds: number;
	public bpm: number;
	public baseOctave: number;
	public octave: number;
	public volume: number;
	public instrument: number;
	public lastNote: string | null;
	public lastProcessedWasNote: boolean;
	public events: MusicEvent[];

	constructor({
		voiceIndex,
		delayBeats = 0,
		initialBpm = 120,
		initialVolume,
		initialInstrument,
		initialOctave
	}: {
		voiceIndex: number;
		delayBeats?: number;
		initialBpm?: number;
		initialVolume?: number;
		initialInstrument?: number;
		initialOctave?: number;
	}) {
		const profile = getVoiceProfile(voiceIndex);

		this.voiceIndex = voiceIndex;
		this.beat = delayBeats;
		// Initial delay is measured with the initial BPM before any local tempo command is processed.
		this.timeSeconds = delayBeats * (60 / initialBpm);
		this.bpm = initialBpm;
		this.baseOctave = initialOctave ?? profile.baseOctave;
		this.octave = this.baseOctave;
		// Interface options currently override only the first voice.
		// Other voices keep their Phase 2 fugue profiles.
		this.volume = initialVolume ?? profile.baseVolume;
		this.instrument = initialInstrument ?? profile.baseInstrument;
		this.lastNote = null;
		this.lastProcessedWasNote = false;
		this.events = [];
	}

	addEvent(event: MusicEvent) {
		this.events.push(event);
	}

	advance(duration: number = 1) {
		this.timeSeconds += this.durationSeconds(duration);
		this.beat += duration;
	}

	durationSeconds(duration: number = 1): number {
		return duration * (60 / this.bpm);
	}

	setInstrument(program: number) {
		this.instrument = clampInstrument(program);
	}

	doubleVolume() {
		this.volume = clampVolume(this.volume * 2);
	}

	increaseOctave() {
		this.octave = this.octave < MUSIC_LIMITS.maxOctave ? this.octave + 1 : this.baseOctave;
	}

	decreaseOctave() {
		this.octave = this.octave > MUSIC_LIMITS.minOctave ? this.octave - 1 : this.baseOctave;
	}

	increaseBpm() {
		this.bpm += 10;
	}

	decreaseBpm() {
		this.bpm = Math.max(MUSIC_LIMITS.minBpm, this.bpm - 10);
	}
}
