import { MusicEvent, MusicPiece } from './core/types.js';
import { Synthesizer, WebAudioSynth } from './core/Synthesizer.js';

export class AudioPlayer {
	private audioContext: AudioContext | null = null;
	private scheduledNodes: OscillatorNode[] = [];
	private currentPiece: MusicPiece | null = null;
	private startedAt = 0;
	private pausedAtSeconds = 0;
	private isPlaying = false;
	private finishTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(private readonly synth: Synthesizer = new WebAudioSynth()) {}

	canResume(): boolean {
		// So e possivel continuar quando existe uma musica pausada em andamento.
		return Boolean(this.currentPiece && !this.isPlaying && this.pausedAtSeconds > 0);
	}

	isCurrentlyPlaying(): boolean {
		return this.isPlaying;
	}

	play(piece: MusicPiece | null = this.currentPiece) {
		if (!piece) return;

		if (piece !== this.currentPiece) {
			// Uma musica nova sempre comeca do zero, mesmo que outra estivesse pausada.
			this.pausedAtSeconds = 0;
		}

		this.currentPiece = piece;
		this.stopScheduledAudio();
		this.audioContext = new AudioContext();
		// Ajusta a origem do relogio para reutilizar a mesma linha do tempo ao continuar.
		this.startedAt = this.audioContext.currentTime + 0.08 - this.pausedAtSeconds;
		let lastAudibleSecond = this.pausedAtSeconds;

		for (const voice of piece.voices) {
			for (const event of voice.events) {
				if (event.type !== 'note') continue;
				const audibleEnd = this.scheduleNote(event);
				lastAudibleSecond = Math.max(lastAudibleSecond, audibleEnd);
			}
		}

		this.isPlaying = true;
		this.finishTimer = setTimeout(
			() => {
				// Ao terminar naturalmente, a proxima reproducao deve voltar ao inicio.
				this.isPlaying = false;
				this.pausedAtSeconds = 0;
				this.stopScheduledAudio();
			},
			Math.max(0, (lastAudibleSecond - this.pausedAtSeconds) * 1000 + 120)
		);
	}

	scheduleNote(event: MusicEvent): number {
		if (!this.audioContext) return 0;

		const audibleDuration = event.durationSeconds * 0.92;
		const audibleEnd = event.startSeconds + audibleDuration;

		// Eventos totalmente anteriores ao ponto pausado nao precisam ser reagendados.
		if (audibleEnd <= this.pausedAtSeconds) return 0;

		// O interpretador ja acumulou as mudancas de tempo em segundos absolutos.
		const start = Math.max(
			this.audioContext.currentTime + 0.01,
			this.startedAt + event.startSeconds
		);
		const duration = audibleEnd - Math.max(this.pausedAtSeconds, event.startSeconds);

		// Delega a criação e agendamento da onda sonora para o sintetizador
		const node = this.synth.playNote(this.audioContext, event, start, duration);
		this.scheduledNodes.push(node);

		return audibleEnd;
	}

	pause() {
		if (!this.isPlaying || !this.audioContext) return;

		// Guarda a posicao atual para que o botao play continue do mesmo ponto.
		this.pausedAtSeconds = Math.max(0, this.audioContext.currentTime - this.startedAt);
		this.isPlaying = false;
		this.stopScheduledAudio();
	}

	restart(piece: MusicPiece | null = this.currentPiece) {
		this.pausedAtSeconds = 0;
		this.currentPiece = piece;
		this.play(piece);
	}

	stop() {
		this.pausedAtSeconds = 0;
		this.currentPiece = null;
		this.isPlaying = false;
		this.stopScheduledAudio();
	}

	stopScheduledAudio() {
		if (this.finishTimer) {
			clearTimeout(this.finishTimer);
			this.finishTimer = null;
		}

		for (const node of this.scheduledNodes) {
			try {
				node.stop();
			} catch {
				/* nada para fazer, o node ja estava parado */
			}
		}
		this.scheduledNodes = [];

		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
	}
}
