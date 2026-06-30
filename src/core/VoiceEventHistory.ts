import { MusicEvent } from './types.js';

// Gerencia o armazenamento e manipulacao de eventos musicais de uma voz.
// Separado de VoiceContext para aplicar o SRP.
export class VoiceEventHistory {
	private events: MusicEvent[] = [];

	addEvent(event: MusicEvent): void {
		this.events.push(event);
	}

	getEvents(): MusicEvent[] {
		return this.events;
	}

	clear(): void {
		this.events = [];
	}

	getEventCount(): number {
		return this.events.length;
	}
}
