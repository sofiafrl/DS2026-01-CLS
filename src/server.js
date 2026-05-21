import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MusicInterpreter } from './core/MusicInterpreter.js';
import { MidiWriter } from './midi/MidiWriter.js';
import { GENERAL_MIDI_INSTRUMENTS } from './core/InstrumentCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
const interpreter = new MusicInterpreter();
const midiWriter = new MidiWriter();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/instruments', (_request, response) => {
  response.json(GENERAL_MIDI_INSTRUMENTS.map((name, program) => ({ program, name })));
});

app.post('/api/interpret', (request, response) => {
  const { text, options } = request.body ?? {};
  const piece = interpreter.interpret(text, options);
  response.json(piece);
});

app.post('/api/midi', (request, response) => {
  const { text, options } = request.body ?? {};
  const piece = interpreter.interpret(text, options);
  const midi = midiWriter.write(piece);

  response.setHeader('Content-Type', 'audio/midi');
  response.setHeader('Content-Disposition', 'attachment; filename="gerador-musical.mid"');
  response.send(midi);
});

app.listen(port, () => {
  console.log(`Gerador Musical rodando em http://localhost:${port}`);
});
