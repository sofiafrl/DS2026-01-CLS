import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MusicInterpreter } from './core/MusicInterpreter.js';
import { MidiWriter } from './midi/MidiWriter.js';
import { GENERAL_MIDI_INSTRUMENTS } from './core/InstrumentCatalog.js';
import { InputValidationError, validateInterpretRequest } from './core/InputValidator.js';

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

function sendApiError(response, error) {
  if (error instanceof InputValidationError) {
    response.status(400).json({ errors: error.errors });
    return;
  }

  response.status(500).json({ error: 'Internal server error.' });
}

app.post('/api/interpret', (request, response) => {
  try {
    const { text, options } = validateInterpretRequest(request.body);
    const piece = interpreter.interpret(text, options);
    response.json(piece);
  } catch (error) {
    sendApiError(response, error);
  }
});

app.post('/api/midi', (request, response) => {
  try {
    const { text, options } = validateInterpretRequest(request.body);
    const piece = interpreter.interpret(text, options);
    const midi = midiWriter.write(piece);

    response.setHeader('Content-Type', 'audio/midi');
    response.setHeader('Content-Disposition', 'attachment; filename="gerador-musical.mid"');
    response.send(midi);
  } catch (error) {
    sendApiError(response, error);
  }
});

app.listen(port, () => {
  console.log(`Gerador Musical rodando em http://localhost:${port}`);
});
