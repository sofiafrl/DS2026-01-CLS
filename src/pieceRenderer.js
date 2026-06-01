export function renderPiece(summaryElement, eventsOutputElement, piece) {
	summaryElement.textContent = `${piece.metadata.voiceCount} voz(es), ${piece.metadata.eventCount} evento(s), BPM inicial ${piece.metadata.initialBpm}.`;

	eventsOutputElement.innerHTML = piece.voices
		.map((voice) => {
			const preview = voice.events
				.slice(0, 12)
				.map((event) => {
					if (event.type === 'rest') return `<li>beat ${event.beat}: pausa</li>`;
					return `<li>beat ${event.beat}: ${event.note}${event.octave} | MIDI ${event.midi} | vol. ${event.volume}</li>`;
				})
				.join('');

			return `
      <article class="voice-block">
        <h3>Voz ${voice.index} &middot; atraso ${voice.delayBeats} beat(s) &middot; ${voice.finalInstrumentName}</h3>
        <ol class="event-list">${preview || '<li>Sem eventos</li>'}</ol>
      </article>
    `;
		})
		.join('');
}
