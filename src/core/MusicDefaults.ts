import { VoiceProfile } from './types.js';

export const MUSIC_LIMITS = {
	minBpm: 20,
	maxVolume: 127,
	minInstrument: 0,
	maxInstrument: 127,
	minOctave: 0,
	maxOctave: 9
};

export const DEFAULT_MUSIC_OPTIONS = {
	bpm: 120
};

const VOICE_PROFILES: VoiceProfile[] = [
	// As vozes usam perfis diferentes para criar a sensacao de fuga/polifonia.
	{ baseOctave: 6, baseVolume: 100, baseInstrument: 6 },
	{ baseOctave: 5, baseVolume: 80, baseInstrument: 20 },
	{ baseOctave: 4, baseVolume: 60, baseInstrument: 0 },
	{ baseOctave: 3, baseVolume: 40, baseInstrument: 70 }
];

export function getVoiceProfile(voiceIndex: number): VoiceProfile {
	// Quando existem mais vozes que perfis, o resto da divisao reinicia o ciclo.
	return VOICE_PROFILES[voiceIndex % VOICE_PROFILES.length];
}

export function clampVolume(volume: number): number {
	return Math.min(MUSIC_LIMITS.maxVolume, Number(volume));
}

export function clampInstrument(program: number): number {
	return Math.max(
		MUSIC_LIMITS.minInstrument,
		Math.min(MUSIC_LIMITS.maxInstrument, Number(program))
	);
}
