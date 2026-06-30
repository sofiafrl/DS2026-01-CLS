import { TextParser } from './TextParser.js';
import { VoiceContext } from './VoiceContext.js';
import { DEFAULT_RULES } from './Rules.js';
import { DEFAULT_MUSIC_OPTIONS } from './MusicDefaults.js';
import { assertTextRule, TextRule } from './TextRule.js';
import { MusicPiece, MusicVoice, PlaybackOptions } from './types.js';

export class MusicInterpreter {
	private parser: TextParser;
	private rules: TextRule[];

	constructor({
		parser = new TextParser(),
		rules = DEFAULT_RULES
	}: { parser?: TextParser; rules?: TextRule[] } = {}) {
		this.parser = parser;
		// Valida as regras uma unica vez para o loop de interpretacao ficar focado
		// em orquestrar a leitura do texto e chamar o polimorfismo de cada regra.
		this.rules = rules.map(assertTextRule);
	}

	interpret(text: string, options: PlaybackOptions = {}): MusicPiece {
		const initialBpm = options.bpm ?? DEFAULT_MUSIC_OPTIONS.bpm;

		const voices: MusicVoice[] = this.parser.parse(text).map((line) => {
			// Cada linha vira uma voz independente, com seu proprio estado musical.
			const context = new VoiceContext({
				voiceIndex: line.index,
				delayBeats: line.delayBeats,
				initialBpm,
				initialVolume: line.index === 0 ? options.volume : undefined,
				initialInstrument: line.index === 0 ? options.instrument : undefined,
				initialOctave: line.index === 0 ? options.octave : undefined
			});

			this.processLine(line.content, context);

			return context.toMusicVoice();
		});

		return {
			metadata: {
				generatedAt: new Date().toISOString(),
				initialBpm,
				voiceCount: voices.length,
				eventCount: voices.flatMap((voice) => voice.events).length
			},
			voices
		};
	}

	processLine(line: string, context: VoiceContext) {
		let cursor = 0;

		while (cursor < line.length) {
			const character = line[cursor];
			const nextCharacter = line[cursor + 1] ?? '';
			// A primeira regra compativel consome um ou mais caracteres do texto.
			const rule = this.rules.find((candidate) =>
				candidate.matches(character, nextCharacter, context)
			);
			cursor += rule!.apply(character, context, nextCharacter);
		}
	}
}
