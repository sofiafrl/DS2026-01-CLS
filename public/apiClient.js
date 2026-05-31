export async function fetchInstruments() {
  const response = await fetch('/api/instruments');
  return response.json();
}

export async function interpretText(text, options) {
  const response = await fetch('/api/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, options })
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel interpretar o texto.');
  }

  return response.json();
}

export async function fetchMidi(text, options) {
  const response = await fetch('/api/midi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, options })
  });

  return response.blob();
}
