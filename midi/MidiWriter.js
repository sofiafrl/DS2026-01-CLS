function writeVarLength(value) {
  let buffer = value & 0x7f;
  const bytes = [];

  while ((value >>= 7)) {
    buffer <<= 8;
    buffer |= ((value & 0x7f) | 0x80);
  }

  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) buffer >>= 8;
    else break;
  }

  return bytes;
}

function intToBytes(value, length) {
  return Array.from({ length }, (_, index) => (value >> (8 * (length - index - 1))) & 0xff);
}

function textToBytes(text) {
  return Array.from(new TextEncoder().encode(text));
}

function createChunk(name, data) {
  return new Uint8Array([...textToBytes(name), ...intToBytes(data.length, 4), ...data]);
}

function secondsToTicks(seconds, ticksPerQuarter = 480, bpm = 120) {
  const secondsPerBeat = 60 / bpm;
  return Math.round((seconds / secondsPerBeat) * ticksPerQuarter);
}

function eventToMidiMessages(event, channel, ticksPerQuarter) {
  // The interpreter already accumulates tempo changes into absolute seconds.
  // MIDI conversion only maps that shared timeline to ticks.
  const startSeconds = event.startSeconds;
  const durationSeconds = event.durationSeconds;
  const startTick = secondsToTicks(startSeconds, ticksPerQuarter, 120);
  const endTick = secondsToTicks(startSeconds + durationSeconds, ticksPerQuarter, 120);

  if (event.type !== 'note') return [];

  return [
    { tick: startTick, bytes: [0xc0 | channel, event.instrument] },
    { tick: startTick, bytes: [0x90 | channel, event.midi, Math.max(1, Math.min(127, Math.round(event.volume)))] },
    { tick: endTick, bytes: [0x80 | channel, event.midi, 0] }
  ];
}

export class MidiWriter {
  constructor({ ticksPerQuarter = 480 } = {}) {
    this.ticksPerQuarter = ticksPerQuarter;
  }

  write(piece) {
    const header = createChunk('MThd', [
      ...intToBytes(0, 2),
      ...intToBytes(1, 2),
      ...intToBytes(this.ticksPerQuarter, 2)
    ]);

    const events = [];
    events.push({ tick: 0, bytes: [0xff, 0x51, 0x03, 0x07, 0xa1, 0x20] });
    events.push({ tick: 0, bytes: [0xff, 0x03, ...writeVarLength(28), ...textToBytes('Gerador Musical por Texto')] });

    for (const voice of piece.voices) {
      const channel = voice.index % 16;
      for (const event of voice.events) {
        events.push(...eventToMidiMessages(event, channel, this.ticksPerQuarter));
      }
    }

    events.sort((a, b) => a.tick - b.tick);

    let previousTick = 0;
    const trackData = [];

    for (const event of events) {
      const delta = Math.max(0, event.tick - previousTick);
      trackData.push(...writeVarLength(delta), ...event.bytes);
      previousTick = event.tick;
    }

    trackData.push(0x00, 0xff, 0x2f, 0x00);
    const track = createChunk('MTrk', trackData);

    const result = new Uint8Array(header.length + track.length);
    result.set(header);
    result.set(track, header.length);
    return result;
  }
}
