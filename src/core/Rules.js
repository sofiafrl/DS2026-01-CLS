import { MusicEvent } from './MusicEvent.js';

const NOTE_TO_SEMITONE = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  H: 10,
  B: 11
};

function toMidi(note, octave) {
  return 12 * (octave + 1) + NOTE_TO_SEMITONE[note];
}

function emitNote(context, note) {
  const event = new MusicEvent({
    type: 'note',
    voice: context.voiceIndex,
    beat: context.beat,
    duration: 1,
    note,
    octave: context.octave,
    midi: toMidi(note, context.octave),
    volume: context.volume,
    instrument: context.instrument,
    bpm: context.bpm
  });

  context.addEvent(event);
  context.lastNote = note;
  context.lastProcessedWasNote = true;
  context.advance();
}

function emitRest(context) {
  context.addEvent(new MusicEvent({
    type: 'rest',
    voice: context.voiceIndex,
    beat: context.beat,
    duration: 1,
    volume: context.volume,
    instrument: context.instrument,
    bpm: context.bpm
  }));
  context.lastProcessedWasNote = false;
  context.advance();
}

function repeatLastNoteOrRest(context) {
  if (context.lastProcessedWasNote && context.lastNote) {
    emitNote(context, context.lastNote);
    return;
  }

  emitRest(context);
}

export class NoteRule {
  matches(character, nextCharacter) {
    return Object.prototype.hasOwnProperty.call(NOTE_TO_SEMITONE, character) || (character === 'M' && nextCharacter === 'b');
  }

  apply(character, context) {
    if (character === 'M') {
      emitNote(context, 'E');
      const lastEvent = context.events.at(-1);
      lastEvent.note = 'Mb';
      lastEvent.midi -= 1;
      return 2;
    }

    emitNote(context, character);
    return 1;
  }
}

export class LowercaseRestRule {
  matches(character) {
    return /^[a-h]$/.test(character);
  }

  apply(_character, context) {
    emitRest(context);
    return 1;
  }
}

export class SpaceVolumeRule {
  matches(character) {
    return character === ' ';
  }

  apply(_character, context) {
    context.doubleVolume();
    return 1;
  }
}

export class HarmonicaRule {
  matches(character) {
    return character === '!';
  }

  apply(_character, context) {
    context.setInstrument(22);
    return 1;
  }
}

export class BagpipeVowelRule {
  matches(character) {
    return /^[OoIiUu]$/.test(character);
  }

  apply(_character, context) {
    context.setInstrument(109);
    return 1;
  }
}

export class EvenDigitRule {
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

export class OctaveUpRule {
  matches(character) {
    return character === '?' || character === '.';
  }

  apply(_character, context) {
    context.increaseOctave();
    return 1;
  }
}

export class OctaveDownRule {
  matches(character) {
    return character === 'V';
  }

  apply(_character, context) {
    context.decreaseOctave();
    return 1;
  }
}

export class TubularBellsRule {
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

export class ChurchOrganRule {
  matches(character) {
    return character === ',';
  }

  apply(_character, context) {
    context.setInstrument(19);
    return 1;
  }
}

export class BpmUpRule {
  matches(character) {
    return character === '>';
  }

  apply(_character, context) {
    context.increaseBpm();
    return 1;
  }
}

export class BpmDownRule {
  matches(character) {
    return character === '<';
  }

  apply(_character, context) {
    context.decreaseBpm();
    return 1;
  }
}

export class RepeatOrRestRule {
  matches() {
    return true;
  }

  apply(_character, context) {
    repeatLastNoteOrRest(context);
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
