export class TextParser {
	parse(text) {
		return String(text ?? '')
			.replaceAll('\r\n', '\n')
			.split('\n')
			.map((rawLine, index) => this.parseLine(rawLine, index))
			.filter((voice) => voice.content.length > 0 || voice.delayBeats > 0);
	}

	parseLine(rawLine, index) {
		const line = String(rawLine ?? '');
		const trimmed = line.trimStart();

		if (trimmed.startsWith('[')) {
			const closingIndex = trimmed.indexOf(']');
			if (closingIndex !== -1) {
				const numberStr = trimmed.slice(1, closingIndex);
				const isDigits =
					numberStr.length > 0 && Array.from(numberStr).every((char) => char >= '0' && char <= '9');

				if (isDigits) {
					return {
						index,
						delayBeats: Number(numberStr),
						content: trimmed.slice(closingIndex + 1).trimStart()
					};
				}
			}
		}

		return {
			index,
			delayBeats: 0,
			content: line
		};
	}
}
