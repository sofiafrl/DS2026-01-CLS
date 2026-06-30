import { MusicService } from './MusicService.js';
import { AudioPlayer } from './AudioPlayer.js';
import { downloadBlob, downloadText, readTextFile } from './fileService.js';
import { renderPiece } from './pieceRenderer.js';
import { MusicPiece, PlaybackOptions } from './core/types.js';

// Coordena a interface de usuário de forma orientada a objetos.
// Encapsula estado, elementos DOM, event listeners e lógica de interação.
// Recebe MusicService como dependência (inversão de dependências).
interface AppState {
	lastPiece: MusicPiece | null;
}

interface DOMElements {
	textInput: HTMLTextAreaElement;
	charCount: HTMLElement;
	fileInput: HTMLInputElement;
	saveTextButton: HTMLButtonElement;
	exampleButton: HTMLButtonElement;
	bpmInput: HTMLInputElement;
	bpmValue: HTMLElement;
	volumeInput: HTMLInputElement;
	volumeValue: HTMLElement;
	octaveInput: HTMLInputElement;
	octaveValue: HTMLElement;
	instrumentInput: HTMLSelectElement;
	playButton: HTMLButtonElement;
	pauseButton: HTMLButtonElement;
	restartButton: HTMLButtonElement;
	downloadMidiButton: HTMLButtonElement;
	summary: HTMLElement;
	eventsOutput: HTMLElement;
}

export class AppUI {
	private state: AppState = { lastPiece: null };
	private audioPlayer: AudioPlayer;
	private elements: DOMElements;

	constructor(private musicService: MusicService) {
		this.audioPlayer = new AudioPlayer();
		this.elements = this.queryElements();
	}

	initialize(): void {
		this.loadInstruments();
		this.updateLabels();
		this.registerEventListeners();
	}

	private queryElements(): DOMElements {
		return {
			textInput: document.querySelector<HTMLTextAreaElement>('#textInput')!,
			charCount: document.querySelector<HTMLElement>('#charCount')!,
			fileInput: document.querySelector<HTMLInputElement>('#fileInput')!,
			saveTextButton: document.querySelector<HTMLButtonElement>('#saveTextButton')!,
			exampleButton: document.querySelector<HTMLButtonElement>('#exampleButton')!,
			bpmInput: document.querySelector<HTMLInputElement>('#bpmInput')!,
			bpmValue: document.querySelector<HTMLElement>('#bpmValue')!,
			volumeInput: document.querySelector<HTMLInputElement>('#volumeInput')!,
			volumeValue: document.querySelector<HTMLElement>('#volumeValue')!,
			octaveInput: document.querySelector<HTMLInputElement>('#octaveInput')!,
			octaveValue: document.querySelector<HTMLElement>('#octaveValue')!,
			instrumentInput: document.querySelector<HTMLSelectElement>('#instrumentInput')!,
			playButton: document.querySelector<HTMLButtonElement>('#playButton')!,
			pauseButton: document.querySelector<HTMLButtonElement>('#pauseButton')!,
			restartButton: document.querySelector<HTMLButtonElement>('#restartButton')!,
			downloadMidiButton: document.querySelector<HTMLButtonElement>('#downloadMidiButton')!,
			summary: document.querySelector<HTMLElement>('#summary')!,
			eventsOutput: document.querySelector<HTMLElement>('#eventsOutput')!
		};
	}

	private currentOptions(): PlaybackOptions {
		return {
			bpm: Number(this.elements.bpmInput.value),
			volume: Number(this.elements.volumeInput.value),
			octave: Number(this.elements.octaveInput.value),
			instrument: Number(this.elements.instrumentInput.value)
		};
	}

	private updateLabels(): void {
		this.elements.bpmValue.textContent = this.elements.bpmInput.value;
		this.elements.volumeValue.textContent = this.elements.volumeInput.value;
		this.elements.octaveValue.textContent = this.elements.octaveInput.value;
		this.elements.charCount.textContent = `${this.elements.textInput.value.length} caract.`;
	}

	private loadInstruments(): void {
		const instruments = this.musicService.getInstruments();
		this.elements.instrumentInput.innerHTML = instruments
			.map((instrument) => `<option value="${instrument.program}">${instrument.name}</option>`)
			.join('');
		this.elements.instrumentInput.value = '24';
	}

	private interpret(): MusicPiece {
		this.state.lastPiece = this.musicService.interpretText(
			this.elements.textInput.value,
			this.currentOptions()
		);
		renderPiece(this.elements.summary, this.elements.eventsOutput, this.state.lastPiece);
		return this.state.lastPiece;
	}

	private downloadMidi(): void {
		const blob = this.musicService.generateMidi(
			this.elements.textInput.value,
			this.currentOptions()
		);
		downloadBlob(blob, 'gerador-musical.mid');
	}

	private saveText(): void {
		downloadText(this.elements.textInput.value, 'texto-musical.txt');
	}

	private setExample(): void {
		this.elements.textInput.value = `[0] C D E F ,
[4] G A B C ,
[8] G A H C > D E F G`;
		this.updateLabels();
	}

	private playMusic(): void {
		if (this.audioPlayer.isCurrentlyPlaying()) return;

		if (this.audioPlayer.canResume()) {
			this.audioPlayer.play();
			return;
		}

		this.audioPlayer.play(this.interpret());
	}

	private restartMusic(): void {
		const piece = this.state.lastPiece ?? this.interpret();
		this.audioPlayer.restart(piece);
	}

	private openTextFile = async (file: File): Promise<void> => {
		if (!file) return;
		this.elements.textInput.value = await readTextFile(file);
		this.updateLabels();
	};

	private registerEventListeners(): void {
		this.elements.playButton.addEventListener('click', () => this.playMusic());
		this.elements.pauseButton.addEventListener('click', () => this.audioPlayer.pause());
		this.elements.restartButton.addEventListener('click', () => this.restartMusic());
		this.elements.downloadMidiButton.addEventListener('click', () => this.downloadMidi());
		this.elements.saveTextButton.addEventListener('click', () => this.saveText());
		this.elements.exampleButton.addEventListener('click', () => this.setExample());

		this.elements.fileInput.addEventListener('change', (event) => {
			const target = event.target;
			if (target instanceof HTMLInputElement && target.files && target.files[0]) {
				this.openTextFile(target.files[0]);
			}
		});

		[this.elements.bpmInput, this.elements.volumeInput, this.elements.octaveInput, this.elements.textInput].forEach(
			(element) => {
				element.addEventListener('input', () => this.updateLabels());
			}
		);
	}
}
