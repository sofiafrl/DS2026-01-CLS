export function downloadBlob(blob, filename) {
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();
	URL.revokeObjectURL(link.href);
}

export function downloadText(content, filename) {
	downloadBlob(new Blob([content], { type: 'text/plain;charset=utf-8' }), filename);
}

export function readTextFile(file) {
	return file.text();
}
