export interface MusicEvent {
	type: 'note' | 'rest';
	voice: number;
	beat: number;
	duration: number;
	startSeconds: number;
	durationSeconds: number;
	note?: string | null;
	octave?: number | null;
	midi?: number | null;
	volume?: number;
	instrument?: number;
	bpm?: number;
}

export interface VoiceProfile {
	baseOctave: number;
	baseVolume: number;
	baseInstrument: number;
}

export interface PlaybackOptions {
	bpm?: number;
	volume?: number;
	octave?: number;
	instrument?: number;
}

export interface MusicVoice {
	index: number;
	delayBeats: number;
	baseOctave: number;
	finalBpm: number;
	finalVolume: number;
	finalInstrument: number;
	finalInstrumentName: string;
	events: MusicEvent[];
}

export interface MusicPiece {
	metadata: {
		generatedAt: string;
		initialBpm: number;
		voiceCount: number;
		eventCount: number;
	};
	voices: MusicVoice[];
}

export interface ParseLineResult {
	index: number;
	delayBeats: number;
	content: string;
}
