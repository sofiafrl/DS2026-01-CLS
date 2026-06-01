export class TextParser {
	parse(text) {
		return String(text ?? '')
			.replace(/\r\n/g, '\n')
			.split('\n')
			.map((rawLine, index) => this.parseLine(rawLine, index))
			.filter((voice) => voice.content.length > 0 || voice.delayBeats > 0);
	}

	parseLine(rawLine, index) {
		const line = String(rawLine ?? '');
		const delayMatch = line.match(/^\s*\[(\d+)]\s*/);
		const delayBeats = delayMatch ? Number(delayMatch[1]) : 0;
		const content = delayMatch ? line.slice(delayMatch[0].length) : line;

		return {
			index,
			delayBeats,
			content
		};
	}
}
