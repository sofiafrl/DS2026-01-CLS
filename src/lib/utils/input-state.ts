import type { InputState, TextInputState } from '$lib/types/input-state';

export function createTextInput(value = ''): TextInputState {
	return { inputType: 'text', value };
}

export function createFileInput(): InputState {
	return { inputType: 'file' };
}

export async function readFileAsText(file: File): Promise<TextInputState> {
	return createTextInput(await file.text());
}

export function hasTextToSave(input: InputState): input is TextInputState {
	return input.inputType === 'text' && input.value.trim().length > 0;
}

export function downloadText(content: string, fileName = 'pepperfy.txt') {
	const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	link.download = fileName;
	link.click();

	URL.revokeObjectURL(url);
}
