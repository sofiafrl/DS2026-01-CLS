import { getInstruments, generateMidi, interpretText } from './musicService.js';
import { AudioPlayer } from './AudioPlayer.js';
import { downloadBlob, downloadText, readTextFile } from './fileService.js';
import { renderPiece } from './pieceRenderer.js';
import { MusicPiece, PlaybackOptions } from './core/types.js';

interface AppState {
	lastPiece: MusicPiece | null;
}

const state: AppState = {
	lastPiece: null
};

const audioPlayer = new AudioPlayer();

const elements = {
	// Centraliza os elementos do DOM para evitar buscas repetidas no restante do arquivo.
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

function currentOptions(): PlaybackOptions {
	// Os valores da interface chegam como texto e sao convertidos para numero aqui.
	return {
		bpm: Number(elements.bpmInput.value),
		volume: Number(elements.volumeInput.value),
		octave: Number(elements.octaveInput.value),
		instrument: Number(elements.instrumentInput.value)
	};
}

function updateLabels() {
	elements.bpmValue.textContent = elements.bpmInput.value;
	elements.volumeValue.textContent = elements.volumeInput.value;
	elements.octaveValue.textContent = elements.octaveInput.value;
	elements.charCount.textContent = `${elements.textInput.value.length} caract.`;
}

function loadInstruments() {
	const instruments = getInstruments();

	elements.instrumentInput.innerHTML = instruments
		.map((instrument) => `<option value="${instrument.program}">${instrument.name}</option>`)
		.join('');

	elements.instrumentInput.value = '24';
}

function interpret(): MusicPiece {
	// Interpretar tambem atualiza o painel para manter audio e visualizacao sincronizados.
	state.lastPiece = interpretText(elements.textInput.value, currentOptions());
	renderPiece(elements.summary, elements.eventsOutput, state.lastPiece);
	return state.lastPiece;
}

function downloadMidi() {
	const blob = generateMidi(elements.textInput.value, currentOptions());
	downloadBlob(blob, 'gerador-musical.mid');
}

function saveText() {
	downloadText(elements.textInput.value, 'texto-musical.txt');
}

async function openTextFile(file: File) {
	if (!file) return;

	elements.textInput.value = await readTextFile(file);
	updateLabels();
}

function setExample() {
	elements.textInput.value = `[0] C D E F ,
[4] G A B C ,
[8] G A H C > D E F G`;
	updateLabels();
}

function playMusic() {
	if (audioPlayer.isCurrentlyPlaying()) return;

	if (audioPlayer.canResume()) {
		// Quando a musica esta pausada, play continua sem reinterpretar o texto.
		audioPlayer.play();
		return;
	}

	audioPlayer.play(interpret());
}

function restartMusic() {
	const piece = state.lastPiece ?? interpret();
	audioPlayer.restart(piece);
}

elements.playButton.addEventListener('click', playMusic);
elements.pauseButton.addEventListener('click', () => audioPlayer.pause());
elements.restartButton.addEventListener('click', restartMusic);
elements.downloadMidiButton.addEventListener('click', downloadMidi);
elements.saveTextButton.addEventListener('click', saveText);
elements.exampleButton.addEventListener('click', setExample);
elements.fileInput.addEventListener('change', (event) => {
	const target = event.target;
	if (target instanceof HTMLInputElement && target.files && target.files[0]) {
		openTextFile(target.files[0]);
	}
});
[elements.bpmInput, elements.volumeInput, elements.octaveInput, elements.textInput].forEach(
	(element) => {
		element.addEventListener('input', updateLabels);
	}
);

loadInstruments();
updateLabels();
