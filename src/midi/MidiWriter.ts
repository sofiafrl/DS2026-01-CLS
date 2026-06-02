import { MusicEvent, MusicPiece } from '../core/types.js';

function writeVarLength(value: number): number[] {
	// O formato MIDI usa inteiros de tamanho variavel para economizar bytes nos deltas.
	let buffer = value & 0x7f;
	const bytes: number[] = [];

	while ((value >>= 7)) {
		buffer <<= 8;
		buffer |= (value & 0x7f) | 0x80;
	}

	while (true) {
		bytes.push(buffer & 0xff);
		if (buffer & 0x80) buffer >>= 8;
		else break;
	}

	return bytes;
}

function intToBytes(value: number, length: number): number[] {
	return Array.from({ length }, (_, index) => (value >> (8 * (length - index - 1))) & 0xff);
}

function textToBytes(text: string): number[] {
	return Array.from(new TextEncoder().encode(text));
}

function createChunk(name: string, data: number[]): Uint8Array {
	// Todo bloco MIDI tem identificador de 4 letras, tamanho e conteudo.
	return new Uint8Array([...textToBytes(name), ...intToBytes(data.length, 4), ...data]);
}

function secondsToTicks(seconds: number, ticksPerQuarter = 480, bpm = 120): number {
	const secondsPerBeat = 60 / bpm;
	return Math.round((seconds / secondsPerBeat) * ticksPerQuarter);
}

interface MidiMessage {
	tick: number;
	bytes: number[];
}

function eventToMidiMessages(
	event: MusicEvent,
	channel: number,
	ticksPerQuarter: number
): MidiMessage[] {
	// O interpretador ja acumula as mudancas de BPM em segundos absolutos.
	// A conversao MIDI apenas transforma essa linha do tempo comum em ticks.
	const startSeconds = event.startSeconds;
	const durationSeconds = event.durationSeconds;
	const startTick = secondsToTicks(startSeconds, ticksPerQuarter, 120);
	const endTick = secondsToTicks(startSeconds + durationSeconds, ticksPerQuarter, 120);

	if (event.type !== 'note') return [];

	return [
		{ tick: startTick, bytes: [0xc0 | channel, event.instrument!] },
		{
			tick: startTick,
			bytes: [0x90 | channel, event.midi!, Math.max(1, Math.min(127, Math.round(event.volume!)))]
		},
		{ tick: endTick, bytes: [0x80 | channel, event.midi!, 0] }
	];
}

export class MidiWriter {
	private ticksPerQuarter: number;

	constructor({ ticksPerQuarter = 480 } = {}) {
		this.ticksPerQuarter = ticksPerQuarter;
	}

	write(piece: MusicPiece): Uint8Array {
		const header = createChunk('MThd', [
			...intToBytes(0, 2),
			...intToBytes(1, 2),
			...intToBytes(this.ticksPerQuarter, 2)
		]);

		const events: MidiMessage[] = [];
		// Define o tempo padrao do arquivo MIDI e o nome da trilha.
		events.push({ tick: 0, bytes: [0xff, 0x51, 0x03, 0x07, 0xa1, 0x20] });
		events.push({
			tick: 0,
			bytes: [0xff, 0x03, ...writeVarLength(28), ...textToBytes('Gerador Musical por Texto')]
		});

		for (const voice of piece.voices) {
			// Cada voz usa um canal MIDI, reaproveitando canais quando passa de 16 vozes.
			const channel = voice.index % 16;
			for (const event of voice.events) {
				events.push(...eventToMidiMessages(event, channel, this.ticksPerQuarter));
			}
		}

		events.sort((a, b) => a.tick - b.tick);

		let previousTick = 0;
		const trackData: number[] = [];

		for (const event of events) {
			// MIDI armazena o intervalo desde o evento anterior, nao o tempo absoluto.
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
