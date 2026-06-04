import { ParseLineResult } from './types.js';

export class TextParser {
	parse(text: string): ParseLineResult[] {
		return text
			.replaceAll('\r\n', '\n')
			.split('\n')
			.map((rawLine, index) => this.parseLine(rawLine, index))
			.filter((voice) => voice.content.length > 0 || voice.delayBeats > 0);
	}

	parseLine(line: string, index: number): ParseLineResult {
		const trimmed = line.trimStart();

		if (trimmed.startsWith('[')) {
			const closingIndex = trimmed.indexOf(']');
			if (closingIndex !== -1) {
				const numberStr = trimmed.slice(1, closingIndex);
				if (isNumeric(numberStr)) {
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

function isNumeric(str: string): boolean {
	if (str.length === 0) return false;
	for (let i = 0; i < str.length; i++) {
		const char = str[i];
		if (char < '0' || char > '9') return false;
	}
	return true;
}
