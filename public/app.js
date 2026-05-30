const state = {
  audioContext: null,
  scheduledNodes: [],
  lastPiece: null
};

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
  const response = await fetch('/api/instruments');
  const instruments = await response.json();

  elements.instrumentInput.innerHTML = instruments
    .map((instrument) => `<option value="${instrument.program}">${instrument.name}</option>`)
    .join('');

  elements.instrumentInput.value = '24';
}

async function interpret() {
  const response = await fetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: elements.textInput.value, options: currentOptions() })
  });

  if (!response.ok) {
    throw new Error('Não foi possível interpretar o texto.');
  }

  state.lastPiece = await response.json();
  renderPiece(state.lastPiece);
  return state.lastPiece;
}

function renderPiece(piece) {
  elements.summary.textContent = `${piece.metadata.voiceCount} voz(es), ${piece.metadata.eventCount} evento(s), BPM inicial ${piece.metadata.initialBpm}.`;

  elements.eventsOutput.innerHTML = piece.voices.map((voice) => {
    const preview = voice.events.slice(0, 12).map((event) => {
      if (event.type === 'rest') return `<li>beat ${event.beat}: pausa</li>`;
      return `<li>beat ${event.beat}: ${event.note}${event.octave} | MIDI ${event.midi} | vol. ${event.volume}</li>`;
    }).join('');

    return `
      <article class="voice-block">
        <h3>Voz ${voice.index} · atraso ${voice.delayBeats} beat(s) · ${voice.finalInstrumentName}</h3>
        <ol class="event-list">${preview || '<li>Sem eventos</li>'}</ol>
      </article>
    `;
  }).join('');
}

function midiToFrequency(midi) {
  return 440 * (2 ** ((midi - 69) / 12));
}

function waveformForInstrument(program) {
  if ([6, 20, 19, 70, 71].includes(program)) return 'triangle';
  if ([22, 109, 110, 114].includes(program)) return 'square';
  if (program >= 24 && program <= 31) return 'sawtooth';
  return 'sine';
}

function schedulePiece(piece) {
  stopPlayback();
  state.audioContext = new AudioContext();
  const startAt = state.audioContext.currentTime + 0.08;

  for (const voice of piece.voices) {
    for (const event of voice.events) {
      if (event.type !== 'note') continue;

      const start = startAt + event.startSeconds;
      const duration = event.durationSeconds * 0.92;
      const oscillator = state.audioContext.createOscillator();
      const gain = state.audioContext.createGain();

      oscillator.type = waveformForInstrument(event.instrument);
      oscillator.frequency.value = midiToFrequency(event.midi);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.002, event.volume / 127 * 0.18), start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      oscillator.connect(gain).connect(state.audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.03);
      state.scheduledNodes.push(oscillator);
    }
  }
}

function stopPlayback() {
  for (const node of state.scheduledNodes) {
    try { node.stop(); } catch { /* node already stopped */ }
  }
  state.scheduledNodes = [];

  if (state.audioContext) {
    state.audioContext.close();
    state.audioContext = null;
  }
}

async function downloadMidi() {
  const response = await fetch('/api/midi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: elements.textInput.value, options: currentOptions() })
  });

  const blob = await response.blob();
  downloadBlob(blob, 'gerador-musical.mid');
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function saveText() {
  downloadBlob(new Blob([elements.textInput.value], { type: 'text/plain;charset=utf-8' }), 'texto-musical.txt');
}

async function openTextFile(file) {
  elements.textInput.value = await file.text();
  updateLabels();
}

function setExample() {
  elements.textInput.value = `[0] C D E F ,
[4] G A B C ,
[8] G A H C > D E F G`;
  updateLabels();
}

elements.playButton.addEventListener('click', async () => schedulePiece(await interpret()));
elements.stopButton.addEventListener('click', stopPlayback);
elements.downloadMidiButton.addEventListener('click', downloadMidi);
elements.saveTextButton.addEventListener('click', saveText);
elements.exampleButton.addEventListener('click', setExample);
elements.fileInput.addEventListener('change', (event) => openTextFile(event.target.files[0]));
[elements.bpmInput, elements.volumeInput, elements.octaveInput, elements.textInput].forEach((element) => {
  element.addEventListener('input', updateLabels);
});

await loadInstruments();
updateLabels();
