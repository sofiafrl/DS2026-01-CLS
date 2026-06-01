import { TextParser } from './TextParser.js';
import { VoiceContext } from './VoiceContext.js';
import { DEFAULT_RULES } from './Rules.js';
import { getInstrumentName } from './InstrumentCatalog.js';
import { DEFAULT_MUSIC_OPTIONS } from './MusicDefaults.js';
import { assertTextRule } from './TextRule.js';

export class MusicInterpreter {
  constructor({ parser = new TextParser(), rules = DEFAULT_RULES } = {}) {
    this.parser = parser;
    // Validate rule objects once so the interpretation loop can stay focused
    // on orchestration and polymorphic dispatch.
    this.rules = rules.map(assertTextRule);
  }

  interpret(text, options = {}) {
    const initialBpm = Number(options.bpm) || DEFAULT_MUSIC_OPTIONS.bpm;
    const initialVolume = options.volume !== undefined ? Number(options.volume) : undefined;
    const initialInstrument = options.instrument !== undefined ? Number(options.instrument) : undefined;
    const initialOctave = options.octave !== undefined ? Number(options.octave) : undefined;

    const voices = this.parser.parse(text).map((line) => {
      const context = new VoiceContext({
        voiceIndex: line.index,
        delayBeats: line.delayBeats,
        initialBpm,
        initialVolume: line.index === 0 ? initialVolume : undefined,
        initialInstrument: line.index === 0 ? initialInstrument : undefined,
        initialOctave: line.index === 0 ? initialOctave : undefined
      });

      this.processLine(line.content, context);

      return {
        index: line.index,
        delayBeats: line.delayBeats,
        baseOctave: context.baseOctave,
        finalBpm: context.bpm,
        finalVolume: context.volume,
        finalInstrument: context.instrument,
        finalInstrumentName: getInstrumentName(context.instrument),
        events: context.events
      };
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

  processLine(line, context) {
    let cursor = 0;

    while (cursor < line.length) {
      const character = line[cursor];
      const nextCharacter = line[cursor + 1] ?? '';
      const rule = this.rules.find((candidate) => candidate.matches(character, nextCharacter, context));
      cursor += rule.apply(character, context, nextCharacter);
    }
  }
}
