import { DEFAULT_EVENT_EMITTER, hasNote } from './MusicEventEmitter.js';
import { TextRule } from './TextRule.js';

export class NoteRule extends TextRule {
  constructor(eventEmitter = DEFAULT_EVENT_EMITTER) {
    super();
    this.eventEmitter = eventEmitter;
  }

  matches(character, nextCharacter) {
    return hasNote(character) || (character === 'M' && nextCharacter === 'b');
  }

  apply(character, context) {
    if (character === 'M') {
      this.eventEmitter.emitFlatMi(context);
      return 2;
    }

    this.eventEmitter.emitNote(context, character);
    return 1;
  }
}

export class LowercaseRestRule extends TextRule {
  constructor(eventEmitter = DEFAULT_EVENT_EMITTER) {
    super();
    this.eventEmitter = eventEmitter;
  }

  matches(character) {
    return /^[a-h]$/.test(character);
  }

  apply(_character, context) {
    this.eventEmitter.emitRest(context);
    return 1;
  }
}

export class SpaceVolumeRule extends TextRule {
  matches(character) {
    return character === ' ';
  }

  apply(_character, context) {
    context.doubleVolume();
    return 1;
  }
}

export class HarmonicaRule extends TextRule {
  matches(character) {
    return character === '!';
  }

  apply(_character, context) {
    context.setInstrument(22);
    return 1;
  }
}

export class BagpipeVowelRule extends TextRule {
  matches(character) {
    return /^[OoIiUu]$/.test(character);
  }

  apply(_character, context) {
    context.setInstrument(109);
    return 1;
  }
}

export class EvenDigitRule extends TextRule {
  matches(character) {
    return /^[02468]$/.test(character); 
    //dígito par: trocar instrumento para o instrumento General MIDI 
    //cujo numero é igual ao valor do instrumento atual + valor do dígito
  }

  apply(character, context) {
    context.setInstrument(context.instrument + Number(character));
    return 1;
  }
}

export class OctaveUpRule extends TextRule {
  matches(character) {
    return character === '?' || character === '.';
  }

  apply(_character, context) {
    context.increaseOctave();
    return 1;
  }
}

export class OctaveDownRule extends TextRule {
  matches(character) {
    return character === 'V';
  }

  apply(_character, context) {
    context.decreaseOctave();
    return 1;
  }
}

export class TubularBellsRule extends TextRule {
  matches(character) {
    return character === ';' || /^[13579]$/.test(character);
    //caractere ; ou dígito ímpar: 
    //trocar instrumento para General MIDI #15, Tubular Bells
  }

  apply(_character, context) {
    context.setInstrument(14);
    return 1;
  }
}

export class ChurchOrganRule extends TextRule {
  matches(character) {
    return character === ',';
  }

  apply(_character, context) {
    context.setInstrument(19);
    return 1;
  }
}

export class BpmUpRule extends TextRule {
  matches(character) {
    return character === '>';
  }

  apply(_character, context) {
    context.increaseBpm();
    return 1;
  }
}

export class BpmDownRule extends TextRule {
  matches(character) {
    return character === '<';
  }

  apply(_character, context) {
    context.decreaseBpm();
    return 1;
  }
}

export class RepeatOrRestRule extends TextRule {
  constructor(eventEmitter = DEFAULT_EVENT_EMITTER) {
    super();
    this.eventEmitter = eventEmitter;
  }

  matches() {
    return true;
  }

  apply(_character, context) {
    this.eventEmitter.repeatLastNoteOrRest(context);
    return 1;
  }
}

export const DEFAULT_RULES = [
  new NoteRule(),
  new LowercaseRestRule(),
  new SpaceVolumeRule(),
  new HarmonicaRule(),
  new BagpipeVowelRule(),
  new EvenDigitRule(),
  new OctaveUpRule(),
  new OctaveDownRule(),
  new TubularBellsRule(),
  new ChurchOrganRule(),
  new BpmUpRule(),
  new BpmDownRule(),
  new RepeatOrRestRule()
];
