export function downloadBlob(blob: Blob, filename: string) {
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();
	URL.revokeObjectURL(link.href);
}

export function downloadText(content: string, filename: string) {
	downloadBlob(new Blob([content], { type: 'text/plain;charset=utf-8' }), filename);
}

export function readTextFile(file: File): Promise<string> {
	return file.text();
}
