import { fetchInstruments, fetchMidi, interpretText } from './apiClient.js';
import { AudioPlayer } from './audioPlayer.js';
import { downloadBlob, downloadText, readTextFile } from './fileService.js';
import { renderPiece } from './pieceRenderer.js';

const state = {
  lastPiece: null
};

const audioPlayer = new AudioPlayer();

const elements = {
  textInput: document.querySelector('#textInput'),
  charCount: document.querySelector('#charCount'),
  fileInput: document.querySelector('#fileInput'),
  saveTextButton: document.querySelector('#saveTextButton'),
  exampleButton: document.querySelector('#exampleButton'),
  bpmInput: document.querySelector('#bpmInput'),
  bpmValue: document.querySelector('#bpmValue'),
  volumeInput: document.querySelector('#volumeInput'),
  volumeValue: document.querySelector('#volumeValue'),
  octaveInput: document.querySelector('#octaveInput'),
  octaveValue: document.querySelector('#octaveValue'),
  instrumentInput: document.querySelector('#instrumentInput'),
  playButton: document.querySelector('#playButton'),
  stopButton: document.querySelector('#stopButton'),
  downloadMidiButton: document.querySelector('#downloadMidiButton'),
  summary: document.querySelector('#summary'),
  eventsOutput: document.querySelector('#eventsOutput')
};

function currentOptions() {
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

async function loadInstruments() {
  const instruments = await fetchInstruments();

  elements.instrumentInput.innerHTML = instruments
    .map((instrument) => `<option value="${instrument.program}">${instrument.name}</option>`)
    .join('');

  elements.instrumentInput.value = '24';
}

async function interpret() {
  state.lastPiece = await interpretText(elements.textInput.value, currentOptions());
  renderPiece(elements.summary, elements.eventsOutput, state.lastPiece);
  return state.lastPiece;
}

async function downloadMidi() {
  const blob = await fetchMidi(elements.textInput.value, currentOptions());
  downloadBlob(blob, 'gerador-musical.mid');
}

function saveText() {
  downloadText(elements.textInput.value, 'texto-musical.txt');
}

async function openTextFile(file) {
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

elements.playButton.addEventListener('click', async () => audioPlayer.play(await interpret()));
elements.stopButton.addEventListener('click', () => audioPlayer.stop());
elements.downloadMidiButton.addEventListener('click', downloadMidi);
elements.saveTextButton.addEventListener('click', saveText);
elements.exampleButton.addEventListener('click', setExample);
elements.fileInput.addEventListener('change', (event) => openTextFile(event.target.files[0]));
[elements.bpmInput, elements.volumeInput, elements.octaveInput, elements.textInput].forEach((element) => {
  element.addEventListener('input', updateLabels);
});

await loadInstruments();
updateLabels();
